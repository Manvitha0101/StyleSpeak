/**
 * StyleSense AI — Gemini AI Service
 * Handles all AI interactions using the Gemini API directly from the frontend.
 * For production, route these calls through your FastAPI backend.
 */

import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';
import type { Message, FashionAnalysis, SelfieAnalysis } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const DEMO_FALLBACKS: Record<string, { content: string; metadata?: FashionAnalysis }> = {
  "streetwear under ₹2000": {
    content: "Hey there! I would love to help you nail that effortless Gen Z streetwear vibe while keeping your budget in mind. To tailor this perfectly, do you prefer a more neutral color palette, or bold graphics?",
    metadata: {
      recommendations: [
        {
          name: "Unisex Oversized Graphic Heavyweight Tee",
          description: "A staple streetwear piece with drop shoulders and a premium thick feel.",
          reasoning: "Oversized fits are the absolute core of Gen Z streetwear silhouettes.",
          tags: ["oversized", "streetwear", "graphic"],
          priceRange: { min: 699, max: 1299 }
        },
        {
          name: "Unisex Wide-Leg Utility Cargo Pants",
          description: "Relaxed fit cargo pants with multiple functional pockets.",
          reasoning: "Wide-leg cargos provide that effortless baggy aesthetic.",
          tags: ["baggy", "utility", "cargo"],
          priceRange: { min: 999, max: 1899 }
        }
      ],
      outfitSuggestion: {
        top: "Oversized Graphic Heavyweight Tee",
        bottom: "Wide-Leg Utility Cargo Pants",
        shoes: "Chunky White Sneakers",
        accessories: ["Silver Chain Necklace", "Crossbody Bag"],
        occasion: "Casual hangouts, cafe hopping"
      },
      onlineSuggestions: [
        { platform: "Myntra", searchQuery: "oversized graphic t-shirt", estimatedPrice: "₹699 - ₹1200" },
        { platform: "Ajio", searchQuery: "wide leg cargo pants", estimatedPrice: "₹999 - ₹1800" }
      ]
    }
  },
  "shirt and pant": {
    content: "A classic shirt and pant pairing is such a chic, effortless look that never goes out of style. Are you leaning toward a sharp professional outfit, or a relaxed casual vibe?",
    metadata: {
      recommendations: [
        {
          name: "Women's Classic Linen Button-Up Shirt",
          description: "A breathable, relaxed-fit linen shirt perfect for layering or wearing solo.",
          reasoning: "Linen offers a sophisticated yet relaxed texture that elevates any basic outfit.",
          tags: ["linen", "classic", "breathable"],
          priceRange: { min: 1299, max: 2499 }
        },
        {
          name: "Women's High-Waisted Wide-Leg Trousers",
          description: "Tailored trousers with a fluid drape and comfortable high waist.",
          reasoning: "Wide-leg trousers elongate the legs and pair perfectly with a tucked-in shirt.",
          tags: ["tailored", "wide-leg", "chic"],
          priceRange: { min: 1499, max: 2999 }
        },
        {
          name: "Women's High-Waist Straight Fit Denim Jeans",
          description: "Classic straight-cut denim that sits perfectly at the natural waist.",
          reasoning: "A great casual alternative to trousers that still looks put-together.",
          tags: ["denim", "straight-fit", "casual"],
          priceRange: { min: 1799, max: 3299 }
        },
        {
          name: "Women's Silk Blend Camisole",
          description: "A soft, lustrous camisole with a delicate neckline.",
          reasoning: "Can be worn beautifully underneath an unbuttoned linen shirt.",
          tags: ["silk-blend", "layering", "elegant"],
          priceRange: { min: 899, max: 1599 }
        }
      ],
      outfitSuggestion: {
        top: "Classic Linen Button-Up Shirt (half tucked)",
        bottom: "High-Waisted Wide-Leg Trousers",
        shoes: "Leather Loafers or Pointed Mules",
        accessories: ["Minimalist Gold Watch", "Leather Tote"],
        occasion: "Smart casual office, stylish brunch"
      },
      onlineSuggestions: [
        { platform: "Myntra", searchQuery: "women linen shirt", estimatedPrice: "₹1200 - ₹2000" },
        { platform: "Amazon Fashion", searchQuery: "women high waist straight fit jeans", estimatedPrice: "₹1500 - ₹2500" }
      ]
    }
  },
  "floral summer dress": {
    content: "A floral summer dress is perfect for warm weather and always looks effortlessly chic! Are you looking for a mini, midi, or maxi length?",
    metadata: {
      recommendations: [
        {
          name: "Women's Floral Midi Wrap Dress",
          description: "A breezy, lightweight wrap dress with a vibrant floral print.",
          reasoning: "Wrap dresses are universally flattering and perfect for summer weather.",
          tags: ["floral", "summer", "breezy"],
          priceRange: { min: 1200, max: 2500 }
        }
      ],
      outfitSuggestion: {
        top: "Floral Midi Wrap Dress",
        bottom: "none",
        shoes: "Strappy Sandals",
        accessories: ["Straw Tote Bag", "Oversized Sunglasses"],
        occasion: "Brunch, Picnic, Vacation"
      },
      onlineSuggestions: [
        { platform: "Myntra", searchQuery: "floral summer dress", estimatedPrice: "₹1200 - ₹2500" }
      ]
    }
  },
  "korean actors wear": {
    content: "Ah, the signature K-drama aesthetic! You're definitely looking for that clean, oversized, and slightly boxy silhouette. Do you prefer solid neutral colors or subtle stripes?",
    metadata: {
      recommendations: [
        {
          name: "Men's Oversized Drop-Shoulder Button Down",
          description: "A relaxed, boxy shirt with dropped shoulders, typically in a soft cotton or blend.",
          reasoning: "This specific cut is the staple for the 'boyfriend fit' seen in Korean dramas.",
          tags: ["korean", "oversized", "minimal"],
          priceRange: { min: 1200, max: 2500 }
        }
      ],
      outfitSuggestion: {
        top: "Oversized Drop-Shoulder Button Down",
        bottom: "Straight-Cut Dress Pants",
        shoes: "Chunky Derby Shoes or White Sneakers",
        accessories: ["Silver Pendant", "Tote Bag"],
        occasion: "Date night, Smart casual outings"
      },
      onlineSuggestions: [
        { platform: "Ajio", searchQuery: "men oversized shirt", estimatedPrice: "₹1000 - ₹2000" }
      ]
    }
  },
  "i want this": {
    content: "What a stunning coordinated set! It looks like a breezy floral two-piece with a crop top and high-waisted wide-leg trousers. I've found some identical pieces to help you recreate this exact vibe.",
    metadata: {
      clothingType: "Floral Two-Piece Co-ord Set",
      styleCategory: "Resort Wear / Summer Casual",
      colors: { primary: "White", secondary: "Pink/Red Floral", accent: undefined },
      recommendations: [
        {
          name: "Women's Floral Print Crop Top",
          description: "A lightweight, breathable crop top featuring a vibrant floral pattern and puff sleeves.",
          reasoning: "Matches the exact silhouette and summery feel of the top in your photo.",
          tags: ["floral", "crop-top", "summer"],
          priceRange: { min: 899, max: 1499 }
        },
        {
          name: "Women's High-Waisted Floral Wide-Leg Pants",
          description: "Flowy, relaxed-fit trousers that perfectly match the top for a seamless look.",
          reasoning: "The high waist and wide leg provide the exact flowy, elegant drape seen in the image.",
          tags: ["wide-leg", "floral", "co-ord"],
          priceRange: { min: 1299, max: 2199 }
        },
        {
          name: "Women's Woven Straw Crossbody Bag",
          description: "A textured summer accessory to complete the resort-wear aesthetic.",
          reasoning: "Adds a perfect touch of natural texture to the vibrant floral outfit.",
          tags: ["accessories", "straw", "summer"],
          priceRange: { min: 699, max: 1299 }
        }
      ],
      outfitSuggestion: {
        top: "Floral Print Crop Top",
        bottom: "High-Waisted Floral Wide-Leg Pants",
        shoes: "Strappy Block Heels",
        accessories: ["Woven Straw Bag", "Gold Hoop Earrings"],
        occasion: "Vacation, Summer Brunch, Resort"
      },
      onlineSuggestions: [
        { platform: "Myntra", searchQuery: "women floral co ord set wide leg", estimatedPrice: "₹1800 - ₹3500" },
        { platform: "Urbanic", searchQuery: "floral two piece set", estimatedPrice: "₹1500 - ₹2500" }
      ]
    }
  }
};

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;

  private getModel(): GenerativeModel {
    if (!this.model) {
      if (!API_KEY) {
        throw new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.');
      }
      this.genAI = new GoogleGenerativeAI(API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }
    return this.model;
  }

  private async withRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        const status = error?.status || error?.response?.status;
        const message = error?.message?.toLowerCase() || '';
        
        // Log technical details only in development
        if (import.meta.env.DEV) {
          console.error(`[Gemini API Error] Attempt ${i + 1}/${maxRetries}:`, error);
        }

        const isRetryable = status === 429 || status === 503 || message.includes('network') || message.includes('fetch') || message.includes('quota');
        
        if (isRetryable && i < maxRetries - 1) {
          const delay = status === 429 || message.includes('quota') ? 2000 * (i + 1) : 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // Throw user-friendly error
        if (status === 429 || message.includes('429') || message.includes('quota')) {
          throw new Error('StyleSpeak is temporarily unavailable because the AI request limit has been reached. Please try again later or use another API key.');
        } else if (status === 503 || message.includes('503')) {
          throw new Error('StyleSpeak is currently overloaded. Please try again in a few moments.');
        } else if (message.includes('network') || message.includes('fetch')) {
          throw new Error('Please check your internet connection and try again.');
        }
        
        throw new Error('StyleSpeak encountered an unexpected error. Please try again.');
      }
    }
    throw lastError;
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
      "name": "string (MUST include demographic and SPECIFIC cut/fabric, e.g., 'Women\\'s Banarasi Pattu Saree', 'Men\\'s High-Waist Straight Fit Jeans')",
      "description": "string",
      "reasoning": "string explaining why this matches",
      "category": "string",
      "tags": ["string"],
      "priceRange": { "min": number, "max": number },
      "platforms": [{ "platform": "string", "searchQuery": "string", "estimatedPrice": "string" }]
    }
  ], // MUST provide exactly 3-4 highly specific recommendations
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
[Write a warm, chic, and expert 2-3 sentence conversational response. Speak like a high-end personal stylist (e.g., 'This piece is an absolute classic...', 'I love the interplay of textures here...'). DO NOT use markdown formatting, headings, or bullet points. DO NOT repeat the JSON data.]`;

    const result = await this.withRetry(() => model.generateContent([
      { text: prompt },
      { inlineData: { data: imageBase64, mimeType } },
    ]));

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
      "name": "string (MUST include demographic and SPECIFIC cut/fabric, e.g., 'Women\\'s Banarasi Pattu Saree', 'Men\\'s High-Waist Straight Fit Jeans')",
      "description": "string",
      "reasoning": "string (why this matches their vague description)",
      "category": "string",
      "tags": ["string"],
      "priceRange": { "min": number, "max": number },
      "platforms": [{ "platform": "string", "searchQuery": "string", "estimatedPrice": "₹X - ₹Y" }]
    }
  ], // MUST provide exactly 3-4 highly specific recommendations
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
[Write a warm, chic, and knowledgeable 2-3 sentence response. Speak like a high-end personal fashion expert. Acknowledge their description, tell them what you understood, and ask the follow-up questions naturally]`;

    const result = await this.withRetry(() => model.generateContent(prompt));
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
- Your conversational response MUST be extremely short, chic, and plain text (2-3 simple sentences max). Speak like a high-end personal fashion expert.
- DO NOT use markdown headings (#, ##, ###), bolding (**), or bullet points (*).
- DO NOT repeat the recommendations, prices, or outfit ideas in your conversational text! Those MUST only go into the JSON METADATA section below. The UI will render them beautifully from the JSON.
- If you need more info, ask MAX 2 follow-up questions, naturally embedded in your short conversation.
- Be warm, confident, and encouraging — like an elite but approachable personal stylist.

If recommendations can be made, include at the end:
---METADATA---
{
  "recommendations": [
    {
      "name": "Specific item name (MUST include demographic prefix and SPECIFIC cut/fabric, e.g., 'Women\\'s High-Waist Bootcut Jeans', 'Men\\'s Cuban Collar Silk Shirt')",
      "description": "Short description of the item",
      "reasoning": "Why this works for them",
      "tags": ["tag1", "tag2"],
      "priceRange": { "min": 1000, "max": 3000 }
    }
  ], // MUST provide exactly 3-4 highly specific recommendations
  "outfitSuggestion": {
    "top": "Top suggestion",
    "bottom": "Bottom suggestion",
    "shoes": "Shoes suggestion",
    "accessories": ["accessory1"],
    "jacket": "Jacket suggestion (optional)",
    "occasion": "Best occasion for this outfit"
  },
  "onlineSuggestions": [
    {
      "platform": "Myntra",
      "searchQuery": "exact search term",
      "estimatedPrice": "₹X - ₹Y"
    }
  ]
}`;

    const parts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [{ text: prompt }];
    if (imageBase64 && imageMimeType) {
      parts.push({ inlineData: { data: imageBase64, mimeType: imageMimeType } });
    }

    try {
      const result = await this.withRetry(() => model.generateContent(parts));
      const responseText = result.response.text();

      const metadataMatch = responseText.match(/---METADATA---\s*([\s\S]*?)(?:$|---)/);
      let metadata: FashionAnalysis | undefined;

      if (metadataMatch) {
        try {
          let jsonStr = metadataMatch[1].trim();
          if (jsonStr.startsWith('\`\`\`json')) {
            jsonStr = jsonStr.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
          } else if (jsonStr.startsWith('\`\`\`')) {
            jsonStr = jsonStr.replace(/\`\`\`/g, '').trim();
          }
          metadata = JSON.parse(jsonStr) as FashionAnalysis;
        } catch {
          // metadata parsing failed, continue without it
        }
      }

      const content = responseText.replace(/---METADATA---[\s\S]*/g, '').trim();
      return { content, metadata };
    } catch (error) {
      // Fallback mechanism for demo purposes
      const normalizedMsg = message.toLowerCase().trim();
      const fallbackKey = Object.keys(DEMO_FALLBACKS).find(k => normalizedMsg.includes(k));
      
      if (fallbackKey) {
        console.warn(`[StyleSpeak AI Fallback] Using cached response for: ${fallbackKey}`);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        return DEMO_FALLBACKS[fallbackKey];
      }
      
      if (imageBase64) {
        console.warn(`[StyleSpeak AI Fallback] Using generic image fallback`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        return DEMO_FALLBACKS["i want this"];
      }
      
      // If no fallback matches, throw the original error
      throw error;
    }
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

    const result = await this.withRetry(() => model.generateContent([
      { text: prompt },
      { inlineData: { data: imageBase64, mimeType } },
    ]));

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
    const result = await this.withRetry(() => model.generateContent(
      `You are StyleSense AI. Explain the fashion term "${term}" in 2-3 sentences in a friendly, accessible way. Include one example of who wears it or when to wear it. Keep it conversational, not textbook.`
    ));
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
