import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, HeartHandshake, PhoneCall, Sparkles, MapPin, ExternalLink } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Footer() {
  return (
    <footer className="bg-darkbrown text-cream border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-2.5">
              <BrandLogo size="md" className="w-9 h-9" />
              <span className="font-black text-xl text-white tracking-tight">
                Zaroorat<span className="text-softYellow">Setu</span>
              </span>
            </Link>
            <p className="text-xs text-cream/70 leading-relaxed font-medium">
              सुरक्षित नागरिक सहायता एवं वस्तु विनिमय नेटवर्क। बांदा क्षेत्र के नागरिकों, विद्यार्थियों एवं स्वयंसेवकों को आवश्यक संसाधनों से सीधे जोड़ने का नवाचार।
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-softYellow font-bold pt-1">
              <MapPin className="w-3.5 h-3.5 text-terracotta shrink-0" />
              <span>Pilot: REC Banda & nearby areas</span>
            </div>
          </div>

          {/* Core Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-softYellow">
              मुख्य सुविधाएं (Core Portals)
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-cream/80">
              <li>
                <Link to="/smart-matching" className="hover:text-white transition flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-softYellow" />
                  <span>AI स्मार्ट मैचिंग इंजन</span>
                </Link>
              </li>
              <li>
                <Link to="/borrow-return" className="hover:text-white transition">
                  सामान विनिमय एवं 50% धरोहर
                </Link>
              </li>
              <li>
                <Link to="/new-request" className="hover:text-white transition">
                  ज़रूरत दर्ज करें (Post a Need)
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition">
                  स्टॉक एवं अतिदेय डैशबोर्ड
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-white transition">
                  मेरा लेन-देन इतिहास
                </Link>
              </li>
            </ul>
          </div>

          {/* Verification & Civic Trust */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-softYellow">
              सुरक्षा एवं विश्वास (Civic Trust)
            </h4>
            <ul className="space-y-2 text-xs text-cream/80 font-medium">
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                <span>mAadhaar UIDAI Secure QR 2048-bit डिजिटल सत्यापन</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                <span>सिंगल-यूज़ QR कोड द्वारा सुरक्षित वस्तु हैंडओवर</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                <span>डिजिटल अनुबंध एवं पहले-बाद की फोटो स्थिति जांच</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                <span>पासवर्ड व सुरक्षा कोड कभी सादे टेक्स्ट में स्टोर नहीं होते</span>
              </li>
            </ul>
          </div>

          {/* Emergency & Offline Desk */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-softYellow">
              आपातकालीन एवं ऑफलाइन सहायता
            </h4>
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-softYellow font-bold">
                <PhoneCall className="w-4 h-4 text-terracotta" />
                <span>टोल-फ्री मिस्ड कॉल डेस्क:</span>
              </div>
              <div className="font-mono text-base font-black text-white">
                1800-ZAROORAT
              </div>
              <p className="text-[11px] text-cream/70 leading-normal">
                बिना इंटरनेट के भी केवल मिस्ड कॉल देकर अपनी आवश्यकता दर्ज कराएं।
              </p>
              <Link 
                to="/volunteer-assist" 
                className="inline-block text-[11px] font-bold text-softYellow underline hover:text-white"
              >
                स्वयंसेवक सहायता डेस्क &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Hackathon Line */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream/60">
          <div>
            © {new Date().getFullYear()} ZarooratSetu · HackFest 3.0 Civic Tech Initiative
          </div>
          <div className="text-[11px] text-cream/50">
            विकसित: REC Banda छात्र नवाचार एवं नागरिक कल्याण सहयोग
          </div>
        </div>
      </div>
    </footer>
  );
}
