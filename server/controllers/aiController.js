/**
 * ZarooratSetu - AI Controller
 * Manages Gemini API priority scoring, voice transcript extraction, and Setu Sahayak AI Chat
 */

import { GeminiService } from '../services/geminiService.js';

export const aiController = {
  // Score need priority using Gemini API or rule-based fallback
  async scorePriority(req, res) {
    try {
      const { title, description, category, urgency } = req.body;
      const result = await GeminiService.calculatePriority({
        title: title || "",
        description: description || "",
        category: category || "Medical",
        urgency: urgency || "Normal"
      });

      return res.json({
        success: true,
        analysis: result
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message,
        code: "AI_SCORE_ERROR"
      });
    }
  },

  // Structured extraction from transcribed voice audio
  async extractVoice(req, res) {
    try {
      const { transcript } = req.body;
      if (!transcript) {
        return res.status(400).json({
          success: false,
          error: "Transcript is required.",
          code: "MISSING_TRANSCRIPT"
        });
      }

      const extracted = await GeminiService.extractStructuredFields(transcript);

      return res.json({
        success: true,
        extracted
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message,
        code: "VOICE_EXTRACTION_ERROR"
      });
    }
  },

  // Interactive conversational assistant ("Setu Sahayak / सेतु साथी")
  async chat(req, res) {
    try {
      const { message, language, history } = req.body;
      const response = await GeminiService.chatWithAssistant({
        message: message || "",
        language: language || "hi",
        history: history || []
      });

      return res.json({
        success: true,
        ...response
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message,
        code: "AI_CHAT_ERROR"
      });
    }
  },

  // AI Lens image condition & item detection
  async lensScan(req, res) {
    try {
      const { imageBase64, itemHint } = req.body;
      const result = await GeminiService.analyzeItemImage({
        imageBase64: imageBase64 || "",
        itemHint: itemHint || ""
      });

      return res.json({
        success: true,
        item: result
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message,
        code: "AI_LENS_ERROR"
      });
    }
  }
};
