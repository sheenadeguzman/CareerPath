/**
 * @file AlumniSelfProfileForm.jsx
 * @description Main controller na nagbibigay-daan sa mga graduate/alumni na i-update ang kanilang sariling tracer profile.
 * Pinamamahalaan nito ang state para sa parehong Tracer Intake Sheet at Resume/CV Builder,
 * at pinag-uugnay ang mga sub-component na TracerForm, ResumeBuilder, at ResumePreview.
 */

import React, { useState, useEffect } from 'react';
import { BSC_PROGRAMS } from '../../../bscData';
import TracerForm from './components/TracerForm';
import ResumeBuilder from './components/ResumeBuilder';
import ResumePreview from './components/ResumePreview';

/**
 * Calculates age dynamically based on a birth date string.
 * Kinakalkula ang edad ng alumni base sa kanilang date of birth kumpara sa kasalukuyang petsa.
 * 
 * @param {string} dobString - Date of birth sa format na YYYY-MM-DD o kahit anong valid date string.
 * @returns {string|number} - Edad bilang numero, o 'N/A' kung walang petsa o hindi valid.
 */
const calculateAge = (dobString) => {
  if (!dobString) return 'N/A';
  const today = new Date();
  const birthDate = new Date(dobString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  // Bawasan ang edad ng 1 kung hindi pa sumasapit ang kaarawan sa kasalukuyang taon
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return isNaN(age) ? 'N/A' : age;
};

export default function AlumniSelfProfileForm({ currentAlAlumnus, onSaveAlumni, triggerToast }) {
  // State para sa buong profile data ng alumni. Dito sine-save ang pansamantalang kopya ng data.
  const [selfEditForm, setSelfEditForm] = useState(currentAlAlumnus);

  /**
   * Nililinis at pinaghihiwalay ang program string (e.g. "BSIT major in Web Dev") sa dalawang bahagi:
   * 1. Base program (hal. "Bachelor of Science in Information Technology")
   * 2. Major (hal. "Web Development")
   * 
   * @param {string} progStr - Ang buong program string mula sa database.
   * @returns {object} - May key na `base` at `major`.
   */
  const parseProgram = (progStr) => {
    if (!progStr) return { base: 'Bachelor of Science in Information Technology', major: '' };

    // Hanapin ang tugmang kurso mula sa BSC_PROGRAMS array
    const matchedBase = BSC_PROGRAMS.find(p => progStr.toLowerCase().includes(p.toLowerCase()));
    if (matchedBase) {
      // Kunin ang natitirang string pagkatapos ng base program name
      const remaining = progStr.substring(progStr.toLowerCase().indexOf(matchedBase.toLowerCase()) + matchedBase.length).trim();
      // Linisin ang mga salitang tulad ng "major in", "major", mga gitling, o kuwit gamit ang regex
      const majorClean = remaining.replace(/^(major\s+in|major|[-,\s])+/i, '').trim();
      return { base: matchedBase, major: majorClean };
    }
    return { base: progStr, major: '' };
  };

  // Simulan ang component gamit ang parsed program at major ng kasalukuyang alumni
  const initialProg = parseProgram(currentAlAlumnus?.program);
  const [selectedBaseProg, setSelectedBaseProg] = useState(initialProg.base);
  const [selectedMajor, setSelectedMajor] = useState(initialProg.major);

  // Syncing: Kapag nagbago ang currentAlAlumnus prop galing sa parent, i-update ang local state at program selections.
  useEffect(() => {
    if (currentAlAlumnus) {
      setSelfEditForm(currentAlAlumnus);
      const parsed = parseProgram(currentAlAlumnus.program);
      setSelectedBaseProg(parsed.base);
      setSelectedMajor(parsed.major);
    }
  }, [currentAlAlumnus]);

  // State para sa input ng bagong skill (para sa tracer profile o resume tags)
  const [newSkillToken, setNewSkillToken] = useState('');

  // State para sa input ng custom useful skill (mga partikular na skill na nagamit sa trabaho)
  const [customUsefulSkill, setCustomUsefulSkill] = useState('');

  // Kumokontrol kung anong tab ang aktibo: 'Tracer' para sa form o 'Resume' para sa CV builder.
  const [activeSubTab, setActiveSubTab] = useState('Tracer');

  // Tema o template ng Resume (e.g. 'modern', 'classic', 'minimalist')
  const [selectedTemplate, setSelectedTemplate] = useState('modern');

  // Bond paper size ng resume ('letter', 'a4', 'legal')
  const [paperSize, setPaperSize] = useState('letter');

  // Mga checkbox options para sa pagpapakita/pagtatago ng mga partikular na seksyon sa Resume Preview
  const [cvOptions, setCvOptions] = useState({
    showPhoto: true,         // Ipakita ang profile photo
    showSalary: false,       // Ipakita ang monthly income
    showCivilStatus: true,   // Ipakita ang civil status
    showPhone: true,         // Ipakita ang mobile number
    showSkills: true,        // Ipakita ang core skills
    showDescription: true    // Ipakita ang job description/summary
  });

  /**
   * Nagdaragdag ng bagong skill sa skills array sa selfEditForm state.
   * Ginagamit para sa pangkalahatang listahan ng skills ng alumni.
   * 
   * @param {Event} e - Form submission event.
   */
  const addSkillToken = (e) => {
    e.preventDefault();
    if (!newSkillToken.trim() || !selfEditForm) return;
    // Iwasan ang duplicate na skills sa listahan
    if (selfEditForm.skills.includes(newSkillToken.trim())) return;

    setSelfEditForm({
      ...selfEditForm,
      skills: [...selfEditForm.skills, newSkillToken.trim()]
    });
    setNewSkillToken(''); // I-reset ang text box input
  };

  /**
   * Nagtatanggal ng piniling skill mula sa listahan ng skills sa selfEditForm.
   * 
   * @param {string} skillToRemove - Ang pangalan ng skill na tatanggalin.
   */
  const removeSkillToken = (skillToRemove) => {
    if (!selfEditForm) return;
    setSelfEditForm({
      ...selfEditForm,
      skills: selfEditForm.skills.filter(s => s !== skillToRemove)
    });
  };

  /**
   * Nagtatanggal ng piniling "useful skill" (mga nakatulong sa trabaho) mula sa listahan.
   * 
   * @param {string} skillToRemove - Ang pangalan ng useful skill na tatanggalin.
   */
  const removeUsefulSkill = (skillToRemove) => {
    if (!selfEditForm) return;
    const currentSkills = selfEditForm.usefulSkills || [];
    setSelfEditForm({
      ...selfEditForm,
      usefulSkills: currentSkills.filter(s => s !== skillToRemove)
    });
  };

  /**
   * Nagdaragdag ng bagong custom useful skill na isinulat mismo ng user sa input field.
   */
  const addCustomUsefulSkillDirectly = () => {
    if (!selfEditForm || !customUsefulSkill.trim()) return;
    const skillToAdd = customUsefulSkill.trim();
    const currentSkills = selfEditForm.usefulSkills || [];

    // Pigilan kung may katulad nang skill sa listahan
    if (currentSkills.includes(skillToAdd)) {
      alert('Mayroon na nito sa listahan ng iyong mga useful skills.');
      return;
    }
    setSelfEditForm({
      ...selfEditForm,
      usefulSkills: [...currentSkills, skillToAdd]
    });
    setCustomUsefulSkill(''); // I-reset ang text box input
  };

  /**
   * Nagsusumite ng mga binagong profile data ng alumni.
   * Kinakalkula nito ang 'profileCompleteness' bago mag-save sa server/database.
   * 
   * @param {Event} e - Form submit event.
   */
  const handleSelfFormSubmit = async (e) => {
    e.preventDefault();
    if (!selfEditForm) return;

    let filledFields = 0;

    // Listahan ng mga pangkalahatang field na titingnan kung may laman
    const fieldsToTrack = [
      'phone', 'gender', 'civilStatus', 'dateOfBirth', 'address', 'professionalExamPassed',
      'middleName', 'suffix', 'yearEnrolled', 'alumniAssociationStatus', 'isBoardPasser'
    ];
    fieldsToTrack.forEach(field => {
      if (selfEditForm[field]) filledFields++;
    });

    // Dagdagan ang count kung may nakalistang kahit isang useful skill
    if (selfEditForm.usefulSkills && selfEditForm.usefulSkills.length > 0) {
      filledFields++;
    }

    // Kung Unemployed ang status, tingnan kung isinulat ang dahilan ng unemployment
    if (selfEditForm.employmentStatus === 'Unemployed') {
      if (selfEditForm.reasonsUnemployment) filledFields++;
    }

    // Kung may trabaho naman, tingnan ang mga field na may kinalaman sa trabaho
    if (selfEditForm.employmentStatus !== 'Unemployed') {
      const empFields = [
        'jobTitle', 'jobDescription', 'employerName', 'employmentType', 'sector',
        'monthlyIncome', 'findFirstJob', 'reasonsAcceptingJob', 'jobIndustry', 'firstJobRelatedToCourse'
      ];
      empFields.forEach(field => {
        if (selfEditForm[field]) filledFields++;
      });
    }

    // Tukuyin ang kabuuang bilang ng posibleng field depende sa employment status
    const totalPossibleFields = selfEditForm.employmentStatus === 'Unemployed' ? 13 : 22;

    // Formula para sa profile completeness percentage:
    // Nagsisimula sa base na 40% (dahil may pangunahing impormasyon na tulad ng pangalan at kurso mula sa pag-register).
    // Ang natitirang 60% ay ibabase sa ratio ng nasagutang fields sa total possible fields.
    const calculatedCompleteness = Math.min(
      40 + Math.round((filledFields / totalPossibleFields) * 60),
      100
    );

    // Pagsama-samahin ang binagong profile kasama ang pinagsamang buong pangalan at completeness rate
    const submissionProfile = {
      ...selfEditForm,
      // Pagsamahin ang first, middle, last name, at suffix na nilinis ang mga blankong espasyo
      name: [selfEditForm.firstName, selfEditForm.middleName, selfEditForm.lastName, selfEditForm.suffix].filter(Boolean).join(' '),
      profileCompleteness: calculatedCompleteness,
      lastUpdated: new Date().toISOString()
    };

    // Tawagin ang parent function para i-save ang data sa server at magpakita ng toast notification
    await onSaveAlumni(submissionProfile);
    triggerToast('SUCCESS! Your Graduate Tracer profile information has been securely updated.');
  };

  /**
   * Nagpapadala sa printer o nag-o-open ng print dialog ng browser para sa CV.
   * Gumagamit ng pansamantalang class name sa body tag (`print-resume-only`) upang 
   * itago ang ibang UI elements (tulad ng sidebar at tabs) at ang resume lamang ang ma-print.
   */
  const handlePrintCV = () => {
    document.body.classList.add('print-resume-only');
    window.print();
    // Pagkatapos ng kalahating segundo (500ms), ibalik sa normal ang hitsura ng pahina
    setTimeout(() => {
      document.body.classList.remove('print-resume-only');
    }, 500);
  };

  /**
   * Helper utility to temporarily clean stylesheets from OKLCH color definitions,
   * avoiding html2canvas crash during PDF/Image generation. Restores them in a finally block.
   */
  const runWithCleanStyleSheets = async (callback) => {
    let cleanCss = '';
    const tempDiv = document.createElement('div');
    document.body.appendChild(tempDiv);

    // Kumuha at linisin ang lahat ng style rules
    for (let i = 0; i < document.styleSheets.length; i++) {
      const sheet = document.styleSheets[i];
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (!rules) continue;
        for (let j = 0; j < rules.length; j++) {
          let cssText = rules[j].cssText;
          if (cssText.includes('oklch')) {
            cssText = cssText.replace(/oklch\(([^)]+)\)/g, (match) => {
              try {
                tempDiv.style.color = match;
                return window.getComputedStyle(tempDiv).color || 'rgb(30, 41, 59)';
              } catch (e) {
                return 'rgb(30, 41, 59)';
              }
            });
          }
          cleanCss += cssText + '\n';
        }
      } catch (e) {
        // Laktawan ang CORS stylesheet issues (kung meron)
      }
    }
    document.body.removeChild(tempDiv);

    // Gumawa ng temporary style element para sa malinis na CSS
    const cleanStyleEl = document.createElement('style');
    cleanStyleEl.id = 'html2canvas-clean-styles';
    cleanStyleEl.textContent = cleanCss;
    document.head.appendChild(cleanStyleEl);

    const cleanSheet = cleanStyleEl.sheet;
    const mockStyleSheets = [cleanSheet];

    // Mock document.styleSheets
    Object.defineProperty(document, 'styleSheets', {
      get() { return mockStyleSheets; },
      configurable: true
    });

    try {
      await callback(mockStyleSheets);
    } finally {
      // Ibalik sa normal ang lahat ng style sheets
      delete document.styleSheets;
      cleanStyleEl.remove();
    }
  };

  /**
   * Nag-da-download ng Resume/CV bilang PDF gamit ang 'html2pdf.js' library.
   * Nililinis nito ang mga oklch styles sa clone upang maiwasan ang pagka-crash ng parser.
   */
  const handleDownloadCV = () => {
    console.log('handleDownloadCV function invoked.');
    const element = document.querySelector('.resume-container');
    if (!element) {
      console.error('Error: Element with class .resume-container was not found in the DOM.');
      alert('Resume element not found.');
      return;
    }

    if (!window.html2pdf) {
      console.error('Error: window.html2pdf is not defined. The library failed to load.');
      alert('PDF generation library is still loading, please try again in a moment.');
      return;
    }

    let format = 'letter';
    if (paperSize === 'a4') format = 'a4';
    else if (paperSize === 'legal') format = 'legal';

    console.log('Executing html2pdf pipeline with format:', format);
    
    runWithCleanStyleSheets(async (mockSheets) => {
      const opt = {
        margin: 0,
        filename: `BSC_Resume_${selfEditForm.firstName || 'BSC'}_${selfEditForm.lastName || 'Alumni'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          onclone: (clonedDoc) => {
            // I-mock ang styleSheets sa cloned document
            Object.defineProperty(clonedDoc, 'styleSheets', {
              get() { return mockSheets; },
              configurable: true
            });
            const clonedContainer = clonedDoc.querySelector('.resume-container');
            if (clonedContainer) {
              clonedContainer.style.margin = '0';
              clonedContainer.style.border = 'none';
              clonedContainer.style.boxShadow = 'none';
            }
          }
        },
        jsPDF: { unit: 'in', format: format, orientation: 'portrait' }
      };

      await window.html2pdf().set(opt).from(element).save();
      console.log('html2pdf pipeline executed successfully.');
    }).catch(err => {
      console.error('html2pdf promise rejection caught:', err);
      alert('Failed to generate PDF. Please try exporting as Image or Word.');
    });
  };

  /**
   * Nag-da-download ng Resume/CV bilang Word document (.doc) na gumagamit ng standard
   * page layout XML ng Word upang maging adjustable ang page size batay sa piniling paperSize.
   */
  const handleDownloadWord = () => {
    const fullName = [selfEditForm.firstName, selfEditForm.middleName, selfEditForm.lastName, selfEditForm.suffix].filter(Boolean).join(' ');
    const programShort = selfEditForm.program || '';
    const email = selfEditForm.email || '';
    const phone = selfEditForm.phone || '';
    const address = selfEditForm.address || '';
    const civilStatus = selfEditForm.civilStatus || '';
    const gender = selfEditForm.gender || '';
    const yearGraduated = selfEditForm.yearGraduated || '';
    const skills = selfEditForm.skills || [];

    let sizeCss = '';
    if (paperSize === 'a4') {
      sizeCss = '@page Section1 { size: 8.27in 11.69in; margin: 0.5in; } div.Section1 { page: Section1; }';
    } else if (paperSize === 'legal') {
      sizeCss = '@page Section1 { size: 8.5in 14.0in; margin: 0.5in; } div.Section1 { page: Section1; }';
    } else {
      sizeCss = '@page Section1 { size: 8.5in 11.0in; margin: 0.5in; } div.Section1 { page: Section1; }';
    }

    let templateContent = '';

    if (selectedTemplate === 'modern') {
      // Modern template with a 2-column layout (Table based to ensure Word columns format perfectly)
      templateContent = `
        <table border="0" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; font-family: 'Segoe UI', Arial, sans-serif;">
          <tr>
            <!-- Left column (Sidebar) -->
            <td style="width: 32%; background-color: #faf6f6; border-right: 2px solid #e2e8f0; padding: 25px 15px; vertical-align: top;">
              ${cvOptions.showPhoto && selfEditForm?.avatar ? `
                <div style="margin-bottom: 20px;">
                  <img src="${selfEditForm.avatar}" style="width: 90px; height: 90px; border-radius: 8px; border: 2px solid #7c191e; object-fit: cover;" />
                </div>
              ` : ''}
              
              <div style="margin-bottom: 25px;">
                <h2 style="font-size: 14pt; font-weight: bold; color: #7c191e; text-transform: uppercase; margin: 0 0 5px 0;">${fullName}</h2>
                <div style="font-size: 8.5pt; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">${programShort.replace('BS ', '')} Graduate</div>
              </div>

              <!-- Contact Info -->
              <div style="margin-bottom: 25px; font-size: 8.5pt; color: #475569;">
                <h3 style="font-size: 9pt; font-weight: bold; color: #7c191e; text-transform: uppercase; border-bottom: 1px solid #7c191e; padding-bottom: 3px; margin: 0 0 10px 0;">Contact Info</h3>
                ${cvOptions.showPhone && phone ? `<div style="margin-bottom: 5px;"><b>Phone:</b> ${phone}</div>` : ''}
                <div style="margin-bottom: 5px;"><b>Email:</b> ${email}</div>
                <div style="margin-bottom: 5px;"><b>Address:</b> ${address || 'Basco, Batanes'}</div>
                ${cvOptions.showCivilStatus ? `
                  <div style="margin-top: 10px; border-top: 1px solid #e2e8f0; padding-top: 5px;">
                    <div style="margin-bottom: 3px;"><b>Status:</b> ${civilStatus}</div>
                    <div><b>Gender:</b> ${gender}</div>
                  </div>
                ` : ''}
              </div>

              <!-- Skills -->
              ${cvOptions.showSkills && skills.length > 0 ? `
                <div style="font-size: 8.5pt; color: #475569;">
                  <h3 style="font-size: 9pt; font-weight: bold; color: #7c191e; text-transform: uppercase; border-bottom: 1px solid #7c191e; padding-bottom: 3px; margin: 0 0 10px 0;">Core Skills</h3>
                  <div>
                    ${skills.map(s => `<span style="background-color: #7c191e; color: white; padding: 2px 6px; border-radius: 4px; font-size: 8pt; display: inline-block; margin-right: 4px; margin-bottom: 6px; font-weight: bold;">${s}</span>`).join('')}
                  </div>
                </div>
              ` : ''}
            </td>

            <!-- Right column (Main details) -->
            <td style="width: 68%; padding: 25px 20px; vertical-align: top;">
              <!-- Academic Background -->
              <div style="margin-bottom: 30px;">
                <h3 style="font-size: 11pt; font-weight: bold; color: #7c191e; text-transform: uppercase; border-bottom: 2px solid #7c191e; padding-bottom: 4px; margin: 0 0 15px 0; letter-spacing: 1px;">Academic Background</h3>
                
                <table border="0" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 9.5pt;">
                  <tr>
                    <td style="font-weight: bold; color: #0f172a;">Batanes State College</td>
                    <td style="text-align: right; font-weight: bold; color: #7c191e;">${selfEditForm.yearEnrolled ? `${selfEditForm.yearEnrolled} - ` : ''}${yearGraduated}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="color: #475569; padding-top: 3px;">${programShort}</td>
                  </tr>
                  ${selfEditForm.honors && selfEditForm.honors !== 'None' ? `
                    <tr>
                      <td colspan="2" style="color: #d97706; font-weight: bold; font-size: 8.5pt; text-transform: uppercase; padding-top: 5px;">Honors: ${selfEditForm.honors}</td>
                    </tr>
                  ` : ''}
                  ${selfEditForm.professionalExamPassed && selfEditForm.professionalExamPassed !== 'None' ? `
                    <tr>
                      <td colspan="2" style="color: #047857; font-weight: bold; font-size: 8.5pt; text-transform: uppercase; padding-top: 3px;">License: ${selfEditForm.professionalExamPassed}</td>
                    </tr>
                  ` : ''}
                </table>

                ${selfEditForm.educationHistory && selfEditForm.educationHistory.map(item => `
                  <table border="0" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 9.5pt;">
                    <tr>
                      <td style="font-weight: bold; color: #0f172a;">${item.school}</td>
                      <td style="text-align: right; color: #64748b; font-weight: bold;">${item.years}</td>
                    </tr>
                    <tr>
                      <td colspan="2" style="color: #475569; padding-top: 3px;">${item.degree}</td>
                    </tr>
                  </table>
                `).join('')}
              </div>

              <!-- Professional Experience -->
              <div>
                <h3 style="font-size: 11pt; font-weight: bold; color: #7c191e; text-transform: uppercase; border-bottom: 2px solid #7c191e; padding-bottom: 4px; margin: 0 0 15px 0; letter-spacing: 1px;">Professional Experience</h3>
                
                ${selfEditForm.employmentStatus === 'Unemployed' && (!selfEditForm.careerHistory || selfEditForm.careerHistory.length === 0) ? `
                  <div style="font-size: 9.5pt; font-style: italic; color: #94a3b8;">Currently seeking opportunities.</div>
                ` : `
                  ${selfEditForm.employmentStatus !== 'Unemployed' ? `
                    <div style="margin-bottom: 20px;">
                      <table border="0" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; font-size: 9.5pt;">
                        <tr>
                          <td style="font-weight: bold; color: #0f172a;">${selfEditForm.jobTitle || 'Graduate Trainee'}</td>
                          <td style="text-align: right; font-weight: bold; color: #7c191e;">${selfEditForm.jobStartYear ? `${selfEditForm.jobStartYear} - Present` : 'Present'}</td>
                        </tr>
                        <tr>
                          <td colspan="2" style="color: #64748b; font-style: italic; padding-top: 2px;">${selfEditForm.employerName || 'Independent'}</td>
                        </tr>
                      </table>
                      ${cvOptions.showDescription && selfEditForm.jobDescription ? `
                        <div style="font-size: 8.5pt; color: #475569; background-color: #f8fafc; padding: 10px; border-left: 3px solid #7c191e; margin-top: 8px; line-height: 1.4;">
                          ${selfEditForm.jobDescription.replace(/\n/g, '<br/>')}
                        </div>
                      ` : ''}
                      ${cvOptions.showSalary && selfEditForm.monthlyIncome ? `
                        <div style="font-size: 8.5pt; font-weight: bold; color: #7c191e; text-transform: uppercase; margin-top: 5px;">Income Bracket: P ${selfEditForm.monthlyIncome}</div>
                      ` : ''}
                    </div>
                  ` : ''}

                  <!-- Past career history -->
                  ${selfEditForm.careerHistory && selfEditForm.careerHistory.map(item => `
                    <div style="margin-bottom: 12px; border-left: 2px solid #cca43b; padding-left: 10px;">
                      <table border="0" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; font-size: 9.5pt;">
                        <tr>
                          <td style="font-weight: bold; color: #0f172a;">${item.title}</td>
                          <td style="text-align: right; color: #64748b;">${item.years}</td>
                        </tr>
                        <tr>
                          <td colspan="2" style="color: #cca43b; font-weight: 500; padding-top: 2px;">${item.company}</td>
                        </tr>
                      </table>
                    </div>
                  `).join('')}
                `}
              </div>
            </td>
          </tr>
        </table>
      `;
    } else if (selectedTemplate === 'gold') {
      // Gold Minimalist Template (Includes beautiful double border and golden tones)
      templateContent = `
        <div style="font-family: Georgia, serif; padding: 25px; border: 4px double #cca43b; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 25px; border-bottom: 2px solid #cca43b; padding-bottom: 15px;">
            ${cvOptions.showPhoto && selfEditForm?.avatar ? `
              <div style="margin-bottom: 12px; text-align: center;">
                <img src="${selfEditForm.avatar}" style="width: 90px; height: 90px; border-radius: 50%; border: 2px solid #cca43b; object-fit: cover; display: inline-block;" />
              </div>
            ` : ''}
            <h2 style="font-size: 18pt; color: #0f172a; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 5px 0; font-weight: normal;">${fullName}</h2>
            <div style="font-size: 9pt; font-weight: bold; color: #cca43b; text-transform: uppercase; font-family: Arial, sans-serif; letter-spacing: 1.5px;">${programShort}</div>
            
            <div style="font-size: 8.5pt; font-family: Arial, sans-serif; color: #64748b; margin-top: 10px;">
              ${cvOptions.showPhone && phone ? `Phone: ${phone} &bull; ` : ''}
              Email: ${email} &bull; Address: ${address || 'Basco, Batanes'}
              ${cvOptions.showCivilStatus ? ` &bull; Status: ${civilStatus}` : ''}
            </div>
          </div>

          <!-- Education -->
          <div style="margin-bottom: 25px;">
            <h3 style="font-size: 10pt; font-weight: bold; color: #cca43b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; font-family: Arial, sans-serif; letter-spacing: 1px; margin: 0 0 12px 0;">Education</h3>
            
            <table border="0" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 9.5pt;">
              <tr>
                <td style="font-weight: bold; color: #0f172a;">Batanes State College</td>
                <td style="text-align: right; color: #64748b;">${selfEditForm.yearEnrolled ? `${selfEditForm.yearEnrolled} - ` : ''}${yearGraduated}</td>
              </tr>
              <tr>
                <td colspan="2" style="font-style: italic; color: #475569; padding-top: 2px;">${programShort}</td>
              </tr>
              ${selfEditForm.honors && selfEditForm.honors !== 'None' ? `
                <tr>
                  <td colspan="2" style="color: #64748b; font-weight: bold; font-size: 8.5pt; text-transform: uppercase; padding-top: 4px;">Honors: ${selfEditForm.honors}</td>
                </tr>
              ` : ''}
              ${selfEditForm.professionalExamPassed && selfEditForm.professionalExamPassed !== 'None' ? `
                <tr>
                  <td colspan="2" style="color: #64748b; font-weight: bold; font-size: 8.5pt; text-transform: uppercase; padding-top: 2px;">License: ${selfEditForm.professionalExamPassed}</td>
                </tr>
              ` : ''}
            </table>

            ${selfEditForm.educationHistory && selfEditForm.educationHistory.map(item => `
              <table border="0" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 9.5pt;">
                <tr>
                  <td style="font-weight: bold; color: #0f172a;">${item.school}</td>
                  <td style="text-align: right; color: #64748b;">${item.years}</td>
                </tr>
                <tr>
                  <td colspan="2" style="font-style: italic; color: #475569; padding-top: 2px;">${item.degree}</td>
                </tr>
              </table>
            `).join('')}
          </div>

          <!-- Professional Experience -->
          <div style="margin-bottom: 25px;">
            <h3 style="font-size: 10pt; font-weight: bold; color: #cca43b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; font-family: Arial, sans-serif; letter-spacing: 1px; margin: 0 0 12px 0;">Professional Experience</h3>
            
            ${selfEditForm.employmentStatus === 'Unemployed' && (!selfEditForm.careerHistory || selfEditForm.careerHistory.length === 0) ? `
              <div style="font-size: 9.5pt; font-style: italic; color: #94a3b8;">Currently seeking opportunities.</div>
            ` : `
              ${selfEditForm.employmentStatus !== 'Unemployed' ? `
                <div style="margin-bottom: 15px;">
                  <table border="0" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; font-size: 9.5pt;">
                    <tr>
                      <td style="font-weight: bold; color: #0f172a;">${selfEditForm.jobTitle || 'Graduate Trainee'}</td>
                      <td style="text-align: right; font-weight: bold; color: #cca43b;">${selfEditForm.jobStartYear ? `${selfEditForm.jobStartYear} - Present` : 'Present'}</td>
                    </tr>
                    <tr>
                      <td colspan="2" style="color: #64748b; font-style: italic; padding-top: 2px;">${selfEditForm.employerName || 'Independent'}</td>
                    </tr>
                  </table>
                  ${cvOptions.showDescription && selfEditForm.jobDescription ? `
                    <div style="font-size: 9pt; color: #475569; line-height: 1.4; margin-top: 6px;">
                      ${selfEditForm.jobDescription.replace(/\n/g, '<br/>')}
                    </div>
                  ` : ''}
                  ${cvOptions.showSalary && selfEditForm.monthlyIncome ? `
                    <div style="font-size: 8.5pt; font-weight: bold; color: #cca43b; text-transform: uppercase; margin-top: 4px;">Income Bracket: P ${selfEditForm.monthlyIncome}</div>
                  ` : ''}
                </div>
              ` : ''}

              <!-- Past career history -->
              ${selfEditForm.careerHistory && selfEditForm.careerHistory.map(item => `
                <table border="0" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 9.5pt;">
                  <tr>
                    <td style="font-weight: bold; color: #0f172a;">${item.title}</td>
                    <td style="text-align: right; color: #64748b;">${item.years}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="color: #475569; padding-top: 2px;">${item.company}</td>
                  </tr>
                </table>
              `).join('')}
            `}
          </div>

          <!-- Skills -->
          ${cvOptions.showSkills && skills.length > 0 ? `
            <div>
              <h3 style="font-size: 10pt; font-weight: bold; color: #cca43b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; font-family: Arial, sans-serif; letter-spacing: 1px; margin: 0 0 12px 0;">Technical Competencies</h3>
              <div style="margin-top: 5px;">
                ${skills.map(s => `<span style="border: 1px solid #cca43b; color: #cca43b; padding: 2px 8px; border-radius: 4px; font-size: 8pt; font-family: Arial, sans-serif; display: inline-block; margin-right: 6px; margin-bottom: 6px; text-transform: uppercase; font-weight: bold; background-color: #fafaf5;">${s}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    } else {
      // Classic Executive Template (Highly centered, traditional layout)
      templateContent = `
        <div style="font-family: 'Times New Roman', Times, serif; padding: 15px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 25px; border-bottom: 1px solid #1e293b; padding-bottom: 15px;">
            ${cvOptions.showPhoto && selfEditForm?.avatar ? `
              <div style="margin-bottom: 12px; text-align: center;">
                <img src="${selfEditForm.avatar}" style="width: 90px; height: 90px; border-radius: 50%; border: 1px solid #94a3b8; object-fit: cover; display: inline-block;" />
              </div>
            ` : ''}
            <h2 style="font-size: 20pt; color: #0f172a; text-transform: uppercase; font-weight: bold; margin: 0 0 5px 0;">${fullName}</h2>
            <div style="font-size: 10pt; font-weight: bold; color: #64748b; text-transform: uppercase; font-family: Arial, sans-serif; letter-spacing: 1px;">${programShort}</div>
            
            <div style="font-size: 9pt; font-family: Arial, sans-serif; color: #475569; margin-top: 8px;">
              ${cvOptions.showPhone && phone ? `Phone: ${phone} &bull; ` : ''}
              Email: ${email} &bull; Address: ${address || 'Basco, Batanes'}
            </div>
            ${cvOptions.showCivilStatus ? `
              <div style="font-size: 8.5pt; font-family: Arial, sans-serif; color: #94a3b8; text-transform: uppercase; margin-top: 3px; letter-spacing: 0.5px;">
                Status: ${civilStatus} &bull; Gender: ${gender}
              </div>
            ` : ''}
          </div>

          <!-- Education -->
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 11pt; font-weight: bold; color: #0f172a; text-transform: uppercase; border-bottom: 1.5px solid #000; padding-bottom: 2px; letter-spacing: 1px; margin: 0 0 10px 0;">Education</h3>
            
            <table border="0" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 9.5pt;">
              <tr>
                <td style="font-weight: bold; color: #0f172a;">Batanes State College</td>
                <td style="text-align: right; font-weight: bold; color: #0f172a;">${selfEditForm.yearEnrolled ? `${selfEditForm.yearEnrolled} - ` : ''}${yearGraduated}</td>
              </tr>
              <tr>
                <td colspan="2" style="font-style: italic; color: #475569; padding-top: 2px;">${programShort}</td>
              </tr>
              ${selfEditForm.honors && selfEditForm.honors !== 'None' ? `
                <tr>
                  <td colspan="2" style="font-weight: bold; font-size: 8.5pt; text-transform: uppercase; padding-top: 4px;">Honors: ${selfEditForm.honors}</td>
                </tr>
              ` : ''}
              ${selfEditForm.professionalExamPassed && selfEditForm.professionalExamPassed !== 'None' ? `
                <tr>
                  <td colspan="2" style="font-weight: bold; font-size: 8.5pt; text-transform: uppercase; padding-top: 2px;">License: ${selfEditForm.professionalExamPassed}</td>
                </tr>
              ` : ''}
            </table>

            ${selfEditForm.educationHistory && selfEditForm.educationHistory.map(item => `
              <table border="0" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 9.5pt;">
                <tr>
                  <td style="font-weight: bold; color: #0f172a;">${item.school}</td>
                  <td style="text-align: right; font-weight: bold; color: #0f172a;">${item.years}</td>
                </tr>
                <tr>
                  <td colspan="2" style="font-style: italic; color: #475569; padding-top: 2px;">${item.degree}</td>
                </tr>
              </table>
            `).join('')}
          </div>

          <!-- Professional Experience -->
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 11pt; font-weight: bold; color: #0f172a; text-transform: uppercase; border-bottom: 1.5px solid #000; padding-bottom: 2px; letter-spacing: 1px; margin: 0 0 10px 0;">Professional Experience</h3>
            
            ${selfEditForm.employmentStatus === 'Unemployed' && (!selfEditForm.careerHistory || selfEditForm.careerHistory.length === 0) ? `
              <div style="font-size: 9.5pt; font-style: italic; color: #94a3b8;">Currently seeking opportunities.</div>
            ` : `
              ${selfEditForm.employmentStatus !== 'Unemployed' ? `
                <div style="margin-bottom: 15px;">
                  <table border="0" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; font-size: 9.5pt;">
                    <tr>
                      <td style="font-weight: bold; color: #0f172a;">${selfEditForm.jobTitle || 'Graduate Trainee'}</td>
                      <td style="text-align: right; color: #475569;">${selfEditForm.jobStartYear ? `${selfEditForm.jobStartYear} - Present` : 'Present'}</td>
                    </tr>
                    <tr>
                      <td colspan="2" style="font-weight: bold; font-style: italic; color: #64748b; padding-top: 2px;">${selfEditForm.employerName || 'Independent'}</td>
                    </tr>
                  </table>
                  ${cvOptions.showDescription && selfEditForm.jobDescription ? `
                    <div style="font-size: 9pt; color: #475569; line-height: 1.4; margin-top: 4px;">
                      ${selfEditForm.jobDescription.replace(/\n/g, '<br/>')}
                    </div>
                  ` : ''}
                  ${cvOptions.showSalary && selfEditForm.monthlyIncome ? `
                    <div style="font-size: 8.5pt; font-weight: bold; text-transform: uppercase; margin-top: 4px;">Income Bracket: P ${selfEditForm.monthlyIncome}</div>
                  ` : ''}
                </div>
              ` : ''}

              <!-- Past career history -->
              ${selfEditForm.careerHistory && selfEditForm.careerHistory.map(item => `
                <table border="0" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 9.5pt;">
                  <tr>
                    <td style="font-weight: bold; color: #0f172a;">${item.title}</td>
                    <td style="text-align: right; color: #64748b;">${item.years}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="font-weight: bold; color: #475569; padding-top: 2px;">${item.company}</td>
                  </tr>
                </table>
              `).join('')}
            `}
          </div>

          <!-- Skills -->
          ${cvOptions.showSkills && skills.length > 0 ? `
            <div>
              <h3 style="font-size: 11pt; font-weight: bold; color: #0f172a; text-transform: uppercase; border-bottom: 1.5px solid #000; padding-bottom: 2px; letter-spacing: 1px; margin: 0 0 10px 0;">Skills and Certifications</h3>
              <ul style="margin: 5px 0 0 0; padding-left: 20px; font-size: 9.5pt; color: #334155;">
                ${skills.map(s => `<li style="margin-bottom: 4px;">${s}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      `;
    }

    const htmlDoc = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>Resume - ${fullName}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          ${sizeCss}
          body {
            margin: 0;
            padding: 0;
          }
          div.Section1 { 
            page: Section1; 
          }
        </style>
      </head>
      <body>
        <div class="Section1">
          ${templateContent}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + htmlDoc], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BSC_Resume_${selfEditForm.firstName || 'BSC'}_${selfEditForm.lastName || 'Alumni'}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Nag-da-download ng Resume/CV bilang mataas na kalidad na PNG image gamit ang html2canvas.
   * Nililinis nito ang mga oklch values upang maiwasan ang parser crash sa library.
   */
  const handleDownloadImage = () => {
    const element = document.querySelector('.resume-container');
    if (!element) {
      alert('Resume element not found.');
      return;
    }
    if (!window.html2canvas) {
      alert('Image generation library is still loading, please try again.');
      return;
    }

    runWithCleanStyleSheets(async (mockSheets) => {
      const canvas = await window.html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (clonedDoc) => {
          // I-mock ang styleSheets sa cloned document
          Object.defineProperty(clonedDoc, 'styleSheets', {
            get() { return mockSheets; },
            configurable: true
          });
          const clonedContainer = clonedDoc.querySelector('.resume-container');
          if (clonedContainer) {
            clonedContainer.style.margin = '0';
            clonedContainer.style.border = 'none';
            clonedContainer.style.boxShadow = 'none';
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = imgData;
      a.download = `BSC_Resume_${selfEditForm.firstName || 'BSC'}_${selfEditForm.lastName || 'Alumni'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }).catch(err => {
      console.error('Error generating image:', err);
      alert('Failed to generate image.');
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Subtab Switcher: Nagsisilbing nabigasyon sa pagitan ng Tracer Form at Resume Builder */}
      <div className="bg-white rounded-xl border border-slate-100 p-2 flex gap-1.5 shadow-xs w-full max-w-sm no-print-resume">
        <button
          onClick={() => setActiveSubTab('Tracer')}
          className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition select-none cursor-pointer ${activeSubTab === 'Tracer' ? 'bg-[#7c191e] text-white shadow-sm' : 'hover:bg-slate-150 text-slate-655'
            }`}
        >
          Tracer Intake Sheet
        </button>
        <button
          onClick={() => setActiveSubTab('Resume')}
          className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition select-none cursor-pointer ${activeSubTab === 'Resume' ? 'bg-[#7c191e] text-white shadow-sm' : 'hover:bg-slate-150 text-slate-655'
            }`}
        >
          CV &amp; Resume Builder
        </button>
      </div>

      {/* Conditionally rendering depende sa kung aling subtab ang pinili ng user */}
      {activeSubTab === 'Tracer' ? (
        // I-render ang Tracer Intake Sheet Form at ipasa ang mga kailangang state handler
        <TracerForm
          selfEditForm={selfEditForm}
          setSelfEditForm={setSelfEditForm}
          selectedBaseProg={selectedBaseProg}
          setSelectedBaseProg={setSelectedBaseProg}
          selectedMajor={selectedMajor}
          setSelectedMajor={setSelectedMajor}
          newSkillToken={newSkillToken}
          setNewSkillToken={setNewSkillToken}
          customUsefulSkill={customUsefulSkill}
          setCustomUsefulSkill={setCustomUsefulSkill}
          addSkillToken={addSkillToken}
          removeSkillToken={removeSkillToken}
          addCustomUsefulSkillDirectly={addCustomUsefulSkillDirectly}
          removeUsefulSkill={removeUsefulSkill}
          handleSelfFormSubmit={handleSelfFormSubmit}
          calculateAge={calculateAge}
        />
      ) : (
        // I-render ang Resume/CV section na binubuo ng Builder options at Live Preview
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* ResumeBuilder: Naglalaman ng controls para sa template type at visibility options */}
          <ResumeBuilder
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            cvOptions={cvOptions}
            setCvOptions={setCvOptions}
            paperSize={paperSize}
            setPaperSize={setPaperSize}
            handleDownloadPDF={handleDownloadCV}
            handleDownloadWord={handleDownloadWord}
            handleDownloadImage={handleDownloadImage}
            selfEditForm={selfEditForm}
          />
          {/* ResumePreview: Nagpapakita ng live visual representation ng CV ng user */}
          <div className="lg:col-span-2 overflow-x-auto p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <ResumePreview
              selfEditForm={selfEditForm}
              selectedTemplate={selectedTemplate}
              cvOptions={cvOptions}
              paperSize={paperSize}
            />
          </div>
        </div>
      )}
    </div>
  );
}
