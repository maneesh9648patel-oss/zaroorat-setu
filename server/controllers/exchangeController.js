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

      // Fraud flag restriction check
      if (user.isRestricted) {
        return res.status(403).json({
          success: false,
          error: user.restrictionReason || "Your account has been restricted from lending items due to repeated dispute losses pending admin review.",
          code: "ACCOUNT_RESTRICTED"
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

      // Fraud flag restriction check
      if (user.isRestricted) {
        return res.status(403).json({
          success: false,
          error: user.restrictionReason || "Your account has been restricted from borrowing items due to repeated dispute losses pending admin review.",
          code: "ACCOUNT_RESTRICTED"
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
      const durationDays = req.body.duration_days ? Math.max(1, parseInt(req.body.duration_days, 10)) : undefined;

      const result = db.takeItem({
        itemId,
        quantity: requestedQty,
        duration_days: durationDays,
        receiverUser: user
      });

      db.logAudit({
        action: "EXCHANGE_ITEM_TAKEN",
        entityType: "transaction",
        entityId: result.transaction.id,
        performedBy: user.uid,
        performerName: user.displayName,
        performerRole: user.role,
        details: `Took ${requestedQty} unit(s) of '${result.item.name}' from ${result.transaction.giver_name}. Due: ${result.transaction.due_date}.`
      });

      return res.json({
        success: true,
        item: result.item,
        transaction: result.transaction,
        message: `Exchange confirmed! You took ${requestedQty} unit(s) of '${result.item.name}'. Due date: ${new Date(result.transaction.due_date).toLocaleDateString()}.`
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
   * "Mark as returned" endpoint: for giver to confirm item returned and restore stock
   */
  returnItem(req, res) {
    try {
      const user = req.user;
      const { transactionId } = req.body;

      if (!transactionId) {
        return res.status(400).json({
          success: false,
          error: "Transaction ID is required to mark item as returned.",
          code: "MISSING_TRANSACTION_ID"
        });
      }

      const result = db.returnItem({
        transactionId,
        returningUser: user
      });

      db.logAudit({
        action: "EXCHANGE_ITEM_RETURNED",
        entityType: "transaction",
        entityId: transactionId,
        performedBy: user.uid,
        performerName: user.displayName,
        performerRole: user.role,
        details: `Item '${result.transaction.item_name}' (Quantity: ${result.transaction.quantity}) marked as returned. Available stock restored to ${result.item?.quantity_available ?? 'N/A'}.`
      });

      return res.json({
        success: true,
        transaction: result.transaction,
        item: result.item,
        message: `Item '${result.transaction.item_name}' successfully marked as returned! Stock restored.`
      });
    } catch (err) {
      console.warn("Return item warning:", err.message);
      return res.status(400).json({
        success: false,
        error: err.message || "Failed to mark item as returned.",
        code: "RETURN_ERROR"
      });
    }
  },

  /**
   * Admin / Stock Dashboard summary:
   * - Total stock vs. available stock per item
   * - Items currently given out, with days remaining
   * - Overdue items
   */
  getStockDashboard(req, res) {
    try {
      const summaryData = db.getStockSummary();
      return res.json({
        success: true,
        ...summaryData
      });
    } catch (err) {
      console.error("Stock dashboard error:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to retrieve stock dashboard data.",
        code: "SERVER_ERROR"
      });
    }
  },

  /**
   * Full exchange records with search and filter
   */
  getAllRecords(req, res) {
    try {
      const records = db.getAllExchangeRecords(req.query);
      return res.json({
        success: true,
        records,
        count: records.length
      });
    } catch (err) {
      console.error("Get all records error:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to retrieve exchange records.",
        code: "SERVER_ERROR"
      });
    }
  },

  /**
   * CSV export of all exchange records
   */
  exportCsv(req, res) {
    try {
      const records = db.getAllExchangeRecords(req.query);

      const headers = [
        "Transaction ID",
        "Item Name",
        "Category",
        "Quantity",
        "Type",
        "Status",
        "Giver Name",
        "Giver Phone",
        "Giver Aadhaar Last4",
        "Receiver Name",
        "Receiver Phone",
        "Receiver Aadhaar Last4",
        "Issue Date",
        "Duration (Days)",
        "Due Date",
        "Return Date",
        "Days Remaining",
        "Days Overdue",
        "Created At"
      ];

      const csvRows = [headers.join(",")];

      for (const r of records) {
        const row = [
          `"${r.id || ''}"`,
          `"${(r.item_name || '').replace(/"/g, '""')}"`,
          `"${(r.item_category || '').replace(/"/g, '""')}"`,
          r.quantity || 1,
          `"${r.type || ''}"`,
          `"${r.status || ''}"`,
          `"${(r.giver_name || '').replace(/"/g, '""')}"`,
          `"${r.giver_phone || ''}"`,
          `"${r.giver_aadhaar_last4 || ''}"`,
          `"${(r.receiver_name || '').replace(/"/g, '""')}"`,
          `"${r.receiver_phone || ''}"`,
          `"${r.receiver_aadhaar_last4 || ''}"`,
          `"${r.issue_date || ''}"`,
          r.duration_days || '',
          `"${r.due_date || ''}"`,
          `"${r.return_date || ''}"`,
          r.days_remaining !== null ? r.days_remaining : '',
          r.days_overdue !== null ? r.days_overdue : '',
          `"${r.created_at || ''}"`
        ];
        csvRows.push(row.join(","));
      }

      // Add UTF-8 BOM so Excel opens Hindi text cleanly
      const csvContent = "\uFEFF" + csvRows.join("\r\n");

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="ZarooratSetu_Exchange_Records_${new Date().toISOString().slice(0, 10)}.csv"`);
      return res.status(200).send(csvContent);
    } catch (err) {
      console.error("CSV Export error:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to export exchange records CSV.",
        code: "SERVER_ERROR"
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
