import React, { useState } from 'react';
import { Mail, Check, AlertTriangle, Send, ShieldAlert, PlusCircle, UserPlus, RefreshCw, SendToBack, BellDot, Trash2, Search } from 'lucide-react';

/**
 * MessageEmailView Component
 * @description View component para sa pag-broadcast ng mga paalala (reminders) sa mga alumni 
 * at pag-imbita at pamamahala ng mga system users, na may kaparehong disenyo ng orihinal na Settings page.
 */
export default function MessageEmailView({ 
  alumniList = [], 
  activeUser, 
  users = [],
  onSendReminders, 
  onInviteUserByEmail,
  onDeleteUser
}) {
  
  // Mga istatistika para sa profile completeness ng mga alumni
  // Fina-filter ang mga alumni na mas mababa sa 80% ang profile completeness
  const incompleteAlumni = alumniList.filter(al => al.profileCompleteness < 80);
  const totalIncompleteCount = incompleteAlumni.length;

  // State hook para sa loading status habang nagpapadala ng notifications
  const [isSending, setIsSending] = useState(false);
  // State hook para sa loading status habang nag-iimbita ng bagong user
  const [isInviting, setIsInviting] = useState(false);
  // State hook para sa text na ipapakita sa toast status message
  const [showStatus, setShowStatus] = useState('');

  // State variables para sa customized message inputs
  const [targetAudience, setTargetAudience] = useState('Incomplete');
  const [selectedAlumniIds, setSelectedAlumniIds] = useState([]);
  const [alumniSearchQuery, setAlumniSearchQuery] = useState('');
  const [customSubject, setCustomSubject] = useState('Welcome to BSC CareerPath | Batanes State College Graduate Tracer Portal');
  const [customBody, setCustomBody] = useState(
    `Hello {name},\n\nWelcome to BSC CareerPath, the official Graduate Tracer and Employability Portal of Batanes State College.\n\nYour account has been initialized by the system administrator using your registration details. To comply with Commission on Higher Education (CHED) Memorandum Orders, all graduates are requested to access the portal and update their tracer details.\n\nYou can access your portal here:\nhttps://careerpath-1ed8.onrender.com/\n\nPlease use your Student ID as your User ID. If this is your first time logging in, your temporary password is 'bsc123' (Please change this immediately in the settings tab after logging in for security).\n\nRespectfully,\nAlumni President\nBatanes State College`
  );

  // State variables para sa form ng bagong imbitasyon
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState(activeUser?.role === 'Super Admin' ? 'Super Admin' : 'Alumni');

  // Super Admin Users Directory search query state
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = (users || []).filter(user => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      (user.name || '').toLowerCase().includes(query) ||
      (user.email || '').toLowerCase().includes(query) ||
      (user.role || '').toLowerCase().includes(query) ||
      (user.userId || '').toLowerCase().includes(query)
    );
  });

  const handleDeleteUserClick = (user) => {
    if (confirm(`WARNING: Are you absolutely sure you want to permanently delete the user account "${user.name}" (${user.userId})?\n\nThis will completely purge their credentials and associated portal access!`)) {
      onDeleteUser(user.id);
    }
  };

  /**
   * handleBatchDispatch
   * Nagpapadala ng maramihang email/notification reminders sa mga piniling alumni
   */
  const handleBatchDispatch = async () => {
    let listToTarget = [];
    if (targetAudience === 'Incomplete') {
      listToTarget = incompleteAlumni;
    } else if (targetAudience === 'All') {
      listToTarget = alumniList;
    } else {
      listToTarget = alumniList.filter(a => selectedAlumniIds.includes(a.studentId));
    }
    
    if (listToTarget.length === 0) {
      alert('The target audience queue is empty! Please select at least one recipient.');
      return;
    }

    if (!customSubject.trim() || !customBody.trim()) {
      alert('Please fill out both the custom email heading subject and the body!');
      return;
    }

    setIsSending(true);
    setShowStatus('');

    const targetIds = listToTarget.map(a => a.studentId);
    
    setTimeout(async () => {
      await onSendReminders(targetIds, customSubject.trim(), customBody.trim());
      setIsSending(false);
      setShowStatus(`SUCCESS! Customized updates successfully sent to ${targetIds.length} graduates.`);
      setTimeout(() => setShowStatus(''), 5000);
    }, 1800);
  };

  /**
   * handleInviteSubmit
   * Tagapamahala sa pagpapadala ng imbitasyon para sa bagong rehistradong user sa system
   */
  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    await onInviteUserByEmail(inviteEmail.trim(), inviteRole);
    setIsInviting(false);
    
    setShowStatus(`SUCCESS! Invitation sent to '${inviteEmail}'. Temporary password set to 'bsc123'.`);
    setTimeout(() => setShowStatus(''), 4500);
    setInviteEmail('');
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Toast notification indicator para sa tagumpay na mga operasyon */}
      {showStatus && (
        <div role="alert" className="p-4 bg-emerald-50 text-emerald-950 border border-emerald-250 rounded-xl text-xs font-bold flex items-center gap-2">
          <span className="p-1 bg-[#1e4620] text-emerald-50 rounded-full"><Check className="w-3 h-3 text-emerald-50" /></span>
          {showStatus}
        </div>
      )}

      {/* Layout Grid: Kaliwang panig para sa maramihang reminders, kanang panig para sa paggawa ng bagong imbitasyon */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Lalagyan para sa workspace ng pagpapadala ng customized na mensahe (Broadcaster) */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#1e4620] uppercase tracking-wider block font-sans">Tracer Update &amp; Reminder Dispatch Workspace</span>
            
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Compose custom notification alerts or quarterly reminders. This allows you to dispatch direct email reminders requesting graduates to complete their profiles or update their tracer records.
            </p>

            <div className="space-y-4 pt-2 text-xs font-semibold text-slate-600">
              <div>
                <label className="block text-slate-500 mb-1.5">1. Select Target Recipient Audience</label>
                <div className="flex gap-2 font-bold text-[10px]">
                  <button
                    type="button"
                    onClick={() => setTargetAudience('Incomplete')}
                    className={`flex-1 py-2 px-1 border rounded-lg transition-all text-center cursor-pointer ${
                      targetAudience === 'Incomplete' 
                        ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold' 
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 font-semibold'
                    }`}
                  >
                    Pending ({totalIncompleteCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetAudience('All')}
                    className={`flex-1 py-2 px-1 border rounded-lg transition-all text-center cursor-pointer ${
                      targetAudience === 'All' 
                        ? 'bg-emerald-50 text-[#1e4620] border-emerald-300 font-bold' 
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 font-semibold'
                    }`}
                  >
                    All active ({alumniList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetAudience('Custom')}
                    className={`flex-1 py-2 px-1 border rounded-lg transition-all text-center cursor-pointer ${
                      targetAudience === 'Custom' 
                        ? 'bg-rose-50 text-rose-900 border-rose-350 font-bold' 
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 font-semibold'
                    }`}
                  >
                    Manual ({selectedAlumniIds.length})
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">2. Custom Email Subject Standard</label>
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="e.g., Warning: Complete profile before institutional audits"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-[#1e4620] font-sans font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">
                  3. Message Body (Use <code className="bg-slate-100 text-[#1e4620] px-1 font-mono font-bold">{'{name}'}</code> to personalize)
                </label>
                <textarea
                  rows={6}
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  placeholder="Insert details of quarterly warning or friendly reminders..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-[#1e4620] leading-relaxed text-slate-700 font-medium font-sans"
                />
              </div>
            </div>

            {/* Silip o preview sa listahan ng mga makakatanggap ng paalala */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between items-center select-none">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase">
                  Notice Queue Preview ({targetAudience === 'Incomplete' ? totalIncompleteCount : targetAudience === 'All' ? alumniList.length : selectedAlumniIds.length} recipients):
                </span>
                {targetAudience === 'Custom' && (
                  <div className="flex gap-2 text-[9px] font-bold">
                    <button 
                      type="button" 
                      onClick={() => setSelectedAlumniIds(alumniList.map(a => a.studentId))}
                      className="text-[#1e4620] hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-slate-350">|</span>
                    <button 
                      type="button" 
                      onClick={() => setSelectedAlumniIds([])}
                      className="text-rose-700 hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>

              {targetAudience === 'Custom' && (
                <div className="relative mb-2">
                  <input
                    type="text"
                    placeholder="Search alumni by name or program..."
                    value={alumniSearchQuery}
                    onChange={(e) => setAlumniSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 pl-8 text-[10px] font-bold text-slate-700 focus:ring-1 focus:ring-[#1e4620] font-sans"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              )}

              <div className="max-h-36 overflow-y-auto border border-slate-100 rounded-lg bg-slate-50 p-2.5 divide-y text-[10px] font-bold text-slate-650 space-y-1 font-sans">
                {targetAudience === 'Custom' ? (
                  alumniList
                    .filter(a => {
                      const q = alumniSearchQuery.toLowerCase().trim();
                      if (!q) return true;
                      return (
                        (a.firstName + ' ' + a.lastName).toLowerCase().includes(q) ||
                        (a.studentId || '').toLowerCase().includes(q) ||
                        (a.program || '').toLowerCase().includes(q)
                      );
                    })
                    .map(al => {
                      const isChecked = selectedAlumniIds.includes(al.studentId);
                      return (
                        <label key={al.studentId} className="py-1.5 flex justify-between items-center cursor-pointer hover:bg-slate-100/50 px-1 rounded transition-colors select-none">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedAlumniIds(selectedAlumniIds.filter(id => id !== al.studentId));
                                } else {
                                  setSelectedAlumniIds([...selectedAlumniIds, al.studentId]);
                                }
                              }}
                              className="w-3.5 h-3.5 rounded border-slate-350 text-[#1e4620] focus:ring-[#1e4620] cursor-pointer"
                            />
                            <span className="text-slate-800 font-extrabold">{al.firstName} {al.lastName} ({al.studentId})</span>
                          </div>
                          <span className={al.profileCompleteness < 80 ? "text-amber-800" : "text-emerald-800"}>
                            {al.profileCompleteness}% Completion
                          </span>
                        </label>
                      );
                    })
                ) : (
                  (targetAudience === 'Incomplete' ? incompleteAlumni : alumniList).map(al => (
                    <div key={al.studentId} className="py-1 flex justify-between px-1">
                      <span>{al.firstName} {al.lastName} ({al.studentId})</span>
                      <span className={al.profileCompleteness < 80 ? "text-amber-800" : "text-emerald-800"}>
                        {al.profileCompleteness}% Completion
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50">
            <button
              onClick={handleBatchDispatch}
              disabled={isSending}
              className="w-full py-2.5 bg-[#1e4620] hover:bg-[#123113] text-white font-extrabold text-xs rounded-lg transition uppercase flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-500" /> Blasting customised updates queue...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Broadcast Message update to {targetAudience === 'Incomplete' ? totalIncompleteCount : targetAudience === 'All' ? alumniList.length : selectedAlumniIds.length} Alumni
                </>
              )}
            </button>
          </div>
        </div>

        {/* Lalagyan para sa workspace ng pag-imbita ng bagong gagamit sa system */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-6 space-y-5">
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#1e4620] uppercase tracking-wider block">Invite New Tracer Registration</span>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Inject single alumni credentials or department head accounts directly. This generates matching SIAS active pass entries.
            </p>
          </div>

          <form onSubmit={handleInviteSubmit} className="space-y-4 text-xs font-semibold text-slate-600">
            <div>
              <label className="block text-slate-500 mb-1">Target Email Address</label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="e.g., chairperson@bsc.edu.ph"
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 focus:ring-1 focus:ring-[#1e4620]"
              />
            </div>

            <div>
              <label className="block text-slate-500 mb-1">Assign User Role Security Standard</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5"
              >
                {activeUser?.role === 'Super Admin' && (
                  <>
                    <option value="Super Admin">Super Administrator (SYSTEM OVERSEER)</option>
                    <option value="Administrator">Administrator (PORTAL MANAGER)</option>
                  </>
                )}
                <option value="Alumni">Graduate Alumnus (TRACER TYPE)</option>
                <option value="Department Chairperson">Department Chairperson (IT / Hospitality / BSA)</option>
                <option value="Employer">Partner Employer (Hiring Manager)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isInviting}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-lg transition uppercase flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> Generate Login Credentials
            </button>
          </form>
        </div>

      </div>

      {/* System Users Directory Section - Visible only to Super Admin */}
      {activeUser?.role === 'Super Admin' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-150">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#1e4620] uppercase tracking-wider block">System Users Directory (Super Admin Only)</span>
              <p className="text-xs text-slate-500 font-semibold">
                Manage all registered accounts, view credentials status, or delete administrators, alumni, and partner credentials.
              </p>
            </div>
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-3.5 h-3.5 text-slate-400" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or role..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#1e4620] focus:bg-white text-slate-800"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                  <th className="p-3">User ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">System Role</th>
                  <th className="p-3">Verification Info</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-440 font-bold">
                      No system users found matching search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-3 font-mono font-bold text-[#7c191e]">{user.userId}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'}
                            alt={user.name}
                            className="w-6 h-6 rounded-full object-cover border border-slate-100"
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'; }}
                          />
                          <span>{user.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-500">{user.email || 'N/A'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${
                          user.role === 'Super Admin' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                          user.role === 'Administrator' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          user.role === 'Department Chairperson' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          user.role === 'Employer' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                          'bg-emerald-50 text-[#1e4620] border border-emerald-200'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-3">
                        {user.isInitialPasswordNeeded ? (
                          <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-bold border border-amber-100 flex items-center gap-1 w-max">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            Default Credentials
                          </span>
                        ) : (
                          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-bold border border-emerald-100 flex items-center gap-1 w-max">
                            <Check className="w-3.5 h-3.5 text-emerald-50 rounded-full text-emerald-50" />
                            Private Password Set
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeleteUserClick(user)}
                          disabled={user.id === activeUser.id}
                          className={`p-1.5 rounded-lg border transition ${
                            user.id === activeUser.id
                              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700 cursor-pointer'
                          }`}
                          title={user.id === activeUser.id ? 'Cannot delete your own account' : 'Permanently delete user'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
