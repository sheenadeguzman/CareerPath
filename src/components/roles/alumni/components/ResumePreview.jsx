import React from 'react';

export default function ResumePreview({
  selfEditForm: rawForm,
  selectedTemplate,
  cvOptions,
  paperSize = 'letter'
}) {
  const selfEditForm = rawForm ? {
    ...rawForm,
    employmentStatus: rawForm.employmentStatus === 'No Response' ? 'Unemployed' : (rawForm.employmentStatus || 'Unemployed')
  } : {};

  const paperStyles = {
    letter: {
      maxWidth: '8.5in',
      minHeight: '11in',
    },
    a4: {
      maxWidth: '8.27in',
      minHeight: '11.69in',
    },
    legal: {
      maxWidth: '8.5in',
      minHeight: '14in',
    }
  };
  const currentPaperStyle = paperStyles[paperSize] || paperStyles.letter;

  const fullName = [selfEditForm.firstName, selfEditForm.middleName, selfEditForm.lastName, selfEditForm.suffix].filter(Boolean).join(' ');
  const programShort = selfEditForm.program || '';
  const email = selfEditForm.email || '';
  const phone = selfEditForm.phone || '';
  const address = selfEditForm.address || '';
  const civilStatus = selfEditForm.civilStatus || '';
  const gender = selfEditForm.gender || '';
  const yearGraduated = selfEditForm.yearGraduated || '';
  const skills = selfEditForm.skills || [];

  // styleOverride: pinipilit ang browser na gumamit ng standard HEX/RGB para sa mga kulay,
  // sa halip na OKLCH ng Tailwind CSS, upang maiwasan ang error sa html2canvas/html2pdf parsing.
  const styleOverride = (
    <style dangerouslySetInnerHTML={{ __html: `
      .resume-container, .resume-container * {
        color: #1e293b;
        border-color: #e2e8f0;
      }
      .resume-container .text-slate-900 { color: #0f172a !important; }
      .resume-container .text-slate-800 { color: #1e293b !important; }
      .resume-container .text-slate-700 { color: #334155 !important; }
      .resume-container .text-slate-655, .resume-container .text-slate-650 { color: #475569 !important; }
      .resume-container .text-slate-505, .resume-container .text-slate-500 { color: #64748b !important; }
      .resume-container .text-slate-400 { color: #94a3b8 !important; }
      
      .resume-container .bg-white { background-color: #ffffff !important; }
      .resume-container .bg-slate-100 { background-color: #f1f5f9 !important; }
      .resume-container .bg-slate-50 { background-color: #f8fafc !important; }
      .resume-container .bg-slate-55 { background-color: #f8fafc !important; }
      
      .resume-container .border-slate-200 { border-color: #e2e8f0 !important; }
      .resume-container .border-slate-100 { border-color: #f1f5f9 !important; }
      
      .resume-container .shadow-lg {
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
      }
      .resume-container .shadow-xs {
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
      }
      .resume-container .shadow-3xs {
        box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.03) !important;
      }
    `}} />
  );

  // 1. MODERN PROFESSIONAL RESUME TEMPLATE (May mga Maroon Accents at Left Rail Columns)
  if (selectedTemplate === 'modern') {
    return (
      <div className="resume-wrapper relative">
        {styleOverride}
        <div 
          className="resume-container mx-auto bg-white shadow-lg border border-slate-200 text-slate-800 flex flex-col md:flex-row gap-0 font-sans antialiased my-2 select-text"
          style={{ ...currentPaperStyle, width: '100%', boxSizing: 'border-box' }}
        >
          {/* Left Column (Sidebar) */}
          <div className="w-full md:w-1/3 bg-[#faf6f6] border-r border-slate-100 p-8 space-y-6 flex flex-col">
            {cvOptions.showPhoto && selfEditForm?.avatar && (
              <div className="flex justify-start mb-2">
                <img 
                  src={selfEditForm.avatar} 
                  alt="Profile Avatar" 
                  className="w-24 h-24 rounded-lg object-cover border-2 border-[#7c191e] shadow-xs"
                />
              </div>
            )}
            <div className="space-y-2">
              <h2 className="text-lg font-black text-[#7c191e] uppercase tracking-wide leading-tight">{fullName}</h2>
              <span className="text-xs font-bold text-slate-555 uppercase tracking-widest block">{programShort.replace('BS ', '')} Graduate</span>
            </div>
            
            {cvOptions.showAboutMe && selfEditForm.aboutMe && (
              <div className="space-y-2 text-[11px] font-semibold text-slate-600">
                <span className="text-[10px] font-extrabold uppercase text-[#7c191e] tracking-widest block border-b border-[#7c191e]/20 pb-1">About Me</span>
                <p className="whitespace-pre-line text-slate-550 leading-relaxed font-sans">{selfEditForm.aboutMe}</p>
              </div>
            )}
            
            <div className="space-y-2 text-[11px] font-semibold text-slate-655">
              <span className="text-[10px] font-extrabold uppercase text-[#7c191e] tracking-widest block border-b border-[#7c191e]/20 pb-1">Contact Info</span>
              {cvOptions.showPhone && <div className="truncate"><b>Phone:</b> {phone || 'Not provided'}</div>}
              <div className="truncate"><b>Email:</b> {email}</div>
              <div className="break-words"><b>Address:</b> {address || 'Basco, Batanes'}</div>
              {cvOptions.showCivilStatus && (
                <div className="pt-2 border-t border-slate-200/50 mt-2 space-y-1">
                  <div><b>Status:</b> {civilStatus}</div>
                  <div><b>Gender:</b> {gender}</div>
                </div>
              )}
            </div>

            {cvOptions.showSkills && skills.length > 0 && (
              <div className="space-y-2 text-[11px] font-semibold text-slate-600">
                <span className="text-[10px] font-extrabold uppercase text-[#7c191e] tracking-widest block border-b border-[#7c191e]/20 pb-1">Core Skills</span>
                <div className="space-y-1">
                  {skills.map(s => (
                    <div key={s} className="truncate">• {s}</div>
                  ))}
                </div>
              </div>
            )}

            {cvOptions.showLanguages && selfEditForm.languages && (
              <div className="space-y-2 text-[11px] font-semibold text-slate-600">
                <span className="text-[10px] font-extrabold uppercase text-[#7c191e] tracking-widest block border-b border-[#7c191e]/20 pb-1">Languages</span>
                <div className="space-y-1">
                  {selfEditForm.languages.split(',').map(l => l.trim()).filter(Boolean).map(l => (
                    <div key={l} className="truncate">• {l}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 p-8 space-y-6">
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-[#7c191e] tracking-widest border-b border-[#7c191e] pb-1">Academic Background</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between font-extrabold text-xs">
                    <span>Batanes State College</span>
                    <span>{selfEditForm.yearEnrolled ? `${selfEditForm.yearEnrolled} - ` : 'Class of '}{yearGraduated}</span>
                  </div>
                  <span className="block text-[11px] font-bold text-slate-505">{programShort}</span>
                  {selfEditForm.honors && selfEditForm.honors !== 'None' && (
                    <span className="block text-[10px] text-amber-600 font-bold uppercase tracking-wider mt-1">Honors: {selfEditForm.honors}</span>
                  )}
                  {selfEditForm.professionalExamPassed && selfEditForm.professionalExamPassed !== 'None' && (
                    <span className="block text-[10px] text-emerald-800 font-bold uppercase tracking-wider mt-0.5">License: {selfEditForm.professionalExamPassed}</span>
                  )}
                </div>

                {selfEditForm.educationHistory && selfEditForm.educationHistory.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between font-extrabold text-xs">
                      <span>{item.school}</span>
                      <span className="text-slate-500 font-bold">{item.years}</span>
                    </div>
                    <span className="block text-[11px] font-bold text-slate-505">{item.degree}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-[#7c191e] tracking-widest border-b border-[#7c191e] pb-1">Professional Experience</h3>
              {selfEditForm.employmentStatus === 'Unemployed' && (!selfEditForm.careerHistory || selfEditForm.careerHistory.length === 0) ? (
                <span className="text-xs italic text-slate-400 block font-medium">Currently seeking opportunities.</span>
              ) : (
                <div className="space-y-4">
                  {selfEditForm.employmentStatus !== 'Unemployed' && (
                    <div className="space-y-2">
                      <div className="flex justify-between font-extrabold text-xs">
                        <span>{selfEditForm.jobTitle || 'Graduate Trainee'}</span>
                        <span className="text-[#7c191e] font-extrabold">{selfEditForm.jobStartYear ? `${selfEditForm.jobStartYear} - Present` : 'Present'}</span>
                      </div>
                      <div className="text-[11px] font-bold text-slate-505 italic">{selfEditForm.employerName || 'Independent'}</div>
                      
                      {cvOptions.showDescription && selfEditForm.jobDescription && (
                        <p className="text-[10px] text-slate-650 leading-relaxed font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100 whitespace-pre-line">
                          {selfEditForm.jobDescription}
                        </p>
                      )}
                      {cvOptions.showSalary && selfEditForm.monthlyIncome && (
                        <span className="block text-[10px] text-[#7c191e] font-bold uppercase tracking-wider">Income Bracket: P {selfEditForm.monthlyIncome}</span>
                      )}
                    </div>
                  )}

                  {/* Past career history timeline */}
                  {selfEditForm.careerHistory && selfEditForm.careerHistory.map((item, index) => (
                    <div key={index} className="space-y-1 border-l-2 border-slate-200 pl-4 py-1 relative">
                      <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-[#cca43b] border border-white" />
                      <div className="flex justify-between font-extrabold text-xs">
                        <span className="text-slate-800">{item.title}</span>
                        <span className="text-slate-500 font-bold">{item.years}</span>
                      </div>
                      <div className="text-[11px] font-bold text-[#cca43b]">{item.company}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. GOLD MINIMALIST RESUME TEMPLATE (May Eleganteng Gold Borders at Stacked Layout)
  if (selectedTemplate === 'gold') {
    return (
      <div className="resume-wrapper relative">
        {styleOverride}
        <div 
          className="resume-container mx-auto bg-white shadow-lg p-10 border-4 border-double border-[#cca43b] text-slate-800 font-serif antialiased my-2 space-y-8 select-text"
          style={{ ...currentPaperStyle, width: '100%', boxSizing: 'border-box' }}
        >
          <div className="text-center space-y-2 pb-4 border-b-2 border-[#cca43b]">
            {cvOptions.showPhoto && selfEditForm?.avatar && (
              <div className="flex justify-center mb-3">
                <img 
                  src={selfEditForm.avatar} 
                  alt="Profile Avatar" 
                  className="w-24 h-24 rounded-full object-cover border-2 border-[#cca43b] p-0.5 shadow-xs"
                />
              </div>
            )}
            <h2 className="text-2xl font-normal text-slate-900 uppercase tracking-widest leading-none">{fullName}</h2>
            <span className="text-[10px] font-bold text-[#cca43b] uppercase tracking-widest block font-sans">{programShort}</span>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] font-sans font-bold text-slate-505 pb-2 border-b border-slate-100">
            {cvOptions.showPhone && phone && <span>Phone: {phone}</span>}
            <span>Email: {email}</span>
            <span>Address: {address || 'Basco, Batanes'}</span>
            {cvOptions.showCivilStatus && <span>Status: {civilStatus}</span>}
          </div>

          <div className="space-y-6">
            {cvOptions.showAboutMe && selfEditForm.aboutMe && (
              <div className="space-y-2">
                <h3 className="text-[11px] font-bold uppercase text-[#cca43b] tracking-widest border-b border-slate-100 pb-1 font-sans">About Me</h3>
                <p className="text-[10.5px] text-slate-655 font-sans leading-relaxed whitespace-pre-line">{selfEditForm.aboutMe}</p>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-[11px] font-bold uppercase text-[#cca43b] tracking-widest border-b border-slate-100 pb-1 font-sans">Education</h3>
              <div className="space-y-3">
                <div className="space-y-1 font-sans">
                  <div className="flex justify-between font-extrabold text-xs text-slate-900">
                    <span>Batanes State College</span>
                    <span className="font-normal text-slate-500">{selfEditForm.yearEnrolled ? `${selfEditForm.yearEnrolled} - ` : 'Graduated '}{yearGraduated}</span>
                  </div>
                  <span className="block text-[11px] font-medium text-slate-650 italic">{programShort}</span>
                  {selfEditForm.honors && selfEditForm.honors !== 'None' && (
                    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Honors: {selfEditForm.honors}</span>
                  )}
                  {selfEditForm.professionalExamPassed && selfEditForm.professionalExamPassed !== 'None' && (
                    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">License: {selfEditForm.professionalExamPassed}</span>
                  )}
                </div>

                {selfEditForm.educationHistory && selfEditForm.educationHistory.map((item, index) => (
                  <div key={index} className="space-y-1 font-sans">
                    <div className="flex justify-between font-extrabold text-xs text-slate-900">
                      <span>{item.school}</span>
                      <span className="font-normal text-slate-500">{item.years}</span>
                    </div>
                    <span className="block text-[11px] font-medium text-slate-650 italic">{item.degree}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-[11px] font-bold uppercase text-[#cca43b] tracking-widest border-b border-slate-100 pb-1 font-sans">Professional Experience</h3>
              {selfEditForm.employmentStatus === 'Unemployed' && (!selfEditForm.careerHistory || selfEditForm.careerHistory.length === 0) ? (
                <span className="text-xs italic text-slate-400 block font-medium font-sans">Currently seeking opportunities.</span>
              ) : (
                <div className="space-y-5">
                  {selfEditForm.employmentStatus !== 'Unemployed' && (
                    <div className="space-y-2">
                      <div className="flex justify-between font-extrabold text-xs text-slate-900 font-sans">
                        <span>{selfEditForm.jobTitle || 'Graduate Trainee'}</span>
                        <span className="text-[#cca43b] font-bold">{selfEditForm.jobStartYear ? `${selfEditForm.jobStartYear} - Present` : 'Present'}</span>
                      </div>
                      <div className="text-[11px] font-medium text-slate-505 italic font-sans">{selfEditForm.employerName || 'Independent'}</div>
                      
                      {cvOptions.showDescription && selfEditForm.jobDescription && (
                        <p className="text-[10.5px] text-slate-655 font-sans leading-relaxed whitespace-pre-line">
                          {selfEditForm.jobDescription}
                        </p>
                      )}
                      {cvOptions.showSalary && selfEditForm.monthlyIncome && (
                        <span className="block text-[10px] text-[#cca43b] font-bold font-sans uppercase">Income Bracket: P {selfEditForm.monthlyIncome}</span>
                      )}
                    </div>
                  )}

                  {selfEditForm.careerHistory && selfEditForm.careerHistory.map((item, index) => (
                    <div key={index} className="space-y-1 font-sans">
                      <div className="flex justify-between font-extrabold text-xs text-slate-900">
                        <span>{item.title}</span>
                        <span className="font-normal text-slate-500">{item.years}</span>
                      </div>
                      <div className="text-[11px] font-extrabold text-slate-655">{item.company}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cvOptions.showSkills && skills.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-[11px] font-bold uppercase text-[#cca43b] tracking-widest border-b border-slate-100 pb-1 font-sans">Technical Competencies</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold text-slate-600 font-sans">
                    {skills.map(s => (
                      <span key={s} className="list-item list-inside">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {cvOptions.showLanguages && selfEditForm.languages && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-[11px] font-bold uppercase text-[#cca43b] tracking-widest border-b border-slate-100 pb-1 font-sans">Languages</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold text-slate-600 font-sans">
                    {selfEditForm.languages.split(',').map(l => l.trim()).filter(Boolean).map(l => (
                      <span key={l} className="list-item list-inside">{l}</span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    );
  }

  // 4. EMERALD CORPORATE TEMPLATE
  if (selectedTemplate === 'emerald') {
    return (
      <div className="resume-wrapper relative">
        {styleOverride}
        <div 
          className="resume-container mx-auto bg-white shadow-lg border border-slate-200 text-slate-800 flex flex-col md:flex-row gap-0 font-sans antialiased my-2 select-text"
          style={{ ...currentPaperStyle, width: '100%', boxSizing: 'border-box' }}
        >
          {/* Left Column (Sidebar) */}
          <div className="w-full md:w-1/3 bg-[#f2faf7] border-r border-[#064e3b]/10 p-8 space-y-6 flex flex-col">
            {cvOptions.showPhoto && selfEditForm?.avatar && (
              <div className="flex justify-start mb-2">
                <img 
                  src={selfEditForm.avatar} 
                  alt="Profile Avatar" 
                  className="w-24 h-24 rounded-lg object-cover border-2 border-[#064e3b] shadow-xs"
                />
              </div>
            )}
            <div className="space-y-2">
              <h2 className="text-lg font-black text-[#064e3b] uppercase tracking-wide leading-tight">{fullName}</h2>
              <span className="text-xs font-bold text-slate-550 uppercase tracking-widest block">{programShort.replace('BS ', '')} Graduate</span>
            </div>

            {cvOptions.showAboutMe && selfEditForm.aboutMe && (
              <div className="space-y-2 text-[11px] font-semibold text-slate-600">
                <span className="text-[10px] font-extrabold uppercase text-[#064e3b] tracking-widest block border-b border-[#064e3b]/20 pb-1">About Me</span>
                <p className="whitespace-pre-line text-slate-550 leading-relaxed font-sans">{selfEditForm.aboutMe}</p>
              </div>
            )}
            
            <div className="space-y-2 text-[11px] font-semibold text-slate-655">
              <span className="text-[10px] font-extrabold uppercase text-[#064e3b] tracking-widest block border-b border-[#064e3b]/20 pb-1">Contact Info</span>
              {cvOptions.showPhone && <div className="truncate"><b>Phone:</b> {phone || 'Not provided'}</div>}
              <div className="truncate"><b>Email:</b> {email}</div>
              <div className="break-words"><b>Address:</b> {address || 'Basco, Batanes'}</div>
              {cvOptions.showCivilStatus && (
                <div className="pt-2 border-t border-slate-200/50 mt-2 space-y-1">
                  <div><b>Status:</b> {civilStatus}</div>
                  <div><b>Gender:</b> {gender}</div>
                </div>
              )}
            </div>

            {cvOptions.showSkills && skills.length > 0 && (
              <div className="space-y-2 text-[11px] font-semibold text-slate-600">
                <span className="text-[10px] font-extrabold uppercase text-[#064e3b] tracking-widest block border-b border-[#064e3b]/20 pb-1">Core Skills</span>
                <div className="space-y-1">
                  {skills.map(s => (
                    <div key={s} className="truncate">• {s}</div>
                  ))}
                </div>
              </div>
            )}

            {cvOptions.showLanguages && selfEditForm.languages && (
              <div className="space-y-2 text-[11px] font-semibold text-slate-600">
                <span className="text-[10px] font-extrabold uppercase text-[#064e3b] tracking-widest block border-b border-[#064e3b]/20 pb-1">Languages</span>
                <div className="space-y-1">
                  {selfEditForm.languages.split(',').map(l => l.trim()).filter(Boolean).map(l => (
                    <div key={l} className="truncate">• {l}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 p-8 space-y-6">
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-[#064e3b] tracking-widest border-b border-[#064e3b] pb-1">Academic Background</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between font-extrabold text-xs">
                    <span>Batanes State College</span>
                    <span>{selfEditForm.yearEnrolled ? `${selfEditForm.yearEnrolled} - ` : 'Class of '}{yearGraduated}</span>
                  </div>
                  <span className="block text-[11px] font-bold text-slate-505">{programShort}</span>
                  {selfEditForm.honors && selfEditForm.honors !== 'None' && (
                    <span className="block text-[10px] text-amber-600 font-bold uppercase tracking-wider mt-1">Honors: {selfEditForm.honors}</span>
                  )}
                  {selfEditForm.professionalExamPassed && selfEditForm.professionalExamPassed !== 'None' && (
                    <span className="block text-[10px] text-[#064e3b] font-bold uppercase tracking-wider mt-0.5">License: {selfEditForm.professionalExamPassed}</span>
                  )}
                </div>

                {selfEditForm.educationHistory && selfEditForm.educationHistory.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between font-extrabold text-xs">
                      <span>{item.school}</span>
                      <span>{item.years}</span>
                    </div>
                    <span className="block text-[11px] font-bold text-slate-505">{item.degree}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-[#064e3b] tracking-widest border-b border-[#064e3b] pb-1">Professional Experience</h3>
              {selfEditForm.employmentStatus === 'Unemployed' && (!selfEditForm.careerHistory || selfEditForm.careerHistory.length === 0) ? (
                <span className="text-[11px] italic text-slate-400 block font-bold">Currently seeking opportunities.</span>
              ) : (
                <div className="space-y-5">
                  {selfEditForm.employmentStatus !== 'Unemployed' && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-extrabold text-xs">
                        <span>{selfEditForm.jobTitle || 'Graduate Trainee'}</span>
                        <span className="text-[#064e3b] font-extrabold">{selfEditForm.jobStartYear ? `${selfEditForm.jobStartYear} - Present` : 'Present'}</span>
                      </div>
                      <span className="block text-[11px] font-extrabold text-[#064e3b]">{selfEditForm.employerName || 'Independent'} &bull; {selfEditForm.employmentType}</span>
                      {cvOptions.showDescription && selfEditForm.jobDescription && (
                        <p className="text-[10px] text-slate-655 leading-relaxed font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100 whitespace-pre-line">
                          {selfEditForm.jobDescription}
                        </p>
                      )}
                      {cvOptions.showSalary && selfEditForm.monthlyIncome && (
                        <span className="block text-[9px] text-[#064e3b] font-bold uppercase tracking-wider">Income Bracket: P {selfEditForm.monthlyIncome}</span>
                      )}
                    </div>
                  )}

                  {selfEditForm.careerHistory && selfEditForm.careerHistory.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between font-extrabold text-xs">
                        <span>{item.title}</span>
                        <span>{item.years}</span>
                      </div>
                      <span className="block text-[11px] font-bold text-slate-505">{item.company}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. MIDNIGHT MINIMAL TEMPLATE
  if (selectedTemplate === 'midnight') {
    return (
      <div className="resume-wrapper relative">
        {styleOverride}
        <div 
          className="resume-container mx-auto bg-white shadow-lg p-10 border-t-8 border-[#1e1b4b] text-slate-800 font-sans antialiased my-2 space-y-6 select-text"
          style={{ ...currentPaperStyle, width: '100%', boxSizing: 'border-box' }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-200 gap-4">
            <div className="space-y-1.5">
              {cvOptions.showPhoto && selfEditForm?.avatar && (
                <div className="mb-2">
                  <img 
                    src={selfEditForm.avatar} 
                    alt="Profile Avatar" 
                    className="w-20 h-20 rounded-full object-cover border-2 border-[#1e1b4b]"
                  />
                </div>
              )}
              <h2 className="text-2xl font-black text-[#1e1b4b] uppercase tracking-wide leading-none">{fullName}</h2>
              <span className="text-xs font-bold text-[#1e1b4b] uppercase tracking-widest block">{programShort}</span>
            </div>
            
            <div className="text-left md:text-right text-[10px] font-bold text-slate-500 space-y-1">
              {cvOptions.showPhone && phone && <div><b>Phone:</b> {phone}</div>}
              <div><b>Email:</b> {email}</div>
              <div><b>Address:</b> {address || 'Basco, Batanes'}</div>
              {cvOptions.showCivilStatus && <div><b>Status:</b> {civilStatus} &bull; <b>Gender:</b> {gender}</div>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-5">
              {cvOptions.showAboutMe && selfEditForm.aboutMe && (
                <div className="space-y-2">
                  <h3 className="text-[10px] font-extrabold uppercase text-[#1e1b4b] tracking-wider border-b border-[#1e1b4b]/20 pb-1">About Me</h3>
                  <p className="text-[10.5px] text-slate-655 leading-relaxed whitespace-pre-line">{selfEditForm.aboutMe}</p>
                </div>
              )}

              {cvOptions.showSkills && skills.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[10px] font-extrabold uppercase text-[#1e1b4b] tracking-wider border-b border-[#1e1b4b]/20 pb-1">Skills</h3>
                  <div className="space-y-1 text-[11px] font-semibold text-slate-600">
                    {skills.map(s => (
                      <div key={s} className="truncate">• {s}</div>
                    ))}
                  </div>
                </div>
              )}

              {cvOptions.showLanguages && selfEditForm.languages && (
                <div className="space-y-2">
                  <h3 className="text-[10px] font-extrabold uppercase text-[#1e1b4b] tracking-wider border-b border-[#1e1b4b]/20 pb-1">Languages</h3>
                  <div className="space-y-1 text-[11px] font-semibold text-slate-600">
                    {selfEditForm.languages.split(',').map(l => l.trim()).filter(Boolean).map(l => (
                      <div key={l} className="truncate">• {l}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-2 space-y-5">
              <div className="space-y-3">
                <h3 className="text-[10px] font-extrabold uppercase text-[#1e1b4b] tracking-wider border-b border-[#1e1b4b]/20 pb-1">Education</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between font-extrabold text-xs text-slate-900">
                      <span>Batanes State College</span>
                      <span className="font-normal text-slate-505">{selfEditForm.yearEnrolled ? `${selfEditForm.yearEnrolled} - ` : 'Graduated '}{yearGraduated}</span>
                    </div>
                    <span className="block text-[11px] font-medium text-slate-600 italic">{programShort}</span>
                    {selfEditForm.honors && selfEditForm.honors !== 'None' && (
                      <span className="block text-[9px] text-[#1e1b4b] font-bold uppercase tracking-wider">Honors: {selfEditForm.honors}</span>
                    )}
                    {selfEditForm.professionalExamPassed && selfEditForm.professionalExamPassed !== 'None' && (
                      <span className="block text-[9px] text-emerald-800 font-bold uppercase tracking-wider">License: {selfEditForm.professionalExamPassed}</span>
                    )}
                  </div>

                  {selfEditForm.educationHistory && selfEditForm.educationHistory.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between font-extrabold text-xs text-slate-900">
                        <span>{item.school}</span>
                        <span className="font-normal text-slate-505">{item.years}</span>
                      </div>
                      <span className="block text-[11px] font-medium text-slate-600 italic">{item.degree}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-[10px] font-extrabold uppercase text-[#1e1b4b] tracking-wider border-b border-[#1e1b4b]/20 pb-1">Professional Experience</h3>
                {selfEditForm.employmentStatus === 'Unemployed' && (!selfEditForm.careerHistory || selfEditForm.careerHistory.length === 0) ? (
                  <span className="text-xs italic text-slate-400 block font-medium">Currently seeking opportunities.</span>
                ) : (
                  <div className="space-y-4">
                    {selfEditForm.employmentStatus !== 'Unemployed' && (
                      <div className="space-y-2">
                        <div className="flex justify-between font-extrabold text-xs text-slate-900">
                          <span>{selfEditForm.jobTitle || 'Graduate Trainee'}</span>
                          <span className="text-[#1e1b4b] font-bold">{selfEditForm.jobStartYear ? `${selfEditForm.jobStartYear} - Present` : 'Present'}</span>
                        </div>
                        <div className="text-[11px] font-medium text-slate-500 italic">{selfEditForm.employerName || 'Independent'} &bull; {selfEditForm.employmentType}</div>
                        {cvOptions.showDescription && selfEditForm.jobDescription && (
                          <p className="text-[10px] text-slate-655 leading-relaxed whitespace-pre-line bg-slate-50 p-2 rounded">
                            {selfEditForm.jobDescription}
                          </p>
                        )}
                        {cvOptions.showSalary && selfEditForm.monthlyIncome && (
                          <span className="block text-[9px] text-[#1e1b4b] font-bold uppercase">Income Bracket: P {selfEditForm.monthlyIncome}</span>
                        )}
                      </div>
                    )}

                    {selfEditForm.careerHistory && selfEditForm.careerHistory.map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between font-extrabold text-xs text-slate-900">
                          <span>{item.title}</span>
                          <span className="font-normal text-slate-505">{item.years}</span>
                        </div>
                        <div className="text-[11px] font-medium text-slate-505">{item.company}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 6. CHARCOAL CLEAN TEMPLATE
  if (selectedTemplate === 'charcoal') {
    return (
      <div className="resume-wrapper relative">
        {styleOverride}
        <div 
          className="resume-container mx-auto bg-white shadow-lg p-12 border border-slate-200 text-slate-900 font-sans antialiased my-2 space-y-6 select-text"
          style={{ ...currentPaperStyle, width: '100%', boxSizing: 'border-box' }}
        >
          <div className="text-center space-y-1.5 pb-4 border-b border-slate-200">
            {cvOptions.showPhoto && selfEditForm?.avatar && (
              <div className="flex justify-center mb-2">
                <img 
                  src={selfEditForm.avatar} 
                  alt="Profile Avatar" 
                  className="w-20 h-20 rounded-full object-cover border border-slate-300 shadow-3xs"
                />
              </div>
            )}
            <h2 className="text-2xl font-black text-[#334155] uppercase tracking-wide leading-none">{fullName}</h2>
            <span className="text-xs font-bold text-slate-550 uppercase tracking-widest block">{programShort}</span>
            <div className="text-[10px] font-bold text-slate-400 space-x-1.5">
              {cvOptions.showPhone && phone && <span>Phone: {phone} &bull;</span>}
              <span>Email: {email}</span>
              <span>&bull; Address: {address || 'Basco, Batanes'}</span>
            </div>
            {cvOptions.showCivilStatus && (
              <div className="text-[9px] font-bold text-slate-405 uppercase tracking-wider">
                Status: {civilStatus} &bull; Gender: {gender}
              </div>
            )}
          </div>

          <div className="space-y-5">
            {cvOptions.showAboutMe && selfEditForm.aboutMe && (
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase text-[#334155] tracking-widest border-b border-slate-200 pb-0.5">About Me</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-line">{selfEditForm.aboutMe}</p>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase text-[#334155] tracking-widest border-b border-slate-200 pb-0.5">Education</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between font-bold text-xs text-slate-900">
                    <span>Batanes State College</span>
                    <span className="font-normal text-slate-500">{selfEditForm.yearEnrolled ? `${selfEditForm.yearEnrolled} - ` : 'Graduated '}{yearGraduated}</span>
                  </div>
                  <span className="block text-[11px] font-semibold text-slate-505 italic">{programShort}</span>
                  {selfEditForm.honors && selfEditForm.honors !== 'None' && (
                    <span className="block text-[9px] font-bold text-amber-700 uppercase mt-0.5">Honors: {selfEditForm.honors}</span>
                  )}
                  {selfEditForm.professionalExamPassed && selfEditForm.professionalExamPassed !== 'None' && (
                    <span className="block text-[9px] font-bold text-emerald-800 uppercase mt-0.5">License: {selfEditForm.professionalExamPassed}</span>
                  )}
                </div>

                {selfEditForm.educationHistory && selfEditForm.educationHistory.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between font-bold text-xs text-slate-900">
                      <span>{item.school}</span>
                      <span className="font-normal text-slate-500">{item.years}</span>
                    </div>
                    <span className="block text-[11px] font-semibold text-slate-505 italic">{item.degree}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase text-[#334155] tracking-widest border-b border-slate-200 pb-0.5">Professional Experience</h3>
              {selfEditForm.employmentStatus === 'Unemployed' && (!selfEditForm.careerHistory || selfEditForm.careerHistory.length === 0) ? (
                <span className="text-xs italic text-slate-400 block font-medium">Currently seeking opportunities.</span>
              ) : (
                <div className="space-y-4">
                  {selfEditForm.employmentStatus !== 'Unemployed' && (
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold text-xs text-slate-900">
                        <span>{selfEditForm.jobTitle || 'Graduate Trainee'}</span>
                        <span className="font-normal text-[#334155] font-bold text-[10px]">{selfEditForm.jobStartYear ? `${selfEditForm.jobStartYear} - Present` : 'Present'}</span>
                      </div>
                      <div className="text-[11px] font-bold text-slate-550 italic">{selfEditForm.employerName || 'Independent'} &bull; {selfEditForm.employmentType}</div>
                      
                      {cvOptions.showDescription && selfEditForm.jobDescription && (
                        <p className="text-[10px] text-slate-600 leading-relaxed whitespace-pre-line py-1">
                          {selfEditForm.jobDescription}
                        </p>
                      )}
                      {cvOptions.showSalary && selfEditForm.monthlyIncome && (
                        <span className="block text-[9px] text-[#334155] font-bold uppercase">Income Bracket: P {selfEditForm.monthlyIncome}</span>
                      )}
                    </div>
                  )}

                  {selfEditForm.careerHistory && selfEditForm.careerHistory.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between font-bold text-xs text-slate-900">
                        <span>{item.title}</span>
                        <span className="font-normal text-slate-500 text-[10px]">{item.years}</span>
                      </div>
                      <div className="text-[11px] font-bold text-slate-505">{item.company}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cvOptions.showSkills && skills.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase text-[#334155] tracking-widest border-b border-slate-200 pb-0.5">Skills and Certifications</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-705">
                  {skills.map(s => (
                    <span key={s} className="list-item list-inside">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {cvOptions.showLanguages && selfEditForm.languages && (
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase text-[#334155] tracking-widest border-b border-slate-200 pb-0.5">Languages</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-705">
                  {selfEditForm.languages.split(',').map(l => l.trim()).filter(Boolean).map(l => (
                    <span key={l} className="list-item list-inside">{l}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. CLASSIC EXECUTIVE RESUME TEMPLATE (May Serif Typography at Tradisyunal na Centered Headers)
  return (
    <div className="resume-wrapper relative">
      {styleOverride}
      <div 
        className="resume-container mx-auto bg-white shadow-lg p-10 border border-slate-200 text-slate-955 font-serif antialiased my-2 space-y-6 select-text"
        style={{ ...currentPaperStyle, width: '100%', boxSizing: 'border-box' }}
      >
        <div className="text-center space-y-1">
          {cvOptions.showPhoto && selfEditForm?.avatar && (
            <div className="flex justify-center mb-3">
              <img 
                src={selfEditForm.avatar} 
                alt="Profile Avatar" 
                className="w-24 h-24 rounded-full object-cover border border-slate-200 shadow-xs"
              />
            </div>
          )}
          <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-wide leading-none">{fullName}</h2>
          <span className="text-[11px] font-bold text-slate-505 uppercase tracking-widest block font-sans">{programShort}</span>
          <div className="text-[10px] font-sans font-semibold text-slate-505 space-x-1.5">
            {cvOptions.showPhone && phone && <span>Phone: {phone} &bull;</span>}
            <span>Email: {email}</span>
            <span>&bull; Address: {address || 'Basco, Batanes'}</span>
          </div>
          {cvOptions.showCivilStatus && (
            <div className="text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider mt-1">
              Status: {civilStatus} &bull; Gender: {gender}
            </div>
          )}
        </div>

        <div className="space-y-5">
          {cvOptions.showAboutMe && selfEditForm.aboutMe && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-widest border-b border-slate-900 pb-0.5">About Me</h3>
              <p className="text-[11px] text-slate-655 leading-relaxed whitespace-pre-line font-serif">{selfEditForm.aboutMe}</p>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-widest border-b border-slate-900 pb-0.5">Education</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-xs text-slate-900">
                  <span>Batanes State College</span>
                  <span>{selfEditForm.yearEnrolled ? `${selfEditForm.yearEnrolled} - ` : 'Graduated '}{yearGraduated}</span>
                </div>
                <span className="block text-[11px] font-medium text-slate-650 italic">{programShort}</span>
                {selfEditForm.honors && selfEditForm.honors !== 'None' && (
                  <span className="block text-[10px] font-bold uppercase tracking-wider mt-1">Honors: {selfEditForm.honors}</span>
                )}
                {selfEditForm.professionalExamPassed && selfEditForm.professionalExamPassed !== 'None' && (
                  <span className="block text-[10px] font-bold uppercase tracking-wider mt-0.5">License: {selfEditForm.professionalExamPassed}</span>
                )}
              </div>

              {selfEditForm.educationHistory && selfEditForm.educationHistory.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between font-bold text-xs text-slate-900">
                    <span>{item.school}</span>
                    <span>{item.years}</span>
                  </div>
                  <span className="block text-[11px] font-medium text-slate-650 italic">{item.degree}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-widest border-b border-slate-900 pb-0.5">Professional Experience</h3>
            {selfEditForm.employmentStatus === 'Unemployed' && (!selfEditForm.careerHistory || selfEditForm.careerHistory.length === 0) ? (
              <span className="text-xs italic text-slate-400 block font-medium">Currently seeking opportunities.</span>
            ) : (
              <div className="space-y-4">
                {selfEditForm.employmentStatus !== 'Unemployed' && (
                  <div className="space-y-1">
                    <div className="flex justify-between font-bold text-xs text-slate-900">
                      <span>{selfEditForm.jobTitle || 'Graduate Trainee'}</span>
                      <span className="font-normal text-slate-500 font-sans text-[10px]">{selfEditForm.jobStartYear ? `${selfEditForm.jobStartYear} - Present` : 'Present'}</span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-800 italic">{selfEditForm.employerName || 'Independent'}</div>
                    
                    {cvOptions.showDescription && selfEditForm.jobDescription && (
                      <p className="text-[10px] text-slate-650 leading-relaxed whitespace-pre-line py-1">
                        {selfEditForm.jobDescription}
                      </p>
                    )}
                    {cvOptions.showSalary && selfEditForm.monthlyIncome && (
                      <span className="block text-[9px] text-slate-500 font-bold uppercase">Income Bracket: P {selfEditForm.monthlyIncome}</span>
                    )}
                  </div>
                )}

                {selfEditForm.careerHistory && selfEditForm.careerHistory.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between font-bold text-xs text-slate-900">
                      <span>{item.title}</span>
                      <span className="font-normal text-slate-500 font-sans text-[10px]">{item.years}</span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-800">{item.company}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cvOptions.showSkills && skills.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-widest border-b border-slate-900 pb-0.5">Skills and Certifications</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-705">
                {skills.map(s => (
                  <span key={s} className="list-item list-inside">{s}</span>
                ))}
              </div>
            </div>
          )}

          {cvOptions.showLanguages && selfEditForm.languages && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-widest border-b border-slate-900 pb-0.5">Languages</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-755 font-sans">
                {selfEditForm.languages.split(',').map(l => l.trim()).filter(Boolean).map(l => (
                  <span key={l} className="list-item list-inside">{l}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
