/**
 * @file AlumniSelfProfileForm.jsx
 * @description Main controller na nagbibigay-daan sa mga graduate na i-update ang kanilang sariling tracer profile.
 * Nag-uugnay sa TracerForm, ResumeBuilder, at ResumePreview sub-components.
 */

import React, { useState, useEffect } from 'react';
import { BSC_PROGRAMS } from '../../../bscData';
import TracerForm from './components/TracerForm';
import ResumeBuilder from './components/ResumeBuilder';
import ResumePreview from './components/ResumePreview';

/**
 * Calculates age dynamically based on a birth date string.
 * @param {string} dobString - Date of birth.
 * @returns {string|number}
 */
const calculateAge = (dobString) => {
  if (!dobString) return 'N/A';
  const today = new Date();
  const birthDate = new Date(dobString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return isNaN(age) ? 'N/A' : age;
};

export default function AlumniSelfProfileForm({ currentAlAlumnus, onSaveAlumni, triggerToast }) {
  const [selfEditForm, setSelfEditForm] = useState(currentAlAlumnus);

  const parseProgram = (progStr) => {
    if (!progStr) return { base: 'Bachelor of Science in Information Technology', major: '' };
    const matchedBase = BSC_PROGRAMS.find(p => progStr.toLowerCase().includes(p.toLowerCase()));
    if (matchedBase) {
      const remaining = progStr.substring(progStr.toLowerCase().indexOf(matchedBase.toLowerCase()) + matchedBase.length).trim();
      const majorClean = remaining.replace(/^(major\s+in|major|[-,\s])+/i, '').trim();
      return { base: matchedBase, major: majorClean };
    }
    return { base: progStr, major: '' };
  };

  const initialProg = parseProgram(currentAlAlumnus?.program);
  const [selectedBaseProg, setSelectedBaseProg] = useState(initialProg.base);
  const [selectedMajor, setSelectedMajor] = useState(initialProg.major);

  useEffect(() => {
    if (currentAlAlumnus) {
      setSelfEditForm(currentAlAlumnus);
      const parsed = parseProgram(currentAlAlumnus.program);
      setSelectedBaseProg(parsed.base);
      setSelectedMajor(parsed.major);
    }
  }, [currentAlAlumnus]);

  const [newSkillToken, setNewSkillToken] = useState('');
  const [customUsefulSkill, setCustomUsefulSkill] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('Tracer');
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  
  const [cvOptions, setCvOptions] = useState({
    showSalary: false,
    showCivilStatus: true,
    showPhone: true,
    showSkills: true,
    showDescription: true
  });

  const addSkillToken = (e) => {
    e.preventDefault();
    if (!newSkillToken.trim() || !selfEditForm) return;
    if (selfEditForm.skills.includes(newSkillToken.trim())) return;
    
    setSelfEditForm({
      ...selfEditForm,
      skills: [...selfEditForm.skills, newSkillToken.trim()]
    });
    setNewSkillToken('');
  };

  const removeSkillToken = (skillToRemove) => {
    if (!selfEditForm) return;
    setSelfEditForm({
      ...selfEditForm,
      skills: selfEditForm.skills.filter(s => s !== skillToRemove)
    });
  };

  const removeUsefulSkill = (skillToRemove) => {
    if (!selfEditForm) return;
    const currentSkills = selfEditForm.usefulSkills || [];
    setSelfEditForm({
      ...selfEditForm,
      usefulSkills: currentSkills.filter(s => s !== skillToRemove)
    });
  };

  const addCustomUsefulSkillDirectly = () => {
    if (!selfEditForm || !customUsefulSkill.trim()) return;
    const skillToAdd = customUsefulSkill.trim();
    const currentSkills = selfEditForm.usefulSkills || [];
    if (currentSkills.includes(skillToAdd)) {
      alert('Mayroon na nito sa listahan ng iyong mga useful skills.');
      return;
    }
    setSelfEditForm({
      ...selfEditForm,
      usefulSkills: [...currentSkills, skillToAdd]
    });
    setCustomUsefulSkill('');
  };

  const handleSelfFormSubmit = async (e) => {
    e.preventDefault();
    if (!selfEditForm) return;

    let filledFields = 0;
    const fieldsToTrack = [
      'phone', 'gender', 'civilStatus', 'dateOfBirth', 'address', 'professionalExamPassed',
      'middleName', 'suffix', 'yearEnrolled', 'alumniAssociationStatus', 'isBoardPasser'
    ];
    fieldsToTrack.forEach(field => {
      if (selfEditForm[field]) filledFields++;
    });

    if (selfEditForm.usefulSkills && selfEditForm.usefulSkills.length > 0) {
      filledFields++;
    }

    if (selfEditForm.employmentStatus === 'Unemployed') {
      if (selfEditForm.reasonsUnemployment) filledFields++;
    }

    if (selfEditForm.employmentStatus !== 'Unemployed') {
      const empFields = [
        'jobTitle', 'jobDescription', 'employerName', 'employmentType', 'sector', 
        'monthlyIncome', 'findFirstJob', 'reasonsAcceptingJob', 'jobIndustry', 'firstJobRelatedToCourse'
      ];
      empFields.forEach(field => {
        if (selfEditForm[field]) filledFields++;
      });
    }

    const totalPossibleFields = selfEditForm.employmentStatus === 'Unemployed' ? 13 : 22;
    const calculatedCompleteness = Math.min(
      40 + Math.round((filledFields / totalPossibleFields) * 60), 
      100
    );

    const submissionProfile = {
      ...selfEditForm,
      name: [selfEditForm.firstName, selfEditForm.middleName, selfEditForm.lastName, selfEditForm.suffix].filter(Boolean).join(' '),
      profileCompleteness: calculatedCompleteness,
      lastUpdated: new Date().toISOString()
    };

    await onSaveAlumni(submissionProfile);
    triggerToast('SUCCESS! Your Graduate Tracer profile information has been securely updated.');
  };

  const handlePrintCV = () => {
    document.body.classList.add('print-resume-only');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('print-resume-only');
    }, 500);
  };

  const handleDownloadCV = () => {
    const runHtml2Pdf = () => {
      const element = document.querySelector('.resume-container');
      const opt = {
        margin:       0.2,
        filename:     `BSC_Resume_${selfEditForm.firstName}_${selfEditForm.lastName}_2026.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      window.html2pdf().set(opt).from(element).save();
    };

    if (window.html2pdf) {
      runHtml2Pdf();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.integrity = 'sha512-GsLlZN/3F2ErC5IfS5Q/cxXXpHaXB5RYHNkD3GrOk8OI+mHyR9WjQ8AQcms9cgGpIiAHjM8A1tKMEwGZGgC5vw==';
      script.crossOrigin = 'anonymous';
      script.referrerPolicy = 'no-referrer';
      script.onload = runHtml2Pdf;
      document.body.appendChild(script);
    }
  };

  return (
    <div className="space-y-6 font-sans">
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

      {activeSubTab === 'Tracer' ? (
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <ResumeBuilder
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            cvOptions={cvOptions}
            setCvOptions={setCvOptions}
            handleDownloadCV={handleDownloadCV}
            handlePrintCV={handlePrintCV}
          />
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
