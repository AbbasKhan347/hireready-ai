/* ========================================
   HireReady AI - Cover Letter Functions
   js/cover-letter.js
   ======================================== */

/* ===== STATE ===== */

let tone = 'professional';

/* ===== TONE SELECTOR ===== */
// HTML calls: selTone(this,'professional')

function selTone(el, t) {
  if (!el) return;
  document.querySelectorAll('.tone-opt').forEach(btn => btn.classList.remove('active'));
  el.classList.add('active');
  tone = t;
  showToast('Tone: ' + t.charAt(0).toUpperCase() + t.slice(1));
}

/* ===== EMAIL COLLECTION ===== */
// FIX: HTML input id="collect-email", button calls collectEmail()

function collectEmail() {
  // FIX: was reading 'email-collect' — correct id is 'collect-email'
  const emailInput = document.getElementById('collect-email');
  if (!emailInput) return;

  const email = emailInput.value.trim();
  if (!email) { showToast('Please enter your email'); return; }
  if (!isValidEmail(email)) { showToast('Invalid email address'); return; }

  fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast('Thanks! Check your email for tips. 📧');
        emailInput.value = '';
        const box = document.getElementById('email-collect');
        if (box) box.style.display = 'none';
      } else {
        showToast('Error: ' + (data.error || 'Please try again'));
      }
    })
    .catch(() => showToast('Unable to subscribe. Try again later.'));
}

/* ===== GENERATE COVER LETTER ===== */

async function generateCoverLetter() {
  const name    = document.getElementById('cl-name').value.trim();
  const job     = document.getElementById('cl-job').value.trim();
  const company = document.getElementById('cl-company').value.trim();
  const level   = document.getElementById('cl-level')?.value || '';
  const skills  = document.getElementById('cl-skills').value.trim();
  const jd      = document.getElementById('cl-jd').value.trim();

  if (!name || !job || !company) {
    showToast('Please fill in Name, Job Title, and Company');
    return;
  }

  const btn = document.getElementById('cl-btn');
  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader spin"></i> Generating...';

  const out = document.getElementById('cl-out');
  out.classList.add('show');
  document.getElementById('cl-body').innerHTML =
    '<div style="padding:2.5rem;text-align:center;color:#6B7280;font-size:14px">' +
    '<i class="ti ti-loader spin" style="font-size:24px;display:block;margin-bottom:12px;color:#1A56DB"></i>' +
    'Writing your cover letter...</div>';

  // Hide upsell while generating
  const upsell = document.getElementById('cl-upsell');
  if (upsell) upsell.style.display = 'none';

  let prompt = 'You are a professional cover letter writer. Write a compelling, personalized cover letter.\n\n';
  prompt += `Candidate: ${name}\n`;
  prompt += `Target Job: ${job}\n`;
  prompt += `Company: ${company}\n`;
  if (level) prompt += `Experience Level: ${level}\n`;
  if (skills) prompt += `Key Skills: ${skills}\n`;
  if (jd) prompt += `Job Description:\n${jd}\n`;
  prompt += `\nTone: ${tone}\n`;
  prompt += `
INSTRUCTIONS:
- Write a professional cover letter (3-4 paragraphs)
- Opening: Express genuine interest in the specific position at ${company}
- Middle: Highlight relevant skills and experience that match the job
- Closing: Call to action — invite them to discuss further
- Keep tone ${tone}
- Address to "Hiring Manager"
- Sign off: "Best regards,\n${name}"
- Write ONLY the cover letter — no extra commentary
- Use blank lines between paragraphs`;

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    document.getElementById('cl-body').textContent = data.result;
    showToast('Cover letter generated! ✓');

    // Show upsell after generation
    if (upsell) upsell.style.display = '';

    // Show email box after short delay
    setTimeout(() => {
      const box = document.getElementById('email-collect');
      if (box) box.style.display = '';
    }, 800);

  } catch (e) {
    document.getElementById('cl-body').innerHTML =
      '<div style="padding:1rem;color:#991B1B;font-size:14px">⚠️ Error: ' +
      (e.message || 'Please try again.') + '</div>';
    showToast('Error: ' + (e.message || 'Please try again.'));
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="ti ti-wand"></i> Generate my cover letter — free';
}

/* ===== PDF DOWNLOAD ===== */
// FIX: HTML button calls downloadPDF() with no args — was failing because
// original function required type arg and checked type !== 'cl'.

function downloadPDF() {
  const body = document.getElementById('cl-body');
  if (!body) { showToast('Generate a cover letter first!'); return; }

  const text = body.textContent;
  if (!text || text.includes('Writing')) {
    showToast('Generate a cover letter first!');
    return;
  }

  const name = document.getElementById('cl-name').value.trim() || 'Cover_Letter';
  const job  = document.getElementById('cl-job').value.trim()  || 'Position';

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

  const PW = 210, PH = 297, ML = 25.4, MR = 25.4, CW = PW - ML - MR;
  const FS = 11, LH = 5.5;
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
  doc.text('Cover Letter — ' + job, ML, y);
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
      if (y + LH > PH - 25) { doc.addPage(); y = 25; }
      doc.text(line, ML, y);
      y += LH;
    });
    y += 6;
  });

  const filename = ('Cover_Letter_' + name + '_' + job).replace(/[^a-zA-Z0-9]/g, '_') + '.pdf';
  doc.save(filename);
  showToast('PDF downloaded! ✓');
}

/* ===== CLEAR FORM ===== */
// FIX: HTML calls clearForm() with no args — original checked type !== 'cl' and returned early

function clearForm() {
  const ids = ['cl-name', 'cl-job', 'cl-company', 'cl-skills', 'cl-jd'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  const level = document.getElementById('cl-level');
  if (level) level.selectedIndex = 0;

  const counter = document.getElementById('jd-count');
  if (counter) counter.textContent = '0 words';

  // Reset tone
  document.querySelectorAll('.tone-opt').forEach(b => b.classList.remove('active'));
  const firstTone = document.querySelector('.tone-opt');
  if (firstTone) firstTone.classList.add('active');
  tone = 'professional';

  document.getElementById('cl-out').classList.remove('show');
  const box = document.getElementById('email-collect');
  if (box) box.style.display = 'none';
  const upsell = document.getElementById('cl-upsell');
  if (upsell) upsell.style.display = 'none';

  showToast('Form cleared');
}
