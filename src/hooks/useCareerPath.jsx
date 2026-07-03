/**
 * @file useCareerPath.jsx
 * @description Custom React state hook na namamahala sa core state ng BSC CareerPath application.
 * Kumokonekta ito sa stateless API service layer at nagbibigay ng dynamic scoping/filtering ng data base sa roles ng user.
 */

import React, { useState, useEffect } from 'react';
import {
  Layers, GraduationCap, PieChart, Building, Briefcase, CheckSquare,
  FileSpreadsheet, MessageSquare, BarChart3, Activity, Settings, Bell,
  Upload, Download
} from 'lucide-react';
import { DEPARTMENT_TO_PROGRAMS } from '../bscData';
import {
  fetchDashboardData,
  saveAlumni,
  saveEmployer,
  saveJob,
  saveSurvey,
  submitSurveyResponse,
  submitFeedback,
  bulkImportAlumni,
  deleteAlumni,
  sendBatchReminders,
  inviteUserByEmail,
  toggleNotificationRead,
  deleteUser
} from '../services/api';

export function useCareerPath() {
  
  // =========================================================================
  // PAMAMAHALA NG AUTHENTICATION & SESSION STATE
  // =========================================================================

  const [activeUser, setActiveUser] = useState(() => {
    try {
      const savedUser = sessionStorage.getItem('careerpath_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (err) {
      console.error('Failed to parse active user session:', err);
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return sessionStorage.getItem('careerpath_token') || null;
  });

  const getAuthHeaders = () => {
    const activeToken = token || sessionStorage.getItem('careerpath_token');
    return {
      'Content-Type': 'application/json',
      ...(activeToken ? { 'Authorization': `Bearer ${activeToken}` } : {})
    };
  };

  const [currentTab, setCurrentTab] = useState(() => {
    return sessionStorage.getItem('careerpath_tab') || 'Dashboard';
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // =========================================================================
  // MGA COLLECTIONS MULA SA DATABASE
  // =========================================================================
  const [users, setUsers] = useState([]);
  const [alumniList, setAlumniList] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [jobPostings, setJobPostings] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [surveyResponses, setSurveyResponses] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  const showSuccessToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  useEffect(() => {
    window.alert = (message) => {
      showSuccessToast(message);
    };
  }, []);

  /**
   * Nag-se-sync ng dashboard data mula sa API service.
   */
  const fetchData = async () => {
    try {
      const db = await fetchDashboardData();
      setUsers(db.users || []);
      setAlumniList(db.alumni || []);
      setEmployers(db.employers || []);
      setJobPostings(db.jobPostings || []);
      setSurveys(db.surveys || []);
      setFeedbacks(db.feedbacks || []);
      setLogs(db.logs || []);
      setNotifications(db.notifications || []);
      setSurveyResponses(db.surveyResponses || []);
    } catch (err) {
      console.error('Failed to sync backend state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeUser) {
      sessionStorage.setItem('careerpath_user', JSON.stringify(activeUser));
    } else {
      sessionStorage.removeItem('careerpath_user');
    }
  }, [activeUser]);

  useEffect(() => {
    sessionStorage.setItem('careerpath_tab', currentTab);
  }, [currentTab]);

  // =========================================================================
  // MGA ACTIONS / MUTATORS
  // =========================================================================

  const handleLoginSuccess = (user, loginToken) => {
    setActiveUser(user);
    if (loginToken) {
      setToken(loginToken);
      sessionStorage.setItem('careerpath_token', loginToken);
    }
    if (user.role === 'Alumni') {
      setCurrentTab('My Profile');
    } else {
      setCurrentTab('Dashboard');
    }
  };

  const handleLogout = () => {
    if (activeUser) {
      appendActivity(
        'User Safely Disconnected',
        'Authentication',
        `User session for '${activeUser.name}' terminated successfully.`,
        activeUser
      );
    }
    setActiveUser(null);
    setToken(null);
    sessionStorage.removeItem('careerpath_user');
    sessionStorage.removeItem('careerpath_tab');
    sessionStorage.removeItem('careerpath_token');
  };

  const appendActivity = async (action, module, details, userOverride) => {
    const actor = userOverride || activeUser;
    if (!actor) return;

    try {
      await submitFeedback({
        subject: action,
        category: 'System',
        message: `[LOG EVENT] ${details} (Module: ${module})`,
        rating: 5,
        submittedBy: actor.name
      }, actor.id, getAuthHeaders());
      fetchData();
    } catch (err) {
      console.error('Failed to append log:', err);
    }
  };

  const handleSaveAlumni = async (profile) => {
    try {
      await saveAlumni(profile, activeUser?.id, getAuthHeaders());
      await fetchData();
      showSuccessToast('Record saved successfully!');
    } catch (err) {
      console.error('Failed to post alumni update:', err);
    }
  };

  const handleSaveEmployer = async (employer) => {
    try {
      await saveEmployer(employer, activeUser?.id, getAuthHeaders());
      await fetchData();
      showSuccessToast('Record saved successfully!');
    } catch (err) {
      console.error('Failed to post employer:', err);
    }
  };

  const handleSaveJob = async (job) => {
    try {
      await saveJob(job, activeUser?.id, getAuthHeaders());
      await fetchData();
      showSuccessToast('Record saved successfully!');
    } catch (err) {
      console.error('Failed to deploy job vacancy:', err);
    }
  };

  const handleSaveSurvey = async (survey) => {
    try {
      await saveSurvey(survey, activeUser?.id, getAuthHeaders());
      await fetchData();
      showSuccessToast('Record saved successfully!');
    } catch (err) {
      console.error('Failed to post survey:', err);
    }
  };

  const handleSubmitSurveyResponse = async (surveyId, answers) => {
    try {
      await submitSurveyResponse(surveyId, activeUser?.id, activeUser?.name, answers, getAuthHeaders());
      await fetchData();
      showSuccessToast('Graduate Tracer Survey responses registered successfully!');
    } catch (err) {
      console.error('Failed to submit survey answers:', err);
    }
  };

  const handleSaveFeedback = async (feedback) => {
    try {
      await submitFeedback(feedback, activeUser?.id, getAuthHeaders());
      await fetchData();
      showSuccessToast('Record saved successfully!');
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  const handleBulkImport = async (rows) => {
    try {
      await bulkImportAlumni(rows, activeUser?.id, getAuthHeaders());
      await fetchData();
      showSuccessToast('Record saved successfully!');
    } catch (err) {
      console.error('Failed to bulk import:', err);
    }
  };

  const handleDeleteAlumni = async (studentId) => {
    try {
      const db = await deleteAlumni(studentId, activeUser?.id, getAuthHeaders());
      setAlumniList(db.alumni || []);
      setUsers(db.users || []);
      showSuccessToast('Alumnus profile deleted successfully.');
    } catch (err) {
      console.error('Failed to delete alumnus:', err);
      alert(err.message || 'Failed to delete alumnus.');
    }
  };

  const handleSendBatchReminders = async (targetIds, customSubject, customBody) => {
    try {
      await sendBatchReminders(targetIds, activeUser?.id, customSubject, customBody, getAuthHeaders());
      await fetchData();
    } catch (err) {
      console.error('Failed to dispatch emails:', err);
    }
  };

  const handleInviteUserByEmail = async (email, role) => {
    try {
      await inviteUserByEmail(email, role, activeUser?.id, getAuthHeaders());
      await fetchData();
    } catch (err) {
      console.error('Failed to invite user:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const db = await deleteUser(userId, activeUser?.id, getAuthHeaders());
      setUsers(db.users || []);
      showSuccessToast('User account deleted successfully.');
    } catch (err) {
      console.error('Failed to delete user:', err);
      alert(err.message || 'Failed to delete user.');
    }
  };

  const handleTriggerSingleEmailNudge = async (studentId) => {
    await handleSendBatchReminders([studentId]);
    alert('Email Reminder safely dispatched from Batanes State College!');
  };

  const handleMarkNotifyRead = async (id) => {
    try {
      const target = notifications.find(n => n.id === id);
      const nextState = target ? !target.read : true;
      await toggleNotificationRead(id, nextState, getAuthHeaders());
      await fetchData();
    } catch (err) {
      console.error('Failed to toggle notification read status:', err);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
    }
  };

  const handleTabChange = (id) => {
    setCurrentTab(id);
    setMobileMenuOpen(false);
  };

  // =========================================================================
  // MGA DATA FILTER WRAPPER & PRIVACY SECURITIES
  // =========================================================================

  const isChairperson = activeUser?.role === 'Department Chairperson';
  const chairProgram = activeUser?.program || '';

  const isAlumnusInChairDept = (al) => {
    if (!al || !al.program) return false;
    const normalizedAl = al.program.toLowerCase();
    const normalizedChair = chairProgram.toLowerCase();
    if (normalizedAl === normalizedChair || normalizedAl.includes(normalizedChair) || normalizedChair.includes(normalizedAl)) {
      return true;
    }
    const allowed = DEPARTMENT_TO_PROGRAMS[chairProgram] || [];
    return allowed.some(allowedProg => {
      const normalizedAllowed = allowedProg.toLowerCase();
      return normalizedAl.includes(normalizedAllowed) || normalizedAllowed.includes(normalizedAl);
    });
  };

  const scopedAlumniList = isChairperson
    ? alumniList.filter(isAlumnusInChairDept)
    : alumniList;

  const scopedFeedbacks = isChairperson
    ? feedbacks.filter(fb => {
        const matchingAlum = alumniList.find(a => a.studentId === fb.alumniStudentId || a.name.toLowerCase() === fb.alumniName?.toLowerCase());
        return matchingAlum && isAlumnusInChairDept(matchingAlum);
      })
    : feedbacks;

  const scopedSurveyResponses = isChairperson
    ? surveyResponses.filter(r => {
        const matchingAlum = alumniList.find(a => a.studentId === r.alumniId);
        return matchingAlum && isAlumnusInChairDept(matchingAlum);
      })
    : surveyResponses;

  const scopedLogs = isChairperson
    ? logs.filter(log => {
        if (log.userId === activeUser.id || log.userName === activeUser.name) return true;
        if (log.details?.toLowerCase().includes(chairProgram.toLowerCase())) return true;
        const matchingAlum = alumniList.find(a => log.details?.includes(a.studentId) || log.details?.includes(a.name));
        return matchingAlum && isAlumnusInChairDept(matchingAlum);
      })
    : logs;

  const scopedNotifications = (() => {
    if (!activeUser) return [];
    
    const role = activeUser.role;
      if (role === 'Administrator' || role === 'Super Admin') {
      return notifications;
    }
    
    if (role === 'Department Chairperson') {
      return notifications.filter(n => {
        const titleLower = n.title.toLowerCase();
        const textLower = n.text.toLowerCase();
        const userLower = activeUser.name.toLowerCase();
        const programLower = activeUser.program?.toLowerCase() || '';
        
        if (titleLower.includes(userLower) || textLower.includes(userLower)) return true;
        if (programLower && (titleLower.includes(programLower) || textLower.includes(programLower))) return true;
        
        const matchedAlum = alumniList.find(a => 
          textLower.includes(a.name.toLowerCase()) || 
          textLower.includes(a.studentId.toLowerCase())
        );
        return !!(matchedAlum && matchedAlum.program === activeUser.program);
      });
    }
    
    if (role === 'Alumni') {
      return notifications.filter(n => {
        const titleLower = n.title.toLowerCase();
        const textLower = n.text.toLowerCase();
        const userLower = activeUser.name.toLowerCase();
        const idLower = activeUser.id.toLowerCase();
        
        if (textLower.includes('message dispatched to')) {
          return textLower.includes(userLower) || textLower.includes(idLower);
        }
        
        if (titleLower.includes('profile incomplete')) {
          const myAlumni = alumniList.find(a => a.studentId === activeUser.id);
          const completeness = myAlumni?.profileCompleteness ?? 0;
          return completeness < 80;
        }
        
        return titleLower.includes(userLower) || textLower.includes(userLower) ||
               titleLower.includes(idLower) || textLower.includes(idLower);
      });
    }
    
    if (role === 'Employer') {
      return notifications.filter(n => {
        const titleLower = n.title.toLowerCase();
        const textLower = n.text.toLowerCase();
        const userLower = activeUser.name.toLowerCase();
        
        const myEmployerProfile = employers.find(e => e.email.toLowerCase() === activeUser.email.toLowerCase());
        const companyLower = myEmployerProfile?.companyName?.toLowerCase() || '';
        
        return titleLower.includes(userLower) || textLower.includes(userLower) ||
               (companyLower && (titleLower.includes(companyLower) || textLower.includes(companyLower)));
      });
    }
    
    return [];
  })();

  // =========================================================================
  // PAG-GENERATE NG MGA NAVIGATION ITEMS
  // =========================================================================

    const isAdminOrChair = activeUser?.role === 'Super Admin' || activeUser?.role === 'Administrator' || activeUser?.role === 'Department Chairperson';

  const navigationItems = isAdminOrChair
    ? [
        { id: 'Dashboard', name: 'Dashboard', icon: <Layers className="w-4 h-4" /> },
        { id: 'Alumni', name: 'Alumni Profiles', icon: <GraduationCap className="w-4 h-4" /> },
        { id: 'Employment', name: 'Employment', icon: <PieChart className="w-4 h-4" /> },
        { id: 'Employers', name: 'Employers', icon: <Building className="w-4 h-4" /> },
        { id: 'Job Postings', name: 'Job Vacancies', icon: <Briefcase className="w-4 h-4" /> },
        { id: 'Skills Match', name: 'Skills Matching', icon: <CheckSquare className="w-4 h-4" /> },
        { id: 'Surveys', name: 'Surveys', icon: <FileSpreadsheet className="w-4 h-4" /> },
        { id: 'Curriculum Feedback', name: 'Feedback', icon: <MessageSquare className="w-4 h-4" /> },
        { id: 'Reports', name: 'Reports', icon: <BarChart3 className="w-4 h-4" /> },
        { id: 'Import', name: 'Import', icon: <Upload className="w-4 h-4" /> },
        { id: 'Export', name: 'Export', icon: <Download className="w-4 h-4" /> },
        { id: 'Activity Log', name: 'Activity Logs', icon: <Activity className="w-4 h-4" /> },
       ...((activeUser.role === 'Administrator' || activeUser.role === 'Super Admin') ? [{ id: 'Settings', name: 'Settings', icon: <Settings className="w-4 h-4" /> }] : [])
      ]
    : activeUser?.role === 'Alumni'
    ? [
        { id: 'Dashboard', name: 'Dashboard', icon: <Layers className="w-4 h-4" /> },
        { id: 'My Profile', name: 'My Profile', icon: <GraduationCap className="w-4 h-4" /> },
        { id: 'Job Postings', name: 'Job Vacancies', icon: <Briefcase className="w-4 h-4" /> },
        { id: 'Skills Match', name: 'Skills Matching', icon: <CheckSquare className="w-4 h-4" /> },
        { id: 'Surveys', name: 'Surveys', icon: <FileSpreadsheet className="w-4 h-4" /> },
        { id: 'Curriculum Feedback', name: 'Curriculum Feedback', icon: <MessageSquare className="w-4 h-4" /> },
        { id: 'Notifications', name: 'Notifications', icon: <Bell className="w-4 h-4" />, count: scopedNotifications.filter(n => !n.read).length }
      ]
    : [
        { id: 'Dashboard', name: 'Dashboard', icon: <Layers className="w-4 h-4" /> },
        { id: 'Job Postings', name: 'Job Vacancies', icon: <Briefcase className="w-4 h-4" /> },
        { id: 'Skills Match', name: 'Skills Matching', icon: <CheckSquare className="w-4 h-4" /> },
        { id: 'Curriculum Feedback', name: 'Curriculum Feedback', icon: <MessageSquare className="w-4 h-4" /> }
      ];

  return {
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
    feedbacks,
    logs,
    notifications: scopedNotifications,
    surveyResponses,
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
    appendActivity
  };
}
