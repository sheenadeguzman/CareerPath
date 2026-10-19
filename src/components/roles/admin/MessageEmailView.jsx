import React, { useState, useMemo, useEffect } from 'react';
import { 
  Mail, Check, AlertTriangle, Send, ShieldAlert, PlusCircle, UserPlus, 
  RefreshCw, Trash2, Search, GraduationCap, Building, Award, Users, 
  CheckSquare, Square, Sparkles, FileText, X, ChevronDown, CheckCircle2
} from 'lucide-react';

/**
 * MessageEmailView Component
 * @description Comprehensive Campus Email & Communication Dispatch Hub.
 * Allows Administrators and Super Admins to compose custom email announcements,
 * tracer nudges, and official advisories directly to Alumni, Department Chairpersons, and Employers.
 */
export default function MessageEmailView({ 
  alumniList = [], 
  activeUser, 
  users = [],
  employers = [],
  onSendReminders, 
  onInviteUserByEmail,
  onDeleteUser
}) {
  
  // State hook para sa loading status habang nagpapadala ng notifications
  const [isSending, setIsSending] = useState(false);
  // State hook para sa loading status habang nag-iimbita ng bagong user
  const [isInviting, setIsInviting] = useState(false);
  // State hook para sa text na ipapakita sa toast status message
  const [showStatus, setShowStatus] = useState('');

  const portalUrl = typeof window !== 'undefined' ? window.location.origin : 'https://careerpath-1ed8.onrender.com';

  // Default official messages na awtomatikong nakalagay base sa napiling kategorya
  const defaultCategoryMessages = useMemo(() => ({
    Alumni: {
      subject: 'Official Notice: Complete Your BSC Graduate Tracer Profile',
      body: `Hello {name},

Greetings from Batanes State College!

This is an official advisory regarding the BSC Graduate Tracer System. Your participation is required under CHED Memorandum Guidelines to track the professional trajectory and employability of our graduates.

Please log in to the portal using your Student ID to verify and update your employment records and skills competencies:
${portalUrl}

If you have already updated your details, please disregard this notice.

Respectfully,
Office of Tracer Programs & Administrative Analytics
Batanes State College`
    },
    'Department Chairperson': {
      subject: 'Curriculum Alignment & Graduate Tracer Telemetry Advisory',
      body: `Dear {name},

Greetings!

The Batanes State College CareerPath analytics engine has synthesized new tracer telemetry and employer feedback for your department's degree programs.

Please review the latest curricular gap metrics and employment alignment figures on the portal to support upcoming CHED institutional reviews:
${portalUrl}

Respectfully,
Office of Academic Affairs & Portal Administration
Batanes State College`
    },
    Employer: {
      subject: 'Partnership Invitation: Post Vacancies & Explore Graduate Talent Matches',
      body: `Dear {name},

Greetings from Batanes State College!

As an esteemed industry partner, we invite you to access the BSC CareerPath portal to review graduating talent competencies and submit new career vacancy bulletins:
${portalUrl}

Thank you for your active collaboration in enhancing graduate career outcomes.

Warm regards,
BSC Career Placement & Industry Linkages Office
Batanes State College`
    },
    All: {
      subject: 'Official Campus Advisory | Batanes State College CareerPath Portal',
      body: `Hello {name},

Greetings from Batanes State College!

This is an official advisory and communication update regarding the BSC CareerPath Portal.

Please access the portal for the latest institution-wide career tracking, updates, and announcements:
${portalUrl}

Respectfully,
Office of the Administrator
Batanes State College`
    }
  }), [portalUrl]);

  // Target Role Category: 'Alumni' | 'Department Chairperson' | 'Employer' | 'All'
  const [targetCategory, setTargetCategory] = useState('Alumni');
  const [recipientSearchQuery, setRecipientSearchQuery] = useState('');
  const [selectedRecipientIds, setSelectedRecipientIds] = useState([]);

  // Email Content States - May kumpletong official notice na agad bilang default
  const [customSubject, setCustomSubject] = useState(
    'Official Notice: Complete Your BSC Graduate Tracer Profile'
  );
  const [customBody, setCustomBody] = useState(
`Hello {name},

Greetings from Batanes State College!

This is an official advisory regarding the BSC Graduate Tracer System. Your participation is required under CHED Memorandum Guidelines to track the professional trajectory and employability of our graduates.

Please log in to the portal using your Student ID to verify and update your employment records and skills competencies:
${portalUrl}

If you have already updated your details, please disregard this notice.

Respectfully,
Office of Tracer Programs & Administrative Analytics
Batanes State College`
  );

  const handleSelectCategory = (cat) => {
    setTargetCategory(cat);
    if (defaultCategoryMessages[cat]) {
      setCustomSubject(defaultCategoryMessages[cat].subject);
      setCustomBody(defaultCategoryMessages[cat].body);
    }
  };

  // Form para sa pag-imbita ng bagong user
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState(activeUser?.role === 'Super Admin' ? 'Super Admin' : 'Alumni');

  // Super Admin Users Directory search query state
  const [searchQuery, setSearchQuery] = useState('');

  // 1. I-map ang lahat ng Alumni Recipients
  const alumniRecipients = useMemo(() => {
    return (alumniList || []).map(a => ({
      id: a.studentId,
      studentId: a.studentId,
      name: a.name || `${a.firstName || ''} ${a.lastName || ''}`.trim() || 'Graduate Alumnus',
      email: a.email || '',
      role: 'Alumni',
      program: a.program || '',
      profileCompleteness: a.profileCompleteness || 0,
      details: `${a.program || 'BSC Degree'} • Class of ${a.yearGraduated || '2026'}`
    }));
  }, [alumniList]);

  // 2. I-map ang lahat ng Department Chairperson Recipients
  const chairRecipients = useMemo(() => {
    return (users || []).filter(u => u.role === 'Department Chairperson').map(u => ({
      id: u.id,
      userId: u.userId,
      name: u.name || 'Department Chairperson',
      email: u.email || '',
      role: 'Department Chairperson',
      program: u.program || u.name,
      details: u.program || 'Department Chairperson'
    }));
  }, [users]);

  // 3. I-map ang lahat ng Partner Employer Recipients
  const employerRecipients = useMemo(() => {
    const list = [];
    (users || []).filter(u => u.role === 'Employer').forEach(u => {
      const emp = (employers || []).find(e => e.email?.toLowerCase() === u.email?.toLowerCase() || e.id === u.companyId);
      list.push({
        id: u.id,
        userId: u.userId,
        name: emp?.companyName || u.name || 'Partner Employer',
        email: u.email || emp?.email || '',
        role: 'Employer',
        details: emp?.industry || 'Industry Partner'
      });
    });

    (employers || []).forEach(emp => {
      if (emp.email && !list.some(r => r.email && r.email.toLowerCase() === emp.email.toLowerCase())) {
        list.push({
          id: emp.id,
          userId: emp.id,
          name: emp.companyName || emp.contactPerson || 'Partner Enterprise',
          email: emp.email,
          role: 'Employer',
          details: emp.industry || 'Industry Partner'
        });
      }
    });
    return list;
  }, [users, employers]);

  // Listahan ng recipients base sa napiling kategorya
  const currentCategoryPool = useMemo(() => {
    if (targetCategory === 'Alumni') {
      return alumniRecipients;
    }
    if (targetCategory === 'Department Chairperson') {
      return chairRecipients;
    }
    if (targetCategory === 'Employer') {
      return employerRecipients;
    }
    // 'All' - broadcast sa lahat
    return [...alumniRecipients, ...chairRecipients, ...employerRecipients];
  }, [targetCategory, alumniRecipients, chairRecipients, employerRecipients]);

  // I-initialize ang selected recipients sa tuwing magpapalit ng target category
  useEffect(() => {
    setSelectedRecipientIds(currentCategoryPool.map(r => r.id));
  }, [targetCategory, currentCategoryPool]);

  // Filtered recipients para sa live table search
  const filteredRecipients = useMemo(() => {
    const q = recipientSearchQuery.trim().toLowerCase();
    if (!q) return currentCategoryPool;
    return currentCategoryPool.filter(r => 
      (r.name || '').toLowerCase().includes(q) ||
      (r.email || '').toLowerCase().includes(q) ||
      (r.details || '').toLowerCase().includes(q) ||
      (r.role || '').toLowerCase().includes(q)
    );
  }, [currentCategoryPool, recipientSearchQuery]);

  const toggleSelectAll = () => {
    if (selectedRecipientIds.length === currentCategoryPool.length) {
      setSelectedRecipientIds([]);
    } else {
      setSelectedRecipientIds(currentCategoryPool.map(r => r.id));
    }
  };

  const toggleRecipient = (id) => {
    if (selectedRecipientIds.includes(id)) {
      setSelectedRecipientIds(selectedRecipientIds.filter(i => i !== id));
    } else {
      setSelectedRecipientIds([...selectedRecipientIds, id]);
    }
  };

  /**
   * handleBatchDispatch
   * Nagpapadala ng custom email/notification sa mga napiling recipients
   */
  const handleBatchDispatch = async () => {
    const recipientsToSend = currentCategoryPool.filter(r => selectedRecipientIds.includes(r.id));
    
    if (recipientsToSend.length === 0) {
      alert('The recipient queue is empty! Please select at least one recipient.');
      return;
    }

    if (!customSubject.trim() || !customBody.trim()) {
      alert('Please fill out both the email subject and the message body!');
      return;
    }

    setIsSending(true);
    setShowStatus('');

    try {
      const targetIds = recipientsToSend.map(r => r.id);
      await onSendReminders(targetIds, customSubject.trim(), customBody.trim(), recipientsToSend);
      setShowStatus(`SUCCESS! Email message successfully dispatched to ${recipientsToSend.length} recipient(s).`);
      setTimeout(() => setShowStatus(''), 6000);
    } catch (err) {
      console.error(err);
      alert('Failed to send email message: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSending(false);
    }
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

  return (
    <div className="space-y-6 font-sans">
      
      {/* Toast notification indicator para sa tagumpay na mga operasyon */}
      {showStatus && (
        <div role="alert" className="p-4 bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in shadow-xs">
          <span className="p-1 bg-[#1e4620] text-emerald-50 rounded-full"><Check className="w-3.5 h-3.5 text-white" /></span>
          <span>{showStatus}</span>
        </div>
      )}

      {/* Layout Grid: Kaliwang panig para sa Email Hub, kanang panig para sa pag-imbita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ========================================================================= */}
        {/* EMAIL & COMMUNICATION DISPATCH WORKSPACE (Admin Mail Client)             */}
        {/* ========================================================================= */}
        <div className="lg:col-span-8 bg-white rounded-xl shadow-xs border border-slate-100 p-5 sm:p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Header ng Email Workspace */}
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-xs sm:text-sm font-extrabold text-[#1e4620] uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#7c191e]" /> Campus Email &amp; Advisory Dispatch Hub
              </h2>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Type and send custom emails and portal notifications directly to Alumni, Department Chairs, or Employers.
              </p>
            </div>

            {/* 1. Target Recipient Category Selector */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                Select Recipient Category
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSelectCategory('Alumni')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                    targetCategory === 'Alumni'
                      ? 'bg-[#1e4620] text-white border-[#1e4620] shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                  <span>Alumni ({alumniRecipients.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectCategory('Department Chairperson')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                    targetCategory === 'Department Chairperson'
                      ? 'bg-[#1e4620] text-white border-[#1e4620] shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 shrink-0" />
                  <span>Dept Chairs ({chairRecipients.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectCategory('Employer')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                    targetCategory === 'Employer'
                      ? 'bg-[#1e4620] text-white border-[#1e4620] shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Building className="w-3.5 h-3.5 shrink-0" />
                  <span>Employers ({employerRecipients.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectCategory('All')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                    targetCategory === 'All'
                      ? 'bg-[#7c191e] text-white border-[#7c191e] shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  <span>Broadcast All</span>
                </button>
              </div>
            </div>

            {/* 2. Email Form (Subject & Message Body) */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Email Subject Line
                </label>
                <input
                  type="text"
                  required
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="Enter email subject line..."
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#1e4620]/20 focus:border-[#1e4620] transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                    Message Body (Admin Email Content)
                  </label>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                    <span>Personalize:</span>
                    <button
                      type="button"
                      onClick={() => setCustomBody(prev => prev + ' {name}')}
                      className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded font-mono font-bold cursor-pointer"
                      title="Insert recipient's name"
                    >
                      {'{name}'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomBody(prev => prev + ' {role}')}
                      className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded font-mono font-bold cursor-pointer"
                      title="Insert recipient's role"
                    >
                      {'{role}'}
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => {
                        const def = defaultCategoryMessages[targetCategory] || defaultCategoryMessages.Alumni;
                        setCustomSubject(def.subject);
                        setCustomBody(def.body);
                      }}
                      className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 rounded cursor-pointer font-bold transition"
                      title="Restore official default template for this role"
                    >
                      Reset Default
                    </button>
                  </div>
                </div>
                <textarea
                  rows={9}
                  required
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  placeholder="Type your official announcement, reminder, or communication here..."
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg p-3 text-xs leading-relaxed font-sans text-slate-800 focus:ring-2 focus:ring-[#1e4620]/20 focus:border-[#1e4620] transition"
                />
              </div>
            </div>

            {/* 4. Recipient Queue Table with Search & Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                  Target Queue ({selectedRecipientIds.length} of {currentCategoryPool.length} selected)
                </span>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search recipient..."
                      value={recipientSearchQuery}
                      onChange={(e) => setRecipientSearchQuery(e.target.value)}
                      className="pl-8 pr-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700 focus:bg-white w-48 sm:w-56"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="px-2.5 py-1 text-[11px] font-bold text-[#1e4620] hover:bg-emerald-50 rounded-lg border border-emerald-200 cursor-pointer"
                  >
                    {selectedRecipientIds.length === currentCategoryPool.length ? 'Clear All' : 'Select All'}
                  </button>
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto border border-slate-200/80 rounded-xl bg-slate-50 divide-y divide-slate-100 text-xs">
                {filteredRecipients.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 font-medium text-xs">
                    No recipients found in this category.
                  </div>
                ) : (
                  filteredRecipients.map((rec) => {
                    const isChecked = selectedRecipientIds.includes(rec.id);
                    return (
                      <label 
                        key={rec.id} 
                        className={`p-2.5 flex items-center justify-between gap-3 hover:bg-slate-100/70 transition cursor-pointer select-none ${
                          isChecked ? 'bg-white' : 'opacity-70'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleRecipient(rec.id)}
                            className="w-4 h-4 rounded text-[#1e4620] focus:ring-[#1e4620] cursor-pointer shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="block font-bold text-slate-800 text-xs truncate">
                              {rec.name}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate block">
                              {rec.email || 'No email on file (In-app alert only)'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${
                            rec.role === 'Department Chairperson' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                            rec.role === 'Employer' ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                            'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          }`}>
                            {rec.role}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                            {rec.details}
                          </span>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* Action Dispatch Button */}
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleBatchDispatch}
              disabled={isSending || selectedRecipientIds.length === 0}
              className="w-full py-3 bg-[#1e4620] hover:bg-[#123113] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold text-xs rounded-xl transition uppercase flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" /> Dispatching email messages &amp; alerts...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send Email Message to {selectedRecipientIds.length} Recipient{selectedRecipientIds.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INVITE NEW TRACER REGISTRATION (Single Registration Generator)            */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 bg-white rounded-xl shadow-xs border border-slate-100 p-5 sm:p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <h2 className="text-xs sm:text-sm font-extrabold text-[#1e4620] uppercase tracking-wider block flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-[#7c191e]" /> Invite New Portal User
            </h2>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Generate new credentials for single graduates, Department Chairpersons, or Partner Employers.
            </p>

            <form onSubmit={handleInviteSubmit} className="space-y-4 text-xs font-semibold text-slate-600 pt-2">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Target Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g., chair.it@bsc.edu.ph"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-[#1e4620] focus:bg-white text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Assign User Role Security Standard</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-bold text-slate-800 cursor-pointer"
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

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200/70 text-[11px] text-amber-900 leading-snug">
                <strong>Notice:</strong> Initial password is set to <code className="bg-amber-100 font-mono px-1 rounded font-bold">bsc123</code>. The user will be required to change to a private password upon first sign-in.
              </div>

              <button
                type="submit"
                disabled={isInviting || !inviteEmail.trim()}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold text-xs rounded-lg transition uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isInviting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" /> Generating Credentials...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" /> Generate Login Credentials
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 text-center font-medium">
            Batanes State College Credential Management
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SYSTEM USERS DIRECTORY SECTION (SUPER ADMIN ONLY)                         */}
      {/* ========================================================================= */}
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
                    <td colSpan={6} className="p-6 text-center text-slate-400 font-bold">
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
                            <Check className="w-3.5 h-3.5 text-emerald-600 rounded-full" />
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
