import React, { useState } from 'react';
import { 
  Check, AlertTriangle, UserPlus, RefreshCw, Trash2, Search, 
  Settings, Globe, Server, Shield, Users, Key, ToggleLeft, ToggleRight, 
  HelpCircle, Eye, EyeOff, Save, CheckCircle
} from 'lucide-react';

/**
 * SettingsView Component
 * @description View component para sa mga administrative at system settings.
 * May kasamang General Configuration, SMTP Server setups, Security Constraints, 
 * at integrated User Directory Account management.
 */
export default function SettingsView({ 
  alumniList = [], 
  activeUser, 
  users = [],
  onInviteUserByEmail,
  onDeleteUser
}) {
  
  // Inner settings tabs navigation state
  const [activeSettingsTab, setActiveSettingsTab] = useState('general');

  // State hook para sa loading status habang nag-iimbita ng bagong user
  const [isInviting, setIsInviting] = useState(false);
  // State hook para sa loading status habang nagse-save ng configurations
  const [isSaving, setIsSaving] = useState(false);
  // State hook para sa text na ipapakita sa toast status message
  const [showStatus, setShowStatus] = useState('');

  // =========================================================================
  // MOCK SYSTEM CONFIG STATES
  // =========================================================================
  // General Configuration State
  const [generalConfig, setGeneralConfig] = useState({
    systemTitle: 'BSC CareerPath Tracer Portal',
    collegeName: 'Batanes State College',
    adminEmail: 'admin@bsc.edu.ph',
    maintenanceMode: false,
    currentTerm: '2026-2027 1st Semester',
    tracerStatus: 'Active'
  });

  // SMTP Server Configuration State
  const [smtpConfig, setSmtpConfig] = useState({
    host: 'smtp.bsc.edu.ph',
    port: '587',
    username: 'mailer@bsc.edu.ph',
    password: 'secure_smtp_password_goes_here',
    senderName: 'BSC Alumni Relations Bureau',
    encryption: 'TLS'
  });
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);

  // Security Policy State
  const [securityConfig, setSecurityConfig] = useState({
    enforceComplexity: true,
    sessionTimeout: '30',
    allowAlumniSelfReg: true,
    allowEmployerSelfReg: true,
    maxLoginAttempts: '5'
  });

  // =========================================================================
  // USER DIRECTORY STATES & HANDLERS
  // =========================================================================
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
   * handleInviteSubmit
   * Tagapamahala sa pagpapadala ng imbitasyon para sa bagong rehistradong user sa system
   */
  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    await onInviteUserByEmail(inviteEmail.trim(), inviteRole);
    setIsInviting(false);
    
    setShowStatus(`SUCCESS! Invitation credits configured for '${inviteEmail}'. Temporary password set to 'bsc123'.`);
    setTimeout(() => setShowStatus(''), 4500);
    setInviteEmail('');
  };

  /**
   * handleConfigSave
   * Simulates saving config changes with a nice spinner and success feedback
   */
  const handleConfigSave = (sectionName) => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowStatus(`SUCCESS! ${sectionName} changes have been successfully committed to the database.`);
      setTimeout(() => setShowStatus(''), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-sm border border-slate-950/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-white/10 rounded-lg text-amber-400">
              <Settings className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">Portal Configuration &amp; Administration Settings</h2>
          </div>
          <p className="text-xs text-slate-300 font-medium">
            Manage system settings, security credentials, email configuration settings, and invite or delete users from Batanes State College.
          </p>
        </div>
      </div>

      {/* Toast notification indicator para sa tagumpay na mga operasyon */}
      {showStatus && (
        <div role="alert" className="p-4 bg-emerald-50 text-emerald-950 border border-emerald-250 rounded-xl text-xs font-bold flex items-center gap-3 shadow-xs animate-fade-in">
          <span className="p-1.5 bg-emerald-700 text-white rounded-full">
            <Check className="w-4 h-4" />
          </span>
          <div>
            <p className="font-extrabold text-emerald-900">System Configuration Updated</p>
            <p className="text-[11px] font-semibold text-emerald-800 mt-0.5">{showStatus}</p>
          </div>
        </div>
      )}

      {/* Main Settings Section Layout: Left Sidebar tabs, Right Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Navigation Sidebar inside Settings */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-1.5 h-fit shadow-xs">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider px-3 block mb-2">
            Settings Categories
          </span>
          
          <button
            type="button"
            onClick={() => setActiveSettingsTab('general')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
              activeSettingsTab === 'general'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Globe className="w-4 h-4" />
            General Info
          </button>
          
          <button
            type="button"
            onClick={() => setActiveSettingsTab('smtp')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
              activeSettingsTab === 'smtp'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Server className="w-4 h-4" />
            SMTP Mail Server
          </button>
          
          <button
            type="button"
            onClick={() => setActiveSettingsTab('security')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
              activeSettingsTab === 'security'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Shield className="w-4 h-4" />
            Security &amp; Policies
          </button>
          
          <button
            type="button"
            onClick={() => setActiveSettingsTab('users')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
              activeSettingsTab === 'users'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            User Accounts ({users.length})
          </button>
        </div>

        {/* Configurations Fields Workspace */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* TAB 1: General Info Settings */}
          {activeSettingsTab === 'general' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-xs">
              <div className="border-b border-slate-50 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">General Portal Configuration</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Define core institutional data fields and system flags.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleConfigSave('General Settings')}
                  disabled={isSaving}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" /> : <Save className="w-3.5 h-3.5" />}
                  Save Details
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
                <div className="space-y-1">
                  <label className="text-slate-500 block">System / Portal Name</label>
                  <input
                    type="text"
                    value={generalConfig.systemTitle}
                    onChange={(e) => setGeneralConfig({...generalConfig, systemTitle: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 block">Institution / College Name</label>
                  <input
                    type="text"
                    value={generalConfig.collegeName}
                    onChange={(e) => setGeneralConfig({...generalConfig, collegeName: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 block">System Administrator Support Email</label>
                  <input
                    type="email"
                    value={generalConfig.adminEmail}
                    onChange={(e) => setGeneralConfig({...generalConfig, adminEmail: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 block">Tracer Survey Status</label>
                  <select
                    value={generalConfig.tracerStatus}
                    onChange={(e) => setGeneralConfig({...generalConfig, tracerStatus: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900 focus:bg-white"
                  >
                    <option value="Active">Active &amp; Audit Open</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Closed">Archived / Closed</option>
                  </select>
                </div>
              </div>

              {/* Maintenance Toggle */}
              <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                <div className="space-y-0.5 pr-4">
                  <span className="text-xs font-bold text-slate-800 block">Portal Maintenance Mode</span>
                  <span className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                    Temporarily block all employer and alumni logins while performing system database migrations.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setGeneralConfig({...generalConfig, maintenanceMode: !generalConfig.maintenanceMode})}
                  className="text-slate-700 focus:outline-none cursor-pointer"
                >
                  {generalConfig.maintenanceMode ? (
                    <span className="flex items-center gap-1 font-bold text-rose-700">
                      <ToggleRight className="w-9 h-9 text-rose-600 shrink-0" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-bold text-slate-400">
                      <ToggleLeft className="w-9 h-9 text-slate-350 shrink-0" />
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SMTP Mail Configuration */}
          {activeSettingsTab === 'smtp' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-xs">
              <div className="border-b border-slate-50 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">SMTP Email Server Settings</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Set up default outbound credentials for invitation codes and notifications.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleConfigSave('SMTP Server')}
                  disabled={isSaving}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" /> : <Save className="w-3.5 h-3.5" />}
                  Save SMTP
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold text-slate-600">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-slate-500 block">SMTP Relayer Host Server</label>
                  <input
                    type="text"
                    value={smtpConfig.host}
                    onChange={(e) => setSmtpConfig({...smtpConfig, host: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 block">SMTP Port Link</label>
                  <input
                    type="text"
                    value={smtpConfig.port}
                    onChange={(e) => setSmtpConfig({...smtpConfig, port: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 block">Sender Username Account</label>
                  <input
                    type="text"
                    value={smtpConfig.username}
                    onChange={(e) => setSmtpConfig({...smtpConfig, username: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900 focus:bg-white"
                  />
                </div>

                <div className="space-y-1 relative">
                  <label className="text-slate-500 block">SMTP Security Password</label>
                  <div className="relative">
                    <input
                      type={showSmtpPassword ? 'text' : 'password'}
                      value={smtpConfig.password}
                      onChange={(e) => setSmtpConfig({...smtpConfig, password: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-2.5 pr-9 py-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showSmtpPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 block">Sender Header Display Name</label>
                  <input
                    type="text"
                    value={smtpConfig.senderName}
                    onChange={(e) => setSmtpConfig({...smtpConfig, senderName: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 block">Encryption Standard</span>
                  <span className="text-[10px] text-slate-400 font-semibold leading-relaxed">Choose transport layout cryptographic encryption.</span>
                </div>
                <div className="flex gap-2">
                  {['TLS', 'SSL', 'None'].map(enc => (
                    <button
                      key={enc}
                      type="button"
                      onClick={() => setSmtpConfig({...smtpConfig, encryption: enc})}
                      className={`px-3 py-1.5 border rounded-xl text-xs font-extrabold transition cursor-pointer ${
                        smtpConfig.encryption === enc
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {enc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Security & Policies */}
          {activeSettingsTab === 'security' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-xs">
              <div className="border-b border-slate-50 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">System Security Rules</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Control login constraints, self-registration rules, and timeouts.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleConfigSave('Security Policies')}
                  disabled={isSaving}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" /> : <Save className="w-3.5 h-3.5" />}
                  Save Rules
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold text-slate-600">
                <div className="space-y-1">
                  <label className="text-slate-500 block">Session Idle Timeout Limit (Minutes)</label>
                  <select
                    value={securityConfig.sessionTimeout}
                    onChange={(e) => setSecurityConfig({...securityConfig, sessionTimeout: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900 focus:bg-white"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 block">Max Retries Login Limit</label>
                  <select
                    value={securityConfig.maxLoginAttempts}
                    onChange={(e) => setSecurityConfig({...securityConfig, maxLoginAttempts: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:ring-1 focus:ring-slate-900 focus:bg-white"
                  >
                    <option value="3">3 Attempts</option>
                    <option value="5">5 Attempts</option>
                    <option value="10">10 Attempts</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3.5 pt-2">
                <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 block">Alumni Self-Registration Status</span>
                    <span className="text-[10px] text-slate-400 font-semibold leading-relaxed">Allow graduates without accounts to sign up via tracer database query verification.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSecurityConfig({...securityConfig, allowAlumniSelfReg: !securityConfig.allowAlumniSelfReg})}
                    className="text-slate-700 cursor-pointer"
                  >
                    {securityConfig.allowAlumniSelfReg ? <ToggleRight className="w-9 h-9 text-emerald-600" /> : <ToggleLeft className="w-9 h-9 text-slate-400" />}
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 block">Employer Account Self-Registration</span>
                    <span className="text-[10px] text-slate-400 font-semibold leading-relaxed">Allow partner companies to register job vacancy accounts prior to administrative verification.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSecurityConfig({...securityConfig, allowEmployerSelfReg: !securityConfig.allowEmployerSelfReg})}
                    className="text-slate-700 cursor-pointer"
                  >
                    {securityConfig.allowEmployerSelfReg ? <ToggleRight className="w-9 h-9 text-emerald-600" /> : <ToggleLeft className="w-9 h-9 text-slate-400" />}
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 block">Enforce Complex Password Credentials</span>
                    <span className="text-[10px] text-slate-400 font-semibold leading-relaxed">Require passwords to contain at least 8 characters, capital letters, numeric digits, and special characters.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSecurityConfig({...securityConfig, enforceComplexity: !securityConfig.enforceComplexity})}
                    className="text-slate-700 cursor-pointer"
                  >
                    {securityConfig.enforceComplexity ? <ToggleRight className="w-9 h-9 text-emerald-600" /> : <ToggleLeft className="w-9 h-9 text-slate-400" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: User Accounts Directory */}
          {activeSettingsTab === 'users' && (
            <div className="space-y-6">
              
              {/* Invite User Workspace */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-xs">
                <div className="border-b border-slate-50 pb-3">
                  <h3 className="text-sm font-bold text-slate-800">Invite New Administrative / Graduate User</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Send login credentials and assign appropriate system level access.</p>
                </div>

                <form onSubmit={handleInviteSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end text-xs font-semibold text-slate-600">
                  <div className="space-y-1">
                    <label className="text-slate-500 block">Target Email Address</label>
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="e.g., chairperson@bsc.edu.ph"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 block">Assign Security Role</label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-700"
                    >
                      {activeUser?.role === 'Super Admin' && (
                        <>
                          <option value="Super Admin">Super Administrator (Overseer)</option>
                          <option value="Administrator">Administrator (Portal Manager)</option>
                        </>
                      )}
                      <option value="Alumni">Graduate Alumnus (Tracer Profile)</option>
                      <option value="Department Chairperson">Department Chairperson</option>
                      <option value="Employer">Partner Employer (Hiring Manager)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isInviting}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl transition uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {isInviting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                    Generate Credentials
                  </button>
                </form>
              </div>

              {/* Users Directory Table */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-50">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-slate-800">System Users Accounts Directory</h3>
                    <p className="text-xs text-slate-400 font-semibold">Verify login status, search active directories, or delete users.</p>
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
                      placeholder="Search users, emails, roles..."
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-800 transition"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-100">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                        <th className="p-3">User ID</th>
                        <th className="p-3">Name</th>
                        <th className="p-3">Email Address</th>
                        <th className="p-3">System Role</th>
                        <th className="p-3">Password Credentials</th>
                        <th className="p-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-slate-450 font-bold">
                            No system users found matching your search.
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
                                <span className="font-bold text-slate-800">{user.name}</span>
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
                                  Default (Unchanged)
                                </span>
                              ) : (
                                <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-bold border border-emerald-100 flex items-center gap-1 w-max">
                                  <Check className="w-3.5 h-3.5 text-emerald-550 shrink-0" />
                                  Set / Private
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

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
