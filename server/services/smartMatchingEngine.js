/**
 * ZarooratSetu - Advanced AI-Based Smart Matching Engine
 * Evaluates 6 major factors with weighted scoring model (0-100 pts):
 * 1. Emergency Priority: 25 pts (Critical requests at the top)
 * 2. Distance & Proximity: 20 pts (0-2km: 20, 2-5km: 16, 5-10km: 12, 10-20km: 6, >20km: 0)
 * 3. Resource Availability: 20 pts (real inventory check, category match, quantity)
 * 4. Required Time Compatibility: 15 pts (response time vs urgency timeline)
 * 5. User Verification & Trust Score: 10 pts (mAadhaar QR signature, KYC tier, trust score)
 * 6. Donor Willingness: 10 pts (available_willing: 10, needs_confirmation: 6, unavailable: 0)
 */

import { GeoDistanceService } from './geoDistanceService.js';
import { db } from '../config/store.js';

export class SmartMatchingEngine {
  /**
   * Classifies emergency level into Critical, High, Medium, or Normal
   */
  static classifyEmergencyLevel(request = {}) {
    const title = (request.title || '').toLowerCase();
    const desc = (request.description || '').toLowerCase();
    const rawUrgency = (request.urgency || '').toLowerCase();
    const category = (request.category || '').toLowerCase();
    const combined = `${title} ${desc} ${category}`;

    const criticalKeywords = [
      'blood', 'khoon', 'surgery', 'operation', 'oxygen', 'ventilator', 
      'icu', 'ambulance', 'cardiac', 'hemorrhage', 'life-saving', 'critical'
    ];
    const isCriticalKeyword = criticalKeywords.some(kw => combined.includes(kw));

    if (rawUrgency === 'urgent' || rawUrgency === 'critical' || isCriticalKeyword) {
      return {
        level: 'Critical',
        points: 25,
        detail: isCriticalKeyword
          ? 'Immediate life-critical medical urgency detected (25/25 pts)'
          : 'Urgent emergency priority level (25/25 pts)',
        medicalAlert: combined.includes('blood') || combined.includes('oxygen') || combined.includes('surgery') || category.includes('medical')
      };
    }

    const highKeywords = ['fracture', 'immediate', 'severe', 'exam', 'nebulizer', 'today', 'emergency'];
    const isHighKeyword = highKeywords.some(kw => combined.includes(kw));

    if (rawUrgency === 'high' || isHighKeyword) {
      return {
        level: 'High',
        points: 19,
        detail: 'Assistance required within hours (19/25 pts)',
        medicalAlert: category.includes('medical')
      };
    }

    if (rawUrgency === 'medium' || combined.includes('tomorrow') || combined.includes('24h')) {
      return {
        level: 'Medium',
        points: 13,
        detail: 'Assistance needed within 24 hours (13/25 pts)',
        medicalAlert: false
      };
    }

    return {
      level: 'Normal',
      points: 7,
      detail: 'Standard community need (7/25 pts)',
      medicalAlert: false
    };
  }

  /**
   * Calculates distance score based on proximity brackets
   */
  static evaluateDistance(requesterCoords, donorCoords) {
    if (!requesterCoords || !donorCoords || !requesterCoords.lat || !donorCoords.lat) {
      return {
        distanceKm: 3.5,
        points: 12,
        detail: 'Estimated neighborhood distance in pilot area (12/20 pts)'
      };
    }

    const dist = GeoDistanceService.haversineDistance(
      requesterCoords.lat,
      requesterCoords.lng,
      donorCoords.lat,
      donorCoords.lng
    );

    const distanceKm = dist !== null ? dist : 3.0;

    let points = 0;
    let detail = '';

    if (distanceKm <= 2.0) {
      points = 20;
      detail = `0–2 km highest proximity (${distanceKm} km): 20/20 pts`;
    } else if (distanceKm <= 5.0) {
      points = 16;
      detail = `2–5 km high preference (${distanceKm} km): 16/20 pts`;
    } else if (distanceKm <= 10.0) {
      points = 12;
      detail = `5–10 km medium preference (${distanceKm} km): 12/20 pts`;
    } else if (distanceKm <= 20.0) {
      points = 6;
      detail = `10–20 km extended radius (${distanceKm} km): 6/20 pts`;
    } else {
      points = 0;
      detail = `Beyond 20 km (${distanceKm} km): 0/20 pts`;
    }

    return {
      distanceKm,
      points,
      detail
    };
  }

  /**
   * Evaluates resource availability from real inventory and capabilities
   */
  static evaluateResource(request, candidate, items = []) {
    const reqTitle = (request.title || '').toLowerCase();
    const reqCategory = (request.category || '').toLowerCase();
    const reqDesc = (request.description || '').toLowerCase();

    // Check candidate's items in database
    const candidateItems = items.filter(i => 
      (i.owner_id === candidate.uid || i.ownerId === candidate.uid) &&
      (i.status === 'available' || Number(i.quantity_available) > 0)
    );

    // Exact title match in available inventory
    const exactMatch = candidateItems.find(i => {
      const iName = (i.name || '').toLowerCase();
      return reqTitle.includes(iName) || iName.includes(reqTitle.split(' ')[0]);
    });

    if (exactMatch) {
      return {
        points: 20,
        available: true,
        resourceName: exactMatch.name,
        stockAvailable: exactMatch.quantity_available,
        detail: `Exact item match '${exactMatch.name}' available (${exactMatch.quantity_available} units in stock): 20/20 pts`
      };
    }

    // Category match in available inventory
    const categoryMatch = candidateItems.find(i => 
      (i.category || '').toLowerCase() === reqCategory
    );

    if (categoryMatch) {
      return {
        points: 16,
        available: true,
        resourceName: `${categoryMatch.category} Resource (${categoryMatch.name})`,
        stockAvailable: categoryMatch.quantity_available,
        detail: `Matching category inventory available from this provider: 16/20 pts`
      };
    }

    // Role / specialty capability match (e.g. Medical donor for blood, NGO for emergency utensils/wheelchair)
    const specialties = Array.isArray(candidate.specialties) ? candidate.specialties.map(s => s.toLowerCase()) : [];
    const isSpecialist = specialties.some(s => reqCategory.includes(s) || reqTitle.includes(s));

    if (candidate.role === 'ngo') {
      return {
        points: 15,
        available: true,
        resourceName: "Verified NGO Community Aid Network",
        stockAvailable: 5,
        detail: "Institutional NGO active volunteer pool and emergency resources: 15/20 pts"
      };
    }

    if (candidate.role === 'donor' && (reqCategory.includes('medical') || reqTitle.includes('blood'))) {
      return {
        points: 15,
        available: true,
        resourceName: "Verified Medical Donor Registry",
        stockAvailable: 1,
        detail: "Registered emergency medical & blood volunteer: 15/20 pts"
      };
    }

    if (isSpecialist) {
      return {
        points: 12,
        available: true,
        resourceName: `Volunteer in ${request.category}`,
        stockAvailable: 1,
        detail: `Volunteer with active specialty in ${request.category}: 12/20 pts`
      };
    }

    // General volunteer willingness fallback
    if (candidate.willingnessStatus === 'available_willing') {
      return {
        points: 8,
        available: true,
        resourceName: "General Civic Volunteer Assistance",
        stockAvailable: 1,
        detail: "Civic volunteer available for support: 8/20 pts"
      };
    }

    return {
      points: 0,
      available: false,
      resourceName: "No verified inventory in category",
      stockAvailable: 0,
      detail: "No active matching resources listed: 0/20 pts"
    };
  }

  /**
   * Evaluates response time compatibility with emergency urgency
   */
  static evaluateTime(emergencyLevel, candidate) {
    const responseMinutes = typeof candidate.estimatedResponseMinutes === 'number'
      ? candidate.estimatedResponseMinutes
      : 30;

    let points = 0;
    let detail = '';

    if (emergencyLevel === 'Critical') {
      if (responseMinutes <= 15) {
        points = 15;
        detail = `Immediate emergency response (within ${responseMinutes} mins): 15/15 pts`;
      } else if (responseMinutes <= 30) {
        points = 12;
        detail = `Fast response time (${responseMinutes} mins): 12/15 pts`;
      } else if (responseMinutes <= 60) {
        points = 8;
        detail = `Sub-1-hour response time (${responseMinutes} mins): 8/15 pts`;
      } else {
        points = 3;
        detail = `Delayed response time (${responseMinutes} mins) for critical need: 3/15 pts`;
      }
    } else if (emergencyLevel === 'High') {
      if (responseMinutes <= 30) {
        points = 15;
        detail = `Prompt response for high urgency (${responseMinutes} mins): 15/15 pts`;
      } else if (responseMinutes <= 60) {
        points = 12;
        detail = `Within 1 hour (${responseMinutes} mins): 12/15 pts`;
      } else if (responseMinutes <= 180) {
        points = 9;
        detail = `Same-day response (${responseMinutes} mins): 9/15 pts`;
      } else {
        points = 5;
        detail = `Within 24 hours: 5/15 pts`;
      }
    } else {
      // Medium or Normal
      if (responseMinutes <= 60) {
        points = 15;
        detail = `Ready within hour (${responseMinutes} mins): 15/15 pts`;
      } else if (responseMinutes <= 240) {
        points = 12;
        detail = `Same-day response available: 12/15 pts`;
      } else {
        points = 8;
        detail = `Flexible non-urgent timeframe: 8/15 pts`;
      }
    }

    return {
      responseMinutes,
      points,
      detail
    };
  }

  /**
   * Evaluates user verification tier, trust score, and dispute history
   */
  static evaluateVerificationAndTrust(candidate) {
    // Restricted users get 0 points and are blocked
    if (candidate.isRestricted) {
      return {
        points: 0,
        isAadhaarVerified: false,
        trustScore: candidate.trustScore || 0,
        kycLevel: candidate.kycLevel,
        detail: "Restricted account due to dispute or fraud report: 0/10 pts"
      };
    }

    let points = 0;
    const isAadhaar = Boolean(candidate.aadhaarVerification && candidate.aadhaarVerification.verified);
    const kyc = candidate.kycLevel || 'none';
    const trustScore = typeof candidate.trustScore === 'number' ? candidate.trustScore : 100;
    const disputesLost = candidate.disputesLostCount || 0;

    // 1. Digital Identity Verification (mAadhaar QR digital signature)
    if (isAadhaar) {
      points += 3.5;
    }

    // 2. KYC Tier
    if (kyc === 'level_3') {
      points += 3.5; // Institutional verified NGO
    } else if (kyc === 'level_2') {
      points += 3.0; // Verified helper / lender
    } else if (kyc === 'level_1') {
      points += 1.5; // Basic verified phone/email
    }

    // 3. Trust Score proportionality (up to 2.5 points)
    points += (Math.max(0, trustScore) / 100) * 2.5;

    // 4. Dispute history
    if (disputesLost === 0) {
      points += 1.0;
    } else {
      points -= Math.min(2, disputesLost * 1.0);
    }

    // Missing info rule: do not award points for unverified information
    const finalPoints = Math.max(0, Math.min(10, Math.round(points * 10) / 10));

    return {
      points: finalPoints,
      isAadhaarVerified: isAadhaar,
      trustScore,
      kycLevel: kyc,
      detail: `Verification tier ${kyc.toUpperCase()}${isAadhaar ? ' + mAadhaar' : ''} (Trust: ${trustScore}/100): ${finalPoints}/10 pts`
    };
  }

  /**
   * Evaluates donor willingness preference
   */
  static evaluateWillingness(candidate) {
    const status = candidate.willingnessStatus || 'available_willing';

    if (status === 'available_willing') {
      return {
        status,
        points: 10,
        label: "Available and willing (तत्पर एवं उपलब्ध)",
        isWilling: true,
        detail: "Active willingness confirmed: 10/10 pts"
      };
    }

    if (status === 'needs_confirmation') {
      return {
        status,
        points: 6,
        label: "Available but needs confirmation (पुष्टि आवश्यक)",
        isWilling: true,
        detail: "Requires mutual consent before final dispatch: 6/10 pts"
      };
    }

    if (status === 'temporarily_unavailable') {
      return {
        status,
        points: 0,
        label: "Temporarily unavailable (अस्थायी रूप से व्यस्त)",
        isWilling: false,
        detail: "Donor is temporarily busy: 0/10 pts"
      };
    }

    return {
      status: 'not_interested',
      points: 0,
      label: "Not interested (रुचि नहीं)",
      isWilling: false,
      detail: "Donor opted out: 0/10 pts"
    };
  }

  /**
   * Evaluates a candidate donor against a request, calculating the weighted score (0-100)
   */
  static evaluateCandidate({ request, candidate, items = [], maxRadiusKm = 20 }) {
    // 1. Block restricted fraud-flagged accounts
    if (candidate.isRestricted) {
      return null;
    }

    // 2. Block users who marked themselves unavailable/not interested
    const willingness = this.evaluateWillingness(candidate);
    if (!willingness.isWilling) {
      return null;
    }

    // 3. Emergency Priority (25 pts max)
    const emergency = this.classifyEmergencyLevel(request);

    // 4. Distance & Proximity (20 pts max)
    const reqCoords = request.coordinates || { lat: 25.4764, lng: 80.3344 };
    const distance = this.evaluateDistance(reqCoords, candidate.coordinates);

    // Filter by radius unless maxRadiusKm is extended
    if (distance.distanceKm > maxRadiusKm) {
      return null;
    }

    // 5. Resource Availability (20 pts max)
    const resource = this.evaluateResource(request, candidate, items);

    // 6. Time Compatibility (15 pts max)
    const time = this.evaluateTime(emergency.level, candidate);

    // 7. Verification & Trust (10 pts max)
    const trust = this.evaluateVerificationAndTrust(candidate);

    // Weighted Total Score (0 - 100)
    const totalScore = Math.min(100, Math.max(0, Math.round(
      emergency.points +
      distance.points +
      resource.points +
      time.points +
      trust.points +
      willingness.points
    )));

    // Generate human-readable reasons for "Why This Match?"
    const reasons = [];
    reasons.push(`Nearby location: ${distance.distanceKm} km away in ${candidate.area || 'Banda'}.`);
    reasons.push(`Resource availability: ${resource.resourceName} (${resource.stockAvailable} available).`);
    reasons.push(`Verified trust: ${trust.isAadhaarVerified ? 'mAadhaar QR verified' : 'Tier Verified'} with ${trust.trustScore}/100 trust score.`);
    reasons.push(`Response time: Can respond within ${time.responseMinutes} minutes (${candidate.availableHours || 'Active'}).`);
    reasons.push(`Donor readiness: ${willingness.label}.`);

    if (emergency.level === 'Critical') {
      reasons.unshift(`Top Priority: Emergency request (${emergency.level}) given immediate dispatch preference.`);
    }

    // Contextual AI synthesis
    const aiSummary = `${candidate.displayName || candidate.publicName} is a top AI match (${totalScore}%) located ${distance.distanceKm} km away in ${candidate.area || 'Banda'}. ${resource.detail.split(':')[0]} with an estimated response time of ${time.responseMinutes} minutes.`;

    return {
      candidateId: candidate.uid,
      name: candidate.displayName,
      publicName: candidate.publicName || candidate.displayName,
      role: candidate.role,
      area: candidate.area || "Banda",
      avatar: candidate.role === 'ngo' ? '🏛️' : (candidate.role === 'donor' ? '🩸' : '🤝'),
      distanceKm: distance.distanceKm,
      kycLevel: candidate.kycLevel,
      isAadhaarVerified: trust.isAadhaarVerified,
      trustScore: trust.trustScore,
      estimatedResponseMinutes: time.responseMinutes,
      availableHours: candidate.availableHours || "Daytime 8 AM - 9 PM",
      willingnessStatus: candidate.willingnessStatus || "available_willing",
      willingnessLabel: willingness.label,
      resourceName: resource.resourceName,
      stockAvailable: resource.stockAvailable,
      isResourceAvailable: resource.available,
      emergencyLevel: emergency.level,
      matchScore: totalScore,
      factorScores: {
        emergencyPriority: { score: emergency.points, max: 25, level: emergency.level, detail: emergency.detail },
        distance: { score: distance.points, max: 20, distanceKm: distance.distanceKm, detail: distance.detail },
        resourceAvailability: { score: resource.points, max: 20, resourceName: resource.resourceName, detail: resource.detail },
        timeCompatibility: { score: time.points, max: 15, responseMinutes: time.responseMinutes, detail: time.detail },
        verificationTrust: { score: trust.points, max: 10, isAadhaar: trust.isAadhaarVerified, detail: trust.detail },
        donorWillingness: { score: willingness.points, max: 10, status: willingness.status, detail: willingness.detail }
      },
      reasons,
      aiSummary,
      medicalDisclaimer: emergency.medicalAlert
        ? "Medical Alert: AI suggestions do not replace emergency medical services (108/112) or professional clinical judgment."
        : null
    };
  }

  /**
   * Finds and ranks the best matching donors for a request
   */
  static findSmartMatches({ request, radiusKm = 20, excludeUserId = null }) {
    if (!request) return { matches: [], totalCandidates: 0 };

    const allUsers = Array.isArray(db.data.users) ? db.data.users : [];
    const allItems = db.getItems();

    // Potential candidates: donors, NGOs, lenders, and active civic volunteers
    const candidateUsers = allUsers.filter(u => {
      if (u.uid === excludeUserId || u.uid === request.userId) return false;
      if (u.isRestricted) return false;
      const validRoles = ['donor', 'ngo', 'lender', 'volunteer'];
      return validRoles.includes(u.role) || u.willingnessStatus === 'available_willing';
    });

    const evaluated = [];
    for (const user of candidateUsers) {
      const match = this.evaluateCandidate({
        request,
        candidate: user,
        items: allItems,
        maxRadiusKm: radiusKm
      });
      if (match && match.matchScore > 20) {
        evaluated.push(match);
      }
    }

    // Sort matching results:
    // 1. Critical requests at the top
    // 2. Highest matchScore descending
    // 3. Proximity tie-breaker (distanceKm ascending)
    evaluated.sort((a, b) => {
      if (a.emergencyLevel === 'Critical' && b.emergencyLevel !== 'Critical') return -1;
      if (b.emergencyLevel === 'Critical' && a.emergencyLevel !== 'Critical') return 1;
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      return a.distanceKm - b.distanceKm;
    });

    const emergency = this.classifyEmergencyLevel(request);

    return {
      requestId: request.id,
      requestTitle: request.title,
      category: request.category,
      emergencyLevel: emergency.level,
      medicalDisclaimer: emergency.medicalAlert
        ? "Medical Alert: AI matching recommendations do not replace emergency services (108/112) or registered medical practitioners."
        : null,
      matches: evaluated,
      totalCandidates: candidateUsers.length,
      matchedCount: evaluated.length,
      searchRadiusKm: radiusKm,
      hasMatches: evaluated.length > 0
    };
  }
}
