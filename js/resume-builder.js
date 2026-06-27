
/* ========================================
   HireReady AI - Resume Builder Functions
   js/resume-builder.js
   ======================================== */

/* ===== STATE ===== */

let currentTemplate = 'modern';

/* ===== TEMPLATE SELECTOR ===== */

function selectTemplate(template) {
  currentTemplate = template;
  
  // Update active button
  document.querySelectorAll('.template-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.closest('.template-btn').classList.add('active');
  
  // Regenerate if resume already shown
  const output = document.getElementById('rs-out');
  if (output && output.classList.contains('show')) {
    generateResume();
  }
  
  showToast(`Template changed to ${template.charAt(0).toUpperCase() + template.slice(1)}`);
}

/* ===== RESUME HTML BUILDER ===== */

function buildResumeHTML(name, title, email, phone, location, photo, text) {
  const photo64 = photo || '';
  
  // Parse sections from AI-generated text
  let summary = '';
  let workExperience = '';
  let education = '';
  let skills = '';
  let certifications = '';
  
  const sections = text.split(/(?=PROFESSIONAL SUMMARY|WORK EXPERIENCE|EDUCATION|SKILLS|CERTIFICATIONS|LANGUAGES)/i);
  
  sections.forEach(section => {
    if (section.includes('PROFESSIONAL SUMMARY') || section.includes('SUMMARY')) {
      summary = section.replace(/PROFESSIONAL SUMMARY|SUMMARY/i, '').trim();
    } else if (section.includes('WORK EXPERIENCE') || section.includes('EXPERIENCE')) {
      workExperience = section.replace(/WORK EXPERIENCE|EXPERIENCE/i, '').trim();
    } else if (section.includes('EDUCATION')) {
      education = section.replace(/EDUCATION/i, '').trim();
    } else if (section.includes('SKILLS')) {
      skills = section.replace(/SKILLS/i, '').trim();
    } else if (section.includes('CERTIFICATIONS') || section.includes('AWARDS')) {
      certifications = section.replace(/CERTIFICATIONS|AWARDS/i, '').trim();
    }
  });
  
  let html = '';
  
  // MODERN TEMPLATE
  if (currentTemplate === 'modern') {
    html = `
      <div class="resume-modern">
        <div class="header">
          ${photo64 ? `<img src="${photo64}" class="header-photo" alt="Profile Photo">` : ''}
          <div class="header-name">${name}</div>
          ${title ? `<div class="header-title">${title}</div>` : ''}
          <div class="header-contact">
            ${email ? `<span>📧 ${email}</span>` : ''}
            ${phone ? `<span>📞 ${phone}</span>` : ''}
            ${location ? `<span>📍 ${location}</span>` : ''}
          </div>
        </div>
        
        ${summary ? `
          <div>
            <div class="section-title">Professional Summary</div>
            <p style="font-size: 13px; color: #555; margin: 0 0 20px 0;">${summary}</p>
          </div>
        ` : ''}
        
        ${workExperience ? `
          <div>
            <div class="section-title">Work Experience</div>
            <div style="white-space: pre-wrap; font-size: 12px; color: #333;">${workExperience}</div>
          </div>
        ` : ''}
        
        ${education ? `
          <div>
            <div class="section-title">Education</div>
            <div style="white-space: pre-wrap; font-size: 12px; color: #333;">${education}</div>
          </div>
        ` : ''}
        
        ${skills ? `
          <div>
            <div class="section-title">Skills</div>
            <div class="skills-container">
              ${skills.split(',').map(s => `<span class="skill-tag">${s.trim()}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        
        ${certifications ? `
          <div>
            <div class="section-title">Certifications</div>
            <div style="white-space: pre-wrap; font-size: 12px; color: #333;">${certifications}</div>
          </div>
        ` : ''}
      </div>
    `;
  }
  // EXECUTIVE TEMPLATE
  else if (currentTemplate === 'executive') {
    html = `
      <div class="resume-executive">
        <div class="header">
          ${photo64 ? `<img src="${photo64}" class="header-photo" alt="Profile Photo">` : ''}
          <div class="header-info">
            <div class="header-name">${name}</div>
            ${title ? `<div class="header-title">${title}</div>` : ''}
            <div class="header-contact">
              ${email ? `<span>📧 ${email}</span>` : ''}
              ${phone ? `<span>📞 ${phone}</span>` : ''}
              ${location ? `<span>📍 ${location}</span>` : ''}
            </div>
          </div>
        </div>
        
        ${summary ? `
          <div class="section-title">Summary</div>
          <p style="font-size: 12px; color: #333; margin: 0 0 20px 0; line-height: 1.8;">${summary}</p>
        ` : ''}
        
        ${workExperience ? `
          <div class="section-title">Professional Experience</div>
          <div style="white-space: pre-wrap; font-size: 11px; color: #333; line-height: 1.8;">${workExperience}</div>
        ` : ''}
        
        ${education ? `
          <div class="section-title">Education</div>
          <div style="white-space: pre-wrap; font-size: 11px; color: #333;">${education}</div>
        ` : ''}
        
        ${skills ? `
          <div class="section-title">Core Competencies</div>
          <p style="font-size: 11px; color: #333;">${skills}</p>
        ` : ''}
      </div>
    `;
  }
  // CREATIVE TEMPLATE
  else if (currentTemplate === 'creative') {
    html = `
      <div class="resume-creative">
        <div class="wrapper">
          <div class="header">
            ${photo64 ? `<img src="${photo64}" class="header-photo" alt="Profile Photo">` : ''}
            <div class="header-name">${name}</div>
            ${title ? `<div class="header-title">${title}</div>` : ''}
            <div class="header-contact">
              ${email ? `<span>${email}</span>` : ''}
              ${phone ? `<span>${phone}</span>` : ''}
              ${location ? `<span>${location}</span>` : ''}
            </div>
          </div>
          
          <div class="content">
            ${summary ? `
              <div class="section-title">About</div>
              <p style="font-size: 13px; color: #555; margin: 0 0 15px 0;">${summary}</p>
            ` : ''}
            
            ${workExperience ? `
              <div class="section-title">Experience</div>
              <div style="white-space: pre-wrap; font-size: 12px; color: #333; margin-bottom: 15px;">${workExperience}</div>
            ` : ''}
            
            ${education ? `
              <div class="section-title">Education</div>
              <div style="white-space: pre-wrap; font-size: 12px; color: #333; margin-bottom: 15px;">${education}</div>
            ` : ''}
            
            ${skills ? `
              <div class="section-title">Skills</div>
              <p style="font-size: 12px; color: #333;">${skills}</p>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }
  // ATS-FRIENDLY TEMPLATE
  else if (currentTemplate === 'ats') {
    html = `
      <div class="resume-ats">
        <div class="header">
          <div class="header-name">${name}</div>
          ${title ? `<div class="header-title">${title}</div>` : ''}
          <div class="header-contact">
            ${email ? `${email} | ` : ''}
            ${phone ? `${phone} | ` : ''}
            ${location ? `${location}` : ''}
          </div>
        </div>
        
        ${summary ? `
          <div class="section-title">PROFESSIONAL SUMMARY</div>
          <div style="font-size: 11px; margin-bottom: 10px;">${summary}</div>
        ` : ''}
        
        ${workExperience ? `
          <div class="section-title">WORK EXPERIENCE</div>
          <div style="white-space: pre-wrap; font-size: 11px; margin-bottom: 10px;">${workExperience}</div>
        ` : ''}
        
        ${education ? `
          <div class="section-title">EDUCATION</div>
          <div style="white-space: pre-wrap; font-size: 11px; margin-bottom: 10px;">${education}</div>
        ` : ''}
        
        ${skills ? `
          <div class="section-title">SKILLS</div>
          <div style="font-size: 11px;">${skills}</div>
        ` : ''}
      </div>
    `;
  }
  
  return html;
}

/* ===== ENTRY MANAGEMENT (Add/Remove Rows) ===== */

function addEntry(type) {
  const container = document.getElementById(
    type === 'education' ? 'education-entries' : 'experience-entries'
  );
  
  if (!container) return;
  
  const template = container.querySelector(`.${type}-entry`);
  if (!template) return;
  
  const clone = template.cloneNode(true);
  
  // Clear input values
  clone.querySelectorAll('input').forEach(inp => inp.value = '');
  
  // Update remove button
  const removeBtn = clone.querySelector('.remove-btn');
  if (removeBtn) {
    removeBtn.onclick = function() { removeEntry(this, type); };
  }
  
  container.appendChild(clone);
  showToast(`${type === 'education' ? 'Education' : 'Experience'} entry added`);
}

function removeEntry(btn, type) {
  const entry = btn.closest(`.${type}-entry`);
  const container = document.getElementById(
    type === 'education' ? 'education-entries' : 'experience-entries'
  );
  
  if (!entry || !container) return;
  
  const entries = container.querySelectorAll(`.${type}-entry`);
  
  if (entries.length > 1) {
    entry.remove();
    showToast('Entry removed');
  } else {
    showToast('Keep at least one entry');
  }
}

/* ===== PHOTO PREVIEW ===== */

function previewPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Check file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    showToast('Photo must be smaller than 2MB');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = document.getElementById('rs-photo-preview');
    if (img) {
      img.src = e.target.result;
      img.style.display = 'block';
    }
  };
  reader.readAsDataURL(file);
}

/* ===== GENERATE RESUME (Main Function) ===== */

async function generateResume() {
  // Gather form data
  const name = document.getElementById('rs-name').value.trim();
  const phone = document.getElementById('rs-phone').value.trim();
  const email = document.getElementById('rs-email').value.trim();
  const location = document.getElementById('rs-location').value.trim();
  const summary = document.getElementById('rs-summary').value.trim();
  const skills = document.getElementById('rs-skills').value.trim();
  const certs = document.getElementById('rs-certs').value.trim();
  const languages = document.getElementById('rs-languages').value.trim();
  const jd = document.getElementById('rs-jd').value.trim();

  // Collect education
  const education = [];
  document.querySelectorAll('.education-entry').forEach(entry => {
    const institution = entry.querySelector('.edu-institution').value.trim();
    const degree = entry.querySelector('.edu-degree').value.trim();
    const field = entry.querySelector('.edu-field').value.trim();
    const year = entry.querySelector('.edu-year').value.trim();
    if (institution || degree || field || year) {
      education.push({ institution, degree, field, year });
    }
  });

  // Collect experience
  const experience = [];
  document.querySelectorAll('.experience-entry').forEach(entry => {
    const company = entry.querySelector('.exp-company').value.trim();
    const role = entry.querySelector('.exp-role').value.trim();
    const start = entry.querySelector('.exp-start').value.trim();
    const end = entry.querySelector('.exp-end').value.trim();
    const desc = entry.querySelector('.exp-desc').value.trim();
    if (company || role || start || end || desc) {
      experience.push({ company, role, start, end, desc });
    }
  });

  // Get photo
  let photoData = '';
  const photoFile = document.getElementById('rs-photo').files[0];
  if (photoFile) {
    photoData = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(photoFile);
    });
  }

  // Validate
  if (!name) {
    showToast('Please enter your full name');
    return;
  }

  // Show loading state
  const btn = document.getElementById('rs-btn');
  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader spin"></i> Crafting your resume...';

  const out = document.getElementById('rs-out');
  out.classList.add('show');
  document.getElementById('rs-body').innerHTML =
    '<div style="padding:2.5rem;text-align:center;color:#6B7280;font-size:14px"><i class="ti ti-loader spin" style="font-size:24px;display:block;margin-bottom:12px;color:#1A56DB"></i>Crafting your professional resume...</div>';
  document.getElementById('rs-analyze').style.display = 'none';

  // Build prompt
  let prompt = `You are a professional resume writer. Create a polished, ATS-optimised resume.\n\n`;
  prompt += `Name: ${name}\n`;
  if (phone) prompt += `Phone: ${phone}\n`;
  if (email) prompt += `Email: ${email}\n`;
  if (location) prompt += `Location: ${location}\n`;
  if (summary) prompt += `Professional Summary: ${summary}\n`;
  if (skills) prompt += `Skills: ${skills}\n`;
  if (certs) prompt += `Certifications/Awards: ${certs}\n`;
  if (languages) prompt += `Languages: ${languages}\n`;
  if (jd) prompt += `Job Description (for tailoring): ${jd}\n`;

  if (education.length) {
    prompt += `\nEducation:\n`;
    education.forEach((edu, i) => {
      prompt += `  ${i+1}. ${edu.institution}, ${edu.degree}, ${edu.field}, ${edu.year}\n`;
    });
  }
  if (experience.length) {
    prompt += `\nWork Experience:\n`;
    experience.forEach((exp, i) => {
      prompt += `  ${i+1}. ${exp.company} - ${exp.role} (${exp.start} to ${exp.end}): ${exp.desc}\n`;
    });
  }

  prompt += `
INSTRUCTIONS:
- Write a professional resume with sections: Professional Summary, Work Experience, Education, Skills, Certifications, Languages
- For each work experience, create achievement-oriented bullet points with numbers and percentages
- Use ATS-friendly keywords from the job description if provided
- Keep tone professional and confident
- Use clear formatting with headers and bullet points (use dashes for bullets)
- Limit to about 1 page (400-600 words)
- Write only the resume content - no extra commentary`;

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    // Build styled HTML and display
    const styledHTML = buildResumeHTML(name, name, email, phone, location, photoData, data.result);
    document.getElementById('rs-body').innerHTML = styledHTML;
    document.getElementById('rs-body').classList.add('show');

    // Calculate ATS score
    const text = data.result;
    let score = 60;
    if (skills) score += 10;
    if (jd) score += 10;
    if (summary) score += 5;
    if (education.length) score += 10;
    if (experience.length) score += 10;
    if (text.split(' ').length > 200) score += 5;
    if (/\d+%/.test(text) || /\d+/.test(text)) score += 5;
    score = Math.min(100, score);

    document.getElementById('rs-score').textContent = score + '/100';
    
    const suggestions = [];
    if (!skills) suggestions.push('Add skills for higher score.');
    if (!jd) suggestions.push('Add job description to tailor keywords.');
    if (text.split(' ').length < 150) suggestions.push('Add more detail to experience.');
    if (!/\d+/.test(text)) suggestions.push('Quantify your achievements (e.g., "increased sales by 20%").');
    if (suggestions.length === 0) suggestions.push('Excellent! Your resume is ATS-optimised.');
    
    document.getElementById('rs-suggestions').textContent = suggestions.join(' ');
    document.getElementById('rs-analyze').style.display = 'block';

    showToast('Resume generated successfully! ✓');
  } catch (e) {
    document.getElementById('rs-body').innerHTML =
      '<div style="padding:1rem;color:#991B1B;font-size:14px">⚠️ Error: ' + (e.message || 'Please try again.') + '</div>';
    showToast('Error: ' + (e.message || 'Please try again.'));
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="ti ti-wand"></i> Generate my resume — free';
}

/* ===== PDF DOWNLOAD ===== */

function downloadPDF(type) {
  const bodyId = type === 'cl' ? 'cl-body' : 'rs-body';
  const body = document.getElementById(bodyId);
  
  if (!body) {
    showToast('Generate a resume first!');
    return;
  }
  
  const text = body.textContent;
  if (!text || text.includes('Crafting')) {
    showToast('Generate a resume first!');
    return;
  }

  const name = document.getElementById('rs-name').value.trim() || 'Resume';
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  
  const PW = 210, PH = 297, ML = 25.4, MR = 25.4, CW = PW - ML - MR;
  const FS = 11, LH = 5;
  let y = 25;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(26, 86, 219);
  doc.text(name.toUpperCase(), ML, y);
  y += 10;
  
  doc.setLineWidth(0.5);
  doc.setDrawColor(229, 231, 235);
  doc.line(ML, y, PW - MR, y);
  y += 10;

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
    y += 5;
  });

  const filename = `Resume_${name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(filename);
  showToast('PDF downloaded! ✓');
}

/* ===== CLEAR FORM ===== */

function clearForm(type) {
  if (type !== 'rs') return;
  
  const fields = ['rs-name', 'rs-phone', 'rs-email', 'rs-location', 'rs-summary', 'rs-skills', 'rs-certs', 'rs-languages', 'rs-jd'];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  // Clear education/experience
  ['education', 'experience'].forEach(type => {
    const container = document.getElementById(type + '-entries');
    if (container) {
      const entries = container.querySelectorAll(`.${type}-entry`);
      if (entries.length > 1) {
        entries.forEach((entry, idx) => {
          if (idx > 0) entry.remove();
        });
      }
      const first = container.querySelector(`.${type}-entry`);
      if (first) {
        first.querySelectorAll('input').forEach(inp => inp.value = '');
      }
    }
  });

  // Clear photo
  const photoInput = document.getElementById('rs-photo');
  const photoPreview = document.getElementById('rs-photo-preview');
  if (photoInput) photoInput.value = '';
  if (photoPreview) {
    photoPreview.style.display = 'none';
    photoPreview.src = '';
  }

  document.getElementById('rs-out').classList.remove('show');
  showToast('Form cleared');
}
