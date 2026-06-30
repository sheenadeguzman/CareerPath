import React, { useState } from 'react';
import { Briefcase, Calendar, MapPin, Tag, PlusCircle, Check, Users, ShieldAlert, X, Mail, Phone, Globe, User } from 'lucide-react';

export default function JobPostingsView({ jobPostings = [], employers = [], activeUser, onSaveJob }) {
  const [isPosting, setIsPosting] = useState(false);
  const [successToast, setSuccessToast] = useState('');

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
    employmentType: 'Regular/Permanent',
    salaryRange: 'P 18,000 - P 25,000',
    location: 'Basco, Batanes',
    slots: 1,
    deadline: '',
    status: 'Open'
  });

  const [reqInput, setReqInput] = useState('');

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
      alert('Must populate job title and deadline coordinates.');
      return;
    }

    const separatedReqs = reqInput.split(',').map(r => r.trim()).filter(r => r.length > 0);

    const submission = {
      ...newJob,
      employerName: activeUser.role === 'Employer' ? activeUser.name : newJob.employerName,
      id: `job-${Date.now()}`,
      requirements: separatedReqs.length > 0 ? separatedReqs : ['None specified'],
      status: 'Open'
    };

    await onSaveJob(submission);
    setIsPosting(false);
    setSuccessToast(`SUCCESS! Job Bulletin for '${newJob.jobTitle}' has been verified & deployed!`);
    setTimeout(() => setSuccessToast(''), 4000);

    // I-reset ang Form
    setNewJob({
      id: '',
      jobTitle: '',
      employerName: employers[0]?.companyName || '',
      description: '',
      requirements: [],
      employmentType: 'Regular/Permanent',
      salaryRange: 'P 18,000 - P 25,000',
      location: 'Basco, Batanes',
      slots: 1,
      deadline: '',
      status: 'Open'
    });
    setReqInput('');
  };  const filteredJobs = jobPostings.filter(job => {
    const text = (job.jobTitle + ' ' + job.employerName + ' ' + job.location + ' ' + job.description).toLowerCase();
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

          return (
            <div key={job.id} className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 flex flex-col justify-between relative overflow-hidden animate-fade-in">
              
              {/* Tag ng Status sa itaas na sulok */}
              <div className="absolute top-0 right-0">
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
                  <span className="block font-bold text-[11px] text-[#7c191e] uppercase">{job.employerName}</span>
                </div>

                {/* Strip para sa mga istatistika (Location, Type, Salary) */}
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
                  <div className="flex items-center gap-1 text-emerald-750 font-black min-w-[95px]">
                    <span className="shrink-0 font-bold text-[#7c191e]">PHP</span>
                    <span className="truncate text-[#7c191e] font-extrabold">{job.salaryRange}</span>
                  </div>
                </div>

                {/* Paglalarawan ng Trabaho (Description) */}
                <div className="text-xs text-slate-605 font-medium leading-relaxed">
                  <p className="line-clamp-2">{job.description}</p>
                </div>

                {/* Requirements tags and chips */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Basic Competency Requirements:</span>
                  <div className="flex flex-wrap gap-1">
                    {job.requirements.map(req => (
                      <span key={req} className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200/50 rounded text-[9px] font-bold">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Employer Contact Details */}
                {matchingEmployer && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 bg-slate-50/50 rounded-lg p-2.5 border border-slate-150">
                    <span className="text-[9px] text-slate-450 font-extrabold uppercase tracking-wider block">Employer Contact &amp; Application Info:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] font-semibold text-slate-600">
                      <div className="flex items-center gap-1.5 truncate">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate" title={`${matchingEmployer.contactPerson} (${matchingEmployer.position})`}>
                          {matchingEmployer.contactPerson} <span className="text-[9px] text-slate-400 font-normal">({matchingEmployer.position})</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <a href={`mailto:${matchingEmployer.email}`} className="text-[#7c191e] hover:underline truncate font-bold" title={matchingEmployer.email}>
                          {matchingEmployer.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <a href={`tel:${matchingEmployer.phone}`} className="text-slate-600 hover:underline truncate" title={matchingEmployer.phone}>
                          {matchingEmployer.phone}
                        </a>
                      </div>
                      {matchingEmployer.website && (
                        <div className="flex items-center gap-1.5 truncate">
                          <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <a 
                            href={matchingEmployer.website.startsWith('http') ? matchingEmployer.website : `https://${matchingEmployer.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-[#cca43b] hover:underline truncate font-bold"
                            title={matchingEmployer.website}
                          >
                            {matchingEmployer.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Row ng detalye sa Footer (Deadline at Slots) */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 font-bold inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Deadline: {job.deadline}
                </span>
                {/* NOTE: Ginawa nating <= 1 para maging singular din ang 0 slots alinsunod sa bagong requirement ng user. */}
                <span className="text-[10px] text-[#7c191e] font-extrabold uppercase">
                  {job.slots} {job.slots <= 1 ? 'Slot' : 'Slots'} Vacant
                </span>
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

      {/* ========================================================== */}
      {/* MODAL FORM PARA SA PAGLIKHA NG BAGONG JOB POSTING          */}
      {/* ========================================================== */}
      {isPosting && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in font-sans">
          
          <div className="bg-white w-full max-w-lg h-[540px] shadow-2xl rounded-2xl overflow-hidden flex flex-col border border-slate-100 relative">
            
            {/* FIXED HEADER - Nakapako sa itaas na Header ng modal */}
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#1e4620]" />
                <h3 className="text-sm font-extrabold text-[#1e4620] uppercase tracking-wide">Publish Vacancy Alerts</h3>
              </div>
              <button 
                onClick={() => setIsPosting(false)}
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
                      value={activeUser.name}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1">Employment Type</label>
                    <select
                      value={newJob.employmentType}
                      onChange={(e) => setNewJob({ ...newJob, employmentType: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md p-2"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
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
                  <label className="block text-slate-500 mb-1">Deadline Date Coordinates *</label>
                  <input
                    type="date"
                    required
                    value={newJob.deadline}
                    onChange={(e) => setNewJob({ ...newJob, deadline: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 focus:ring-1 focus:ring-[#1e4620]"
                  />
                </div>
              </div>
            </form>

            {/* FIXED FOOTER - Nakapako sa ibaba na Footer ng modal */}
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-2 z-10 w-full animate-fade-in">
              <button
                type="button"
                onClick={() => setIsPosting(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePostSubmit}
                className="px-4 py-2 bg-[#1e4620] hover:bg-emerald-950 text-white font-bold rounded-lg transition"
              >
                Deploy Vacancy Bullet
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
