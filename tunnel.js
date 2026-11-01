/**
 * ZarooratSetu - Public Tunnel Launcher
 * Provides a public shareable URL with 'zarooratsetu' in the domain
 */

import localtunnel from 'localtunnel';
import http from 'http';

const PORT = process.env.PORT || 5000;
const PREFERRED_SUBDOMAINS = ['zarooratsetu', 'zaroorat-setu', 'zarooratsetu-banda', 'zarooratsetu-rec'];

async function startTunnel(subdomainIndex = 0) {
  const subdomain = PREFERRED_SUBDOMAINS[subdomainIndex] || `zarooratsetu-${Date.now().toString().slice(-4)}`;

  console.log(`📡 Connecting public tunnel for ZarooratSetu with subdomain: ${subdomain}...`);

  try {
    const tunnel = await localtunnel({
      port: PORT,
      subdomain: subdomain
    });

    console.log('\n================================================================');
    console.log('🚀 ZarooratSetu Public Shareable Link Active!');
    console.log(`🌐 Public Website URL: ${tunnel.url}`);
    console.log('📱 Anyone on mobile or PC can open this link from anywhere!');
    console.log('================================================================\n');

    // Fetch public IP in case loca.lt asks for password verification
    http.get('http://loca.lt/mytunnelpassword', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (data.trim()) {
          console.log(`🔑 Loca.lt Access Password (if prompted): ${data.trim()}\n`);
        }
      });
    }).on('error', () => {});

    tunnel.on('close', () => {
      console.log('Tunnel closed. Reconnecting in 3s...');
      setTimeout(() => startTunnel(subdomainIndex), 3000);
    });

    tunnel.on('error', (err) => {
      console.warn('Tunnel warning:', err.message);
    });

  } catch (err) {
    console.error(`Failed with subdomain ${subdomain}:`, err.message);
    if (subdomainIndex < PREFERRED_SUBDOMAINS.length - 1) {
      console.log('Trying next alternative subdomain...');
      startTunnel(subdomainIndex + 1);
    }
  }
}

startTunnel(0);
