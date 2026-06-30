import React, { useState } from 'react';
import { Mail, Check, AlertTriangle, Send, ShieldAlert, PlusCircle, UserPlus, RefreshCw, SendToBack, BellDot } from 'lucide-react';

/**
 * SettingsView Component
 * @description View component para sa mga administrative settings, kasama ang pag-broadcast ng
 * mga paalala (reminders) sa mga alumni tungkol sa profile updates at pag-imbita ng mga bagong users.
 */
export default function SettingsView({ 
  alumniList, 
  activeUser, 
  onSendReminders, 
  onInviteUserByEmail 
}) {
  
  // Mga istatistika para sa profile completeness ng mga alumni
  // Sinasala ang mga alumni na mas mababa sa 80% ang profile completeness
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
  const [customSubject, setCustomSubject] = useState('Quarterly Graduate Profile & Tracer Study Update Reminder');
  const [customBody, setCustomBody] = useState(
    `Hello {name},\n\nThis is a quarterly administrative reminder from the Batanes State College Administration.\n\nUnder Commission on Higher Education (CHED) Memorandum Orders, all BSC alumni are requested to immediately audit and update their active employment details.\n\nKindly log into your graduate portal, navigate to the active tracer study tab, and complete any pending questionnaires. This plays a massive role in institutional auditing.\n\nRespectfully,\nOffice of Administrative Affairs\nBatanes State College`
  );

  // State variables para sa form ng bagong imbitasyon
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Alumni');

  /**
   * handleBatchDispatch
   * Nagpapadala ng maramihang email/notification reminders sa mga piniling alumni
   */
  const handleBatchDispatch = async () => {
    // Tukuyin ang listahan ng alumni base sa napiling target audience
    const listToTarget = targetAudience === 'Incomplete' ? incompleteAlumni : alumniList;
    
    // Validasyon para masigurong may makakatanggap ng broadcast
    if (listToTarget.length === 0) {
      alert('The target audience queue is empty!');
      return;
    }

    // Validasyon para sa subject at content body ng mensahe
    if (!customSubject.trim() || !customBody.trim()) {
      alert('Please fill out both the custom email heading subject and the body!');
      return;
    }

    setIsSending(true);
    setShowStatus('');

    // Kunin ang mga student ID ng mga target na alumni
    const targetIds = listToTarget.map(a => a.studentId);
    
    // Mag-simulate ng network latency bago tawagin ang parent action dispatcher
    setTimeout(async () => {
      await onSendReminders(targetIds, customSubject.trim(), customBody.trim());
      setIsSending(false);
      setShowStatus(`SUCCESS! Customized update dispatch successfully blasted to ${targetIds.length} alumni profiles.`);
      // Awtomatikong itago ang success message pagkatapos ng 5 segundo
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
    // Ipadala ang imbitasyon gamit ang email at role sa pamamagitan ng API/parent callback
    await onInviteUserByEmail(inviteEmail.trim(), inviteRole);
    setIsInviting(false);
    
    setShowStatus(`SUCCESS! Invitation credits configured for '${inviteEmail}'. Temporary password set to 'bsc123'.`);
    // Awtomatikong itago ang success message pagkatapos ng 4.5 segundo
    setTimeout(() => setShowStatus(''), 4500);

    // I-reset ang email input field matapos maipadala ang request
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
              Compose custom notification alerts or quarterly reminders. This allows you to dispatch direct message reminders requesting graduates to complete their profiles or update their tracer records.
            </p>

            <div className="space-y-4 pt-2 text-xs font-semibold text-slate-600">
              <div>
                <label className="block text-slate-500 mb-1.5">1. Select Target Recipient Audience</label>
                <div className="flex gap-2 font-bold">
                  <button
                    type="button"
                    onClick={() => setTargetAudience('Incomplete')}
                    className={`flex-1 py-2 px-3 border rounded-lg transition-all text-center ${
                      targetAudience === 'Incomplete' 
                        ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold' 
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 font-semibold'
                    }`}
                  >
                    Pending Profiles ({totalIncompleteCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetAudience('All')}
                    className={`flex-1 py-2 px-3 border rounded-lg transition-all text-center ${
                      targetAudience === 'All' 
                        ? 'bg-emerald-50 text-[#1e4620] border-emerald-300 font-bold' 
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 font-semibold'
                    }`}
                  >
                    All active Alumni ({alumniList.length})
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
                  placeholder="Insert coordinates of quarterly warning or friendly reminders..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-[#1e4620] leading-relaxed text-slate-700 font-medium font-sans"
                />
              </div>
            </div>

            {/* Silip o preview sa listahan ng mga makakatanggap ng paalala */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase">
                Notice Queue Preview ({targetAudience === 'Incomplete' ? totalIncompleteCount : alumniList.length} recipients):
              </span>
              <div className="max-h-24 overflow-y-auto border border-slate-100 rounded-lg bg-slate-50 p-2.5 divide-y text-[10px] font-bold text-slate-600 space-y-1">
                {(targetAudience === 'Incomplete' ? incompleteAlumni : alumniList).map(al => (
                  <div key={al.studentId} className="py-1 flex justify-between">
                    <span>{al.firstName} {al.lastName} ({al.studentId})</span>
                    <span className={al.profileCompleteness < 80 ? "text-amber-800" : "text-emerald-800"}>
                      {al.profileCompleteness}% Completion
                    </span>
                  </div>
                ))}
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
                  <Send className="w-3.5 h-3.5" /> Broadcast Message update to {targetAudience === 'Incomplete' ? totalIncompleteCount : alumniList.length} Alumni
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
              <label className="block text-slate-500 mb-1">Target Email Coordinates</label>
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

    </div>
  );
}
