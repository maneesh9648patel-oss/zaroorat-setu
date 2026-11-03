/**
 * ZarooratSetu - Advanced AI-Based Smart Matching Controller
 * Integrates 6-factor weighted algorithm, real-time notifications,
 * donor willingness, and admin analytics control panel.
 */

import { db } from '../config/store.js';
import { SmartMatchingEngine } from '../services/smartMatchingEngine.js';
import { GeoDistanceService } from '../services/geoDistanceService.js';
import { USER_ROLES } from '../config/constants.js';

export const matchingController = {
  // 1. Get AI Smart Matches for a specific request ID
  getSmartMatches(req, res) {
    try {
      const { requestId } = req.params;
      const radiusKm = Number(req.query.radius) || 20;

      const request = db.getRequestById(requestId);
      if (!request) {
        return res.status(404).json({
          success: false,
          error: "Request not found in community database.",
          code: "REQUEST_NOT_FOUND"
        });
      }

      const matchResults = SmartMatchingEngine.findSmartMatches({
        request,
        radiusKm,
        excludeUserId: req.user?.uid
      });

      return res.json({
        success: true,
        ...matchResults
      });
    } catch (err) {
      console.error("Smart matching error:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Failed to calculate smart matches.",
        code: "MATCHING_ERROR"
      });
    }
  },

  // 2. On-the-fly Need Match Discovery (Custom / Interactive Search)
  findCustomMatches(req, res) {
    try {
      const { title, description, category, urgency, coordinates, radiusKm } = req.body;

      if (!title || !category) {
        return res.status(400).json({
          success: false,
          error: "Title and Category are required for AI matching analysis.",
          code: "MISSING_FIELDS"
        });
      }

      const mockRequest = {
        id: `custom_${Date.now()}`,
        title: title.trim(),
        description: (description || "").trim(),
        category: category.trim(),
        urgency: urgency || "Normal",
        coordinates: coordinates || req.user?.coordinates || { lat: 25.4764, lng: 80.3344 }
      };

      const matchResults = SmartMatchingEngine.findSmartMatches({
        request: mockRequest,
        radiusKm: Number(radiusKm) || 20,
        excludeUserId: req.user?.uid
      });

      return res.json({
        success: true,
        ...matchResults
      });
    } catch (err) {
      console.error("Custom match discovery error:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Failed to search candidate donors.",
        code: "MATCHING_ERROR"
      });
    }
  },

  // 3. Send Assistance Request to Matched Donor
  sendAssistanceRequest(req, res) {
    try {
      const user = req.user;
      const { requestId, donorId, matchScore, factorScores, explanation, requestTitle, category, urgency } = req.body;

      if (!donorId) {
        return res.status(400).json({
          success: false,
          error: "Donor ID is required to dispatch assistance request.",
          code: "MISSING_DONOR_ID"
        });
      }

      const donor = db.getUserByUid(donorId);
      if (!donor) {
        return res.status(404).json({
          success: false,
          error: "Selected donor not found.",
          code: "DONOR_NOT_FOUND"
        });
      }

      // Check if donor is restricted
      if (donor.isRestricted) {
        return res.status(400).json({
          success: false,
          error: "Selected donor account has been restricted pending platform review.",
          code: "DONOR_RESTRICTED"
        });
      }

      const matchRecord = db.createMatchRequest({
        requestId: requestId || `req_direct_${Date.now()}`,
        requestTitle: requestTitle || "Community Resource Need",
        category: category || "General",
        urgency: urgency || "Normal",
        requesterId: user.uid,
        requesterName: user.displayName,
        requesterArea: user.area || "Civil Lines, Banda",
        donorId: donor.uid,
        donorName: donor.displayName,
        donorArea: donor.area || "Banda",
        matchScore: Number(matchScore) || 88,
        factorScores: factorScores || {},
        explanation: Array.isArray(explanation) ? explanation : [],
        initialStatus: "pending"
      });

      return res.status(201).json({
        success: true,
        matchRequest: matchRecord,
        message: `Assistance request successfully dispatched to ${donor.displayName}! They have been notified.`
      });
    } catch (err) {
      console.error("Send assistance request error:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Failed to dispatch assistance request.",
        code: "DISPATCH_ERROR"
      });
    }
  },

  // 4. Donor Response (Accept or Decline)
  respondMatchRequest(req, res) {
    try {
      const user = req.user;
      const { matchId, action } = req.body; // action: 'accept' | 'decline'

      if (!matchId || !['accept', 'decline'].includes(action)) {
        return res.status(400).json({
          success: false,
          error: "matchId and valid action ('accept' or 'decline') are required.",
          code: "INVALID_ACTION"
        });
      }

      const matchRequests = db.getMatchRequests();
      const match = matchRequests.find(m => m.id === matchId);

      if (!match) {
        return res.status(404).json({
          success: false,
          error: "Match request not found.",
          code: "NOT_FOUND"
        });
      }

      // Authorization check: only designated donor or admin can respond
      if (match.donorId !== user.uid && user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: "Unauthorized: Only the designated donor may accept or decline this request.",
          code: "UNAUTHORIZED"
        });
      }

      const newStatus = action === 'accept' ? 'accepted' : 'declined';
      const updated = db.updateMatchRequest(matchId, {
        status: newStatus,
        respondedAt: new Date().toISOString()
      }, user);

      return res.json({
        success: true,
        matchRequest: updated,
        message: action === 'accept'
          ? "You accepted the assistance request! Requester has been notified to coordinate handover."
          : "Request declined. Requester has been notified to select alternative matches."
      });
    } catch (err) {
      console.error("Respond match error:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Failed to record response.",
        code: "RESPONSE_ERROR"
      });
    }
  },

  // 5. Smart Notifications for Logged-In User
  getUserNotifications(req, res) {
    try {
      const user = req.user;
      const notifications = db.getNotifications(user.uid);
      const unreadCount = notifications.filter(n => !n.read).length;

      return res.json({
        success: true,
        notifications,
        unreadCount
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message,
        code: "SERVER_ERROR"
      });
    }
  },

  // 6. Mark Notification as Read
  markNotificationRead(req, res) {
    try {
      const user = req.user;
      const { id } = req.params;
      const updated = db.markNotificationRead(id, user.uid);

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: "Notification not found.",
          code: "NOT_FOUND"
        });
      }

      return res.json({
        success: true,
        notification: updated
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message,
        code: "SERVER_ERROR"
      });
    }
  },

  // 7. Update Donor Willingness & Response Time Preferences
  updateDonorWillingness(req, res) {
    try {
      const user = req.user;
      const { willingnessStatus, estimatedResponseMinutes, availableHours, specialties } = req.body;

      const validStatuses = ['available_willing', 'needs_confirmation', 'temporarily_unavailable', 'not_interested'];
      if (willingnessStatus && !validStatuses.includes(willingnessStatus)) {
        return res.status(400).json({
          success: false,
          error: `Invalid willingness status. Allowed: ${validStatuses.join(', ')}`,
          code: "INVALID_STATUS"
        });
      }

      const updatedUser = db.updateUserWillingness(user.uid, {
        willingnessStatus,
        estimatedResponseMinutes: Number(estimatedResponseMinutes),
        availableHours,
        specialties
      });

      return res.json({
        success: true,
        user: updatedUser,
        message: "Donor readiness & willingness settings updated successfully!"
      });
    } catch (err) {
      console.error("Update willingness error:", err.message);
      return res.status(400).json({
        success: false,
        error: err.message,
        code: "WILLINGNESS_ERROR"
      });
    }
  },

  // 8. Admin Control Panel: Matching Engine Analytics & Auditing
  getAdminAnalytics(req, res) {
    try {
      const user = req.user;
      if (user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: "Access denied: Platform Admin role required.",
          code: "FORBIDDEN_ROLE"
        });
      }

      const analytics = db.getMatchingAnalytics();
      return res.json({
        success: true,
        analytics
      });
    } catch (err) {
      console.error("Admin analytics error:", err);
      return res.status(500).json({
        success: false,
        error: err.message,
        code: "SERVER_ERROR"
      });
    }
  },

  // Backwards Compatibility: Nearest Providers & Simple Assign
  findNearestProviders(req, res) {
    const { requestId } = req.params;
    const request = db.getRequestById(requestId);

    if (!request) {
      return res.status(404).json({ success: false, error: "Request not found" });
    }

    const candidateUsers = db.data.users.filter(u =>
      (u.role === USER_ROLES.NGO || u.role === USER_ROLES.DONOR || u.role === USER_ROLES.LENDER) &&
      u.kycLevel !== 'none'
    );

    const ranked = GeoDistanceService.rankProvidersByDistance(
      request.coordinates || { lat: 25.4764, lng: 80.3344 },
      candidateUsers
    );

    const sanitizedProviders = ranked.map(p => ({
      providerId: p.uid,
      providerName: p.publicName || p.displayName,
      role: p.role,
      kycLevel: p.kycLevel,
      area: p.area,
      distanceKm: p.distanceKm
    }));

    return res.json({
      success: true,
      requestId,
      providers: sanitizedProviders,
      count: sanitizedProviders.length
    });
  },

  assignProvider(req, res) {
    const { requestId, providerId } = req.body;
    const provider = db.getUserByUid(providerId);

    if (!provider) {
      return res.status(404).json({ success: false, error: "Provider not found" });
    }

    const updated = db.updateRequest(requestId, {
      status: "matched",
      matchedProvider: {
        providerId: provider.uid,
        providerName: provider.publicName || provider.displayName,
        providerType: provider.role === USER_ROLES.NGO ? "Verified NGO" : "Verified Helper",
        distanceKm: 2.5
      }
    });

    return res.json({
      success: true,
      request: updated,
      message: `Matched successfully with ${provider.displayName}`
    });
  }
};
