/**
 * @file EmployerManagementView.jsx
 * @description Directory view para sa mga Admin at Chairperson upang pamahalaan ang mga partner employer.
 * Nagta-track ng mga corporate stakeholders, verified status flags, active vacancy slots,
 * at contact info para suportahan ang work alignment at skills mapping operations.
 */

import React, { useState } from 'react';
import { Shield, Check, PlusCircle, Building, Mail, Phone, Link2, AlertCircle, Trash2, X } from 'lucide-react';

/**
 * EmployerManagementView Component
 * @param {Object} props
 * @param {Array} props.employers - Kumpletong array ng mga partner employer mula sa backend.
 * @param {Object} props.activeUser - Session user object para suriin ang administrative scopes.
 * @param {Function} props.onSaveEmployer - Callback trigger para i-save ang mga bago o binagong employer profile.
 */
export default function EmployerManagementView({ employers, activeUser, onSaveEmployer, onInviteEmployer }) {
  // Trigger para sa pagpapakita ng modal para sa pagdaragdag ng partner employers
  const [isAdding, setIsAdding] = useState(false);
  // States para sa pag-invite ng employer via email
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  // Logs para sa katayuan ng verification status checks
  const [successMsg, setSuccessMsg] = useState('');
  
  // Lokal na state model na tumutugma sa backend database schema para sa bagong stakeholders
  const [newEmp, setNewEmp] = useState({
    id: '',
    companyName: '',
    industry: 'Information Technology',
    address: 'Basco, Batanes',
    email: '',
    phone: '',
    contactPerson: '',
    position: '',
    companySize: '11-50',
    website: '',
    isVerified: true,
    vacanciesCount: 0
  });

  /**
   * Nagpapalit ng verification status sa profile ng isang employer.
   * Limitado sa mga admin account batay sa rendering rules.
   * @param {Object} emp - Ang employer object na babaguhin.
   */
  const handleVerifyToggle = async (emp) => {
    const updated = { ...emp, isVerified: !emp.isVerified };
    await onSaveEmployer(updated);
    setSuccessMsg(`Status updated for '${emp.companyName}'.`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  /**
   * Nag-su-submit ng bagong partner form.
   * Nabe-verify ang mandatory inputs, naglalagay ng timestamp-based ID, nagti-trigger ng save, at nag-re-reset ng values.
   * @param {Event} e - Form submission event
   */
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newEmp.companyName.trim() || !newEmp.email.trim()) {
      alert('Please fill out all mandatory company variables.');
      return;
    }

    const submission = {
      ...newEmp,
      id: `employer-${Date.now()}`
    };

    await onSaveEmployer(submission);
    setIsAdding(false);
    setSuccessMsg(`SUCCESS! Partner Employer '${newEmp.companyName}' has been added.`);
    setTimeout(() => setSuccessMsg(''), 4000);

    // I-reset ang form state model pabalik sa default placeholders
    setNewEmp({
      id: '',
      companyName: '',
      industry: 'Information Technology',
      address: 'Basco, Batanes',
      email: '',
      phone: '',
      contactPerson: '',
      position: '',
      companySize: '11-50',
      website: '',
      isVerified: true,
      vacanciesCount: 0
    });
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Visual na banner para sa notification sa itaas */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
          <span className="p-1 bg-[#1e4620] text-emerald-50 rounded-full"><Check className="w-3 h-3" /></span>
          {successMsg}
        </div>
      )}

      {/* Block para sa mga tool sa Header */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans">
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Livelihood Placement &amp; Employer Directory</h2>
          <p className="text-[11px] text-slate-405 mt-0.5">Maintain verified local stakeholders to drive structural job matching metrics.</p>
        </div>
        
        <div className="flex flex-wrap gap-2 shrink-0">
          {(activeUser.role === 'Administrator' || activeUser.role === 'Department Chairperson') && (
            <button
              onClick={() => setIsInviting(true)}
              className="px-4 py-2 bg-[#cca43b] hover:bg-[#cca43b]/90 text-slate-900 font-bold text-xs rounded-lg transition inline-flex items-center gap-1.5 uppercase select-none cursor-pointer"
            >
              <Mail className="w-4 h-4" /> Invite Employer
            </button>
          )}

          {/* I-render ang mga button para sa paglikha para sa system administrator lamang */}
          {activeUser.role === 'Administrator' && (
            <button
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 bg-[#1e4620] hover:bg-emerald-950 text-white font-bold text-xs rounded-lg transition inline-flex items-center gap-1.5 uppercase select-none cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Add Employer
            </button>
          )}
        </div>
      </div>

      {/* Grid ng mga Employer */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
        {employers.map((emp) => (
          <div key={emp.id} className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden flex flex-col hover:shadow-md transition">
            
            {/* Pang-itaas na bahagi ng banner ng card */}
            <div className="p-5 border-b border-slate-50 flex items-start justify-between gap-3 bg-slate-50/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-105 rounded-lg flex items-center justify-center text-slate-500">
                  <Building className="w-5 h-5 text-[#1e4620]" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 line-clamp-1">{emp.companyName}</h3>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{emp.industry}</span>
                </div>
              </div>
              
              {/* Button para i-toggle ang verification status (disabled para sa mga hindi admin) */}
              <button
                disabled={activeUser.role !== 'Administrator'}
                onClick={() => handleVerifyToggle(emp)}
                className={`p-1 px-2.5 rounded-full text-[9px] font-bold uppercase transition flex items-center gap-1 ${
                  emp.isVerified 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-250 border cursor-pointer' 
                    : 'bg-slate-200 text-slate-600 border border-slate-300 cursor-pointer'
                }`}
                title={activeUser.role === 'Administrator' ? 'Toggle official state approval' : 'Verified Partner'}
              >
                <Shield className="w-3 h-3" />
                {emp.isVerified ? 'VERIFIED' : 'PENDING'}
              </button>
            </div>

            {/* Mga pangunahing detalye (coordinates) ng kumpanya */}
            <div className="flex-1 p-5 space-y-3.5 text-xs text-slate-650 font-medium">
              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Authorized Contact Person</div>
                <div className="text-slate-800 font-bold flex items-center gap-1">
                  {emp.contactPerson} <span className="text-[10px] font-normal text-slate-400">({emp.position})</span>
                </div>
              </div>

              <div className="space-y-1 text-slate-505 font-semibold text-xs">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{emp.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{emp.phone}</span>
                </div>
                {emp.website && (
                  <div className="flex items-center gap-2">
                    <Link2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[#1e4620] font-bold truncate">{emp.website}</span>
                  </div>
                )}
              </div>

              {/* Lokasyon (Geographic anchor) */}
              <div className="text-[10px] text-slate-400 uppercase font-bold">
                Address: <span className="text-slate-600 normal-case">{emp.address}</span>
              </div>
            </div>

            {/* Footer slot: Istatiska ng mga job openings */}
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-400">Company Size</span>
              <span className="text-slate-800 font-semibold">{emp.companySize} employees</span>
              
              <span className="bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded-full text-[10px] font-extrabold border border-emerald-200">
                {emp.vacanciesCount} active slots
              </span>
            </div>

          </div>
        ))}
      </div>

      {/* ========================================================== */}
      {/* MODAL FORM PARA SA PAGDARAGDAG NG BAGONG EMPLOYER          */}
      {/* ========================================================== */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in font-sans">
          
          <div className="bg-white w-full max-w-lg h-[540px] shadow-2xl rounded-2xl overflow-hidden flex flex-col border border-slate-100 relative animate-scale-up">
            
            {/* FIXED HEADER - Nakapako sa itaas na Header ng modal */}
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-[#1e4620]" />
                <h3 className="text-sm font-extrabold text-[#1e4620] uppercase tracking-wide">Register New Partner Employer</h3>
              </div>
              <button 
                onClick={() => setIsAdding(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SCROLLABLE FORM BODY - Katawan ng form na pwedeng i-scroll */}
            <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs font-semibold">
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-550 mb-1">Company / Institution Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Provincial Health Office"
                    value={newEmp.companyName}
                    onChange={(e) => setNewEmp({ ...newEmp, companyName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#1e4620] focus:outline-none rounded-md p-2 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-550 mb-1">Industry Sector Category</label>
                  <select
                    value={newEmp.industry}
                    onChange={(e) => setNewEmp({ ...newEmp, industry: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 font-bold cursor-pointer"
                  >
                    <option value="Information Technology">Information Technology</option>
                    <option value="Hospitality / Tourism">Hospitality / Tourism</option>
                    <option value="Government">Government / Public Agency</option>
                    <option value="Education">Education / Academics</option>
                    <option value="Agriculture / Fishery">Agriculture / Fishery</option>
                    <option value="Construction / Trades">Construction / Trades</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-550 mb-1">Authorized Contact Person *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full name of representative"
                    value={newEmp.contactPerson}
                    onChange={(e) => setNewEmp({ ...newEmp, contactPerson: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#1e4620] focus:outline-none rounded-md p-2 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-550 mb-1">Position / Office designation</label>
                  <input
                    type="text"
                    placeholder="e.g., Division Chief / HR Officer"
                    value={newEmp.position}
                    onChange={(e) => setNewEmp({ ...newEmp, position: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#1e4620] focus:outline-none rounded-md p-2 font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-550 mb-1">Official Email Coordinates *</label>
                    <input
                      type="email"
                      required
                      placeholder="hr@institution.com"
                      value={newEmp.email}
                      onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#1e4620] focus:outline-none rounded-md p-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-550 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      placeholder="e.g., 0912345678"
                      value={newEmp.phone}
                      onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#1e4620] focus:outline-none rounded-md p-2 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-550 mb-1">Office Address Coordinates</label>
                  <input
                    type="text"
                    placeholder="e.g., Basco, Batanes"
                    value={newEmp.address}
                    onChange={(e) => setNewEmp({ ...newEmp, address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#1e4620] focus:outline-none rounded-md p-2 font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-550 mb-1">Company Size Range</label>
                    <select
                      value={newEmp.companySize}
                      onChange={(e) => setNewEmp({ ...newEmp, companySize: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 font-bold cursor-pointer"
                    >
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="Above 200">200+ employees</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-550 mb-1">Website URL</label>
                    <input
                      type="text"
                      placeholder="e.g., www.company.com"
                      value={newEmp.website}
                      onChange={(e) => setNewEmp({ ...newEmp, website: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#1e4620] focus:outline-none rounded-md p-2 font-bold"
                    />
                  </div>
                </div>
              </div>
            </form>

            {/* FIXED FOOTER - Nakapako sa ibaba na Footer ng modal */}
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-2 z-10 w-full">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-slate-205 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateSubmit}
                className="px-4 py-2 bg-[#1e4620] hover:bg-emerald-950 text-white font-bold rounded-lg transition cursor-pointer"
              >
                Registers Employer Database
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL FORM PARA SA PAG-INVITE NG BAGONG EMPLOYER VIA EMAIL */}
      {/* ========================================================== */}
      {isInviting && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in font-sans">
          
          <div className="bg-white w-full max-w-md shadow-2xl rounded-2xl overflow-hidden border border-slate-100 relative animate-scale-up">
            
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#1e4620]" />
                <h3 className="text-sm font-extrabold text-[#1e4620] uppercase tracking-wide">Invite Partner Employer</h3>
              </div>
              <button 
                onClick={() => setIsInviting(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs font-semibold">
              <p className="text-slate-500 font-medium leading-relaxed">
                Enter the email address of the employer representative. The system will automatically construct credential parameters and send an access invitation link via email.
              </p>

              <div>
                <label className="block text-slate-550 mb-1">Employer Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="hr@institution.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#1e4620] focus:outline-none rounded-md p-2.5 font-bold"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsInviting(false)}
                className="px-4 py-2 bg-slate-205 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
                    alert('Please input a valid email address.');
                    return;
                  }
                  if (onInviteEmployer) {
                    await onInviteEmployer(inviteEmail.trim(), 'Employer');
                  }
                  setIsInviting(false);
                  setInviteEmail('');
                  setSuccessMsg(`SUCCESS! Invitation email safely dispatched to: ${inviteEmail}`);
                  setTimeout(() => setSuccessMsg(''), 4000);
                }}
                className="px-4 py-2 bg-[#1e4620] hover:bg-emerald-950 text-white font-bold rounded-lg transition cursor-pointer"
              >
                Send Invitation
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
