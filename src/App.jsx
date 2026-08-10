/**
 * @file App.jsx
 * @description Core client-side React component ng BSC CareerPath Tracer.
 * Ito ang nagsisilbing pangunahing router at view switcher. Pinapamahalaan nito ang mga layout tulad ng
 * Header, Sidebar, MobileMenu, at tinatakda kung anong functional sub-view ang ipapakita base sa active tab.
 */

import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, X, Share } from 'lucide-react';

// Synchronous Dark Theme Initialization before component mounts
if (localStorage.getItem('careerpath_dark_mode') === 'true') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

function applyAccentTheme(themeName) {
  let css = '';

  if (themeName === 'BSC Forest Green') {
    css = `
      .bg-\\[\\#1e4620\\] { background-color: #1e4620 !important; }
      .text-\\[\\#1e4620\\] { color: #1e4620 !important; }
      .border-\\[\\#1e4620\\] { border-color: #1e4620 !important; }
      .fill-\\[\\#1e4620\\] { fill: #1e4620 !important; }
      .stroke-\\[\\#1e4620\\] { stroke: #1e4620 !important; }
      .hover\\:text-\\[\\#1e4620\\]:hover { color: #1e4620 !important; }
      .hover\\:bg-\\[\\#1e4620\\]\\/10:hover { background-color: rgba(30, 70, 32, 0.1) !important; }
      .bg-\\[\\#1e4620\\]\\/5 { background-color: rgba(30, 70, 32, 0.05) !important; }
      .border-\\[\\#1e4620\\]\\/15 { border-color: rgba(30, 70, 32, 0.15) !important; }
      .bg-\\[\\#123d16\\] { background-color: #123d16 !important; }
      aside { background-image: linear-gradient(to bottom, #123d16, #0c2b0f) !important; border-right-color: #0c2b0f !important; }
      .border-\\[\\#0d2e10\\] { border-color: #0c2b0f !important; }
    `;
  } else if (themeName === 'Ocean Teal') {
    css = `
      .bg-\\[\\#1e4620\\] { background-color: #0d9488 !important; }
      .text-\\[\\#1e4620\\] { color: #0d9488 !important; }
      .border-\\[\\#1e4620\\] { border-color: #0d9488 !important; }
      .fill-\\[\\#1e4620\\] { fill: #0d9488 !important; }
      .stroke-\\[\\#1e4620\\] { stroke: #0d9488 !important; }
      .hover\\:text-\\[\\#1e4620\\]:hover { color: #0d9488 !important; }
      .hover\\:bg-\\[\\#1e4620\\]\\/10:hover { background-color: rgba(13, 148, 136, 0.1) !important; }
      .bg-\\[\\#1e4620\\]\\/5 { background-color: rgba(13, 148, 136, 0.05) !important; }
      .border-\\[\\#1e4620\\]\\/15 { border-color: rgba(13, 148, 136, 0.15) !important; }
      .bg-\\[\\#123d16\\] { background-color: #115e59 !important; }
      aside { background-image: linear-gradient(to bottom, #115e59, #134e4a) !important; border-right-color: #134e4a !important; }
      .border-\\[\\#0d2e10\\] { border-color: #134e4a !important; }
    `;
  } else if (themeName === 'Slate Steel') {
    css = `
      .bg-\\[\\#1e4620\\] { background-color: #475569 !important; }
      .text-\\[\\#1e4620\\] { color: #475569 !important; }
      .border-\\[\\#1e4620\\] { border-color: #475569 !important; }
      .fill-\\[\\#1e4620\\] { fill: #475569 !important; }
      .stroke-\\[\\#1e4620\\] { stroke: #475569 !important; }
      .hover\\:text-\\[\\#1e4620\\]:hover { color: #475569 !important; }
      .hover\\:bg-\\[\\#1e4620\\]\\/10:hover { background-color: rgba(71, 85, 105, 0.1) !important; }
      .bg-\\[\\#1e4620\\]\\/5 { background-color: rgba(71, 85, 105, 0.05) !important; }
      .border-\\[\\#1e4620\\]\\/15 { border-color: rgba(71, 85, 105, 0.15) !important; }
      .bg-\\[\\#123d16\\] { background-color: #334155 !important; }
      aside { background-image: linear-gradient(to bottom, #334155, #1e293b) !important; border-right-color: #1e293b !important; }
      .border-\\[\\#0d2e10\\] { border-color: #1e293b !important; }
    `;
  }

  // Compact Sidebar check in css injection
  const compact = localStorage.getItem('careerpath_compact_sidebar') === 'true';
  if (compact) {
    css += `
      @media (min-width: 768px) {
        body.compact-sidebar aside { width: 4.5rem !important; }
        body.compact-sidebar aside nav button { justify-content: center !important; padding-left: 0 !important; padding-right: 0 !important; }
        body.compact-sidebar aside nav button span { display: none !important; }
        body.compact-sidebar aside nav button svg { width: 1.25rem !important; height: 1.25rem !important; margin: 0 auto !important; }
        body.compact-sidebar aside div { display: none !important; }
      }
    `;
  }

  let styleTag = document.getElementById('dynamic-accent-theme');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'dynamic-accent-theme';
    document.head.appendChild(styleTag);
  }
  styleTag.innerHTML = css;
}

// =========================================================================
// MGA FEATURE VIEW COMPONENT
// =========================================================================
import LoginView from './components/shared/LoginView';
import DashboardView from './components/shared/DashboardView';
import AlumniManagementView from './components/shared/AlumniManagementView';
import EmployerManagementView from './components/roles/employer/EmployerManagementView';
import JobPostingsView from './components/shared/JobPostingsView';
import SkillsMatchingView from './components/shared/SkillsMatchingView';
import SurveysView from './components/shared/SurveysView';
import FeedbackView from './components/shared/FeedbackView';
// NOTE: Tinanggal natin ang import ng MessagingView dahil inalis na ang messaging feature.
import EmploymentView from './components/shared/EmploymentView';
import ReportsView from './components/shared/ReportsView';
import ActivityLogView from './components/roles/admin/ActivityLogView';
import BulkImportModal from './components/roles/admin/BulkImportModal';
import NotificationsView from './components/shared/NotificationsView';
import SettingsView from './components/roles/admin/SettingsView';
import MessageEmailView from './components/roles/admin/MessageEmailView';

// =========================================================================
// MGA LAYOUT COMPONENT
// =========================================================================
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import MobileMenu from './components/layout/MobileMenu';

// =========================================================================
// CUSTOM APPLICATION STATE HOOK (Dito galing ang global state at handlers)
// =========================================================================
import { useCareerPath } from './hooks/useCareerPath';

export default function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('careerpath_dark_mode') === 'true');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Handle PWA installation prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = sessionStorage.getItem('pwa_install_dismissed') === 'true';
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Initial check for mobile devices to show install guide/banner
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    const dismissed = sessionStorage.getItem('pwa_install_dismissed') === 'true';

    if (isMobileDevice && !isStandalone && !dismissed) {
      setShowInstallBanner(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismissInstall = () => {
    sessionStorage.setItem('pwa_install_dismissed', 'true');
    setShowInstallBanner(false);
  };

  // Kuhanin ang application states, data listings, at state mutators mula sa ating custom hook
  const {
    activeUser,
    setActiveUser,
    currentTab,
    setCurrentTab,
    mobileMenuOpen,
    setMobileMenuOpen,
    profileDropdownOpen,
    setProfileDropdownOpen,
    users,
    alumniList,
    employers,
    jobPostings,
    surveys,
    notifications,
    isLoading,
    toastMessage,
    navigationItems,
    scopedAlumniList,
    scopedFeedbacks,
    scopedSurveyResponses,
    scopedLogs,
    handleLoginSuccess,
    handleLogout,
    handleSaveAlumni,
    handleDeleteAlumni,
    handleSaveEmployer,
    handleSaveJob,
    handleSaveSurvey,
    handleSubmitSurveyResponse,
    handleSaveFeedback,
    handleBulkImport,
    handleSendBatchReminders,
    handleInviteUserByEmail,
    handleDeleteUser,
    handleTriggerSingleEmailNudge,
    handleMarkNotifyRead,
    handleTabChange,
    handleUpdateUserSession,
    appendActivity,
    isOnline,
    pendingSyncCount,
    isSyncing,
    triggerManualSync
  } = useCareerPath();

  const handleToggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    localStorage.setItem('careerpath_dark_mode', nextDark ? 'true' : 'false');
  };

  // Apply saved global appearance settings on mount & activeUser changes
  useEffect(() => {
    if (!activeUser) return;
    
    // 1. Apply Dark Mode
    document.documentElement.classList.toggle('dark', darkMode);

    // 2. Apply Font Size Scaling
    const size = localStorage.getItem('careerpath_font_size') || 'Normal';
    if (size === 'Small') {
      document.documentElement.style.fontSize = '14px';
    } else if (size === 'Large') {
      document.documentElement.style.fontSize = '18px';
    } else if (size === 'Extra Large') {
      document.documentElement.style.fontSize = '20px';
    } else {
      document.documentElement.style.fontSize = '16px';
    }

    // 3. Apply Accent Theme & Compact Sidebar
    const compact = localStorage.getItem('careerpath_compact_sidebar') === 'true';
    document.body.classList.toggle('compact-sidebar', compact);

    const colorAccent = localStorage.getItem('careerpath_color_accent') || 'BSC Crimson';
    applyAccentTheme(colorAccent);
  }, [activeUser, darkMode]);

  // Magpakita ng full-screen loading spinner habang ina-initialize at sini-sync ang data mula sa database
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <RefreshCw className="w-12 h-12 text-[#1e4620] animate-spin mb-4" />
        <span className="text-sm font-bold text-slate-700 uppercase tracking-widest animate-pulse">Initializing CareerPath...</span>
      </div>
    );
  }

  // Kapag hindi naka-login, i-redirect at i-lock ang view sa LoginView
  if (!activeUser) {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        users={users}
        onAddActivity={appendActivity}
      />
    );
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">

      {/* Visual top indicator strip gamit ang opisyal na berdeng kulay ng eskwelahan */}
      <div className="bg-[#1e4620] h-1 w-full shrink-0" />

      {/* TOP HEADER BAR: Profile details, alert badges, at mobile togglers */}
      <Header
        activeUser={activeUser}
        notifications={notifications}
        setCurrentTab={setCurrentTab}
        profileDropdownOpen={profileDropdownOpen}
        setProfileDropdownOpen={setProfileDropdownOpen}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        handleLogout={handleLogout}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        isOnline={isOnline}
        pendingSyncCount={pendingSyncCount}
        isSyncing={isSyncing}
        triggerManualSync={triggerManualSync}
      />

      {/* Main Layout Container (Sidebar + Content Stage Area) */}
      <div className="flex-1 flex flex-col md:flex-row relative min-h-0 overflow-hidden">

        {/* SIDEBAR: Static navigation panel na ipinapakita sa malalaking screen */}
        <Sidebar
          navigationItems={navigationItems}
          currentTab={currentTab}
          handleTabChange={handleTabChange}
        />

        {/* MOBILE MENU: Sliding mobile dropdown navigation link list para sa mobile screens */}
        <MobileMenu
          mobileMenuOpen={mobileMenuOpen}
          navigationItems={navigationItems}
          currentTab={currentTab}
          handleTabChange={handleTabChange}
          handleLogout={handleLogout}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* =========================================================================
            CORE STAGE WINDOW: Ipinapakita ang active view base sa currentTab state
            ========================================================================= */}
        <main id="main-content-stage" className="flex-1 overflow-y-auto min-h-0 h-full w-full bg-slate-50 font-sans transition-all duration-300">
          <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">

            {/* Dashboard View: Nagpapakita ng stats summaries para sa admin, chairperson, employer, o alumni */}
            {currentTab === 'Dashboard' && (
              <DashboardView
                alumni={scopedAlumniList}
                employers={employers}
                jobPostings={jobPostings}
                logs={scopedLogs}
                onNavigate={setCurrentTab}
                userName={activeUser.name}
                activeUser={activeUser}
                feedbacks={scopedFeedbacks}
              />
            )}

            {/* Alumni Management: Admin view para sa pag-register, pag-update, at pag-filter ng mga alumni */}
            {currentTab === 'Alumni' && (
              <AlumniManagementView
                alumniList={scopedAlumniList}
                activeUser={activeUser}
                onSaveAlumni={handleSaveAlumni}
                onDeleteAlumni={handleDeleteAlumni}
                onTriggerEmail={handleTriggerSingleEmailNudge}
                onImportAlumni={handleBulkImport}
              />
            )}

            {/* My Profile: Direct profile access page para sa mga naka-login na Alumni */}
            {currentTab === 'My Profile' && (
              <AlumniManagementView
                alumniList={scopedAlumniList}
                activeUser={activeUser}
                onSaveAlumni={handleSaveAlumni}
                onImportAlumni={handleBulkImport}
              />
            )}

            {/* Employers View: Listahan ng mga partnered regional employers para sa admin */}
            {currentTab === 'Employers' && (
              <EmployerManagementView
                employers={employers}
                activeUser={activeUser}
                onSaveEmployer={handleSaveEmployer}
                onInviteEmployer={handleInviteUserByEmail}
                alumniList={scopedAlumniList}
              />
            )}

            {/* Job Postings View: Mga forms at tables para pamahalaan ang mga bakanteng trabaho ng partner employers */}
            {currentTab === 'Job Postings' && (
              <JobPostingsView
                jobPostings={jobPostings}
                employers={employers}
                activeUser={activeUser}
                onSaveJob={handleSaveJob}
              />
            )}

            {/* Skills Matching: Awtomatikong pag-match ng profile ng mga graduate sa requirements ng trabaho */}
            {/* NOTE: Ipinapasa ang activeUser at employers para ma-filter ang view kapag Employer ang naka-login. */}
            {currentTab === 'Skills Match' && (
              <SkillsMatchingView
                jobPostings={jobPostings}
                alumniList={scopedAlumniList}
                activeUser={activeUser}
                employers={employers}
              />
            )}

            {/* Surveys View: Nag-e-render ng mga tracer questionnaires ng BSC */}
            {currentTab === 'Surveys' && (
              <SurveysView
                surveys={surveys}
                activeUser={activeUser}
                onSaveSurvey={handleSaveSurvey}
                surveyResponses={scopedSurveyResponses}
                onSubmitResponse={handleSubmitSurveyResponse}
              />
            )}

            {/* Curriculum Feedback: Pagsusuri ng mga employer sa relevancy ng curriculum ng BSC */}
            {currentTab === 'Curriculum Feedback' && (
              <FeedbackView
                feedbacks={scopedFeedbacks}
                alumniList={scopedAlumniList}
                employers={employers}
                activeUser={activeUser}
                onSubmitFeedback={handleSaveFeedback}
              />
            )}

            {/* NOTE: Tinanggal natin ang render block ng MessagingView dahil inalis na ang messaging feature. */}

            {/* Reports View: Pag-compile at pag-print ng mga analytics reports para sa CHED audits */}
            {currentTab === 'Reports' && (
              <ReportsView
                alumniList={scopedAlumniList}
                activeUser={activeUser}
              />
            )}

            {/* Employment View: Dedicated graduate placement tracker at employed alumni directory */}
            {currentTab === 'Employment' && activeUser?.role !== 'Alumni' && (
              <EmploymentView
                alumniList={scopedAlumniList}
                activeUser={activeUser}
              />
            )}

            {/* Activity Logs: Audit trail na nagpapakita ng lahat ng system activity */}
            {currentTab === 'Activity Log' && (
              <ActivityLogView
                logs={scopedLogs}
              />
            )}


            {/* Notifications View: Nagpapakita ng detalyadong listahan ng mga notification ng user */}
            {currentTab === 'Notifications' && (
              <NotificationsView
                notifications={notifications}
                onMarkRead={handleMarkNotifyRead}
              />
            )}

            {/* Message/Email: Communication broadcaster for alumni reminders and trace audits */}
            {currentTab === 'Message/Email' && (activeUser?.role === 'Administrator' || activeUser?.role === 'Super Admin') && (
              <MessageEmailView
                alumniList={alumniList}
                activeUser={activeUser}
                users={users}
                onSendReminders={handleSendBatchReminders}
                onInviteUserByEmail={handleInviteUserByEmail}
                onDeleteUser={handleDeleteUser}
              />
            )}

            {/* Settings: Personal settings, security preferences, alerts, and theme preferences */}
            {currentTab === 'Settings' && (
              <SettingsView
                activeUser={activeUser}
                setActiveUser={setActiveUser}
                onUpdateSession={handleUpdateUserSession}
              />
            )}

          </div>
        </main>

      </div>

      {/* STATIC PAGE FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-4 px-6 text-center text-[10px] select-none shrink-0 font-sans">
        <p>&copy; Graduate Tracer &amp; Curriculum Review, Batanes State College.</p>
        <p className="mt-1 text-slate-600">Secure Graduate Tracer &bull; Basco, Batanes, Philippines</p>
      </footer>

      {/* CONFIRMATION OR WARNING TOAST POPUP: Ipinapakita kapag nagtagumpay ang isang operasyon, update, o alert */}
      {toastMessage && (() => {
        const isWarning =
          toastMessage.toLowerCase().includes('error') ||
          toastMessage.toLowerCase().includes('fail') ||
          toastMessage.toLowerCase().includes('cannot') ||
          toastMessage.toLowerCase().includes('must') ||
          toastMessage.toLowerCase().includes('please') ||
          toastMessage.toLowerCase().includes('empty') ||
          toastMessage.toLowerCase().includes('invalid') ||
          toastMessage.toLowerCase().includes('resolve') ||
          toastMessage.toLowerCase().includes('warning');

        return (
          <div
            id="save-success-toast"
            className={`fixed bottom-6 right-6 ${isWarning ? 'bg-rose-950 border-rose-500/80' : 'bg-[#7c191e] border-amber-400'
              } text-white border shadow-2xl px-4 py-3 rounded-xl flex items-center gap-3 z-50 animate-bounce font-sans max-w-sm`}
          >
            <div className={`w-5 h-5 ${isWarning ? 'bg-rose-500 text-white' : 'bg-amber-400 text-slate-900'
              } rounded-full flex items-center justify-center font-black text-xs shrink-0 select-none`}>
              {isWarning ? '!' : '✓'}
            </div>
            <div className="space-y-0.5">
              <span className={`block text-[10px] font-extrabold uppercase tracking-widest ${isWarning ? 'text-rose-400' : 'text-amber-400'
                }`}>
                {isWarning ? 'Warning Alert' : 'Confirmation Alert'}
              </span>
              <span className="block text-[11px] font-semibold text-white leading-relaxed">{toastMessage}</span>
            </div>
          </div>
        );
      })()}

      {/* PWA Floating Install Banner for Mobile/Browser */}
      {showInstallBanner && (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-5 z-[100] animate-fade-in flex flex-col gap-3 font-sans">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md shrink-0 overflow-hidden border border-slate-100 p-1">
              <img src="/assets/logo.png" alt="BSC Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">Install BSC CareerPath</h4>
              <p className="text-[11px] text-slate-550 dark:text-slate-400 font-semibold leading-normal mt-0.5">
                Download this application on your phone for faster access, offline stability, and native notifications.
              </p>
            </div>
            <button 
              onClick={handleDismissInstall}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {deferredPrompt ? (
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={handleDismissInstall}
                className="px-3.5 py-1.5 text-[10px] font-bold text-slate-550 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-205 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 rounded-lg transition-all"
              >
                Not Now
              </button>
              <button
                onClick={handleInstallApp}
                className="px-4 py-1.5 text-[10px] font-black text-white bg-[#7c191e] hover:bg-[#601216] rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Install App
              </button>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
              <span className="text-[#7c191e] dark:text-[#ea580c] font-bold block mb-1">How to Install on your Device:</span>
              Tap the <span className="inline-flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 px-1.5 rounded-md font-bold text-slate-700 dark:text-slate-100 shadow-2xs mx-1"><Share className="w-3 h-3 text-slate-500" /> Share</span> button at the bottom of your browser, then select <span className="font-extrabold text-slate-800 dark:text-white">"Add to Home Screen"</span>.
            </div>
          )}
        </div>
      )}

    </div>
  );
}
