/**
 * ZarooratSetu - Geo-Distance Service (Haversine Formula)
 * Calculates distance between community members in Banda
 */

export class GeoDistanceService {
  /**
   * Calculates distance in kilometers between two GPS coordinates
   */
  static haversineDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return Math.round(d * 10) / 10; // Round to 1 decimal place
  }

  static deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  /**
   * Sorts candidate providers by proximity to request location
   */
  static rankProvidersByDistance(targetLocation, providers = []) {
    return providers
      .map(p => {
        const dist = this.haversineDistance(
          targetLocation.lat,
          targetLocation.lng,
          p.coordinates?.lat,
          p.coordinates?.lng
        );
        return {
          ...p,
          distanceKm: dist !== null ? dist : 3.0 // Fallback estimate
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }
}
