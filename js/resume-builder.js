/* ========================================
   HireReady AI - Resume Builder Functions
   js/resume-builder.js
   ======================================== */

/* ===== STATE ===== */

let currentTemplate = 'modern';
let rbPhotoData = '';
let lastAiText = '';      // caches the last AI-generated resume text
let lastFormData = null;  // caches the last collected form data (d)

/* ===== TEMPLATE SELECTOR ===== */

function selectTemplate(template, btnEl) {
  currentTemplate = template;

  document.querySelectorAll('.template-btn').forEach(btn => btn.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  // If a resume was already generated, re-render instantly in the new
  // style without calling the AI again (saves an API call, feels instant)
  if (lastAiText && lastFormData) {
    const previewBody = document.getElementById('rb-preview-body');
    if (previewBody) {
      previewBody.innerHTML = buildResumeHTML(lastFormData, lastAiText);
    }
  }

  showToast(`Style: ${template.charAt(0).toUpperCase() + template.slice(1)}`);
}

/* ===== PHOTO UPLOAD ===== */
// FIX: HTML calls handlePhotoUpload(event) — original was previewPhoto()

function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    showToast('Photo must be smaller than 2MB');
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    rbPhotoData = e.target.result;

    // Show preview
    const placeholder = document.getElementById('rb-photo-placeholder');
    const preview     = document.getElementById('rb-photo-preview');
    const img         = document.getElementById('rb-photo-img');

    if (placeholder) placeholder.style.display = 'none';
    if (preview)     preview.style.display = 'block';
    if (img)         img.src = rbPhotoData;
  };
  reader.readAsDataURL(file);
}

/* ===== DYNAMIC ENTRY MANAGEMENT ===== */
// FIX: HTML calls addExperience(), addEducation(), addProject(), addCert()
// Original only had generic addEntry(type) which these must map to.

function addExperience() {
  const list = document.getElementById('rb-experience-list');
  if (!list) return;

  const count = list.querySelectorAll('.rb-exp-entry').length + 1;
  const entry = document.createElement('div');
  entry.className = 'rb-exp-entry rb-dyn-entry';
  entry.innerHTML = `
    <div class="rb-entry-header">
      <span class="rb-entry-label">Experience ${count}</span>
      <button class="rb-remove-btn" onclick="removeDynEntry(this)"><i class="ti ti-trash"></i> Remove</button>
    </div>
    <div class="rb-grid">
      <div class="rb-field"><label>Company / Organisation</label><input type="text" class="exp-company" placeholder="e.g. Google" /></div>
      <div class="rb-field"><label>Job title / Role</label><input type="text" class="exp-role" placeholder="e.g. Software Engineer" /></div>
      <div class="rb-field"><label>Start date</label><input type="text" class="exp-start" placeholder="e.g. Jan 2022" /></div>
      <div class="rb-field"><label>End date</label><input type="text" class="exp-end" placeholder="e.g. Dec 2023 or Present" /></div>
      <div class="rb-field rb-full"><label>Key responsibilities & achievements</label><textarea class="exp-desc" rows="3" placeholder="e.g. Led a team of 5 engineers, built REST APIs serving 100k users/day, reduced latency by 30%..."></textarea></div>
    </div>
  `;
  list.appendChild(entry);
  showToast('Work experience entry added');
}

function addEducation() {
  const list = document.getElementById('rb-education-list');
  if (!list) return;

  const count = list.querySelectorAll('.rb-edu-entry').length + 1;
  const entry = document.createElement('div');
  entry.className = 'rb-edu-entry rb-dyn-entry';
  entry.innerHTML = `
    <div class="rb-entry-header">
      <span class="rb-entry-label">Education ${count}</span>
      <button class="rb-remove-btn" onclick="removeDynEntry(this)"><i class="ti ti-trash"></i> Remove</button>
    </div>
    <div class="rb-grid">
      <div class="rb-field"><label>Institution</label><input type="text" class="edu-institution" placeholder="e.g. University of Manchester" /></div>
      <div class="rb-field"><label>Degree / Qualification</label><input type="text" class="edu-degree" placeholder="e.g. BSc Computer Science" /></div>
      <div class="rb-field"><label>Field of study</label><input type="text" class="edu-field" placeholder="e.g. Computer Science" /></div>
      <div class="rb-field"><label>Graduation year</label><input type="text" class="edu-year" placeholder="e.g. 2024" /></div>
    </div>
  `;
  list.appendChild(entry);
  showToast('Education entry added');
}

function addProject() {
  const list = document.getElementById('rb-projects-list');
  if (!list) return;

  const count = list.querySelectorAll('.rb-proj-entry').length + 1;
  const entry = document.createElement('div');
  entry.className = 'rb-proj-entry rb-dyn-entry';
  entry.innerHTML = `
    <div class="rb-entry-header">
      <span class="rb-entry-label">Project ${count}</span>
      <button class="rb-remove-btn" onclick="removeDynEntry(this)"><i class="ti ti-trash"></i> Remove</button>
    </div>
    <div class="rb-grid">
      <div class="rb-field"><label>Project name</label><input type="text" class="proj-name" placeholder="e.g. AI Resume Screener" /></div>
      <div class="rb-field"><label>Technologies used</label><input type="text" class="proj-tech" placeholder="e.g. Python, React, AWS" /></div>
      <div class="rb-field rb-full"><label>Description</label><textarea class="proj-desc" rows="2" placeholder="What did you build and what was the impact?"></textarea></div>
      <div class="rb-field"><label>Link (optional)</label><input type="text" class="proj-link" placeholder="e.g. github.com/you/project" /></div>
    </div>
  `;
  list.appendChild(entry);
  showToast('Project added');
}

function addCert() {
  const list = document.getElementById('rb-certs-list');
  if (!list) return;

  const count = list.querySelectorAll('.rb-cert-entry').length + 1;
  const entry = document.createElement('div');
  entry.className = 'rb-cert-entry rb-dyn-entry';
  entry.innerHTML = `
    <div class="rb-entry-header">
      <span class="rb-entry-label">Certification ${count}</span>
      <button class="rb-remove-btn" onclick="removeDynEntry(this)"><i class="ti ti-trash"></i> Remove</button>
    </div>
    <div class="rb-grid">
      <div class="rb-field"><label>Certification name</label><input type="text" class="cert-name" placeholder="e.g. AWS Solutions Architect" /></div>
      <div class="rb-field"><label>Issuing organisation</label><input type="text" class="cert-org" placeholder="e.g. Amazon Web Services" /></div>
      <div class="rb-field"><label>Year</label><input type="text" class="cert-year" placeholder="e.g. 2024" /></div>
    </div>
  `;
  list.appendChild(entry);
  showToast('Certification added');
}

function removeDynEntry(btn) {
  const entry = btn.closest('.rb-dyn-entry');
  if (entry) {
    entry.remove();
    showToast('Entry removed');
  }
}

/* ===== COLLECT FORM DATA ===== */

function collectResumeFormData() {
  // FIX: HTML uses rb- prefix for all IDs
  const name     = (document.getElementById('rb-name')?.value || '').trim();
  const title    = (document.getElementById('rb-title')?.value || '').trim();
  const email    = (document.getElementById('rb-email')?.value || '').trim();
  const phone    = (document.getElementById('rb-phone')?.value || '').trim();
  const location = (document.getElementById('rb-location')?.value || '').trim();
  const linkedin = (document.getElementById('rb-linkedin')?.value || '').trim();
  const website  = (document.getElementById('rb-website')?.value || '').trim();
  const github   = (document.getElementById('rb-github')?.value || '').trim();
  const summary  = (document.getElementById('rb-summary')?.value || '').trim();
  const targetJob= (document.getElementById('rb-target-job')?.value || '').trim();
  const techSkills  = (document.getElementById('rb-tech-skills')?.value || '').trim();
  const softSkills  = (document.getElementById('rb-soft-skills')?.value || '').trim();
  const languages   = (document.getElementById('rb-languages')?.value || '').trim();
  const achievements= (document.getElementById('rb-achievements')?.value || '').trim();

  const experience = [];
  document.querySelectorAll('.rb-exp-entry').forEach(entry => {
    const company = (entry.querySelector('.exp-company')?.value || '').trim();
    const role    = (entry.querySelector('.exp-role')?.value || '').trim();
    const start   = (entry.querySelector('.exp-start')?.value || '').trim();
    const end     = (entry.querySelector('.exp-end')?.value || '').trim();
    const desc    = (entry.querySelector('.exp-desc')?.value || '').trim();
    if (company || role) experience.push({ company, role, start, end, desc });
  });

  const education = [];
  document.querySelectorAll('.rb-edu-entry').forEach(entry => {
    const institution = (entry.querySelector('.edu-institution')?.value || '').trim();
    const degree      = (entry.querySelector('.edu-degree')?.value || '').trim();
    const field       = (entry.querySelector('.edu-field')?.value || '').trim();
    const year        = (entry.querySelector('.edu-year')?.value || '').trim();
    if (institution || degree) education.push({ institution, degree, field, year });
  });

  const projects = [];
  document.querySelectorAll('.rb-proj-entry').forEach(entry => {
    const projName = (entry.querySelector('.proj-name')?.value || '').trim();
    const tech     = (entry.querySelector('.proj-tech')?.value || '').trim();
    const desc     = (entry.querySelector('.proj-desc')?.value || '').trim();
    const link     = (entry.querySelector('.proj-link')?.value || '').trim();
    if (projName) projects.push({ projName, tech, desc, link });
  });

  const certs = [];
  document.querySelectorAll('.rb-cert-entry').forEach(entry => {
    const certName = (entry.querySelector('.cert-name')?.value || '').trim();
    const org      = (entry.querySelector('.cert-org')?.value || '').trim();
    const year     = (entry.querySelector('.cert-year')?.value || '').trim();
    if (certName) certs.push({ certName, org, year });
  });

  return { name, title, email, phone, location, linkedin, website, github,
           summary, targetJob, techSkills, softSkills, languages, achievements,
           experience, education, projects, certs };
}

/* ===== GENERATE RESUME ===== */

async function generateResume() {
  const d = collectResumeFormData();

  if (!d.name) {
    showToast('Please enter your full name');
    return;
  }

  // FIX: button is rb-btn, output is rb-preview / rb-preview-body
  const btn = document.getElementById('rb-btn');
  const preview = document.getElementById('rb-preview');
  const previewBody = document.getElementById('rb-preview-body');

  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader spin"></i> Crafting your resume...';

  preview.style.display = 'block';
  previewBody.innerHTML =
    '<div style="padding:2.5rem;text-align:center;color:#6B7280;font-size:14px">' +
    '<i class="ti ti-loader spin" style="font-size:24px;display:block;margin-bottom:12px;color:#1A56DB"></i>' +
    'Crafting your professional resume...</div>';

  // Build AI prompt
  let prompt = 'You are a professional resume writer. Create a polished, ATS-optimised resume.\n\n';
  prompt += `Name: ${d.name}\n`;
  if (d.title)    prompt += `Professional Title: ${d.title}\n`;
  if (d.email)    prompt += `Email: ${d.email}\n`;
  if (d.phone)    prompt += `Phone: ${d.phone}\n`;
  if (d.location) prompt += `Location: ${d.location}\n`;
  if (d.linkedin) prompt += `LinkedIn: ${d.linkedin}\n`;
  if (d.website)  prompt += `Portfolio: ${d.website}\n`;
  if (d.github)   prompt += `GitHub: ${d.github}\n`;
  if (d.summary)  prompt += `Professional Summary: ${d.summary}\n`;
  if (d.techSkills)  prompt += `Technical Skills: ${d.techSkills}\n`;
  if (d.softSkills)  prompt += `Soft Skills: ${d.softSkills}\n`;
  if (d.languages)   prompt += `Languages: ${d.languages}\n`;
  if (d.achievements)prompt += `Achievements: ${d.achievements}\n`;
  if (d.targetJob)   prompt += `Target Job (for keyword tailoring): ${d.targetJob}\n`;

  if (d.experience.length) {
    prompt += `\nWork Experience:\n`;
    d.experience.forEach((exp, i) => {
      prompt += `  ${i+1}. ${exp.company} — ${exp.role} (${exp.start} to ${exp.end})\n     ${exp.desc}\n`;
    });
  }
  if (d.education.length) {
    prompt += `\nEducation:\n`;
    d.education.forEach((edu, i) => {
      prompt += `  ${i+1}. ${edu.institution}, ${edu.degree} in ${edu.field}, ${edu.year}\n`;
    });
  }
  if (d.projects.length) {
    prompt += `\nProjects:\n`;
    d.projects.forEach((p, i) => {
      prompt += `  ${i+1}. ${p.projName} (${p.tech}): ${p.desc}\n`;
    });
  }
  if (d.certs.length) {
    prompt += `\nCertifications:\n`;
    d.certs.forEach((c, i) => {
      prompt += `  ${i+1}. ${c.certName} — ${c.org} (${c.year})\n`;
    });
  }

  prompt += `
INSTRUCTIONS:
- Write a clean, ATS-optimised resume with clear section headers
- Use these exact section headers: PROFESSIONAL SUMMARY, WORK EXPERIENCE, EDUCATION, SKILLS, PROJECTS, CERTIFICATIONS
- For work experience, write achievement-oriented bullet points with metrics where possible
- Use dash (—) for bullets
- Keep tone professional and confident
- Write ONLY the resume content — no extra commentary or preamble`;

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // FIX: resumes need far more tokens than cover letters (summary +
      // multiple jobs + education + skills + projects + certs easily
      // exceeds the default 1000-token limit, which was silently cutting
      // the AI response off mid-resume — that's why only the top
      // sections ever showed up). max_tokens is capped server-side too.
      body: JSON.stringify({ prompt, max_tokens: 2200 })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    // Cache the raw result + form data so template switching and PDF
    // download can reuse it without another API call
    lastAiText = data.result;
    lastFormData = d;

    // Render styled HTML into preview
    const styledHTML = buildResumeHTML(d, data.result);
    previewBody.innerHTML = styledHTML;
    showToast('Resume generated! ✓');

  } catch (e) {
    previewBody.innerHTML =
      '<div style="padding:1rem;color:#991B1B;font-size:14px">⚠️ Error: ' +
      (e.message || 'Please try again.') + '</div>';
    showToast('Error: ' + (e.message || 'Please try again.'));
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="ti ti-wand"></i> Generate my professional resume';
}

/* ===== PARSE AI TEXT INTO SECTIONS (shared by screen preview + PDF) ===== */

function parseResumeSections(aiText) {
  const sections = {};
  const sectionHeaders = ['PROFESSIONAL SUMMARY', 'WORK EXPERIENCE', 'EDUCATION', 'SKILLS', 'PROJECTS', 'CERTIFICATIONS', 'LANGUAGES'];

  let currentSection = '';
  const lines = (aiText || '').split('\n');
  lines.forEach(line => {
    // Strip common AI formatting noise (markdown bold, leading #/numbers)
    // before checking whether the line is a section header, so headers
    // like "**EDUCATION**" or "## Education" are still recognised.
    const cleanedLine = line.replace(/^[#*\s]+|[#*\s]+$/g, '');
    const upper = cleanedLine.trim().toUpperCase();
    const matched = sectionHeaders.find(h => upper === h || upper.startsWith(h));
    if (matched) {
      currentSection = matched;
      sections[currentSection] = '';
    } else if (currentSection) {
      sections[currentSection] = (sections[currentSection] || '') + line + '\n';
    }
  });

  return sections;
}

/* ===== BUILD STYLED RESUME HTML ===== */

function buildResumeHTML(d, aiText) {
  const sections = parseResumeSections(aiText);
  const photo = rbPhotoData;
  const name  = d.name || '';
  const title = d.title || '';
  const email = d.email || '';
  const phone = d.phone || '';
  const loc   = d.location || '';
  const li    = d.linkedin || '';
  const web   = d.website || '';

  const contactLine = [
    email    ? `📧 ${email}` : '',
    phone    ? `📞 ${phone}` : '',
    loc      ? `📍 ${loc}`   : '',
    li       ? `🔗 ${li}`    : '',
    web      ? `🌐 ${web}`   : ''
  ].filter(Boolean).join('  •  ');

  function sec(label, content, cls = '') {
    if (!content || !content.trim()) return '';
    return `<div class="section-title">${label}</div><div class="section-body ${cls}" style="white-space:pre-wrap;font-size:13px;color:#333;margin-bottom:16px;line-height:1.7">${content.trim()}</div>`;
  }

  if (currentTemplate === 'modern') {
    return `<div class="resume-modern">
      <div class="header">
        ${photo ? `<img src="${photo}" class="header-photo" alt="Profile">` : ''}
        <div class="header-name">${name}</div>
        ${title ? `<div class="header-title">${title}</div>` : ''}
        <div class="header-contact">${contactLine}</div>
      </div>
      ${sec('Professional Summary', sections['PROFESSIONAL SUMMARY'])}
      ${sec('Work Experience', sections['WORK EXPERIENCE'])}
      ${sec('Education', sections['EDUCATION'])}
      ${sections['SKILLS'] ? `<div class="section-title">Skills</div><div class="skills-container">${sections['SKILLS'].split(/[,\n—–-]+/).map(s=>s.trim()).filter(Boolean).map(s=>`<span class="skill-tag">${s}</span>`).join('')}</div>` : ''}
      ${sec('Projects', sections['PROJECTS'])}
      ${sec('Certifications', sections['CERTIFICATIONS'])}
    </div>`;
  }

  if (currentTemplate === 'executive') {
    return `<div class="resume-executive">
      <div class="header">
        ${photo ? `<img src="${photo}" class="header-photo" alt="Profile">` : ''}
        <div class="header-info">
          <div class="header-name">${name}</div>
          ${title ? `<div class="header-title">${title}</div>` : ''}
          <div class="header-contact"><span>${contactLine}</span></div>
        </div>
      </div>
      ${sec('Summary', sections['PROFESSIONAL SUMMARY'])}
      ${sec('Professional Experience', sections['WORK EXPERIENCE'])}
      ${sec('Education', sections['EDUCATION'])}
      ${sec('Core Competencies', sections['SKILLS'])}
      ${sec('Projects', sections['PROJECTS'])}
      ${sec('Certifications', sections['CERTIFICATIONS'])}
    </div>`;
  }

  if (currentTemplate === 'creative') {
    return `<div class="resume-creative"><div class="wrapper">
      <div class="header">
        ${photo ? `<img src="${photo}" class="header-photo" alt="Profile">` : ''}
        <div class="header-name">${name}</div>
        ${title ? `<div class="header-title">${title}</div>` : ''}
        <div class="header-contact">${contactLine}</div>
      </div>
      <div class="content">
        ${sec('About', sections['PROFESSIONAL SUMMARY'])}
        ${sec('Experience', sections['WORK EXPERIENCE'])}
        ${sec('Education', sections['EDUCATION'])}
        ${sec('Skills', sections['SKILLS'])}
        ${sec('Projects', sections['PROJECTS'])}
        ${sec('Certifications', sections['CERTIFICATIONS'])}
      </div>
    </div></div>`;
  }

  // ATS template
  return `<div class="resume-ats">
    <div class="header">
      <div class="header-name">${name}</div>
      ${title ? `<div class="header-title">${title}</div>` : ''}
      <div class="header-contact">${[email,phone,loc].filter(Boolean).join(' | ')}</div>
    </div>
    ${sec('PROFESSIONAL SUMMARY', sections['PROFESSIONAL SUMMARY'])}
    ${sec('WORK EXPERIENCE', sections['WORK EXPERIENCE'])}
    ${sec('EDUCATION', sections['EDUCATION'])}
    ${sec('SKILLS', sections['SKILLS'])}
    ${sec('PROJECTS', sections['PROJECTS'])}
    ${sec('CERTIFICATIONS', sections['CERTIFICATIONS'])}
  </div>`;
}

/* ===== PDF DOWNLOAD FOR RESUME ===== */
// FIX: The old version scraped `.textContent` from the preview div and
// guessed at paragraph breaks. Sibling <div>s (name/title/contact line)
// have no real separator in .textContent, so lines ran together, and if
// the AI response had been truncated (see max_tokens fix above) whatever
// was missing on screen was also missing here. This version builds the
// PDF straight from the same structured data + parsed sections used for
// the on-screen preview, so what you see is what you download — always
// complete, always separated correctly.

function downloadResumePDF() {
  if (!lastAiText || !lastFormData) {
    showToast('Generate a resume first!');
    return;
  }

  const d = lastFormData;
  const sections = parseResumeSections(lastAiText);
  const name = d.name || 'Resume';

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

  const PW = 210, PH = 297, ML = 25.4, MR = 25.4, CW = PW - ML - MR;
  const FS = 10.5, LH = 5.2;
  let y = 22;

  function ensureSpace(needed) {
    if (y + needed > PH - 20) {
      doc.addPage();
      y = 22;
    }
  }

  // ── Photo (skip for ATS-style download — recruiters' ATS software
  //    generally strips/mishandles images, so we keep the PDF text-safe) ──
  const includePhoto = currentTemplate !== 'ats' && !!rbPhotoData;
  let textStartX = ML;
  if (includePhoto) {
    try {
      const imgSize = 24;
      doc.addImage(rbPhotoData, 'JPEG', PW - MR - imgSize, y, imgSize, imgSize);
    } catch (e) {
      console.warn('Could not embed photo in PDF:', e);
    }
  }

  // ── Header: name, title, contact line ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(26, 86, 219);
  doc.text(name.toUpperCase(), textStartX, y + 6);
  y += 12;

  if (d.title) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text(d.title, textStartX, y);
    y += 6;
  }

  const contactParts = [
    d.email ? d.email : '',
    d.phone ? d.phone : '',
    d.location ? d.location : '',
    d.linkedin ? d.linkedin : '',
    d.website ? d.website : '',
    d.github ? d.github : ''
  ].filter(Boolean);
  if (contactParts.length) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(100, 100, 100);
    const contactLines = doc.splitTextToSize(contactParts.join('   |   '), CW);
    contactLines.forEach(line => { doc.text(line, textStartX, y); y += 4.5; });
  }

  y += 2;
  doc.setDrawColor(26, 86, 219);
  doc.setLineWidth(0.6);
  doc.line(ML, y, PW - MR, y);
  y += 8;

  // ── Section renderer: bold blue header + bullet-aware body ──
  function renderSection(label, content) {
    if (!content || !content.trim()) return;

    ensureSpace(12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(26, 86, 219);
    doc.text(label.toUpperCase(), ML, y);
    y += 1.5;
    doc.setDrawColor(210, 220, 240);
    doc.setLineWidth(0.3);
    doc.line(ML, y, PW - MR, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FS);
    doc.setTextColor(30, 30, 30);

    const rawLines = content.split('\n').map(l => l.trim()).filter(Boolean);
    rawLines.forEach(rawLine => {
      const isBullet = /^[-—•*]\s*/.test(rawLine);
      const cleanLine = rawLine.replace(/^[-—•*]\s*/, '');
      const indent = isBullet ? ML + 4 : ML;
      const width = isBullet ? CW - 4 : CW;
      const prefix = isBullet ? '•  ' : '';

      const wrapped = doc.splitTextToSize(prefix + cleanLine, width);
      wrapped.forEach(line => {
        ensureSpace(LH);
        doc.text(line, indent, y);
        y += LH;
      });
    });
    y += 4;
  }

  renderSection('Professional Summary', sections['PROFESSIONAL SUMMARY']);
  renderSection('Work Experience', sections['WORK EXPERIENCE']);
  renderSection('Education', sections['EDUCATION']);
  renderSection('Skills', sections['SKILLS']);
  renderSection('Projects', sections['PROJECTS']);
  renderSection('Certifications', sections['CERTIFICATIONS']);
  renderSection('Languages', sections['LANGUAGES']);

  const filename = 'Resume_' + name.replace(/[^a-zA-Z0-9]/g, '_') + '.pdf';
  doc.save(filename);
  showToast('PDF downloaded! ✓');
}

/* ===== ATS ANALYZER ===== */

async function analyzeResume() {
  const resumeText = (document.getElementById('ats-resume')?.value || '').trim();
  const jdText     = (document.getElementById('ats-jd')?.value || '').trim();

  if (!resumeText) {
    showToast('Please paste your resume text first');
    return;
  }

  const btn = document.getElementById('ats-btn');
  const result = document.getElementById('ats-result');

  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader spin"></i> Analyzing...';
  result.style.display = 'block';

  document.getElementById('ats-score-num').textContent = '--';
  document.getElementById('ats-grade').textContent = '--';
  document.getElementById('ats-summary-text').textContent = 'Analyzing your resume...';
  document.getElementById('ats-sections').innerHTML = '';
  document.getElementById('ats-strengths').innerHTML = '';
  document.getElementById('ats-improvements').innerHTML = '';
  document.getElementById('ats-kw-found').innerHTML = '';
  document.getElementById('ats-kw-missing').innerHTML = '';

  const prompt = `You are an expert ATS resume analyzer. Analyze the resume below and return ONLY a JSON object (no markdown, no explanation) with this exact structure:
{
  "score": <number 0-100>,
  "grade": "<A/B/C/D/F>",
  "summary": "<2 sentence overall assessment>",
  "sections_found": ["Contact Info","Summary","Experience","Education","Skills"],
  "sections_missing": ["Certifications"],
  "strengths": ["strength 1","strength 2","strength 3"],
  "improvements": ["improvement 1","improvement 2","improvement 3","improvement 4","improvement 5"],
  "keywords_found": ["keyword1","keyword2"],
  "keywords_missing": ["keyword3","keyword4"]
}

RESUME:
${resumeText}

${jdText ? `JOB DESCRIPTION:\n${jdText}` : ''}`;

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    let parsed;
    try {
      const clean = data.result.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(clean);
    } catch {
      throw new Error('Could not parse AI response. Please try again.');
    }

    // Score ring color
    const score = parseInt(parsed.score) || 0;
    const ring = document.getElementById('ats-score-ring');
    const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
    ring.style.borderColor = color;

    document.getElementById('ats-score-num').textContent = score;
    document.getElementById('ats-grade').textContent = parsed.grade || '';
    document.getElementById('ats-grade').style.color = color;
    document.getElementById('ats-summary-text').textContent = parsed.summary || '';

    // Sections
    const secEl = document.getElementById('ats-sections');
    (parsed.sections_found || []).forEach(s => {
      secEl.innerHTML += `<div class="ats-section-item found"><i class="ti ti-circle-check"></i> ${s}</div>`;
    });
    (parsed.sections_missing || []).forEach(s => {
      secEl.innerHTML += `<div class="ats-section-item missing"><i class="ti ti-circle-x"></i> ${s} <span style="font-size:11px;color:#EF4444">(missing)</span></div>`;
    });

    // Strengths
    const strEl = document.getElementById('ats-strengths');
    (parsed.strengths || []).forEach(s => {
      strEl.innerHTML += `<div class="ats-point"><i class="ti ti-star" style="color:#F59E0B"></i> ${s}</div>`;
    });

    // Improvements
    const impEl = document.getElementById('ats-improvements');
    (parsed.improvements || []).forEach((s, i) => {
      impEl.innerHTML += `<div class="ats-point"><span class="ats-num">${i+1}</span> ${s}</div>`;
    });

    // Keywords
    const kwFound   = document.getElementById('ats-kw-found');
    const kwMissing = document.getElementById('ats-kw-missing');
    (parsed.keywords_found || []).forEach(k => {
      kwFound.innerHTML += `<span class="ats-kw found">${k}</span>`;
    });
    (parsed.keywords_missing || []).forEach(k => {
      kwMissing.innerHTML += `<span class="ats-kw missing">${k}</span>`;
    });

    showToast('ATS analysis complete! ✓');

  } catch (e) {
    document.getElementById('ats-summary-text').textContent = '⚠️ Error: ' + (e.message || 'Please try again.');
    showToast('Error: ' + (e.message || 'Please try again.'));
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="ti ti-chart-bar"></i> Analyze my resume — free';
}
