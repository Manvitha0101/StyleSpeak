/**
 * StyleSense AI — Gemini AI Service
 * Handles all AI interactions using the Gemini API directly from the frontend.
 * For production, route these calls through your FastAPI backend.
 */

import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';
import type { Message, FashionAnalysis, SelfieAnalysis } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;

  private getModel(): GenerativeModel {
    if (!this.model) {
      if (!API_KEY) {
        throw new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.');
      }
      this.genAI = new GoogleGenerativeAI(API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }
    return this.model;
  }

  /**
   * Analyze a clothing image and return structured fashion data
   */
  async analyzeImage(imageBase64: string, mimeType: string): Promise<FashionAnalysis> {
    const model = this.getModel();

    const prompt = `You are StyleSense AI, an expert fashion analyst with deep knowledge of global fashion trends, fabrics, and styling.

Analyze this clothing image and respond with a JSON object followed by a conversational message.

Return EXACTLY this JSON structure first, then a human message:
{
  "clothingType": "string",
  "category": "string (top/bottom/footwear/accessory/outerwear/dress/etc)",
  "colors": { "primary": "string", "secondary": "string or null", "accent": "string or null" },
  "material": "string (estimated fabric)",
  "fit": "string (oversized/slim/regular/relaxed/fitted)",
  "pattern": "string (solid/striped/checkered/floral/graphic/etc)",
  "styleCategory": "string (streetwear/formal/casual/bohemian/minimal/vintage/y2k/korean-casual/etc)",
  "season": "string (all-season/summer/winter/spring-fall)",
  "fashionEra": "string (contemporary/vintage-90s/y2k/etc)",
  "recommendations": [
    {
      "id": "1",
      "name": "string",
      "description": "string",
      "reasoning": "string explaining why this matches",
      "category": "string",
      "tags": ["string"],
      "priceRange": { "min": number, "max": number },
      "platforms": [{ "platform": "string", "searchQuery": "string", "estimatedPrice": "string" }]
    }
  ],
  "outfitSuggestion": {
    "top": "string or null",
    "bottom": "string or null",
    "shoes": "string",
    "accessories": ["string"],
    "jacket": "string or null",
    "occasion": "string",
    "styleNotes": "string"
  },
  "followUpQuestions": ["question1", "question2"],
  "priceRange": { "min": number, "max": number, "currency": "INR" },
  "onlineSuggestions": [
    { "platform": "Myntra", "searchQuery": "string", "estimatedPrice": "₹X - ₹Y" },
    { "platform": "Ajio", "searchQuery": "string", "estimatedPrice": "₹X - ₹Y" },
    { "platform": "Amazon Fashion", "searchQuery": "string", "estimatedPrice": "₹X - ₹Y" }
  ]
}

---CONVERSATIONAL_RESPONSE---
[Write a warm, expert 2-3 sentence conversational response about what you see]`;

    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { data: imageBase64, mimeType } },
    ]);

    const response = result.response.text();
    return this.parseStructuredResponse(response);
  }

  /**
   * Analyze natural language fashion description
   */
  async analyzeText(description: string, preferences?: Record<string, unknown>): Promise<FashionAnalysis> {
    const model = this.getModel();
    const userContext = preferences ? `User preferences: ${JSON.stringify(preferences)}` : '';

    const prompt = `You are StyleSense AI, a personal fashion assistant who understands vague descriptions perfectly. When someone says "that shirt actors wear in Korean dramas," you know exactly what they mean.

${userContext}

User description: "${description}"

Respond with a JSON object followed by a conversational message.

Return EXACTLY this JSON structure first:
{
  "clothingType": "string (what they're describing)",
  "category": "string",
  "styleCategory": "string",
  "fit": "string (if determinable)",
  "colors": { "primary": "string or null", "secondary": null, "accent": null },
  "material": "string or null",
  "recommendations": [
    {
      "id": "1",
      "name": "string (specific item name)",
      "description": "string",
      "reasoning": "string (why this matches their vague description)",
      "category": "string",
      "tags": ["string"],
      "priceRange": { "min": number, "max": number },
      "platforms": [{ "platform": "string", "searchQuery": "string", "estimatedPrice": "₹X - ₹Y" }]
    }
  ],
  "outfitSuggestion": {
    "top": "string",
    "bottom": "string",
    "shoes": "string",
    "accessories": ["string"],
    "jacket": "string or null",
    "occasion": "string",
    "styleNotes": "string"
  },
  "followUpQuestions": ["max 2 smart follow-up questions to refine recommendations"],
  "priceRange": { "min": number, "max": number, "currency": "INR" },
  "onlineSuggestions": [
    { "platform": "Myntra", "searchQuery": "exact search term", "estimatedPrice": "₹X - ₹Y" },
    { "platform": "Ajio", "searchQuery": "exact search term", "estimatedPrice": "₹X - ₹Y" },
    { "platform": "Amazon Fashion", "searchQuery": "exact search term", "estimatedPrice": "₹X - ₹Y" }
  ]
}

---CONVERSATIONAL_RESPONSE---
[Write a warm, knowledgeable 2-3 sentence response. Acknowledge their description, tell them what you understood, and ask the follow-up questions naturally]`;

    const result = await model.generateContent(prompt);
    return this.parseStructuredResponse(result.response.text());
  }

  /**
   * Continue a conversation with full history context
   */
  async chat(message: string, history: Message[], imageBase64?: string, imageMimeType?: string): Promise<{ content: string; metadata?: FashionAnalysis }> {
    const model = this.getModel();

    const historyContext = history
      .slice(-8)
      .map(m => `${m.role === 'user' ? 'User' : 'StyleSense AI'}: ${m.content}`)
      .join('\n');

    const prompt = `You are StyleSense AI — a warm, knowledgeable personal fashion stylist and shopping companion. You have deep expertise in global fashion trends, fabric knowledge, and personal styling.

Conversation history:
${historyContext}

Current message: "${message}"

Behavior rules:
- If you have enough context, give 3-5 specific recommendations with detailed reasoning
- If you need more info, ask MAX 2 follow-up questions at a time, naturally embedded in conversation  
- ALWAYS explain WHY each recommendation fits the user specifically
- For Indian users: include price ranges in INR and suggest Myntra, Ajio, Nykaa Fashion, Amazon Fashion
- Suggest 1 complete outfit combination
- Be warm, encouraging, and expertly specific — like a knowledgeable friend who happens to be a stylist
- Never give generic advice — always be specific and personalized

If recommendations can be made, include at the end:
---METADATA---
${JSON.stringify({ recommendations: [], outfitSuggestion: {}, followUpQuestions: [], onlineSuggestions: [] })}
(fill with actual data)`;

    const parts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [{ text: prompt }];
    if (imageBase64 && imageMimeType) {
      parts.push({ inlineData: { data: imageBase64, mimeType: imageMimeType } });
    }

    const result = await model.generateContent(parts);
    const responseText = result.response.text();

    const metadataMatch = responseText.match(/---METADATA---\s*([\s\S]*?)(?:$|---)/);
    let metadata: FashionAnalysis | undefined;

    if (metadataMatch) {
      try {
        metadata = JSON.parse(metadataMatch[1].trim()) as FashionAnalysis;
      } catch {
        // metadata parsing failed, continue without it
      }
    }

    const content = responseText.replace(/---METADATA---[\s\S]*/g, '').trim();
    return { content, metadata };
  }

  /**
   * Analyze selfie for personal styling advice
   */
  async analyzeSelfie(imageBase64: string, mimeType: string): Promise<{ content: string; analysis: SelfieAnalysis }> {
    const model = this.getModel();

    const prompt = `You are StyleSense AI, an expert personal stylist and colorist. Analyze this selfie/photo with sensitivity and positivity.

Respond with JSON followed by a warm conversational message:

{
  "skinTone": "string (warm/cool/neutral undertone + light/medium/dark)",
  "recommendedColors": ["color1", "color2", "color3", "color4", "color5"],
  "colorsToAvoid": ["color1", "color2"],
  "recommendedFits": ["fit1", "fit2", "fit3"],
  "recommendedStyles": ["style1", "style2", "style3"],
  "avoidStyles": ["style1"],
  "outfitIdeas": ["outfit idea 1", "outfit idea 2", "outfit idea 3"],
  "personalityNotes": "string (optional style personality read)",
  "tips": ["specific tip 1", "specific tip 2", "specific tip 3"]
}

---CONVERSATIONAL_RESPONSE---
[Write a warm, encouraging, and specific 3-4 sentence personal style reading. Be positive and actionable. Never be harsh. Focus on what WORKS for them.]`;

    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { data: imageBase64, mimeType } },
    ]);

    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*?\}(?=\s*---CONVERSATIONAL_RESPONSE---)/);
    const convMatch = responseText.match(/---CONVERSATIONAL_RESPONSE---\s*([\s\S]*?)$/);

    let analysis: SelfieAnalysis = {};
    if (jsonMatch) {
      try {
        analysis = JSON.parse(jsonMatch[0]) as SelfieAnalysis;
      } catch {
        // parsing failed
      }
    }

    return {
      content: convMatch ? convMatch[1].trim() : responseText,
      analysis,
    };
  }

  /**
   * Explain a fashion term
   */
  async explainTerm(term: string): Promise<string> {
    const model = this.getModel();
    const result = await model.generateContent(
      `You are StyleSense AI. Explain the fashion term "${term}" in 2-3 sentences in a friendly, accessible way. Include one example of who wears it or when to wear it. Keep it conversational, not textbook.`
    );
    return result.response.text();
  }

  /**
   * Parse structured AI response (JSON + conversational)
   */
  private parseStructuredResponse(text: string): FashionAnalysis {
    const jsonMatch = text.match(/\{[\s\S]*?\}(?=\s*---CONVERSATIONAL_RESPONSE---)/);
    const convMatch = text.match(/---CONVERSATIONAL_RESPONSE---\s*([\s\S]*?)$/);

    let analysis: FashionAnalysis = {};

    if (jsonMatch) {
      try {
        analysis = JSON.parse(jsonMatch[0]) as FashionAnalysis;
      } catch {
        // If JSON parsing fails, extract what we can
        analysis = { fashionTermExplanation: text };
      }
    }

    if (convMatch) {
      analysis.fashionTermExplanation = convMatch[1].trim();
    }

    return analysis;
  }
}

export const geminiService = new GeminiService();
