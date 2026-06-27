/* ========================================
   HireReady AI - Main Shared Functions
   js/main.js
   ======================================== */

/* ===== PAGE NAVIGATION ===== */
// FIX: HTML page IDs are "page-home", "page-about" etc.
// Nav calls showPage('home'), so we add the "page-" prefix here.

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + pageId);
  if (page) {
    page.classList.add('active');
    window.scrollTo(0, 0);
  }
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-sec').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

  const tab = document.getElementById('sec-' + tabId);
  const btn = document.getElementById('tab-' + tabId);

  if (tab) tab.classList.add('active');
  if (btn) btn.classList.add('active');
}

/* ===== THEME TOGGLE ===== */

function toggleTheme() {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('hr_theme', isDark ? 'dark' : 'light');
  updateThemeIcon(isDark);
}

function updateThemeIcon(isDark) {
  // FIX: HTML uses id="theme-icon", not class ".theme-toggle i"
  const icon = document.getElementById('theme-icon');
  if (icon) {
    icon.className = isDark ? 'ti ti-sun' : 'ti ti-moon';
  }
}

/* ===== TOAST NOTIFICATIONS ===== */

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = msg;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/* ===== SUPPORT MODAL ===== */

function openSupport() {
  const modal = document.getElementById('support-modal');
  if (modal) modal.classList.add('show');
}

function closeSupport() {
  const modal = document.getElementById('support-modal');
  if (modal) modal.classList.remove('show');
}

function selectTip(el, amount) {
  if (!el) return;
  document.querySelectorAll('.tip-amount').forEach(opt => opt.classList.remove('selected'));
  el.classList.add('selected');
  window.selectedTipAmount = amount;

  // Update Gumroad link price
  const link = document.getElementById('gumroad-pay-link');
  if (link) {
    link.setAttribute('data-gumroad-price', amount);
    link.href = `https://husnain555.gumroad.com/l/ylirid?wanted=true&price=${amount}`;
  }
}
function updateTipAmount(amount) {
  const safeAmount = Math.max(1, Number(amount) || 1).toString();
  window.selectedTipAmount = safeAmount;

  const link = document.getElementById('gumroad-pay-link');
  if (link) {
    link.setAttribute('data-gumroad-price', safeAmount);
    link.href = `https://husnain555.gumroad.com/l/ylirid?wanted=true&price=${safeAmount}`;
  }
}
/* ===== FAQ ACCORDION ===== */

function toggleFaq(el) {
  if (!el) return;
  const answer = el.nextElementSibling;
  if (!answer) return;

  // Toggle icon
  const icon = el.querySelector('i');

  // Close all other FAQs
  document.querySelectorAll('.faq-a.show').forEach(a => {
    if (a !== answer) {
      a.classList.remove('show');
      const prevIcon = a.previousElementSibling?.querySelector('i');
      if (prevIcon) prevIcon.className = 'ti ti-plus';
    }
  });

  answer.classList.toggle('show');
  if (icon) {
    icon.className = answer.classList.contains('show') ? 'ti ti-minus' : 'ti ti-plus';
  }
}

/* ===== COPY TEXT (cover letter) ===== */
// FIX: This is the shared copy function. cover-letter.js no longer redefines it.

function copyCoverLetter() {
  const body = document.getElementById('cl-body');
  if (!body) { showToast('Nothing to copy'); return; }

  const text = body.textContent || body.innerText;
  if (!text || text.includes('Writing')) {
    showToast('Generate a cover letter first!');
    return;
  }

  navigator.clipboard.writeText(text).then(() => {
    showToast('Cover letter copied! ✓');
  }).catch(() => {
    showToast('Copy failed. Try selecting and copying manually.');
  });
}

function copyResumeText() {
  const body = document.getElementById('rb-preview-body');
  if (!body) { showToast('Nothing to copy'); return; }

  const text = body.textContent || body.innerText;
  if (!text || text.includes('Crafting')) {
    showToast('Generate a resume first!');
    return;
  }

  navigator.clipboard.writeText(text).then(() => {
    showToast('Resume copied! ✓');
  }).catch(() => {
    showToast('Copy failed. Try selecting manually.');
  });
}

/* ===== INITIALIZATION ===== */

document.addEventListener('DOMContentLoaded', function () {
  // Theme
  const saved = localStorage.getItem('hr_theme');
  const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const useDark = saved === 'dark' || (!saved && sysDark);
  if (useDark) document.body.classList.add('dark');
  updateThemeIcon(useDark);

  // Default page — HTML already has page-home active, but call to be safe
  // showPage('home') — already marked active in HTML

  // Word count for JD field
  const jdInput = document.getElementById('cl-jd');
  if (jdInput) {
    jdInput.addEventListener('input', function () {
      const counter = document.getElementById('jd-count');
      if (counter) {
        const words = this.value.trim() ? this.value.trim().split(/\s+/).length : 0;
        counter.textContent = words + ' words';
      }
    });
  }
    const customAmount = document.getElementById('custom-amount');
  if (customAmount) {
    customAmount.addEventListener('input', function () {
      document.querySelectorAll('.tip-amount').forEach(opt => opt.classList.remove('selected'));
      updateTipAmount(this.value);
    });
  }
});

/* ===== UTILITY ===== */

function countWords(text) {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
