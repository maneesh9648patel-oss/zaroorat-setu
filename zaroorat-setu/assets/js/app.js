/**
 * ZarooratSetu - Main Application Interactions & PWA Setup
 * Handles navigation, clipboard copy, forms validation, toasts, and service worker.
 */

window.ZAROORAT_APP = (function () {
  'use strict';

  // Global Toast Dispatcher
  function showToast(message, duration = 3000) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.setAttribute('role', 'status');
    toast.innerHTML = `
      <span style="font-size: 1.2rem;">✨</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.2s ease';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 200);
    }, duration);
  }

  // Setup Problem Statement Copy Button
  function setupCopyProblemStatement() {
    const copyBtn = document.getElementById('btn-copy-problem');
    const problemTextEl = document.getElementById('official-problem-statement');
    if (!copyBtn || !problemTextEl) return;

    copyBtn.addEventListener('click', async () => {
      const textToCopy = problemTextEl.innerText.trim();

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(textToCopy);
        } else {
          // Fallback for non-https or older browsers
          const textarea = document.createElement('textarea');
          textarea.value = textToCopy;
          textarea.style.position = 'fixed';
          textarea.style.left = '-999999px';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }

        const originalHtml = copyBtn.innerHTML;
        copyBtn.innerHTML = '✓ Copied to clipboard!';
        copyBtn.classList.remove('btn-lavender');
        copyBtn.classList.add('btn-lime');
        showToast('📋 Problem statement copied to clipboard!');

        setTimeout(() => {
          copyBtn.innerHTML = originalHtml;
          copyBtn.classList.remove('btn-lime');
          copyBtn.classList.add('btn-lavender');
        }, 2500);
      } catch (err) {
        console.error('Failed to copy: ', err);
        showToast('⚠️ Could not copy automatically. Please select text manually.');
      }
    });
  }

  // Mobile Navigation Drawer
  function setupMobileNav() {
    const hamburgerBtn = document.getElementById('nav-hamburger-toggle');
    const mobilePanel = document.getElementById('mobile-nav-panel');
    if (!hamburgerBtn || !mobilePanel) return;

    function toggleMenu(open) {
      const isOpen = open !== undefined ? open : hamburgerBtn.getAttribute('aria-expanded') !== 'true';
      hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) {
        mobilePanel.classList.add('open');
      } else {
        mobilePanel.classList.remove('open');
      }
    }

    hamburgerBtn.addEventListener('click', () => toggleMenu());

    // Close when clicking any nav link
    const mobileLinks = mobilePanel.querySelectorAll('.nav-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && hamburgerBtn.getAttribute('aria-expanded') === 'true') {
        toggleMenu(false);
        hamburgerBtn.focus();
      }
    });
  }

  // Setup Hero Button Link Actions
  function setupHeroActions() {
    const btnAskHelp = document.getElementById('hero-btn-ask');
    const btnOfferHelp = document.getElementById('hero-btn-offer');
    const btnTryProto = document.getElementById('hero-btn-try-proto');

    if (btnAskHelp) {
      btnAskHelp.addEventListener('click', (e) => {
        e.preventDefault();
        const protoSection = document.getElementById('prototype');
        if (protoSection) {
          protoSection.scrollIntoView({ behavior: 'smooth' });
          if (window.ZAROORAT_PROTOTYPE) {
            window.ZAROORAT_PROTOTYPE.openNewRequest();
          }
        }
      });
    }

    if (btnOfferHelp) {
      btnOfferHelp.addEventListener('click', (e) => {
        e.preventDefault();
        const joinSection = document.getElementById('join');
        if (joinSection) {
          joinSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    if (btnTryProto) {
      btnTryProto.addEventListener('click', (e) => {
        e.preventDefault();
        const protoSection = document.getElementById('prototype');
        if (protoSection) {
          protoSection.scrollIntoView({ behavior: 'smooth' });
          if (window.ZAROORAT_PROTOTYPE) {
            window.ZAROORAT_PROTOTYPE.openScreen('screen-home');
          }
        }
      });
    }
  }

  // Setup "Join as Helper" Form Validation & Simulation
  function setupHelperForm() {
    const form = document.getElementById('site-helper-form');
    const feedback = document.getElementById('helper-form-feedback');
    if (!form) return;

    // Radio pills
    const pillLabels = form.querySelectorAll('.role-pill-label');
    pillLabels.forEach(label => {
      label.addEventListener('click', () => {
        pillLabels.forEach(l => l.classList.remove('active'));
        label.classList.add('active');
        const radio = label.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('helper-name')?.value.trim();
      const phone = document.getElementById('helper-phone')?.value.trim();
      const offer = document.getElementById('helper-offer')?.value;
      const location = document.getElementById('helper-location')?.value.trim() || 'Banda';
      const role = form.querySelector('input[name="helper-role"]:checked')?.value || 'Volunteer';

      // Simple validation
      if (!name) {
        showToast('⚠️ Please enter your name.');
        document.getElementById('helper-name')?.focus();
        return;
      }

      // Check phone: 10 digits
      const phoneClean = phone.replace(/[^0-9]/g, '');
      if (phoneClean.length < 10) {
        showToast('⚠️ Please enter a valid 10-digit mobile number.');
        document.getElementById('helper-phone')?.focus();
        return;
      }

      // Success State
      if (feedback) {
        feedback.style.display = 'block';
        feedback.innerHTML = `
          <div style="font-size: 1.4rem; margin-bottom: 6px;">🎉</div>
          <div style="font-size: 1.1rem; font-weight: 900; margin-bottom: 4px;">Thank you, ${name}!</div>
          <p style="font-size: 0.88rem; font-weight: 600; line-height: 1.4; color: #14101F;">
            You are pre-registered as a <strong>${role} (${offer})</strong> for our REC Banda & Bundelkhand network.
          </p>
          <div style="font-size: 0.75rem; color: #38314A; margin-top: 8px; border-top: 1px dashed #14101F; padding-top: 6px;">
            Demo submission received. No real data is stored. For HackFest 3.0 demonstration only.
          </div>
        `;
      }

      showToast('🎉 Helper registration simulated successfully!');
      form.reset();

      // Reset pill labels to first default
      pillLabels.forEach((l, idx) => {
        if (idx === 0) {
          l.classList.add('active');
          const r = l.querySelector('input[type="radio"]');
          if (r) r.checked = true;
        } else {
          l.classList.remove('active');
        }
      });
    });
  }

  // Register PWA Service Worker
  function registerServiceWorker() {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(reg => {
            console.log('[ZarooratSetu PWA] Service worker registered successfully:', reg.scope);
          })
          .catch(err => {
            console.warn('[ZarooratSetu PWA] Service worker registration failed:', err);
          });
      });
    }
  }

  // Initialize
  function init() {
    setupCopyProblemStatement();
    setupMobileNav();
    setupHeroActions();
    setupHelperForm();
    registerServiceWorker();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    showToast: showToast
  };
})();
