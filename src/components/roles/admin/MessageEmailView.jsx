import React, { useState } from 'react';
import { Mail, Check, Send, RefreshCw, Eye, Sparkles, AlertCircle, Users, CheckCircle2 } from 'lucide-react';

const BROADCAST_TEMPLATES = [
  {
    id: 'tracer-audit',
    name: 'Quarterly Tracer Study Update',
    subject: 'Quarterly Graduate Profile & Tracer Study Update Reminder',
    body: `Hello {name},

This is a quarterly administrative reminder from the Batanes State College Administration.

Under Commission on Higher Education (CHED) Memorandum Orders, all BSC alumni are requested to immediately audit and update their active employment details.

Kindly log into your graduate portal, navigate to the active tracer study tab, and complete any pending questionnaires. This plays a massive role in institutional auditing.

Respectfully,
Office of Administrative Affairs
Batanes State College`
  },
  {
    id: 'profile-incomplete',
    name: 'Urgent Profile Completion',
    subject: 'URGENT: Complete your BSC Alumni Profile Profile',
    body: `Hello {name},

Our records indicate that your graduate profile completeness is currently below 80%. 

To ensure you continue receiving institutional announcements, job placement notices, and verification services, please update your record at your earliest convenience.

Simply log in, review your education and work history tabs, and save the changes.

Thank you,
BSC Alumni Relations Office`
  },
  {
    id: 'job-portal',
    name: 'New Careers & Job Vacancies',
    subject: 'New Employment Opportunities Await - BSC Portal',
    body: `Hello {name},

Exciting news! Several of our partner industries have recently posted new job vacancies matching your degree program.

Log into the BSC CareerPath Tracer Portal now and explore the "Job Vacancies" tab to apply directly.

Best regards,
BSC Career Placement Bureau`
  }
];

export default function MessageEmailView({ alumniList = [], onSendReminders }) {
  const incompleteAlumni = alumniList.filter(al => al.profileCompleteness < 80);
  const totalIncompleteCount = incompleteAlumni.length;

  const [targetAudience, setTargetAudience] = useState('Incomplete');
  const [selectedTemplate, setSelectedTemplate] = useState('tracer-audit');
  const [customSubject, setCustomSubject] = useState(BROADCAST_TEMPLATES[0].subject);
  const [customBody, setCustomBody] = useState(BROADCAST_TEMPLATES[0].body);

  const [isSending, setIsSending] = useState(false);
  const [showStatus, setShowStatus] = useState('');

  const listToTarget = targetAudience === 'Incomplete' ? incompleteAlumni : alumniList;

  const handleTemplateChange = (templateId) => {
    setSelectedTemplate(templateId);
    const template = BROADCAST_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setCustomSubject(template.subject);
      setCustomBody(template.body);
    }
  };

  const handleBatchDispatch = async () => {
    if (listToTarget.length === 0) {
      alert('The target audience queue is empty!');
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
      try {
        await onSendReminders(targetIds, customSubject.trim(), customBody.trim());
        setIsSending(false);
        setShowStatus(`SUCCESS! Customized update dispatch successfully blasted to ${targetIds.length} alumni profiles.`);
        setTimeout(() => setShowStatus(''), 5000);
      } catch (err) {
        setIsSending(false);
        setShowStatus('Failed to send reminders. Please check your system configuration.');
      }
    }, 1800);
  };

  // Live preview mockup content replacement (using first recipient or a placeholder)
  const previewRecipient = listToTarget[0] ? `${listToTarget[0].firstName} ${listToTarget[0].lastName}` : 'Juan Dela Cruz';
  const previewText = customBody.replace(/{name}/g, previewRecipient);

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900 to-[#1e4620] p-6 rounded-2xl text-white shadow-sm border border-emerald-950/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-white/10 rounded-lg text-emerald-300">
              <Mail className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">Communications &amp; Email Broadcaster</h2>
          </div>
          <p className="text-xs text-emerald-100/80 font-medium">
            Compose and blast customized email notifications, tracer study invites, and profile audits to Batanes State College graduates.
          </p>
        </div>
        <div className="flex gap-4 text-xs font-semibold text-white/90">
          <div className="bg-white/10 rounded-xl px-4 py-2 text-center border border-white/5">
            <span className="block text-lg font-bold text-amber-300">{incompleteAlumni.length}</span>
            <span className="text-[10px] text-emerald-200">Pending Profiles</span>
          </div>
          <div className="bg-white/10 rounded-xl px-4 py-2 text-center border border-white/5">
            <span className="block text-lg font-bold text-emerald-300">{alumniList.length}</span>
            <span className="text-[10px] text-emerald-200">Total Alumni</span>
          </div>
        </div>
      </div>

      {/* Toast Notification Alert */}
      {showStatus && (
        <div role="alert" className="p-4 bg-emerald-50 text-emerald-950 border border-emerald-250 rounded-xl text-xs font-bold flex items-center gap-3 shadow-xs animate-fade-in">
          <span className="p-1.5 bg-emerald-700 text-white rounded-full">
            <Check className="w-4 h-4" />
          </span>
          <div>
            <p className="font-extrabold text-emerald-900">Broadcast Operation Complete</p>
            <p className="text-[11px] font-semibold text-emerald-800 mt-0.5">{showStatus}</p>
          </div>
        </div>
      )}

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Col: Composer & Target Scoping */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block font-sans">
                1. Target Recipient &amp; Template Configuration
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                <Users className="w-3.5 h-3.5" /> Direct SMTP Relay
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Audience Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500">Target Recipient Audience</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetAudience('Incomplete')}
                    className={`flex-1 py-2 px-3 border rounded-xl transition-all text-xs text-center font-sans ${
                      targetAudience === 'Incomplete' 
                        ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold' 
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 font-semibold'
                    }`}
                  >
                    Incomplete Profiles ({totalIncompleteCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetAudience('All')}
                    className={`flex-1 py-2 px-3 border rounded-xl transition-all text-xs text-center font-sans ${
                      targetAudience === 'All' 
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold' 
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 font-semibold'
                    }`}
                  >
                    All Alumni ({alumniList.length})
                  </button>
                </div>
              </div>

              {/* Template Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500">Quick Message Templates</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-700 focus:ring-1 focus:ring-emerald-700 focus:bg-white transition"
                >
                  {BROADCAST_TEMPLATES.map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.id}>
                      {tmpl.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {/* Subject Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500">Email Standard Subject</label>
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="Insert Subject line"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-1 focus:ring-emerald-800 font-sans font-bold text-slate-800 text-xs transition focus:bg-white"
                />
              </div>

              {/* Body Input */}
              <div className="space-y-1">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-500">
                    Message Body Template
                  </label>
                  <span className="text-[10px] bg-slate-100 text-emerald-900 px-2 py-0.5 rounded font-mono font-bold">
                    Use {"{name}"} for auto-personalization
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  placeholder="Insert details of notification broadcast..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-1 focus:ring-emerald-800 text-slate-700 font-medium font-sans text-xs transition focus:bg-white leading-relaxed"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 border-t border-slate-50">
              <button
                onClick={handleBatchDispatch}
                disabled={isSending}
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-950 text-white font-extrabold text-xs rounded-xl transition uppercase flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-[0.99] disabled:opacity-55 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" /> Relaying broadcast update to SMTP pipeline...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Dispatch Broadcast to {listToTarget.length} Recipients
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Recipient Queue Preview & Live Rendering Frame */}
        <div className="space-y-6">
          
          {/* Live Mockup Sandbox */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 text-white space-y-4 relative overflow-hidden shadow-md">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Sparkles className="w-32 h-32 text-white" />
            </div>
            
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Live Sandbox Preview</span>
            </div>

            <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden text-[11px] text-slate-300">
              {/* Email Frame Header */}
              <div className="bg-slate-900/60 p-3 border-b border-slate-800/80 flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-white text-[10px]">BSC Alumni Relations Bureau</p>
                  <p className="text-[9px] text-slate-500">From: no-reply@bsc.edu.ph</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-[9px] text-emerald-400">
                  BSC
                </div>
              </div>

              {/* Email Standard Subject in Preview */}
              <div className="p-3 border-b border-slate-800/50 bg-slate-950">
                <p className="font-bold text-white"><span className="text-slate-500">Subject:</span> {customSubject}</p>
              </div>

              {/* Email Content Body */}
              <div className="p-4 space-y-3 font-sans min-h-48 whitespace-pre-wrap leading-relaxed text-slate-300">
                {previewText}
              </div>

              {/* Email Footer Button */}
              <div className="p-4 border-t border-slate-800 bg-slate-900/40 text-center">
                <a href="#tracer" onClick={e => e.preventDefault()} className="inline-block px-4 py-2 bg-emerald-700 hover:bg-emerald-600 font-extrabold text-[10px] text-white rounded-lg transition uppercase shadow-sm">
                  Complete Profile Survey
                </a>
                <p className="text-[9px] text-slate-600 mt-3 font-medium">Batanes State College &copy; 2026. This is a secure system dispatch.</p>
              </div>
            </div>
          </div>

          {/* Notice Queue Preview Card */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-5 space-y-3">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
              Recipient Queue ({listToTarget.length} rows):
            </span>
            <div className="max-h-56 overflow-y-auto border border-slate-100 rounded-xl bg-slate-50/80 p-3 divide-y text-[10px] font-semibold text-slate-600 space-y-1">
              {listToTarget.length === 0 ? (
                <div className="py-4 text-center text-slate-400 font-bold flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  No pending recipients found
                </div>
              ) : (
                listToTarget.map(al => (
                  <div key={al.studentId} className="py-2 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-700 block">{al.firstName} {al.lastName}</span>
                      <span className="text-slate-400 text-[9px] font-mono">{al.studentId}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      al.profileCompleteness < 80 
                        ? "bg-amber-50 text-amber-700 border border-amber-100" 
                        : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    }`}>
                      {al.profileCompleteness}% Complete
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
