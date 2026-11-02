/**
 * ZarooratSetu - Borrow & Return Controller
 * Manages equipment circulation, single-use QR handover, return reminders, and disputes
 */

import { db } from '../config/store.js';
import { QrHandoverService } from '../services/qrHandoverService.js';

export const borrowController = {
  // List borrowable items
  getItems(req, res) {
    const items = db.getItems();
    return res.json({
      success: true,
      items,
      count: items.length
    });
  },

  // Create new lendable item (Requires mAadhaar Verification)
  createItem(req, res) {
    const { name, category, condition, loanPeriodDays } = req.body;
    const user = req.user;

    // Enforce mAadhaar verification rule: Unverified users cannot give items
    if (!user || !user.aadhaarVerification?.verified) {
      return res.status(403).json({
        success: false,
        error: "mAadhaar QR digital verification is required before giving/lending items.",
        code: "AADHAAR_VERIFICATION_REQUIRED"
      });
    }

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        error: "Item name and category are required.",
        code: "MISSING_FIELDS"
      });
    }

    const newItem = db.createItem({
      ownerId: user.uid,
      ownerPublicName: user.publicName || user.displayName,
      ownerArea: user.area || "Civil Lines, Banda",
      name: name.trim(),
      category: category.trim(),
      condition: condition || "Good",
      loanPeriodDays: Number(loanPeriodDays) || 14,
      status: "available",
      currentBorrowerId: null,
      returnDeadline: null,
      disputeFlag: false
    });

    db.logAudit({
      action: "ITEM_LISTED",
      entityType: "item",
      entityId: newItem.id,
      performedBy: user.uid,
      performerName: user.displayName,
      performerRole: user.role,
      details: `Listed '${name}' for community lending (${loanPeriodDays || 14} days loan period).`
    });

    return res.status(201).json({
      success: true,
      item: newItem,
      message: "Item listed for community sharing."
    });
  },

  // Generate single-use handover QR token (Requires mAadhaar Verification)
  generateHandoverToken(req, res) {
    const { requestId, itemId } = req.body;
    const user = req.user;

    // Enforce mAadhaar verification rule: Unverified users cannot take items
    if (!user || !user.aadhaarVerification?.verified) {
      return res.status(403).json({
        success: false,
        error: "mAadhaar QR digital verification is required before taking/borrowing items.",
        code: "AADHAAR_VERIFICATION_REQUIRED"
      });
    }

    const request = requestId ? db.getRequestById(requestId) : null;
    const item = itemId ? db.getItemById(itemId) : null;

    const lenderId = item?.ownerId || request?.matchedProvider?.providerId || "usr_ngo_01";
    const receiverId = request?.userId || user.uid;

    const tokenData = QrHandoverService.generateHandoverToken({
      requestId: requestId || "req_1042",
      itemId: itemId || "itm_501",
      lenderId,
      receiverId,
      validMinutes: 60
    });

    const savedToken = db.createToken(tokenData);

    return res.json({
      success: true,
      token: savedToken,
      qrPayload: tokenData.qrPayload,
      message: "Single-use handover token generated. Valid for 60 minutes."
    });
  },

  // Confirm Handover (Lender scans Receiver's QR code)
  confirmHandover(req, res) {
    const { tokenId, signature } = req.body;
    const scanningUser = req.user;

    if (!tokenId) {
      return res.status(400).json({
        success: false,
        error: "Handover tokenId is required.",
        code: "MISSING_TOKEN"
      });
    }

    const tokenRecord = db.getToken(tokenId);

    // Validate token and anti-spoofing checks
    const validation = QrHandoverService.validateAndConsumeToken(tokenRecord, scanningUser, signature);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
        code: validation.code
      });
    }

    // Atomically invalidate the token: Single-Use Guarantee
    db.updateToken(tokenId, {
      status: "used",
      usedAt: new Date().toISOString(),
      usedByUid: scanningUser.uid
    });

    // Update item status to 'borrowed'
    if (tokenRecord.itemId) {
      const item = db.getItemById(tokenRecord.itemId);
      const days = item?.loanPeriodDays || 14;
      const deadlineDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      const formattedDeadline = deadlineDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });

      db.updateItem(tokenRecord.itemId, {
        status: "borrowed",
        currentBorrowerId: tokenRecord.receiverId,
        returnDeadline: formattedDeadline
      });
    }

    // Update request status to 'completed'
    if (tokenRecord.requestId) {
      db.updateRequest(tokenRecord.requestId, {
        status: "completed"
      });
    }

    // Log Immutable Audit Record
    db.logAudit({
      action: "HANDOVER_CONFIRMED",
      entityType: "handover_token",
      entityId: tokenId,
      performedBy: scanningUser.uid,
      performerName: scanningUser.displayName,
      performerRole: scanningUser.role,
      details: `Single-use handover token ${tokenId} successfully redeemed. Item ${tokenRecord.itemId} transferred to receiver ${tokenRecord.receiverId}.`
    });

    return res.json({
      success: true,
      message: "Handover confirmed successfully! Single-use token invalidated.",
      tokenId,
      status: "completed"
    });
  },

  // Return item to community pool
  confirmReturn(req, res) {
    const { itemId } = req.body;
    const user = req.user;

    const item = db.getItemById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, error: "Item not found" });
    }

    db.updateItem(itemId, {
      status: "available",
      currentBorrowerId: null,
      returnDeadline: null,
      disputeFlag: false
    });

    db.logAudit({
      action: "ITEM_RETURNED",
      entityType: "item",
      entityId: itemId,
      performedBy: user.uid,
      performerName: user.displayName,
      performerRole: user.role,
      details: `Item '${item.name}' returned safely into circulation.`
    });

    return res.json({
      success: true,
      message: "Item returned successfully and ready for the next person."
    });
  },

  // Raise dispute
  raiseDispute(req, res) {
    const { itemId, reason } = req.body;
    const user = req.user;

    db.updateItem(itemId, {
      disputeFlag: true
    });

    db.logAudit({
      action: "DISPUTE_RAISED",
      entityType: "item",
      entityId: itemId,
      performedBy: user.uid,
      performerName: user.displayName,
      performerRole: user.role,
      details: `Dispute reported: ${reason || 'Overdue item or physical damage reported.'}`
    });

    return res.json({
      success: true,
      message: "Dispute recorded. Verifier / Admin team will mediate within 24 hours."
    });
  }
};
