/**
 * AGRI-SETU | Zero-Dependency Node.js Server & API Gateway
 * Smart India Hackathon 2026 - Team Tech Titans, REC Banda
 * 
 * Run with:
 * & "C:\Users\manee\AppData\Roaming\Antigravity\bin\agy-node.cmd" server.js
 * or:
 * node server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Set standard CORS headers for development & prototyping
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ==========================================
  // Mock REST API Endpoints (Future Integration Ready)
  // ==========================================
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: "online",
      project: "AGRI-SETU",
      tagline: "Connecting Farmers to the Right Support",
      event: "Smart India Hackathon 2026",
      team: "Team Tech Titans",
      institution: "Rajkiya Engineering College, Banda",
      timestamp: new Date().toISOString()
    }, null, 2));
    return;
  }

  if (pathname === '/api/weather') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      location: "Banda, Uttar Pradesh",
      tempC: 28,
      condition: "Partly Cloudy • Humid",
      humidity: "68%",
      rainProbability: "45%",
      windSpeedKmH: 14,
      riskAlert: {
        active: true,
        type: "Unseasonal Rain & Gust Warning",
        region: "Bundelkhand Agro-Climatic Zone VII",
        advisory: "Hold foliar spraying of urea or pesticide until wind and rain threat passes."
      },
      source: "Simulated IMD Agro-Advisory"
    }, null, 2));
    return;
  }

  if (pathname === '/api/mandi') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      market: "Bundelkhand APMC Mandis",
      district: "Banda, UP",
      records: [
        { crop: "Wheat (Sharbati)", mandi: "Banda APMC", modalPrice: 2425, msp: 2425, arrivalsQtl: 1450, trend: "+35" },
        { crop: "Wheat (Lokwan)", mandi: "Atarra APMC", modalPrice: 2440, msp: 2425, arrivalsQtl: 2100, trend: "+40" },
        { crop: "Mustard (Black)", mandi: "Banda APMC", modalPrice: 5350, msp: 5650, arrivalsQtl: 620, trend: "+75" },
        { crop: "Gram (Desi)", mandi: "Mahoba APMC", modalPrice: 5850, msp: 5440, arrivalsQtl: 890, trend: "0" }
      ],
      gatewayStatus: "e-NAM Ready"
    }, null, 2));
    return;
  }

  if (pathname === '/api/crop-analyze' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: "success",
        confidence: 0.942,
        detectedDisease: "Yellow Rust (Puccinia striiformis)",
        crop: "Wheat",
        riskSeverity: "High",
        chemicalRemedy: "Propiconazole 25% EC @ 1ml/L",
        organicRemedy: "Neem Seed Kernel Extract 5% (early onset)",
        disclaimer: "AI guidance is advisory only. Verify with local KVK Banda agronomist."
      }, null, 2));
    });
    return;
  }

  // ==========================================
  // Static File Serving
  // ==========================================
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = 'index.html';
  }

  const filePath = path.join(PUBLIC_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA routing
      const indexPath = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(indexPath, (indexErr, indexData) => {
        if (indexErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(indexData);
        }
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🌾 AGRI-SETU Web Platform | Smart India Hackathon 2026`);
  console.log(`Developed by Team Tech Titans, REC Banda`);
  console.log(`Server running at: http://localhost:${PORT}`);
  console.log(`API Health Check:  http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
