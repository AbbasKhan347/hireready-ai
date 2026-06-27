
/* ========================================
   HireReady AI - Main Shared Functions
   js/main.js
   ======================================== */

/* ===== PAGE NAVIGATION ===== */

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(pageId);
  if (page) page.classList.add('active');
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-sec').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  
  const tab = document.getElementById(`sec-${tabId}`);
  const btn = document.getElementById(`tab-${tabId}`);
  
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
  const icon = document.querySelector('.theme-toggle i');
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
  document.querySelectorAll('.tip-option').forEach(opt => opt.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('tip-amount').value = amount;
  window.selectedTipAmount = amount;
}

function goToPayment() {
  const amount = document.getElementById('tip-amount').value || '3';
  if (window.Gumroad && window.Gumroad.open) {
    window.Gumroad.open({
      'product_id': 'ylirid',
      'wanted': true,
      'custom_price': parseInt(amount)
    });
  } else {
    showToast('Payment system loading...');
  }
}

/* ===== FAQ ACCORDION ===== */

function toggleFaq(el) {
  if (!el) return;
  const answer = el.nextElementSibling;
  if (!answer) return;
  
  // Close all other FAQs
  document.querySelectorAll('.faq-a.show').forEach(a => {
    if (a !== answer) a.classList.remove('show');
  });
  
  // Toggle current answer
  answer.classList.toggle('show');
}

/* ===== COPY TEXT ===== */

function copyText(type) {
  const bodyId = type === 'cl' ? 'cl-body' : 'rs-body';
  const body = document.getElementById(bodyId);
  
  if (!body) {
    showToast('Nothing to copy');
    return;
  }
  
  const text = body.textContent || body.innerText;
  if (!text || text.includes('Crafting')) {
    showToast('Generate a document first!');
    return;
  }
  
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard! ✓');
  }).catch(err => {
    console.error('Copy failed:', err);
    showToast('Copy failed. Try again.');
  });
}

/* ===== INITIALIZATION ===== */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize theme from localStorage or system preference
  const saved = localStorage.getItem('hr_theme');
  const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const useDark = saved === 'dark' || (!saved && sysDark);
  
  if (useDark) {
    document.body.classList.add('dark');
  }
  
  updateThemeIcon(useDark);
  
  // Show home page by default
  showPage('page-home');
  
  // Initialize Gumroad if available
  if (window.Gumroad) {
    window.Gumroad.init();
  }
  
  // Initialize tip selection
  window.selectedTipAmount = '3';
});

/* ===== UTILITY FUNCTIONS ===== */

// Word count helper
function countWords(text) {
  return text.trim().split(/\s+/).length;
}

// Validate email
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Format date
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
