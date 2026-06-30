/**
 * @file AddAlumnusModal.jsx
 * @description Modal dialog overlay na nagbibigay-daan sa mga admin user na manu-manong irehistro
 * ang bagong alumnus profile. Nagse-set ito ng default security details (tulad ng temporary password)
 * at nagpapatupad ng limitasyon sa input program base sa role ng chairperson.
 */

import React, { useState } from 'react';
import { GraduationCap, X } from 'lucide-react';
import { BSC_PROGRAMS } from '../../../bscData';

export default function AddAlumnusModal({ activeUser, onSaveAlumni, setIsAddingAlumnus, triggerToast }) {
  // State hook na namamahala sa mga detalye (coordinates) ng bagong alumnus profile
  const [newAlumnus, setNewAlumnus] = useState({
    studentId: '',
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'Male',
    civilStatus: 'Single',
    dateOfBirth: '',
    address: 'Basco, Batanes',
    // Pagsuri sa role ng Chairperson: i-lock ang program select input kung ang naka-login na user ay isang program chair
    program: activeUser.role === 'Department Chairperson' ? (activeUser.program || 'BS Information Technology') : 'BS Information Technology',
    yearGraduated: 2026,
    honors: 'None',
    professionalExamPassed: 'None',
    isInitialPasswordNeeded: true,
    skills: [],
    employmentStatus: 'Unemployed',
    companyName: '',
    jobTitle: '',
    monthlySalary: 'None',
    employmentType: 'None',
    jobRelatedness: 'None',
    employerEmail: '',
    yearHired: '',
    competencies: [],
    profileCompleteness: 40,
    lastUpdated: new Date().toISOString(),
    locationRegion: 'Local (Batanes)',
    careerHistory: []
  });

  const [major, setMajor] = useState('');

  /**
   * Nagpapatunay ng mga field sa input form at nagti-trigger ng database save handler callback.
   * @param {Event} e - Submit event.
   */
  const handleNewAlumnusSubmit = async (e) => {
    e.preventDefault();
    if (!newAlumnus.studentId.trim() || !newAlumnus.firstName.trim() || !newAlumnus.lastName.trim() || !newAlumnus.email.trim()) {
      alert('Please complete all marked required fields.');
      return;
    }

    const finalProgram = major.trim() ? `${newAlumnus.program} Major in ${major.trim()}` : newAlumnus.program;
    const fullAlumnus = {
      ...newAlumnus,
      program: finalProgram,
      name: `${newAlumnus.firstName} ${newAlumnus.lastName}`,
      lastUpdated: new Date().toISOString()
    };

    await onSaveAlumni(fullAlumnus);
    setIsAddingAlumnus(false);
    triggerToast(`SUCCESS! Registered new alumni account for '${fullAlumnus.name}'.`);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in font-sans">
      <div className="bg-white w-full max-w-2xl h-full max-h-[90vh] md:h-[580px] shadow-2xl rounded-2xl overflow-hidden flex flex-col border border-slate-100 relative">
        
        {/* FIXED MODAL HEADER - Header ng modal na nakapako sa itaas */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#1e4620]" />
            <h2 className="text-sm font-extrabold text-[#1e4620] uppercase tracking-wide">Register New Alumnus Account</h2>
          </div>
          <button 
            onClick={() => setIsAddingAlumnus(false)}
            className="p-1.5 hover:bg-slate-105 text-slate-505 rounded-lg transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SCROLLABLE MODAL FORM BODY - Katawan ng modal form na pwedeng i-scroll */}
        <form onSubmit={handleNewAlumnusSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Input para sa Student ID */}
            <div>
              <label className="block text-slate-500 mb-1">Student ID (Unique login ID) *</label>
              <input
                type="text"
                required
                placeholder="e.g., BSC-2022-099"
                value={newAlumnus.studentId}
                onChange={(e) => setNewAlumnus({ ...newAlumnus, studentId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 focus:outline-none focus:border-[#1e4620]"
              />
            </div>

            {/* Input para sa Email Address */}
            <div>
              <label className="block text-slate-500 mb-1">Email Address Coordinates *</label>
              <input
                type="email"
                required
                placeholder="e.g., student.name@gmail.com"
                value={newAlumnus.email}
                onChange={(e) => setNewAlumnus({ ...newAlumnus, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 focus:outline-none focus:border-[#1e4620]"
              />
            </div>

            {/* Input para sa First Name */}
            <div>
              <label className="block text-slate-500 mb-1">First Name *</label>
              <input
                type="text"
                required
                placeholder="First name"
                value={newAlumnus.firstName}
                onChange={(e) => setNewAlumnus({ ...newAlumnus, firstName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 focus:outline-none focus:border-[#1e4620]"
              />
            </div>

            {/* Input para sa Last Name */}
            <div>
              <label className="block text-slate-500 mb-1">Last Name *</label>
              <input
                type="text"
                required
                placeholder="Last name"
                value={newAlumnus.lastName}
                onChange={(e) => setNewAlumnus({ ...newAlumnus, lastName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 focus:outline-none focus:border-[#1e4620]"
              />
            </div>

            {/* Pagpipilian ng Degree Program */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 mb-1">Degree Program Completed</label>
                <select
                  value={newAlumnus.program}
                  onChange={(e) => setNewAlumnus({ ...newAlumnus, program: e.target.value })}
                  disabled={activeUser.role === 'Department Chairperson'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 disabled:bg-slate-100 disabled:text-slate-500 font-sans cursor-pointer focus:outline-none"
                >
                  {activeUser.role === 'Department Chairperson' ? (
                    <option value={activeUser.program}>{activeUser.program}</option>
                  ) : (
                    BSC_PROGRAMS.map(prog => (
                      <option key={prog} value={prog}>{prog}</option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Major / Specialization (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Science, Mathematics"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 focus:outline-none focus:border-[#1e4620]"
                />
              </div>
            </div>

            {/* Input para sa Taon ng Pagtatapos */}
            <div>
              <label className="block text-slate-500 mb-1">Year Graduated</label>
              <input
                type="number"
                value={newAlumnus.yearGraduated}
                onChange={(e) => setNewAlumnus({ ...newAlumnus, yearGraduated: parseInt(e.target.value) || 2026 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 focus:outline-none focus:border-[#1e4620]"
              />
            </div>

            {/* Input para sa Honors/Distinction */}
            <div>
              <label className="block text-slate-500 mb-1">Honors/Distinction (e.g., Cum Laude)</label>
              <input
                type="text"
                placeholder="None"
                value={newAlumnus.honors}
                onChange={(e) => setNewAlumnus({ ...newAlumnus, honors: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 focus:outline-none focus:border-[#1e4620]"
              />
            </div>

            {/* Input para sa Professional License / Examinations */}
            <div>
              <label className="block text-slate-500 mb-1">Professional License / Examinations</label>
              <input
                type="text"
                placeholder="e.g., Licensure Exam for Teachers (LET)"
                value={newAlumnus.professionalExamPassed}
                onChange={(e) => setNewAlumnus({ ...newAlumnus, professionalExamPassed: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 focus:outline-none focus:border-[#1e4620]"
              />
            </div>

            {/* Pagpipilian ng Geographic Location */}
            <div>
              <label className="block text-slate-500 mb-1">Geographic Location Region</label>
              <select
                value={newAlumnus.locationRegion || 'Local (Batanes)'}
                onChange={(e) => setNewAlumnus({ ...newAlumnus, locationRegion: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 font-sans cursor-pointer focus:outline-none"
              >
                <option value="Local (Batanes)">Local (Batanes)</option>
                <option value="National (Rest of PH)">National (Rest of PH)</option>
                <option value="International">International</option>
              </select>
            </div>

          </div>
        </form>

        {/* FIXED MODAL FOOTER - Footer ng modal na nakapako sa ibaba */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-2 z-10">
          <button
            type="button"
            onClick={() => setIsAddingAlumnus(false)}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-350 text-slate-705 font-bold rounded-lg transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleNewAlumnusSubmit}
            className="px-4 py-2 bg-[#1e4620] hover:bg-emerald-950 text-white font-bold rounded-lg transition cursor-pointer"
          >
            Create Alumnus Record
          </button>
        </div>

      </div>
    </div>
  );
}
