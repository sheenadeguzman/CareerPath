import React, { useState } from 'react';
import { 
  Search, ChevronRight, User, Bell, Eye, Lock, HelpCircle, Info, 
  ArrowLeft, Check, RefreshCw, Save, Smartphone, Monitor, Palette, 
  AlertTriangle, Camera, Mail, ShieldAlert
} from 'lucide-react';

const MOCK_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120'
];

export default function SettingsView({ activeUser }) {
  // Navigation stack state ('main', 'account', 'notifications', 'appearance', 'security', 'help', 'about')
  const [currentView, setCurrentView] = useState('main');
  const [searchQuery, setSearchQuery] = useState('');

  // Form & Toggle States
  const [isSaving, setIsSaving] = useState(false);
  const [showStatus, setShowStatus] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  // Help & Support Ticket State
  const [supportTicket, setSupportTicket] = useState({ subject: '', message: '' });

  // 1. Profile State
  const [profileForm, setProfileForm] = useState({
    name: activeUser?.name || 'Juan Dela Cruz',
    email: activeUser?.email || 'user@bsc.edu.ph',
    phone: activeUser?.phone || '+63 912 345 6789',
    language: 'English',
    timezone: 'Asia/Manila (GMT+8)',
    avatar: activeUser?.avatar || MOCK_AVATARS[0]
  });

  // 2. Security State
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    securityQuestion: 'school',
    securityAnswer: ''
  });

  // 3. Notifications State
  const [notifyPrefs, setNotifyPrefs] = useState({
    emailAlerts: true,
    jobVacancies: true,
    surveyInvites: true,
    digestFrequency: 'Daily'
  });

  // 4. Interface State
  const [themePrefs, setThemePrefs] = useState({
    darkMode: false,
    highContrast: false,
    compactSidebar: false,
    colorAccent: 'BSC Crimson'
  });

  // Search filter list definitions
  const menuItems = [
    { id: 'account', label: 'Account', icon: <User className="w-5 h-5 text-slate-500" />, keywords: 'profile name email avatar phone contact ivatan language' },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5 text-slate-500" />, keywords: 'alerts email job surveys digests push messages' },
    { id: 'appearance', label: 'Appearance', icon: <Eye className="w-5 h-5 text-slate-500" />, keywords: 'theme dark mode high contrast colors compact layout' },
    { id: 'security', label: 'Privacy & Security', icon: <Lock className="w-5 h-5 text-slate-500" />, keywords: 'password lock sessions 2fa questions delete recovery safety' },
    { id: 'help', label: 'Help and Support', icon: <HelpCircle className="w-5 h-5 text-slate-500" />, keywords: 'tickets admin support contact website issues bugs help' },
    { id: 'about', label: 'About', icon: <Info className="w-5 h-5 text-slate-500" />, keywords: 'version copyright information build tracer details developer' }
  ];

  const filteredMenuItems = menuItems.filter(item => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return item.label.toLowerCase().includes(q) || item.keywords.includes(q);
  });

  // Password strength logic
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    
    if (score <= 1) return { score, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score, label: 'Good', color: 'bg-sky-500' };
    return { score, label: 'Strong', color: 'bg-emerald-500' };
  };
  const strength = getPasswordStrength(passwordForm.newPassword);

  // Submit Operations
  const handleSaveAction = (e, sectionTitle) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowStatus(`${sectionTitle} settings updated successfully!`);
      setTimeout(() => setShowStatus(''), 4500);
      setCurrentView('main');
    }, 1200);
  };

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowStatus('Helpdesk ticket successfully queued. Support response will be sent to your email.');
      setSupportTicket({ subject: '', message: '' });
      setTimeout(() => setShowStatus(''), 4500);
      setCurrentView('main');
    }, 1200);
  };

  const handleDeactivateAccount = () => {
    if (confirm("DANGER: Are you absolutely sure you want to deactivate your account?\n\nThis will instantly revoke your credentials and log you out. To restore it later, you must verify your identity with the administration.")) {
      alert("Account deactivation requested. Session will now close.");
    }
  };

  return (
    <div className="max-w-xl mx-auto font-sans text-slate-800">
      
      {/* Toast Alert Indicator */}
      {showStatus && (
        <div role="alert" className="mb-4 p-4 bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-xs animate-fade-in">
          <span className="p-1 bg-emerald-700 text-white rounded-full"><Check className="w-4 h-4" /></span>
          <div>
            <p className="font-extrabold text-emerald-900">Success</p>
            <p className="text-[11px] font-semibold text-emerald-800 mt-0.5">{showStatus}</p>
          </div>
        </div>
      )}

      {/* Main Settings List View */}
      {currentView === 'main' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden">
          {/* Header Title block */}
          <div className="p-6 text-center border-b border-slate-50 relative">
            <h2 className="text-lg font-extrabold tracking-tight">Settings</h2>
          </div>

          {/* Settings Search bar */}
          <div className="p-4 bg-slate-50/50 border-b border-slate-100">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a setting..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-1 focus:ring-slate-900 focus:border-slate-350 text-slate-800 transition"
              />
            </div>
          </div>

          {/* List items block */}
          <div className="divide-y divide-slate-50">
            {filteredMenuItems.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-bold text-xs">
                No matching settings found.
              </div>
            ) : (
              filteredMenuItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentView(item.id)}
                  className="w-full flex items-center justify-between p-4.5 hover:bg-slate-50/70 transition cursor-pointer select-none text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="p-2 bg-slate-100 rounded-xl text-slate-700">{item.icon}</span>
                    <span className="text-xs font-extrabold text-slate-700 tracking-wide">{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-350" />
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW: Account details */}
      {currentView === 'account' && (
        <form onSubmit={(e) => handleSaveAction(e, 'Account Profile')} className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden">
          <div className="p-5 border-b border-slate-50 flex items-center gap-3">
            <button type="button" onClick={() => setCurrentView('main')} className="p-1 hover:bg-slate-100 rounded-lg text-slate-550 transition cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-extrabold text-slate-800">Account</h3>
          </div>

          <div className="p-6 space-y-5">
            {/* Avatar block */}
            <div className="text-center space-y-3 relative">
              <div className="relative w-20 h-20 mx-auto">
                <img src={profileForm.avatar} alt="avatar" className="w-20 h-20 rounded-full object-cover border border-slate-200 shadow-xs" />
                <button
                  type="button"
                  onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                  className="absolute bottom-0 right-0 p-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-full border-2 border-white shadow-sm cursor-pointer transition"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {showAvatarSelector && (
                <div className="absolute top-20 left-0 right-0 mx-auto w-44 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-10 grid grid-cols-2 gap-1.5 animate-fade-in">
                  {MOCK_AVATARS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setProfileForm({ ...profileForm, avatar: av });
                        setShowAvatarSelector(false);
                      }}
                      className="border border-slate-100 rounded-xl overflow-hidden hover:border-slate-400 transition cursor-pointer focus:outline-none"
                    >
                      <img src={av} alt="avatar pic option" className="w-full h-11 object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Inputs list */}
            <div className="space-y-4 text-xs font-semibold text-slate-650">
              <div className="space-y-1">
                <label className="text-slate-450 block font-bold">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900 focus:bg-white transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-450 block font-bold">Email Address</label>
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900 focus:bg-white transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-450 block font-bold">Phone Number</label>
                <input
                  type="text"
                  required
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900 focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-455 block font-bold">Preferred Language</label>
                  <select
                    value={profileForm.language}
                    onChange={(e) => setProfileForm({...profileForm, language: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="English">English</option>
                    <option value="Tagalog">Filipino / Tagalog</option>
                    <option value="Ivatan">Ivatán (Batanes)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-455 block font-bold">System Role</label>
                  <input
                    type="text"
                    disabled
                    value={activeUser?.role || 'Guest'}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-slate-400 font-bold cursor-not-allowed select-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-end">
            <button type="submit" className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5">
              <Save className="w-3.5 h-3.5" /> Save Changes
            </button>
          </div>
        </form>
      )}

      {/* VIEW: Notifications */}
      {currentView === 'notifications' && (
        <form onSubmit={(e) => handleSaveAction(e, 'Notification Preferences')} className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden">
          <div className="p-5 border-b border-slate-50 flex items-center gap-3">
            <button type="button" onClick={() => setCurrentView('main')} className="p-1 hover:bg-slate-100 rounded-lg text-slate-550 transition cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-extrabold text-slate-800">Notifications</h3>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-3.5 text-xs font-semibold text-slate-700">
              
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="max-w-[80%]">
                  <span className="block font-bold text-slate-800">Email Alerts</span>
                  <span className="text-[10px] text-slate-400 leading-relaxed block mt-0.5">Receive immediate SMTP emails regarding credential assignments or announcements.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyPrefs.emailAlerts}
                  onChange={(e) => setNotifyPrefs({...notifyPrefs, emailAlerts: e.target.checked})}
                  className="w-4.5 h-4.5 rounded text-slate-900 border-slate-350 focus:ring-slate-900 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="max-w-[80%]">
                  <span className="block font-bold text-slate-800">Job Matching Updates</span>
                  <span className="text-[10px] text-slate-400 leading-relaxed block mt-0.5">Get notified instantly when partner employers post vacancies matching your core skills.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyPrefs.jobVacancies}
                  onChange={(e) => setNotifyPrefs({...notifyPrefs, jobVacancies: e.target.checked})}
                  className="w-4.5 h-4.5 rounded text-slate-900 border-slate-350 focus:ring-slate-900 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="max-w-[80%]">
                  <span className="block font-bold text-slate-800">Tracer Surveys</span>
                  <span className="text-[10px] text-slate-400 leading-relaxed block mt-0.5">Receive alert cues when new tracer studies or feedback surveys are deployed.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyPrefs.surveyInvites}
                  onChange={(e) => setNotifyPrefs({...notifyPrefs, surveyInvites: e.target.checked})}
                  className="w-4.5 h-4.5 rounded text-slate-900 border-slate-350 focus:ring-slate-900 cursor-pointer"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                <div>
                  <span className="block font-bold text-slate-800">Digest Summary Schedule</span>
                  <span className="text-[10px] text-slate-400 leading-relaxed block mt-0.5">Choose how often notifications are compiled and sent.</span>
                </div>
                <select
                  value={notifyPrefs.digestFrequency}
                  onChange={(e) => setNotifyPrefs({...notifyPrefs, digestFrequency: e.target.value})}
                  className="bg-white border border-slate-200 rounded-xl p-2 font-bold text-slate-700 text-xs focus:ring-1 focus:ring-slate-900 cursor-pointer"
                >
                  <option value="Instant">Instant</option>
                  <option value="Daily">Daily Summary</option>
                  <option value="Weekly">Weekly Summary</option>
                  <option value="Never">Unsubscribe</option>
                </select>
              </div>

            </div>
          </div>

          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-end">
            <button type="submit" className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5">
              <Save className="w-3.5 h-3.5" /> Save Alerts
            </button>
          </div>
        </form>
      )}

      {/* VIEW: Appearance */}
      {currentView === 'appearance' && (
        <form onSubmit={(e) => handleSaveAction(e, 'Appearance')} className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden">
          <div className="p-5 border-b border-slate-50 flex items-center gap-3">
            <button type="button" onClick={() => setCurrentView('main')} className="p-1 hover:bg-slate-100 rounded-lg text-slate-550 transition cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-extrabold text-slate-800">Appearance</h3>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-3.5 text-xs font-semibold text-slate-700">
              
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="block font-bold text-slate-800">Dark Mode Interface</span>
                  <span className="text-[10px] text-slate-400 leading-relaxed block mt-0.5">Invert page layout brightness to ease eye straining in dark conditions.</span>
                </div>
                <input
                  type="checkbox"
                  checked={themePrefs.darkMode}
                  onChange={(e) => setThemePrefs({...themePrefs, darkMode: e.target.checked})}
                  className="w-4.5 h-4.5 rounded text-slate-900 border-slate-350 focus:ring-slate-900 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="block font-bold text-slate-800">High Contrast Layout</span>
                  <span className="text-[10px] text-slate-400 leading-relaxed block mt-0.5">Enhance color contrast parameters for low vision usability.</span>
                </div>
                <input
                  type="checkbox"
                  checked={themePrefs.highContrast}
                  onChange={(e) => setThemePrefs({...themePrefs, highContrast: e.target.checked})}
                  className="w-4.5 h-4.5 rounded text-slate-900 border-slate-350 focus:ring-slate-900 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="block font-bold text-slate-800">Compact Sidebar Menu</span>
                  <span className="text-[10px] text-slate-400 leading-relaxed block mt-0.5">Minimize the desktop navigation sidebar to display only icon layouts.</span>
                </div>
                <input
                  type="checkbox"
                  checked={themePrefs.compactSidebar}
                  onChange={(e) => setThemePrefs({...themePrefs, compactSidebar: e.target.checked})}
                  className="w-4.5 h-4.5 rounded text-slate-900 border-slate-350 focus:ring-slate-900 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="block font-bold text-slate-800">System Color Accent Theme</span>
                  <span className="text-[10px] text-slate-400 leading-relaxed block mt-0.5">Select a highlighting brand color for dashboard navigation links.</span>
                </div>
                <select
                  value={themePrefs.colorAccent}
                  onChange={(e) => setThemePrefs({...themePrefs, colorAccent: e.target.value})}
                  className="bg-white border border-slate-200 rounded-xl p-2 font-bold text-slate-700 text-xs focus:ring-1 focus:ring-slate-900 cursor-pointer"
                >
                  <option value="BSC Crimson">BSC Crimson</option>
                  <option value="BSC Forest Green">Forest Green</option>
                  <option value="Ocean Teal">Ocean Teal</option>
                  <option value="Slate Steel">Slate Steel</option>
                </select>
              </div>

            </div>
          </div>

          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-end">
            <button type="submit" className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5">
              <Save className="w-3.5 h-3.5" /> Save Theme
            </button>
          </div>
        </form>
      )}

      {/* VIEW: Privacy & Security */}
      {currentView === 'security' && (
        <form onSubmit={(e) => handleSaveAction(e, 'Privacy & Security')} className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden animate-fade-in">
          <div className="p-5 border-b border-slate-50 flex items-center gap-3">
            <button type="button" onClick={() => setCurrentView('main')} className="p-1 hover:bg-slate-100 rounded-lg text-slate-550 transition cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-extrabold text-slate-800">Privacy &amp; Security</h3>
          </div>

          <div className="p-6 space-y-6">
            
            {/* Password edit inputs */}
            <div className="space-y-4 text-xs font-semibold text-slate-650">
              <div className="space-y-1 relative">
                <label className="text-slate-450 block font-bold">Current Password</label>
                <div className="relative">
                  <input
                    type={showOldPass ? 'text' : 'password'}
                    required
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-9 py-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showOldPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 relative">
                  <label className="text-slate-455 block font-bold">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-9 py-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  
                  {passwordForm.newPassword && (
                    <div className="pt-2 space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-slate-400">Password Strength:</span>
                        <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-extrabold ${
                          strength.score <= 1 ? 'text-red-750 bg-red-50' :
                          strength.score === 2 ? 'text-amber-750 bg-amber-50' :
                          strength.score === 3 ? 'text-sky-750 bg-sky-50' :
                          'text-emerald-755 bg-emerald-50'
                        }`}>{strength.label}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-300 ${strength.color}`} style={{ width: `${(strength.score + 1) * 20}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-slate-455 block font-bold">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Recovery security question */}
            <div className="p-4.5 bg-slate-50 border border-slate-100 rounded-2xl space-y-3.5 text-xs font-semibold text-slate-700">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Credentials Recovery Config</span>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-slate-450 block font-bold">Recovery Question Selection</label>
                  <select
                    value={passwordForm.securityQuestion}
                    onChange={(e) => setPasswordForm({...passwordForm, securityQuestion: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 font-bold text-slate-700"
                  >
                    <option value="school">What elementary school did you attend?</option>
                    <option value="pet">What was the name of your first childhood pet?</option>
                    <option value="city">In what city or municipality were you born?</option>
                    <option value="mother">What is your mother's maiden name?</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-450 block font-bold">Answer Verification Key</label>
                  <input
                    type="text"
                    value={passwordForm.securityAnswer}
                    onChange={(e) => setPasswordForm({...passwordForm, securityAnswer: e.target.value})}
                    placeholder="Type recovery key response..."
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="p-4 bg-rose-50/40 border border-rose-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4 text-xs">
              <div className="space-y-0.5">
                <span className="font-extrabold text-slate-800 block">Deactivate Account Registry</span>
                <span className="text-[10px] text-slate-400 leading-relaxed block">Deactivate dashboard credentials. Restorations require administrative verify.</span>
              </div>
              <button
                type="button"
                onClick={handleDeactivateAccount}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] rounded-lg transition uppercase cursor-pointer"
              >
                Deactivate
              </button>
            </div>

          </div>

          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-end">
            <button type="submit" className="px-5 py-2 bg-slate-850 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5">
              <Save className="w-3.5 h-3.5" /> Save Security
            </button>
          </div>
        </form>
      )}

      {/* VIEW: Help & Support */}
      {currentView === 'help' && (
        <form onSubmit={handleSupportSubmit} className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden animate-fade-in">
          <div className="p-5 border-b border-slate-50 flex items-center gap-3">
            <button type="button" onClick={() => setCurrentView('main')} className="p-1 hover:bg-slate-100 rounded-lg text-slate-550 transition cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-extrabold text-slate-800">Help and Support</h3>
          </div>

          <div className="p-6 space-y-5 text-xs">
            {/* Support info details */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 text-slate-600 font-semibold leading-relaxed">
              <span className="text-[10px] text-[#1e4620] font-extrabold uppercase tracking-wider block">BSC System Directory Links</span>
              <p>For tracer corrections, password resets, or official student evaluations, contact the IT Bureau.</p>
              <div className="pt-2 text-[10px] font-bold text-slate-500 space-y-1 font-mono">
                <p>Website: <a href="https://bsc.edu.ph" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">www.bsc.edu.ph</a></p>
                <p>Helpdesk: support@bsc.edu.ph</p>
                <p>Registrar: (+63) 987 654 3210</p>
              </div>
            </div>

            {/* Quick Ticket form */}
            <div className="space-y-4 font-semibold text-slate-650">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Send Quick Support Ticket</span>
              
              <div className="space-y-1">
                <label className="text-slate-450 block font-bold">Ticket Subject Summary</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tracer completion bar error"
                  value={supportTicket.subject}
                  onChange={(e) => setSupportTicket({...supportTicket, subject: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-450 block font-bold">Description message details</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain the issues encountered in details..."
                  value={supportTicket.message}
                  onChange={(e) => setSupportTicket({...supportTicket, message: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:ring-1 focus:ring-slate-900 focus:bg-white leading-relaxed"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-end">
            <button type="submit" className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Submit Ticket
            </button>
          </div>
        </form>
      )}

      {/* VIEW: About */}
      {currentView === 'about' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden text-center">
          <div className="p-5 border-b border-slate-50 flex items-center gap-3">
            <button type="button" onClick={() => setCurrentView('main')} className="p-1 hover:bg-slate-100 rounded-lg text-slate-550 transition cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-extrabold text-slate-800">About Portal</h3>
          </div>

          <div className="p-8 space-y-5 text-slate-600 font-semibold text-xs">
            <div className="w-16 h-16 rounded-3xl bg-slate-900 flex items-center justify-center font-bold text-white text-xl mx-auto shadow-md">
              BSC
            </div>

            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-800 text-sm">BSC CareerPath Tracer Portal</h4>
              <p className="text-[10px] text-slate-400 font-bold font-mono">Version 2.4.0 (Stable Release)</p>
            </div>

            <p className="max-w-xs mx-auto leading-relaxed text-slate-500 font-medium">
              This system facilitates post-graduate tracking, curricular analytics, and job placement assistance under CHED directives for Batanes State College.
            </p>

            <div className="pt-4 border-t border-slate-50 text-[10px] text-slate-400 font-bold space-y-0.5">
              <p>Batanes State College &copy; 2026</p>
              <p>Basco, Batanes, Philippines</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
