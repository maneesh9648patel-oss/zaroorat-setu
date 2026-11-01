/**
 * ZarooratSetu - Matching Controller
 * Matches nearest verified NGOs and Donors using Haversine distance
 */

import { db } from '../config/store.js';
import { GeoDistanceService } from '../services/geoDistanceService.js';
import { USER_ROLES } from '../config/constants.js';

export const matchingController = {
  // Find nearest verified providers for a request
  findNearestProviders(req, res) {
    const { requestId } = req.params;
    const request = db.getRequestById(requestId);

    if (!request) {
      return res.status(404).json({ success: false, error: "Request not found" });
    }

    // Get verified NGOs and donors in store
    const candidateUsers = db.data.users.filter(u =>
      (u.role === USER_ROLES.NGO || u.role === USER_ROLES.DONOR || u.role === USER_ROLES.LENDER) &&
      u.kycLevel !== 'none'
    );

    const ranked = GeoDistanceService.rankProvidersByDistance(
      request.coordinates || { lat: 25.4764, lng: 80.3344 },
      candidateUsers
    );

    // Sanitize results (hide phone/email, show public name and distance)
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

  // Assign provider to request
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
