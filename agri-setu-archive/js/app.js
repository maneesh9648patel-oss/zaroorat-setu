/**
 * AGRI-SETU | Core Application Controller & State Engine
 * Smart India Hackathon 2026 - Team Tech Titans, REC Banda
 */

const AppState = {
  lang: 'en', // 'en' | 'hi'
  activePage: 'home',
  isLoggedIn: false,
  farmerProfile: Object.assign({}, AGRI_DATA.demoFarmer),
  schemeFilters: {
    category: 'recommended',
    state: 'all',
    crop: 'all',
    farmerCategory: 'all',
    type: 'all',
    search: '',
    sort: 'relevance',
    recentOnly: false
  },
  selectedSchemeForElig: null,
  selectedSchemeForDetail: null,
  notifications: (AGRI_DATA.schemeNotifications || []).map(n => Object.assign({}, n)),
  notificationsFilter: 'all',
  smsNotificationsEnabled: true,
  documentReadiness: ['aadhaar', 'khatauni', 'bank_dbt', 'sowing_cert'],
  currentCase: {
    crop: "Wheat",
    selectedSample: "wheat_yellow_rust",
    uploadedImage: null,
    problemDesc: "पत्तियों पर पीले रंग की धारियां दिख रही हैं और पाउडर जैसा झड़ रहा है।",
    analyzedResult: AGRI_DATA.cropDoctorCatalog.wheat_yellow_rust
  },
  demoTourStep: 0,
  otpTimer: null,
  otpCountdown: 30
};

// ==========================================
// Initialization
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initIcons();
  setupNavigation();
  setupLanguageToggle();
  setupCropDoctor();
  setupSchemeAdvisory();
  setupFarmerProfileModal();
  setupNotifications();
  setupDocumentLocker();
  setupMandiExplorer();
  setupWeatherView();
  setupInsuranceCalculator();
  setupExpertConnect();
  setupAuth();
  setupDemoTour();
  renderAllViews();
  applyTranslations();

  // Handle URL hash routing if present
  if (window.location.hash) {
    const route = window.location.hash.replace('#', '');
    navigateTo(route);
  }
});

// Helper for Lucide icons rendering
function initIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

// ==========================================
// Navigation & Routing
// ==========================================
function setupNavigation() {
  // Desktop links
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-target');
      if (target) {
        navigateTo(target);
        closeMobileDrawer();
      }
    });
  });

  // Hamburger button
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileDrawer = document.getElementById('mobileNavDrawer');
  if (hamburgerBtn && mobileDrawer) {
    hamburgerBtn.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
    });
  }

  // Brand click
  const brandLogo = document.getElementById('brandLogo');
  if (brandLogo) {
    brandLogo.addEventListener('click', () => navigateTo('home'));
  }

  // Hero CTA buttons
  const heroGetStarted = document.getElementById('heroGetStartedBtn');
  if (heroGetStarted) {
    heroGetStarted.addEventListener('click', () => {
      if (AppState.isLoggedIn) {
        navigateTo('dashboard');
      } else {
        openModal('loginModal');
      }
    });
  }

  const heroTryDemo = document.getElementById('heroTryDemoBtn');
  if (heroTryDemo) {
    heroTryDemo.addEventListener('click', () => {
      startDemoTour();
    });
  }

  // Navbar login/dashboard button
  const navLoginBtn = document.getElementById('navLoginBtn');
  if (navLoginBtn) {
    navLoginBtn.addEventListener('click', () => {
      if (AppState.isLoggedIn) {
        navigateTo('dashboard');
      } else {
        openModal('loginModal');
      }
    });
  }

  // Window scroll for sticky navbar shadow
  window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (nav) {
      if (window.scrollY > 20) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }
  });
}

function closeMobileDrawer() {
  const drawer = document.getElementById('mobileNavDrawer');
  if (drawer) drawer.classList.remove('open');
}

function navigateTo(pageId) {
  // Alias mappings
  if (pageId === 'schemes') pageId = 'scheme-advisory';
  if (pageId === 'crop-advisory' || pageId === 'pest-disease') pageId = 'crop-doctor';
  if (pageId === 'market-prices') pageId = 'mandi';
  if (pageId === 'profile') pageId = 'dashboard';

  const validPages = [
    'home', 'how-it-works', 'features', 'crop-doctor', 
    'scheme-advisory', 'schemes', 'mandi', 'weather', 'insurance', 
    'expert', 'dashboard', 'about', 'documents'
  ];

  if (!validPages.includes(pageId)) pageId = 'home';
  AppState.activePage = pageId;

  // Update active state in nav links
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(el => {
    const target = el.getAttribute('data-target');
    if (target === pageId || (pageId === 'scheme-advisory' && target === 'schemes') || (pageId === 'crop-doctor' && (target === 'crop-doctor' || target === 'pest-disease' || target === 'crop-advisory')) || (pageId === 'dashboard' && target === 'profile')) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  // If navigating to home, show all sections, else scroll to target
  const sections = document.querySelectorAll('.page-section');
  sections.forEach(sec => sec.style.display = 'block');

  if (pageId === 'home') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    let targetSection = document.getElementById(`section-${pageId}`);
    if (!targetSection && pageId === 'scheme-advisory') {
      targetSection = document.getElementById('section-schemes');
    }
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  window.history.replaceState(null, '', `#${pageId}`);
  initIcons();
}

// ==========================================
// Bilingual Translation Engine
// ==========================================
function setupLanguageToggle() {
  const langToggleBtn = document.getElementById('langToggleBtn');
  const mobileLangToggleBtn = document.getElementById('mobileLangToggleBtn');

  const toggleLanguage = () => {
    AppState.lang = (AppState.lang === 'en') ? 'hi' : 'en';
    applyTranslations();
    renderAllViews();
    showToast(
      AppState.lang === 'en' ? "Switched to English" : "सरल हिंदी भाषा चुनी गई",
      "info"
    );
  };

  if (langToggleBtn) langToggleBtn.addEventListener('click', toggleLanguage);
  if (mobileLangToggleBtn) mobileLangToggleBtn.addEventListener('click', toggleLanguage);
}

function applyTranslations() {
  const currentDict = TRANSLATIONS[AppState.lang];
  document.body.className = AppState.lang === 'hi' ? 'lang-hi' : '';

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (currentDict && currentDict[key]) {
      el.innerHTML = currentDict[key];
    }
  });

  // Update placeholder attributes
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (currentDict && currentDict[key]) {
      el.setAttribute('placeholder', currentDict[key]);
    }
  });

  // Update toggle button labels
  const langToggleBtn = document.getElementById('langToggleBtn');
  if (langToggleBtn) {
    langToggleBtn.innerHTML = `<i data-lucide="languages"></i> ${AppState.lang === 'en' ? 'हिन्दी' : 'English'}`;
  }

  // Update auth button label in nav
  const navLoginBtn = document.getElementById('navLoginBtn');
  if (navLoginBtn) {
    navLoginBtn.innerHTML = `<i data-lucide="user"></i> ${
      AppState.isLoggedIn 
        ? (AppState.lang === 'en' ? 'Aditya (Banda)' : 'आदित्य (बांदा)') 
        : currentDict.nav_login
    }`;
  }

  initIcons();
}

// ==========================================
// Crop Doctor Engine
// ==========================================
function setupCropDoctor() {
  const sampleChips = document.querySelectorAll('.sample-preset-chip');
  const cropSelect = document.getElementById('cdCropSelect');
  const problemDescInput = document.getElementById('cdProblemDesc');
  const analyzeBtn = document.getElementById('cdAnalyzeBtn');
  const dropzone = document.getElementById('cdDropzone');
  const fileInput = document.getElementById('cdFileInput');
  const voiceBtn = document.getElementById('cdVoiceBtn');
  const previewImg = document.getElementById('cdPreviewImg');

  // Handle sample selection
  sampleChips.forEach(chip => {
    chip.addEventListener('click', () => {
      sampleChips.forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      const sampleId = chip.getAttribute('data-sample');
      AppState.currentCase.selectedSample = sampleId;
      
      const sampleData = AGRI_DATA.cropDoctorCatalog[sampleId];
      if (sampleData) {
        AppState.currentCase.crop = sampleData.crop;
        if (cropSelect) cropSelect.value = sampleData.crop;

        // Populate sample description
        if (sampleId === 'wheat_yellow_rust') {
          problemDescInput.value = AppState.lang === 'hi' 
            ? "गेहूं की पत्तियों पर पीली धारियां और पाउडर दिख रहा है।" 
            : "Yellow stripes and orange-yellow powder spots on wheat leaves.";
          if (previewImg) previewImg.src = "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=60";
        } else if (sampleId === 'wheat_leaf_blight') {
          problemDescInput.value = AppState.lang === 'hi'
            ? "पत्तियों पर भूरे और काले धब्बे फैल रहे हैं।"
            : "Brown necrotic blotches on lower and middle wheat leaves.";
          if (previewImg) previewImg.src = "https://images.unsplash.com/photo-1599813393666-8a032822a9e5?w=600&auto=format&fit=crop&q=60";
        } else if (sampleId === 'mustard_aphid') {
          problemDescInput.value = AppState.lang === 'hi'
            ? "सरसों के फूलों और फलियों पर छोटे हरे-काले कीड़े चिपके हैं।"
            : "Tiny green-brown insects sucking sap on mustard flower heads.";
          if (previewImg) previewImg.src = "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=60";
        } else {
          problemDescInput.value = AppState.lang === 'hi'
            ? "फसल अच्छी बढ़ रही है, सामान्य निरीक्षण चाहिए।"
            : "Crop canopy is healthy, routine check.";
          if (previewImg) previewImg.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=60";
        }

        if (previewImg) previewImg.style.display = 'block';
        const placeholder = document.getElementById('cdDropPlaceholder');
        if (placeholder) placeholder.style.display = 'none';
      }
    });
  });

  // Dropzone file handling
  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          if (previewImg) {
            previewImg.src = evt.target.result;
            previewImg.style.display = 'block';
          }
          const placeholder = document.getElementById('cdDropPlaceholder');
          if (placeholder) placeholder.style.display = 'none';
          showToast(AppState.lang === 'hi' ? "फोटो अपलोड हुई" : "Photo uploaded successfully", "success");
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Voice recording simulation
  if (voiceBtn) {
    voiceBtn.addEventListener('click', () => {
      const isHi = AppState.lang === 'hi';
      voiceBtn.classList.add('recording');
      voiceBtn.innerHTML = `<i data-lucide="mic"></i> ${isHi ? "आवाज़ सुन रहे हैं..." : "Listening..."}`;
      initIcons();

      setTimeout(() => {
        voiceBtn.classList.remove('recording');
        voiceBtn.innerHTML = `<i data-lucide="mic"></i> ${isHi ? "बोलकर बताएं" : "Voice Input"}`;
        initIcons();
        if (problemDescInput) {
          problemDescInput.value = isHi 
            ? "खेत में पत्तियों पर पीली धारियां दिख रही हैं, क्या यह रतुआ है?"
            : "Yellow linear stripes on wheat leaves, is it rust?";
        }
        showToast(
          isHi ? "आवाज़ पहचान ली गई: 'पीली धारियां'" : "Voice captured: 'Yellow linear stripes'",
          "info"
        );
      }, 2500);
    });
  }

  // Analyze Crop Action
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', () => {
      runCropAnalysis();
    });
  }

  // Escalate to Expert Button in diagnosis box
  const expertBtn = document.getElementById('cdConnectExpertBtn');
  if (expertBtn) {
    expertBtn.addEventListener('click', () => {
      openExpertCaseModal();
    });
  }
}

function runCropAnalysis() {
  const overlay = document.getElementById('cdScanningOverlay');
  const analyzeBtn = document.getElementById('cdAnalyzeBtn');
  const scanStatus = document.getElementById('cdScanStatusText');
  const isHi = AppState.lang === 'hi';

  if (overlay) overlay.classList.add('active');
  if (analyzeBtn) analyzeBtn.disabled = true;

  const sampleKey = AppState.currentCase.selectedSample || "wheat_yellow_rust";
  const resultData = AGRI_DATA.cropDoctorCatalog[sampleKey] || AGRI_DATA.cropDoctorCatalog.wheat_yellow_rust;
  AppState.currentCase.analyzedResult = resultData;

  // Multi-phase simulated AI diagnostics
  if (scanStatus) scanStatus.innerText = isHi ? "1/3: पत्तियों के लक्षणों का डिजिटल विश्लेषण..." : "1/3: Digitizing leaf tissue symptoms...";

  setTimeout(() => {
    if (scanStatus) scanStatus.innerText = isHi ? "2/3: फफूंद व कीट डेटाबेस से मिलान जारी..." : "2/3: Matching pathogen database signatures...";
  }, 1000);

  setTimeout(() => {
    if (scanStatus) scanStatus.innerText = isHi ? "3/3: बांदा मौसम व जोखिम संदर्भ का मिलान..." : "3/3: Correlating with Banda weather context...";
  }, 2000);

  setTimeout(() => {
    if (overlay) overlay.classList.remove('active');
    if (analyzeBtn) analyzeBtn.disabled = false;
    renderCropDiagnosis(resultData);
    showToast(isHi ? "फसल जांच पूरी हुई!" : "Crop Analysis Complete!", "success");
  }, 2800);
}

function renderCropDiagnosis(data) {
  const isHi = AppState.lang === 'hi';
  const resultBox = document.getElementById('cdResultBox');
  if (!resultBox) return;

  const issueNameEl = document.getElementById('cdIssueName');
  const confidenceEl = document.getElementById('cdConfidenceVal');
  const confidenceBarEl = document.getElementById('cdConfidenceBar');
  const symptomsListEl = document.getElementById('cdSymptomsList');
  const guidanceListEl = document.getElementById('cdGuidanceList');
  const weatherContextEl = document.getElementById('cdWeatherContext');
  const actionTextEl = document.getElementById('cdActionText');
  const statusBadgeEl = document.getElementById('cdStatusBadge');

  if (issueNameEl) issueNameEl.innerText = isHi ? data.issueNameHi : data.issueNameEn;
  if (confidenceEl) confidenceEl.innerText = `${data.confidence}`;
  if (confidenceBarEl) confidenceBarEl.style.width = data.confidence;

  if (statusBadgeEl) {
    statusBadgeEl.innerText = data.riskLevel;
    if (data.id === 'healthy_wheat') {
      statusBadgeEl.className = 'issue-badge healthy';
    } else {
      statusBadgeEl.className = 'issue-badge';
    }
  }

  if (symptomsListEl) {
    symptomsListEl.innerHTML = data.symptoms.map(s => `<li>${s}</li>`).join('');
  }

  if (guidanceListEl) {
    const list = isHi ? data.guidanceHi : data.guidanceEn;
    guidanceListEl.innerHTML = list.map(g => `<li>${g}</li>`).join('');
  }

  if (weatherContextEl) {
    weatherContextEl.innerHTML = `<strong>${isHi ? "बांदा मौसम संदर्भ:" : "Banda Weather Context:"}</strong> ${data.weatherCorrelation}`;
  }

  if (actionTextEl) {
    actionTextEl.innerText = isHi ? data.recommendedActionHi : data.recommendedActionEn;
  }

  resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  initIcons();
}

// ==========================================
// Farmer Scheme Advisory (Core Module & AI Engine)
// ==========================================

function setupSchemeAdvisory() {
  renderCategoriesNav();
  renderProfileBar();

  // Search input with clear button
  const searchInput = document.getElementById('saSearchInput');
  const clearBtn = document.getElementById('saSearchClearBtn');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      AppState.schemeFilters.search = e.target.value.trim();
      if (clearBtn) {
        clearBtn.style.display = AppState.schemeFilters.search ? 'block' : 'none';
      }
      renderSchemeAdvisory();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        AppState.schemeFilters.search = '';
        clearBtn.style.display = 'none';
        renderSchemeAdvisory();
      }
    });
  }

  // Voice search simulator
  const voiceBtn = document.getElementById('saVoiceSearchBtn');
  if (voiceBtn) {
    voiceBtn.addEventListener('click', () => {
      const isHi = AppState.lang === 'hi';
      voiceBtn.classList.add('recording');
      voiceBtn.innerHTML = `<i data-lucide="mic"></i> ${isHi ? "सुन रहे हैं..." : "Listening..."}`;
      initIcons();

      setTimeout(() => {
        voiceBtn.classList.remove('recording');
        voiceBtn.innerHTML = `<i data-lucide="mic"></i> ${isHi ? "बोलें" : "Voice"}`;
        initIcons();
        const term = isHi ? "सोलर पंप" : "solar pump";
        if (searchInput) searchInput.value = term;
        AppState.schemeFilters.search = term;
        if (clearBtn) clearBtn.style.display = 'block';
        renderSchemeAdvisory();
        showToast(
          isHi ? `खोज शब्द पहचाना गया: "${term}"` : `Voice search detected: "${term}"`,
          "info"
        );
      }, 2000);
    });
  }

  // Filter dropdown listeners
  const stateFilter = document.getElementById('saStateFilter');
  if (stateFilter) {
    stateFilter.addEventListener('change', (e) => {
      AppState.schemeFilters.state = e.target.value;
      renderSchemeAdvisory();
    });
  }

  const cropFilter = document.getElementById('saCropFilter');
  if (cropFilter) {
    cropFilter.addEventListener('change', (e) => {
      AppState.schemeFilters.crop = e.target.value;
      renderSchemeAdvisory();
    });
  }

  const catFilter = document.getElementById('saCategoryFilter');
  if (catFilter) {
    catFilter.addEventListener('change', (e) => {
      AppState.schemeFilters.farmerCategory = e.target.value;
      renderSchemeAdvisory();
    });
  }

  const typeFilter = document.getElementById('saTypeFilter');
  if (typeFilter) {
    typeFilter.addEventListener('change', (e) => {
      AppState.schemeFilters.type = e.target.value;
      renderSchemeAdvisory();
    });
  }

  const sortSelect = document.getElementById('saSortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      AppState.schemeFilters.sort = e.target.value;
      renderSchemeAdvisory();
    });
  }

  const recentToggle = document.getElementById('saRecentOnlyToggle');
  if (recentToggle) {
    recentToggle.addEventListener('change', (e) => {
      AppState.schemeFilters.recentOnly = e.target.checked;
      renderSchemeAdvisory();
    });
  }

  // Reset button
  const resetBtn = document.getElementById('saResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      AppState.schemeFilters = {
        category: 'recommended',
        state: 'all',
        crop: 'all',
        farmerCategory: 'all',
        type: 'all',
        search: '',
        sort: 'relevance',
        recentOnly: false
      };
      if (searchInput) searchInput.value = '';
      if (clearBtn) clearBtn.style.display = 'none';
      if (stateFilter) stateFilter.value = 'all';
      if (cropFilter) cropFilter.value = 'all';
      if (catFilter) catFilter.value = 'all';
      if (typeFilter) typeFilter.value = 'all';
      if (sortSelect) sortSelect.value = 'relevance';
      if (recentToggle) recentToggle.checked = false;
      renderCategoriesNav();
      renderSchemeAdvisory();
      showToast(AppState.lang === 'hi' ? "फ़िल्टर रीसेट किए गए" : "Filters reset to defaults", "info");
    });
  }

  // Profile Edit button
  const editProfileBtn = document.getElementById('saEditProfileBtn');
  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
      openModal('farmerProfileModal');
      populateProfileModalFields();
    });
  }

  // Notification button in SA banner
  const openNotifBtn = document.getElementById('saOpenNotifBtn');
  if (openNotifBtn) {
    openNotifBtn.addEventListener('click', () => {
      openModal('schemeNotificationsDrawer');
    });
  }

  renderSchemeAdvisory();
}

function renderCategoriesNav() {
  const container = document.getElementById('saCategoriesNav');
  if (!container) return;

  const isHi = AppState.lang === 'hi';
  const cats = AGRI_DATA.schemeCategories || [];

  container.innerHTML = cats.map(cat => {
    const isActive = AppState.schemeFilters.category === cat.id;
    return `
      <button type="button" class="sa-cat-pill ${isActive ? 'active' : ''}" data-cat-id="${cat.id}">
        <i data-lucide="${cat.icon}"></i>
        <span>${isHi ? cat.nameHi : cat.nameEn}</span>
        <span class="sa-cat-pill-badge">${cat.badge}</span>
      </button>
    `;
  }).join('');

  container.querySelectorAll('.sa-cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const catId = pill.getAttribute('data-cat-id');
      AppState.schemeFilters.category = catId;
      renderCategoriesNav();
      renderSchemeAdvisory();
    });
  });

  initIcons();
}

function renderProfileBar() {
  const profile = AppState.farmerProfile || AGRI_DATA.demoFarmer;
  const isHi = AppState.lang === 'hi';

  const nameEl = document.getElementById('saProfileFarmerName');
  const avatarEl = document.getElementById('saProfileAvatar');
  const tagLoc = document.getElementById('saTagLoc');
  const tagCrop = document.getElementById('saTagCrop');
  const tagLand = document.getElementById('saTagLand');
  const tagIrrig = document.getElementById('saTagIrrig');
  const tagActivity = document.getElementById('saTagActivity');

  if (nameEl) {
    nameEl.innerText = isHi 
      ? `${profile.hindiName || profile.name} (${profile.district || 'बांदा'} किसान)`
      : `${profile.name} (${profile.district || 'Banda'} Farmer)`;
  }

  if (avatarEl) {
    avatarEl.innerText = (profile.hindiName || profile.name || 'आ').charAt(0);
  }

  if (tagLoc) {
    tagLoc.innerHTML = `<i data-lucide="map-pin"></i> ${profile.district || 'Banda'}, ${profile.state || 'Uttar Pradesh'}`;
  }

  if (tagCrop) {
    const crops = Array.isArray(profile.crops) ? profile.crops.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ') : 'Wheat';
    tagCrop.innerHTML = `<i data-lucide="sprout"></i> ${crops}`;
  }

  if (tagLand) {
    tagLand.innerHTML = `<i data-lucide="maximize-2"></i> ${profile.landHolding || '2.5 Acres'}`;
  }

  if (tagIrrig) {
    const irrigText = profile.irrigation === 'rainfed' 
      ? (isHi ? 'वर्षा आधारित' : 'Rainfed') 
      : (isHi ? 'बोरवेल सिंचित' : 'Borewell Irrigated');
    tagIrrig.innerHTML = `<i data-lucide="droplets"></i> ${irrigText}`;
  }

  if (tagActivity) {
    const actText = profile.farmingActivity === 'horticulture' ? (isHi ? 'बागवानी' : 'Horticulture') : (isHi ? 'फसल खेती' : 'Crop Cultivation');
    tagActivity.innerHTML = `<i data-lucide="tractor"></i> ${actText}`;
  }

  initIcons();
}

/**
 * AI Recommendation & Match Engine
 * Computes deterministic relevance score and returns human-readable reason in EN & HI.
 */
function calculateSchemeRelevance(scheme, profile) {
  let score = 50; // Base score
  const reasonsEn = [];
  const reasonsHi = [];

  // 1. State matching
  if (scheme.state === 'All-India' || scheme.state === 'Pan-India') {
    score += 15;
  } else if ((scheme.state || '').toLowerCase() === (profile.state || '').toLowerCase()) {
    score += 25;
    reasonsEn.push(`Available in your state (${profile.state})`);
    reasonsHi.push(`आपके राज्य (${profile.state}) के लिए विशेष रूप से उपलब्ध`);
  } else {
    score -= 40; // Outside scheme state
  }

  // 2. Crop matching
  const profileCrops = Array.isArray(profile.crops) ? profile.crops : ['wheat'];
  const hasCropMatch = scheme.applicable_crops.includes('all') || 
    scheme.applicable_crops.some(c => profileCrops.includes(c));
  if (hasCropMatch) {
    score += 15;
    const matched = profileCrops.filter(c => scheme.applicable_crops.includes(c));
    if (matched.length > 0 && !scheme.applicable_crops.includes('all')) {
      const names = matched.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' & ');
      reasonsEn.push(`Specifically covers your cultivated crop (${names})`);
      reasonsHi.push(`आपकी उगाई जाने वाली फसल (${names}) पर सीधे लागू`);
    }
  }

  // 3. Land holding matching
  const landAcres = parseFloat(profile.landHoldingAcres) || 2.5;
  const isSmallMarginal = landAcres <= 5.0; // <= 2 Hectares
  if (isSmallMarginal && scheme.farmer_categories.some(c => ['small', 'marginal', 'all'].includes(c))) {
    score += 15;
    if (scheme.criteria && scheme.criteria.max_land_ha && scheme.criteria.max_land_ha <= 2.0) {
      reasonsEn.push(`Tailored for small & marginal landholders (<5 acres)`);
      reasonsHi.push(`लघु व सीमांत किसानों (<5 एकड़) के लिए विशेष रूप से लाभदायी`);
    }
  }

  // 4. Irrigation & Solar Pump
  if (scheme.category_tags.includes('irrigation')) {
    if (profile.irrigation === 'rainfed') {
      score += 20;
      reasonsEn.push(`Assists in establishing borewell & free irrigation for rainfed fields`);
      reasonsHi.push(`असिंचित खेत में मुफ्त बोरिंग व सिंचाई साधन तैयार करने में मददगार`);
    } else {
      score += 15;
      reasonsEn.push(`Provides 55% to 60% grant on solar pump & precision micro-irrigation`);
      reasonsHi.push(`सोलर पंप व ड्रिप/स्प्रिंकलर संयंत्र पर 55% से 60% तक सरकारी अनुदान`);
    }
  }

  // 5. Farm Machinery & Mechanization
  if (scheme.category_tags.includes('machinery')) {
    score += 15;
    reasonsEn.push(`Offers 40-50% grant on farm implements (rotavator, seed drill, tractor)`);
    reasonsHi.push(`रोटावेटर, सीड ड्रिल व कृषि यंत्रों पर 40-50% तक सरकारी अनुदान`);
  }

  // 6. Pension / Income Support
  if (scheme.category_tags.includes('pension')) {
    if (profile.ageGroup === '18-40' && isSmallMarginal) {
      score += 20;
      reasonsEn.push(`Eligible for ₹3,000/month guaranteed lifelong pension (Age 18-40)`);
      reasonsHi.push(`18-40 आयु वर्ग के लघु किसानों के लिए ₹3,000/माह निश्चित पेंशन`);
    } else if (scheme.scheme_id === 'pm_kisan') {
      score += 25;
      reasonsEn.push(`Provides ₹6,000/year direct financial income support via DBT`);
      reasonsHi.push(`प्रति वर्ष ₹6,000 की सुनिश्चित नकद सहायता सीधे बैंक खाते (DBT) में`);
    }
  }

  // 7. Bundelkhand / Special District priority
  if ((profile.district || '').toLowerCase() === 'banda' && scheme.scheme_id === 'up_khet_suraksha') {
    score += 30;
    reasonsEn.push(`Active 60% solar fence subsidy in Bundelkhand / Banda for crop protection`);
    reasonsHi.push(`बांदा (बुंदेलखंड) में छुट्टा पशुओं से सुरक्षा हेतु सोलर बाड़ पर 60% अनुदान`);
  }

  const finalScore = Math.min(99, Math.max(30, score));
  const explanationEn = reasonsEn.length > 0 
    ? reasonsEn.join(' • ') 
    : `Relevant to registered farmers in ${profile.state || 'India'}.`;
  const explanationHi = reasonsHi.length > 0 
    ? reasonsHi.join(' • ') 
    : `${profile.state || 'भारत'} के पंजीकृत किसानों के लिए उपयोगी।`;

  return {
    score: finalScore,
    isRecommended: finalScore >= 75,
    explanationEn,
    explanationHi
  };
}

function renderSchemeAdvisory() {
  const container = document.getElementById('schemesContainer');
  const recContainer = document.getElementById('saRecommendedGrid');
  const recSection = document.getElementById('saRecommendedSection');
  const countText = document.getElementById('saResultsCount');
  const resultsTitle = document.getElementById('saResultsTitle');

  if (!container) return;

  const isHi = AppState.lang === 'hi';
  const profile = AppState.farmerProfile || AGRI_DATA.demoFarmer;
  const allSchemes = AGRI_DATA.schemeAdvisoryDatabase || [];

  // Evaluate each scheme with the AI matching engine
  const evaluatedSchemes = allSchemes.map(sch => {
    const relevance = calculateSchemeRelevance(sch, profile);
    return Object.assign({}, sch, { aiRelevance: relevance });
  });

  // Filter schemes
  let filtered = evaluatedSchemes.filter(sch => {
    // Category filter
    const activeCat = AppState.schemeFilters.category;
    if (activeCat && activeCat !== 'recommended') {
      if (activeCat === 'central' && sch.government_level !== 'Central') return false;
      if (activeCat === 'state' && sch.government_level !== 'State') return false;
      if (activeCat === 'subsidies' && !sch.category_tags.includes('subsidies')) return false;
      if (activeCat === 'machinery' && !sch.category_tags.includes('machinery')) return false;
      if (activeCat === 'inputs' && !sch.category_tags.includes('inputs')) return false;
      if (activeCat === 'irrigation' && !sch.category_tags.includes('irrigation')) return false;
      if (activeCat === 'insurance' && !sch.category_tags.includes('insurance')) return false;
      if (activeCat === 'pension' && !sch.category_tags.includes('pension')) return false;
      if (activeCat === 'credit' && !sch.category_tags.includes('credit')) return false;
    }

    // State filter
    if (AppState.schemeFilters.state !== 'all') {
      const st = AppState.schemeFilters.state.toLowerCase();
      if (sch.state !== 'All-India' && !sch.state.toLowerCase().includes(st)) {
        return false;
      }
    }

    // Crop filter
    if (AppState.schemeFilters.crop !== 'all') {
      const cp = AppState.schemeFilters.crop.toLowerCase();
      if (!sch.applicable_crops.includes('all') && !sch.applicable_crops.includes(cp)) {
        return false;
      }
    }

    // Farmer category filter
    if (AppState.schemeFilters.farmerCategory !== 'all') {
      const fc = AppState.schemeFilters.farmerCategory.toLowerCase();
      if (!sch.farmer_categories.includes('all') && !sch.farmer_categories.includes(fc)) {
        return false;
      }
    }

    // Scheme type dropdown
    if (AppState.schemeFilters.type !== 'all') {
      const tp = AppState.schemeFilters.type;
      if (tp === 'central' && sch.government_level !== 'Central') return false;
      if (tp === 'state' && sch.government_level !== 'State') return false;
      if (tp !== 'central' && tp !== 'state' && !sch.category_tags.includes(tp)) return false;
    }

    // Search query
    if (AppState.schemeFilters.search) {
      const q = AppState.schemeFilters.search.toLowerCase();
      const matchName = sch.scheme_name.toLowerCase().includes(q) || sch.scheme_name_hindi.toLowerCase().includes(q);
      const matchBenefit = sch.benefits.toLowerCase().includes(q) || sch.benefits_hindi.toLowerCase().includes(q);
      const matchDesc = sch.description.toLowerCase().includes(q) || sch.description_hindi.toLowerCase().includes(q);
      const matchDept = sch.department.toLowerCase().includes(q);
      if (!matchName && !matchBenefit && !matchDesc && !matchDept) return false;
    }

    // Recent only
    if (AppState.schemeFilters.recentOnly) {
      if (!sch.last_updated || !sch.last_updated.includes('2026-08') && !sch.last_updated.includes('2026-09')) {
        return false;
      }
    }

    return true;
  });

  // Sorting
  filtered.sort((a, b) => {
    if (AppState.schemeFilters.sort === 'relevance') {
      return b.aiRelevance.score - a.aiRelevance.score;
    } else if (AppState.schemeFilters.sort === 'benefit') {
      return (b.financial_benefit_amount || 0) - (a.financial_benefit_amount || 0);
    } else if (AppState.schemeFilters.sort === 'updated') {
      return new Date(b.last_updated) - new Date(a.last_updated);
    } else if (AppState.schemeFilters.sort === 'status') {
      const aOpen = a.status.includes('Open') ? 1 : 0;
      const bOpen = b.status.includes('Open') ? 1 : 0;
      return bOpen - aOpen;
    }
    return 0;
  });

  // Update counts
  if (countText) {
    countText.innerText = isHi 
      ? `कुल प्रदर्शित योजनाएं: ${filtered.length}`
      : `Showing ${filtered.length} Verified Schemes`;
  }

  // 1. Render AI Recommended Spotlight (Top matches with >= 75% score)
  const topRecommended = evaluatedSchemes
    .filter(s => s.aiRelevance.score >= 75)
    .sort((a, b) => b.aiRelevance.score - a.aiRelevance.score)
    .slice(0, 3);

  if (recSection && recContainer) {
    if (AppState.schemeFilters.category === 'recommended' || !AppState.schemeFilters.category) {
      recSection.style.display = 'block';
      recContainer.innerHTML = topRecommended.map(sch => {
        return createSchemeCardHtml(sch, isHi, true);
      }).join('');
    } else {
      recSection.style.display = 'none';
    }
  }

  // 2. Render All Schemes Grid
  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; background: var(--bg-surface); border: 1px dashed var(--border-light); border-radius: var(--radius-xl);">
        <i data-lucide="search-x" style="width: 48px; height: 48px; color: var(--text-muted); margin: 0 auto 1rem auto;"></i>
        <h4 style="font-weight: 800; font-size: 1.15rem; margin-bottom: 0.5rem;">${isHi ? "कोई योजना नहीं मिली" : "No Matching Schemes Found"}</h4>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.25rem;">${isHi ? "कृपया अन्य फ़िल्टर चुनें या खोज शब्द बदलें।" : "Try adjusting your filters or clearing search terms."}</p>
        <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('saResetBtn').click()">
          <i data-lucide="rotate-ccw"></i> ${isHi ? "फ़िल्टर हटाएं" : "Reset Filters"}
        </button>
      </div>
    `;
  } else {
    container.innerHTML = filtered.map(sch => {
      return createSchemeCardHtml(sch, isHi, false);
    }).join('');
  }

  initIcons();
}

/**
 * Generates clean, accessible HTML for an individual scheme card.
 */
function createSchemeCardHtml(sch, isHi, isSpotlight = false) {
  const govLevelClass = sch.government_level === 'Central' ? 'badge-gov-central' : 'badge-gov-state';
  const govLevelText = isHi 
    ? (sch.government_level === 'Central' ? 'केंद्र सरकार' : 'राज्य सरकार')
    : (sch.government_level === 'Central' ? 'Central Govt' : 'State Govt');

  const title = isHi ? sch.scheme_name_hindi : sch.scheme_name;
  const dept = isHi ? sch.department_hindi : sch.department;
  const benefit = isHi ? sch.benefits_hindi : sch.benefits;
  const desc = isHi ? sch.description_hindi : sch.description;
  const elig = isHi ? sch.eligibility_hindi : sch.eligibility;
  const status = isHi ? sch.status_hindi : sch.status;
  const reason = isHi ? sch.aiRelevance.explanationHi : sch.aiRelevance.explanationEn;
  const score = sch.aiRelevance ? sch.aiRelevance.score : 85;

  const docs = (isHi ? sch.documents_required_hindi : sch.documents_required) || [];

  return `
    <div class="sa-scheme-card ${isSpotlight ? 'spotlight-card' : ''}" data-scheme-id="${sch.scheme_id}">
      <!-- Header Row -->
      <div class="sa-card-header">
        <div class="sa-card-gov-badge ${govLevelClass}">
          <i data-lucide="${sch.government_level === 'Central' ? 'landmark' : 'building'}"></i>
          <span>${govLevelText}</span>
        </div>
        <span class="badge-tag badge-status-pill ${sch.status.includes('Open') ? 'badge-open' : 'badge-active'}">
          ${status}
        </span>
      </div>

      <!-- Department & Scheme Title -->
      <span class="sa-card-dept" title="${dept}">${dept}</span>
      <h3 class="sa-card-title">${title}</h3>

      <!-- AI Personalized Match Explainer Box -->
      <div class="sa-ai-reason-box">
        <div class="sa-ai-reason-header">
          <div style="display: flex; align-items: center; gap: 0.35rem;">
            <i data-lucide="sparkles" class="text-amber" style="width: 15px; height: 15px;"></i>
            <strong>${isHi ? "यह योजना आपके लिए क्यों उपयोगी है:" : "Why this scheme may be relevant to you:"}</strong>
          </div>
          <span class="sa-match-badge">${score}% Match</span>
        </div>
        <p class="sa-ai-reason-text">${reason}</p>
      </div>

      <!-- Main Benefit Highlight Box -->
      <div class="sa-card-benefit-box">
        <span class="sa-benefit-label">${isHi ? "मुख्य लाभ:" : "Main Benefit:"}</span>
        <strong class="sa-benefit-value">${benefit}</strong>
      </div>

      <!-- Eligibility Snippet -->
      <div class="sa-card-snippet-row">
        <span class="sa-snippet-lbl">${isHi ? "पात्रता:" : "Eligibility:"}</span>
        <span class="sa-snippet-val">${elig}</span>
      </div>

      <!-- Required Documents Preview -->
      <div class="sa-card-docs-row">
        <span class="sa-snippet-lbl">${isHi ? "कागजात:" : "Documents:"}</span>
        <div class="sa-docs-chips">
          ${docs.slice(0, 3).map(d => `<span class="sa-doc-chip">${d}</span>`).join('')}
          ${docs.length > 3 ? `<span class="sa-doc-chip more">+${docs.length - 3}</span>` : ''}
        </div>
      </div>

      <!-- Trust Verification & Date Footer -->
      <div class="sa-card-trust-row">
        <div class="sa-trust-label">
          <i data-lucide="shield-check" class="text-success" style="width: 14px; height: 14px;"></i>
          <span>${isHi ? "सत्यापित स्रोत: सरकारी पोर्टल" : "Verified Source: Official Portal"}</span>
        </div>
        <span class="sa-last-updated">${isHi ? "अपडेट:" : "Updated:"} ${sch.last_updated}</span>
      </div>

      <!-- Action Buttons Row -->
      <div class="sa-card-actions">
        <button type="button" class="btn btn-secondary btn-sm sa-btn-details" onclick="openSchemeDetailModal('${sch.scheme_id}')">
          <i data-lucide="file-text"></i> ${isHi ? "पूरी जानकारी" : "View Details"}
        </button>
        <button type="button" class="btn btn-secondary btn-sm sa-btn-eligibility" onclick="openEligibilityChecker('${sch.scheme_id}')">
          <i data-lucide="user-check"></i> ${isHi ? "पात्रता जांचें" : "Check Eligibility"}
        </button>
        <a href="${sch.official_url}" target="_blank" rel="noopener" class="btn btn-primary btn-sm sa-btn-apply">
          <i data-lucide="external-link"></i> ${isHi ? "आवेदन करें" : "Apply / Portal"}
        </a>
      </div>
    </div>
  `;
}

// Backward compatibility alias
function renderSchemes() {
  renderSchemeAdvisory();
}

/**
 * Interactive Eligibility Checker Modal Engine
 */
function openEligibilityChecker(schemeId) {
  const isHi = AppState.lang === 'hi';
  const scheme = (AGRI_DATA.schemeAdvisoryDatabase || []).find(s => s.scheme_id === schemeId);
  if (!scheme) return;

  AppState.selectedSchemeForElig = scheme;

  const titleEl = document.getElementById('eligModalSchemeTitle');
  const govLevelEl = document.getElementById('eligModalGovLevel');
  const questionsContainer = document.getElementById('eligQuestionsList');
  const applyBtn = document.getElementById('eligApplyPortalBtn');
  const detailsBtn = document.getElementById('eligViewDetailsBtn');

  if (titleEl) {
    titleEl.innerText = isHi 
      ? `पात्रता जांच: ${scheme.scheme_name_hindi}`
      : `Check Eligibility: ${scheme.scheme_name}`;
  }

  if (govLevelEl) {
    govLevelEl.innerText = scheme.government_level === 'Central'
      ? (isHi ? 'केंद्र सरकार की योजना' : 'Central Government Scheme')
      : (isHi ? 'राज्य सरकार की योजना' : 'State Government Scheme');
  }

  if (applyBtn) applyBtn.href = scheme.official_url;
  if (detailsBtn) {
    detailsBtn.onclick = () => {
      closeModal('schemeEligibilityModal');
      openSchemeDetailModal(scheme.scheme_id);
    };
  }

  // Build the 4-5 tailored questions with profile pre-filled values
  const profile = AppState.farmerProfile || AGRI_DATA.demoFarmer;
  const c = scheme.criteria || {};

  const q1 = {
    id: 'q_land',
    labelEn: "Do you have agricultural landholding registered in your family's name?",
    labelHi: "क्या आपके या आपके परिवार के नाम कृषि योग्य भूमि दर्ज है?",
    type: 'boolean',
    defaultVal: profile.hasLandRecord !== false,
    required: c.land_ownership_required !== false
  };

  const q2 = {
    id: 'q_land_size',
    labelEn: `What is your agricultural land holding size?`,
    labelHi: `आपकी कृषि भूमि (जोत का आकार) कितना है?`,
    type: 'select',
    options: [
      { val: 'marginal', textEn: 'Marginal (<2.5 Acres / <1 Ha)', textHi: 'सीमांत किसान (<2.5 एकड़ / <1 हे.)' },
      { val: 'small', textEn: 'Small (2.5 - 5 Acres / 1 - 2 Ha)', textHi: 'लघु किसान (2.5 - 5 एकड़ / 1 - 2 हे.)' },
      { val: 'medium', textEn: 'Medium (5 - 25 Acres / 2 - 10 Ha)', textHi: 'मध्यम किसान (5 - 25 एकड़ / 2 - 10 हे.)' },
      { val: 'large', textEn: 'Large (>25 Acres / >10 Ha)', textHi: 'बड़े किसान (>25 एकड़ / >10 हे.)' },
      { val: 'tenant', textEn: 'Tenant / Sharecropper (No land registered)', textHi: 'बटाईदार / किरायेदार (भूमि स्वामित्व नहीं)' }
    ],
    defaultVal: profile.farmerCategory === 'marginal' ? 'marginal' : (profile.farmerCategory === 'small' ? 'small' : 'medium')
  };

  const q3 = {
    id: 'q_age',
    labelEn: "What is your age bracket?",
    labelHi: "आपकी आयु सीमा क्या है?",
    type: 'select',
    options: [
      { val: '18-40', textEn: '18 to 40 Years', textHi: '18 से 40 वर्ष' },
      { val: '41-60', textEn: '41 to 60 Years', textHi: '41 से 60 वर्ष' },
      { val: 'above_60', textEn: 'Above 60 Years', textHi: '60 वर्ष से अधिक' }
    ],
    defaultVal: profile.ageGroup || '18-40'
  };

  const q4 = {
    id: 'q_dbt',
    labelEn: "Do you have an active bank account linked to Aadhaar & NPCI (DBT enabled)?",
    labelHi: "क्या आपके पास आधार व NPCI से लिंक सक्रिय बैंक खाता (डीबीटी सक्षम) है?",
    type: 'boolean',
    defaultVal: profile.hasAadhaarBankLinked !== false,
    required: c.dbt_bank_required !== false
  };

  const q5 = {
    id: 'q_state',
    labelEn: "Which state is your farm located in?",
    labelHi: "आपकी कृषि भूमि किस राज्य में स्थित है?",
    type: 'select',
    options: [
      { val: 'Uttar Pradesh', textEn: 'Uttar Pradesh', textHi: 'उत्तर प्रदेश' },
      { val: 'Madhya Pradesh', textEn: 'Madhya Pradesh', textHi: 'मध्य प्रदेश' },
      { val: 'Punjab', textEn: 'Punjab', textHi: 'पंजाब' },
      { val: 'Rajasthan', textEn: 'Rajasthan', textHi: 'राजस्थान' },
      { val: 'Other', textEn: 'Other State', textHi: 'अन्य राज्य' }
    ],
    defaultVal: profile.state || 'Uttar Pradesh'
  };

  const questions = [q1, q2, q3, q4, q5];

  if (questionsContainer) {
    questionsContainer.innerHTML = questions.map((q, idx) => {
      let inputHtml = '';
      if (q.type === 'boolean') {
        inputHtml = `
          <div class="elig-q-choice-row">
            <label class="elig-radio-label">
              <input type="radio" name="${q.id}" value="yes" ${q.defaultVal ? 'checked' : ''}>
              <span>${isHi ? "हाँ (Yes)" : "Yes"}</span>
            </label>
            <label class="elig-radio-label">
              <input type="radio" name="${q.id}" value="no" ${!q.defaultVal ? 'checked' : ''}>
              <span>${isHi ? "नहीं (No)" : "No"}</span>
            </label>
          </div>
        `;
      } else if (q.type === 'select') {
        inputHtml = `
          <select class="form-select elig-q-select" name="${q.id}">
            ${q.options.map(opt => `
              <option value="${opt.val}" ${opt.val === q.defaultVal ? 'selected' : ''}>
                ${isHi ? opt.textHi : opt.textEn}
              </option>
            `).join('')}
          </select>
        `;
      }

      return `
        <div class="elig-question-item">
          <div class="elig-q-number">${idx + 1}</div>
          <div class="elig-q-body">
            <label class="elig-q-label">${isHi ? q.labelHi : q.labelEn}</label>
            ${inputHtml}
          </div>
        </div>
      `;
    }).join('');

    // Attach change listeners to questions to immediately re-evaluate
    questionsContainer.querySelectorAll('input, select').forEach(input => {
      input.addEventListener('change', () => evaluateEligibility(scheme));
    });
  }

  evaluateEligibility(scheme);
  openModal('schemeEligibilityModal');
  initIcons();
}

/**
 * Runs rule-based checks on eligibility form inputs against scheme requirements.
 */
function evaluateEligibility(scheme) {
  const isHi = AppState.lang === 'hi';
  const c = scheme.criteria || {};

  // Extract form values
  const qLand = document.querySelector('input[name="q_land"]:checked')?.value === 'yes';
  const qLandSize = document.querySelector('select[name="q_land_size"]')?.value || 'small';
  const qAge = document.querySelector('select[name="q_age"]')?.value || '18-40';
  const qDbt = document.querySelector('input[name="q_dbt"]:checked')?.value === 'yes';
  const qState = document.querySelector('select[name="q_state"]')?.value || 'Uttar Pradesh';

  const checks = [];

  // Check 1: Land Ownership
  if (c.land_ownership_required) {
    checks.push({
      name: isHi ? "भूमि स्वामित्व" : "Land Ownership",
      passed: qLand === true,
      reasonEn: qLand ? "Agricultural landholding verified in family records" : "Land title in applicant's name is strictly required",
      reasonHi: qLand ? "भू-अभिलेख में कृषि भूमि दर्ज है" : "आवेदक के नाम कृषि भूमि का होना अनिवार्य है"
    });
  }

  // Check 2: Land size limits (e.g. for PM-KMY max 2 ha)
  if (c.max_land_ha && c.max_land_ha <= 2.0) {
    const isUnder2Ha = qLandSize === 'marginal' || qLandSize === 'small';
    checks.push({
      name: isHi ? "अधिकतम भूमि सीमा (<2 हेक्टेयर)" : "Land Size Limit (<2 Hectares)",
      passed: isUnder2Ha,
      reasonEn: isUnder2Ha ? "Landholding is under 2 Hectares / 5 Acres" : "Landholding exceeds 2 Hectares small farmer limit",
      reasonHi: isUnder2Ha ? "भूमि 2 हेक्टेयर / 5 एकड़ से कम है" : "भूमि 2 हेक्टेयर से अधिक है (केवल लघु व सीमांत किसान पात्र)"
    });
  }

  // Check 3: Age limit (e.g. for PM-KMY 18-40)
  if (c.max_age && c.max_age <= 40) {
    const isUnder40 = qAge === '18-40';
    checks.push({
      name: isHi ? "आयु सीमा (18 से 40 वर्ष)" : "Age Eligibility (18-40 Years)",
      passed: isUnder40,
      reasonEn: isUnder40 ? "Age is within eligible 18-40 bracket" : "Applicant must be between 18 and 40 years for pension entry",
      reasonHi: isUnder40 ? "आयु 18 से 40 वर्ष के बीच है" : "पेंशन योजना में प्रवेश हेतु आयु 18 से 40 वर्ष होनी चाहिए"
    });
  }

  // Check 4: Bank Account DBT
  if (c.dbt_bank_required) {
    checks.push({
      name: isHi ? "आधार लिंक बैंक खाता (DBT)" : "Aadhaar Linked Bank Account (DBT)",
      passed: qDbt === true,
      reasonEn: qDbt ? "NPCI-seeded bank account available for DBT" : "Direct Benefit Transfer requires Aadhaar bank seeding",
      reasonHi: qDbt ? "डीबीटी सक्रिय बैंक खाता मौजूद है" : "सरकारी सब्सिडी पाने हेतु बैंक में आधार लिंक जरूरी है"
    });
  }

  // Check 5: State Eligibility
  if (scheme.state !== 'All-India' && scheme.state !== 'Pan-India') {
    const isStateMatch = (scheme.state || '').toLowerCase() === qState.toLowerCase();
    checks.push({
      name: isHi ? `राज्य पात्रता (${scheme.state})` : `State Eligibility (${scheme.state})`,
      passed: isStateMatch,
      reasonEn: isStateMatch ? `Farm is located in notified state (${scheme.state})` : `This scheme is currently restricted to ${scheme.state}`,
      reasonHi: isStateMatch ? `कृषि भूमि संबंधित राज्य (${scheme.state}) में स्थित है` : `यह योजना केवल ${scheme.state} के किसानों के लिए है`
    });
  }

  const allPassed = checks.every(chk => chk.passed);

  // Update Result Banner
  const banner = document.getElementById('eligResultBanner');
  const iconBox = document.getElementById('eligResultIconBox');
  const icon = document.getElementById('eligResultIcon');
  const heading = document.getElementById('eligResultHeading');
  const sub = document.getElementById('eligResultSub');
  const breakdown = document.getElementById('eligCriteriaBreakdown');

  if (banner && heading && sub) {
    if (allPassed) {
      banner.className = 'elig-result-banner banner-success';
      if (iconBox) iconBox.className = 'elig-result-icon-box icon-success';
      if (icon) icon.setAttribute('data-lucide', 'check-circle-2');
      heading.innerText = isHi 
        ? "✅ संभावित पात्र – आधिकारिक आवश्यकताओं की जांच करें"
        : "✅ Potentially Eligible – Check official requirements";
      sub.innerText = isHi 
        ? "आपकी दी गई जानकारी के अनुसार आप इस योजना की प्राथमिक शर्तों को पूरा करते हैं।"
        : "Based on the information provided, you fulfill the preliminary eligibility criteria.";
    } else {
      banner.className = 'elig-result-banner banner-warning';
      if (iconBox) iconBox.className = 'elig-result-icon-box icon-warning';
      if (icon) icon.setAttribute('data-lucide', 'alert-triangle');
      heading.innerText = isHi 
        ? "⚠️ दी गई जानकारी के अनुसार शायद पात्र नहीं हैं"
        : "⚠️ May not be eligible based on the information provided";
      sub.innerText = isHi 
        ? "एक या अधिक शर्तें पूरी नहीं हो रही हैं। कृपया नीचे दिए गए बिंदुओं की जांच करें।"
        : "One or more conditions were not met. Check the breakdown below for alternatives.";
    }
  }

  // Render criteria check breakdown
  if (breakdown) {
    breakdown.innerHTML = `
      <h5 style="font-weight: 800; font-size: 0.95rem; margin-bottom: 0.75rem; color: var(--primary-900);">
        ${isHi ? "शर्तों का विस्तृत विश्लेषण:" : "Detailed Criteria Breakdown:"}
      </h5>
      <div class="elig-checks-grid">
        ${checks.map(chk => `
          <div class="elig-check-item ${chk.passed ? 'check-pass' : 'check-fail'}">
            <i data-lucide="${chk.passed ? 'check' : 'x'}" class="elig-check-status-icon"></i>
            <div>
              <strong>${chk.name}</strong>
              <p>${isHi ? chk.reasonHi : chk.reasonEn}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  initIcons();
}

/**
 * Full Scheme Detail Modal Engine
 */
function openSchemeDetailModal(schemeId) {
  const isHi = AppState.lang === 'hi';
  const scheme = (AGRI_DATA.schemeAdvisoryDatabase || []).find(s => s.scheme_id === schemeId);
  if (!scheme) return;

  AppState.selectedSchemeForDetail = scheme;

  const titleEl = document.getElementById('detailSchemeTitle');
  const deptEl = document.getElementById('detailDeptName');
  const govBadge = document.getElementById('detailGovLevelBadge');
  const catBadge = document.getElementById('detailCategoryBadge');
  const statusBadge = document.getElementById('detailStatusBadge');
  const benefitStat = document.getElementById('detailBenefitStat');
  const targetStat = document.getElementById('detailTargetStat');
  const modeStat = document.getElementById('detailModeStat');

  if (titleEl) titleEl.innerText = isHi ? scheme.scheme_name_hindi : scheme.scheme_name;
  if (deptEl) deptEl.innerText = isHi ? scheme.department_hindi : scheme.department;

  if (govBadge) {
    govBadge.innerText = scheme.government_level === 'Central'
      ? (isHi ? 'केंद्र सरकार' : 'Central Government')
      : (isHi ? 'राज्य सरकार' : 'State Government');
  }

  if (catBadge) catBadge.innerText = scheme.scheme_category;
  if (statusBadge) statusBadge.innerText = isHi ? scheme.status_hindi : scheme.status;

  if (benefitStat) benefitStat.innerText = isHi ? scheme.benefits_hindi.slice(0, 45) + '...' : scheme.benefits.slice(0, 45) + '...';
  if (targetStat) targetStat.innerText = scheme.farmer_categories.includes('small') ? (isHi ? 'लघु एवं सीमांत' : 'Small & Marginal') : (isHi ? 'सभी किसान' : 'All Farmers');
  if (modeStat) modeStat.innerText = isHi ? 'ऑनलाइन / सीएससी' : 'Online / CSC';

  // Overview Pane
  const descEl = document.getElementById('detailDescText');
  const aiRelevanceText = document.getElementById('detailAiRelevanceText');
  if (descEl) descEl.innerText = isHi ? scheme.description_hindi : scheme.description;
  if (aiRelevanceText) {
    const relevance = calculateSchemeRelevance(scheme, AppState.farmerProfile || AGRI_DATA.demoFarmer);
    aiRelevanceText.innerText = isHi ? relevance.explanationHi : relevance.explanationEn;
  }

  // Benefits Pane
  const benefitLongEl = document.getElementById('detailBenefitLongText');
  if (benefitLongEl) benefitLongEl.innerText = isHi ? scheme.benefits_hindi : scheme.benefits;

  // Eligibility Pane
  const eligEl = document.getElementById('detailEligibilityText');
  if (eligEl) eligEl.innerText = isHi ? scheme.eligibility_hindi : scheme.eligibility;

  const checkEligBtn = document.getElementById('detailCheckEligNowBtn');
  if (checkEligBtn) {
    checkEligBtn.onclick = () => {
      closeModal('schemeDetailModal');
      openEligibilityChecker(scheme.scheme_id);
    };
  }

  // Documents Pane
  const docsListEl = document.getElementById('detailDocsList');
  const docs = (isHi ? scheme.documents_required_hindi : scheme.documents_required) || [];
  if (docsListEl) {
    docsListEl.innerHTML = docs.map(d => `
      <li>
        <i data-lucide="check-circle" class="text-success" style="width: 18px; height: 18px; flex-shrink: 0;"></i>
        <span>${d}</span>
      </li>
    `).join('');
  }

  // How to Apply Pane (Step-by-Step Flow)
  const processFlowEl = document.getElementById('detailProcessFlow');
  if (processFlowEl) {
    const rawProcess = isHi ? scheme.application_process_hindi : scheme.application_process;
    processFlowEl.innerHTML = `
      <div class="detail-step-card">
        <div class="detail-step-num">1</div>
        <div>
          <strong>${isHi ? "दस्तावेज़ तैयार करें" : "Prepare Required Documents"}</strong>
          <p>${isHi ? "आधार कार्ड, खतौनी और बैंक पासबुक (डीबीटी सक्रिय) की स्पष्ट प्रतियां तैयार रखें।" : "Keep your Aadhaar, Land Record (Khatauni), and DBT active bank passbook ready."}</p>
        </div>
      </div>
      <div class="detail-step-card">
        <div class="detail-step-num">2</div>
        <div>
          <strong>${isHi ? "आधिकारिक पोर्टल पर जाएं" : "Access the Official Gateway"}</strong>
          <p>${rawProcess}</p>
        </div>
      </div>
      <div class="detail-step-card">
        <div class="detail-step-num">3</div>
        <div>
          <strong>${isHi ? "सत्यापन एवं पावती" : "Verification & Receipt"}</strong>
          <p>${isHi ? "आवेदन जमा करने के बाद संदर्भ रसीद (Acknowledgement Receipt) प्राप्त करें और स्थिति ट्रैक करें।" : "Receive your tracked Application Reference ID and verify status via SMS or portal."}</p>
        </div>
      </div>
    `;
  }

  // Contact Pane
  const datesEl = document.getElementById('detailDatesText');
  const helplineEl = document.getElementById('detailHelplineText');
  const sourceEl = document.getElementById('detailSourceText');
  const updatedEl = document.getElementById('detailLastUpdatedText');
  if (datesEl) datesEl.innerText = `${scheme.start_date} - ${scheme.end_date}`;
  if (helplineEl) helplineEl.innerText = scheme.helpline;
  if (sourceEl) sourceEl.innerText = scheme.source;
  if (updatedEl) updatedEl.innerText = scheme.last_updated;

  // External Portal Button
  const applyBtn = document.getElementById('detailOfficialApplyBtn');
  if (applyBtn) applyBtn.href = scheme.official_url;

  // Tab button switching
  const tabBtns = document.querySelectorAll('.detail-tab-btn');
  const tabPanes = document.querySelectorAll('.detail-tab-pane');
  tabBtns.forEach(btn => {
    btn.onclick = () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const targetPane = document.getElementById(`pane-${btn.getAttribute('data-tab')}`);
      if (targetPane) targetPane.classList.add('active');
      initIcons();
    };
  });

  openModal('schemeDetailModal');
  initIcons();
}

/**
 * Farmer Personalization Form & State Manager
 */
function setupFarmerProfileModal() {
  const saveBtn = document.getElementById('profModalSaveBtn');
  const loadDemoBtn = document.getElementById('profModalLoadDemoBtn');

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const state = document.getElementById('profModalState')?.value || 'Uttar Pradesh';
      const district = document.getElementById('profModalDistrict')?.value.trim() || 'Banda';
      const ageGroup = document.getElementById('profModalAgeGroup')?.value || '18-40';
      const landSize = document.getElementById('profModalLandSize')?.value || 'small';
      const irrigation = document.getElementById('profModalIrrigation')?.value || 'tube_well';
      const category = document.getElementById('profModalCategory')?.value || 'small';
      const activity = document.getElementById('profModalActivity')?.value || 'crop';

      // Gather crops
      const cropChecks = document.querySelectorAll('input[name="profCrops"]:checked');
      const crops = Array.from(cropChecks).map(c => c.value);
      if (crops.length === 0) crops.push('wheat');

      // Update AppState.farmerProfile
      AppState.farmerProfile = {
        name: AppState.farmerProfile.name || "Aditya",
        hindiName: AppState.farmerProfile.hindiName || "आदित्य",
        mobile: AppState.farmerProfile.mobile || "+91 98765 43210",
        state: state,
        district: district,
        village: AppState.farmerProfile.village || "Tindwari",
        pinCode: AppState.farmerProfile.pinCode || "210001",
        ageGroup: ageGroup,
        landHoldingAcres: landSize === 'marginal' ? 1.5 : (landSize === 'small' ? 2.5 : 8.0),
        landHolding: landSize === 'marginal' ? '1.5 Acres (<1 Ha)' : (landSize === 'small' ? '2.5 Acres (1.01 Ha)' : '8 Acres (3.2 Ha)'),
        farmerCategory: category,
        crops: crops,
        primaryCrop: crops.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', '),
        irrigation: irrigation,
        farmingActivity: activity,
        hasAadhaarBankLinked: true,
        hasLandRecord: landSize !== 'tenant'
      };

      closeModal('farmerProfileModal');
      renderProfileBar();
      renderSchemeAdvisory();
      renderDocumentLocker();
      if (AppState.isLoggedIn) renderDashboard();

      const isHi = AppState.lang === 'hi';
      showToast(
        isHi 
          ? `किसान प्रोफाइल सहेजी गई! ${district} (${state}) के अनुसार योजनाएं अपडेट हुईं।`
          : `Profile updated! Schemes re-calculated for ${district} (${state}).`,
        "success"
      );
    });
  }

  if (loadDemoBtn) {
    loadDemoBtn.addEventListener('click', () => {
      AppState.farmerProfile = Object.assign({}, AGRI_DATA.demoFarmer);
      populateProfileModalFields();
      showToast(
        AppState.lang === 'hi' ? "डेमो प्रोफाइल (आदित्य - बांदा उ.प्र.) लोड की गई" : "Loaded demo profile for Aditya (Banda, UP)",
        "info"
      );
    });
  }
}

function populateProfileModalFields() {
  const p = AppState.farmerProfile || AGRI_DATA.demoFarmer;
  const stateSel = document.getElementById('profModalState');
  const distInput = document.getElementById('profModalDistrict');
  const ageSel = document.getElementById('profModalAgeGroup');
  const landSel = document.getElementById('profModalLandSize');
  const irrigSel = document.getElementById('profModalIrrigation');
  const catSel = document.getElementById('profModalCategory');
  const actSel = document.getElementById('profModalActivity');

  if (stateSel) stateSel.value = p.state || 'Uttar Pradesh';
  if (distInput) distInput.value = p.district || 'Banda';
  if (ageSel) ageSel.value = p.ageGroup || '18-40';
  if (landSel) landSel.value = p.farmerCategory === 'marginal' ? 'marginal' : (p.farmerCategory === 'small' ? 'small' : 'medium');
  if (irrigSel) irrigSel.value = p.irrigation || 'tube_well';
  if (catSel) catSel.value = p.farmerCategory || 'small';
  if (actSel) actSel.value = p.farmingActivity || 'crop';

  const crops = p.crops || ['wheat', 'mustard'];
  document.querySelectorAll('input[name="profCrops"]').forEach(chk => {
    chk.checked = crops.includes(chk.value);
  });
}

/**
 * Notifications Center & Alert System
 */
function setupNotifications() {
  const markAllBtn = document.getElementById('notifMarkAllReadBtn');
  const smsToggle = document.getElementById('notifSmsToggle');
  const navBtn = document.getElementById('navNotifBtn');
  const mobileBtn = document.getElementById('mobileNotifTrigger');

  if (navBtn) {
    navBtn.addEventListener('click', () => openModal('schemeNotificationsDrawer'));
  }
  if (mobileBtn) {
    mobileBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeMobileDrawer();
      openModal('schemeNotificationsDrawer');
    });
  }

  if (markAllBtn) {
    markAllBtn.addEventListener('click', () => {
      AppState.notifications.forEach(n => n.read = true);
      renderNotifications();
      updateNotifBadgeCounters();
      showToast(AppState.lang === 'hi' ? "सभी सूचनाएं पढ़ी हुई चिन्हित की गईं" : "All notifications marked as read", "info");
    });
  }

  if (smsToggle) {
    smsToggle.addEventListener('change', (e) => {
      AppState.smsNotificationsEnabled = e.target.checked;
      showToast(
        e.target.checked 
          ? (AppState.lang === 'hi' ? "एसएमएस व मोबाइल अलर्ट सक्रिय किए गए" : "SMS and mobile notifications enabled")
          : (AppState.lang === 'hi' ? "अलर्ट निष्क्रिय किए गए" : "Notifications disabled"),
        "info"
      );
    });
  }

  // Filter chips in drawer
  document.querySelectorAll('.notif-tab-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.notif-tab-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      AppState.notificationsFilter = chip.getAttribute('data-notif-filter') || 'all';
      renderNotifications();
    });
  });

  renderNotifications();
}

function renderNotifications() {
  const container = document.getElementById('notifListContainer');
  if (!container) return;

  const isHi = AppState.lang === 'hi';
  let notifs = AppState.notifications || [];

  if (AppState.notificationsFilter && AppState.notificationsFilter !== 'all') {
    notifs = notifs.filter(n => n.type === AppState.notificationsFilter);
  }

  if (notifs.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem 1rem; color: var(--text-muted);">
        <i data-lucide="bell-off" style="width: 36px; height: 36px; margin: 0 auto 0.5rem auto;"></i>
        <p>${isHi ? "इस श्रेणी में कोई नई सूचना नहीं है" : "No notifications in this category"}</p>
      </div>
    `;
  } else {
    container.innerHTML = notifs.map(n => {
      let icon = 'bell';
      let typeBadgeClass = 'badge-demo';
      if (n.type === 'subsidy') { icon = 'badge-percent'; typeBadgeClass = 'badge-official'; }
      else if (n.type === 'deadline') { icon = 'calendar'; typeBadgeClass = 'badge-urgent'; }
      else if (n.type === 'announcement') { icon = 'megaphone'; typeBadgeClass = 'badge-demo'; }

      return `
        <div class="notif-item ${n.read ? 'read' : 'unread'}" onclick="handleNotifClick('${n.id}')">
          <div class="notif-icon-box">
            <i data-lucide="${icon}"></i>
          </div>
          <div class="notif-content-box">
            <div class="notif-title-row">
              <h5 class="notif-title">${isHi ? n.titleHi : n.titleEn}</h5>
              <span class="notif-date">${n.date}</span>
            </div>
            <p class="notif-desc">${isHi ? n.descHi : n.descEn}</p>
            <div class="notif-footer-row">
              <span class="badge-tag ${typeBadgeClass}" style="font-size: 0.72rem; padding: 2px 6px;">${n.type.toUpperCase()}</span>
              ${n.schemeId ? `
                <button type="button" class="btn btn-secondary btn-sm" style="font-size: 0.75rem; padding: 3px 8px;" onclick="event.stopPropagation(); closeModal('schemeNotificationsDrawer'); openSchemeDetailModal('${n.schemeId}');">
                  ${isHi ? "योजना देखें →" : "View Scheme →"}
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  updateNotifBadgeCounters();
  initIcons();
}

function handleNotifClick(notifId) {
  const notif = AppState.notifications.find(n => n.id === notifId);
  if (notif) {
    notif.read = true;
    renderNotifications();
    updateNotifBadgeCounters();
  }
}

function updateNotifBadgeCounters() {
  const unreadCount = (AppState.notifications || []).filter(n => !n.read).length;
  const navBadge = document.getElementById('notifBadgeCount');
  const saPill = document.getElementById('saNotifCountPill');

  if (navBadge) {
    navBadge.innerText = unreadCount;
    navBadge.style.display = unreadCount > 0 ? 'flex' : 'none';
  }
  if (saPill) {
    saPill.innerText = unreadCount;
    saPill.style.display = unreadCount > 0 ? 'inline-block' : 'none';
  }
}

/**
 * Farmer Document Locker & Readiness Tracker
 */
function setupDocumentLocker() {
  renderDocumentLocker();
}

function renderDocumentLocker() {
  const container = document.getElementById('docsCardsGrid');
  const titleEl = document.getElementById('docsReadinessTitle');
  const percentText = document.getElementById('docsPercentText');
  const bar = document.getElementById('docsProgressBar');

  if (!container) return;

  const isHi = AppState.lang === 'hi';
  const masterDocs = AGRI_DATA.documentLockerMaster || [];
  const readyList = AppState.documentReadiness || [];

  const readyCount = masterDocs.filter(d => readyList.includes(d.id)).length;
  const percent = Math.round((readyCount / masterDocs.length) * 100);

  if (titleEl) {
    titleEl.innerText = isHi 
      ? `आपकी योजना तैयारी: ${masterDocs.length} में से ${readyCount} दस्तावेज़ तैयार`
      : `Your Scheme Readiness: ${readyCount} of ${masterDocs.length} Documents Ready`;
  }

  if (percentText) percentText.innerText = `${percent}% ${isHi ? 'तैयार' : 'Ready'}`;
  if (bar) bar.style.width = `${percent}%`;

  container.innerHTML = masterDocs.map(doc => {
    const isReady = readyList.includes(doc.id);
    return `
      <div class="doc-item-card ${isReady ? 'doc-ready' : 'doc-pending'}">
        <div class="doc-card-top">
          <div class="doc-icon-wrap">
            <i data-lucide="${doc.icon}"></i>
          </div>
          <span class="badge-tag ${isReady ? 'badge-official' : 'badge-demo'}">
            ${isReady ? (isHi ? 'तैयार है' : 'Ready') : (isHi ? 'अपेक्षित' : 'Action Needed')}
          </span>
        </div>
        <h4 class="doc-title">${isHi ? doc.nameHi : doc.nameEn}</h4>
        <p class="doc-desc">${isHi ? doc.descHi : doc.descEn}</p>
        <div class="doc-unlocked-row">
          <span class="doc-unlocked-lbl">${isHi ? "पात्र योजनाएं:" : "Required for:"}</span>
          <span class="doc-unlocked-val">${doc.requiredFor.map(id => id.replace('_', ' ').toUpperCase()).slice(0, 3).join(', ')}...</span>
        </div>
        <div class="doc-card-action">
          <label class="sa-checkbox-label">
            <input type="checkbox" ${isReady ? 'checked' : ''} onchange="toggleDocumentReady('${doc.id}', this.checked)">
            <span>${isHi ? "मेरे पास यह दस्तावेज़ है" : "I have this document ready"}</span>
          </label>
        </div>
      </div>
    `;
  }).join('');

  initIcons();
}

function toggleDocumentReady(docId, isChecked) {
  if (isChecked) {
    if (!AppState.documentReadiness.includes(docId)) {
      AppState.documentReadiness.push(docId);
    }
  } else {
    AppState.documentReadiness = AppState.documentReadiness.filter(id => id !== docId);
  }
  renderDocumentLocker();
  showToast(
    AppState.lang === 'hi' ? "दस्तावेज़ स्थिति अपडेट हुई" : "Document readiness status updated",
    "info"
  );
}

// ==========================================
// Mandi Intelligence Explorer
// ==========================================
function setupMandiExplorer() {
  const cropFilter = document.getElementById('mandiCropFilter');
  if (cropFilter) {
    cropFilter.addEventListener('change', () => {
      renderMandiPrices();
    });
  }
}

function renderMandiPrices() {
  const tableBody = document.getElementById('mandiTableBody');
  const cropFilter = document.getElementById('mandiCropFilter');
  if (!tableBody) return;

  const isHi = AppState.lang === 'hi';
  let data = AGRI_DATA.mandiPrices;

  if (cropFilter && cropFilter.value !== 'all') {
    data = data.filter(d => d.cropEn.toLowerCase().includes(cropFilter.value.toLowerCase()));
  }

  tableBody.innerHTML = data.map(m => {
    const trendClass = m.trend === 'up' ? 'trend-up' : (m.trend === 'down' ? 'trend-down' : 'trend-stable');
    const trendIcon = m.trend === 'up' ? 'trending-up' : (m.trend === 'down' ? 'trending-down' : 'minus');

    return `
      <tr>
        <td>
          <strong>${isHi ? m.cropHi : m.cropEn}</strong>
          <span style="display: block; font-size: 0.76rem; color: var(--text-muted);">${m.variety}</span>
        </td>
        <td>
          <span style="font-weight: 700;">${isHi ? m.mandiHi : m.mandiEn}</span>
          <span style="display: block; font-size: 0.74rem; color: var(--text-muted);">${m.district}, ${m.state}</span>
        </td>
        <td>₹${m.minPrice.toLocaleString()}</td>
        <td><span class="price-tag">₹${m.modalPrice.toLocaleString()}</span></td>
        <td>₹${m.maxPrice.toLocaleString()}</td>
        <td>${m.arrivalsQtl} Qtl</td>
        <td>
          <span class="trend-badge ${trendClass}">
            <i data-lucide="${trendIcon}" style="width: 14px; height: 14px;"></i>
            ${m.trendDiff}
          </span>
        </td>
        <td>
          <a href="https://enam.gov.in/" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">
            <i data-lucide="external-link"></i> e-NAM
          </a>
        </td>
      </tr>
    `;
  }).join('');

  initIcons();
}

// ==========================================
// Weather & Agro-Risk Alerts View
// ==========================================
function setupWeatherView() {
  renderWeatherTelemetry();
}

function renderWeatherTelemetry() {
  const wx = AGRI_DATA.weatherInfo;
  const isHi = AppState.lang === 'hi';

  const locEl = document.getElementById('wxLocationTitle');
  const tempEl = document.getElementById('wxTempLarge');
  const condEl = document.getElementById('wxConditionText');
  const humEl = document.getElementById('wxHumidityVal');
  const rainEl = document.getElementById('wxRainVal');
  const windEl = document.getElementById('wxWindVal');
  const alertBox = document.getElementById('wxAgroAlertBox');
  const alertTitle = document.getElementById('wxAlertTitle');
  const alertDesc = document.getElementById('wxAlertDesc');
  const forecastGrid = document.getElementById('wxForecastDaysGrid');

  if (locEl) locEl.innerText = isHi ? wx.locationHi : wx.locationEn;
  if (tempEl) tempEl.innerText = `${wx.temp}°C`;
  if (condEl) condEl.innerText = isHi ? wx.conditionHi : wx.conditionEn;
  if (humEl) humEl.innerText = wx.humidity;
  if (rainEl) rainEl.innerText = wx.rainProb;
  if (windEl) windEl.innerText = wx.windSpeed;

  if (alertBox) {
    if (wx.hasRiskAlert) {
      alertBox.style.display = 'flex';
      if (alertTitle) alertTitle.innerText = isHi ? wx.alertTitleHi : wx.alertTitleEn;
      if (alertDesc) alertDesc.innerText = isHi ? wx.alertDetailsHi : wx.alertDetailsEn;
    } else {
      alertBox.style.display = 'none';
    }
  }

  if (forecastGrid) {
    forecastGrid.innerHTML = wx.forecast.map(f => {
      let icon = "sun";
      if (f.condition === 'rain') icon = "cloud-rain";
      else if (f.condition === 'cloudy') icon = "cloud";

      return `
        <div class="forecast-day-card">
          <div class="forecast-day-name">${isHi ? f.dayHi : f.dayEn}</div>
          <i data-lucide="${icon}" style="width: 28px; height: 28px; margin: 0 auto; color: var(--primary-600);"></i>
          <div class="forecast-day-temp">${f.maxTemp}° / ${f.minTemp}°</div>
          <div style="font-size: 0.75rem; color: var(--accent-blue); font-weight: 700; margin-top: 2px;">${f.rainProb} Rain</div>
          <div class="forecast-day-advisory">${isHi ? f.advisoryHi : f.advisoryEn}</div>
        </div>
      `;
    }).join('');
  }

  initIcons();
}

// ==========================================
// PMFBY Crop Insurance Calculator
// ==========================================
function setupInsuranceCalculator() {
  const calcBtn = document.getElementById('insCalcBtn');
  const seasonSelect = document.getElementById('insSeasonSelect');
  const areaInput = document.getElementById('insAreaInput');
  const sumInsuredInput = document.getElementById('insSumInsuredInput');

  if (calcBtn) {
    calcBtn.addEventListener('click', () => {
      const season = seasonSelect ? seasonSelect.value : 'rabi';
      const area = parseFloat(areaInput ? areaInput.value : 1.0) || 1.0;
      const sumInsuredPerHa = parseFloat(sumInsuredInput ? sumInsuredInput.value : 72000) || 72000;

      let farmerRate = 0.015; // 1.5% Rabi
      if (season === 'kharif') farmerRate = 0.020; // 2.0%
      else if (season === 'commercial') farmerRate = 0.050; // 5.0%

      const totalSumInsured = sumInsuredPerHa * area;
      const farmerPremium = totalSumInsured * farmerRate;
      const totalActuarialRate = 0.12; // Example 12% actuarial rate
      const totalPremium = totalSumInsured * totalActuarialRate;
      const govtSubsidy = totalPremium - farmerPremium;

      const totalSumEl = document.getElementById('insResTotalSum');
      const farmerShareEl = document.getElementById('insResFarmerShare');
      const govSubsidyEl = document.getElementById('insResGovSubsidy');

      if (totalSumEl) totalSumEl.innerText = `₹${Math.round(totalSumInsured).toLocaleString()}`;
      if (farmerShareEl) farmerShareEl.innerText = `₹${Math.round(farmerPremium).toLocaleString()}`;
      if (govSubsidyEl) govSubsidyEl.innerText = `₹${Math.round(govtSubsidy).toLocaleString()}`;

      showToast(
        AppState.lang === 'hi' 
          ? `प्रीमियम गणना पूरी: किसान अंश ₹${Math.round(farmerPremium)}`
          : `Calculated: Farmer share is ₹${Math.round(farmerPremium)}`,
        "success"
      );
    });
  }
}

// ==========================================
// Expert & KVK Connect
// ==========================================
function setupExpertConnect() {
  renderExperts();

  const sendQueryBtn = document.getElementById('expSendQueryBtn');
  if (sendQueryBtn) {
    sendQueryBtn.addEventListener('click', () => {
      openExpertCaseModal();
    });
  }

  const submitModalBtn = document.getElementById('expModalSubmitBtn');
  if (submitModalBtn) {
    submitModalBtn.addEventListener('click', () => {
      submitExpertCase();
    });
  }
}

function renderExperts() {
  const container = document.getElementById('expertDirectoryGrid');
  if (!container) return;

  const isHi = AppState.lang === 'hi';
  const experts = AGRI_DATA.expertDirectory;

  container.innerHTML = experts.map(exp => {
    return `
      <div class="expert-card">
        <div class="expert-avatar">${exp.name.split(' ')[1]?.[0] || 'K'}</div>
        <div class="expert-details" style="flex-grow: 1;">
          <span class="badge-tag badge-official" style="margin-bottom: 0.25rem;">${isHi ? exp.statusHi : exp.statusEn}</span>
          <h4>${isHi ? exp.hindiName : exp.name}</h4>
          <div class="expert-specialty">${isHi ? exp.roleHi : exp.roleEn}</div>
          <div class="expert-institution">${isHi ? exp.institutionHi : exp.institutionEn}</div>
          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1rem;">
            <strong>${isHi ? "विशेषज्ञता:" : "Specialty:"}</strong> ${isHi ? exp.specialtyHi : exp.specialtyEn}
          </p>
          <div class="expert-actions">
            <button class="btn btn-primary btn-sm" onclick="openExpertCaseModal('${exp.name}')">
              <i data-lucide="send"></i> ${isHi ? "केस सारांश भेजें" : "Send Case File"}
            </button>
            <a href="tel:${exp.phone}" class="btn btn-secondary btn-sm">
              <i data-lucide="phone"></i> ${exp.phone}
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');

  initIcons();
}

function openExpertCaseModal(expertName = "Dr. R. K. Singh (KVK Banda)") {
  const modal = document.getElementById('expertCaseModal');
  const cropInput = document.getElementById('expCaseCrop');
  const locInput = document.getElementById('expCaseLoc');
  const issueInput = document.getElementById('expCaseIssue');
  const expertTargetInput = document.getElementById('expCaseTarget');

  if (cropInput) cropInput.value = `${AppState.currentCase.crop} (Sharbati)`;
  if (locInput) locInput.value = "Banda, Uttar Pradesh (Tindwari Village)";
  if (issueInput) {
    issueInput.value = AppState.lang === 'hi'
      ? "पीला रतुआ (Puccinia striiformis) - एआई विश्वास 94.2% • मौसम में 68% नमी के कारण तीव्र फैलाव का अंदेशा"
      : "Yellow Rust (Puccinia striiformis) - AI Confidence 94.2% • High humidity (68%) accelerating sporulation";
  }
  if (expertTargetInput) expertTargetInput.value = expertName;

  openModal('expertCaseModal');
  initIcons();
}

function submitExpertCase() {
  const refId = `KVK-BND-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  closeModal('expertCaseModal');

  const isHi = AppState.lang === 'hi';
  showToast(
    isHi 
      ? `केस सफलतापूर्वक भेजा गया! संदर्भ संख्या: ${refId}`
      : `Case sent to KVK Banda! Ref ID: ${refId}`,
    "success"
  );
}

// ==========================================
// Farmer Dashboard
// ==========================================
function renderDashboard() {
  const f = AppState.farmerProfile;
  const isHi = AppState.lang === 'hi';

  const nameEl = document.getElementById('dashFarmerGreeting');
  const locEl = document.getElementById('dashFarmerSub');

  if (nameEl) {
    nameEl.innerText = isHi 
      ? `नमस्ते, किसान भाई ${f.hindiName} 👋` 
      : `Namaste, Farmer ${f.name} 👋`;
  }

  if (locEl) {
    locEl.innerText = isHi
      ? `${f.village}, ${f.district}, ${f.state} • फसल: ${f.primaryCrop} (${f.landHolding})`
      : `${f.village}, ${f.district}, ${f.state} • Primary Crop: ${f.primaryCrop} (${f.landHolding})`;
  }

  initIcons();
}

// ==========================================
// Authentication (Mobile + OTP)
// ==========================================
function setupAuth() {
  const sendOtpBtn = document.getElementById('authSendOtpBtn');
  const verifyOtpBtn = document.getElementById('authVerifyOtpBtn');
  const quickDemoBtn = document.getElementById('authQuickDemoBtn');
  const otpSection = document.getElementById('authOtpSection');
  const phoneInput = document.getElementById('authPhoneInput');
  const timerText = document.getElementById('authOtpTimer');
  const logoutBtn = document.getElementById('dashLogoutBtn');

  if (sendOtpBtn) {
    sendOtpBtn.addEventListener('click', () => {
      const phone = phoneInput ? phoneInput.value.trim() : '';
      if (phone.length < 10) {
        showToast(
          AppState.lang === 'hi' ? "कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें" : "Please enter a valid 10-digit mobile number",
          "warning"
        );
        return;
      }

      if (otpSection) otpSection.style.display = 'block';
      sendOtpBtn.style.display = 'none';
      startOtpCountdown();
      showToast(
        AppState.lang === 'hi' ? "ओटीपी भेजा गया: 482910 (डेमो)" : "OTP Sent to Mobile: 482910 (Demo)",
        "info"
      );

      // Pre-fill demo OTP for convenience
      const otpInput = document.getElementById('authOtpInput');
      if (otpInput) otpInput.value = "482910";
    });
  }

  if (verifyOtpBtn) {
    verifyOtpBtn.addEventListener('click', () => {
      completeLogin();
    });
  }

  if (quickDemoBtn) {
    quickDemoBtn.addEventListener('click', () => {
      completeLogin();
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      AppState.isLoggedIn = false;
      navigateTo('home');
      applyTranslations();
      showToast(AppState.lang === 'hi' ? "लॉगआउट हो गया" : "Logged out successfully", "info");
    });
  }
}

function startOtpCountdown() {
  AppState.otpCountdown = 30;
  const timerText = document.getElementById('authOtpTimer');
  clearInterval(AppState.otpTimer);

  AppState.otpTimer = setInterval(() => {
    AppState.otpCountdown--;
    if (timerText) {
      timerText.innerText = AppState.lang === 'hi'
        ? `पुनः भेजें: 00:${AppState.otpCountdown < 10 ? '0' : ''}${AppState.otpCountdown}`
        : `Resend in: 00:${AppState.otpCountdown < 10 ? '0' : ''}${AppState.otpCountdown}`;
    }

    if (AppState.otpCountdown <= 0) {
      clearInterval(AppState.otpTimer);
      if (timerText) {
        timerText.innerHTML = `<a href="javascript:void(0)" onclick="startOtpCountdown()" style="color: var(--primary-700); font-weight: 700;">${
          AppState.lang === 'hi' ? "पुनः ओटीपी भेजें" : "Resend OTP"
        }</a>`;
      }
    }
  }, 1000);
}

function completeLogin() {
  AppState.isLoggedIn = true;
  clearInterval(AppState.otpTimer);
  closeModal('loginModal');
  navigateTo('dashboard');
  applyTranslations();
  renderDashboard();
  showToast(
    AppState.lang === 'hi' ? "लॉगिन सफल! नमस्ते आदित्य जी" : "Login successful! Welcome Aditya",
    "success"
  );
}

// ==========================================
// Guided Demo Tour (8 Steps)
// ==========================================
function setupDemoTour() {
  const nextBtn = document.getElementById('demoNextBtn');
  const prevBtn = document.getElementById('demoPrevBtn');
  const finishBtn = document.getElementById('demoFinishBtn');

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (AppState.demoTourStep < AGRI_DATA.guidedDemoSteps.length - 1) {
        AppState.demoTourStep++;
        renderDemoStep();
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (AppState.demoTourStep > 0) {
        AppState.demoTourStep--;
        renderDemoStep();
      }
    });
  }

  if (finishBtn) {
    finishBtn.addEventListener('click', () => {
      closeModal('demoTourModal');
      completeLogin();
    });
  }
}

function startDemoTour() {
  AppState.demoTourStep = 0;
  openModal('demoTourModal');
  renderDemoStep();
}

function renderDemoStep() {
  const step = AGRI_DATA.guidedDemoSteps[AppState.demoTourStep];
  const isHi = AppState.lang === 'hi';

  const stepCountEl = document.getElementById('demoStepCount');
  const titleEl = document.getElementById('demoStepTitle');
  const contentEl = document.getElementById('demoStepContent');
  const highlightEl = document.getElementById('demoStepHighlight');
  const actionHintEl = document.getElementById('demoStepActionHint');
  const nextBtn = document.getElementById('demoNextBtn');
  const prevBtn = document.getElementById('demoPrevBtn');
  const finishBtn = document.getElementById('demoFinishBtn');
  const stepper = document.getElementById('demoStepperIndicators');

  if (stepCountEl) {
    stepCountEl.innerText = `${isHi ? "चरण" : "Step"} ${step.stepNumber} / 8`;
  }

  if (titleEl) titleEl.innerText = isHi ? step.titleHi : step.titleEn;
  if (contentEl) contentEl.innerText = isHi ? step.contentHi : step.contentEn;
  if (highlightEl) highlightEl.innerText = step.highlightKey;
  if (actionHintEl) actionHintEl.innerText = isHi ? step.actionHintHi : step.actionHintEn;

  // Stepper bubbles
  if (stepper) {
    stepper.innerHTML = AGRI_DATA.guidedDemoSteps.map((s, idx) => {
      let cls = 'demo-step-bubble';
      if (idx < AppState.demoTourStep) cls += ' completed';
      else if (idx === AppState.demoTourStep) cls += ' active';
      return `<div class="${cls}">${s.stepNumber}</div>`;
    }).join('');
  }

  // Button visibility
  if (prevBtn) prevBtn.style.visibility = AppState.demoTourStep === 0 ? 'hidden' : 'visible';
  if (AppState.demoTourStep === AGRI_DATA.guidedDemoSteps.length - 1) {
    if (nextBtn) nextBtn.style.display = 'none';
    if (finishBtn) finishBtn.style.display = 'inline-flex';
  } else {
    if (nextBtn) nextBtn.style.display = 'inline-flex';
    if (finishBtn) finishBtn.style.display = 'none';
  }

  initIcons();
}

// ==========================================
// Modal & Toast Utilities
// ==========================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = 'auto';
  }
}

// Global hook to close modals on backdrop click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-backdrop')) {
    e.target.classList.remove('open');
    document.body.style.overflow = 'auto';
  }
});

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconName = 'info';
  if (type === 'success') iconName = 'check-circle';
  else if (type === 'warning') iconName = 'alert-triangle';

  toast.innerHTML = `
    <i data-lucide="${iconName}" style="width: 20px; height: 20px; flex-shrink: 0;"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  initIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Helper to re-render all dynamic data when language changes
function renderAllViews() {
  renderCategoriesNav();
  renderProfileBar();
  renderSchemeAdvisory();
  renderDocumentLocker();
  renderNotifications();
  renderMandiPrices();
  renderWeatherTelemetry();
  renderExperts();
  if (AppState.currentCase.analyzedResult) {
    renderCropDiagnosis(AppState.currentCase.analyzedResult);
  }
  if (AppState.isLoggedIn) {
    renderDashboard();
  }
}
