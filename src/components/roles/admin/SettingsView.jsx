import React, { useState, useEffect } from 'react';
import { 
  Search, ChevronRight, User, Bell, Lock, HelpCircle, Info, 
  ArrowLeft, Check, RefreshCw, Save, Camera, Mail, Eye, EyeOff
} from 'lucide-react';

const MOCK_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120'
];

// Dictionary translations supporting English, Tagalog, and Ivatán (the local Batanes dialect)
const TRANSLATIONS = {
  English: {
    settings: 'Settings',
    searchPlaceholder: 'Search for a setting...',
    account: 'Account',
    notifications: 'Notifications',
    privacySecurity: 'Privacy & Security',
    helpSupport: 'Help and Support',
    about: 'About',
    noSettingsFound: 'No matching settings found.',
    saveChanges: 'Save Changes',
    saveAlerts: 'Save Alerts',
    saveSecurity: 'Save Security',
    fullName: 'Full Name',
    emailAddress: 'Email Address',
    phoneNumber: 'Phone Number',
    preferredLanguage: 'Preferred Language',
    systemRole: 'System Role',
    textScaling: 'Text Scaling / Font Size',
    emailAlerts: 'Email Alerts',
    jobVacancies: 'Job Matching Updates',
    surveyInvites: 'Tracer Surveys',
    digestFrequency: 'Digest Summary Schedule',
    currentPassword: 'Current Account Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm New Password',
    recoveryQuestion: 'Recovery Question Selection',
    recoveryAnswer: 'Answer Verification Key',
    deactivate: 'Deactivate Account Registry',
    dangerZone: 'Danger Zone',
    helpdeskTitle: 'BSC System Directory Links',
    ticketSubject: 'Ticket Subject Summary',
    ticketDescription: 'Description message details',
    submitTicket: 'Submit Ticket',
    aboutTitle: 'BSC CareerPath Tracer Portal'
  },
  Tagalog: {
    settings: 'Mga Setting',
    searchPlaceholder: 'Maghanap ng setting...',
    account: 'Akawnt',
    notifications: 'Mga Abiso',
    privacySecurity: 'Pribasya at Seguridad',
    helpSupport: 'Tulong at Suporta',
    about: 'Tungkol sa Portal',
    noSettingsFound: 'Walang nahanap na tugmang setting.',
    saveChanges: 'I-save ang mga Pagbabago',
    saveAlerts: 'I-save ang mga Abiso',
    saveSecurity: 'I-save ang Seguridad',
    fullName: 'Buong Pangalan',
    emailAddress: 'Email Address',
    phoneNumber: 'Numero ng Telepono',
    preferredLanguage: 'Gustong Wika',
    systemRole: 'Tungkulin sa System',
    textScaling: 'Laki ng Text / Font Size',
    emailAlerts: 'Mga Alerto sa Email',
    jobVacancies: 'Mga Update sa Trabaho',
    surveyInvites: 'Mga Survey sa Tracer',
    digestFrequency: 'Iskedyul ng Buod ng Abiso',
    currentPassword: 'Kasalukuyang Password ng Akawnt',
    newPassword: 'Bagong Password',
    confirmPassword: 'Kumpirmahin ang Bagong Password',
    recoveryQuestion: 'Pagpili ng Tanong sa Pagbawi',
    recoveryAnswer: 'Sagot para sa Pagbawi',
    deactivate: 'I-deactivate ang Akawnt',
    dangerZone: 'Panganib na Zone',
    helpdeskTitle: 'Mga Link ng BSC System Directory',
    ticketSubject: 'Buod ng Paksa ng Ticket',
    ticketDescription: 'Mga detalye ng mensahe ng ticket',
    submitTicket: 'Ipadala ang Ticket',
    aboutTitle: 'Tracer Portal ng BSC CareerPath'
  },
  Ivatan: {
    settings: 'Siting',
    searchPlaceholder: 'Manita sitsiting...',
    account: 'Akawnt',
    notifications: 'Pangabiso',
    privacySecurity: 'Karitruan kan Seguridad',
    helpSupport: 'Tadung kan Suporta',
    about: 'Mapanmo du Portal',
    noSettingsFound: 'Ara u sitsiting a kavano.',
    saveChanges: 'Ipachilay u chinaynaw',
    saveAlerts: 'Ipachilay u pangabiso',
    saveSecurity: 'Ipachilay u seguridad',
    fullName: 'Raray a Ngaran',
    emailAddress: 'Email Address',
    phoneNumber: 'Numero du Telepono',
    preferredLanguage: 'Piliyen a Chirin',
    systemRole: 'Trabaho du System',
    textScaling: 'Raya kan Letra / Font Size',
    emailAlerts: 'Pangabiso du Email',
    jobVacancies: 'Pangabiso du Trabaho',
    surveyInvites: 'Surbeys du Tracer',
    digestFrequency: 'Ora kan pangabiso digest',
    currentPassword: 'Paswad du Akawnt sichang',
    newPassword: 'Vayu a Paswad',
    confirmPassword: 'I-turi u vayu a paswad',
    recoveryQuestion: 'Turi u pachtutuhan a saludsod',
    recoveryAnswer: 'Turi u vatah a pachtutuhan',
    deactivate: 'Ipantak u akawnt sichang',
    dangerZone: 'Raya a Makatalo',
    helpdeskTitle: 'Ngarang du BSC System Directory',
    ticketSubject: 'Subject du ticket suporta',
    ticketDescription: 'Katutuhan u pakasisyatan du ticket',
    submitTicket: 'Ipa-naw u Ticket',
    aboutTitle: 'CareerPath Tracer Portal du BSC'
  }
};

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

  // Current Active Language dynamically updates layouts
  const [activeLanguage, setActiveLanguage] = useState(() => {
    return localStorage.getItem('careerpath_language') || 'English';
  });

  const text = TRANSLATIONS[activeLanguage] || TRANSLATIONS.English;

  // Initial State Load from LocalStorage (Universal Settings Persistence)
  const [profileForm, setProfileForm] = useState(() => {
    return {
      name: localStorage.getItem('careerpath_name') || activeUser?.name || 'Juan Dela Cruz',
      email: localStorage.getItem('careerpath_email') || activeUser?.email || 'user@bsc.edu.ph',
      phone: localStorage.getItem('careerpath_phone') || '+63 912 345 6789',
      language: localStorage.getItem('careerpath_language') || 'English',
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
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);

    // Save profile attributes to localStorage
    localStorage.setItem('careerpath_name', profileForm.name);
    localStorage.setItem('careerpath_email', profileForm.email);
    localStorage.setItem('careerpath_phone', profileForm.phone);
    localStorage.setItem('careerpath_language', profileForm.language);
    localStorage.setItem('careerpath_avatar', profileForm.avatar);
    localStorage.setItem('careerpath_font_size', profileForm.fontSize);

    // Apply active global language transition instantly
    setActiveLanguage(profileForm.language);

    // Call state setter update to modify layouts across Header and Sidebars
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
    }, 1200);
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
      setShowStatus('Security password and recovery questions updated!');
      setPasswordForm(prev => ({ ...prev, oldPassword: '', newPassword: '', confirmPassword: '' }));
      setTimeout(() => setShowStatus(''), 4500);
      setCurrentView('main');
    }, 1200);
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

  // Search filter list definitions (Appearance removed)
  const menuItems = [
    { id: 'account', label: text.account, icon: <User className="w-5 h-5 text-slate-500" />, keywords: 'profile name email avatar phone contact ivatan language font size' },
    { id: 'notifications', label: text.notifications, icon: <Bell className="w-5 h-5 text-slate-500" />, keywords: 'alerts email job surveys digests push messages' },
    { id: 'security', label: text.privacySecurity, icon: <Lock className="w-5 h-5 text-slate-500" />, keywords: 'password lock sessions questions delete recovery safety' },
    { id: 'help', label: text.helpSupport, icon: <HelpCircle className="w-5 h-5 text-slate-500" />, keywords: 'tickets admin support contact website issues bugs help' },
    { id: 'about', label: text.about, icon: <Info className="w-5 h-5 text-slate-500" />, keywords: 'version copyright information build tracer details developer' }
  ];

  const filteredMenuItems = menuItems.filter(item => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return item.label.toLowerCase().includes(q) || item.keywords.includes(q);
  });

  return (
    <div className="max-w-xl mx-auto font-sans text-slate-800 transition-colors">
      
      {/* Toast Alert Indicator */}
      {showStatus && (
        <div role="alert" className="mb-4 p-4 bg-emerald-50 text-emerald-950 border border-emerald-250 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-xs animate-fade-in z-20">
          <span className="p-1 bg-[#1e4620] text-emerald-50 rounded-full"><Check className="w-4 h-4 text-emerald-550" /></span>
          <div>
            <p className="font-extrabold text-emerald-900">Success</p>
            <p className="text-[11px] font-semibold text-emerald-800 mt-0.5">{showStatus}</p>
          </div>
        </div>
      )}

      {/* Main Settings List View */}
      {currentView === 'main' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden dark:bg-slate-900 dark:border-slate-800">
          {/* Header Title block */}
          <div className="p-6 text-center border-b border-slate-50 relative dark:border-slate-800">
            <h2 className="text-lg font-extrabold tracking-tight dark:text-white">{text.settings}</h2>
          </div>

          {/* Settings Search bar */}
          <div className="p-4 bg-slate-50/50 border-b border-slate-100 dark:bg-slate-950/20 dark:border-slate-800">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={text.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-1 focus:ring-slate-900 focus:border-slate-350 text-slate-800 transition dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:focus:ring-white"
              />
            </div>
          </div>

          {/* List items block */}
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {filteredMenuItems.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-bold text-xs">
                {text.noSettingsFound}
              </div>
            ) : (
              filteredMenuItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentView(item.id)}
                  className="w-full flex items-center justify-between p-4.5 hover:bg-slate-50/70 transition cursor-pointer select-none text-left dark:hover:bg-slate-800/40"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="p-2 bg-slate-100 rounded-xl text-slate-700 dark:bg-slate-800 dark:text-slate-300">{item.icon}</span>
                    <span className="text-xs font-extrabold text-slate-700 tracking-wide dark:text-slate-250">{item.label}</span>
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
        <form onSubmit={handleProfileSubmit} className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden dark:bg-slate-900 dark:border-slate-800">
          <div className="p-5 border-b border-slate-50 flex items-center gap-3 dark:border-slate-800">
            <button type="button" onClick={() => setCurrentView('main')} className="p-1 hover:bg-slate-100 rounded-lg text-slate-550 transition cursor-pointer dark:hover:bg-slate-800">
              <ArrowLeft className="w-5 h-5 dark:text-white" />
            </button>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">{text.account}</h3>
          </div>

          <div className="p-6 space-y-5">
            {/* Avatar block */}
            <div className="text-center space-y-3 relative">
              <div className="relative w-20 h-20 mx-auto">
                <img src={profileForm.avatar} alt="avatar" className="w-20 h-20 rounded-full object-cover border border-slate-200 shadow-xs dark:border-slate-700" />
                <button
                  type="button"
                  onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                  className="absolute bottom-0 right-0 p-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-full border-2 border-white shadow-sm cursor-pointer transition dark:border-slate-900"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {showAvatarSelector && (
                <div className="absolute top-20 left-0 right-0 mx-auto w-44 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-10 grid grid-cols-2 gap-1.5 animate-fade-in dark:bg-slate-800 dark:border-slate-700">
                  {MOCK_AVATARS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setProfileForm(prev => ({ ...prev, avatar: av }));
                        setShowAvatarSelector(false);
                      }}
                      className="border border-slate-100 rounded-xl overflow-hidden hover:border-slate-400 transition cursor-pointer focus:outline-none dark:border-slate-700"
                    >
                      <img src={av} alt="avatar option" className="w-full h-11 object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Inputs list */}
            <div className="space-y-4 text-xs font-semibold text-slate-655 dark:text-slate-355">
              <div className="space-y-1">
                <label className="text-slate-455 block font-bold">{text.fullName}</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900 focus:bg-white transition dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-455 block font-bold">{text.emailAddress}</label>
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900 focus:bg-white transition dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-455 block font-bold">{text.phoneNumber}</label>
                <input
                  type="text"
                  required
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900 focus:bg-white transition dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-455 block font-bold">{text.preferredLanguage}</label>
                  <select
                    value={profileForm.language}
                    onChange={(e) => setProfileForm({...profileForm, language: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  >
                    <option value="English">English</option>
                    <option value="Tagalog">Filipino / Tagalog</option>
                    <option value="Ivatan">Ivatán (Batanes)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-455 block font-bold">{text.textScaling}</label>
                  <select
                    value={profileForm.fontSize}
                    onChange={(e) => setProfileForm({...profileForm, fontSize: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  >
                    <option value="Small">Small (Compact)</option>
                    <option value="Normal">Normal (Default)</option>
                    <option value="Large">Large</option>
                    <option value="Extra Large">Extra Large (High Visibility)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-455 block font-bold">{text.systemRole}</label>
                <input
                  type="text"
                  disabled
                  value={activeUser?.role || 'Guest'}
                  className="w-full bg-slate-105 border border-slate-200 rounded-xl p-2.5 text-slate-450 font-bold cursor-not-allowed select-none dark:bg-slate-950/40 dark:border-slate-750"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-end dark:bg-slate-950/20 dark:border-slate-800">
            <button type="submit" className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 dark:bg-slate-700 dark:hover:bg-slate-600">
              <Save className="w-3.5 h-3.5" /> {text.saveChanges}
            </button>
          </div>
        </form>
      )}

      {/* VIEW: Notifications */}
      {currentView === 'notifications' && (
        <form onSubmit={handleNotificationsSubmit} className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden dark:bg-slate-900 dark:border-slate-800">
          <div className="p-5 border-b border-slate-50 flex items-center gap-3 dark:border-slate-800">
            <button type="button" onClick={() => setCurrentView('main')} className="p-1 hover:bg-slate-100 rounded-lg text-slate-550 transition cursor-pointer dark:hover:bg-slate-800">
              <ArrowLeft className="w-5 h-5 dark:text-white" />
            </button>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">{text.notifications}</h3>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-3.5 text-xs font-semibold text-slate-700 dark:text-slate-350">
              
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800">
                <div className="max-w-[80%]">
                  <span className="block font-bold text-slate-855 dark:text-white">{text.emailAlerts}</span>
                  <span className="text-[10px] text-slate-400 leading-relaxed block mt-0.5">Receive immediate SMTP emails regarding credential assignments or announcements.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyPrefs.emailAlerts}
                  onChange={(e) => setNotifyPrefs({...notifyPrefs, emailAlerts: e.target.checked})}
                  className="w-4.5 h-4.5 rounded text-slate-900 border-slate-350 focus:ring-slate-900 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800">
                <div className="max-w-[80%]">
                  <span className="block font-bold text-slate-855 dark:text-white">{text.jobVacancies}</span>
                  <span className="text-[10px] text-slate-400 leading-relaxed block mt-0.5">Get notified instantly when partner employers post vacancies matching your core skills.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyPrefs.jobVacancies}
                  onChange={(e) => setNotifyPrefs({...notifyPrefs, jobVacancies: e.target.checked})}
                  className="w-4.5 h-4.5 rounded text-slate-900 border-slate-350 focus:ring-slate-900 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800">
                <div className="max-w-[80%]">
                  <span className="block font-bold text-slate-855 dark:text-white">{text.surveyInvites}</span>
                  <span className="text-[10px] text-slate-400 leading-relaxed block mt-0.5">Receive alert cues when new tracer studies or feedback surveys are deployed.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyPrefs.surveyInvites}
                  onChange={(e) => setNotifyPrefs({...notifyPrefs, surveyInvites: e.target.checked})}
                  className="w-4.5 h-4.5 rounded text-slate-900 border-slate-350 focus:ring-slate-900 cursor-pointer"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center dark:bg-slate-800/40 dark:border-slate-800">
                <div>
                  <span className="block font-bold text-slate-855 dark:text-white">{text.digestFrequency}</span>
                  <span className="text-[10px] text-slate-400 leading-relaxed block mt-0.5">Choose how often notifications are compiled and sent.</span>
                </div>
                <select
                  value={notifyPrefs.digestFrequency}
                  onChange={(e) => setNotifyPrefs({...notifyPrefs, digestFrequency: e.target.value})}
                  className="bg-white border border-slate-200 rounded-xl p-2 font-bold text-slate-700 text-xs focus:ring-1 focus:ring-slate-900 cursor-pointer dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                >
                  <option value="Instant">Instant</option>
                  <option value="Daily">Daily Summary</option>
                  <option value="Weekly">Weekly Summary</option>
                  <option value="Never">Unsubscribe</option>
                </select>
              </div>

            </div>
          </div>

          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-end dark:bg-slate-950/20 dark:border-slate-800">
            <button type="submit" className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 dark:bg-slate-700 dark:hover:bg-slate-600">
              <Save className="w-3.5 h-3.5" /> {text.saveAlerts}
            </button>
          </div>
        </form>
      )}

      {/* VIEW: Privacy & Security */}
      {currentView === 'security' && (
        <form onSubmit={handleSecuritySubmit} className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden dark:bg-slate-900 dark:border-slate-800">
          <div className="p-5 border-b border-slate-50 flex items-center gap-3 dark:border-slate-800">
            <button type="button" onClick={() => setCurrentView('main')} className="p-1 hover:bg-slate-100 rounded-lg text-slate-550 transition cursor-pointer dark:hover:bg-slate-800">
              <ArrowLeft className="w-5 h-5 dark:text-white" />
            </button>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">{text.privacySecurity}</h3>
          </div>

          <div className="p-6 space-y-6">
            
            {/* Password edit inputs */}
            <div className="space-y-4 text-xs font-semibold text-slate-650 dark:text-slate-300">
              <div className="space-y-1 relative">
                <label className="text-slate-455 block font-bold">{text.currentPassword}</label>
                <div className="relative">
                  <input
                    type={showOldPass ? 'text' : 'password'}
                    required
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900 focus:bg-white transition dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-605 cursor-pointer"
                  >
                    {showOldPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 relative">
                  <label className="text-slate-455 block font-bold">{text.newPassword}</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900 focus:bg-white transition dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-605 cursor-pointer"
                    >
                      {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  
                  {passwordForm.newPassword && (
                    <div className="pt-2 space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-slate-400">Password Strength:</span>
                        <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-extrabold ${
                          strength.score <= 1 ? 'text-red-755 bg-red-50' :
                          strength.score === 2 ? 'text-amber-755 bg-amber-50' :
                          strength.score === 3 ? 'text-sky-755 bg-sky-50' :
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
                  <label className="text-slate-455 block font-bold">{text.confirmPassword}</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900 focus:bg-white transition dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Recovery security question */}
            <div className="p-4.5 bg-slate-50 border border-slate-100 rounded-2xl space-y-3.5 text-xs font-semibold text-slate-700 dark:bg-slate-800/40 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Credentials Recovery Config</span>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-slate-455 block font-bold dark:text-slate-350">{text.recoveryQuestion}</label>
                  <select
                    value={passwordForm.securityQuestion}
                    onChange={(e) => setPasswordForm({...passwordForm, securityQuestion: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 font-bold text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  >
                    <option value="school">What elementary school did you attend?</option>
                    <option value="pet">What was the name of your first childhood pet?</option>
                    <option value="city">In what city or municipality were you born?</option>
                    <option value="mother">What is your mother's maiden name?</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-455 block font-bold dark:text-slate-350">{text.recoveryAnswer}</label>
                  <input
                    type="text"
                    value={passwordForm.securityAnswer}
                    onChange={(e) => setPasswordForm({...passwordForm, securityAnswer: e.target.value})}
                    placeholder="Type recovery key response..."
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="p-4 bg-rose-50/40 border border-rose-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4 text-xs dark:bg-rose-950/10 dark:border-rose-900">
              <div className="space-y-0.5">
                <span className="font-extrabold text-slate-800 block dark:text-rose-200">{text.deactivate}</span>
                <span className="text-[10px] text-slate-400 leading-relaxed block dark:text-slate-400">Deactivate dashboard credentials. Restorations require administrative verify.</span>
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

          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-end dark:bg-slate-950/20 dark:border-slate-800">
            <button type="submit" className="px-5 py-2 bg-slate-850 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 dark:bg-slate-700 dark:hover:bg-slate-600">
              <Save className="w-3.5 h-3.5" /> {text.saveSecurity}
            </button>
          </div>
        </form>
      )}

      {/* VIEW: Help & Support */}
      {currentView === 'help' && (
        <form onSubmit={handleSupportSubmit} className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden dark:bg-slate-900 dark:border-slate-800">
          <div className="p-5 border-b border-slate-50 flex items-center gap-3 dark:border-slate-800">
            <button type="button" onClick={() => setCurrentView('main')} className="p-1 hover:bg-slate-100 rounded-lg text-slate-550 transition cursor-pointer dark:hover:bg-slate-800">
              <ArrowLeft className="w-5 h-5 dark:text-white" />
            </button>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">{text.helpSupport}</h3>
          </div>

          <div className="p-6 space-y-5 text-xs">
            {/* Support info details */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 text-slate-600 font-semibold leading-relaxed dark:bg-slate-800/40 dark:border-slate-800 dark:text-slate-350">
              <span className="text-[10px] text-[#1e4620] font-extrabold uppercase tracking-wider block dark:text-emerald-400">{text.helpdeskTitle}</span>
              <p>For tracer corrections, password resets, or official student evaluations, contact the IT Bureau.</p>
              <div className="pt-2 text-[10px] font-bold text-slate-500 space-y-1 font-mono dark:text-slate-400">
                <p>Website: <a href="https://bsc.edu.ph" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline dark:text-blue-400">www.bsc.edu.ph</a></p>
                <p>Helpdesk: support@bsc.edu.ph</p>
                <p>Registrar: (+63) 987 654 3210</p>
              </div>
            </div>

            {/* Quick Ticket form */}
            <div className="space-y-4 font-semibold text-slate-650 dark:text-slate-300">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Send Quick Support Ticket</span>
              
              <div className="space-y-1">
                <label className="text-slate-455 block font-bold">{text.ticketSubject}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tracer completion bar error"
                  value={supportTicket.subject}
                  onChange={(e) => setSupportTicket({...supportTicket, subject: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-455 block font-bold">{text.ticketDescription}</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain the issues encountered in details..."
                  value={supportTicket.message}
                  onChange={(e) => setSupportTicket({...supportTicket, message: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:ring-1 focus:ring-slate-900 focus:bg-white leading-relaxed dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-end dark:bg-slate-950/20 dark:border-slate-800">
            <button type="submit" className="px-5 py-2 bg-slate-850 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 dark:bg-slate-700 dark:hover:bg-slate-600">
              <Mail className="w-3.5 h-3.5" /> {text.submitTicket}
            </button>
          </div>
        </form>
      )}

      {/* VIEW: About */}
      {currentView === 'about' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden text-center dark:bg-slate-900 dark:border-slate-800">
          <div className="p-5 border-b border-slate-50 flex items-center gap-3 dark:border-slate-800">
            <button type="button" onClick={() => setCurrentView('main')} className="p-1 hover:bg-slate-100 rounded-lg text-slate-550 transition cursor-pointer dark:hover:bg-slate-800">
              <ArrowLeft className="w-5 h-5 dark:text-white" />
            </button>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">{text.about}</h3>
          </div>

          <div className="p-8 space-y-5 text-slate-600 font-semibold text-xs dark:text-slate-355">
            <div className="w-16 h-16 rounded-3xl bg-slate-900 flex items-center justify-center font-bold text-white text-xl mx-auto shadow-md dark:bg-slate-800">
              BSC
            </div>

            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-800 text-sm dark:text-white">{text.aboutTitle}</h4>
              <p className="text-[10px] text-slate-400 font-bold font-mono">Version 2.4.0 (Stable Release)</p>
            </div>

            <p className="max-w-xs mx-auto leading-relaxed text-slate-500 font-medium dark:text-slate-400">
              This system facilitates post-graduate tracking, curricular analytics, and job placement assistance under CHED directives for Batanes State College.
            </p>

            <div className="pt-4 border-t border-slate-50 text-[10px] text-slate-400 font-bold space-y-0.5 dark:border-slate-800">
              <p>Batanes State College &copy; 2026</p>
              <p>Basco, Batanes, Philippines</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
