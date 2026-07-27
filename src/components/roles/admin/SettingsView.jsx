import React, { useState } from 'react';
import { 
  User, Shield, Bell, Layout, Check, Mail, Lock, 
  Smartphone, Monitor, Globe, Palette, Save, AlertCircle, Eye, EyeOff
} from 'lucide-react';

/**
 * SettingsView Component
 * @description View component for personal account settings, security policies, 
 * notification logs, and user interface preferences. Visible to all roles.
 */
export default function SettingsView({ activeUser }) {
  // Inner settings categories
  const [activeSubTab, setActiveSubTab] = useState('profile');

  // Success indicators
  const [isSaving, setIsSaving] = useState(false);
  const [showStatus, setShowStatus] = useState('');

  // Password hide/show toggles
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  
  // Profile state pre-populated with activeUser details
  const [profileForm, setProfileForm] = useState({
    name: activeUser?.name || 'Juan Dela Cruz',
    email: activeUser?.email || 'user@bsc.edu.ph',
    phone: activeUser?.phone || '+63 912 345 6789',
    language: 'English',
    timezone: 'Asia/Manila (GMT+8)'
  });

  // Password fields state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification Preferences
  const [notifyPrefs, setNotifyPrefs] = useState({
    emailAlerts: true,
    jobVacancies: true,
    surveyInvites: true,
    activityDigest: false
  });

  // Theme Preferences
  const [themePrefs, setThemePrefs] = useState({
    darkMode: false,
    compactSidebar: false,
    colorAccent: 'BSC Crimson'
  });

  // Simple password strength calculator
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    
    if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score, label: 'Good', color: 'bg-sky-500' };
    return { score, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(passwordForm.newPassword);

  const handleProfileSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowStatus('Profile details updated successfully!');
      setTimeout(() => setShowStatus(''), 4000);
    }, 1200);
  };

  const handleSecuritySave = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New password and confirm password fields do not match!");
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowStatus('Password and authentication preferences saved!');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setShowStatus(''), 4000);
    }, 1200);
  };

  const handlePreferencesSave = (section) => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowStatus(`${section} settings saved successfully.`);
      setTimeout(() => setShowStatus(''), 4000);
    }, 1000);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-sm border border-slate-950/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-white/10 rounded-lg text-amber-400">
              <User className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">Account &amp; Preference Settings</h2>
          </div>
          <p className="text-xs text-slate-300 font-medium">
            Manage your personal profile information, update login credentials, configure notifications, and style system interfaces.
          </p>
        </div>
      </div>

      {/* Toast notifications */}
      {showStatus && (
        <div role="alert" className="p-4 bg-emerald-50 text-emerald-950 border border-emerald-250 rounded-xl text-xs font-bold flex items-center gap-3 shadow-xs animate-fade-in">
          <span className="p-1.5 bg-emerald-700 text-white rounded-full">
            <Check className="w-4 h-4" />
          </span>
          <div>
            <p className="font-extrabold text-emerald-900">Success</p>
            <p className="text-[11px] font-semibold text-emerald-800 mt-0.5">{showStatus}</p>
          </div>
        </div>
      )}

      {/* Settings Grid Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side Sidebar */}
        <div className="space-y-5">
          {/* Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs text-center space-y-3">
            <div className="relative w-16 h-16 mx-auto">
              <img
                src={activeUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'}
                alt={activeUser?.name}
                className="w-16 h-16 rounded-full object-cover border border-slate-200"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'; }}
              />
              <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" title="Session Active"></div>
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-800 truncate">{profileForm.name}</h4>
              <p className="text-[10px] text-slate-400 font-bold truncate mt-0.5">{profileForm.email}</p>
            </div>
            <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[9px] font-extrabold uppercase rounded-full border border-slate-200 tracking-wider">
              {activeUser?.role || 'User'}
            </span>
          </div>

          {/* Settings Tabs Sub-Navigation */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-1 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveSubTab('profile')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeSubTab === 'profile' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <User className="w-4 h-4" />
              Profile Details
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('security')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeSubTab === 'security' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Shield className="w-4 h-4" />
              Security &amp; Password
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('notifications')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeSubTab === 'notifications' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Bell className="w-4 h-4" />
              Notifications
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('appearance')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeSubTab === 'appearance' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Layout className="w-4 h-4" />
              Appearance &amp; UI
            </button>
          </div>
        </div>

        {/* Right Side Settings Panel */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* TAB 1: Profile details */}
          {activeSubTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-xs">
              <div className="border-b border-slate-50 pb-3">
                <h3 className="text-sm font-bold text-slate-800">Personal Profile Details</h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Manage details linked directly to your active tracer study registration.</p>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
                  <div className="space-y-1">
                    <label className="text-slate-500 block">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900 focus:bg-white transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 block">Email Address</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900 focus:bg-white transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 block">Contact Phone Number</label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900 focus:bg-white transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 block">Portal Security Role</label>
                    <input
                      type="text"
                      disabled
                      value={activeUser?.role || 'Guest'}
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-slate-500 font-bold cursor-not-allowed select-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 block">Preferred Language</label>
                    <select
                      value={profileForm.language}
                      onChange={(e) => setProfileForm({...profileForm, language: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900 focus:bg-white transition"
                    >
                      <option value="English">English (Global)</option>
                      <option value="Tagalog">Filipino / Tagalog</option>
                      <option value="Ivatan">Ivatán (Batanes)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 block">Local Timezone</label>
                    <input
                      type="text"
                      disabled
                      value={profileForm.timezone}
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-slate-500 font-bold cursor-not-allowed select-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer disabled:opacity-55"
                  >
                    {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Profile Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: Security & Password */}
          {activeSubTab === 'security' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-xs">
              <div className="border-b border-slate-50 pb-3">
                <h3 className="text-sm font-bold text-slate-800">Login Security &amp; Credentials</h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Ensure your portal account remains secure by updating security passes.</p>
              </div>

              <form onSubmit={handleSecuritySave} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 text-xs font-semibold text-slate-600">
                  
                  {/* Old Password */}
                  <div className="space-y-1 relative">
                    <label className="text-slate-500 block">Current Account Password</label>
                    <div className="relative">
                      <input
                        type={showOldPass ? 'text' : 'password'}
                        required
                        value={passwordForm.oldPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-9 py-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPass(!showOldPass)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-450 hover:text-slate-650 cursor-pointer"
                      >
                        {showOldPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 relative">
                      <label className="text-slate-500 block">New Password Code</label>
                      <div className="relative">
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          required
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-9 py-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900 focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-450 hover:text-slate-650 cursor-pointer"
                        >
                          {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      
                      {/* Password strength meter */}
                      {passwordForm.newPassword && (
                        <div className="pt-2 space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-slate-400">Password Strength:</span>
                            <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-extrabold ${
                              strength.score <= 1 ? 'text-red-700 bg-red-50' :
                              strength.score === 2 ? 'text-amber-700 bg-amber-50' :
                              strength.score === 3 ? 'text-sky-700 bg-sky-50' :
                              'text-emerald-700 bg-emerald-50'
                            }`}>{strength.label}</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-300 ${strength.color}`} style={{ width: `${(strength.score + 1) * 20}%` }}></div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-500 block">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900 focus:bg-white"
                      />
                    </div>
                  </div>

                </div>

                {/* Two Factor Authentication */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between mt-4">
                  <div className="space-y-0.5 max-w-[80%]">
                    <span className="text-xs font-bold text-slate-800 block flex items-center gap-1">
                      <Smartphone className="w-4 h-4 text-slate-450" /> Two-Factor Authentication (2FA)
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold leading-relaxed block">
                      Enforce verification codes sent to your registered phone or email when logging in from unknown devices.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePreferencesSave('Two-Factor Authentication')}
                    className="px-3 py-1.5 bg-slate-150 hover:bg-slate-200 border border-slate-250 text-slate-700 font-extrabold text-[10px] rounded-lg transition uppercase cursor-pointer"
                  >
                    Setup 2FA
                  </button>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2.5 bg-slate-850 hover:bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer disabled:opacity-55"
                  >
                    {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                    Update Password Key
                  </button>
                </div>
              </form>

              {/* Active Sessions Trail */}
              <div className="space-y-3 pt-4 border-t border-slate-50">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Active Login Sessions History</span>
                <div className="space-y-2 text-xs font-semibold text-slate-600">
                  <div className="p-3 border border-slate-100 rounded-xl bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Monitor className="w-4 h-4 text-emerald-600" />
                      <div>
                        <span className="font-bold text-slate-800 block">Vite client / Google Chrome (Windows 11)</span>
                        <span className="text-[9px] text-slate-400 font-mono">IP: 192.168.1.45 &bull; Basco, Batanes (Current Session)</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-55 text-emerald-800 text-[9px] font-extrabold uppercase rounded-full">Online</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: Notifications */}
          {activeSubTab === 'notifications' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-xs">
              <div className="border-b border-slate-50 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Notification Alerts Preferences</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Control how you prefer to be notified about career updates and audits.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handlePreferencesSave('Notification Preferences')}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> Save Alerts
                </button>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-700">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <span className="block font-bold text-slate-800">Direct Email Alerts</span>
                    <span className="text-[10px] text-slate-400 font-semibold leading-relaxed block mt-0.5">Receive immediate SMTP emails regarding credential assignments or announcements.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyPrefs.emailAlerts}
                    onChange={(e) => setNotifyPrefs({...notifyPrefs, emailAlerts: e.target.checked})}
                    className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <span className="block font-bold text-slate-800">Job Vacancy Matching Updates</span>
                    <span className="text-[10px] text-slate-400 font-semibold leading-relaxed block mt-0.5">Get notified instantly when partner employers post vacancies matching your core skills.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyPrefs.jobVacancies}
                    onChange={(e) => setNotifyPrefs({...notifyPrefs, jobVacancies: e.target.checked})}
                    className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <span className="block font-bold text-slate-800">Tracer Surveys &amp; Reviews Announcements</span>
                    <span className="text-[10px] text-slate-400 font-semibold leading-relaxed block mt-0.5">Receive alert cues when new tracer studies or feedback surveys are deployed by chairpersons.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyPrefs.surveyInvites}
                    onChange={(e) => setNotifyPrefs({...notifyPrefs, surveyInvites: e.target.checked})}
                    className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Appearance & UI Customizations */}
          {activeSubTab === 'appearance' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-xs">
              <div className="border-b border-slate-50 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">User Interface Customization</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Adjust dashboard display layout, dark themes, and color preferences.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handlePreferencesSave('Appearance')}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> Save Theme
                </button>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-700">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <span className="block font-bold text-slate-800">Dark Mode Interface</span>
                    <span className="text-[10px] text-slate-400 font-semibold leading-relaxed block mt-0.5">Invert page layout brightness to ease eye straining in dark conditions.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={themePrefs.darkMode}
                    onChange={(e) => setThemePrefs({...themePrefs, darkMode: e.target.checked})}
                    className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <span className="block font-bold text-slate-800">Compact Sidebar Menu</span>
                    <span className="text-[10px] text-slate-400 font-semibold leading-relaxed block mt-0.5">Minimize the desktop navigation sidebar to display only icon layouts.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={themePrefs.compactSidebar}
                    onChange={(e) => setThemePrefs({...themePrefs, compactSidebar: e.target.checked})}
                    className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <span className="block font-bold text-slate-800">System Color Accent Theme</span>
                    <span className="text-[10px] text-slate-400 font-semibold leading-relaxed block mt-0.5">Select a highlighting brand color for dashboard navigation headers.</span>
                  </div>
                  <select
                    value={themePrefs.colorAccent}
                    onChange={(e) => setThemePrefs({...themePrefs, colorAccent: e.target.value})}
                    className="bg-white border border-slate-200 rounded-xl p-2 font-bold text-slate-700 text-xs focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="BSC Crimson">BSC Crimson (Standard)</option>
                    <option value="BSC Forest Green">Forest Green</option>
                    <option value="Ocean Teal">Ocean Teal</option>
                    <option value="Slate Steel">Slate Steel</option>
                  </select>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
