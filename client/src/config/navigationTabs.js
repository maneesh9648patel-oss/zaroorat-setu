/**
 * ZarooratSetu - Central Navigation Tabs Configuration
 * Single source of truth for both Desktop TabBar and Mobile BottomNav / MoreDrawer.
 * Allows easy addition, removal, and role-based filtering of tabs.
 */

import { 
  Home, ClipboardList, Box, History, Layers, 
  CheckSquare, PhoneCall, Camera, Mic, Bot, Sparkles 
} from 'lucide-react';

export const NAV_TABS = [
  {
    id: 'home',
    labelHi: 'होम',
    labelEn: 'Home',
    icon: Home,
    route: '/',
    aliasRoutes: ['/home'],
    roles: ['all'],
    isPrimaryMobile: true,
    descriptionHi: 'नागरिक सहायता एवं लाइव डैशबोर्ड',
    descriptionEn: 'Citizen Help & Live Dashboard'
  },
  {
    id: 'requests',
    labelHi: 'आवश्यकताएं',
    labelEn: 'Requests',
    icon: ClipboardList,
    route: '/requests',
    aliasRoutes: ['/new-request'],
    roles: ['all'],
    isPrimaryMobile: true,
    badgeKey: 'pendingRequests',
    descriptionHi: 'मदद मांगें एवं सहायता सूची देखें',
    descriptionEn: 'Request Help & View Needs'
  },
  {
    id: 'items',
    labelHi: 'सामान और उधार',
    labelEn: 'Items & Borrow',
    icon: Box,
    route: '/borrow-return',
    aliasRoutes: ['/items'],
    roles: ['all'],
    isPrimaryMobile: true,
    descriptionHi: 'वस्तु दें अथवा सुरक्षित उधार लें',
    descriptionEn: 'Lend & Borrow Community Items'
  },
  {
    id: 'history',
    labelHi: 'मेरा इतिहास',
    labelEn: 'My History',
    icon: History,
    route: '/history',
    roles: ['all'],
    isPrimaryMobile: true,
    descriptionHi: 'दिए व लिए गए सामान का इतिहास',
    descriptionEn: 'Items Given & Borrowed History'
  },
  {
    id: 'stock',
    labelHi: 'स्टॉक डैशबोर्ड',
    labelEn: 'Stock Dashboard',
    icon: Layers,
    route: '/dashboard',
    aliasRoutes: ['/admin/dashboard'],
    roles: ['all'],
    isPrimaryMobile: false,
    descriptionHi: 'कुल स्टॉक, उपलब्ध वस्तुएं व अतिदेय ट्रैकिंग',
    descriptionEn: 'Total Stock, Available Items & Overdue'
  },
  {
    id: 'matching',
    labelHi: 'AI मैचिंग',
    labelEn: 'Smart Match',
    icon: Sparkles,
    route: '/smart-matching',
    roles: ['all'],
    isPrimaryMobile: false,
    badgeKey: 'smartMatches',
    descriptionHi: 'AI प्राथमिकता व दाता मिलान इंजन',
    descriptionEn: 'AI Priority & Smart Donor Matching'
  },
  {
    id: 'verifier',
    labelHi: 'सत्यापन पैनल',
    labelEn: 'Verifier Panel',
    icon: CheckSquare,
    route: '/verifier',
    roles: ['verifier', 'admin'], // Strictly protected: Verifier & Admin roles only
    isPrimaryMobile: false,
    badgeKey: 'verifierQueue',
    descriptionHi: 'नागरिक अनुरोधों की पुष्टि व समीक्षा',
    descriptionEn: 'Verify & Approve Citizen Requests'
  },
  {
    id: 'offline',
    labelHi: 'ऑफलाइन कतार',
    labelEn: 'Offline Queue',
    icon: PhoneCall,
    route: '/volunteer-assist',
    aliasRoutes: ['/offline'],
    roles: ['all'],
    isPrimaryMobile: false,
    badgeKey: 'offlineQueue',
    descriptionHi: 'मिस्ड कॉल व SMS हेल्पलाइन कतार',
    descriptionEn: '1800-ZAROORAT Missed Call & SMS Queue'
  },
  {
    id: 'lens',
    labelHi: 'AI लेंस',
    labelEn: 'AI Lens',
    icon: Camera,
    route: null,
    actionKey: 'openLens',
    roles: ['all'],
    isPrimaryMobile: false,
    descriptionHi: 'सामान जांच एवं 50% धरोहर स्कैनर',
    descriptionEn: 'Item Condition & Security Deposit Camera'
  },
  {
    id: 'voice',
    labelHi: 'वॉइस',
    labelEn: 'Voice Assist',
    icon: Mic,
    route: null,
    actionKey: 'openVoice',
    roles: ['all'],
    isPrimaryMobile: false,
    descriptionHi: 'बोलकर सहायता दर्ज करें (बुंदेली/हिंदी)',
    descriptionEn: 'Voice Assisted Need Entry'
  },
  {
    id: 'sahayak',
    labelHi: 'AI सहायक',
    labelEn: 'AI Sahayak',
    icon: Bot,
    route: null,
    actionKey: 'openAssistant',
    roles: ['all'],
    isPrimaryMobile: false,
    descriptionHi: '24/7 सेतु सहायक AI बॉट',
    descriptionEn: '24/7 Virtual Civic Assistant'
  }
];

/**
 * Filter tabs allowed for a user role
 * @param {string} role - 'needer' | 'donor' | 'lender' | 'ngo' | 'verifier' | 'admin'
 */
export function getTabsForRole(role = 'needer') {
  const userRole = role?.toLowerCase() || 'needer';
  return NAV_TABS.filter(tab => {
    if (tab.roles.includes('all')) return true;
    return tab.roles.includes(userRole);
  });
}

/**
 * Get primary mobile bottom nav tabs (usually 4 tabs + 1 'More' tab)
 */
export function getPrimaryMobileTabs(role = 'needer') {
  return getTabsForRole(role).filter(tab => tab.isPrimaryMobile);
}

/**
 * Get secondary tabs to display in the Mobile 'More' Drawer
 */
export function getMoreDrawerTabs(role = 'needer') {
  return getTabsForRole(role).filter(tab => !tab.isPrimaryMobile);
}
