/**
 * @file useCareerPath.jsx
 * @description Custom React state hook na namamahala sa core state ng BSC CareerPath application.
 * Kumokonekta ito sa stateless API service layer at nagbibigay ng dynamic scoping/filtering ng data base sa roles ng user.
 */

import React, { useState, useEffect } from 'react';
import {
  Layers, GraduationCap, PieChart, Building, Briefcase, CheckSquare,
  FileSpreadsheet, MessageSquare, BarChart3, Activity, Settings, Bell,
  Upload, Download, Mail
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
  // OFFLINE & BACKGROUND SYNC STATE
  // =========================================================================
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(() => {
    try {
      const saved = localStorage.getItem('careerpath_offline_queue');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse offline sync queue:', e);
      return [];
    }
  });
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showSuccessToast('Internet connection restored! Syncing pending data...');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showSuccessToast('You are offline. Changes will be saved locally.');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('careerpath_offline_queue', JSON.stringify(pendingSync));
  }, [pendingSync]);

  const queueOfflineAction = (action, payload, stateUpdater) => {
    setPendingSync(prev => [...prev, { action, payload, id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 5)}` }]);
    stateUpdater();
    // Cache the updated state locally so a reload keeps it
    setTimeout(() => {
      const updatedDB = {
        users,
        alumni: alumniList,
        employers,
        jobPostings,
        surveys,
        feedbacks,
        logs,
        notifications,
        surveyResponses
      };
      localStorage.setItem('careerpath_dashboard_cache', JSON.stringify(updatedDB));
    }, 200);
    showSuccessToast('Offline: Saved change locally. Will sync when back online.');
  };

  const syncPendingData = async (queueToSync = pendingSync) => {
    if (queueToSync.length === 0 || isSyncing || !navigator.onLine) return;
    setIsSyncing(true);
    
    let currentQueue = [...queueToSync];
    let failedItems = [];
    
    for (const item of currentQueue) {
      try {
        const headers = getAuthHeaders();
        if (item.action === 'saveAlumni') {
          await saveAlumni(item.payload.profile, item.payload.activeUserId, headers);
        } else if (item.action === 'saveEmployer') {
          await saveEmployer(item.payload.employer, item.payload.activeUserId, headers);
        } else if (item.action === 'saveJob') {
          await saveJob(item.payload.job, item.payload.activeUserId, headers);
        } else if (item.action === 'saveSurvey') {
          await saveSurvey(item.payload.survey, item.payload.activeUserId, headers);
        } else if (item.action === 'submitSurveyResponse') {
          await submitSurveyResponse(
            item.payload.surveyId, 
            item.payload.alumniId, 
            item.payload.alumniName, 
            item.payload.answers, 
            headers
          );
        } else if (item.action === 'saveFeedback') {
          await submitFeedback(item.payload.feedback, item.payload.activeUserId, headers);
        }
      } catch (err) {
        console.error(`Failed to sync action: ${item.action}`, err);
        const isAuthError = err.message.includes('Access Denied') || 
                            err.message.includes('Token Missing') || 
                            err.message.includes('status: 401') || 
                            err.message.includes('status: 403');
        if (isAuthError) {
          showSuccessToast('Session expired. Please log in again to sync changes.');
          setActiveUser(null);
          setToken(null);
          sessionStorage.removeItem('careerpath_user');
          sessionStorage.removeItem('careerpath_token');
          sessionStorage.removeItem('careerpath_tab');
          failedItems = currentQueue.slice(currentQueue.indexOf(item));
          break;
        }
        // If it's a network/connection error, stop syncing and keep the rest
        if (!navigator.onLine || err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          failedItems = currentQueue.slice(currentQueue.indexOf(item));
          break;
        }
      }
    }
    
    setPendingSync(failedItems);
    setIsSyncing(false);
    
    if (failedItems.length === 0) {
      showSuccessToast('Offline sync completed successfully!');
      fetchData();
    } else {
      showSuccessToast(`Sync paused. ${failedItems.length} items remaining.`);
    }
  };

  useEffect(() => {
    if (isOnline && pendingSync.length > 0) {
      syncPendingData();
    }
  }, [isOnline, pendingSync.length]);
  
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

  const getAuthHeaders = (tokenOverride) => {
    const activeToken = tokenOverride || token || sessionStorage.getItem('careerpath_token');
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

  const fetchData = async () => {
    try {
      const db = await fetchDashboardData(getAuthHeaders());
      setUsers(db.users || []);
      setAlumniList(db.alumni || []);
      setEmployers(db.employers || []);
      setJobPostings(db.jobPostings || []);
      setSurveys(db.surveys || []);
      setFeedbacks(db.feedbacks || []);
      setLogs(db.logs || []);
      setNotifications(db.notifications || []);
      setSurveyResponses(db.surveyResponses || []);
      
      // Save cache to localStorage
      localStorage.setItem('careerpath_dashboard_cache', JSON.stringify(db));
    } catch (err) {
      console.error('Failed to sync backend state:', err);
      // Fallback to cache if available
      const cached = localStorage.getItem('careerpath_dashboard_cache');
      if (cached) {
        try {
          const db = JSON.parse(cached);
          setUsers(db.users || []);
          setAlumniList(db.alumni || []);
          setEmployers(db.employers || []);
          setJobPostings(db.jobPostings || []);
          setSurveys(db.surveys || []);
          setFeedbacks(db.feedbacks || []);
          setLogs(db.logs || []);
          setNotifications(db.notifications || []);
          setSurveyResponses(db.surveyResponses || []);
          showSuccessToast('Offline: Loaded cached dashboard data.');
        } catch (e) {
          console.error('Failed to parse cached dashboard data:', e);
        }
      }
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
    if (user.role) {
      localStorage.setItem(`careerpath_last_username_${user.role}`, user.userId);
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

  // Idle timeout / Inactivity logout
  useEffect(() => {
    if (!activeUser) return;

    let timeoutId;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleLogout();
        showSuccessToast('You have been logged out due to inactivity for security purposes.');
      }, 10 * 60 * 1000); // 10 minutes idle timeout
    };

    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [activeUser]);

  const appendActivity = async (action, module, details, userOverride, tokenOverride) => {
    const actor = userOverride || activeUser;
    if (!actor) return;

    try {
      await submitFeedback({
        subject: action,
        category: 'System',
        message: `[LOG EVENT] ${details} (Module: ${module})`,
        rating: 5,
        submittedBy: actor.name
      }, actor.id, getAuthHeaders(tokenOverride));
      fetchData();
    } catch (err) {
      console.error('Failed to append log:', err);
    }
  };

  const handleSaveAlumni = async (profile) => {
    if (!isOnline) {
      queueOfflineAction('saveAlumni', { profile, activeUserId: activeUser?.id }, () => {
        setAlumniList(prev => {
          const idx = prev.findIndex(a => a.studentId === profile.studentId);
          const updatedProfile = { ...profile, lastUpdated: new Date().toISOString() };
          if (idx !== -1) {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], ...updatedProfile };
            return copy;
          } else {
            return [updatedProfile, ...prev];
          }
        });
        setUsers(prev => {
          const idx = prev.findIndex(u => u.id === profile.studentId);
          const fullName = [profile.firstName, profile.middleName, profile.lastName, profile.suffix].filter(Boolean).join(' ');
          const updatedUser = { id: profile.studentId, name: fullName, email: profile.email, avatar: profile.avatar || null };
          if (idx !== -1) {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], ...updatedUser };
            return copy;
          } else {
            return [updatedUser, ...prev];
          }
        });
      });
      return;
    }
    try {
      await saveAlumni(profile, activeUser?.id, getAuthHeaders());
      await fetchData();
      showSuccessToast('Record saved successfully!');
    } catch (err) {
      console.error('Failed to post alumni update:', err);
    }
  };

  const handleSaveEmployer = async (employer) => {
    if (!isOnline) {
      queueOfflineAction('saveEmployer', { employer, activeUserId: activeUser?.id }, () => {
        setEmployers(prev => {
          const idx = prev.findIndex(e => e.id === employer.id || e.email === employer.email);
          if (idx !== -1) {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], ...employer };
            return copy;
          } else {
            const newEmp = { ...employer, id: employer.id || `temp_emp_${Date.now()}` };
            return [newEmp, ...prev];
          }
        });
      });
      return;
    }
    try {
      await saveEmployer(employer, activeUser?.id, getAuthHeaders());
      await fetchData();
      showSuccessToast('Record saved successfully!');
    } catch (err) {
      console.error('Failed to post employer:', err);
    }
  };

  const handleSaveJob = async (job) => {
    if (!isOnline) {
      queueOfflineAction('saveJob', { job, activeUserId: activeUser?.id }, () => {
        setJobPostings(prev => {
          const idx = prev.findIndex(j => j.id === job.id);
          if (idx !== -1) {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], ...job };
            return copy;
          } else {
            const newJob = { ...job, id: job.id || `temp_job_${Date.now()}`, createdAt: new Date().toISOString() };
            return [newJob, ...prev];
          }
        });
      });
      return;
    }
    try {
      await saveJob(job, activeUser?.id, getAuthHeaders());
      await fetchData();
      showSuccessToast('Record saved successfully!');
    } catch (err) {
      console.error('Failed to deploy job vacancy:', err);
    }
  };

  const handleSaveSurvey = async (survey) => {
    if (!isOnline) {
      queueOfflineAction('saveSurvey', { survey, activeUserId: activeUser?.id }, () => {
        setSurveys(prev => {
          const idx = prev.findIndex(s => s.id === survey.id);
          if (idx !== -1) {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], ...survey };
            return copy;
          } else {
            const newSurvey = { ...survey, id: survey.id || `temp_survey_${Date.now()}`, createdAt: new Date().toISOString() };
            return [newSurvey, ...prev];
          }
        });
      });
      return;
    }
    try {
      await saveSurvey(survey, activeUser?.id, getAuthHeaders());
      await fetchData();
      showSuccessToast('Record saved successfully!');
    } catch (err) {
      console.error('Failed to post survey:', err);
    }
  };

  const handleSubmitSurveyResponse = async (surveyId, answers) => {
    if (!isOnline) {
      queueOfflineAction('submitSurveyResponse', { surveyId, alumniId: activeUser?.id, alumniName: activeUser?.name, answers }, () => {
        setSurveyResponses(prev => {
          const newResponse = {
            surveyId,
            alumniId: activeUser?.id,
            alumniName: activeUser?.name,
            answers,
            submittedAt: new Date().toISOString()
          };
          return [newResponse, ...prev];
        });
      });
      return;
    }
    try {
      await submitSurveyResponse(surveyId, activeUser?.id, activeUser?.name, answers, getAuthHeaders());
      await fetchData();
      showSuccessToast('Graduate Tracer Survey responses registered successfully!');
    } catch (err) {
      console.error('Failed to submit survey answers:', err);
    }
  };

  const handleSaveFeedback = async (feedback) => {
    if (!isOnline) {
      queueOfflineAction('saveFeedback', { feedback, activeUserId: activeUser?.id }, () => {
        setFeedbacks(prev => {
          const newFeedback = {
            ...feedback,
            id: `temp_fb_${Date.now()}`,
            submittedAt: new Date().toISOString(),
            alumniStudentId: activeUser?.role === 'Alumni' ? activeUser.id : null,
            alumniName: activeUser?.role === 'Alumni' ? activeUser.name : null
          };
          return [newFeedback, ...prev];
        });
      });
      return;
    }
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
      const response = await bulkImportAlumni(rows, activeUser?.id, getAuthHeaders());
      if (response && response.users && response.alumni) {
        setUsers(response.users);
        setAlumniList(response.alumni);
        const cached = localStorage.getItem('careerpath_dashboard_cache');
        if (cached) {
          try {
            const db = JSON.parse(cached);
            db.users = response.users;
            db.alumni = response.alumni;
            localStorage.setItem('careerpath_dashboard_cache', JSON.stringify(db));
          } catch (e) {
            console.error('Failed to update dashboard cache:', e);
          }
        }
      } else {
        await fetchData();
      }
      showSuccessToast('Record saved successfully!');
    } catch (err) {
      console.warn('Failed to bulk import on server. Falling back to local/offline state:', err);
      
      const newAlumni = rows.map((row, idx) => {
        const studentId = row.studentId || `BSC-2026-${Math.floor(100 + Math.random() * 900)}`;
        const name = row.name || `${row.firstName || 'First'} ${row.lastName || 'Last'}`;
        const email = row.email || `${studentId.toLowerCase()}@example.com`;
        
        return {
          studentId,
          name,
          firstName: row.firstName || name.split(' ')[0],
          lastName: row.lastName || name.split(' ').slice(1).join(' '),
          email,
          phone: row.phone || '',
          gender: row.gender || '',
          civilStatus: row.civilStatus || '',
          dateOfBirth: row.dateOfBirth || '',
          address: row.address || '',
          program: row.program || 'Bachelor of Science in Information Technology',
          yearGraduated: parseInt(row.yearGraduated) || 2026,
          honors: row.honors || '',
          professionalExamPassed: row.professionalExamPassed || '',
          employmentStatus: row.employmentStatus || 'No Response',
          jobTitle: row.jobTitle || '',
          jobDescription: row.jobDescription || '',
          employerName: row.employerName || '',
          employmentType: row.employmentType || '',
          sector: row.sector || '',
          monthlyIncome: row.monthlyIncome || '',
          jobRelatedToCourse: row.jobRelatedToCourse || '',
          timeToFirstJob: row.timeToFirstJob || '',
          skills: row.skills || [],
          profileCompleteness: 40,
          isRegistered: false,
          lastUpdated: new Date().toISOString()
        };
      });

      setAlumniList(prev => {
        const copy = [...prev];
        newAlumni.forEach(na => {
          const existingIdx = copy.findIndex(a => a.studentId.trim().toLowerCase() === na.studentId.trim().toLowerCase());
          if (existingIdx !== -1) {
            copy[existingIdx] = { ...copy[existingIdx], ...na };
          } else {
            copy.unshift(na);
          }
        });
        return copy;
      });

      setUsers(prev => {
        const copy = [...prev];
        newAlumni.forEach(na => {
          const existingIdx = copy.findIndex(u => u.id.trim().toLowerCase() === na.studentId.trim().toLowerCase());
          const newUserItem = {
            id: na.studentId,
            userId: na.studentId,
            name: na.name,
            email: na.email,
            role: 'Alumni',
            isInitialPasswordNeeded: true,
            avatar: null
          };
          if (existingIdx !== -1) {
            copy[existingIdx] = { ...copy[existingIdx], ...newUserItem };
          } else {
            copy.unshift(newUserItem);
          }
        });
        return copy;
      });

      const cached = localStorage.getItem('careerpath_dashboard_cache');
      if (cached) {
        try {
          const db = JSON.parse(cached);
          db.alumni = db.alumni || [];
          db.users = db.users || [];
          
          newAlumni.forEach(na => {
            const idxA = db.alumni.findIndex(a => a.studentId.trim().toLowerCase() === na.studentId.trim().toLowerCase());
            if (idxA !== -1) db.alumni[idxA] = { ...db.alumni[idxA], ...na };
            else db.alumni.unshift(na);

            const idxU = db.users.findIndex(u => u.id.trim().toLowerCase() === na.studentId.trim().toLowerCase());
            const newUserItem = {
              id: na.studentId,
              userId: na.studentId,
              name: na.name,
              email: na.email,
              role: 'Alumni',
              isInitialPasswordNeeded: true,
              avatar: null
            };
            if (idxU !== -1) db.users[idxU] = { ...db.users[idxU], ...newUserItem };
            else db.users.unshift(newUserItem);
          });

          localStorage.setItem('careerpath_dashboard_cache', JSON.stringify(db));
        } catch (e) {
          console.error('Failed to update local cache during bulk import:', e);
        }
      }

      showSuccessToast('Records saved locally (Offline mode)!');
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
      const res = await sendBatchReminders(targetIds, activeUser?.id, customSubject, customBody, getAuthHeaders());
      await fetchData();
      if (targetIds.length > 1) {
        const failed = res.results ? res.results.filter(r => !r.success) : [];
        if (failed.length === 0) {
          showSuccessToast(`Successfully sent reminders to all ${targetIds.length} alumni!`);
        } else {
          showSuccessToast(`Sent reminders: ${targetIds.length - failed.length} succeeded, ${failed.length} failed.`);
        }
      }
      return res;
    } catch (err) {
      console.error('Failed to dispatch emails:', err);
      showSuccessToast('Failed to dispatch reminder emails.');
      throw err;
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
    try {
      const alumnus = alumniList.find(a => a.studentId === studentId);
      const nameStr = alumnus ? alumnus.name : 'Alumnus';
      const res = await handleSendBatchReminders([studentId]);
      
      const resultObj = res.results && res.results[0];
      if (resultObj && resultObj.success) {
        showSuccessToast(`Tracer reminder email sent successfully to ${nameStr}!`);
      } else {
        const errorMsg = resultObj ? resultObj.error : 'SMTP connection failed';
        showSuccessToast(`Failed to send email: ${errorMsg}`);
      }
    } catch (err) {
      console.error(err);
      showSuccessToast('Failed to dispatch reminder email.');
    }
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

  const handleUpdateUserSession = (updatedUser, newToken) => {
    setActiveUser(updatedUser);
    sessionStorage.setItem('careerpath_user', JSON.stringify(updatedUser));
    if (updatedUser.role) {
      localStorage.setItem(`careerpath_last_username_${updatedUser.role}`, updatedUser.userId);
    }
    if (newToken) {
      setToken(newToken);
      sessionStorage.setItem('careerpath_token', newToken);
    }
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

  const isAdmin = activeUser?.role === 'Super Admin' || activeUser?.role === 'Administrator';
  const isChair = activeUser?.role === 'Department Chairperson';

  const navigationItems = isAdmin
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
        { id: 'Activity Log', name: 'Activity Logs', icon: <Activity className="w-4 h-4" /> },
        { id: 'Message/Email', name: 'Message/Email', icon: <Mail className="w-4 h-4" /> },
        { id: 'Settings', name: 'Settings', icon: <Settings className="w-4 h-4" /> }
      ]
    : isChair
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
        { id: 'Settings', name: 'Settings', icon: <Settings className="w-4 h-4" /> }
      ]
    : activeUser?.role === 'Alumni'
    ? [
        { id: 'Dashboard', name: 'Dashboard', icon: <Layers className="w-4 h-4" /> },
        { id: 'My Profile', name: 'My Profile', icon: <GraduationCap className="w-4 h-4" /> },
        { id: 'Job Postings', name: 'Job Vacancies', icon: <Briefcase className="w-4 h-4" /> },
        { id: 'Skills Match', name: 'Skills Matching', icon: <CheckSquare className="w-4 h-4" /> },
        { id: 'Surveys', name: 'Surveys', icon: <FileSpreadsheet className="w-4 h-4" /> },
        { id: 'Curriculum Feedback', name: 'Curriculum Feedback', icon: <MessageSquare className="w-4 h-4" /> },
        { id: 'Settings', name: 'Settings', icon: <Settings className="w-4 h-4" /> }
      ]
    : [
        { id: 'Dashboard', name: 'Dashboard', icon: <Layers className="w-4 h-4" /> },
        { id: 'Job Postings', name: 'Job Vacancies', icon: <Briefcase className="w-4 h-4" /> },
        { id: 'Skills Match', name: 'Skills Matching', icon: <CheckSquare className="w-4 h-4" /> },
        { id: 'Curriculum Feedback', name: 'Curriculum Feedback', icon: <MessageSquare className="w-4 h-4" /> },
        { id: 'Settings', name: 'Settings', icon: <Settings className="w-4 h-4" /> }
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
    handleUpdateUserSession,
    appendActivity,
    isOnline,
    pendingSyncCount: pendingSync.length,
    isSyncing,
    triggerManualSync: () => syncPendingData()
  };
}
