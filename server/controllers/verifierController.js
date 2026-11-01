/**
 * ZarooratSetu - Human Verifier Controller
 * Enforces human-in-the-loop governance: AI only suggests, verifiers make final decision.
 */

import { db } from '../config/store.js';

export const verifierController = {
  // Get pending queue with AI suggestions and duplicate warnings
  getQueue(req, res) {
    const list = db.getRequests({ verifierStatus: "pending" });

    // Format queue items with full context for the verifier
    const queue = list.map(r => ({
      id: r.id,
      userId: r.userId,
      userName: r.userPublicName,
      userArea: r.userArea,
      category: r.category,
      title: r.title,
      description: r.description,
      urgency: r.urgency,
      aiAnalysis: r.aiAnalysis,
      duplicateFlag: r.duplicateFlag,
      createdAt: r.createdAt
    }));

    return res.json({
      success: true,
      queue,
      count: queue.length
    });
  },

  // Verifier Decision: Approve, Reject, or Flag
  takeAction(req, res) {
    const { requestId, action, notes, overridePriority } = req.body;
    const verifier = req.user;

    if (!requestId || !action) {
      return res.status(400).json({
        success: false,
        error: "requestId and action ('approve' | 'reject' | 'flag') are required.",
        code: "MISSING_FIELDS"
      });
    }

    const request = db.getRequestById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        error: "Request not found.",
        code: "NOT_FOUND"
      });
    }

    let newVerifierStatus = "verified";
    let newStatus = "verified";

    if (action === 'reject') {
      newVerifierStatus = "rejected";
      newStatus = "rejected";
    } else if (action === 'flag') {
      newVerifierStatus = "flagged";
      newStatus = "submitted";
    }

    const updates = {
      verifierStatus: newVerifierStatus,
      status: newStatus,
      verifierNotes: notes || `Action ${action} by ${verifier.displayName}`,
      verifiedAt: new Date().toISOString()
    };

    if (overridePriority) {
      updates.urgency = overridePriority;
    }

    const updated = db.updateRequest(requestId, updates);

    // Record Immutable Audit Log
    const auditRecord = db.logAudit({
      action: `REQUEST_${action.toUpperCase()}`,
      entityType: "request",
      entityId: requestId,
      performedBy: verifier.uid,
      performerName: `${verifier.displayName} (${verifier.role})`,
      performerRole: verifier.role,
      details: notes || `Verifier confirmed decision: ${action}. Priority: ${updates.urgency || request.urgency}.`
    });

    return res.json({
      success: true,
      message: `Request #${requestId} has been ${action}ed successfully.`,
      request: updated,
      auditLog: auditRecord
    });
  },

  // Get Audit Logs
  getAuditLogs(req, res) {
    const logs = db.getAuditLogs();
    return res.json({
      success: true,
      logs,
      count: logs.length
    });
  }
};
