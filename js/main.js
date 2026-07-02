/* ========================================
   HireReady AI - Main Shared Functions
   js/main.js
   ======================================== */

/* ===== PAGE NAVIGATION ===== */
// FIX: HTML page IDs are "page-home", "page-about" etc.
// Nav calls showPage('home'), so we add the "page-" prefix here.

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pg = document.getElementById(id);
  if (pg) { pg.classList.add('active'); window.scrollTo(0, 0); }
}
 
function switchTab(t) {
  document.querySelectorAll('.tab-sec').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const sec = document.getElementById('sec-' + t);
  const btn = document.getElementById('tab-' + t);
  if (sec) sec.classList.add('active');
  if (btn) btn.classList.add('active');
}
 
/* ── THEME ── */
 
function toggleTheme() {
  const dark = document.body.classList.toggle('dark');
  localStorage.setItem('hr_theme', dark ? 'dark' : 'light');
  updateThemeIcon(dark);
}
 
function updateThemeIcon(dark) {
  const i = document.querySelector('.theme-toggle i');
  if (i) i.className = dark ? 'ti ti-sun' : 'ti ti-moon';
}
 
/* ── TOAST ── */
 
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}
 
/* ── SUPPORT MODAL ── */
 
function openSupport() {
  const m = document.getElementById('support-modal');
  if (m) m.classList.add('show');
}
 
function closeSupport() {
  const m = document.getElementById('support-modal');
  if (m) m.classList.remove('show');
}
 
function selectTip(el, amount) {
  document.querySelectorAll('.tip-amount').forEach(o => o.classList.remove('selected'));
  if (el) el.classList.add('selected');
  updateTipAmount(amount);
}
 
function updateTipAmount(amount) {
  const link = document.getElementById('gumroad-pay-link');
  if (link && amount) link.setAttribute('data-gumroad-price', amount);
}
 
/* ── FAQ ── */
 
function toggleFaq(el) {
  if (!el) return;
  const ans = el.nextElementSibling;
  if (!ans) return;
  const icon = el.querySelector('i');
  document.querySelectorAll('.faq-a.show').forEach(a => {
    if (a !== ans) {
      a.classList.remove('show');
      const pi = a.previousElementSibling && a.previousElementSibling.querySelector('i');
      if (pi) pi.className = 'ti ti-plus';
    }
  });
  ans.classList.toggle('show');
  if (icon) icon.className = ans.classList.contains('show') ? 'ti ti-minus' : 'ti ti-plus';
}
 
/* ── COPY HELPERS ── */
 
function copyCoverLetter() {
  const b = document.getElementById('cl-body');
  const text = b ? (b.textContent || b.innerText) : '';
  if (!text || text.includes('Writing')) { showToast('Generate a cover letter first!'); return; }
  navigator.clipboard.writeText(text)
    .then(() => showToast('Copied! ✓'))
    .catch(() => showToast('Copy failed — select text manually.'));
}
 
function copyResumeText() {
  const b = document.getElementById('rb-preview-body');
  const text = b ? (b.textContent || b.innerText) : '';
  if (!text || text.includes('Crafting')) { showToast('Generate a resume first!'); return; }
  navigator.clipboard.writeText(text)
    .then(() => showToast('Copied! ✓'))
    .catch(() => showToast('Copy failed — select text manually.'));
}
 
/* ── UTILITIES ── */
 
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
 
/* ── INIT ── */
 
document.addEventListener('DOMContentLoaded', function () {
  // Apply saved or system theme
  const saved = localStorage.getItem('hr_theme');
  const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = saved === 'dark' || (!saved && sysDark);
  if (dark) document.body.classList.add('dark');
  updateThemeIcon(dark);
 
  // Word counter for cover letter JD field
  const jdInput = document.getElementById('cl-jd');
  if (jdInput) {
    jdInput.addEventListener('input', function () {
      const counter = document.getElementById('jd-count');
      if (counter) {
        const w = this.value.trim() ? this.value.trim().split(/\s+/).length : 0;
        counter.textContent = w + ' words';
      }
    });
  }
 
  // Custom tip amount input
  const customAmount = document.getElementById('custom-amount');
  if (customAmount) {
    customAmount.addEventListener('input', function () {
      document.querySelectorAll('.tip-amount').forEach(o => o.classList.remove('selected'));
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
