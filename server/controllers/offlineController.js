/**
 * ZarooratSetu - Offline / Missed-Call & SMS Webhook Controller
 * Bridges non-smartphone and feature-phone users through volunteer assistance
 */

import { db } from '../config/store.js';

export const offlineController = {
  // Webhook: Incoming missed call (Exotel / Twilio / Simulator)
  handleMissedCall(req, res) {
    const { From, CallSid, CallerLocation } = req.body;
    const rawPhone = From || req.query.From || "+919876543210";

    // Privacy masking: e.g. +91 98XXX X4210
    const digits = rawPhone.replace(/\D/g, '').slice(-10);
    const maskedPhone = `+91 ${digits.slice(0, 2)}XXX X${digits.slice(-4)}`;

    const ticket = db.createOfflineTicket({
      source: "missed_call",
      callerPhone: `+91${digits}`, // internal only
      callerPhoneMasked: maskedPhone,
      rawText: `Incoming missed call received from ${CallerLocation || 'Banda region'}. Citizen awaiting volunteer callback.`,
      callSid: CallSid || `call_${Date.now()}`
    });

    db.logAudit({
      action: "OFFLINE_CALL_LOGGED",
      entityType: "offline_queue",
      entityId: ticket.id,
      performedBy: "SYSTEM_WEBHOOK",
      performerName: "Missed Call Gateway",
      performerRole: "webhook",
      details: `Registered pending callback for ${maskedPhone}.`
    });

    return res.status(200).json({
      success: true,
      message: "Missed call webhook received. Ticket created in volunteer queue.",
      ticketId: ticket.id,
      status: "pending-assist",
      disclaimer: "Feature marked 'Planned' for production telecom carrier integration."
    });
  },

  // Webhook: Incoming SMS text
  handleIncomingSms(req, res) {
    const { From, Body, MessageSid } = req.body;
    const rawPhone = From || req.query.From || "+919876543210";
    const textBody = Body || req.query.Body || "NEED HELP BANDA";

    const digits = rawPhone.replace(/\D/g, '').slice(-10);
    const maskedPhone = `+91 ${digits.slice(0, 2)}XXX X${digits.slice(-4)}`;

    const ticket = db.createOfflineTicket({
      source: "sms",
      callerPhone: `+91${digits}`,
      callerPhoneMasked: maskedPhone,
      rawText: textBody.trim(),
      messageSid: MessageSid || `sms_${Date.now()}`
    });

    db.logAudit({
      action: "OFFLINE_SMS_LOGGED",
      entityType: "offline_queue",
      entityId: ticket.id,
      performedBy: "SYSTEM_WEBHOOK",
      performerName: "SMS Gateway",
      performerRole: "webhook",
      details: `Registered SMS ticket: '${textBody.slice(0, 30)}...' from ${maskedPhone}.`
    });

    return res.status(200).json({
      success: true,
      message: "SMS webhook received. Ticket created in volunteer queue.",
      ticketId: ticket.id,
      status: "pending-assist"
    });
  },

  // Get list of pending offline requests for volunteers
  getPendingQueue(req, res) {
    const queue = db.getOfflineQueue();
    return res.json({
      success: true,
      queue,
      count: queue.length
    });
  },

  // Volunteer completes assisted registration on citizen's behalf
  volunteerSubmit(req, res) {
    const { citizenName, contactPhone, category, description, area, ticketId } = req.body;
    const volunteer = req.user;

    if (!citizenName || !category || !description) {
      return res.status(400).json({
        success: false,
        error: "Citizen name, category, and description are required.",
        code: "MISSING_FIELDS"
      });
    }

    // Create assisted request in database
    const newReq = db.createRequest({
      userId: `usr_offline_${Date.now().toString(36)}`,
      userPublicName: `${citizenName.split(' ')[0]} (Assisted by ${volunteer?.displayName || 'Volunteer'})`,
      userArea: area || "REC Banda",
      category,
      title: `${category}: ${description.slice(0, 35)}...`,
      description: `[Volunteer Assisted Registration] ${description}. Recorded by volunteer: ${volunteer?.displayName || 'Community Desk'}.`,
      urgency: "High",
      status: "submitted",
      verifierStatus: "pending"
    });

    if (ticketId) {
      db.updateOfflineTicket(ticketId, {
        status: "converted",
        convertedToRequestId: newReq.id,
        assignedVolunteerId: volunteer?.uid
      });
    }

    db.logAudit({
      action: "ASSISTED_REGISTRATION",
      entityType: "request",
      entityId: newReq.id,
      performedBy: volunteer?.uid || "volunteer",
      performerName: volunteer?.displayName || "Community Volunteer",
      performerRole: volunteer?.role || "volunteer",
      details: `Registered need on behalf of ${citizenName} in ${area || 'Banda'}.`
    });

    return res.json({
      success: true,
      message: "Assisted request registered and forwarded to Human Verifier Queue.",
      request: newReq
    });
  }
};
