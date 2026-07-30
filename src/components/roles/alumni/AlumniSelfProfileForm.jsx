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
   * Nag-da-download ng Resume/CV bilang PDF gamit ang 'html2pdf.js' library.
   * Kung wala pa ang library sa pahina, kukunin muna ito bago simulan ang pag-convert.
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

    // 1. STRIP OKLCH RULES FROM ALL ACTIVE STYLESHEETS
    const oklchRulesBackup = [];
    const originalStyleSheets = document.styleSheets;

    console.log('Scanning active stylesheets for oklch rules...');
    for (let i = 0; i < originalStyleSheets.length; i++) {
      const sheet = originalStyleSheets[i];
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (!rules) continue;
        for (let j = rules.length - 1; j >= 0; j--) {
          const rule = rules[j];
          if (rule.cssText && rule.cssText.includes('oklch')) {
            oklchRulesBackup.push({
              sheet: sheet,
              index: j,
              cssText: rule.cssText
            });
            sheet.deleteRule(j);
          }
        }
      } catch (e) {
        // Ignore cross-origin stylesheet access block errors
      }
    }
    console.log(`Backed up and stripped ${oklchRulesBackup.length} oklch style rules.`);

    // 2. INTERCEPT WINDOW.GETCOMPUTEDSTYLE TO CONVERT OKLCH TO RGB ON THE FLY
    const originalGetComputedStyle = window.getComputedStyle;
    const oklchCache = {};
    const oklchRegex = /oklch\([^)]+\)/g;

    function convertOklchToRgb(oklchStr) {
      if (oklchCache[oklchStr]) return oklchCache[oklchStr];
      try {
        const tempDiv = document.createElement('div');
        tempDiv.style.color = oklchStr;
        document.body.appendChild(tempDiv);
        const computedColor = originalGetComputedStyle(tempDiv).color;
        document.body.removeChild(tempDiv);
        oklchCache[oklchStr] = computedColor;
        return computedColor;
      } catch (err) {
        return 'rgb(30, 41, 59)';
      }
    }

    function translateOklchInString(str) {
      if (typeof str !== 'string' || !str.includes('oklch')) return str;
      return str.replace(oklchRegex, (match) => convertOklchToRgb(match));
    }

    // Mock window.getComputedStyle to translate oklch to rgb on the fly
    window.getComputedStyle = function (el, pseudoEl) {
      const style = originalGetComputedStyle(el, pseudoEl);
      return new Proxy(style, {
        get(target, prop) {
          if (prop === 'getPropertyValue') {
            return function (propertyName) {
              const val = target.getPropertyValue(propertyName);
              return translateOklchInString(val);
            };
          }
          const val = target[prop];
          if (typeof val === 'string' && val.includes('oklch')) {
            return translateOklchInString(val);
          }
          if (typeof val === 'function') {
            return val.bind(target);
          }
          return val;
        }
      });
    };

    console.log('Found resume container element. Initializing html2pdf payload...', element);
    const opt = {
      margin:       0.2,
      filename:     `BSC_Resume_${selfEditForm.firstName || 'BSC'}_${selfEditForm.lastName || 'Alumni'}_2026.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { 
        scale: 2, 
        useCORS: true, 
        logging: true,
        onclone: (clonedDoc) => {
          const iframeWin = clonedDoc.defaultView;
          if (!iframeWin) return;
          
          const originalGetComputedStyle = iframeWin.getComputedStyle;
          const oklchCache = {};
          const oklchRegex = /oklch\([^)]+\)/g;

          function convertOklchToRgb(oklchStr) {
            if (oklchCache[oklchStr]) return oklchCache[oklchStr];
            try {
              const tempDiv = clonedDoc.createElement('div');
              tempDiv.style.color = oklchStr;
              clonedDoc.body.appendChild(tempDiv);
              const computedColor = originalGetComputedStyle.call(iframeWin, tempDiv).color;
              clonedDoc.body.removeChild(tempDiv);
              oklchCache[oklchStr] = computedColor;
              return computedColor;
            } catch (err) {
              return 'rgb(30, 41, 59)';
            }
          }

          function translateOklchInString(str) {
            if (typeof str !== 'string' || !str.includes('oklch')) return str;
            return str.replace(oklchRegex, (match) => convertOklchToRgb(match));
          }

          iframeWin.getComputedStyle = function (el, pseudoEl) {
            const style = originalGetComputedStyle.call(iframeWin, el, pseudoEl);
            return new Proxy(style, {
              get(target, prop) {
                if (prop === 'getPropertyValue') {
                  return function (propertyName) {
                    const val = target.getPropertyValue(propertyName);
                    return translateOklchInString(val);
                  };
                }
                const val = target[prop];
                if (typeof val === 'string' && val.includes('oklch')) {
                  return translateOklchInString(val);
                }
                if (typeof val === 'function') {
                  return val.bind(target);
                }
                return val;
              }
            });
          };
        }
      },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    const restoreOriginals = () => {
      window.getComputedStyle = originalGetComputedStyle;
      
      // Restore deleted oklch rules in reverse order of backup to maintain original indices
      console.log('Restoring stripped oklch style rules...');
      for (let i = oklchRulesBackup.length - 1; i >= 0; i--) {
        const item = oklchRulesBackup[i];
        try {
          item.sheet.insertRule(item.cssText, item.index);
        } catch (e) {
          // Silent catch
        }
      }
      console.log('Restoration complete.');
    };

    console.log('Executing html2pdf pipeline...');
    try {
      window.html2pdf().set(opt).from(element).save()
        .then(() => {
          console.log('html2pdf output save promise resolved successfully.');
          restoreOriginals();
        })
        .catch(err => {
          console.error('html2pdf promise rejection caught:', err);
          alert('Failed to generate PDF. Check developer console.');
          restoreOriginals();
        });
    } catch (e) {
      console.error('Synchronous exception during html2pdf invocation:', e);
      alert('Error during PDF conversion: ' + e.message);
      restoreOriginals();
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Subtab Switcher: Nagsisilbing nabigasyon sa pagitan ng Tracer Form at Resume Builder */}
      <div className="bg-white rounded-xl border border-slate-100 p-2 flex gap-1.5 shadow-xs w-full max-w-sm no-print-resume">
        <button
          onClick={() => setActiveSubTab('Tracer')}
          className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition select-none cursor-pointer ${
            activeSubTab === 'Tracer' ? 'bg-[#7c191e] text-white shadow-sm' : 'hover:bg-slate-150 text-slate-655'
          }`}
        >
          Tracer Intake Sheet
        </button>
        <button
          onClick={() => setActiveSubTab('Resume')}
          className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition select-none cursor-pointer ${
            activeSubTab === 'Resume' ? 'bg-[#7c191e] text-white shadow-sm' : 'hover:bg-slate-150 text-slate-655'
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
            handleDownloadCV={handleDownloadCV}
            handlePrintCV={handlePrintCV}
            selfEditForm={selfEditForm}
          />
          {/* ResumePreview: Nagpapakita ng live visual representation ng CV ng user */}
          <div className="lg:col-span-2 overflow-x-auto p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <ResumePreview
              selfEditForm={selfEditForm}
              selectedTemplate={selectedTemplate}
              cvOptions={cvOptions}
            />
          </div>
        </div>
      )}
    </div>
  );
}
