/**
 * ZarooratSetu - Universal Cross-Browser Media Helper
 * Ensures Microphone and Camera work across ALL browsers:
 * Chrome, Safari (iOS/Mac), Firefox, Edge, Samsung Internet, Android WebViews,
 * whether on desktop, tablet, or mobile.
 */

// 1. Polyfill legacy getUserMedia implementations
export function initMediaPolyfills() {
  if (typeof window === 'undefined') return;

  if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
  }

  if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = function (constraints) {
      const getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;

      if (!getUserMedia) {
        return Promise.reject(
          new Error('getUserMedia is not supported by this browser.')
        );
      }

      return new Promise((resolve, reject) => {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    };
  }
}

// 2. Check if running in a secure origin (HTTPS or localhost)
export function isSecureContextEnvironment() {
  if (typeof window === 'undefined') return true;
  return (
    window.isSecureContext === true ||
    window.location.protocol === 'https:' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
}

export const PUBLIC_HTTPS_URL = "https://crown-assumes-partnership-trustees.trycloudflare.com";

// 3. Multi-tier camera constraints resolver for zero-fail webcam access
export async function getCrossBrowserCameraStream(preferredFacing = 'environment') {
  initMediaPolyfills();

  const tiers = [
    // Tier 1: Ideal facingMode with high resolution
    {
      video: {
        facingMode: { ideal: preferredFacing },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    },
    // Tier 2: Flipped facingMode (fallback if phone has single camera or laptop)
    {
      video: {
        facingMode: { ideal: preferredFacing === 'environment' ? 'user' : 'environment' }
      },
      audio: false
    },
    // Tier 3: Standard VGA resolution
    {
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 }
      },
      audio: false
    },
    // Tier 4: Simplest fallback for older laptop/desktop webcams
    {
      video: true,
      audio: false
    }
  ];

  let lastError = null;
  for (const constraints of tiers) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (stream && stream.getVideoTracks().length > 0) {
        return stream;
      }
    } catch (err) {
      lastError = err;
      // Try next tier
    }
  }

  throw lastError || new Error("Unable to access camera on this device.");
}

// 4. Safely attach media stream to <video> element for iOS Safari, Chrome, and Firefox
export function attachStreamToVideoElement(videoEl, stream) {
  if (!videoEl || !stream) return;

  // iOS Safari strict inline playback attributes
  videoEl.setAttribute('playsinline', 'true');
  videoEl.setAttribute('webkit-playsinline', 'true');
  videoEl.muted = true;
  videoEl.defaultMuted = true;

  if ('srcObject' in videoEl) {
    videoEl.srcObject = stream;
  } else {
    // Legacy fallback
    videoEl.src = window.URL.createObjectURL(stream);
  }

  const playPromise = () => {
    try {
      const p = videoEl.play();
      if (p && typeof p.then === 'function') {
        p.catch(() => {
          // Play was interrupted or auto-play prevented; retry on user gesture
        });
      }
    } catch (e) {
      // Ignore synchronous play exceptions
    }
  };

  videoEl.onloadedmetadata = () => {
    playPromise();
  };

  playPromise();
}

// 5. Multi-tier microphone stream resolver
export async function getCrossBrowserAudioStream() {
  initMediaPolyfills();

  const tiers = [
    {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      },
      video: false
    },
    {
      audio: true,
      video: false
    }
  ];

  let lastError = null;
  for (const constraints of tiers) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (stream && stream.getAudioTracks().length > 0) {
        return stream;
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("Unable to access microphone on this device.");
}

// 6. Cross-browser Speech Recognition detection (Chrome, Safari, Edge, WebViews)
export function getSpeechRecognitionClass() {
  if (typeof window === 'undefined') return null;
  return (
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    window.mozSpeechRecognition ||
    window.msSpeechRecognition ||
    null
  );
}
