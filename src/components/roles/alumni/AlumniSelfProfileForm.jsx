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

    // Itakda ang paper size format
    let format = 'letter';
    if (paperSize === 'a4') format = 'a4';
    else if (paperSize === 'legal') format = 'legal';

    const opt = {
      margin: 0,
      filename: `BSC_Resume_${selfEditForm.firstName || 'BSC'}_${selfEditForm.lastName || 'Alumni'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (clonedDoc) => {
          // Kumuha ng kopya ng lahat ng CSS rules sa active page at linisin ang oklch rules
          const cleanStyle = clonedDoc.createElement('style');
          let combinedCss = '';
          
          for (let i = 0; i < document.styleSheets.length; i++) {
            const sheet = document.styleSheets[i];
            try {
              const rules = sheet.cssRules || sheet.rules;
              if (!rules) continue;
              for (let j = 0; j < rules.length; j++) {
                combinedCss += rules[j].cssText + '\n';
              }
            } catch (e) {
              // Ignore cross-origin access blocks
            }
          }
          
          // I-convert ang oklch colors sa standard RGB string format
          const oklchRegex = /oklch\(([^)]+)\)/g;
          combinedCss = combinedCss.replace(oklchRegex, (match) => {
            try {
              const temp = document.createElement('div');
              temp.style.color = match;
              document.body.appendChild(temp);
              const rgb = window.getComputedStyle(temp).color;
              document.body.removeChild(temp);
              return rgb;
            } catch (err) {
              return 'rgb(30, 41, 59)';
            }
          });
          
          cleanStyle.textContent = combinedCss;
          clonedDoc.querySelectorAll('style, link[rel="stylesheet"]').forEach(el => el.remove());
          clonedDoc.head.appendChild(cleanStyle);

          // Ayusin ang itsura ng container sa loob ng clone para sa eksaktong sukat ng page
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

    console.log('Executing html2pdf pipeline with format:', format);
    try {
      window.html2pdf().set(opt).from(element).save()
        .then(() => {
          console.log('html2pdf successfully generated and saved.');
        })
        .catch(err => {
          console.error('html2pdf promise rejection caught:', err);
          alert('Failed to generate PDF. Please try exporting as Image or Word.');
        });
    } catch (e) {
      console.error('Synchronous exception during html2pdf invocation:', e);
      alert('Error during PDF conversion: ' + e.message);
    }
  };

  /**
   * Nag-da-download ng Resume/CV bilang Word document (.doc) na gumagamit ng standard
   * page layout XML ng Word upang maging adjustable ang page size batay sa piniling paperSize.
   */
  const handleDownloadWord = () => {
    const element = document.querySelector('.resume-container');
    if (!element) {
      alert('Resume element not found.');
      return;
    }

    // Tukuyin ang size properties para sa CSS ng Word section
    let sizeCss = '';
    if (paperSize === 'a4') {
      sizeCss = '@page Section1 { size: 8.27in 11.69in; margin: 0.5in; } div.Section1 { page: Section1; }';
    } else if (paperSize === 'legal') {
      sizeCss = '@page Section1 { size: 8.5in 14.0in; margin: 0.5in; } div.Section1 { page: Section1; }';
    } else {
      // letter
      sizeCss = '@page Section1 { size: 8.5in 11.0in; margin: 0.5in; } div.Section1 { page: Section1; }';
    }

    const contentHtml = element.innerHTML;

    // Wrap in Word template and compile inline helper styles to format the flex/grid items cleanly
    const htmlDoc = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>Resume - ${selfEditForm.firstName || ''} ${selfEditForm.lastName || ''}</title>
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
            font-family: "Segoe UI", Arial, sans-serif;
            color: #1e293b;
            line-height: 1.3;
            margin: 0;
            padding: 0;
          }
          .resume-container {
            width: 100%;
          }
          /* Custom layout overrides to format flex blocks in Word */
          .flex {
            display: block;
            width: 100%;
          }
          /* Column split for Modern layout */
          .md\\:w-1\\/3 {
            float: left;
            width: 30%;
            margin-right: 4%;
          }
          .flex-1 {
            float: left;
            width: 66%;
          }
          /* Clear floats */
          .resume-container:after {
            content: "";
            display: table;
            clear: both;
          }
          .space-y-6 > * + * { margin-top: 15px; }
          .space-y-4 > * + * { margin-top: 12px; }
          .space-y-3 > * + * { margin-top: 8px; }
          .space-y-2 > * + * { margin-top: 6px; }
          .space-y-1 > * + * { margin-top: 3px; }
          
          /* Colors */
          .text-\\[\\#7c191e\\] { color: #7c191e !important; }
          .text-\\[\\#cca43b\\] { color: #cca43b !important; }
          .text-slate-900 { color: #0f172a !important; }
          .text-slate-800 { color: #1e293b !important; }
          .text-slate-705, .text-slate-700 { color: #334155 !important; }
          .text-slate-650, .text-slate-655 { color: #475569 !important; }
          .text-slate-505, .text-slate-500 { color: #64748b !important; }
          .text-slate-400 { color: #94a3b8 !important; }
          
          /* Borders and Dividers */
          .border-b { border-bottom: 1px solid #7c191e; }
          .border-b-2 { border-bottom: 2px solid #cca43b; }
          .border-t { border-top: 1px solid #e2e8f0; }
          .border-l-2 { border-left: 2px solid #e2e8f0; padding-left: 8px; }
          .pb-1 { padding-bottom: 4px; }
          .pb-4 { padding-bottom: 12px; }
          .pt-1 { padding-top: 4px; }
          .mt-2 { margin-top: 8px; }
          .mt-1 { margin-top: 4px; }
          
          /* Typo sizes */
          h2 { font-size: 16pt; margin: 0 0 5px 0; font-weight: bold; }
          h3 { font-size: 11pt; margin: 12px 0 4px 0; font-weight: bold; text-transform: uppercase; }
          .text-xs { font-size: 8.5pt; }
          .text-sm { font-size: 9.5pt; }
          .text-[11px] { font-size: 8.5pt; }
          .text-[10px] { font-size: 8pt; }
          .text-[9px] { font-size: 7.5pt; }
          .font-black, .font-extrabold { font-weight: bold; }
          .font-bold { font-weight: bold; }
          .uppercase { text-transform: uppercase; }
          .italic { font-style: italic; }
          
          /* Center content for classic/gold styles */
          .text-center { text-align: center; }
          .justify-center { text-align: center; }
          
          /* Photo styling */
          .rounded-lg { border-radius: 6px; }
          .rounded-full { border-radius: 50%; }
          
          /* Skill badge wrappers */
          .flex-wrap { display: block; margin-top: 4px; }
          .bg-slate-100 { 
            background: #f1f5f9; 
            padding: 2px 6px; 
            border-radius: 4px; 
            font-size: 8pt; 
            display: inline-block; 
            margin-right: 4px; 
            margin-bottom: 4px; 
          }
          .list-item { display: inline-block; margin-right: 12px; }
        </style>
      </head>
      <body>
        <div class="Section1">
          ${contentHtml}
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

    window.html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      onclone: (clonedDoc) => {
        // Redefine clonedDoc.styleSheets to bypass OKLCH crashes dynamically in html2canvas parsing
        const cleanStyle = clonedDoc.createElement('style');
        let combinedCss = '';
        
        for (let i = 0; i < document.styleSheets.length; i++) {
          const sheet = document.styleSheets[i];
          try {
            const rules = sheet.cssRules || sheet.rules;
            if (!rules) continue;
            for (let j = 0; j < rules.length; j++) {
              combinedCss += rules[j].cssText + '\n';
            }
          } catch (e) {
            // Cross-origin CSS block bypass
          }
        }
        
        // Convert all oklch values to their equivalent RGB strings
        const oklchRegex = /oklch\(([^)]+)\)/g;
        combinedCss = combinedCss.replace(oklchRegex, (match) => {
          try {
            const temp = document.createElement('div');
            temp.style.color = match;
            document.body.appendChild(temp);
            const rgb = window.getComputedStyle(temp).color;
            document.body.removeChild(temp);
            return rgb;
          } catch (err) {
            return 'rgb(30, 41, 59)';
          }
        });
        
        cleanStyle.textContent = combinedCss;
        clonedDoc.querySelectorAll('style, link[rel="stylesheet"]').forEach(el => el.remove());
        clonedDoc.head.appendChild(cleanStyle);

        // Adjust layout of the container inside the canvas clone
        const clonedContainer = clonedDoc.querySelector('.resume-container');
        if (clonedContainer) {
          clonedContainer.style.margin = '0';
          clonedContainer.style.border = 'none';
          clonedContainer.style.boxShadow = 'none';
        }
      }
    }).then(canvas => {
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
