
/* ========================================
   HireReady AI - Cover Letter Functions
   js/cover-letter.js
   ======================================== */

/* ===== STATE ===== */

let tone = 'professional';
let selectedTipAmount = '3';

/* ===== TONE SELECTOR ===== */

function selTone(el, t) {
  if (!el) return;
  
  document.querySelectorAll('.tone-btn').forEach(btn => btn.classList.remove('active'));
  el.classList.add('active');
  tone = t;
  showToast(`Tone: ${t.charAt(0).toUpperCase() + t.slice(1)}`);
}

/* ===== WORD COUNT ===== */

function updateWordCount() {
  const jd = document.getElementById('cl-jd');
  const counter = document.getElementById('jd-count');
  
  if (jd && counter) {
    const words = countWords(jd.value);
    counter.textContent = `${words} words`;
  }
}

// Listen to input changes
document.addEventListener('DOMContentLoaded', function() {
  const jdInput = document.getElementById('cl-jd');
  if (jdInput) {
    jdInput.addEventListener('input', updateWordCount);
  }
});

/* ===== COPY TEXT ===== */

function copyText(type) {
  if (type !== 'cl') return;
  
  const body = document.getElementById('cl-body');
  if (!body) {
    showToast('Nothing to copy');
    return;
  }
  
  const text = body.textContent || body.innerText;
  if (!text || text.includes('Generating')) {
    showToast('Generate a cover letter first!');
    return;
  }
  
  navigator.clipboard.writeText(text).then(() => {
    showToast('Cover letter copied to clipboard! ✓');
  }).catch(err => {
    console.error('Copy failed:', err);
    showToast('Copy failed. Try again.');
  });
}

/* ===== EMAIL COLLECTION ===== */

function collectEmail() {
  const emailInput = document.getElementById('email-collect');
  if (!emailInput) return;
  
  const email = emailInput.value.trim();
  
  if (!email) {
    showToast('Please enter your email');
    return;
  }
  
  if (!isValidEmail(email)) {
    showToast('Invalid email address');
    return;
  }
  
  // Send to backend
  fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      showToast('Thanks! Check your email for exclusive tips. 📧');
      emailInput.value = '';
      const collectBox = document.getElementById('email-collect-box');
      if (collectBox) collectBox.style.display = 'none';
    } else {
      showToast('Error: ' + (data.error || 'Please try again'));
    }
  })
  .catch(err => {
    console.error('Error:', err);
    showToast('Unable to subscribe. Try again later.');
  });
}

/* ===== GENERATE COVER LETTER ===== */

async function generateCoverLetter() {
  const name = document.getElementById('cl-name').value.trim();
  const job = document.getElementById('cl-job').value.trim();
  const company = document.getElementById('cl-company').value.trim();
  const skills = document.getElementById('cl-skills').value.trim();
  const jd = document.getElementById('cl-jd').value.trim();

  // Validate
  if (!name || !job || !company) {
    showToast('Please fill in Name, Job Title, and Company');
    return;
  }

  // Show loading
  const btn = document.getElementById('cl-btn');
  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader spin"></i> Generating...';

  const out = document.getElementById('cl-out');
  out.classList.add('show');
  document.getElementById('cl-body').innerHTML =
    '<div style="padding:2.5rem;text-align:center;color:#6B7280;font-size:14px"><i class="ti ti-loader spin" style="font-size:24px;display:block;margin-bottom:12px;color:#1A56DB"></i>Writing your cover letter...</div>';

  // Build prompt
  let prompt = `You are a professional cover letter writer. Write a compelling, personalized cover letter.\n\n`;
  prompt += `Candidate: ${name}\n`;
  prompt += `Target Job: ${job}\n`;
  prompt += `Company: ${company}\n`;
  if (skills) prompt += `Key Skills: ${skills}\n`;
  if (jd) prompt += `Job Description:\n${jd}\n`;
  prompt += `\nTone: ${tone}\n`;

  prompt += `
INSTRUCTIONS:
- Write a professional cover letter (3-4 paragraphs)
- Opening: Express interest in the specific position at the company
- Middle: Highlight relevant skills and experiences that match the job requirements
- Closing: Call to action - invite them to discuss further
- Keep tone ${tone}
- Address letter to "Hiring Manager" (generic, since no specific name given)
- Sign-off: "Best regards, ${name}"
- Write only the cover letter - no extra commentary
- Use line breaks between paragraphs`;

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    // Display cover letter
    document.getElementById('cl-body').textContent = data.result;

    // Show email collection
    showToast('Cover letter generated! ✓');
    
    // Optional: Show email collection box after short delay
    setTimeout(() => {
      const collectBox = document.getElementById('email-collect-box');
      if (collectBox) collectBox.style.display = 'block';
    }, 500);

  } catch (e) {
    document.getElementById('cl-body').innerHTML =
      '<div style="padding:1rem;color:#991B1B;font-size:14px">⚠️ Error: ' + (e.message || 'Please try again.') + '</div>';
    showToast('Error: ' + (e.message || 'Please try again.'));
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="ti ti-wand"></i> Generate Cover Letter — Free';
}

/* ===== PDF DOWNLOAD ===== */

function downloadPDF(type) {
  if (type !== 'cl') return;
  
  const body = document.getElementById('cl-body');
  if (!body) {
    showToast('Generate a cover letter first!');
    return;
  }
  
  const text = body.textContent;
  if (!text || text.includes('Generating')) {
    showToast('Generate a cover letter first!');
    return;
  }

  const name = document.getElementById('cl-name').value.trim() || 'Cover_Letter';
  const job = document.getElementById('cl-job').value.trim() || 'Position';
  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  
  const PW = 210, PH = 297, ML = 25.4, MR = 25.4, CW = PW - ML - MR;
  const FS = 11, LH = 5;
  let y = 25;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(26, 86, 219);
  doc.text(name.toUpperCase(), ML, y);
  y += 8;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`Cover Letter for ${job}`, ML, y);
  y += 8;
  
  doc.setLineWidth(0.5);
  doc.setDrawColor(229, 231, 235);
  doc.line(ML, y, PW - MR, y);
  y += 10;

  // Body
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(FS);
  doc.setTextColor(17, 24, 39);

  const paras = text.split(/\n\s*\n/).filter(p => p.trim());
  paras.forEach(p => {
    const clean = p.replace(/\s+/g, ' ').trim();
    const lines = doc.splitTextToSize(clean, CW);
    
    lines.forEach(line => {
      if (y + LH > PH - 25) {
        doc.addPage();
        y = 25;
      }
      doc.text(line, ML, y);
      y += LH;
    });
    y += 8;
  });

  const filename = `Cover_Letter_${name}_${job}`.replace(/[^a-zA-Z0-9]/g, '_') + '.pdf';
  doc.save(filename);
  showToast('PDF downloaded! ✓');
}

/* ===== CLEAR FORM ===== */

function clearForm(type) {
  if (type !== 'cl') return;
  
  document.getElementById('cl-name').value = '';
  document.getElementById('cl-job').value = '';
  document.getElementById('cl-company').value = '';
  document.getElementById('cl-skills').value = '';
  document.getElementById('cl-jd').value = '';
  
  updateWordCount();
  
  document.getElementById('cl-out').classList.remove('show');
  const collectBox = document.getElementById('email-collect-box');
  if (collectBox) collectBox.style.display = 'none';
  
  showToast('Form cleared');
}
