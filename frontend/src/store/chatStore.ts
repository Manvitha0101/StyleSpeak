/**
 * StyleSense AI — Zustand Chat Store
 * Manages all chat state, conversation history, and AI interactions
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message, Conversation, FashionAnalysis, UserPreferences } from '../types';
import { geminiService } from '../services/geminiService';

interface ChatStore {
  conversations: Conversation[];
  activeConversationId: string | null;
  preferences: UserPreferences;
  isLoading: boolean;
  error: string | null;

  // Conversation management
  createConversation: () => string;
  setActiveConversation: (id: string) => void;
  getActiveConversation: () => Conversation | null;
  deleteConversation: (id: string) => void;

  // Messaging
  sendTextMessage: (text: string) => Promise<void>;
  sendImageMessage: (text: string, imageBase64: string, mimeType: string) => Promise<void>;
  analyzeImageOnly: (imageBase64: string, mimeType: string) => Promise<void>;

  // Preferences
  updatePreferences: (prefs: Partial<UserPreferences>) => void;

  // State
  clearError: () => void;
}

const generateId = () => crypto.randomUUID();

const createMessage = (role: 'user' | 'assistant', content: string, extra?: Partial<Message>): Message => ({
  id: generateId(),
  role,
  content,
  timestamp: new Date(),
  ...extra,
});

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      preferences: {},
      isLoading: false,
      error: null,

      createConversation: () => {
        const id = generateId();
        const conversation: Conversation = {
          id,
          title: 'New Style Session',
          messages: [],
          createdAt: new Date(),
        };
        set(state => ({ conversations: [conversation, ...state.conversations], activeConversationId: id }));
        return id;
      },

      setActiveConversation: (id) => set({ activeConversationId: id }),

      getActiveConversation: () => {
        const { conversations, activeConversationId } = get();
        return conversations.find(c => c.id === activeConversationId) ?? null;
      },

      deleteConversation: (id) => {
        set(state => ({
          conversations: state.conversations.filter(c => c.id !== id),
          activeConversationId: state.activeConversationId === id ? null : state.activeConversationId,
        }));
      },

      sendTextMessage: async (text) => {
        const { createConversation, getActiveConversation, preferences } = get();

        // Ensure active conversation
        if (!get().activeConversationId) createConversation();
        const conv = getActiveConversation();
        if (!conv) return;

        const userMessage = createMessage('user', text);
        const loadingMessage = createMessage('assistant', '', { isLoading: true });

        // Add user message + loading placeholder
        set(state => ({
          conversations: state.conversations.map(c =>
            c.id === conv.id
              ? { ...c, messages: [...c.messages, userMessage, loadingMessage], title: c.messages.length === 0 ? text.slice(0, 40) : c.title }
              : c
          ),
          isLoading: true,
          error: null,
        }));

        try {
          const history = conv.messages;
          const { content, metadata } = await geminiService.chat(text, history, undefined, undefined);

          const assistantMessage = createMessage('assistant', content, { metadata });

          set(state => ({
            conversations: state.conversations.map(c =>
              c.id === conv.id
                ? { ...c, messages: [...c.messages.filter(m => !m.isLoading), assistantMessage] }
                : c
            ),
            isLoading: false,
          }));
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
          const errorMessage = createMessage('assistant', `I'm having trouble connecting right now. ${errorMsg}`);

          set(state => ({
            conversations: state.conversations.map(c =>
              c.id === conv.id
                ? { ...c, messages: [...c.messages.filter(m => !m.isLoading), errorMessage] }
                : c
            ),
            isLoading: false,
            error: errorMsg,
          }));
        }
      },

      sendImageMessage: async (text, imageBase64, mimeType) => {
        const { createConversation, getActiveConversation } = get();

        if (!get().activeConversationId) createConversation();
        const conv = getActiveConversation();
        if (!conv) return;

        // Create a data URL for display
        const imageUrl = `data:${mimeType};base64,${imageBase64}`;
        const userMessage = createMessage('user', text || 'Analyze this clothing', { imageUrl });
        const loadingMessage = createMessage('assistant', '', { isLoading: true });

        set(state => ({
          conversations: state.conversations.map(c =>
            c.id === conv.id
              ? { ...c, messages: [...c.messages, userMessage, loadingMessage], title: 'Fashion Analysis' }
              : c
          ),
          isLoading: true,
          error: null,
        }));

        try {
          const history = conv.messages;
          const { content, metadata } = await geminiService.chat(
            text || 'Please analyze this clothing item.',
            history,
            imageBase64,
            mimeType
          );

          const assistantMessage = createMessage('assistant', content, { metadata });

          set(state => ({
            conversations: state.conversations.map(c =>
              c.id === conv.id
                ? { ...c, messages: [...c.messages.filter(m => !m.isLoading), assistantMessage] }
                : c
            ),
            isLoading: false,
          }));
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Image analysis failed.';
          const errorMessage = createMessage('assistant', `Unable to analyze the image. ${errorMsg}`);

          set(state => ({
            conversations: state.conversations.map(c =>
              c.id === conv.id
                ? { ...c, messages: [...c.messages.filter(m => !m.isLoading), errorMessage] }
                : c
            ),
            isLoading: false,
            error: errorMsg,
          }));
        }
      },

      analyzeImageOnly: async (imageBase64, mimeType) => {
        const { createConversation, getActiveConversation } = get();

        if (!get().activeConversationId) createConversation();
        const conv = getActiveConversation();
        if (!conv) return;

        const imageUrl = `data:${mimeType};base64,${imageBase64}`;
        const userMessage = createMessage('user', '📸 Analyze this fashion item for me', { imageUrl });
        const loadingMessage = createMessage('assistant', '', { isLoading: true });

        set(state => ({
          conversations: state.conversations.map(c =>
            c.id === conv.id
              ? { ...c, messages: [...c.messages, userMessage, loadingMessage], title: 'Fashion Image Analysis' }
              : c
          ),
          isLoading: true,
        }));

        try {
          const analysis = await geminiService.analyzeImage(imageBase64, mimeType);
          const content = analysis.fashionTermExplanation || 'Here is my analysis of your fashion item!';
          const assistantMessage = createMessage('assistant', content, { metadata: analysis });

          set(state => ({
            conversations: state.conversations.map(c =>
              c.id === conv.id
                ? { ...c, messages: [...c.messages.filter(m => !m.isLoading), assistantMessage] }
                : c
            ),
            isLoading: false,
          }));
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Analysis failed';
          const errorMessage = createMessage('assistant', `Could not analyze the image. ${errorMsg}`);

          set(state => ({
            conversations: state.conversations.map(c =>
              c.id === conv.id
                ? { ...c, messages: [...c.messages.filter(m => !m.isLoading), errorMessage] }
                : c
            ),
            isLoading: false,
          }));
        }
      },

      updatePreferences: (prefs) => {
        set(state => ({ preferences: { ...state.preferences, ...prefs } }));
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'stylesense-chat-store',
      partialize: (state) => ({
        conversations: state.conversations.slice(0, 20), // Keep last 20 conversations
        preferences: state.preferences,
        activeConversationId: state.activeConversationId,
      }),
    }
  )
);
