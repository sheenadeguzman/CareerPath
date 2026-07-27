import React, { useState, useEffect } from 'react';
import { 
  Search, ChevronRight, User, Bell, Lock, HelpCircle, Info, 
  ArrowLeft, Check, Save, Camera, Mail, Eye, EyeOff
} from 'lucide-react';

const MOCK_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120'
];

export default function SettingsView({ activeUser, setActiveUser }) {
  // Navigation stack state
  const [currentView, setCurrentView] = useState('main');
  const [searchQuery, setSearchQuery] = useState('');

  // Saving states & Hide/Show Toggles
  const [isSaving, setIsSaving] = useState(false);
  const [showStatus, setShowStatus] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  // Help & Support Ticket State
  const [supportTicket, setSupportTicket] = useState({ subject: '', message: '' });

  // Initial State Load from LocalStorage (Universal Settings Persistence)
  const [profileForm, setProfileForm] = useState(() => {
    return {
      name: localStorage.getItem('careerpath_name') || activeUser?.name || 'Juan Dela Cruz',
      email: localStorage.getItem('careerpath_email') || activeUser?.email || 'user@bsc.edu.ph',
      phone: localStorage.getItem('careerpath_phone') || '+63 912 345 6789',
      timezone: 'Asia/Manila (GMT+8)',
      avatar: localStorage.getItem('careerpath_avatar') || activeUser?.avatar || MOCK_AVATARS[0],
      fontSize: localStorage.getItem('careerpath_font_size') || 'Normal'
    };
  });

  const [passwordForm, setPasswordForm] = useState(() => {
    return {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
      securityQuestion: localStorage.getItem('careerpath_security_question') || 'school',
      securityAnswer: localStorage.getItem('careerpath_security_answer') || ''
    };
  });

  const [notifyPrefs, setNotifyPrefs] = useState(() => {
    return {
      emailAlerts: localStorage.getItem('careerpath_notify_email') !== 'false',
      jobVacancies: localStorage.getItem('careerpath_notify_jobs') !== 'false',
      surveyInvites: localStorage.getItem('careerpath_notify_surveys') !== 'false',
      digestFrequency: localStorage.getItem('careerpath_notify_digest') || 'Daily'
    };
  });

  // Apply Font Size Scaling on mount and updates
  useEffect(() => {
    const size = profileForm.fontSize;
    localStorage.setItem('careerpath_font_size', size);
    
    if (size === 'Small') {
      document.documentElement.style.fontSize = '14px';
    } else if (size === 'Large') {
      document.documentElement.style.fontSize = '18px';
    } else if (size === 'Extra Large') {
      document.documentElement.style.fontSize = '20px';
    } else {
      document.documentElement.style.fontSize = '16px'; // Normal
    }
  }, [profileForm.fontSize]);

  // Password strength calculator
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-700' };
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
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);

    localStorage.setItem('careerpath_name', profileForm.name);
    localStorage.setItem('careerpath_email', profileForm.email);
    localStorage.setItem('careerpath_phone', profileForm.phone);
    localStorage.setItem('careerpath_avatar', profileForm.avatar);
    localStorage.setItem('careerpath_font_size', profileForm.fontSize);

    if (setActiveUser && activeUser) {
      const updatedUser = { 
        ...activeUser, 
        name: profileForm.name, 
        email: profileForm.email, 
        avatar: profileForm.avatar 
      };
      setActiveUser(updatedUser);
      sessionStorage.setItem('careerpath_user', JSON.stringify(updatedUser));
    }

    setTimeout(() => {
      setIsSaving(false);
      setShowStatus('Profile details updated successfully!');
      setTimeout(() => setShowStatus(''), 4500);
      setCurrentView('main');
    }, 1000);
  };

  const handleSecuritySubmit = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword && passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New password and confirm password fields do not match!");
      return;
    }
    setIsSaving(true);
    
    localStorage.setItem('careerpath_security_question', passwordForm.securityQuestion);
    localStorage.setItem('careerpath_security_answer', passwordForm.securityAnswer);

    setTimeout(() => {
      setIsSaving(false);
      setShowStatus('Security password and recovery question updated!');
      setPasswordForm(prev => ({ ...prev, oldPassword: '', newPassword: '', confirmPassword: '' }));
      setTimeout(() => setShowStatus(''), 4500);
      setCurrentView('main');
    }, 1000);
  };

  const handleNotificationsSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);

    localStorage.setItem('careerpath_notify_email', notifyPrefs.emailAlerts ? 'true' : 'false');
    localStorage.setItem('careerpath_notify_jobs', notifyPrefs.jobVacancies ? 'true' : 'false');
    localStorage.setItem('careerpath_notify_surveys', notifyPrefs.surveyInvites ? 'true' : 'false');
    localStorage.setItem('careerpath_notify_digest', notifyPrefs.digestFrequency);

    setTimeout(() => {
      setIsSaving(false);
      setShowStatus('Notifications rules saved successfully!');
      setTimeout(() => setShowStatus(''), 4500);
      setCurrentView('main');
    }, 1000);
  };

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowStatus('Support ticket queued successfully.');
      setSupportTicket({ subject: '', message: '' });
      setTimeout(() => setShowStatus(''), 4500);
      setCurrentView('main');
    }, 1000);
  };

  const handleResetDefaults = () => {
    if (confirm("Are you sure you want to reset all settings to defaults? This will clear all local customizations.")) {
      localStorage.removeItem('careerpath_dark_mode');
      localStorage.removeItem('careerpath_font_size');
      localStorage.removeItem('careerpath_name');
      localStorage.removeItem('careerpath_email');
      localStorage.removeItem('careerpath_phone');
      localStorage.removeItem('careerpath_avatar');
      localStorage.removeItem('careerpath_compact_sidebar');
      localStorage.removeItem('careerpath_color_accent');
      document.documentElement.classList.remove('dark');
      window.location.reload();
    }
  };

  // Search filter list definitions
  const menuItems = [
    { id: 'account', label: 'Account', icon: <User className="w-5 h-5 text-slate-400" />, keywords: 'profile name email avatar phone contact font size' },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5 text-slate-400" />, keywords: 'alerts email job surveys digests push messages' },
    { id: 'security', label: 'Privacy & Security', icon: <Lock className="w-5 h-5 text-slate-400" />, keywords: 'password lock sessions questions delete recovery safety reset defaults' },
    { id: 'help', label: 'Help and Support', icon: <HelpCircle className="w-5 h-5 text-slate-400" />, keywords: 'tickets admin support contact website issues bugs help' },
    { id: 'about', label: 'About', icon: <Info className="w-5 h-5 text-slate-400" />, keywords: 'version copyright information build tracer details developer' }
  ];

  const filteredMenuItems = menuItems.filter(item => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return item.label.toLowerCase().includes(q) || item.keywords.includes(q);
  });

  return (
    <div className="max-w-xl mx-auto font-sans text-white transition-colors duration-300">
      
      {/* Toast Alert Indicator */}
      {showStatus && (
        <div role="alert" className="mb-4 p-4 bg-emerald-950/80 text-emerald-200 border border-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-lg animate-fade-in z-25">
          <span className="p-1 bg-emerald-900 text-emerald-100 rounded-full"><Check className="w-4 h-4 text-emerald-300" /></span>
          <div>
            <p className="font-extrabold text-emerald-100">Success</p>
            <p className="text-[11px] font-semibold text-emerald-300 mt-0.5">{showStatus}</p>
          </div>
        </div>
      )}

      {/* Main Settings List View */}
      {currentView === 'main' && (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
          {/* Header Title block */}
          <div className="p-6 text-center border-b border-slate-800 relative">
            <h2 className="text-lg font-extrabold tracking-tight text-white">Settings</h2>
          </div>

          {/* Settings Search bar */}
          <div className="p-4 bg-slate-950/50 border-b border-slate-800">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a setting..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-2xl text-xs font-bold focus:ring-1 focus:ring-white focus:border-slate-500 text-white transition placeholder-slate-500"
              />
            </div>
          </div>

          {/* List items block */}
          <div className="divide-y divide-slate-800">
            {filteredMenuItems.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-bold text-xs">
                No matching settings found.
              </div>
            ) : (
              filteredMenuItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentView(item.id)}
                  className="w-full flex items-center justify-between p-4.5 hover:bg-slate-800/60 transition cursor-pointer select-none text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="p-2 bg-slate-800 rounded-xl text-slate-300">{item.icon}</span>
                    <span className="text-xs font-extrabold text-slate-200 tracking-wide">{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW: Account details */}
      {currentView === 'account' && (
        <form onSubmit={handleProfileSubmit} className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center gap-3">
            <button type="button" onClick={() => setCurrentView('main')} className="p-1 hover:bg-slate-800 rounded-lg text-slate-300 transition cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h3 className="text-sm font-extrabold text-white">Account</h3>
          </div>

          <div className="p-6 space-y-5">
            {/* Avatar block */}
            <div className="text-center space-y-3 relative">
              <div className="relative w-20 h-20 mx-auto">
                <img src={profileForm.avatar} alt="avatar" className="w-20 h-20 rounded-full object-cover border border-slate-700 shadow-sm" />
                <button
                  type="button"
                  onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                  className="absolute bottom-0 right-0 p-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-full border-2 border-slate-900 shadow-sm cursor-pointer transition"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {showAvatarSelector && (
                <div className="absolute top-20 left-0 right-0 mx-auto w-44 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-2 z-10 grid grid-cols-2 gap-1.5 animate-fade-in">
                  {MOCK_AVATARS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setProfileForm(prev => ({ ...prev, avatar: av }));
                        setShowAvatarSelector(false);
                      }}
                      className="border border-slate-700 rounded-xl overflow-hidden hover:border-slate-500 transition cursor-pointer focus:outline-none"
                    >
                      <img src={av} alt="avatar option" className="w-full h-11 object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Inputs list */}
            <div className="space-y-4 text-xs font-semibold text-slate-300">
              <div className="space-y-1">
                <label className="text-slate-400 block font-bold">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:ring-1 focus:ring-white focus:bg-slate-900 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block font-bold">Email Address</label>
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:ring-1 focus:ring-white focus:bg-slate-900 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block font-bold">Phone Number</label>
                <input
                  type="text"
                  required
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:ring-1 focus:ring-white focus:bg-slate-900 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block font-bold">Text Scaling / Font Size</label>
                <select
                  value={profileForm.fontSize}
                  onChange={(e) => setProfileForm({...profileForm, fontSize: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:ring-1 focus:ring-white"
                >
                  <option value="Small" className="bg-slate-900">Small (Compact)</option>
                  <option value="Normal" className="bg-slate-900">Normal (Default)</option>
                  <option value="Large" className="bg-slate-900">Large</option>
                  <option value="Extra Large" className="bg-slate-900">Extra Large (High Visibility)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block font-bold">System Role</label>
                <input
                  type="text"
                  disabled
                  value={activeUser?.role || 'Guest'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-500 font-bold cursor-not-allowed select-none"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-950/50 border-t border-slate-800 flex justify-end">
            <button type="submit" className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow">
              <Save className="w-3.5 h-3.5" /> Save Changes
            </button>
          </div>
        </form>
      )}

      {/* VIEW: Notifications */}
      {currentView === 'notifications' && (
        <form onSubmit={handleNotificationsSubmit} className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center gap-3">
            <button type="button" onClick={() => setCurrentView('main')} className="p-1 hover:bg-slate-800 rounded-lg text-slate-300 transition cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h3 className="text-sm font-extrabold text-white">Notifications</h3>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-3.5 text-xs font-semibold text-slate-300">
              
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-800">
                <div className="max-w-[80%]">
                  <span className="block font-bold text-white">Email Alerts</span>
                  <span className="text-[10px] text-slate-400 leading-relaxed block mt-0.5">Receive immediate SMTP emails regarding credential assignments or announcements.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifyPrefs({ ...notifyPrefs, emailAlerts: !notifyPrefs.emailAlerts })}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                    notifyPrefs.emailAlerts ? 'bg-emerald-600' : 'bg-slate-700'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    notifyPrefs.emailAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-800">
                <div className="max-w-[80%]">
                  <span className="block font-bold text-white">Job Matching Updates</span>
                  <span className="text-[10px] text-slate-400 leading-relaxed block mt-0.5">Get notified instantly when partner employers post vacancies matching your core skills.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifyPrefs({ ...notifyPrefs, jobVacancies: !notifyPrefs.jobVacancies })}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                    notifyPrefs.jobVacancies ? 'bg-emerald-600' : 'bg-slate-700'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    notifyPrefs.jobVacancies ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-800">
                <div className="max-w-[80%]">
                  <span className="block font-bold text-white">Tracer Surveys</span>
                  <span className="text-[10px] text-slate-400 leading-relaxed block mt-0.5">Receive alert cues when new tracer studies or feedback surveys are deployed.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifyPrefs({ ...notifyPrefs, surveyInvites: !notifyPrefs.surveyInvites })}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                    notifyPrefs.surveyInvites ? 'bg-emerald-600' : 'bg-slate-700'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    notifyPrefs.surveyInvites ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="block font-bold text-white">Digest Summary Schedule</span>
                  <span className="text-[10px] text-slate-400 leading-relaxed block mt-0.5">Choose how often notifications are compiled and sent.</span>
                </div>
                <select
                  value={notifyPrefs.digestFrequency}
                  onChange={(e) => setNotifyPrefs({...notifyPrefs, digestFrequency: e.target.value})}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-2 font-bold text-white text-xs focus:ring-1 focus:ring-white cursor-pointer"
                >
                  <option value="Instant" className="bg-slate-900">Instant</option>
                  <option value="Daily" className="bg-slate-900">Daily Summary</option>
                  <option value="Weekly" className="bg-slate-900">Weekly Summary</option>
                  <option value="Never" className="bg-slate-900">Unsubscribe</option>
                </select>
              </div>

            </div>
          </div>

          <div className="p-4 bg-slate-950/50 border-t border-slate-800 flex justify-end">
            <button type="submit" className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow">
              <Save className="w-3.5 h-3.5" /> Save Alerts
            </button>
          </div>
        </form>
      )}

      {/* VIEW: Privacy & Security */}
      {currentView === 'security' && (
        <form onSubmit={handleSecuritySubmit} className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center gap-3">
            <button type="button" onClick={() => setCurrentView('main')} className="p-1 hover:bg-slate-800 rounded-lg text-slate-300 transition cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h3 className="text-sm font-extrabold text-white">Privacy &amp; Security</h3>
          </div>

          <div className="p-6 space-y-6">
            
            {/* Password edit inputs */}
            <div className="space-y-4 text-xs font-semibold text-slate-300">
              <div className="space-y-1 relative">
                <label className="text-slate-400 block font-bold">Current Account Password</label>
                <div className="relative">
                  <input
                    type={showOldPass ? 'text' : 'password'}
                    required
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:ring-1 focus:ring-white focus:bg-slate-900 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showOldPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 relative">
                  <label className="text-slate-400 block font-bold">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:ring-1 focus:ring-white focus:bg-slate-900 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  
                  {passwordForm.newPassword && (
                    <div className="pt-2 space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-slate-400">Password Strength:</span>
                        <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-extrabold ${
                          strength.score <= 1 ? 'text-red-300 bg-red-950' :
                          strength.score === 2 ? 'text-amber-300 bg-amber-950' :
                          strength.score === 3 ? 'text-sky-300 bg-sky-950' :
                          'text-emerald-300 bg-emerald-950'
                        }`}>{strength.label}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-300 ${strength.color}`} style={{ width: `${(strength.score + 1) * 20}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 block font-bold">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:ring-1 focus:ring-white focus:bg-slate-900 transition"
                  />
                </div>
              </div>
            </div>

            {/* Recovery security question */}
            <div className="p-4.5 bg-slate-800/50 border border-slate-800 rounded-2xl space-y-3.5 text-xs font-semibold text-slate-300">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Credentials Recovery Config</span>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-slate-400 block font-bold">Recovery Question Selection</label>
                  <select
                    value={passwordForm.securityQuestion}
                    onChange={(e) => setPasswordForm({...passwordForm, securityQuestion: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 font-bold text-white"
                  >
                    <option value="school" className="bg-slate-900">What elementary school did you attend?</option>
                    <option value="pet" className="bg-slate-900">What was the name of your first childhood pet?</option>
                    <option value="city" className="bg-slate-900">In what city or municipality were you born?</option>
                    <option value="mother" className="bg-slate-900">What is your mother's maiden name?</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 block font-bold">Answer Verification Key</label>
                  <input
                    type="text"
                    value={passwordForm.securityAnswer}
                    onChange={(e) => setPasswordForm({...passwordForm, securityAnswer: e.target.value})}
                    placeholder="Type recovery key response..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:ring-1 focus:ring-white focus:bg-slate-900 placeholder-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* Reset Defaults button */}
            <div className="p-4 bg-rose-950/20 border border-rose-900/50 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
              <div>
                <span className="font-extrabold text-white block">Reset settings database</span>
                <span className="text-[10px] text-slate-400 leading-relaxed block">Restore original font scaling and clear local theme profiles.</span>
              </div>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] rounded-lg transition uppercase cursor-pointer shrink-0 shadow"
              >
                Reset
              </button>
            </div>

          </div>

          <div className="p-4 bg-slate-950/50 border-t border-slate-800 flex justify-end">
            <button type="submit" className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow">
              <Save className="w-3.5 h-3.5" /> Save Security
            </button>
          </div>
        </form>
      )}

      {/* VIEW: Help & Support */}
      {currentView === 'help' && (
        <form onSubmit={handleSupportSubmit} className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center gap-3">
            <button type="button" onClick={() => setCurrentView('main')} className="p-1 hover:bg-slate-800 rounded-lg text-slate-300 transition cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h3 className="text-sm font-extrabold text-white">Help and Support</h3>
          </div>

          <div className="p-6 space-y-5 text-xs">
            <div className="p-4 bg-slate-800/50 border border-slate-800 rounded-2xl space-y-2 text-slate-300 font-semibold leading-relaxed">
              <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider block">BSC System Directory Links</span>
              <p>For tracer corrections, password resets, or official student evaluations, contact the IT Bureau.</p>
              <div className="pt-2 text-[10px] font-bold text-slate-400 space-y-1 font-mono">
                <p>Website: <a href="https://bsc.edu.ph" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">www.bsc.edu.ph</a></p>
                <p>Helpdesk: support@bsc.edu.ph</p>
                <p>Registrar: (+63) 987 654 3210</p>
              </div>
            </div>

            <div className="space-y-4 font-semibold text-slate-300">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Send Quick Support Ticket</span>
              
              <div className="space-y-1">
                <label className="text-slate-400 block font-bold">Ticket Subject Summary</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tracer completion bar error"
                  value={supportTicket.subject}
                  onChange={(e) => setSupportTicket({...supportTicket, subject: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:ring-1 focus:ring-white focus:bg-slate-900 placeholder-slate-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block font-bold">Description message details</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain the issues encountered in details..."
                  value={supportTicket.message}
                  onChange={(e) => setSupportTicket({...supportTicket, message: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:ring-1 focus:ring-white focus:bg-slate-900 leading-relaxed placeholder-slate-500"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-950/50 border-t border-slate-800 flex justify-end">
            <button type="submit" className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow">
              <Mail className="w-3.5 h-3.5" /> Submit Ticket
            </button>
          </div>
        </form>
      )}

      {/* VIEW: About */}
      {currentView === 'about' && (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden text-center">
          <div className="p-5 border-b border-slate-800 flex items-center gap-3">
            <button type="button" onClick={() => setCurrentView('main')} className="p-1 hover:bg-slate-800 rounded-lg text-slate-300 transition cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h3 className="text-sm font-extrabold text-white">About</h3>
          </div>

          <div className="p-8 space-y-5 text-slate-300 font-semibold text-xs">
            <div className="w-16 h-16 rounded-3xl bg-slate-800 flex items-center justify-center font-bold text-white text-xl mx-auto shadow-md border border-slate-700">
              BSC
            </div>

            <div className="space-y-1">
              <h4 className="font-extrabold text-white text-sm">BSC CareerPath Tracer Portal</h4>
              <p className="text-[10px] text-slate-400 font-bold font-mono">Version 2.4.0 (Stable Release)</p>
            </div>

            <p className="max-w-xs mx-auto leading-relaxed text-slate-400 font-medium">
              This system facilitates post-graduate tracking, curricular analytics, and job placement assistance under CHED directives for Batanes State College.
            </p>

            <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-400 font-bold space-y-0.5">
              <p>Batanes State College &copy; 2026</p>
              <p>Basco, Batanes, Philippines</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}