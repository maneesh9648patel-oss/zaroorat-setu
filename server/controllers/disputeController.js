/**
 * ZarooratSetu - Dispute Resolution & Integrity Controller
 * Implements 6-stage evidence-based dispute resolution:
 * 1. Before-borrowing condition photos (2-6 photos, server timestamp, confirmation)
 * 2. After-return condition photos (side-by-side comparison)
 * 3. Digital agreement (locked once signed, downloadable)
 * 4. Both-side complaint & counter-evidence filing (3-day deadline, immutable)
 * 5. Human moderator review queue & internal notes
 * 6. Evidence-based resolution, 48-hour appeal, trust score & fraud restrictions
 */

import { db } from '../config/store.js';

export const disputeController = {
  // 1. Condition Photos: Upload before-borrow or after-return photos
  saveConditionPhotos(req, res) {
    try {
      const user = req.user;
      const { transactionId, stage, photos, conditionNote } = req.body;

      if (!transactionId || !stage) {
        return res.status(400).json({
          success: false,
          error: "transactionId and stage are required.",
          code: "MISSING_FIELDS"
        });
      }

      const txn = db.data.transactions?.find(t => t.id === transactionId);
      if (!txn) {
        return res.status(404).json({
          success: false,
          error: "Transaction not found.",
          code: "NOT_FOUND"
        });
      }

      // Check user role in transaction
      let uploaderRole = 'borrower';
      if (txn.giver_id === user.uid) {
        uploaderRole = 'lender';
      } else if (txn.receiver_id === user.uid) {
        uploaderRole = 'borrower';
      } else if (user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: "You are not a party to this transaction.",
          code: "UNAUTHORIZED"
        });
      }

      const saved = db.saveConditionPhotos({
        transactionId,
        stage,
        uploaderId: user.uid,
        uploaderRole,
        photos,
        conditionNote
      });

      return res.status(201).json({
        success: true,
        record: saved,
        message: `Successfully recorded ${saved.photos.length} ${stage} condition photos.`
      });
    } catch (err) {
      console.warn("Save condition photos error:", err.message);
      return res.status(400).json({
        success: false,
        error: err.message,
        code: "CONDITION_ERROR"
      });
    }
  },

  // 1B. Confirm or object to condition photos
  confirmCondition(req, res) {
    try {
      const user = req.user;
      const { transactionId, stage, objectionNote } = req.body;

      if (!transactionId || !stage) {
        return res.status(400).json({
          success: false,
          error: "transactionId and stage are required.",
          code: "MISSING_FIELDS"
        });
      }

      const updated = db.confirmCondition({
        transactionId,
        stage,
        userId: user.uid,
        objectionNote
      });

      return res.json({
        success: true,
        record: updated,
        message: objectionNote
          ? "Objection recorded. Dispute mediation may be requested."
          : `Confirmed ${stage} condition successfully.`
      });
    } catch (err) {
      console.warn("Confirm condition error:", err.message);
      return res.status(400).json({
        success: false,
        error: err.message,
        code: "CONFIRM_ERROR"
      });
    }
  },

  // 1C. Get Condition Photos (Before & After Side-by-Side)
  getConditionPhotos(req, res) {
    try {
      const { transactionId } = req.params;
      const result = db.getConditionPhotos(transactionId);
      return res.json({
        success: true,
        ...result
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message,
        code: "SERVER_ERROR"
      });
    }
  },

  // 2A. Generate Digital Agreement
  generateAgreement(req, res) {
    try {
      const user = req.user;
      const { transactionId, conditionSummary } = req.body;

      if (!transactionId) {
        return res.status(400).json({
          success: false,
          error: "transactionId is required.",
          code: "MISSING_TRANSACTION_ID"
        });
      }

      const agreement = db.generateAgreement({
        transactionId,
        lenderId: user.uid,
        borrowerId: null,
        conditionSummary
      });

      return res.status(201).json({
        success: true,
        agreement
      });
    } catch (err) {
      console.warn("Generate agreement error:", err.message);
      return res.status(400).json({
        success: false,
        error: err.message,
        code: "AGREEMENT_ERROR"
      });
    }
  },

  // 2B. Sign Digital Agreement ("I Agree")
  signAgreement(req, res) {
    try {
      const user = req.user;
      const { agreementId } = req.params;
      const clientIp = req.headers['x-forwarded-for'] || req.ip || '127.0.0.1';

      if (!agreementId) {
        return res.status(400).json({
          success: false,
          error: "agreementId is required.",
          code: "MISSING_AGREEMENT_ID"
        });
      }

      const agreement = db.signAgreement({
        agreementId,
        userId: user.uid,
        ip: clientIp
      });

      return res.json({
        success: true,
        agreement,
        isLocked: agreement.is_locked,
        message: agreement.is_locked
          ? "Both parties have agreed! The agreement is now locked and active."
          : "Your digital signature has been recorded. Waiting for counterparty agreement."
      });
    } catch (err) {
      console.warn("Sign agreement error:", err.message);
      return res.status(400).json({
        success: false,
        error: err.message,
        code: "SIGN_ERROR"
      });
    }
  },

  // 2C. Get Agreement by Transaction ID
  getAgreement(req, res) {
    try {
      const { transactionId } = req.params;
      const agreement = db.getAgreementByTransactionId(transactionId);
      if (!agreement) {
        return res.status(404).json({
          success: false,
          error: "No agreement found for this transaction.",
          code: "NOT_FOUND"
        });
      }
      return res.json({
        success: true,
        agreement
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message,
        code: "SERVER_ERROR"
      });
    }
  },

  // 3A. Both-Side Complaint: Raise Dispute
  raiseDispute(req, res) {
    try {
      const user = req.user;
      const { transactionId, complaintType, description, desiredResolution, evidenceFiles } = req.body;

      if (!transactionId || !description) {
        return res.status(400).json({
          success: false,
          error: "transactionId and description are required.",
          code: "MISSING_FIELDS"
        });
      }

      const result = db.createDispute({
        transactionId,
        initiatorId: user.uid,
        complaintType: complaintType || "damage",
        description,
        desiredResolution: desiredResolution || "Fair compensation or repair split",
        evidenceFiles: evidenceFiles || []
      });

      return res.status(201).json({
        success: true,
        dispute: result.dispute,
        evidence: result.evidence,
        message: "Dispute complaint recorded with tamper-evident evidence. The counterparty has 3 days to submit their response."
      });
    } catch (err) {
      console.warn("Raise dispute error:", err.message);
      return res.status(400).json({
        success: false,
        error: err.message,
        code: "DISPUTE_ERROR"
      });
    }
  },

  // 3B. Counterparty Response within 3 days
  submitResponse(req, res) {
    try {
      const user = req.user;
      const { id } = req.params; // disputeId
      const { responseText, counterProposal, evidenceFiles } = req.body;

      if (!responseText || !responseText.trim()) {
        return res.status(400).json({
          success: false,
          error: "Response text is required.",
          code: "MISSING_RESPONSE"
        });
      }

      const result = db.submitDisputeResponse({
        disputeId: id,
        respondentId: user.uid,
        responseText,
        counterProposal,
        evidenceFiles: evidenceFiles || []
      });

      return res.json({
        success: true,
        dispute: result.dispute,
        response: result.response,
        message: "Your response and counter-evidence have been recorded immutably."
      });
    } catch (err) {
      console.warn("Submit response error:", err.message);
      return res.status(400).json({
        success: false,
        error: err.message,
        code: "RESPONSE_ERROR"
      });
    }
  },

  // 4A. Get Single Dispute (with Role-Based Access Control)
  getDispute(req, res) {
    try {
      const user = req.user;
      const { id } = req.params;

      const dispute = db.getDisputeById(id, user);
      if (!dispute) {
        return res.status(404).json({
          success: false,
          error: "Dispute not found.",
          code: "NOT_FOUND"
        });
      }

      return res.json({
        success: true,
        dispute
      });
    } catch (err) {
      const isForbidden = err.message.includes("FORBIDDEN");
      return res.status(isForbidden ? 403 : 400).json({
        success: false,
        error: err.message,
        code: isForbidden ? "FORBIDDEN" : "DISPUTE_ERROR"
      });
    }
  },

  // 4B. User's Own Disputes
  getMyDisputes(req, res) {
    try {
      const user = req.user;
      const disputes = db.getDisputes({ userId: user.uid }, user);
      return res.json({
        success: true,
        disputes,
        count: disputes.length
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message,
        code: "SERVER_ERROR"
      });
    }
  },

  // 5A. Moderator Queue: List all disputes with filter
  getModeratorQueue(req, res) {
    try {
      const user = req.user;
      if (user.role !== 'moderator' && user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: "Access denied. Human Moderator or Admin role required.",
          code: "FORBIDDEN_ROLE"
        });
      }

      const { status, complaint_type } = req.query;
      const allDisputes = db.getDisputes({}, user);

      // Status counts for moderator dashboard tabs
      const counts = {
        all: allDisputes.length,
        open: allDisputes.filter(d => d.status === 'open').length,
        under_review: allDisputes.filter(d => d.status === 'under_review').length,
        awaiting_response: allDisputes.filter(d => d.status === 'awaiting_response').length,
        resolved: allDisputes.filter(d => d.status === 'resolved').length,
        escalated: allDisputes.filter(d => d.status === 'escalated').length
      };

      const filtered = db.getDisputes({ status, complaint_type }, user);

      return res.json({
        success: true,
        queue: filtered,
        counts
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message,
        code: "SERVER_ERROR"
      });
    }
  },

  // 5B. Moderator Action: Ask for Evidence, Add Internal Note, Set Status
  moderatorAction(req, res) {
    try {
      const user = req.user;
      const { id } = req.params;
      const { actionType, message, requestedFrom } = req.body;

      if (!actionType) {
        return res.status(400).json({
          success: false,
          error: "actionType is required.",
          code: "MISSING_ACTION_TYPE"
        });
      }

      const updatedDispute = db.moderatorAction({
        disputeId: id,
        moderatorUser: user,
        actionType,
        message: message || "",
        requestedFrom: requestedFrom || "both"
      });

      return res.json({
        success: true,
        dispute: updatedDispute,
        message: `Moderator action '${actionType}' applied successfully.`
      });
    } catch (err) {
      console.warn("Moderator action error:", err.message);
      return res.status(400).json({
        success: false,
        error: err.message,
        code: "ACTION_ERROR"
      });
    }
  },

  // 6A. Evidence-based Resolution & Verdict
  issueDecision(req, res) {
    try {
      const user = req.user;
      const { id } = req.params;
      const { verdict, reasoning, resolution, resolutionDetails, internalNotes } = req.body;

      if (!verdict || !reasoning || !resolution) {
        return res.status(400).json({
          success: false,
          error: "verdict, reasoning (referencing evidence), and resolution are mandatory.",
          code: "MISSING_FIELDS"
        });
      }

      const result = db.issueModeratorDecision({
        disputeId: id,
        moderatorUser: user,
        verdict,
        reasoning,
        resolution,
        resolutionDetails,
        internalNotes
      });

      return res.json({
        success: true,
        dispute: result.dispute,
        decision: result.decision,
        message: "Dispute decision issued successfully! Both parties have been notified. 48-hour appeal window opened."
      });
    } catch (err) {
      console.warn("Issue decision error:", err.message);
      return res.status(400).json({
        success: false,
        error: err.message,
        code: "DECISION_ERROR"
      });
    }
  },

  // 6B. Submit Appeal (Within 48 hours)
  submitAppeal(req, res) {
    try {
      const user = req.user;
      const { id } = req.params;
      const { appealReason } = req.body;

      if (!appealReason || !appealReason.trim()) {
        return res.status(400).json({
          success: false,
          error: "Please provide detailed reasons for your appeal.",
          code: "MISSING_APPEAL_REASON"
        });
      }

      const result = db.appealDecision({
        disputeId: id,
        appealingUser: user,
        appealReason
      });

      return res.json({
        success: true,
        dispute: result.dispute,
        decision: result.decision,
        message: "Your appeal has been submitted! A secondary moderator will review the evidence."
      });
    } catch (err) {
      console.warn("Appeal error:", err.message);
      return res.status(400).json({
        success: false,
        error: err.message,
        code: "APPEAL_ERROR"
      });
    }
  },

  // 6C. Resolve Appeal (Secondary Moderator)
  resolveAppeal(req, res) {
    try {
      const user = req.user;
      const { id } = req.params;
      const { appealVerdict, appealReasoning } = req.body;

      if (!appealVerdict || !appealReasoning) {
        return res.status(400).json({
          success: false,
          error: "appealVerdict and appealReasoning are required.",
          code: "MISSING_FIELDS"
        });
      }

      const result = db.resolveAppeal({
        disputeId: id,
        reviewingModerator: user,
        appealVerdict,
        appealReasoning
      });

      return res.json({
        success: true,
        dispute: result.dispute,
        decision: result.decision,
        message: "Appeal resolved by secondary moderator."
      });
    } catch (err) {
      console.warn("Resolve appeal error:", err.message);
      return res.status(400).json({
        success: false,
        error: err.message,
        code: "APPEAL_RESOLUTION_ERROR"
      });
    }
  },

  // 7A. Admin: Assign Moderator Role
  assignModeratorRole(req, res) {
    try {
      const user = req.user;
      const { targetUid, role } = req.body;

      if (!targetUid || !role) {
        return res.status(400).json({
          success: false,
          error: "targetUid and role are required.",
          code: "MISSING_FIELDS"
        });
      }

      const updatedUser = db.assignUserRole(targetUid, role, user);
      return res.json({
        success: true,
        user: updatedUser,
        message: `User role successfully updated to '${role}'.`
      });
    } catch (err) {
      console.warn("Assign role error:", err.message);
      return res.status(400).json({
        success: false,
        error: err.message,
        code: "ASSIGN_ROLE_ERROR"
      });
    }
  },

  // 7B. Admin: View Users with Trust & Restriction Status
  getAdminUsersTrust(req, res) {
    try {
      const user = req.user;
      if (user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: "Access denied. Platform Admin role required.",
          code: "FORBIDDEN_ROLE"
        });
      }

      const users = db.getUsersWithTrust();
      return res.json({
        success: true,
        users,
        count: users.length
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message,
        code: "SERVER_ERROR"
      });
    }
  },

  // 7C. Admin: Clear Fraud Restriction
  unrestrictUser(req, res) {
    try {
      const user = req.user;
      const { uid } = req.params;

      const updatedUser = db.unrestrictUser(uid, user);
      return res.json({
        success: true,
        user: updatedUser,
        message: `Fraud restriction lifted for ${updatedUser.displayName}.`
      });
    } catch (err) {
      console.warn("Unrestrict error:", err.message);
      return res.status(400).json({
        success: false,
        error: err.message,
        code: "UNRESTRICT_ERROR"
      });
    }
  }
};
