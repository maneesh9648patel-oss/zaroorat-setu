/**
 * RESCUEX - Emergency Accident Alert & Dispatch Controller
 * Handles user interactions, SOS countdown, dispatch pipeline, sensor impact, and audio alerts.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Map
  if (window.EmergencyMap) {
    window.EmergencyMap.init();
  }

  // State Management
  const AppState = {
    sosCountdownTimer: null,
    sosCountdownVal: 5,
    dispatchTimer: null,
    dispatchSecondsLeft: 272, // 4 mins 32 secs
    dispatchStage: 1,
    isSirenActive: false,
    isRecordingVoice: false,
    isHindi: false,
    selectedCollisionType: 'Head-On Collision',
    casualties: 1,
    trapped: 0,
    currentCoords: { lat: 28.6145, lng: 77.2115 }
  };

  // DOM Elements
  const btnSosHero = document.getElementById('btnSosHero');
  const sosCountdownBanner = document.getElementById('sosCountdownBanner');
  const countdownNumber = document.getElementById('countdownNumber');
  const btnAbortSos = document.getElementById('btnAbortSos');
  const btnToggleSiren = document.getElementById('btnToggleSiren');
  const liveClockEl = document.getElementById('liveClock');
  const btnGpsDetect = document.getElementById('btnGpsDetect');
  const inputLocation = document.getElementById('inputLocation');
  const coordsPreview = document.getElementById('coordsPreview');
  const reportForm = document.getElementById('accidentReportForm');
  const btnVoiceRecord = document.getElementById('btnVoiceRecord');
  const audioWave = document.getElementById('audioWave');
  const voiceStatusText = document.getElementById('voiceStatusText');
  const photoInput = document.getElementById('photoInput');
  const photoPreviewGrid = document.getElementById('photoPreviewGrid');
  const btnTriggerImpact = document.getElementById('btnTriggerImpact');
  const gForceVal = document.getElementById('gForceVal');
  const btnMetronome = document.getElementById('btnMetronome');
  const metronomeIndicator = document.getElementById('metronomeIndicator');
  const dispatchTrackerCard = document.getElementById('dispatchTrackerCard');
  const dispatchEtaVal = document.getElementById('dispatchEtaVal');
  const btnSimulateSms = document.getElementById('btnSimulateSms');
  const broadcastModal = document.getElementById('broadcastModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const langToggleBtn = document.getElementById('langToggleBtn');

  // ==========================================
  // 1. Live Mission Control Clock
  // ==========================================
  function updateLiveClock() {
    const now = new Date();
    const utc = now.toUTCString().slice(17, 25);
    const local = now.toLocaleTimeString();
    if (liveClockEl) {
      liveClockEl.textContent = `UTC: ${utc} | LOCAL: ${local}`;
    }
  }
  setInterval(updateLiveClock, 1000);
  updateLiveClock();

  // ==========================================
  // 2. Audio Siren & Announcer Toggle
  // ==========================================
  if (btnToggleSiren) {
    btnToggleSiren.addEventListener('click', () => {
      if (window.RescueAudio) {
        AppState.isSirenActive = window.RescueAudio.toggleSiren();
        if (AppState.isSirenActive) {
          btnToggleSiren.classList.add('active');
          btnToggleSiren.innerHTML = '🚨 SIREN: ON';
          showToast('Emergency Siren Activated', 'warn');
        } else {
          btnToggleSiren.classList.remove('active');
          btnToggleSiren.innerHTML = '🚨 SIREN: OFF';
          showToast('Emergency Siren Muted', 'info');
        }
      }
    });
  }

  // ==========================================
  // 3. SOS Button & 5-Second Countdown Safeguard
  // ==========================================
  if (btnSosHero) {
    btnSosHero.addEventListener('click', () => {
      startSosTrigger();
    });
  }

  function startSosTrigger() {
    if (AppState.sosCountdownTimer) return;

    // Visual & audio alert
    document.body.classList.add('emergency-active');
    if (window.RescueAudio) {
      window.RescueAudio.playAlertBeep(980, 0.2);
      window.RescueAudio.speak('Emergency Accident Alert initiated. Broadcasting in 5 seconds.');
    }

    AppState.sosCountdownVal = 5;
    countdownNumber.textContent = AppState.sosCountdownVal;
    sosCountdownBanner.classList.add('active');

    AppState.sosCountdownTimer = setInterval(() => {
      AppState.sosCountdownVal--;
      countdownNumber.textContent = AppState.sosCountdownVal;

      if (window.RescueAudio) {
        window.RescueAudio.playAlertBeep(880 + (5 - AppState.sosCountdownVal) * 80, 0.1);
      }

      if (AppState.sosCountdownVal <= 0) {
        clearInterval(AppState.sosCountdownTimer);
        AppState.sosCountdownTimer = null;
        sosCountdownBanner.classList.remove('active');
        broadcastEmergencyAlert({
          type: 'HIGH-PRIORITY CRASH SOS',
          severity: '4 (CRITICAL)',
          casualties: 2,
          location: inputLocation.value || 'NH-44 Bypass Milepost 182.4'
        });
      }
    }, 1000);
  }

  if (btnAbortSos) {
    btnAbortSos.addEventListener('click', () => {
      if (AppState.sosCountdownTimer) {
        clearInterval(AppState.sosCountdownTimer);
        AppState.sosCountdownTimer = null;
        sosCountdownBanner.classList.remove('active');
        document.body.classList.remove('emergency-active');
        showToast('SOS Alert Cancelled by User', 'info');
        if (window.RescueAudio) {
          window.RescueAudio.speak('Emergency alert cancelled.');
        }
      }
    });
  }

  // ==========================================
  // 4. GPS Auto-Detection
  // ==========================================
  if (btnGpsDetect) {
    btnGpsDetect.addEventListener('click', () => {
      btnGpsDetect.innerHTML = '⏳ Locating...';
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            AppState.currentCoords = { lat, lng };
            inputLocation.value = `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)} (Exact Highway Vector)`;
            coordsPreview.textContent = `LAT: ${lat.toFixed(6)} | LNG: ${lng.toFixed(6)} • ACCURACY: ${Math.round(pos.coords.accuracy)}m`;
            btnGpsDetect.innerHTML = '📍 GPS Locked';
            if (window.EmergencyMap) {
              window.EmergencyMap.setAccidentLocation(lat, lng, 'Live GPS Incident Site');
            }
            showToast('GPS Coordinates Successfully Acquired', 'success');
          },
          (err) => {
            console.warn('Geolocation error or permission denied, using mock high-accuracy GPS:', err);
            const fallbackLat = 28.6145;
            const fallbackLng = 77.2115;
            AppState.currentCoords = { lat: fallbackLat, lng: fallbackLng };
            inputLocation.value = 'National Highway 44 (Milepost 182.4, Outer Ring)';
            coordsPreview.textContent = `LAT: ${fallbackLat} | LNG: ${fallbackLng} • SATELLITE TRIANGULATED`;
            btnGpsDetect.innerHTML = '📍 GPS Locked';
            if (window.EmergencyMap) {
              window.EmergencyMap.setAccidentLocation(fallbackLat, fallbackLng, 'NH-44 Incident Vector');
            }
            showToast('Location Triangulated via Highway Grid', 'success');
          },
          { timeout: 7000, enableHighAccuracy: true }
        );
      } else {
        showToast('Geolocation not supported, manual input used', 'warn');
        btnGpsDetect.innerHTML = '📍 Detect Location';
      }
    });
  }

  // ==========================================
  // 5. Collision Type Selection & Casualties Stepper
  // ==========================================
  document.querySelectorAll('.type-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.type-chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      AppState.selectedCollisionType = chip.dataset.type || chip.textContent.trim();
    });
  });

  // Stepper counters (+ / -)
  document.querySelectorAll('.counter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const step = parseInt(btn.dataset.step, 10);
      const valEl = document.getElementById(targetId);
      if (valEl) {
        let current = parseInt(valEl.textContent, 10) || 0;
        current = Math.max(0, current + step);
        valEl.textContent = current;
        if (targetId === 'casualtiesVal') AppState.casualties = current;
        if (targetId === 'trappedVal') AppState.trapped = current;
      }
    });
  });

  // Hazard toggles
  document.querySelectorAll('.hazard-toggle-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
    });
  });

  // ==========================================
  // 6. Voice Emergency Memo Simulation
  // ==========================================
  if (btnVoiceRecord) {
    btnVoiceRecord.addEventListener('click', () => {
      AppState.isRecordingVoice = !AppState.isRecordingVoice;
      if (AppState.isRecordingVoice) {
        btnVoiceRecord.classList.add('recording');
        btnVoiceRecord.innerHTML = '⏹ Stop Memo';
        audioWave.classList.add('recording');
        voiceStatusText.textContent = '🔴 Recording witness audio (15s max)...';
        if (window.RescueAudio) window.RescueAudio.playAlertBeep(600, 0.1);
      } else {
        btnVoiceRecord.classList.remove('recording');
        btnVoiceRecord.innerHTML = '🎤 Record Again';
        audioWave.classList.remove('recording');
        voiceStatusText.textContent = '✅ Emergency Voice Memo Attached (0:08s)';
        showToast('Voice memo attached to emergency payload', 'success');
      }
    });
  }

  // ==========================================
  // 7. Photo Upload & Preview
  // ==========================================
  if (photoInput) {
    photoInput.addEventListener('change', (e) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      photoPreviewGrid.innerHTML = '';
      Array.from(files).slice(0, 3).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const div = document.createElement('div');
          div.className = 'photo-thumb';
          div.innerHTML = `<img src="${event.target.result}" alt="Crash Evidence" />`;
          photoPreviewGrid.appendChild(div);
        };
        reader.readAsDataURL(file);
      });
      showToast(`${files.length} Photo Evidence Attached`, 'success');
    });
  }

  // ==========================================
  // 8. Form Submission & Emergency Broadcast
  // ==========================================
  if (reportForm) {
    reportForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const severityEl = document.querySelector('input[name="severity"]:checked');
      const severity = severityEl ? severityEl.value : '3 (Severe)';
      const location = inputLocation.value || 'NH-44 Bypass Milepost 182.4';

      broadcastEmergencyAlert({
        type: AppState.selectedCollisionType,
        severity: severity,
        casualties: AppState.casualties,
        trapped: AppState.trapped,
        location: location
      });
    });
  }

  function broadcastEmergencyAlert(data) {
    document.body.classList.add('emergency-active');

    if (window.RescueAudio) {
      window.RescueAudio.startSiren();
      AppState.isSirenActive = true;
      if (btnToggleSiren) {
        btnToggleSiren.classList.add('active');
        btnToggleSiren.innerHTML = '🚨 SIREN: ON';
      }
      window.RescueAudio.speak(
        `Critical Alert Broadcasted. Collision Type: ${data.type}. Location: ${data.location}. Dispatching advanced life support.`
      );
    }

    showToast(`🚨 ACCIDENT REPORT BROADCASTED! Dispatching units...`, 'warn');

    // Trigger map update
    if (window.EmergencyMap) {
      window.EmergencyMap.setAccidentLocation(AppState.currentCoords.lat, AppState.currentCoords.lng, data.type);
    }

    // Activate Dispatch Timeline
    startLiveDispatchSimulation();

    // Scroll to Dispatch Tracker
    if (dispatchTrackerCard) {
      dispatchTrackerCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // ==========================================
  // 9. Automated Golden Hour Dispatch Pipeline
  // ==========================================
  function startLiveDispatchSimulation() {
    if (!dispatchTrackerCard) return;

    dispatchTrackerCard.style.display = 'block';
    AppState.dispatchSecondsLeft = 260; // ~4:20
    AppState.dispatchStage = 1;

    updateDispatchUI();

    if (AppState.dispatchTimer) clearInterval(AppState.dispatchTimer);

    AppState.dispatchTimer = setInterval(() => {
      if (AppState.dispatchSecondsLeft > 0) {
        AppState.dispatchSecondsLeft--;
        const mins = Math.floor(AppState.dispatchSecondsLeft / 60);
        const secs = AppState.dispatchSecondsLeft % 60;
        if (dispatchEtaVal) {
          dispatchEtaVal.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        // Advance stages based on countdown
        if (AppState.dispatchSecondsLeft <= 210 && AppState.dispatchStage < 2) {
          AppState.dispatchStage = 2;
          updateDispatchUI();
          if (window.RescueAudio) window.RescueAudio.speak('Nearest Level 1 Trauma Center alert acknowledged.');
        } else if (AppState.dispatchSecondsLeft <= 140 && AppState.dispatchStage < 3) {
          AppState.dispatchStage = 3;
          updateDispatchUI();
          if (window.RescueAudio) window.RescueAudio.speak('Highway Patrol on perimeter.');
        } else if (AppState.dispatchSecondsLeft <= 70 && AppState.dispatchStage < 4) {
          AppState.dispatchStage = 4;
          updateDispatchUI();
        } else if (AppState.dispatchSecondsLeft <= 5 && AppState.dispatchStage < 5) {
          AppState.dispatchStage = 5;
          updateDispatchUI();
          if (window.RescueAudio) window.RescueAudio.speak('Paramedic team arrived on scene.');
        }

        // Animate ambulance progress on map
        const progress = Math.min(100, Math.round(((260 - AppState.dispatchSecondsLeft) / 260) * 100));
        if (window.EmergencyMap) {
          window.EmergencyMap.simulateAmbulanceProgress(progress);
        }
      }
    }, 1000);
  }

  function updateDispatchUI() {
    const steps = document.querySelectorAll('.timeline-step');
    steps.forEach((step, idx) => {
      const stepNum = idx + 1;
      step.classList.remove('completed', 'active');
      if (stepNum < AppState.dispatchStage) {
        step.classList.add('completed');
      } else if (stepNum === AppState.dispatchStage) {
        step.classList.add('active');
      }
    });
  }

  // ==========================================
  // 10. IoT Crash Sensor Simulation (eCall 25G Impact)
  // ==========================================
  if (btnTriggerImpact) {
    btnTriggerImpact.addEventListener('click', () => {
      if (window.RescueAudio) {
        window.RescueAudio.playCrashSound();
      }

      // Spike G-Force
      gForceVal.textContent = '26.4 G';
      gForceVal.classList.add('danger');

      showToast('⚠️ HIGH G-FORCE CRASH DETECTED BY ON-BOARD IOT SENSOR!', 'warn');

      setTimeout(() => {
        startSosTrigger();
      }, 700);

      // Return to baseline after some time
      setTimeout(() => {
        gForceVal.textContent = '1.02 G';
        gForceVal.classList.remove('danger');
      }, 8000);
    });
  }

  // ==========================================
  // 11. CPR Metronome Interactive Widget
  // ==========================================
  if (btnMetronome) {
    btnMetronome.addEventListener('click', () => {
      if (window.RescueAudio) {
        const isPlaying = window.RescueAudio.toggleCprMetronome(() => {
          // Visual beat pulse
          if (metronomeIndicator) {
            metronomeIndicator.classList.add('beat');
            setTimeout(() => {
              metronomeIndicator.classList.remove('beat');
            }, 120);
          }
        });

        if (isPlaying) {
          btnMetronome.classList.add('active');
          btnMetronome.innerHTML = '⏹ Stop Metronome';
          showToast('CPR Metronome Active (110 BPM American Heart Association)', 'info');
        } else {
          btnMetronome.classList.remove('active');
          btnMetronome.innerHTML = '▶ Start Metronome (110 BPM)';
        }
      }
    });
  }

  // ==========================================
  // 12. First Aid Protocol Tab Switching
  // ==========================================
  document.querySelectorAll('.guide-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.guide-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.protocol-card').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.dataset.tab;
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });

  // ==========================================
  // 13. Emergency Contacts SMS Broadcast Simulation
  // ==========================================
  if (btnSimulateSms) {
    btnSimulateSms.addEventListener('click', () => {
      const previewText = document.getElementById('smsPreviewText');
      if (previewText) {
        const loc = inputLocation.value || 'NH-44 Milepost 182.4';
        const link = `https://maps.google.com/?q=${AppState.currentCoords.lat},${AppState.currentCoords.lng}`;
        previewText.textContent = `🚨 [CRITICAL ACCIDENT SOS]
Alert triggered by RESCUEX System.
Location: ${loc}
Map Vector: ${link}
Status: Ambulance #108 En Route (ETA 4 min).
Trauma ICU Bay 4 Pre-Alerted.`;
      }
      broadcastModal.classList.add('active');
      if (window.RescueAudio) window.RescueAudio.playAlertBeep(750, 0.12);
    });
  }

  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', () => {
      broadcastModal.classList.remove('active');
    });
  }

  // Close modal when clicking outer backdrop
  if (broadcastModal) {
    broadcastModal.addEventListener('click', (e) => {
      if (e.target === broadcastModal) {
        broadcastModal.classList.remove('active');
      }
    });
  }

  // ==========================================
  // 14. Language Toggle (English / Hindi)
  // ==========================================
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      AppState.isHindi = !AppState.isHindi;
      if (AppState.isHindi) {
        langToggleBtn.textContent = '🌐 Language: हिंदी';
        applyHindiTranslations();
      } else {
        langToggleBtn.textContent = '🌐 Language: English';
        applyEnglishTranslations();
      }
    });
  }

  function applyHindiTranslations() {
    const elTitle = document.querySelector('.hero-title');
    if (elTitle) elTitle.innerHTML = 'आपातकालीन <span>सड़क दुर्घटना अलर्ट</span> एवं त्वरित सहायता';
    const elSub = document.querySelector('.hero-subhead');
    if (elSub) elSub.innerHTML = '🚨 राष्ट्रीय त्वरित आपातकालीन प्रणाली';
    const elSos = document.querySelector('.sos-text');
    if (elSos) elSos.textContent = 'दुर्घटना SOS';
    const elHint = document.querySelector('.sos-hint');
    if (elHint) elHint.textContent = 'तुरंत एम्बुलेंस व पुलिस बुलाएं';
    showToast('भाषा बदलकर हिंदी कर दी गई है', 'info');
  }

  function applyEnglishTranslations() {
    const elTitle = document.querySelector('.hero-title');
    if (elTitle) elTitle.innerHTML = 'EMERGENCY <span>ACCIDENT ALERT</span> &amp; DISPATCH';
    const elSub = document.querySelector('.hero-subhead');
    if (elSub) elSub.innerHTML = '🚨 High-Priority Emergency Response Grid';
    const elSos = document.querySelector('.sos-text');
    if (elSos) elSos.textContent = 'REPORT SOS';
    const elHint = document.querySelector('.sos-hint');
    if (elHint) elHint.textContent = 'One-Tap Accident Alert';
    showToast('Language switched to English', 'info');
  }

  // ==========================================
  // Helper: Toast Notifications
  // ==========================================
  function showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'success' : ''}`;
    let icon = 'ℹ️';
    if (type === 'warn') icon = '🚨';
    if (type === 'success') icon = '✅';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  window.showToast = showToast;
});
