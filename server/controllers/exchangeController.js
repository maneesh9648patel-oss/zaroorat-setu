/**
 * ZarooratSetu - Item Exchange & Transaction Controller
 * Manages "Give item", "Take item", and "My history" exchange logs
 */

import { db } from '../config/store.js';

export const exchangeController = {
  /**
   * "Give item" form endpoint: logged-in user lists an item with quantity
   */
  giveItem(req, res) {
    try {
      const user = req.user;
      const { 
        name, 
        category, 
        quantity, 
        condition, 
        loanPeriodDays, 
        estimatedPrice, 
        images, 
        videoUrl, 
        videoName 
      } = req.body;

      // Enforce mAadhaar verification rule: Unverified users cannot give items
      if (!user || !user.aadhaarVerification?.verified) {
        return res.status(403).json({
          success: false,
          error: "mAadhaar QR digital verification is required before giving items.",
          code: "AADHAAR_VERIFICATION_REQUIRED"
        });
      }

      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({
          success: false,
          error: "Item name is required.",
          code: "MISSING_NAME"
        });
      }

      const qty = Math.max(1, parseInt(quantity, 10) || 1);

      const newItem = db.createItem({
        name: name.trim(),
        category: category || "Study Material",
        quantity_total: qty,
        quantity_available: qty,
        owner_id: user.uid,
        ownerId: user.uid,
        ownerPublicName: user.publicName || user.displayName,
        condition: condition || "Grade A+",
        loanPeriodDays: Number(loanPeriodDays) || 30,
        estimatedPrice: Number(estimatedPrice) || 1000,
        images: Array.isArray(images) ? images : [],
        videoUrl: videoUrl || "",
        videoName: videoName || ""
      });

      db.logAudit({
        action: "EXCHANGE_ITEM_GIVEN",
        entityType: "item",
        entityId: newItem.id,
        performedBy: user.uid,
        performerName: user.displayName,
        performerRole: user.role,
        details: `Listed '${name}' (Quantity: ${qty}) for community exchange.`
      });

      return res.status(201).json({
        success: true,
        item: newItem,
        message: `Successfully listed ${qty} unit(s) of '${newItem.name}' for exchange!`
      });
    } catch (err) {
      console.error("Give item error:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Failed to list item for exchange.",
        code: "SERVER_ERROR"
      });
    }
  },

  /**
   * "Take item" form endpoint: user requests an item and its quantity
   */
  takeItem(req, res) {
    try {
      const user = req.user;
      const { itemId, quantity } = req.body;

      // Enforce mAadhaar verification rule: Unverified users cannot take items
      if (!user || !user.aadhaarVerification?.verified) {
        return res.status(403).json({
          success: false,
          error: "mAadhaar QR digital verification is required before taking items.",
          code: "AADHAAR_VERIFICATION_REQUIRED"
        });
      }

      if (!itemId) {
        return res.status(400).json({
          success: false,
          error: "Item ID is required.",
          code: "MISSING_ITEM_ID"
        });
      }

      const requestedQty = Math.max(1, parseInt(quantity, 10) || 1);

      const result = db.takeItem({
        itemId,
        quantity: requestedQty,
        receiverUser: user
      });

      db.logAudit({
        action: "EXCHANGE_ITEM_TAKEN",
        entityType: "transaction",
        entityId: result.transaction.id,
        performedBy: user.uid,
        performerName: user.displayName,
        performerRole: user.role,
        details: `Took ${requestedQty} unit(s) of '${result.item.name}' from ${result.transaction.giver_name}.`
      });

      return res.json({
        success: true,
        item: result.item,
        transaction: result.transaction,
        message: `Exchange confirmed! You took ${requestedQty} unit(s) of '${result.item.name}'.`
      });
    } catch (err) {
      console.warn("Take item warning:", err.message);
      return res.status(400).json({
        success: false,
        error: err.message || "Failed to take item.",
        code: "EXCHANGE_ERROR"
      });
    }
  },

  /**
   * "My history" page endpoint: returns items given and items taken
   */
  getMyHistory(req, res) {
    try {
      const user = req.user;
      const history = db.getMyHistory(user.uid);

      return res.json({
        success: true,
        userId: user.uid,
        userName: user.displayName,
        gave: history.gave,
        took: history.took,
        totalGave: history.totalGave,
        totalTook: history.totalTook
      });
    } catch (err) {
      console.error("Get history error:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to retrieve exchange history.",
        code: "SERVER_ERROR"
      });
    }
  },

  /**
   * List all exchange items with availability
   */
  getItems(req, res) {
    const items = db.getItems();
    return res.json({
      success: true,
      items,
      count: items.length
    });
  }
};
