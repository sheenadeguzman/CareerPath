import React, { useState } from 'react';
import { 
  Briefcase, Calendar, MapPin, Tag, PlusCircle, Check, Users, ShieldAlert, 
  X, Mail, Phone, Globe, User, Pencil, FileText, Eye, GraduationCap, 
  Award, Building, HardHat, FileCheck, Printer, Coins, AlertCircle 
} from 'lucide-react';

export default function JobPostingsView({ jobPostings = [], employers = [], activeUser, onSaveJob }) {
  const [isPosting, setIsPosting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Pagtukoy kung ang logged-in user ay ang employer
  const loggedInEmp = activeUser?.role === 'Employer'
    ? employers.find(e => e.email.toLowerCase() === activeUser.email.toLowerCase())
    : null;
  const loggedInEmpName = loggedInEmp ? loggedInEmp.companyName : activeUser?.name || '';

  // Mga state para sa pagsala (filter)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmpType, setSelectedEmpType] = useState('All');
  const [minSalary, setMinSalary] = useState(0);
  const [selectedDistanceLimit, setSelectedDistanceLimit] = useState('Any');

  // Mga state para sa form inputs
  const [newJob, setNewJob] = useState({
    id: '',
    jobTitle: '',
    employerName: employers[0]?.companyName || '',
    description: '',
    requirements: [],
    applicationRequirements: [],
    employmentType: 'Regular/Permanent',
    salaryRange: 'P 18,000 - P 25,000',
    salaryGrade: '',
    placeOfAssignment: '',
    education: '',
    training: '',
    workExperience: '',
    eligibility: '',
    howToApply: '',
    contactAddress: '',
    location: 'Basco, Batanes',
    slots: 1,
    deadline: '',
    status: 'Open',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    contactWebsite: ''
  });

  const [reqInput, setReqInput] = useState('');
  const [appReqInput, setAppReqInput] = useState('');
  const [selectedNoticeJob, setSelectedNoticeJob] = useState(null);

  // Mga Coordinate ng Lokasyon (Ang BSC Main Campus sa Basco ang gitnang punto)
  const LOCATION_COORDINATES = {
    'Basco': { lat: 20.4485, lng: 121.9706, name: 'Batan Island' },
    'Mahatao': { lat: 20.4150, lng: 121.9610, name: 'Batan Island' },
    'Ivana': { lat: 20.3722, lng: 121.9167, name: 'Batan Island' },
    'Uyugan': { lat: 20.3540, lng: 121.9360, name: 'Batan Island' },
    'Sabtang': { lat: 20.3150, lng: 121.8410, name: 'Sabtang Island' },
    'Itbayat': { lat: 20.7850, lng: 121.8390, name: 'Itbayat Island' },
    'Manila': { lat: 14.5995, lng: 120.9842, name: 'Luzon (Mainland)' },
    'Tuguegarao': { lat: 17.6132, lng: 121.7270, name: 'Cagayan Valley' }
  };

  const parseSalary = (salaryStr) => {
    if (!salaryStr) return 0;
    const cleanStr = salaryStr.replace(/[P\s,₱]/g, '');
    const matches = cleanStr.match(/\d+/g);
    if (matches && matches.length > 0) {
      return Math.max(...matches.map(Number));
    }
    return 0;
  };

  const calculateDistance = (locName) => {
    const campus = { lat: 20.4485, lng: 121.9706 }; // BSC Basco Campus
    if (!locName) return null;

    const targetKey = Object.keys(LOCATION_COORDINATES).find(key => 
      locName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(locName.toLowerCase())
    );
    
    const target = targetKey ? LOCATION_COORDINATES[targetKey] : null;
    if (!target) return null;
    
    // Haversine formula para kalkulahin ang distansya
    const R = 6371; // Radius of Earth in km
    const dLat = ((target.lat - campus.lat) * Math.PI) / 180;
    const dLng = ((target.lng - campus.lng) * Math.PI) / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((campus.lat * Math.PI) / 180) *
        Math.cos((target.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return {
      km: Math.round(distance * 10) / 10,
      island: target.name
    };
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newJob.jobTitle.trim() || !newJob.deadline) {
      alert('Must populate job title and deadline details.');
      return;
    }

    const separatedReqs = reqInput.split(',').map(r => r.trim()).filter(r => r.length > 0);
    const separatedAppReqs = appReqInput.split(',').map(r => r.trim()).filter(r => r.length > 0);

    const submission = {
      ...newJob,
      employerName: activeUser.role === 'Employer' ? loggedInEmpName : newJob.employerName,
      id: newJob.id || `job-${Date.now()}`,
      requirements: separatedReqs.length > 0 ? separatedReqs : ['None specified'],
      applicationRequirements: separatedAppReqs.length > 0 ? separatedAppReqs : [
        'Fully accomplished Personal Data Sheet (PDS) with Work Experience Sheet (CS Form No. 212, Revised 2025)',
        'Hard copy or electronic copy of Transcript of Records (TOR)',
        'Application Letter addressed to the Appointing Authority'
      ],
      status: newJob.status || 'Open'
    };

    await onSaveJob(submission);
    setIsPosting(false);
    setIsEditing(false);
    setSuccessToast(`SUCCESS! Job Bulletin for '${newJob.jobTitle}' has been verified & deployed!`);
    setTimeout(() => setSuccessToast(''), 4000);

    // I-reset ang Form
    setNewJob({
      id: '',
      jobTitle: '',
      employerName: employers[0]?.companyName || '',
      description: '',
      requirements: [],
      applicationRequirements: [],
      employmentType: 'Regular/Permanent',
      salaryRange: 'P 18,000 - P 25,000',
      salaryGrade: '',
      placeOfAssignment: '',
      education: '',
      training: '',
      workExperience: '',
      eligibility: '',
      howToApply: '',
      contactAddress: '',
      location: 'Basco, Batanes',
      slots: 1,
      deadline: '',
      status: 'Open',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      contactWebsite: ''
    });
    setReqInput('');
    setAppReqInput('');
  };

  const handleEditClick = (job) => {
    const appReqs = (job.applicationRequirements && job.applicationRequirements.length > 0)
      ? job.applicationRequirements
      : [
          'Fully accomplished Personal Data Sheet (PDS) with Work Experience Sheet (CS Form No. 212, Revised 2025)',
          'Hard copy or electronic copy of Transcript of Records (TOR)',
          'Application Letter addressed to the Appointing Authority'
        ];

    setNewJob({
      id: job.id,
      jobTitle: job.jobTitle,
      employerName: job.employerName,
      description: job.description,
      requirements: job.requirements || [],
      applicationRequirements: appReqs,
      employmentType: job.employmentType || 'Regular/Permanent',
      salaryRange: job.salaryRange || 'P 18,000 - P 25,000',
      salaryGrade: job.salaryGrade || '',
      placeOfAssignment: job.placeOfAssignment || '',
      education: job.education || '',
      training: job.training || '',
      workExperience: job.workExperience || '',
      eligibility: job.eligibility || '',
      howToApply: job.howToApply || '',
      contactAddress: job.contactAddress || '',
      location: job.location || 'Basco, Batanes',
      slots: job.slots || 1,
      deadline: job.deadline ? job.deadline : '',
      status: job.status || 'Open',
      contactPerson: job.contactPerson || '',
      contactEmail: job.contactEmail || '',
      contactPhone: job.contactPhone || '',
      contactWebsite: job.contactWebsite || ''
    });
    setReqInput((job.requirements || []).join(', '));
    setAppReqInput(appReqs.join(', '));
    setIsEditing(true);
    setIsPosting(true);
  };  const filteredJobs = jobPostings.filter(job => {
    const text = (
      job.jobTitle + ' ' + 
      job.employerName + ' ' + 
      job.location + ' ' + 
      (job.placeOfAssignment || '') + ' ' +
      (job.salaryGrade || '') + ' ' +
      (job.education || '') + ' ' +
      (job.eligibility || '') + ' ' +
      job.description + ' ' + 
      (job.applicationRequirements || []).join(' ')
    ).toLowerCase();
    const matchesSearch = text.includes(searchQuery.toLowerCase());
    const matchesType = selectedEmpType === 'All' || job.employmentType === selectedEmpType;
    const salary = parseSalary(job.salaryRange);
    const matchesSalary = minSalary === 0 || salary >= minSalary;
    
    const distInfo = calculateDistance(job.location);
    let matchesDistance = true;
    if (selectedDistanceLimit === '10km') {
      matchesDistance = distInfo !== null && distInfo.km <= 10;
    } else if (selectedDistanceLimit === '50km') {
      matchesDistance = distInfo !== null && distInfo.km <= 50;
    } else if (selectedDistanceLimit === 'off-island') {
      matchesDistance = distInfo === null || distInfo.km > 50;
    }
    
    return matchesSearch && matchesType && matchesSalary && matchesDistance;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Popup ng Toast Notification */}
      {successToast && (
        <div className="p-4 bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
          <span className="p-1 bg-[#1e4620] text-emerald-50 rounded-full"><Check className="w-3" /></span>
          {successToast}
        </div>
      )}

      {/* Header ng Pagpapakilala (Intro Header) */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans">
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Vacancies and Employment Bulletin Board</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Explore career postings, trainee vacancies, and permanent placements offered by verified partners.</p>
        </div>

        {/* Mag-post ng trabaho kung ang user ay isang Employer */}
        {activeUser.role === 'Employer' && (
          <button
            onClick={() => setIsPosting(true)}
            className="px-4 py-2 bg-[#7c191e] hover:bg-[#7c191e]/90 text-white font-bold text-xs rounded-lg transition inline-flex items-center gap-1.5 uppercase shrink-0"
          >
            <PlusCircle className="w-4 h-4" /> Post Job Vacancy
          </button>
        )}
      </div>

      {/* Panel para sa Paghahanap at mga Filter (Search & Filters panel) */}
      <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-sans">
        
        {/* Input box para sa paghahanap ng teksto (Search text) */}
        <div>
          <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Search Bulletin</label>
          <input
            type="text"
            placeholder="Search job title, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#7c191e]"
          />
        </div>

        {/* Dropdown para sa Uri ng Trabaho (Employment Type) */}
        <div>
          <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Employment Type</label>
          <select
            value={selectedEmpType}
            onChange={(e) => setSelectedEmpType(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="All">All Placements</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Intern">Intern</option>
          </select>
        </div>

        {/* Dropdown para sa limitasyon ng distansya (Geodistance Limit) */}
        <div>
          <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Distance from BSC Campus</label>
          <select
            value={selectedDistanceLimit}
            onChange={(e) => setSelectedDistanceLimit(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="Any">Any Distance</option>
            <option value="10km">Within 10 km (Batan Island)</option>
            <option value="50km">Within 50 km (BSC Province)</option>
            <option value="off-island">Off-Island / Remote placements</option>
          </select>
        </div>

        {/* Slider para sa Minimum na Sahod (Salary Slider) */}
        <div className="flex flex-col justify-center">
          <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            <span>Min Salary</span>
            <span className="text-[#7c191e] font-extrabold">₱{minSalary.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="0"
            max="80000"
            step="5000"
            value={minSalary}
            onChange={(e) => setMinSalary(Number(e.target.value))}
            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer custom-slider mt-1"
          />
        </div>

      </div>

      {/* Status ng Filter at pag-reset ng mga filter */}
      {(searchQuery || selectedEmpType !== 'All' || minSalary > 0 || selectedDistanceLimit !== 'Any') && (
        <div className="flex justify-between items-center bg-slate-50 border border-slate-150 p-2.5 rounded-lg text-xs font-semibold">
          <span className="text-slate-505">
            Filtered Bulletin: Found <strong className="text-slate-805">{filteredJobs.length}</strong> matching vacancies.
          </span>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedEmpType('All');
              setMinSalary(0);
              setSelectedDistanceLimit('Any');
            }}
            className="text-[10px] text-[#7c191e] hover:underline font-bold uppercase"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Grid ng Bulletin Board para sa mga Job Posting */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
        {filteredJobs.map((job) => {
          const distInfo = calculateDistance(job.location);
          const matchingEmployer = employers.find(
            e => e.companyName.trim().toLowerCase() === job.employerName.trim().toLowerCase()
          );

          const isOwnJob = activeUser?.role === 'Employer' && (
            job.employerName.trim().toLowerCase() === loggedInEmpName.trim().toLowerCase() ||
            job.employerName.trim().toLowerCase() === (activeUser?.name || '').trim().toLowerCase()
          );

          return (
            <div key={job.id} className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 flex flex-col justify-between relative overflow-hidden animate-fade-in">
              
              {/* Tag ng Status sa itaas na sulok */}
              <div className="absolute top-0 right-0 flex items-center">
                {isOwnJob && (
                  <button
                    onClick={() => handleEditClick(job)}
                    className="p-1 text-slate-400 hover:text-[#7c191e] hover:bg-slate-50 rounded-lg transition mr-1.5 mt-1 cursor-pointer"
                    title="Edit Job Vacancy"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
                <span className={`px-3 py-1 rounded-bl-lg font-bold text-[9px] uppercase tracking-wider ${
                  job.status === 'Open' ? 'bg-[#7c191e] text-white' : 'bg-slate-400 text-white'
                }`}>
                  {job.status}
                </span>
              </div>

              <div className="space-y-4">
                {/* Detalye ng Header at Pamagat (Title details) */}
                <div className="space-y-1 pr-14">
                  <h3 className="text-sm font-extrabold text-slate-800">{job.jobTitle}</h3>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-bold text-[11px] text-[#7c191e] uppercase">{job.employerName}</span>
                    {job.placeOfAssignment && (
                      <span className="text-[9.5px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                        <Building className="w-2.5 h-2.5 text-[#7c191e]" />
                        {job.placeOfAssignment}
                      </span>
                    )}
                  </div>
                </div>

                {/* Strip para sa mga istatistika (Location, Type, Salary, Salary Grade) */}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 py-2.5 border-y border-slate-50 text-[10px] font-bold text-slate-500">
                  <div className="flex items-center gap-1 min-w-[80px]" title="Distance from BSC Campus">
                    <MapPin className="w-3.5 h-3.5 text-[#7c191e] shrink-0" />
                    <span className="truncate">{job.location}</span>
                    {distInfo && (
                      <span className="text-[9px] bg-slate-100 text-slate-650 px-1 py-0.2 rounded font-mono font-bold">
                        ({distInfo.km} km, {distInfo.island})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 min-w-[70px]">
                    <Tag className="w-3.5 h-3.5 text-[#cca43b] shrink-0" />
                    <span className="truncate">{job.employmentType}</span>
                  </div>
                  {job.salaryGrade && (
                    <div className="flex items-center gap-1 text-slate-700 font-bold">
                      <span className="text-[9px] bg-amber-50 text-amber-800 border border-amber-200/80 px-1.5 py-0.5 rounded">
                        SG {job.salaryGrade}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-emerald-750 font-black min-w-[95px]">
                    <span className="shrink-0 font-bold text-[#7c191e]">PHP</span>
                    <span className="truncate text-[#7c191e] font-extrabold">{job.salaryRange}</span>
                  </div>
                </div>

                {/* Paglalarawan ng Trabaho (Description) */}
                <div className="text-xs text-slate-605 font-medium leading-relaxed">
                  <p className="line-clamp-2">{job.description}</p>
                </div>

                {/* Qualification Standards (QS) Box - Civil Service Format */}
                {(job.education || job.workExperience || job.eligibility || job.training) && (
                  <div className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-200/60 space-y-1.5">
                    <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block">
                      Qualification Standards (QS):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px]">
                      {job.education && (
                        <div className="flex items-start gap-1 text-slate-600">
                          <GraduationCap className="w-3.5 h-3.5 text-[#7c191e] shrink-0 mt-0.5" />
                          <span className="leading-tight"><strong className="text-slate-700">Educ:</strong> {job.education}</span>
                        </div>
                      )}
                      {job.eligibility && (
                        <div className="flex items-start gap-1 text-slate-600">
                          <Award className="w-3.5 h-3.5 text-[#cca43b] shrink-0 mt-0.5" />
                          <span className="leading-tight"><strong className="text-slate-700">Elig:</strong> {job.eligibility}</span>
                        </div>
                      )}
                      {job.workExperience && (
                        <div className="flex items-start gap-1 text-slate-600">
                          <Briefcase className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                          <span className="leading-tight"><strong className="text-slate-700">Exp:</strong> {job.workExperience}</span>
                        </div>
                      )}
                      {job.training && (
                        <div className="flex items-start gap-1 text-slate-600">
                          <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-tight"><strong className="text-slate-700">Training:</strong> {job.training}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Requirements tags and chips */}
                {job.requirements && job.requirements.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Competencies / Skills:</span>
                    <div className="flex flex-wrap gap-1">
                      {job.requirements.map(req => (
                        <span key={req} className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200/50 rounded text-[9px] font-bold">
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Application Requirements (Attach the following documents) */}
                {(() => {
                  const appReqs = (job.applicationRequirements && job.applicationRequirements.length > 0)
                    ? job.applicationRequirements
                    : [
                        'Fully accomplished Personal Data Sheet (PDS) with Work Experience Sheet (CS Form No. 212, Revised 2025)',
                        'Hard copy or electronic copy of Transcript of Records (TOR)',
                        'Application Letter addressed to the Appointing Authority'
                      ];

                  return (
                    <div className="space-y-2 pt-1 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#7c191e] shrink-0" />
                          <span className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wider block">
                            Attach the Following Documents:
                          </span>
                        </div>
                        <span className="text-[9px] text-[#7c191e] font-semibold">{appReqs.length} required</span>
                      </div>
                      <div className="space-y-1">
                        {appReqs.map((appReq, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-start gap-2 p-1.5 rounded-lg bg-rose-50/60 border border-rose-100 text-[9.5px] text-slate-700 leading-snug"
                          >
                            <span className="w-4 h-4 rounded-full bg-[#7c191e] text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="font-medium text-slate-800">{appReq}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Employer Contact Details & How to Apply */}
                {(() => {
                  const jobContactPerson = job.contactPerson || matchingEmployer?.contactPerson;
                  const jobContactEmail = job.contactEmail || matchingEmployer?.email;
                  const jobContactPhone = job.contactPhone || matchingEmployer?.phone;
                  const jobContactWebsite = job.contactWebsite || matchingEmployer?.website;
                  const jobContactPosition = job.contactPosition || (job.contactPerson ? '' : matchingEmployer?.position);
                  const jobContactAddress = job.contactAddress || matchingEmployer?.address;

                  return (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 bg-slate-50/50 rounded-lg p-2.5 border border-slate-150">
                      <span className="text-[9px] text-slate-450 font-extrabold uppercase tracking-wider block">How to Apply &amp; Contact:</span>
                      
                      {job.howToApply && (
                        <p className="text-[9.5px] text-slate-600 italic leading-snug">
                          {job.howToApply}
                        </p>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] font-semibold text-slate-600">
                        {jobContactPerson && (
                          <div className="flex items-center gap-1.5 truncate">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate" title={`${jobContactPerson}${jobContactPosition ? ` (${jobContactPosition})` : ''}`}>
                              {jobContactPerson} {jobContactPosition && <span className="text-[9px] text-slate-400 font-normal">({jobContactPosition})</span>}
                            </span>
                          </div>
                        )}
                        {jobContactEmail && (
                          <div className="flex items-center gap-1.5 truncate">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <a href={`mailto:${jobContactEmail}`} className="text-[#7c191e] hover:underline truncate font-bold" title={jobContactEmail}>
                              {jobContactEmail}
                            </a>
                          </div>
                        )}
                        {jobContactPhone && (
                          <div className="flex items-center gap-1.5 truncate">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <a href={`tel:${jobContactPhone}`} className="text-slate-600 hover:underline truncate" title={jobContactPhone}>
                              {jobContactPhone}
                            </a>
                          </div>
                        )}
                        {jobContactWebsite && (
                          <div className="flex items-center gap-1.5 truncate">
                            <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <a 
                              href={jobContactWebsite.startsWith('http') ? jobContactWebsite : `https://${jobContactWebsite}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-[#cca43b] hover:underline truncate font-bold"
                              title={jobContactWebsite}
                            >
                              {jobContactWebsite}
                            </a>
                          </div>
                        )}
                        {jobContactAddress && (
                          <div className="flex items-center gap-1.5 truncate col-span-1 sm:col-span-2 text-slate-500 text-[9px]">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate" title={jobContactAddress}>{jobContactAddress}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Row ng detalye sa Footer (Deadline, Slots, at Official Notice Button) */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-bold inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Deadline: {job.deadline}
                  </span>
                  <span className="text-[10px] text-[#7c191e] font-extrabold uppercase">
                    • {job.slots} {job.slots <= 1 ? 'Slot' : 'Slots'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedNoticeJob(job)}
                  className="px-3 py-1.5 bg-[#7c191e] hover:bg-[#5c1317] text-white text-[10px] font-bold rounded-lg transition inline-flex items-center gap-1.5 shadow-xs cursor-pointer uppercase tracking-wider"
                  title="View Official Hiring Notice Flyer"
                >
                  <Eye className="w-3.5 h-3.5" /> Official Notice
                </button>
              </div>

            </div>
          );
        })}

        {filteredJobs.length === 0 && (
          <div className="md:col-span-2 text-center py-12 text-slate-400 text-xs font-semibold bg-white rounded-xl border border-slate-100">
            No vacancy postings currently match your selected search query and location coordinates filters.
          </div>
        )}
      </div>

      
      {/* MODAL FORM PARA SA PAGLIKHA NG BAGONG JOB POSTING          */}
      {isPosting && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in font-sans">
          
          <div className="bg-white w-full max-w-lg max-h-[92vh] h-[620px] shadow-2xl rounded-2xl overflow-hidden flex flex-col border border-slate-100 relative">
            
            {/* FIXED HEADER - Nakapako sa itaas na Header ng modal */}
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#1e4620]" />
                <h3 className="text-sm font-extrabold text-[#1e4620] uppercase tracking-wide">
                  {isEditing ? 'Edit Vacancy Alert' : 'Publish Vacancy Alerts'}
                </h3>
              </div>
              <button 
                onClick={() => {
                  setIsPosting(false);
                  setIsEditing(false);
                }}
                className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg transition"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SCROLLABLE FORM BODY - Katawan ng form na pwedeng i-scroll */}
            <form onSubmit={handlePostSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs font-semibold">
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-500 mb-1">Vacancy Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Associate Information Specialist"
                    value={newJob.jobTitle}
                    onChange={(e) => setNewJob({ ...newJob, jobTitle: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 focus:ring-1 focus:ring-[#1e4620]"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Hiring Institution / Employer</label>
                  {activeUser.role === 'Employer' ? (
                    <input
                      type="text"
                      disabled
                      value={loggedInEmpName}
                      className="w-full bg-slate-100 border border-slate-200 rounded-md p-2 shrink-0 cursor-not-allowed"
                    />
                  ) : (
                    <select
                      value={newJob.employerName}
                      onChange={(e) => setNewJob({ ...newJob, employerName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md p-2"
                    >
                      {employers.map(e => (
                        <option key={e.id} value={e.companyName}>{e.companyName}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Job Description &amp; Responsibilities *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Briefly state target work criteria and typical daily tasks expected..."
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 font-medium focus:ring-1 focus:ring-[#1e4620]"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Required Competencies (Split multiple values by comma) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., HTML, React, Customer Service, TESDA Cert"
                    value={reqInput}
                    onChange={(e) => setReqInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 focus:ring-1 focus:ring-[#1e4620]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-500">Required Application Documents (Split values by comma)</label>
                    <span className="text-[9.5px] text-slate-400 font-normal">e.g., Resume, TOR, Cover Letter</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g., Updated Resume / CV, Transcript of Records (TOR), Cover Letter"
                    value={appReqInput}
                    onChange={(e) => setAppReqInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 focus:ring-1 focus:ring-[#1e4620]"
                  />
                  {/* Quick Add Presets */}
                  <div className="mt-1.5 flex flex-wrap gap-1 items-center">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mr-1">Quick Add:</span>
                    {['Updated Resume / CV', 'Transcript of Records (TOR)', 'Cover Letter', 'Portfolio / GitHub Link', 'Certificate of Employment', 'Valid ID'].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          const current = appReqInput.split(',').map(s => s.trim()).filter(Boolean);
                          if (!current.includes(preset)) {
                            setAppReqInput(current.length > 0 ? `${appReqInput}, ${preset}` : preset);
                          }
                        }}
                        className="px-1.5 py-0.5 bg-slate-100 hover:bg-[#7c191e] hover:text-white text-slate-600 rounded text-[9px] font-semibold transition cursor-pointer"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1">Place of Assignment / Division</label>
                    <input
                      type="text"
                      placeholder="e.g., Provincial Engineering Office"
                      value={newJob.placeOfAssignment}
                      onChange={(e) => setNewJob({ ...newJob, placeOfAssignment: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 focus:ring-1 focus:ring-[#1e4620]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Salary Grade (SG)</label>
                    <input
                      type="text"
                      placeholder="e.g., 05 or 11"
                      value={newJob.salaryGrade}
                      onChange={(e) => setNewJob({ ...newJob, salaryGrade: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 focus:ring-1 focus:ring-[#1e4620]"
                    />
                  </div>
                </div>

                {/* Qualification Standards Grid in Form */}
                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 space-y-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 block">
                    Qualification Standards (Civil Service / Hiring Criteria)
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 text-[10px] mb-1">Education</label>
                      <input
                        type="text"
                        placeholder="e.g., Elementary School Graduate or BSIT"
                        value={newJob.education}
                        onChange={(e) => setNewJob({ ...newJob, education: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 text-[10px] mb-1">Eligibility</label>
                      <input
                        type="text"
                        placeholder="e.g., None Required or CS Sub-Professional"
                        value={newJob.eligibility}
                        onChange={(e) => setNewJob({ ...newJob, eligibility: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 text-[10px] mb-1">Training</label>
                      <input
                        type="text"
                        placeholder="e.g., None Required or 8 hours training"
                        value={newJob.training}
                        onChange={(e) => setNewJob({ ...newJob, training: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 text-[10px] mb-1">Work Experience</label>
                      <input
                        type="text"
                        placeholder="e.g., None Required or 1 year experience"
                        value={newJob.workExperience}
                        onChange={(e) => setNewJob({ ...newJob, workExperience: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1">Employment Type</label>
                    <select
                      value={newJob.employmentType}
                      onChange={(e) => setNewJob({ ...newJob, employmentType: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md p-2"
                    >
                      <option value="Regular/Permanent">Permanent / Regular</option>
                      <option value="Contractual">Contractual</option>
                      <option value="Project-Based">Project-Based</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Intern">Intern</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Geographic Location</label>
                    <input
                      type="text"
                      value={newJob.location}
                      onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md p-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-500 mb-1">Salary Range Bracket / PHP</label>
                    <input
                      type="text"
                      placeholder="e.g., P 18,000 - P 25,000"
                      value={newJob.salaryRange}
                      onChange={(e) => setNewJob({ ...newJob, salaryRange: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Slots Available</label>
                    <input
                      type="number"
                      value={newJob.slots}
                      onChange={(e) => setNewJob({ ...newJob, slots: parseInt(e.target.value) || 1 })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md p-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Deadline of Submission *</label>
                  <input
                    type="date"
                    required
                    value={newJob.deadline}
                    onChange={(e) => setNewJob({ ...newJob, deadline: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 focus:ring-1 focus:ring-[#1e4620]"
                  />
                </div>

                {isEditing && (
                  <div>
                    <label className="block text-slate-500 mb-1">Vacancy Status</label>
                    <select
                      value={newJob.status}
                      onChange={(e) => setNewJob({ ...newJob, status: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md p-2"
                    >
                      <option value="Open">Open</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-4 mt-4 space-y-4">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider text-slate-600">
                    Custom Contact &amp; Application Details (Optional)
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 mb-1">Contact Person Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Jane Doe"
                        value={newJob.contactPerson}
                        onChange={(e) => setNewJob({ ...newJob, contactPerson: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 focus:ring-1 focus:ring-[#1e4620]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-550 mb-1">Contact Email Address</label>
                      <input
                        type="email"
                        placeholder="e.g., hr@company.com"
                        value={newJob.contactEmail}
                        onChange={(e) => setNewJob({ ...newJob, contactEmail: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 focus:ring-1 focus:ring-[#1e4620]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 mb-1">Contact Phone</label>
                      <input
                        type="text"
                        placeholder="e.g., 0912345678"
                        value={newJob.contactPhone}
                        onChange={(e) => setNewJob({ ...newJob, contactPhone: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 focus:ring-1 focus:ring-[#1e4620]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1">Company Website</label>
                      <input
                        type="text"
                        placeholder="e.g., www.company.com"
                        value={newJob.contactWebsite}
                        onChange={(e) => setNewJob({ ...newJob, contactWebsite: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 focus:ring-1 focus:ring-[#1e4620]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">Physical Office / Submission Address</label>
                    <input
                      type="text"
                      placeholder="e.g., 2nd Floor, Capitol Complex, Basco, Batanes"
                      value={newJob.contactAddress}
                      onChange={(e) => setNewJob({ ...newJob, contactAddress: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 focus:ring-1 focus:ring-[#1e4620]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">How To Apply Instructions (Optional)</label>
                    <textarea
                      rows={2}
                      placeholder="e.g., Interested and qualified applicants should signify their interest in writing through an application letter addressed to..."
                      value={newJob.howToApply}
                      onChange={(e) => setNewJob({ ...newJob, howToApply: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 focus:ring-1 focus:ring-[#1e4620]"
                    />
                  </div>
                </div>
              </div>
            </form>

            {/* FIXED FOOTER - Nakapako sa ibaba na Footer ng modal */}
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-2 z-10 w-full animate-fade-in">
              <button
                type="button"
                onClick={() => {
                  setIsPosting(false);
                  setIsEditing(false);
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePostSubmit}
                className="px-4 py-2 bg-[#1e4620] hover:bg-emerald-950 text-white font-bold rounded-lg transition"
              >
                {isEditing ? 'Update Vacancy Bullet' : 'Deploy Vacancy Bullet'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL PARA SA OFFICIAL HIRING NOTICE (BATANES / PROVINCIAL HIRING FLYER FORMAT) */}
      {selectedNoticeJob && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto animate-fade-in font-sans">
          <div className="bg-[#fbfbf9] text-slate-800 w-full max-w-2xl max-h-[94vh] shadow-2xl rounded-2xl overflow-y-auto border-2 border-amber-900/20 relative flex flex-col">
            
            {/* Top Action Bar (Close & Print) */}
            <div className="sticky top-0 bg-[#fbfbf9]/95 backdrop-blur-xs border-b border-amber-900/10 px-4 py-2.5 flex items-center justify-between z-20">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7c191e] animate-pulse" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7c191e]">
                  Official Vacancy Announcement • Batanes Province
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                  title="Print Notice"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedNoticeJob(null)}
                  className="p-1 hover:bg-slate-200 text-slate-600 rounded-md transition cursor-pointer"
                  title="Close Notice"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Flyer Body */}
            <div className="p-4 sm:p-6 space-y-4">

              {/* 1. Header with Seals & Office Labels */}
              <div className="flex items-center justify-between border-b border-amber-900/15 pb-3">
                <div className="flex items-center gap-3">
                  {/* Batanes Seal Emulation */}
                  <div className="w-14 h-14 rounded-full bg-linear-to-tr from-[#7c191e] via-[#941c22] to-[#cca43b] p-0.5 shadow-md shrink-0 flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center p-1 text-center border border-amber-200">
                      <span className="text-[6.5px] font-black uppercase text-[#7c191e] tracking-tighter leading-none">Lalawigan</span>
                      <span className="text-[7.5px] font-black uppercase text-[#cca43b] tracking-tighter leading-none">Batanes</span>
                      <span className="text-[6px] font-extrabold text-slate-500 uppercase leading-none">1783</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold text-[#7c191e] uppercase tracking-wider block">
                      Provincial Government of
                    </span>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight leading-none">
                      {selectedNoticeJob.employerName || 'BATANES'}
                    </h2>
                    <p className="text-[10px] font-bold text-slate-600 mt-0.5">
                      Human Resources Management &amp; Development Office
                    </p>
                    <p className="text-[8.5px] font-semibold text-slate-400 tracking-wider">
                      People • Capability • Service
                    </p>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <span className="italic font-serif text-sm text-[#7c191e] font-bold block leading-tight">
                    Serve Batanes,
                  </span>
                  <span className="italic font-serif text-sm text-slate-700 font-bold block leading-tight">
                    Build Lives
                  </span>
                </div>
              </div>

              {/* 2. Hiring Headline Banner */}
              <div className="text-center py-2 bg-linear-to-r from-amber-50 via-rose-50 to-amber-50 rounded-xl border border-amber-200/50">
                <h1 className="text-2xl sm:text-3xl font-black text-[#7c191e] uppercase tracking-tight leading-none drop-shadow-2xs">
                  WE ARE HIRING!
                </h1>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="bg-[#cca43b] text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow-xs">
                    JOIN OUR TEAM
                  </span>
                  <span className="text-[10px] text-slate-600 font-semibold italic">
                    Be part of a service-driven team for a progressive Batanes!
                  </span>
                </div>
              </div>

              {/* 3. Position Title & Vacancy Banner */}
              <div className="bg-[#7c191e] text-white rounded-xl p-3 sm:p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0 border border-white/20">
                    <HardHat className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black uppercase tracking-wide leading-tight text-white">
                      {selectedNoticeJob.jobTitle}
                    </h3>
                    <p className="text-[10px] text-amber-200/90 font-medium">
                      {selectedNoticeJob.description}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0 border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0">
                  <span className="bg-[#cca43b] text-slate-950 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-md shadow-xs">
                    {selectedNoticeJob.slots || 1} {selectedNoticeJob.slots <= 1 ? 'VACANCY' : 'VACANCIES'}
                  </span>
                  {selectedNoticeJob.placeOfAssignment && (
                    <span className="text-[9.5px] text-white/90 font-semibold flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-300 shrink-0" />
                      {selectedNoticeJob.placeOfAssignment}
                    </span>
                  )}
                </div>
              </div>

              {/* 4. Qualification Standards Grid (QS) */}
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                  Qualification Standards &amp; Position Overview:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  
                  {/* Place of Assignment */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-900 text-white flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-extrabold uppercase text-slate-400 block">Place of Assignment</span>
                      <span className="text-[11px] font-bold text-slate-800 truncate block" title={selectedNoticeJob.placeOfAssignment || selectedNoticeJob.location}>
                        {selectedNoticeJob.placeOfAssignment || selectedNoticeJob.location}
                      </span>
                    </div>
                  </div>

                  {/* Salary Grade */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-900 text-white flex items-center justify-center shrink-0">
                      <Coins className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-extrabold uppercase text-slate-400 block">Salary Grade</span>
                      <span className="text-[11px] font-bold text-slate-800 block">
                        {selectedNoticeJob.salaryGrade ? (selectedNoticeJob.salaryGrade.startsWith('SG') ? selectedNoticeJob.salaryGrade : `Grade ${selectedNoticeJob.salaryGrade}`) : '05'}
                      </span>
                    </div>
                  </div>

                  {/* Monthly Salary */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-900 text-white flex items-center justify-center shrink-0">
                      <span className="font-extrabold text-xs">₱</span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-extrabold uppercase text-slate-400 block">Monthly Salary</span>
                      <span className="text-[11px] font-black text-[#7c191e] block truncate">
                        {selectedNoticeJob.salaryRange}
                      </span>
                    </div>
                  </div>

                  {/* Eligibility */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-900 text-white flex items-center justify-center shrink-0">
                      <Award className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-extrabold uppercase text-slate-400 block">Eligibility</span>
                      <span className="text-[10.5px] font-bold text-slate-800 leading-tight block">
                        {selectedNoticeJob.eligibility || 'None Required (MC 10, s. 2013, Cat. III)'}
                      </span>
                    </div>
                  </div>

                  {/* Education */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-900 text-white flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-extrabold uppercase text-slate-400 block">Education</span>
                      <span className="text-[10.5px] font-bold text-slate-800 leading-tight block">
                        {selectedNoticeJob.education || 'Elementary School Graduate'}
                      </span>
                    </div>
                  </div>

                  {/* Training */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-900 text-white flex items-center justify-center shrink-0">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-extrabold uppercase text-slate-400 block">Training</span>
                      <span className="text-[10.5px] font-bold text-slate-800 leading-tight block">
                        {selectedNoticeJob.training || 'None Required'}
                      </span>
                    </div>
                  </div>

                  {/* Work Experience */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-2.5 sm:col-span-2 md:col-span-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-900 text-white flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-extrabold uppercase text-slate-400 block">Work Experience</span>
                      <span className="text-[10.5px] font-bold text-slate-800 leading-tight block">
                        {selectedNoticeJob.workExperience || 'None Required'}
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* 5. Two Columns: HOW TO APPLY and ATTACH THE FOLLOWING DOCUMENTS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Column 1: HOW TO APPLY */}
                <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="bg-[#7c191e] text-white px-3 py-2 flex items-center gap-1.5 font-extrabold text-xs uppercase tracking-wider">
                      <FileText className="w-4 h-4" />
                      HOW TO APPLY
                    </div>
                    <div className="p-3.5 space-y-3 text-[11px] text-slate-700 leading-relaxed font-medium">
                      <p>
                        {selectedNoticeJob.howToApply || 'Interested and qualified applicants should signify their interest in writing through an application letter addressed to the Governor and hand them in or send them through courier or email to the HR Office through:'}
                      </p>
                      
                      <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 space-y-1.5 text-[10.5px]">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#7c191e] shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-slate-900 block font-bold">
                              {selectedNoticeJob.contactPerson || 'ANA MARIE A. ROSAS'}
                            </strong>
                            <span className="text-slate-500 text-[10px] block font-semibold">
                              {selectedNoticeJob.contactPosition || 'PHRMO'}
                            </span>
                            <span className="text-slate-600 block text-[10px]">
                              {selectedNoticeJob.contactAddress || '2nd Floor, Capitol Complex Basco, Batanes'}
                            </span>
                          </div>
                        </div>

                        {selectedNoticeJob.contactEmail && (
                          <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/60">
                            <Mail className="w-3.5 h-3.5 text-[#7c191e] shrink-0" />
                            <span className="font-semibold text-slate-700">e-mail:</span>
                            <a href={`mailto:${selectedNoticeJob.contactEmail}`} className="text-[#7c191e] font-bold hover:underline">
                              {selectedNoticeJob.contactEmail}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Deadline Box */}
                  <div className="bg-[#7c191e] text-white p-3 m-3 rounded-lg flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-amber-300" />
                      <div>
                        <span className="text-[8.5px] uppercase font-bold text-white/80 block">Deadline of Application</span>
                        <span className="text-xs font-black uppercase text-amber-200">
                          {selectedNoticeJob.deadline}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: ATTACH THE FOLLOWING DOCUMENTS */}
                <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="bg-teal-950 text-white px-3 py-2 flex items-center gap-1.5 font-extrabold text-xs uppercase tracking-wider">
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      ATTACH THE FOLLOWING DOCUMENTS:
                    </div>
                    <div className="p-3.5 space-y-2 text-[10.5px]">
                      {(() => {
                        const appReqs = (selectedNoticeJob.applicationRequirements && selectedNoticeJob.applicationRequirements.length > 0)
                          ? selectedNoticeJob.applicationRequirements
                          : [
                              'Fully accomplished Personal Data Sheet (PDS) with Work Experience Sheet and recent passport-sized or unfiltered digital picture (CS Form No. 212, Revised 2025); digitally signed or electronically signed;',
                              'Hard copy or electronic copy of Performance Rating in the last rating period (if applicable);',
                              'Hard copy or electronic copy of proof of eligibility / rating / license (if applicable);',
                              'Hard copy or electronic copy of Transcript of Records.'
                            ];

                        return (
                          <ol className="space-y-2">
                            {appReqs.map((req, i) => (
                              <li key={i} className="flex items-start gap-2 text-slate-700 leading-snug">
                                <span className="w-5 h-5 rounded-full bg-teal-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                  {i + 1}
                                </span>
                                <span className="font-medium">{req}</span>
                              </li>
                            ))}
                          </ol>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Warning Notice Banner */}
                  <div className="p-3 bg-rose-50 border-t border-rose-200 flex items-center gap-2.5 text-rose-900">
                    <div className="w-8 h-8 rounded-full bg-[#7c191e] text-white flex items-center justify-center font-black text-base shrink-0">
                      !
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tight text-[#7c191e] leading-tight">
                      APPLICATIONS WITH INCOMPLETE DOCUMENTS SHALL NOT BE ENTERTAINED.
                    </span>
                  </div>
                </div>

              </div>

              {/* 6. EQUAL OPPORTUNITY PRINCIPLE (EOP) Banner */}
              <div className="bg-white rounded-xl p-3 border border-slate-200 text-center space-y-1 shadow-2xs">
                <span className="inline-block bg-emerald-800 text-white font-extrabold text-[9px] uppercase px-3 py-0.5 rounded-full tracking-wider">
                  EQUAL OPPORTUNITY PRINCIPLE (EOP)
                </span>
                <p className="text-[9.5px] text-slate-500 leading-relaxed font-medium max-w-xl mx-auto">
                  This Office does not discriminate in the selection of employees based on sexual orientation and gender identity or expression, religion, civil status, and political affiliation. Persons with disabilities and members of indigenous communities are also encouraged to apply.
                </p>
              </div>

            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-[#fbfbf9] border-t border-amber-900/10 px-4 py-3 flex items-center justify-end z-20">
              <button
                type="button"
                onClick={() => setSelectedNoticeJob(null)}
                className="px-4 py-1.5 bg-[#7c191e] hover:bg-[#5c1317] text-white font-bold text-xs rounded-lg transition cursor-pointer"
              >
                Close Notice
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
