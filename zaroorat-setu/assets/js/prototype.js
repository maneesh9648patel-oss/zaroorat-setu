/**
 * ZarooratSetu - Interactive Phone Prototype Logic
 * Complete front-end state management and UI interactions for HackFest 3.0.
 */

(function () {
  'use strict';

  // Initialize local clone of mock data
  let activeRequests = [...(window.ZAROORAT_DATA?.sampleRequests || [])];
  let activeBorrowItems = [...(window.ZAROORAT_DATA?.sampleBorrowableItems || [])];
  let currentActiveRequest = activeRequests[1]; // Default to Wheelchair request
  let activeCategoryFilter = "all";
  let activeUrgencyFilter = "all";
  let currentBorrowTab = "borrow"; // "borrow" or "return"

  // Priority ranking weight for sorting
  const priorityWeight = {
    "Urgent": 3,
    "High": 2,
    "Normal": 1
  };

  function sortRequests(list) {
    return [...list].sort((a, b) => {
      const pDiff = (priorityWeight[b.urgency] || 0) - (priorityWeight[a.urgency] || 0);
      if (pDiff !== 0) return pDiff;
      return (b.urgencyScore || 0) - (a.urgencyScore || 0);
    });
  }

  // Switch phone screen
  function showPhoneScreen(screenId) {
    const screens = document.querySelectorAll('.proto-screen');
    screens.forEach(s => s.classList.remove('active'));

    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
      // Scroll to top of phone screen
      const screenContainer = document.querySelector('.phone-screen');
      if (screenContainer) screenContainer.scrollTop = 0;
    }

    // Update active state on tab controller buttons
    const tabBtns = document.querySelectorAll('.proto-tab-btn');
    tabBtns.forEach(btn => {
      if (btn.dataset.screen === screenId) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      }
    });
  }

  // Render Requests List in Home Screen
  function renderRequestsList() {
    const feed = document.getElementById('proto-requests-feed');
    if (!feed) return;

    let filtered = activeRequests;
    if (activeCategoryFilter !== "all") {
      filtered = filtered.filter(r => r.category.toLowerCase() === activeCategoryFilter.toLowerCase());
    }
    if (activeUrgencyFilter !== "all") {
      filtered = filtered.filter(r => r.urgency.toLowerCase() === activeUrgencyFilter.toLowerCase());
    }

    const sorted = sortRequests(filtered);

    if (sorted.length === 0) {
      feed.innerHTML = `
        <div style="text-align: center; padding: 24px; background: #fff; border: 2px dashed #14101F; border-radius: 14px;">
          <p style="font-weight: 800; font-size: 0.9rem;">No requests matching filter</p>
          <p style="font-size: 0.75rem; color: #666; margin-top: 4px;">Try selecting 'All' or post a new request.</p>
        </div>
      `;
      return;
    }

    feed.innerHTML = sorted.map(req => `
      <div class="app-request-card" data-req-id="${req.id}">
        <div class="app-request-top">
          <span style="font-size: 0.75rem; font-weight: 800; display: inline-flex; align-items: center; gap: 4px;">
            <span>${req.categoryIcon}</span> ${req.category}
          </span>
          <span class="urgency-badge urgency-${req.urgency}">${req.urgency} Priority</span>
        </div>
        <h4 class="app-request-title">${req.title}</h4>
        <p class="app-request-desc">${req.description}</p>
        <div class="app-request-footer">
          <span style="color: #615873;">📍 ${req.location}</span>
          <span style="color: #6C3BFF; font-weight: 800;">${req.status} &rarr;</span>
        </div>
      </div>
    `).join('');

    // Attach click listener to each request card to open status
    feed.querySelectorAll('.app-request-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-req-id');
        const found = activeRequests.find(r => r.id === id);
        if (found) {
          currentActiveRequest = found;
          renderRequestStatus(found);
          showPhoneScreen('screen-status');
        }
      });
    });
  }

  // Render Status Timeline Screen
  function renderRequestStatus(req) {
    if (!req) req = currentActiveRequest || activeRequests[0];
    const container = document.getElementById('proto-status-content');
    if (!container) return;

    const timeline = req.timeline || [
      { title: "Submitted", time: "Just now", done: true, desc: "Request recorded in priority triage queue." },
      { title: "Verified by Human Reviewer", time: "Pending", done: req.statusStep >= 2, desc: req.verifier || "Assigned to REC Community Verifier." },
      { title: "Matched with Provider", time: "In progress", done: req.statusStep >= 3, desc: "Scanning nearby registered surplus donors." },
      { title: "Handover & Completion", time: "Pending", done: req.statusStep >= 4, desc: "Awaiting QR scan token confirmation." }
    ];

    const providerHtml = req.matchedProvider ? `
      <div class="matched-provider-box">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <span class="sticker sticker-tilt-left" style="background: #C6F432; font-size: 0.72rem; padding: 2px 8px;">Matched Provider</span>
          <span style="font-size: 0.75rem; font-weight: 800; color: #6C3BFF;">★ ${req.matchedProvider.rating || 'Verified'}</span>
        </div>
        <div style="font-size: 0.95rem; font-weight: 900; margin-bottom: 2px;">${req.matchedProvider.name}</div>
        <div style="font-size: 0.78rem; color: #4C455C; margin-bottom: 4px;">${req.matchedProvider.role} · <strong>${req.matchedProvider.distance}</strong></div>
        <div style="font-size: 0.78rem; font-weight: 700; color: #14101F; margin-bottom: 6px;">ETA / Availability: ${req.matchedProvider.eta}</div>
        
        <div class="privacy-security-note">
          🔒 <strong>Privacy Shield Active:</strong> Phone details: <code>${req.matchedProvider.phoneMasked}</code>.<br/>
          Full contact unlocks only after mutual confirmation.
        </div>

        <button id="btn-confirm-handover" class="btn btn-lime btn-sm" style="width: 100%; margin-top: 10px; font-size: 0.82rem;">
          🤝 Confirm Handover Slot
        </button>
      </div>
    ` : `
      <div class="matched-provider-box" style="text-align: center; background: #FAF7FF;">
        <span style="font-size: 1.5rem; display: block; margin-bottom: 4px;">🔍</span>
        <div style="font-size: 0.88rem; font-weight: 800;">Finding Nearby Provider...</div>
        <div style="font-size: 0.75rem; color: #666; margin-top: 4px;">Local volunteers in REC Banda & Civil Lines are currently reviewing availability.</div>
      </div>
    `;

    container.innerHTML = `
      <div style="margin-bottom: 14px; padding-bottom: 10px; border-bottom: 2px solid #14101F;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
          <span class="urgency-badge urgency-${req.urgency}">${req.urgency} Priority</span>
          <span style="font-size: 0.72rem; font-weight: 800; color: #615873;">ID: ${req.id}</span>
        </div>
        <h3 style="font-size: 1.05rem; font-weight: 900; line-height: 1.25;">${req.title}</h3>
        <p style="font-size: 0.76rem; color: #4C455C; margin-top: 4px;">Requested by: <strong>${req.requesterName}</strong> (${req.location})</p>
      </div>

      <div style="font-weight: 800; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 10px; color: #6C3BFF;">
        Verification & Dispatch Timeline
      </div>

      <div class="timeline-stepper">
        ${timeline.map((step, idx) => {
          const isDone = step.done;
          const isActive = !isDone && (idx === 0 || timeline[idx - 1].done);
          const stateClass = isDone ? 'step-done' : (isActive ? 'step-active' : '');
          const icon = isDone ? '✓' : (isActive ? '●' : (idx + 1));
          return `
            <div class="timeline-step-row ${stateClass}">
              <div class="step-indicator-circle">${icon}</div>
              <div class="timeline-step-body">
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                  <span class="timeline-step-title">${step.title}</span>
                  <span class="timeline-step-time">${step.time}</span>
                </div>
                <div class="timeline-step-desc">${step.desc}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      ${providerHtml}

      <div style="text-align: center; margin-top: 14px;">
        <button id="btn-back-home" class="btn btn-white btn-sm" style="font-size: 0.78rem;">
          &larr; Back to Requests Feed
        </button>
      </div>
    `;

    // Listeners inside rendered status
    const confirmBtn = document.getElementById('btn-confirm-handover');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        confirmBtn.innerHTML = "✅ Handover Slot Confirmed (Token #SETU-9821)";
        confirmBtn.classList.remove('btn-lime');
        confirmBtn.classList.add('btn-lavender');
        if (window.ZAROORAT_APP && window.ZAROORAT_APP.showToast) {
          window.ZAROORAT_APP.showToast("🎉 Handover confirmed! Masked SMS dispatched to both parties.");
        }
      });
    }

    const backBtn = document.getElementById('btn-back-home');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        showPhoneScreen('screen-home');
      });
    }
  }

  // Render Borrow & Return screen
  function renderBorrowScreen() {
    const container = document.getElementById('proto-borrow-content');
    if (!container) return;

    const item = activeBorrowItems[0]; // Primary item: Wheelchair

    const qrSvg = `
      <svg class="qr-code-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#FFFFFF"/>
        <!-- Corner Targets -->
        <rect x="8" y="8" width="28" height="28" fill="#14101F" rx="4"/>
        <rect x="12" y="12" width="20" height="20" fill="#FFFFFF" rx="2"/>
        <rect x="16" y="16" width="12" height="12" fill="#6C3BFF" rx="2"/>

        <rect x="64" y="8" width="28" height="28" fill="#14101F" rx="4"/>
        <rect x="68" y="12" width="20" height="20" fill="#FFFFFF" rx="2"/>
        <rect x="72" y="16" width="12" height="12" fill="#6C3BFF" rx="2"/>

        <rect x="8" y="64" width="28" height="28" fill="#14101F" rx="4"/>
        <rect x="12" y="68" width="20" height="20" fill="#FFFFFF" rx="2"/>
        <rect x="16" y="72" width="12" height="12" fill="#6C3BFF" rx="2"/>

        <!-- Neo-brutalist QR pixel pattern -->
        <rect x="42" y="10" width="8" height="8" fill="#14101F"/>
        <rect x="52" y="18" width="6" height="8" fill="#14101F"/>
        <rect x="40" y="24" width="12" height="6" fill="#14101F"/>
        
        <rect x="10" y="42" width="8" height="8" fill="#14101F"/>
        <rect x="22" y="44" width="6" height="12" fill="#14101F"/>
        <rect x="34" y="40" width="10" height="8" fill="#14101F"/>
        
        <rect x="68" y="44" width="10" height="8" fill="#14101F"/>
        <rect x="82" y="40" width="8" height="12" fill="#14101F"/>
        <rect x="74" y="56" width="16" height="6" fill="#14101F"/>

        <rect x="42" y="66" width="8" height="10" fill="#14101F"/>
        <rect x="54" y="68" width="10" height="8" fill="#14101F"/>
        <rect x="42" y="82" width="18" height="6" fill="#14101F"/>
        <rect x="66" y="78" width="10" height="12" fill="#14101F"/>
        <rect x="80" y="74" width="8" height="16" fill="#14101F"/>

        <!-- Center Zaroorat Heart Badge -->
        <circle cx="50" cy="50" r="14" fill="#C6F432" stroke="#14101F" stroke-width="2.5"/>
        <path d="M 50 54 C 50 54 44 49 44 45 C 44 43 45.5 41.5 47.5 41.5 C 48.5 41.5 49.5 42 50 42.5 C 50.5 42 51.5 41.5 52.5 41.5 C 54.5 41.5 56 43 56 45 C 56 49 50 54 50 54 Z" fill="#FF5C7A" stroke="#14101F" stroke-width="1.2"/>
      </svg>
    `;

    container.innerHTML = `
      <div class="borrow-toggle-container">
        <button id="toggle-borrow" class="borrow-toggle-btn ${currentBorrowTab === 'borrow' ? 'active' : ''}">
          📥 Borrow Resource
        </button>
        <button id="toggle-return" class="borrow-toggle-btn ${currentBorrowTab === 'return' ? 'active' : ''}">
          🔄 Return Resource
        </button>
      </div>

      <div class="neo-card" style="padding: 14px; margin-bottom: 12px; border-width: 2.5px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 0.72rem; font-weight: 800; background: #EFE9FF; padding: 2px 8px; border-radius: 9999px; border: 1.5px solid #14101F;">
            ${item.categoryIcon} ${item.category}
          </span>
          <span style="font-size: 0.72rem; font-weight: 800; color: #6C3BFF;">${item.timesReused}</span>
        </div>
        <div style="font-size: 0.95rem; font-weight: 900; line-height: 1.2;">${item.title}</div>
        <div style="font-size: 0.75rem; color: #4C455C; margin: 4px 0;">📍 Location: <strong>${item.location}</strong></div>
        <div style="font-size: 0.75rem; font-weight: 700; color: #14101F;">Duration: ${item.borrowDuration}</div>
      </div>

      <div class="qr-code-display-box">
        <div style="font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: #6C3BFF; margin-bottom: 6px;">
          ${currentBorrowTab === 'borrow' ? 'Handover Verification QR' : 'Return Check-In QR'}
        </div>
        ${qrSvg}
        <div style="font-family: monospace; font-size: 0.78rem; font-weight: 800; background: #FAF7FF; padding: 4px; border: 1px dashed #14101F; border-radius: 6px;">
          ${item.qrToken}
        </div>
        <div style="font-size: 0.7rem; color: #666; margin-top: 6px;">
          Scan with any mobile camera at REC Banda Hub to confirm physical transfer.
        </div>
      </div>

      <div class="return-reminder-card">
        ⏰ <strong>Automated Return Loop:</strong><br/>
        Friendly reminder triggers at Day 14 and Day 19 via SMS & WhatsApp to return the wheelchair so another patient can reuse it.
      </div>

      <button id="btn-simulate-qr" class="btn btn-lime" style="width: 100%; font-size: 0.88rem;">
        ${currentBorrowTab === 'borrow' ? '✓ Simulate Scan & Confirm Borrow' : '✓ Confirm Check-In & Free for Reuse'}
      </button>
    `;

    // Toggle Tab Events
    const btnB = document.getElementById('toggle-borrow');
    const btnR = document.getElementById('toggle-return');
    if (btnB) {
      btnB.addEventListener('click', () => {
        currentBorrowTab = 'borrow';
        renderBorrowScreen();
      });
    }
    if (btnR) {
      btnR.addEventListener('click', () => {
        currentBorrowTab = 'return';
        renderBorrowScreen();
      });
    }

    // Simulate Scan button
    const simBtn = document.getElementById('btn-simulate-qr');
    if (simBtn) {
      simBtn.addEventListener('click', () => {
        simBtn.innerHTML = "🎉 QR Verified & Handover Recorded!";
        simBtn.classList.remove('btn-lime');
        simBtn.classList.add('btn-lavender');
        if (window.ZAROORAT_APP && window.ZAROORAT_APP.showToast) {
          window.ZAROORAT_APP.showToast(currentBorrowTab === 'borrow' ? "✅ Equipment borrowed! Return reminder scheduled." : "✅ Item returned to community pool! Ready for next neighbor.");
        }
      });
    }
  }

  // Setup New Request Form Submission
  function setupNewRequestForm() {
    const form = document.getElementById('proto-new-request-form');
    if (!form) return;

    // Category button clicks
    const catBtns = form.querySelectorAll('.cat-radio-btn');
    catBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        catBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const input = document.getElementById('proto-req-category');
        if (input) input.value = btn.dataset.category;
      });
    });

    // Urgency button clicks
    const urgBtns = form.querySelectorAll('.urg-radio-btn');
    urgBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        urgBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const input = document.getElementById('proto-req-urgency');
        if (input) input.value = btn.dataset.urgency;
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const title = document.getElementById('proto-req-title')?.value.trim();
      const category = document.getElementById('proto-req-category')?.value || 'Education';
      const urgency = document.getElementById('proto-req-urgency')?.value || 'High';
      const desc = document.getElementById('proto-req-desc')?.value.trim();
      const name = document.getElementById('proto-req-name')?.value.trim() || 'Community Member (Example Data)';
      const contact = document.getElementById('proto-req-contact')?.value.trim() || '+91 98765 XXXXX (Example Data)';

      if (!title || !desc) {
        alert('Please provide a title and description for your need request.');
        return;
      }

      const categoryIcons = {
        'Education': '🎓',
        'Medical': '🩺',
        'Items': '📦',
        'Emergency': '🚨'
      };

      const newId = `REQ-2026-00${activeRequests.length + 1}`;
      const newRequest = {
        id: newId,
        title: title,
        category: category,
        categoryIcon: categoryIcons[category] || '🤝',
        urgency: urgency,
        urgencyScore: urgency === 'Urgent' ? 95 : (urgency === 'High' ? 80 : 60),
        location: "REC Banda & Municipal Vicinity",
        description: desc,
        requesterName: `${name} (New - Example Data)`,
        requesterContact: contact,
        timeAgo: "Just now",
        status: "Submitted & AI Scored",
        statusStep: 1,
        verifier: "Assigned to REC On-Duty Verifier",
        matchedProvider: null,
        timeline: [
          { title: "Submitted", time: "Just now", done: true, desc: "Need request registered in priority triage engine." },
          { title: "Verified by Human Reviewer", time: "Reviewing (ETA 10m)", done: false, desc: "Community verifier checking validity & severity." },
          { title: "Matched with Provider", time: "Pending", done: false, desc: "Matching with nearby verified pool in Banda." },
          { title: "Handover & Completion", time: "Pending", done: false, desc: "QR code transfer token." }
        ]
      };

      // Add to front of requests array
      activeRequests.unshift(newRequest);
      currentActiveRequest = newRequest;

      // Reset form fields
      document.getElementById('proto-req-title').value = '';
      document.getElementById('proto-req-desc').value = '';

      // Re-render feed and status
      renderRequestsList();
      renderRequestStatus(newRequest);

      // Toast feedback
      if (window.ZAROORAT_APP && window.ZAROORAT_APP.showToast) {
        window.ZAROORAT_APP.showToast(`✅ Request ${newId} submitted! AI priority scored.`);
      }

      // Immediately switch to Request Status screen
      showPhoneScreen('screen-status');
    });
  }

  // Setup Controller Tabs & Screen Switchers
  function setupControllers() {
    const tabBtns = document.querySelectorAll('.proto-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.screen;
        showPhoneScreen(target);
      });
    });

    // Splash "Enter App" button
    const enterSplashBtn = document.getElementById('btn-splash-enter');
    if (enterSplashBtn) {
      enterSplashBtn.addEventListener('click', () => {
        showPhoneScreen('screen-home');
      });
    }

    // Home "I need help" big card
    const actionNeed = document.getElementById('btn-home-need');
    if (actionNeed) {
      actionNeed.addEventListener('click', () => {
        showPhoneScreen('screen-new-request');
      });
    }

    // Home "Borrow or lend" big card
    const actionBorrow = document.getElementById('btn-home-borrow');
    if (actionBorrow) {
      actionBorrow.addEventListener('click', () => {
        showPhoneScreen('screen-borrow-return');
      });
    }

    // Filter chips on home screen
    const filterChips = document.querySelectorAll('.filter-chip');
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeCategoryFilter = chip.dataset.cat || 'all';
        renderRequestsList();
      });
    });
  }

  // Global initialization
  function initPrototype() {
    renderRequestsList();
    renderRequestStatus(currentActiveRequest);
    renderBorrowScreen();
    setupNewRequestForm();
    setupControllers();

    // Expose API for external buttons
    window.ZAROORAT_PROTOTYPE = {
      openScreen: showPhoneScreen,
      openNewRequest: () => showPhoneScreen('screen-new-request'),
      openBorrow: () => showPhoneScreen('screen-borrow-return'),
      refreshData: () => {
        renderRequestsList();
        renderRequestStatus(currentActiveRequest);
      }
    };
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPrototype);
  } else {
    initPrototype();
  }
})();
