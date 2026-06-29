// TypeScript type definitions for the StyleSense AI application

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  timestamp: Date;
  metadata?: FashionAnalysis;
  isLoading?: boolean;
}

export interface FashionAnalysis {
  clothingType?: string;
  category?: string;
  colors?: { primary: string; secondary?: string; accent?: string };
  material?: string;
  fit?: string;
  pattern?: string;
  styleCategory?: string;
  season?: string;
  fashionEra?: string;
  recommendations?: FashionRecommendation[];
  outfitSuggestion?: OutfitSuggestion;
  followUpQuestions?: string[];
  priceRange?: { min: number; max: number; currency: string };
  onlineSuggestions?: OnlineSuggestion[];
  fashionTermExplanation?: string;
}

export interface FashionRecommendation {
  id: string;
  name: string;
  description: string;
  reasoning: string;
  category: string;
  tags: string[];
  priceRange?: { min: number; max: number };
  platforms?: OnlineSuggestion[];
}

export interface OutfitSuggestion {
  top?: string;
  bottom?: string;
  shoes?: string;
  accessories?: string[];
  jacket?: string;
  occasion?: string;
  styleNotes?: string;
}

export interface OnlineSuggestion {
  platform: string;
  searchQuery: string;
  estimatedPrice?: string;
  url?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

export interface SelfieAnalysis {
  skinTone?: string;
  recommendedColors?: string[];
  colorsToAvoid?: string[];
  recommendedFits?: string[];
  recommendedStyles?: string[];
  avoidStyles?: string[];
  outfitIdeas?: string[];
  personalityNotes?: string;
  tips?: string[];
}

export interface UserPreferences {
  preferredColors?: string[];
  preferredStyles?: string[];
  preferredBrands?: string[];
  budgetMin?: number;
  budgetMax?: number;
  gender?: string;
  occasions?: string[];
}
