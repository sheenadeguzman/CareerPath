import React from 'react';

export default function ResumePreview({
  selfEditForm,
  selectedTemplate,
  cvOptions
}) {
  const fullName = [selfEditForm.firstName, selfEditForm.middleName, selfEditForm.lastName, selfEditForm.suffix].filter(Boolean).join(' ');
  const programShort = selfEditForm.program || '';
  const email = selfEditForm.email || '';
  const phone = selfEditForm.phone || '';
  const address = selfEditForm.address || '';
  const civilStatus = selfEditForm.civilStatus || '';
  const gender = selfEditForm.gender || '';
  const yearGraduated = selfEditForm.yearGraduated || '';
  const skills = selfEditForm.skills || [];

  // 1. MODERN PROFESSIONAL RESUME TEMPLATE (May mga Maroon Accents at Left Rail Columns)
  if (selectedTemplate === 'modern') {
    return (
      <div className="resume-container w-full max-w-[800px] mx-auto bg-white shadow-lg p-8 border border-slate-200 text-slate-800 flex flex-col md:flex-row gap-6 font-sans antialiased my-2 min-h-[900px] select-text">
        <div className="w-full md:w-1/3 space-y-6 md:border-r md:border-slate-100 md:pr-6">
          <div className="space-y-2">
            <h2 className="text-lg font-black text-[#7c191e] uppercase tracking-wide leading-tight">{fullName}</h2>
            <span className="text-xs font-bold text-slate-505 uppercase tracking-widest block">{programShort.replace('BS ', '')} Graduate</span>
          </div>
          
          <div className="space-y-2 text-[11px] font-semibold text-slate-600">
            <span className="text-[10px] font-extrabold uppercase text-[#7c191e] tracking-widest block">Contact Info</span>
            {cvOptions.showPhone && <div className="truncate">Phone: {phone || 'Not provided'}</div>}
            <div className="truncate">Email: {email}</div>
            <div className="break-words">Address: {address || 'Basco, Batanes'}</div>
            {cvOptions.showCivilStatus && (
              <div className="pt-1 border-t border-slate-100 mt-2 space-y-1">
                <div>Status: {civilStatus}</div>
                <div>Gender: {gender}</div>
              </div>
            )}
          </div>

          {cvOptions.showSkills && skills.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase text-[#7c191e] tracking-widest block">Core Skills</span>
              <div className="flex flex-wrap gap-1">
                {skills.map(s => (
                  <span key={s} className="bg-slate-100 text-slate-705 px-2 py-0.5 rounded text-[10px] font-bold">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-6">
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-[#7c191e] tracking-widest border-b border-[#7c191e] pb-1">Academic Background</h3>
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
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-[#7c191e] tracking-widest border-b border-[#7c191e] pb-1">Work History</h3>
            {selfEditForm.employmentStatus === 'Unemployed' && (!selfEditForm.careerHistory || selfEditForm.careerHistory.length === 0) ? (
              <span className="text-[11px] italic text-slate-400 block font-medium">Currently seeking opportunities.</span>
            ) : (
              <div className="space-y-4">
                {/* Current job details */}
                {selfEditForm.employmentStatus !== 'Unemployed' && (
                  <div className="space-y-1.5 border-l-2 border-[#7c191e] pl-3 py-0.5">
                    <div className="space-y-0.5">
                      <div className="flex justify-between font-extrabold text-xs">
                        <span>{selfEditForm.jobTitle || 'Staff Member'} (Current)</span>
                        <span className="text-slate-505 font-bold">{selfEditForm.employmentType}</span>
                      </div>
                      <div className="text-[11px] font-bold text-[#cca43b]">{selfEditForm.employerName}</div>
                    </div>
                    {cvOptions.showDescription && selfEditForm.jobDescription && (
                      <p className="text-[11px] text-slate-500 leading-relaxed font-semibold pr-2">
                        {selfEditForm.jobDescription}
                      </p>
                    )}
                    {cvOptions.showSalary && selfEditForm.monthlyIncome && (
                      <span className="block text-[10px] bg-slate-100 text-[#7c191e] px-2 py-0.5 rounded w-fit font-bold font-mono">Monthly Income: P {selfEditForm.monthlyIncome}</span>
                    )}
                  </div>
                )}

                {/* Past career history timeline */}
                {selfEditForm.careerHistory && selfEditForm.careerHistory.map((item, index) => (
                  <div key={index} className="space-y-1 border-l-2 border-slate-200 pl-3 py-0.5">
                    <div className="flex justify-between font-extrabold text-xs">
                      <span>{item.title}</span>
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
    );
  }

  // 2. GOLD MINIMALIST RESUME TEMPLATE (May Eleganteng Gold Borders at Stacked Layout)
  if (selectedTemplate === 'gold') {
    return (
      <div className="resume-container w-full max-w-[800px] mx-auto bg-white shadow-lg p-10 border border-slate-200 text-slate-800 font-serif antialiased my-2 min-h-[900px] space-y-8 select-text">
        <div className="text-center space-y-2 pb-4 border-b-2 border-[#cca43b]">
          <h2 className="text-2xl font-normal text-slate-900 uppercase tracking-widest leading-none">{fullName}</h2>
          <span className="text-[10px] font-bold text-[#cca43b] uppercase tracking-widest block font-sans">{programShort}</span>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] font-sans font-bold text-slate-500 pb-2 border-b border-slate-100">
          {cvOptions.showPhone && phone && <span>Phone: {phone}</span>}
          <span>Email: {email}</span>
          <span>Address: {address || 'Basco, Batanes'}</span>
          {cvOptions.showCivilStatus && <span>Status: {civilStatus}</span>}
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold uppercase text-[#cca43b] tracking-widest border-b border-slate-100 pb-1 font-sans">Education</h3>
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
          </div>

          <div className="space-y-3">
            <h3 className="text-[11px] font-bold uppercase text-[#cca43b] tracking-widest border-b border-slate-100 pb-1 font-sans">Professional Experience</h3>
            {selfEditForm.employmentStatus === 'Unemployed' && (!selfEditForm.careerHistory || selfEditForm.careerHistory.length === 0) ? (
              <span className="text-xs italic text-slate-400 block font-medium font-sans">Currently seeking opportunities.</span>
            ) : (
              <div className="space-y-4">
                {selfEditForm.employmentStatus !== 'Unemployed' && (
                  <div className="space-y-2">
                    <div className="font-sans">
                      <div className="flex justify-between font-extrabold text-xs text-slate-900">
                        <span>{selfEditForm.jobTitle || 'Staff Member'} (Current)</span>
                        <span className="font-normal text-slate-500">{selfEditForm.employmentType}</span>
                      </div>
                      <div className="text-[11px] font-extrabold text-slate-655">{selfEditForm.employerName}</div>
                    </div>
                    {cvOptions.showDescription && selfEditForm.jobDescription && (
                      <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
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
            <div className="space-y-3">
              <h3 className="text-[11px] font-bold uppercase text-[#cca43b] tracking-widest border-b border-slate-100 pb-1 font-sans">Technical Competencies</h3>
              <div className="flex flex-wrap gap-1.5 font-sans">
                {skills.map(s => (
                  <span key={s} className="bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. CLASSIC EXECUTIVE RESUME TEMPLATE (May Serif Typography at Tradisyunal na Centered Headers)
  return (
    <div className="resume-container w-full max-w-[800px] mx-auto bg-white shadow-lg p-10 border border-slate-200 text-slate-955 font-serif antialiased my-2 min-h-[900px] space-y-6 select-text">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-wide leading-none">{fullName}</h2>
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block font-sans">{programShort}</span>
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
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-widest border-b border-slate-900 pb-0.5">Education</h3>
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
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-widest border-b border-slate-900 pb-0.5">Professional Experience</h3>
          {selfEditForm.employmentStatus === 'Unemployed' && (!selfEditForm.careerHistory || selfEditForm.careerHistory.length === 0) ? (
            <span className="text-xs italic text-slate-400 block font-medium">Currently seeking opportunities.</span>
          ) : (
            <div className="space-y-4">
              {selfEditForm.employmentStatus !== 'Unemployed' && (
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between font-bold text-xs text-slate-900">
                      <span>{selfEditForm.jobTitle || 'Staff Member'} (Current)</span>
                      <span className="font-normal text-slate-500 font-sans text-[10px]">{selfEditForm.employmentType}</span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-800">{selfEditForm.employerName}</div>
                  </div>
                  {cvOptions.showDescription && selfEditForm.jobDescription && (
                    <p className="text-xs text-slate-705 leading-relaxed font-semibold">
                      {selfEditForm.jobDescription}
                    </p>
                  )}
                  {cvOptions.showSalary && selfEditForm.monthlyIncome && (
                    <span className="block text-[10px] font-sans font-bold uppercase text-slate-505">Compensation: P {selfEditForm.monthlyIncome}</span>
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
      </div>
    </div>
  );
}
