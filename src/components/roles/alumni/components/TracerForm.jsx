/**
 * @file TracerForm.jsx
 * @description Sub-component na nagpapakita ng Graduate Tracer Intake Sheet form.
 * Dito input ng alumni ang kanilang demographic variables, academic variables,
 * CHED employment metrics, career history timeline, at core skills.
 */

import React from 'react';
import { 
  GraduationCap, 
  Briefcase, 
  Building, 
  Check, 
  X 
} from 'lucide-react';
import { BSC_PROGRAMS } from '../../../../bscData';

export default function TracerForm({
  selfEditForm,                 // State object na naglalaman ng mga pansamantalang field ng profile form
  setSelfEditForm,             // Handler para baguhin ang data sa state ng parent component
  selectedBaseProg,            // Kasalukuyang napiling base program (e.g. BSIT)
  setSelectedBaseProg,         // Kumokontrol sa base program state ng parent
  selectedMajor,               // Kasalukuyang napiling major (e.g. Web Development)
  setSelectedMajor,            // Kumokontrol sa major state ng parent
  newSkillToken,               // Pansamantalang input para sa bagong core skill
  setNewSkillToken,            // Handler para sa text input ng newSkillToken
  customUsefulSkill,           // Pansamantalang input para sa custom useful skill
  setCustomUsefulSkill,        // Handler para sa text input ng customUsefulSkill
  addSkillToken,               // Function para idagdag ang skill tag
  removeSkillToken,            // Function para alisin ang skill tag
  addCustomUsefulSkillDirectly,// Function para direktang idagdag ang custom useful skill
  removeUsefulSkill,           // Function para tanggalin ang useful skill
  handleSelfFormSubmit,        // Function na tatawagin kapag nag-submit ang form
  calculateAge                 // Helper function para kalkulahin ang edad base sa DOB
}) {

  /**
   * Pagbabago ng base course (e.g. BSIT).
   * Pinagsasama ang base program name at ang major sa iisang text field (`program`) para i-save sa database.
   * 
   * @param {string} val - Ang napiling base program mula sa select element.
   */
  const handleBaseProgChange = (val) => {
    setSelectedBaseProg(val);
    const finalProg = selectedMajor.trim() ? `${val} Major in ${selectedMajor.trim()}` : val;
    setSelfEditForm(prev => ({ ...prev, program: finalProg }));
  };

  /**
   * Pagbabago ng major (e.g. Web Development).
   * Pinagsasama rin ang napiling base program at bagong major string para sa `program` field.
   * 
   * @param {string} val - Ang isinulat na major.
   */
  const handleMajorChange = (val) => {
    setSelectedMajor(val);
    const finalProg = val.trim() ? `${selectedBaseProg} Major in ${val.trim()}` : selectedBaseProg;
    setSelfEditForm(prev => ({ ...prev, program: finalProg }));
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-100 animate-fade-in no-print-resume flex flex-col max-h-[72vh] overflow-hidden">
      
      {/* Header Section: Nagpapakita ng pamagat ng sheet at ang kasalukuyang Profile Completeness Rate */}
      <div className="p-6 pb-4 border-b border-slate-100 flex justify-between items-center shrink-0 bg-white rounded-t-xl">
        <div>
          <h2 className="text-sm font-extrabold text-[#7c191e] uppercase tracking-wider">Graduate Tracer intake sheet</h2>
          <span className="block text-[10px] text-slate-455 mt-0.5">Fill out demographic variables for quality audits</span>
        </div>
        <div className="text-right">
          <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Profile Completeness</span>
          <span className="text-xs font-extrabold text-[#cca43b]">{selfEditForm.profileCompleteness}% Verified</span>
        </div>
      </div>

      {/* Main Scrollable Form Area */}
      <form onSubmit={handleSelfFormSubmit} className="flex-1 overflow-y-auto px-6 pt-6 pb-0 space-y-6 text-xs font-semibold text-slate-655">
        
        {/* Profile Picture Upload Section: Dito pwedeng pumili ng file o mag-paste ng URL */}
        <div className="bg-slate-55 p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative shrink-0">
            {selfEditForm.avatar ? (
              <img
                src={selfEditForm.avatar}
                alt="Profile Avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-[#7c191e] shadow-md animate-fade-in"
              />
            ) : (
              // Default avatar placeholder (Initial ng First Name)
              <div className="w-20 h-20 bg-[#7c191e]/10 rounded-full flex items-center justify-center border-2 border-dashed border-[#7c191e]/30 text-2xl font-bold text-[#7c191e] uppercase select-none">
                {selfEditForm.firstName ? selfEditForm.firstName.charAt(0) : 'A'}
              </div>
            )}
            {/* Button para tanggalin ang kasalukuyang larawan */}
            {selfEditForm.avatar && (
              <button
                type="button"
                onClick={() => setSelfEditForm({ ...selfEditForm, avatar: '' })}
                className="absolute -top-1 -right-1 bg-red-650 hover:bg-red-700 text-white rounded-full p-1 shadow-md transition cursor-pointer"
                title="Remove Photo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="space-y-1.5 text-center sm:text-left flex-1">
            <span className="block text-xs font-bold text-slate-800">Profile Photo</span>
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
              Upload an image file (PNG, JPG, max 500KB) to display as your portal avatar. It will be converted and stored securely.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              {/* File Input: Nililimitahan sa images at may check na 500KB size limit */}
              <label className="inline-flex items-center justify-center px-3 py-1.5 bg-[#7c191e] hover:bg-[#5b1216] text-white text-[10px] font-extrabold uppercase rounded-lg cursor-pointer transition select-none shadow-3xs">
                Choose Image File
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 500 * 1024) {
                        alert('Image is too large! Please upload a file smaller than 500KB.');
                        return;
                      }
                      // Gamit ang FileReader para i-convert ang local image file sa Base64 string data URL
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setSelfEditForm({ ...selfEditForm, avatar: event.target.result });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
              {/* Pwede ring gumamit ng direct image URL kung mayroon nang hosted image */}
              <input
                type="text"
                placeholder="Or paste direct image URL..."
                value={selfEditForm.avatar || ''}
                onChange={(e) => setSelfEditForm({ ...selfEditForm, avatar: e.target.value })}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-slate-700 focus:outline-none focus:border-[#7c191e] flex-1 max-w-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Seksyon 1: Mga Impormasyong Personal at Pang-akademiko (Demographic & Academic) */}
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold text-[#7c191e] uppercase tracking-wider flex items-center gap-1">
            <GraduationCap className="w-4 h-4 text-[#7c191e]" /> 1. Demographic &amp; Academic variables
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Student ID - Protektado at hindi maaaring baguhin ng user (Read-only) */}
            <div>
              <label className="block text-slate-400 mb-1">Student ID (Read-only)</label>
              <input
                type="text"
                disabled
                value={selfEditForm.studentId}
                className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-bold text-slate-500 cursor-not-allowed select-none"
              />
            </div>
            {/* Pangalan at mga Extensyon ng Pangalan */}
            <div>
              <label className="block text-slate-400 mb-1">First Name</label>
              <input
                type="text"
                required
                value={selfEditForm.firstName || ''}
                onChange={(e) => setSelfEditForm({ ...selfEditForm, firstName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-[#7c191e]"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Middle Name</label>
              <input
                type="text"
                value={selfEditForm.middleName || ''}
                onChange={(e) => setSelfEditForm({ ...selfEditForm, middleName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-[#7c191e]"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Last Name</label>
              <input
                type="text"
                required
                value={selfEditForm.lastName || ''}
                onChange={(e) => setSelfEditForm({ ...selfEditForm, lastName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-[#7c191e]"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Suffix (e.g. Jr., III)</label>
              <input
                type="text"
                value={selfEditForm.suffix || ''}
                onChange={(e) => setSelfEditForm({ ...selfEditForm, suffix: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-[#7c191e]"
              />
            </div>
            {/* Kursong Tinapos (Degree Program at Major) */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">Degree Program Completed</label>
                <select
                  value={selectedBaseProg}
                  onChange={(e) => handleBaseProgChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-sans cursor-pointer focus:outline-none"
                >
                  {BSC_PROGRAMS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Major / Specialization (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Science, Mathematics, Automotive"
                  value={selectedMajor}
                  onChange={(e) => handleMajorChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-[#7c191e]"
                />
              </div>
            </div>
            {/* Taon ng Pag-enroll at Pag-graduate */}
            <div>
              <label className="block text-slate-400 mb-1">Year Enrolled / Started</label>
              <input
                type="number"
                placeholder="e.g. 2022"
                value={selfEditForm.yearEnrolled || ''}
                onChange={(e) => setSelfEditForm({ ...selfEditForm, yearEnrolled: parseInt(e.target.value) || null })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-[#7c191e]"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Year Graduated</label>
              <input
                type="number"
                value={selfEditForm.yearGraduated}
                onChange={(e) => setSelfEditForm({ ...selfEditForm, yearGraduated: parseInt(e.target.value) || 2026 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-[#7c191e]"
              />
            </div>
            {/* Mga Contact details at kapanganakan */}
            <div>
              <label className="block text-slate-400 mb-1">Primary Email Address</label>
              <input
                type="email"
                required
                value={selfEditForm.email}
                onChange={(e) => setSelfEditForm({ ...selfEditForm, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-[#7c191e]"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Mobile Phone Coordinate</label>
              <input
                type="text"
                placeholder="e.g. 0917-123-4567"
                value={selfEditForm.phone}
                onChange={(e) => setSelfEditForm({ ...selfEditForm, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-[#7c191e]"
              />
            </div>
            {/* Input box para sa Birth Date Coordinate ng Alumnus */}
            <div>
              <label className="block text-slate-400 mb-1">Birth Date Coordinate</label>
              <input
                type="date"
                value={selfEditForm.dateOfBirth}
                onChange={(e) => setSelfEditForm({ ...selfEditForm, dateOfBirth: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 cursor-pointer focus:outline-none focus:border-[#7c191e]"
              />
            </div>
            {/* Textbox para sa Age na kusa o auto-calculated base sa dateOfBirth sa pamamagitan ng calculateAge function helper */}
            <div>
              <label className="block text-slate-400 mb-1">Age (Auto-calculated)</label>
              <input
                type="text"
                readOnly
                disabled
                value={calculateAge(selfEditForm.dateOfBirth)}
                className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-slate-700 font-bold select-none cursor-not-allowed focus:outline-none"
              />
            </div>
            {/* Kasarian at Civil Status */}
            <div>
              <label className="block text-slate-400 mb-1">Gender Identification</label>
              <select
                value={selfEditForm.gender}
                onChange={(e) => setSelfEditForm({ ...selfEditForm, gender: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 cursor-pointer focus:outline-none"
              >
                <option value="" className="text-slate-400 bg-white">Select Gender --</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Civil Status</label>
              <select
                value={selfEditForm.civilStatus}
                onChange={(e) => setSelfEditForm({ ...selfEditForm, civilStatus: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 cursor-pointer focus:outline-none"
              >
                <option value="" className="text-slate-400 bg-white">Select Status --</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Separated">Separated</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>
            {/* Karangalan */}
            <div>
              <label className="block text-slate-400 mb-1">Honors / Academic Distinction</label>
              <input
                type="text"
                placeholder="e.g. Cum Laude, None"
                value={selfEditForm.honors}
                onChange={(e) => setSelfEditForm({ ...selfEditForm, honors: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-[#7c191e]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-400 mb-1">Current Address</label>
            <input
              type="text"
              placeholder="Street, Barangay, Municipality, Province"
              value={selfEditForm.address}
              onChange={(e) => setSelfEditForm({ ...selfEditForm, address: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-[#7c191e]"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Permanent Address</label>
            <input
              type="text"
              placeholder="Street, Barangay, Municipality, Province"
              value={selfEditForm.address}
              onChange={(e) => setSelfEditForm({ ...selfEditForm, address: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-[#7c191e]"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Professional License / Exams Passed</label>
            <input
              type="text"
              placeholder="e.g. LET (Licensure Exam for Teachers), Civil Service, TESDA NC II"
              value={selfEditForm.professionalExamPassed}
              onChange={(e) => setSelfEditForm({ ...selfEditForm, professionalExamPassed: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-[#7c191e]"
            />
          </div>
           </div>

          {/* Seksyon para sa Licensure Exam Details kung mayroon */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">Is Board Exam Passer?</label>
              <select
                value={selfEditForm.isBoardPasser || 'N/A'}
                onChange={(e) => setSelfEditForm({ ...selfEditForm, isBoardPasser: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 cursor-pointer focus:outline-none"
              >
                <option value="" className="text-slate-400 bg-white">Select--</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="N/A">N/A (Not Applicable)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Licensure Exam Passing Date</label>
              <input
                type="text"
                placeholder="e.g. November 2025"
                value={selfEditForm.licensureExamDate || ''}
                onChange={(e) => setSelfEditForm({ ...selfEditForm, licensureExamDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-[#7c191e]"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">License No. / PRC ID</label>
              <input
                type="text"
                placeholder="e.g. 1234567"
                value={selfEditForm.licenseNo || ''}
                onChange={(e) => setSelfEditForm({ ...selfEditForm, licenseNo: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-[#7c191e]"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Alumni Association membership at dahilan sa pagpili ng kurso */}
          <div>
            <label className="block text-slate-400 mb-1">Alumni Association Membership Status</label>
            <select
              value={selfEditForm.alumniAssociationStatus || 'Non-Member'}
              onChange={(e) => setSelfEditForm({ ...selfEditForm, alumniAssociationStatus: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 cursor-pointer focus:outline-none"
            >
              <option value="" className="text-slate-400 bg-white">Select Status--</option>
              <option value="Non-Member">Non-Member</option>
              <option value="Active Member">Active Member</option>
              <option value="Inactive Member">Inactive Member</option>
              <option value="Officer">Association Officer / Coordinator</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Reason for Pursuing this Degree Program</label>
            <select
              value={selfEditForm.reasonsPursuingProgram || ''}
              onChange={(e) => setSelfEditForm({ ...selfEditForm, reasonsPursuingProgram: e.target.value })}
              className={`w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 cursor-pointer focus:outline-none transition-colors ${
                !selfEditForm.reasonsPursuingProgram ? 'text-slate-400 font-normal' : 'text-slate-700 font-semibold'
              }`}
            >
              <option value="" className="text-slate-400 bg-white">Select Reason --</option>
              <option value="Personal Interest" className="text-slate-700 bg-white">Personal Interest</option>
              <option value="Influence of Parents / Relatives" className="text-slate-700 bg-white">Influence of Parents / Relatives</option>
              <option value="Influence of Peers / Friends" className="text-slate-700 bg-white">Influence of Peers / Friends</option>
              <option value="High Employment Prospects / Demand" className="text-slate-700 bg-white">High Employment Prospects / Demand</option>
              <option value="No other choice" className="text-slate-700 bg-white">No other choice (course of least resistance)</option>
              <option value="Others" className="text-slate-700 bg-white">Others</option>
            </select>
          </div>
        </div>
        </div>

        <hr className="border-slate-100" />

        {/* Seksyon 2: Employment Metrics na nakabatay sa standard parameter ng CHED */}
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold text-[#7c191e] uppercase tracking-wider flex items-center gap-1">
            <Briefcase className="w-4 h-4 text-[#7c191e]" /> 2. Employment Tracer metrics (CHED parameters)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">Primary Employment Status</label>
              <select
                value={selfEditForm.employmentStatus}
                onChange={(e) => setSelfEditForm({ ...selfEditForm, employmentStatus: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 cursor-pointer focus:outline-none"
              >
                <option value="" className="text-slate-400 bg-white">Select Status--</option>
                <option value="Employed">Employed (Full-time)</option>
                <option value="Employed">Employed (Part-time)</option>
                <option value="Employed">Employed (Contractual)</option>
                <option value="Employed">Employed (Job Order)</option>
                <option value="Self-Employed">Self-Employed (Entrepreneur)</option>
                <option value="Freelance">Freelance</option>
                <option value="Further Studies">Further Studies (Grad school)</option>
                <option value="Retired">Retired</option>
                <option value="Disabled">Unable to work / Disabled</option>
                <option value="Unemployed">Unemployed (Looking for opportunities)</option>
              </select>
            </div>

            {/* Conditional Rendering: Ipakita lamang ang mga field ng trabaho kung HINDI unemployed ang user */}
            {selfEditForm.employmentStatus !== 'Unemployed' && (
              <>
                <div>
                  <label className="block text-slate-400 mb-1">Geographic Location Region</label>
                  <select
                    value={selfEditForm.locationRegion || 'Local (Batanes)'}
                    onChange={(e) => setSelfEditForm({ ...selfEditForm, locationRegion: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 cursor-pointer focus:outline-none font-semibold text-slate-700"
                  >
                    <option value="" className="text-slate-400 bg-white">Select Location --</option>
                    <option value="Local (Batanes)">Local (Batanes)</option>
                    <option value="National (Rest of PH)">National (Rest of PH)</option>
                    <option value="International">International</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Company / Firm Name</label>
                  <input
                    type="text"
                    placeholder="Company name"
                    value={selfEditForm.employerName}
                    onChange={(e) => setSelfEditForm({ ...selfEditForm, employerName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-[#7c191e]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Official Job Title</label>
                  <input
                    type="text"
                    placeholder="Job Title"
                    value={selfEditForm.jobTitle}
                    onChange={(e) => setSelfEditForm({ ...selfEditForm, jobTitle: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-[#7c191e]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Job Contract Type</label>
                  <select
                    value={selfEditForm.employmentType}
                    onChange={(e) => setSelfEditForm({ ...selfEditForm, employmentType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 cursor-pointer focus:outline-none"
                  >
                    <option value="" className="text-slate-400 bg-white">Select--</option>
                    <option value="Regular/Permanent">Regular / Permanent</option>
                    <option value="Temporary/Contractual">Temporary / Contractual</option>
                    <option value="Casual/Project-Based">Casual / Project-Based</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Probationary">Probationary</option>
                    <option value="Seasonal">Seasonal</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="Freelance/Gig">Freelance / Gig Economy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Company Sector</label>
                  <select
                    value={selfEditForm.sector}
                    onChange={(e) => setSelfEditForm({ ...selfEditForm, sector: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 cursor-pointer focus:outline-none"
                  >
                    <option value="" className="text-slate-400 bg-white">Select Sector--</option>
                    <option value="Private">Private Enterprise</option>
                    <option value="Public">Public / Government Agency</option>
                    <option value="NGO">NGO / Non-Profit Org</option>
                    <option value="N/A">N/A</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Monthly Salary Bracket (PHP)</label>
                  <select
                    value={selfEditForm.monthlyIncome}
                    onChange={(e) => setSelfEditForm({ ...selfEditForm, monthlyIncome: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 cursor-pointer focus:outline-none"
                  >
                    <option value="" className="text-slate-400 bg-white">Select--</option>
                    <option value="Under 10,000">Under 10,000</option>
                    <option value="10,000 - 20,000">10,000 - 20,000</option>
                    <option value="20,001 - 30,000">20,001 - 30,000</option>
                    <option value="30,001 - 40,000">30,001 - 40,000</option>
                    <option value="Above 40,000">Above 40,000</option>
                  </select>
                </div>
                {/* Linya at koneksyon ng trabaho sa natapos na kurso */}
                <div>
                  <label className="block text-slate-400 mb-1">Is job related to degree completed?</label>
                  <select
                    value={selfEditForm.jobRelatedToCourse}
                    onChange={(e) => setSelfEditForm({ ...selfEditForm, jobRelatedToCourse: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 cursor-pointer focus:outline-none"
                  >
                    <option value="" className="text-slate-400 bg-white">Select--</option>
                    <option value="Yes">Yes, directly aligned</option>
                    <option value="No">No, unrelated career</option>
                    <option value="Partially">Partially aligned</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Is FIRST job related to degree?</label>
                  <select
                    value={selfEditForm.firstJobRelatedToCourse || 'No'}
                    onChange={(e) => setSelfEditForm({ ...selfEditForm, firstJobRelatedToCourse: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 cursor-pointer focus:outline-none"
                  >
                    <option value="" className="text-slate-400 bg-white">Select--</option>
                    <option value="Yes">Yes, directly aligned</option>
                    <option value="No">No, unrelated career</option>
                    <option value="Partially">Partially aligned</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Job Industry / Nature of Business</label>
                  <select
                    value={selfEditForm.jobIndustry || ''}
                    onChange={(e) => setSelfEditForm({ ...selfEditForm, jobIndustry: e.target.value })}
                    className={`w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 cursor-pointer focus:outline-none transition-colors ${
                      !selfEditForm.jobIndustry ? 'text-slate-400 font-normal' : 'text-slate-700 font-semibold'
                    }`}
                  >
                    <option value="" className="text-slate-400 bg-white">Select Industry--</option>
                    <option value="Information Technology" className="text-slate-700 bg-white">Information Technology / CS</option>
                    <option value="Education / Academia" className="text-slate-700 bg-white">Education / Academia</option>
                    <option value="Agriculture / Forestry / Fisheries" className="text-slate-700 bg-white">Agriculture / Forestry / Fisheries</option>
                    <option value="Hospitality / Tourism / Food Service" className="text-slate-700 bg-white">Hospitality / Tourism / Food Service</option>
                    <option value="Government / Public Administration" className="text-slate-700 bg-white">Government / Public Administration</option>
                    <option value="Business / Finance / Administration" className="text-slate-700 bg-white">Business / Finance / Administration</option>
                    <option value="Healthcare / Medical" className="text-slate-700 bg-white">Healthcare / Medical</option>
                    <option value="Engineering / Construction" className="text-slate-700 bg-white">Engineering / Construction</option>
                    <option value="Others" className="text-slate-700 bg-white">Others</option>
                  </select>
                </div>
                {/* Detalye kung gaano kabilis nakahanap ng trabaho at paano ito nahanap */}
                <div>
                  <label className="block text-slate-400 mb-1">Time to find first post-grad job</label>
                  <select
                    value={selfEditForm.timeToFirstJob}
                    onChange={(e) => setSelfEditForm({ ...selfEditForm, timeToFirstJob: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 cursor-pointer focus:outline-none"
                  >
                    <option value="" className="text-slate-400 bg-white">Select--</option>
                    <option value="Immediate">Immediate placement</option>
                    <option value="1 to 6 months">1 to 6 months</option>
                    <option value="7 to 11 months">7 to 11 months</option>
                    <option value="1 year or longer">1 year or longer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">How did you find your first job?</label>
                  <select
                    value={selfEditForm.findFirstJob || ''}
                    onChange={(e) => setSelfEditForm({ ...selfEditForm, findFirstJob: e.target.value })}
                    className={`w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 cursor-pointer focus:outline-none transition-colors ${
                      !selfEditForm.findFirstJob ? 'text-slate-400 font-normal' : 'text-slate-700 font-semibold'
                    }`}
                  >
                    <option value="" className="text-slate-400 bg-white">Select Option--</option>
                    <option value="Walk-in application" className="text-slate-700 bg-white">Walk-in application</option>
                    <option value="Job Fair / Campus Recruitment" className="text-slate-700 bg-white">Job Fair / Campus Recruitment</option>
                    <option value="Online Job Board (e.g. LinkedIn, JobStreet)" className="text-slate-700 bg-white">Online Job Board</option>
                    <option value="BSC Placement / Internship Office" className="text-slate-700 bg-white">BSC Placement / Internship Office</option>
                    <option value="Recommendation / Family Referral" className="text-slate-700 bg-white">Recommendation / Family Referral</option>
                    <option value="Others" className="text-slate-700 bg-white">Others</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Reason for accepting / staying in this job</label>
                  <select
                    value={selfEditForm.reasonsAcceptingJob || ''}
                    onChange={(e) => setSelfEditForm({ ...selfEditForm, reasonsAcceptingJob: e.target.value })}
                    className={`w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 cursor-pointer focus:outline-none transition-colors ${
                      !selfEditForm.reasonsAcceptingJob ? 'text-slate-400 font-normal' : 'text-slate-700 font-semibold'
                    }`}
                  >
                    <option value="" className="text-slate-400 bg-white">Select Reason--</option>
                    <option value="High Salary &amp; Benefits" className="text-slate-700 bg-white">High Salary &amp; Benefits</option>
                    <option value="Career Growth &amp; Promotion Prospects" className="text-slate-700 bg-white">Career Growth &amp; Promotion Prospects</option>
                    <option value="Proximity to Residence (Location)" className="text-slate-700 bg-white">Proximity to Residence (Location)</option>
                    <option value="Job Security / Stability" className="text-slate-700 bg-white">Job Security / Stability</option>
                    <option value="Good Working Environment" className="text-slate-700 bg-white">Good Working Environment</option>
                    <option value="Others" className="text-slate-700 bg-white">Others</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Conditional Rendering: Ipakita lamang ang dahilan ng Unemployment kung piliin ng user ang 'Unemployed' status */}
          {selfEditForm.employmentStatus === 'Unemployed' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">Primary Reason for Unemployment</label>
                <select
                  value={selfEditForm.reasonsUnemployment || ''}
                  onChange={(e) => setSelfEditForm({ ...selfEditForm, reasonsUnemployment: e.target.value })}
                  className={`w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 cursor-pointer focus:outline-none transition-colors ${
                    !selfEditForm.reasonsUnemployment ? 'text-slate-400 font-normal' : 'text-slate-700 font-semibold'
                  }`}
                >
                  <option value="" className="text-slate-400 bg-white">Select Reason--</option>
                  <option value="Family Concerns / Duties" className="text-slate-700 bg-white">Family Concerns / Duties</option>
                  <option value="Health reasons" className="text-slate-700 bg-white">Health reasons</option>
                  <option value="Pursuing Further Studies" className="text-slate-700 bg-white">Pursuing Further Studies</option>
                  <option value="Lack of job opportunities in region" className="text-slate-700 bg-white">Lack of job opportunities in region</option>
                  <option value="Lack of relevant work experience" className="text-slate-700 bg-white">Lack of relevant work experience</option>
                  <option value="Choosing not to work yet" className="text-slate-700 bg-white">Choosing not to work yet</option>
                  <option value="Others" className="text-slate-700 bg-white">Others</option>
                </select>
              </div>
            </div>
          )}

          {/* Description ng Trabaho */}
          {selfEditForm.employmentStatus !== 'Unemployed' && (
            <div>
              <label className="block text-slate-400 mb-1">Detailed Job Description &amp; Core Tasks</label>
              <textarea
                rows={3}
                placeholder="Briefly state your primary assignments, tools used, and technical responsibilities..."
                value={selfEditForm.jobDescription}
                onChange={(e) => setSelfEditForm({ ...selfEditForm, jobDescription: e.target.value })}
                className="w-full bg-slate-55 border border-slate-200 rounded-lg p-2.5 font-sans focus:outline-none focus:border-[#7c191e]"
              />
            </div>
          )}

          {/* Career Timeline History Editor: Listahan ng mga naging trabaho ng alumni sa paglipas ng panahon */}
          <div className="space-y-4 pt-2">
            <span className="block text-[11px] font-extrabold text-[#7c191e] uppercase tracking-wider">Career Path Timeline History</span>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-4">
                <label className="block text-[10px] text-slate-405 uppercase font-bold mb-1">Job Title</label>
                <input
                  type="text"
                  id="new-history-title"
                  placeholder="e.g. Junior Web Developer"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-750 focus:outline-none focus:border-[#7c191e]"
                />
              </div>
              <div className="sm:col-span-4">
                <label className="block text-[10px] text-slate-405 uppercase font-bold mb-1">Company / Employer</label>
                <input
                  type="text"
                  id="new-history-company"
                  placeholder="e.g. Acma Solutions"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-755 focus:outline-none focus:border-[#7c191e]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] text-slate-405 uppercase font-bold mb-1">Years (e.g. 2023 - 2025)</label>
                <input
                  type="text"
                  id="new-history-years"
                  placeholder="e.g. 2023 - 2025"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-750 focus:outline-none focus:border-[#7c191e]"
                />
              </div>
              <div className="sm:col-span-2">
                {/* Button para magdagdag ng bagong career timeline item sa listahan ng database local copy */}
                <button
                  type="button"
                  onClick={() => {
                    const titleInput = document.getElementById('new-history-title');
                    const companyInput = document.getElementById('new-history-company');
                    const yearsInput = document.getElementById('new-history-years');
                    
                    const title = titleInput.value.trim();
                    const company = companyInput.value.trim();
                    const years = yearsInput.value.trim();
                    
                    if (!title || !company || !years) {
                      alert('Please fill out all timeline details (Title, Company, Years).');
                      return;
                    }
                    
                    const newEvent = { title, company, years };
                    setSelfEditForm({
                      ...selfEditForm,
                      careerHistory: [...(selfEditForm.careerHistory || []), newEvent]
                    });
                    
                    // I-reset ang mga input field matapos magdagdag
                    titleInput.value = '';
                    companyInput.value = '';
                    yearsInput.value = '';
                  }}
                  className="w-full py-2 bg-[#cca43b] hover:bg-[#cca43b]/90 text-slate-900 font-bold text-xs rounded-lg transition uppercase tracking-wider cursor-pointer h-[38px] font-sans"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Listahan ng kasalukuyang naitalang Timeline Events */}
            <div className="space-y-2">
              {selfEditForm.careerHistory && selfEditForm.careerHistory.length > 0 ? (
                selfEditForm.careerHistory.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200/60 shadow-3xs font-sans">
                    <div>
                      <span className="block font-bold text-slate-800 text-xs">{item.title}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">{item.company} &bull; {item.years}</span>
                    </div>
                    {/* Button para alisin ang timeline entry */}
                    <button
                      type="button"
                      onClick={() => {
                        const updatedHistory = selfEditForm.careerHistory.filter((_, i) => i !== idx);
                        setSelfEditForm({
                          ...selfEditForm,
                          careerHistory: updatedHistory
                        });
                      }}
                      className="text-rose-600 hover:text-rose-800 text-xs font-bold transition px-2 py-1 hover:bg-rose-50 rounded"
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <span className="text-[10.5px] text-slate-400 italic block font-sans">No career progression timeline events recorded.</span>
              )}
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Seksyon 3: Core Competencies at Technical Skills */}
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold text-[#7c191e] uppercase tracking-wider flex items-center gap-1">
            <Building className="w-4 h-4 text-[#7c191e]" /> 3. Core Competencies &amp; Technical Skills
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="e.g. JavaScript, React, Bookkeeping, TESDA Certificate..."
              value={newSkillToken}
              onChange={(e) => setNewSkillToken(e.target.value)}
              className="flex-1 bg-slate-55 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#7c191e] min-w-0"
            />
            {/* Button na nagdaragdag ng skill tag taglay ang addSkillToken prop callback */}
            <button
              onClick={addSkillToken}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition uppercase tracking-wider w-full sm:w-auto cursor-pointer"
            >
              Add Skill Tag
            </button>
          </div>

          {/* Ipakita ang bawat skill bilang clickable o removable badge pill */}
          <div className="flex flex-wrap gap-1.5 pt-1.5">
            {selfEditForm.skills && selfEditForm.skills.length > 0 ? (
              selfEditForm.skills.map((skill) => (
                <span 
                  key={skill} 
                  className="px-3 py-1 bg-amber-500/10 border border-amber-300 text-amber-800 rounded-full font-bold text-[10px] inline-flex items-center gap-1.5"
                >
                  {skill}
                  <button 
                    type="button" 
                    onClick={() => removeSkillToken(skill)} 
                    className="text-slate-400 hover:text-rose-600 transition font-bold"
                    title="Remove tag"
                  >
                    &times;
                  </button>
                </span>
              ))
            ) : (
              <span className="text-[10px] text-slate-400 italic">No skills cataloged on tracer index yet.</span>
            )}
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Seksyon 4: Mga Kasanayang Nakuha sa BSC (Batanes State College) na kapaki-pakinabang sa Trabaho */}
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold text-[#7c191e] uppercase tracking-wider flex items-center gap-1">
            <Check className="w-4 h-4 text-[#7c191e]" /> 4. Acquired skills at BSC found most useful in employment
          </h3>
          <p className="text-[10px] text-slate-400 font-bold block">Pumili ng mga kasanayang nakuha sa BSC na kapaki-pakinabang sa iyong trabaho (I-click para i-toggle):</p>
          
          {/* Listahan ng default CHED/BSC variables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              'Technical / Practical Skills',
              'Communication Skills',
              'Critical Thinking & Problem-Solving',
              'Interpersonal & Teamwork Skills',
              'Information Technology Skills'
            ].map(skillOption => {
              const currentSkills = selfEditForm.usefulSkills || [];
              const isChecked = currentSkills.includes(skillOption);
              return (
                <button
                  key={skillOption}
                  type="button"
                  onClick={() => {
                    const nextSkills = isChecked
                      ? currentSkills.filter(s => s !== skillOption)
                      : [...currentSkills, skillOption];
                    setSelfEditForm({ ...selfEditForm, usefulSkills: nextSkills });
                  }}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left cursor-pointer select-none transition-all duration-200 ${
                    isChecked 
                      ? 'bg-[#7c191e]/5 border-[#7c191e] text-[#7c191e] shadow-xs' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                    isChecked ? 'border-[#7c191e] bg-[#7c191e] text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {isChecked && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                  <span className="text-[11px] font-bold">{skillOption}</span>
                </button>
              );
            })}
          </div>

          {/* Section para sa Custom 'Others' Input at listahan ng custom useful skills */}
          <div className="space-y-3 pt-2">
            <label className="block text-[10px] text-slate-405 font-bold uppercase">Others (May iba pa bang kasanayan? Isulat at i-dagdag dito):</label>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Public Speaking, Financial Literacy, Cloud Computing"
                value={customUsefulSkill}
                onChange={(e) => setCustomUsefulSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomUsefulSkillDirectly();
                  }
                }}
                className="flex-1 bg-slate-55 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-[#7c191e] font-sans text-xs font-bold text-slate-705"
              />
              <button
                type="button"
                onClick={addCustomUsefulSkillDirectly}
                className="px-4 py-2.5 bg-[#7c191e] hover:bg-[#5b1216] text-white text-xs font-bold rounded-lg transition uppercase select-none cursor-pointer flex items-center justify-center shrink-0"
              >
                Add Custom
              </button>
            </div>

            {/* Inline tag list para sa custom useful skills lamang */}
            {(() => {
              const currentSkills = selfEditForm.usefulSkills || [];
              const standardSkills = [
                'Technical / Practical Skills',
                'Communication Skills',
                'Critical Thinking & Problem-Solving',
                'Interpersonal & Teamwork Skills',
                'Information Technology Skills'
              ];
              const customSkills = currentSkills.filter(s => !standardSkills.includes(s));

              if (customSkills.length === 0) return null;

              return (
                <div className="flex flex-wrap gap-2 pt-1.5">
                  {customSkills.map((skill) => (
                    <span 
                      key={skill} 
                      className="inline-flex items-center gap-1.5 bg-[#cca43b]/10 text-slate-800 border border-[#cca43b]/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase transition"
                    >
                      {skill}
                      <button 
                        type="button" 
                        onClick={() => removeUsefulSkill(skill)}
                        className="text-[12px] text-slate-850 hover:text-rose-600 font-extrabold focus:outline-none transition cursor-pointer"
                        title="Remove custom skill"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Guideline Notice: Paalala sa layunin at gamit ng nakolektang Tracer statistics para sa CHED audits */}
        <div className="bg-[#7c191e]/5 rounded-xl border border-[#7c191e]/15 p-4 flex gap-3 text-[11px] font-semibold text-slate-655 leading-relaxed">
          <div className="w-5 h-5 bg-[#7c191e]/10 text-[#7c191e] rounded-full flex items-center justify-center shrink-0 font-bold">i</div>
          <div className="space-y-1">
            <span className="font-extrabold text-[#7c191e] uppercase tracking-wider">Graduate Tracer Guideline Notice</span>
            <p>
              Our Tracer statistics are submitted annually to the Commission on Higher Education (CHED) to qualify the national standing of Batanes State College programs.
            </p>
          </div>
        </div>

        {/* Submit Button na naka-sticky sa ibaba ng overlay sheet */}
        <div className="sticky bottom-0 bg-white pt-4 border-t border-slate-100 -mx-6 px-6 pb-6 rounded-b-xl z-10 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#cca43b] hover:bg-[#cca43b]/90 text-slate-900 font-extrabold text-xs rounded-lg transition shadow-md uppercase tracking-wider cursor-pointer"
          >
            Save Tracer Profile Details
          </button>
        </div>

      </form>
    </div>
  );
}
