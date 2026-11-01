/**
 * RESCUEX Emergency Incident & Dispatch Radar Map
 * Uses Leaflet.js with fallback to HTML5 Canvas Radar if CDN fails
 */

class EmergencyRadarMap {
  constructor(containerId = 'emergencyMap') {
    this.containerId = containerId;
    this.map = null;
    this.markers = [];
    this.ambulanceMarker = null;
    this.accidentMarker = null;
    this.routePolyline = null;
    this.currentLat = 28.6139; // Default center (New Delhi / Global urban hub)
    this.currentLng = 77.2090;

    // Sample emergency telemetry data points
    this.units = [
      { id: 'AMB-108', type: 'ambulance', name: 'ALS Life-Support #108', lat: 28.6250, lng: 77.2180, status: 'En Route', eta: '4 min' },
      { id: 'HOSP-01', type: 'hospital', name: 'St. Jude Trauma Center (Level 1)', lat: 28.6320, lng: 77.2250, status: 'ICU Ready', beds: '6 Trauma Bays' },
      { id: 'POL-33', type: 'police', name: 'Highway Patrol PCR-33', lat: 28.6080, lng: 77.2010, status: 'Interception Active', distance: '1.2 km' },
      { id: 'ACC-01', type: 'accident', name: 'Reported Crash Site (NH-44 Bypass)', lat: 28.6145, lng: 77.2115, status: 'Severity Level 3', critical: true }
    ];
  }

  init() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    if (typeof L !== 'undefined') {
      this.initLeaflet();
    } else {
      console.warn('Leaflet not loaded, initializing canvas radar fallback');
      this.initCanvasFallback();
    }
  }

  initLeaflet() {
    try {
      this.map = L.map(this.containerId, {
        center: [this.currentLat, this.currentLng],
        zoom: 14,
        zoomControl: true,
        attributionControl: false
      });

      // Dark / Tactical OpenStreetMap tile layer (CartoDB Dark Matter)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(this.map);

      this.renderUnits();
    } catch (e) {
      console.error('Leaflet initialization failed, falling back:', e);
      this.initCanvasFallback();
    }
  }

  renderUnits() {
    if (!this.map) return;

    this.units.forEach(unit => {
      this.addUnitMarker(unit);
    });

    // Draw route line from Ambulance to Crash site
    const amb = this.units.find(u => u.type === 'ambulance');
    const acc = this.units.find(u => u.type === 'accident');
    if (amb && acc) {
      this.drawDispatchRoute([amb.lat, amb.lng], [acc.lat, acc.lng]);
    }
  }

  addUnitMarker(unit) {
    let iconClass = 'map-icon-accident';
    let iconEmoji = '💥';

    if (unit.type === 'ambulance') {
      iconClass = 'map-icon-ambulance';
      iconEmoji = '🚑';
    } else if (unit.type === 'hospital') {
      iconClass = 'map-icon-hospital';
      iconEmoji = '🏥';
    } else if (unit.type === 'police') {
      iconClass = 'map-icon-police';
      iconEmoji = '🚓';
    }

    const customIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `<div class="map-pulsing-icon ${iconClass}">${iconEmoji}</div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    const marker = L.marker([unit.lat, unit.lng], { icon: customIcon }).addTo(this.map);

    const popupHtml = `
      <div style="font-family: system-ui; min-width: 170px; color: #111;">
        <h4 style="margin: 0 0 4px; font-size: 0.95rem; font-weight: 800; color: #dc2626;">${unit.name}</h4>
        <p style="margin: 0; font-size: 0.8rem;"><strong>Status:</strong> ${unit.status}</p>
        ${unit.eta ? `<p style="margin: 0; font-size: 0.8rem;"><strong>ETA:</strong> ${unit.eta}</p>` : ''}
        ${unit.beds ? `<p style="margin: 0; font-size: 0.8rem;"><strong>Trauma Units:</strong> ${unit.beds}</p>` : ''}
      </div>
    `;
    marker.bindPopup(popupHtml);

    if (unit.type === 'ambulance') {
      this.ambulanceMarker = marker;
    } else if (unit.type === 'accident') {
      this.accidentMarker = marker;
    }

    this.markers.push(marker);
    return marker;
  }

  drawDispatchRoute(startCoords, endCoords) {
    if (!this.map) return;
    if (this.routePolyline) {
      this.map.removeLayer(this.routePolyline);
    }

    this.routePolyline = L.polyline([startCoords, endCoords], {
      color: '#3b82f6',
      weight: 4,
      opacity: 0.85,
      dashArray: '8, 8'
    }).addTo(this.map);
  }

  /**
   * Set new accident location from user reporting or GPS
   */
  setAccidentLocation(lat, lng, label = 'Reported Accident Site') {
    this.currentLat = lat;
    this.currentLng = lng;

    if (this.map) {
      this.map.setView([lat, lng], 15);

      if (this.accidentMarker) {
        this.accidentMarker.setLatLng([lat, lng]);
      } else {
        const newAcc = {
          id: 'ACC-' + Date.now().toString().slice(-4),
          type: 'accident',
          name: label,
          lat: lat,
          lng: lng,
          status: 'Active Alert'
        };
        this.accidentMarker = this.addUnitMarker(newAcc);
      }

      // Re-route nearest ambulance
      if (this.ambulanceMarker) {
        const ambLatLng = this.ambulanceMarker.getLatLng();
        this.drawDispatchRoute([ambLatLng.lat, ambLatLng.lng], [lat, lng]);
      }
    }
  }

  /**
   * Animate ambulance moving towards crash site
   */
  simulateAmbulanceProgress(stepPercent) {
    if (!this.ambulanceMarker || !this.accidentMarker) return;
    const ambStart = [28.6250, 77.2180];
    const accEnd = [this.currentLat, this.currentLng];

    const currentLat = ambStart[0] + (accEnd[0] - ambStart[0]) * (stepPercent / 100);
    const currentLng = ambStart[1] + (accEnd[1] - ambStart[1]) * (stepPercent / 100);

    this.ambulanceMarker.setLatLng([currentLat, currentLng]);
    this.drawDispatchRoute([currentLat, currentLng], accEnd);
  }

  /**
   * High-tech HTML5 Canvas Radar Screen Fallback
   */
  initCanvasFallback() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    let canvas = container.querySelector('.radar-canvas-fallback');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'radar-canvas-fallback';
      canvas.style.display = 'block';
      container.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    const resize = () => {
      canvas.width = container.clientWidth || 400;
      canvas.height = container.clientHeight || 350;
    };
    resize();
    window.addEventListener('resize', resize);

    let angle = 0;
    const animateRadar = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = Math.min(cx, cy) - 20;

      // Concentric circles
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let r = radius / 4; r <= radius; r += radius / 4) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx - radius, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.stroke();

      // Sweeping radar beam
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, angle, angle + 0.4);
      ctx.closePath();
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
      grad.addColorStop(1, 'rgba(239, 68, 68, 0.0)');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();

      // Crash Target Blip
      ctx.beginPath();
      ctx.arc(cx + 40, cy - 35, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10;
      ctx.fill();

      // Ambulance Unit Blip
      ctx.beginPath();
      ctx.arc(cx - 50, cy + 30, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#3b82f6';
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 10;
      ctx.fill();

      angle = (angle + 0.03) % (Math.PI * 2);
      requestAnimationFrame(animateRadar);
    };

    animateRadar();
  }
}

window.EmergencyMap = new EmergencyRadarMap();
