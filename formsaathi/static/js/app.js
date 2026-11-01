/**
 * FormSaathi — Smart Scholarship & Document Assistant
 * Interactive Client Script
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNavigation();
  initChecklistInteractions();
  initDocumentPreview();
  initCourseSelectToggle();
  initNotificationToggles();
});

/**
 * Mobile Navigation Drawer & Backdrop
 */
function initMobileNavigation() {
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('appSidebar');
  const backdrop = document.getElementById('sidebarBackdrop');

  if (menuToggle && sidebar && backdrop) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      backdrop.classList.toggle('open');
    });

    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('open');
      backdrop.classList.remove('open');
    });
  }
}

/**
 * Checklist status updater with asynchronous feedback
 */
function initChecklistInteractions() {
  const statusButtons = document.querySelectorAll('.status-btn');

  statusButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const itemId = btn.dataset.itemId;
      const targetStatus = btn.dataset.status;
      const card = document.getElementById(`checklist-card-${itemId}`);
      const csrfToken = getCsrfToken();

      try {
        const response = await fetch('/api/checklist/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
          },
          body: JSON.stringify({
            item_id: itemId,
            status: targetStatus,
            csrf_token: csrfToken
          })
        });

        const data = await response.json();
        if (data.success) {
          // Update button styles in group
          const parentGroup = btn.closest('.status-button-group');
          parentGroup.querySelectorAll('.status-btn').forEach(b => {
            b.classList.remove('active-ready', 'active-pending', 'active-na');
          });

          if (targetStatus === 'ready') btn.classList.add('active-ready');
          else if (targetStatus === 'pending') btn.classList.add('active-pending');
          else if (targetStatus === 'not_applicable') btn.classList.add('active-na');

          // Update card class
          if (card) {
            card.classList.remove('status-ready', 'status-pending', 'status-not_applicable');
            card.classList.add(`status-${targetStatus}`);
          }

          // Update progress bar & counters
          updateProgressUI(data.percent, data.ready_count, data.pending_count, data.total_count);
        } else {
          alert('Could not update document status: ' + (data.error || 'Server error'));
        }
      } catch (err) {
        console.error('Checklist update error:', err);
      }
    });
  });
}

function updateProgressUI(percent, ready, pending, total) {
  const bar = document.getElementById('checklistProgressBar');
  const percentLabel = document.getElementById('checklistPercentLabel');
  const readyLabel = document.getElementById('checklistReadyCount');
  const pendingLabel = document.getElementById('checklistPendingCount');

  if (bar) bar.style.width = `${percent}%`;
  if (percentLabel) percentLabel.textContent = `${percent}%`;
  if (readyLabel) readyLabel.textContent = ready;
  if (pendingLabel) pendingLabel.textContent = pending;
}

/**
 * Document Preview Modal
 */
function initDocumentPreview() {
  const previewBtns = document.querySelectorAll('.btn-preview-doc');
  const modal = document.getElementById('docPreviewModal');
  const modalFrame = document.getElementById('docPreviewFrame');
  const modalImage = document.getElementById('docPreviewImage');
  const modalTitle = document.getElementById('docPreviewTitle');
  const downloadLink = document.getElementById('docPreviewDownload');

  if (previewBtns.length && modal) {
    previewBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const url = btn.dataset.url;
        const downloadUrl = btn.dataset.downloadUrl;
        const title = btn.dataset.title;
        const mime = btn.dataset.mime || '';

        if (modalTitle) modalTitle.textContent = title;
        if (downloadLink) downloadLink.href = downloadUrl;

        if (mime.includes('image')) {
          if (modalImage) {
            modalImage.src = url;
            modalImage.style.display = 'block';
          }
          if (modalFrame) modalFrame.style.display = 'none';
        } else {
          if (modalFrame) {
            modalFrame.src = url;
            modalFrame.style.display = 'block';
          }
          if (modalImage) modalImage.style.display = 'none';
        }

        modal.classList.add('open');
      });
    });

    // Close preview
    const closeBtns = modal.querySelectorAll('.modal-close, .btn-modal-dismiss');
    closeBtns.forEach(b => {
      b.addEventListener('click', () => {
        modal.classList.remove('open');
        if (modalFrame) modalFrame.src = '';
        if (modalImage) modalImage.src = '';
      });
    });
  }
}

/**
 * Course selection custom field toggle
 */
function initCourseSelectToggle() {
  const courseSelect = document.getElementById('classCourseSelect');
  const customGroup = document.getElementById('customCourseGroup');

  if (courseSelect && customGroup) {
    const checkState = () => {
      if (courseSelect.value === 'Other') {
        customGroup.style.display = 'block';
      } else {
        customGroup.style.display = 'none';
      }
    };
    courseSelect.addEventListener('change', checkState);
    checkState();
  }
}

/**
 * Notification read toggle
 */
function initNotificationToggles() {
  const toggleBtns = document.querySelectorAll('.btn-toggle-notif');

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const notifId = btn.dataset.id;
      const csrfToken = getCsrfToken();

      try {
        const response = await fetch(`/notifications/${notifId}/toggle-read`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
          },
          body: JSON.stringify({ csrf_token: csrfToken })
        });
        const data = await response.json();
        if (data.success) {
          const card = document.getElementById(`notif-card-${notifId}`);
          if (data.is_read === 1) {
            btn.innerHTML = '<i class="fa-solid fa-envelope"></i> Mark Unread';
            if (card) card.classList.add('is-read');
          } else {
            btn.innerHTML = '<i class="fa-solid fa-envelope-open"></i> Mark Read';
            if (card) card.classList.remove('is-read');
          }
        }
      } catch (err) {
        console.error('Notification toggle error:', err);
      }
    });
  });
}

/**
 * Helper to get CSRF token from page
 */
function getCsrfToken() {
  const input = document.querySelector('input[name="csrf_token"]');
  if (input) return input.value;
  const meta = document.querySelector('meta[name="csrf-token"]');
  if (meta) return meta.getAttribute('content');
  return '';
}
