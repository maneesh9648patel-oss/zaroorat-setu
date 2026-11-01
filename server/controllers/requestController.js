/**
 * ZarooratSetu - Request Controller
 * Handles need posting, privacy filtering, duplicate detection, and status tracking
 */

import { db } from '../config/store.js';
import { DuplicateService } from '../services/duplicateService.js';
import { GeminiService } from '../services/geminiService.js';

export const requestController = {
  // Create a new request (Requires KYC Level 1)
  async createRequest(req, res) {
    const { category, title, description, urgency, area, coordinates } = req.body;
    const user = req.user;

    if (!category || !title || !description) {
      return res.status(400).json({
        success: false,
        error: "Category, title, and description are required.",
        code: "MISSING_FIELDS"
      });
    }

    const existingRequests = db.getRequests();

    // 1. Run Duplicate Detection Engine
    const duplicateCheck = DuplicateService.checkDuplicate({
      title,
      description,
      category,
      userId: user.uid
    }, existingRequests);

    // 2. Run AI Priority Engine Suggestion (Gemini / Rule fallback)
    const aiAnalysis = await GeminiService.calculatePriority({
      title,
      description,
      category,
      urgency: urgency || "Normal"
    });

    // 3. Persist Request
    const newRequest = db.createRequest({
      userId: user.uid,
      userPublicName: user.publicName || (user.displayName ? `${user.displayName.split(' ')[0]} ${user.displayName.split(' ')[1]?.[0] || ''}.` : 'Community Member'),
      userArea: area || user.area || "Civil Lines, Banda",
      category,
      title: title.trim(),
      description: description.trim(),
      urgency: urgency || "Normal",
      aiAnalysis,
      duplicateFlag: duplicateCheck,
      verifierStatus: "pending", // Waiting for human verifier confirmation
      status: "submitted",
      matchedProvider: null,
      coordinates: coordinates || user.coordinates || { lat: 25.4764, lng: 80.3344 }
    });

    // 4. Log Audit
    db.logAudit({
      action: "REQUEST_CREATED",
      entityType: "request",
      entityId: newRequest.id,
      performedBy: user.uid,
      performerName: user.displayName,
      performerRole: user.role,
      details: `Created need '${title}' in category ${category}. AI suggested priority: ${aiAnalysis.suggestedPriority}. Duplicate detected: ${duplicateCheck.isDuplicate}.`
    });

    return res.status(201).json({
      success: true,
      request: newRequest,
      message: "Request submitted successfully. Waiting for human verifier confirmation."
    });
  },

  // Get list of requests (Sanitized public view, sorted by priority)
  getRequests(req, res) {
    const { category, status } = req.query;
    let list = db.getRequests({ category, status });

    // Priority sorting weights
    const priorityWeight = { "Urgent": 3, "High": 2, "Normal": 1 };

    list.sort((a, b) => {
      const pDiff = (priorityWeight[b.urgency] || 1) - (priorityWeight[a.urgency] || 1);
      if (pDiff !== 0) return pDiff;
      const scoreDiff = (b.aiAnalysis?.score || 0) - (a.aiAnalysis?.score || 0);
      if (scoreDiff !== 0) return scoreDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Privacy Sanitization: NEVER expose creator's phone or email
    const sanitizedList = list.map(r => ({
      id: r.id,
      userPublicName: r.userPublicName,
      userArea: r.userArea,
      category: r.category,
      title: r.title,
      description: r.description,
      urgency: r.urgency,
      aiAnalysis: r.aiAnalysis,
      verifierStatus: r.verifierStatus,
      status: r.status,
      matchedProvider: r.matchedProvider,
      createdAt: r.createdAt
    }));

    return res.json({
      success: true,
      requests: sanitizedList,
      count: sanitizedList.length
    });
  },

  // Single request details & status tracker
  getRequestById(req, res) {
    const { id } = req.params;
    const item = db.getRequestById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: "Request not found.",
        code: "NOT_FOUND"
      });
    }

    // Return sanitized projection
    return res.json({
      success: true,
      request: {
        id: item.id,
        userPublicName: item.userPublicName,
        userArea: item.userArea,
        category: item.category,
        title: item.title,
        description: item.description,
        urgency: item.urgency,
        aiAnalysis: item.aiAnalysis,
        verifierStatus: item.verifierStatus,
        status: item.status,
        matchedProvider: item.matchedProvider,
        createdAt: item.createdAt,
        verifiedAt: item.verifiedAt
      }
    });
  }
};
