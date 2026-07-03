import React, { useState } from 'react';
import { Shield, BookOpen, Users, Briefcase, Eye, EyeOff, Lock, RefreshCw, Key, Mail, ShieldAlert } from 'lucide-react';

export default function LoginView({ onLoginSuccess, users, onAddActivity }) {
  // Step 1: Role Selection panel (Administrator, Department Chairperson, Alumni, Employer)
  // Step 2: Ilagay ang credentials para sa napiling role
  // Step 3: Kung ang kandidato ay may `isInitialPasswordNeeded`, harangan muna para baguhin ang password!

  const [selectedRole, setSelectedRole] = useState(null);
  const [userIdInput, setUserIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Workflow para sa pag-reset ng password sa unang pagkakataon na mag-login (first login reset workflow)
  const [passwordResetUser, setPasswordResetUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Workflow para sa Password Recovery (pagbawi ng password)
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoveryNewPassword, setRecoveryNewPassword] = useState('');
  const [recoveryConfirmPassword, setRecoveryConfirmPassword] = useState('');
  const [recoveryStep, setRecoveryStep] = useState(1); // 1 = Enter Email, 2 = Enter Code & New Pass
  const [recoveryError, setRecoveryError] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState('');

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setErrorMessage('');
    // Awtomatikong nilalagyan ang mga field ng username para sa madaling pag-test, ngunit iniiwang blanko ang password
    if (role === 'Super Admin') {
      setUserIdInput('superadmin');
      setPasswordInput('');
    } else if (role === 'Administrator') {
      setUserIdInput('admin');
      setPasswordInput('');
    } else if (role === 'Department Chairperson') {
      setUserIdInput('chair_it');
      setPasswordInput('');
    } else if (role === 'Alumni') {
      setUserIdInput('BSC-2020-001');
      setPasswordInput('');
    } else if (role === 'Employer') {
      setUserIdInput('techbatanes');
      setPasswordInput('');
    }
  };

  const handleBackToRoles = () => {
    setSelectedRole(null);
    setUserIdInput('');
    setPasswordInput('');
    setErrorMessage('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!userIdInput.trim() || !passwordInput.trim()) {
      setErrorMessage('Please fill in all credential fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userIdInput.trim(), password: passwordInput.trim() })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Login failed');
      }

      const result = await response.json();
      const authenticatedUser = result.user;

      // Tinitiyak na ang role ng user ay tumutugma sa napiling role
      if (authenticatedUser.role !== selectedRole) {
        throw new Error(`Account detected, but role is registered as '${authenticatedUser.role}' rather than requested '${selectedRole}'.`);
      }

      // Security Protocol: Kung ang initial password flag ay totoo (kailangang palitan ang temporal password)
      if (authenticatedUser.isInitialPasswordNeeded) {
        setPasswordResetUser(authenticatedUser);
        setIsSubmitting(false);
        return;
      }

      // Magpatuloy nang normal kung okay ang lahat
      onAddActivity(
        'User Secured Portal Entrance',
        'Authentication',
        `Logged in successfully as ${authenticatedUser.name} (${authenticatedUser.role})`,
        authenticatedUser
      );
      onLoginSuccess(authenticatedUser, result.token);

    } catch (err) {
      setErrorMessage(err.message || 'Authentication rejected.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();
    setResetError('');

    const lengthValid = newPassword.length >= 8;
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
    const differentFromOld = newPassword !== passwordInput &&
      newPassword !== 'admin123' &&
      newPassword !== 'chair123' &&
      newPassword !== 'alumni123' &&
      newPassword !== 'employer123' &&
      newPassword !== passwordResetUser?.userId;

    if (!lengthValid || !hasUpper || !hasLower || !hasNumber || !hasSpecial || !differentFromOld) {
      setResetError('Your new password does not satisfy all security strength requirements.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Confirmation password does not match.');
      return;
    }

    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: passwordResetUser?.userId, newPassword })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to apply new credentials');
      }

      const result = await response.json();
      const updatedUser = result.user;

      setSuccessToast('Credentials updated! Welcome to CareerPath under private password!');

      setTimeout(() => {
        onAddActivity(
          'Updated Initial Password',
          'Security Check',
          `Successfully replaced temporal credentials for account ${updatedUser.name}.`,
          updatedUser
        );
        onLoginSuccess(updatedUser, result.token);
      }, 1800);

    } catch (err) {
      setResetError(err.message || 'Failed to update password.');
    }
  };

  const handleRecoveryEmailSubmit = async (e) => {
    e.preventDefault();
    setRecoveryError('');
    setRecoverySuccess('');
    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail.trim() })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to dispatch reset code.');
      }
      setRecoverySuccess('A 6-digit verification code has been generated and sent.');
      setRecoveryStep(2);
    } catch (err) {
      setRecoveryError(err.message);
    }
  };

  const handleRecoveryResetSubmit = async (e) => {
    e.preventDefault();
    setRecoveryError('');
    setRecoverySuccess('');

    if (recoveryNewPassword.length < 8) {
      setRecoveryError('Password must be at least 8 characters long.');
      return;
    }
    if (recoveryNewPassword !== recoveryConfirmPassword) {
      setRecoveryError('Passwords do not match.');
      return;
    }

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: recoveryEmail.trim(),
          code: recoveryCode.trim(),
          newPassword: recoveryNewPassword
        })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Reset failed.');
      }
      setRecoverySuccess('Password reset successfully! Logging you in...');
      
      setTimeout(async () => {
        try {
          const loginRes = await fetch('/api/data');
          if (loginRes.ok) {
            const db = await loginRes.json();
            const matchingUser = db.users.find(u => u.email.toLowerCase() === recoveryEmail.trim().toLowerCase());
            if (matchingUser) {
              const authRes = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: matchingUser.userId, password: recoveryNewPassword })
              });
              if (authRes.ok) {
                const result = await authRes.json();
                onLoginSuccess(result.user, result.token);
              } else {
                window.location.reload();
              }
            } else {
              window.location.reload();
            }
          } else {
            window.location.reload();
          }
        } catch {
          window.location.reload();
        }
      }, 1500);
    } catch (err) {
      setRecoveryError(err.message);
    }
  };

  return (
    <div id="login-container" className="min-h-screen bg-slate-50 flex flex-col justify-start md:justify-center items-center relative py-4 sm:py-6 md:py-12 overflow-y-auto px-3 sm:px-4 font-sans overflow-hidden">

      {/* Modern Background blobs mesh */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-800/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#7c191e]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-50/20 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Visual top indicator strip gamit ang maroon na kulay */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-[#7c191e] pointer-events-none" />

      {/* Pangunahing Container Card ng Login */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xs shadow-2xl border border-slate-100 rounded-2xl overflow-hidden relative z-10 transition-all duration-300 my-4 md:my-auto">

        {/* Header Banner ng BSC na may modernong gradient background */}
        <div className="bg-gradient-to-br from-[#7c191e] to-[#581014] p-5 text-center text-white flex flex-col items-center select-none shadow-md border-b border-[#3b0a0d]/50">
          {/* SVG/Image Badge ng Logo ng BSC */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center mb-2.5 bg-white/10 p-2.5 rounded-2xl shadow-inner backdrop-blur-xs border border-white/10">
            <img src="/assets/logo.png" alt="BSC Logo" className="w-full h-full object-contain animate-fade-in" />
          </div>

          <h1 className="text-base sm:text-lg font-black tracking-wide uppercase">Batanes State College</h1>
          <p className="text-[9px] sm:text-[10px] text-amber-300 uppercase tracking-widest font-extrabold mt-1">Basco, Batanes, Philippines</p>
        </div>

        {/*  Katawan ng Login Form (Login Body) */}
        <div className="p-4 sm:p-5 md:p-6">

          {showRecovery ? (
            <div className="space-y-4 animate-fade-in text-slate-800">
              <div className="flex items-center gap-3 pb-2 mb-2 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowRecovery(false);
                    setRecoveryStep(1);
                    setRecoveryEmail('');
                    setRecoveryCode('');
                    setRecoveryNewPassword('');
                    setRecoveryConfirmPassword('');
                    setRecoveryError('');
                    setRecoverySuccess('');
                  }}
                  className="px-2.5 py-1 text-xs border border-slate-200 hover:bg-slate-100 rounded-lg transition"
                >
                  &larr; Back to Login
                </button>
                <span className="text-xs font-bold text-[#7c191e]">Password Recovery</span>
              </div>

              {recoveryError && (
                <div role="alert" className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-medium">
                  {recoveryError}
                </div>
              )}

              {recoverySuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium">
                  {recoverySuccess}
                </div>
              )}

              {recoveryStep === 1 ? (
                <form onSubmit={handleRecoveryEmailSubmit} className="space-y-4">
                  <p className="text-xs text-slate-500 font-medium">
                    Enter your registered email address. We will send a 6-digit temporary verification code to recover your account.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder="Enter your registered email"
                      className="w-full bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#7c191e] border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-medium"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#7c191e] hover:bg-[#5f1316] text-white font-bold p-3 rounded-lg text-xs tracking-wider transition uppercase shadow-md flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" /> Send Verification Code
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRecoveryResetSubmit} className="space-y-4">
                  <p className="text-xs text-slate-500 font-medium">
                    A verification code has been dispatched. Enter the code and your new secure password below.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Verification Code</label>
                    <input
                      type="text"
                      required
                      maxLength="6"
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value)}
                      placeholder="e.g. 123456"
                      className="w-full bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#7c191e] border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-bold text-center tracking-widest text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      value={recoveryNewPassword}
                      onChange={(e) => setRecoveryNewPassword(e.target.value)}
                      placeholder="Enter new password (min. 8 chars)"
                      className="w-full bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#7c191e] border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={recoveryConfirmPassword}
                      onChange={(e) => setRecoveryConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#7c191e] border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-medium"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold p-3 rounded-lg text-xs tracking-wide transition shadow-md flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" /> Reset Password & Login
                  </button>
                </form>
              )}
            </div>
          ) : passwordResetUser ? (
            /* ============================================================= */
            /* MANDATORY RESET NG TEMPORARY PASSWORD NA POPUP                */
            /* ============================================================= */
            <div className="space-y-4 animate-fade-in">
              <div className="text-center pb-2">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2 text-amber-600">
                  <Key className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Mandatory Password Update</h2>
                <p className="text-xs text-slate-500 mt-1">
                  {/* NOTE: Binago natin ito para maging dynamic depende sa role ng user. Dati kasi, laging 'administrative credentials' ang nakalagay kahit Alumni o Employer ang nag-login gamit ang temporary password. */}
                  Hi <span className="font-semibold text-slate-800">{passwordResetUser.name}</span>, you are logging in using {
                    passwordResetUser.role === 'Super Admin' ? 'super admin credentials' :
                    passwordResetUser.role === 'Administrator' ? 'administrative credentials' :
                    passwordResetUser.role === 'Department Chairperson' ? 'chairperson credentials' :
                    passwordResetUser.role === 'Alumni' ? 'temporary alumni credentials' :
                    passwordResetUser.role === 'Employer' ? 'temporary employer credentials' :
                    'temporary credentials'
                  }.
                  For security, BSC standards require you to submit a private password before accessing the system.
                </p>
              </div>

              {resetError && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-medium">
                  {resetError}
                </div>
              )}

              {successToast && (
                <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium">
                  {successToast}
                </div>
              )}

              <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Account Role</label>
                  <input
                    type="text"
                    disabled
                    value={passwordResetUser.role}
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-600 font-medium cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">New Secure Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter private password"
                    className="w-full bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-medium"
                  />

                  <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password to verify"
                    className="w-full bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-medium"
                  />
                  {confirmPassword && (
                    <div className="text-[10px] mt-1">
                      {newPassword === confirmPassword ? (
                        <span className="text-green-600 font-bold">✓ Passwords match</span>
                      ) : (
                        <span className="text-red-500 font-bold">✗ Passwords do not match yet</span>
                      )}
                    </div>
                  )}
                </div>

                  {/* Indicator Checklist para sa Lakas ng Password (Password Strength) */}
                  {/* NOTE: Binago natin mula text-emerald-600 papuntang text-green-600 para maging totoong green ang font color ng satisfied items, kasi yung text-emerald-600 ay na-override globally sa index.css bilang gold/yellow/amber. */}
                  <div className="mt-2.5 p-3 bg-slate-50 rounded-lg border border-slate-200/60 font-medium text-[10px] space-y-1">
                    <div className="text-slate-400 uppercase tracking-widest font-extrabold text-[9px] mb-1.5">Strength Checklist</div>
                    <div className="flex items-center gap-1.5 transition">
                      <span className={newPassword.length >= 8 ? "text-green-600 font-bold" : "text-slate-400"}>
                        {newPassword.length >= 8 ? "✓" : "○"} At least 8 characters ({newPassword.length}/8)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={/[A-Z]/.test(newPassword) ? "text-green-600 font-bold" : "text-slate-400"}>
                        {/[A-Z]/.test(newPassword) ? "✓" : "○"} At least 1 uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={/[a-z]/.test(newPassword) ? "text-green-600 font-bold" : "text-slate-400"}>
                        {/[a-z]/.test(newPassword) ? "✓" : "○"} At least 1 lowercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={/[0-9]/.test(newPassword) ? "text-green-600 font-bold" : "text-slate-400"}>
                        {/[0-9]/.test(newPassword) ? "✓" : "○"} At least 1 numerical digit
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={/[^A-Za-z0-9]/.test(newPassword) ? "text-green-600 font-bold" : "text-slate-400"}>
                        {/[^A-Za-z0-9]/.test(newPassword) ? "✓" : "○"} At least 1 special character / symbol
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={(newPassword && newPassword !== passwordInput && newPassword !== 'admin123' && newPassword !== 'chair123' && newPassword !== 'alumni123' && newPassword !== 'employer123' && newPassword !== passwordResetUser?.userId) ? "text-green-600 font-bold" : "text-slate-400"}>
                        {(newPassword && newPassword !== passwordInput && newPassword !== 'admin123' && newPassword !== 'chair123' && newPassword !== 'alumni123' && newPassword !== 'employer123' && newPassword !== passwordResetUser?.userId) ? "✓" : "○"} Different from the initial temporal credentials
                      </span>
                    </div>
                  </div>
                </div>

                

                <button
                  type="submit"
                  disabled={!(
                    newPassword.length >= 8 &&
                    /[A-Z]/.test(newPassword) &&
                    /[a-z]/.test(newPassword) &&
                    /[0-9]/.test(newPassword) &&
                    /[^A-Za-z0-9]/.test(newPassword) &&
                    newPassword !== passwordInput &&
                    newPassword !== 'super123' &&
                    newPassword !== 'admin123' &&
                    newPassword !== 'chair123' &&
                    newPassword !== 'alumni123' &&
                    newPassword !== 'employer123' &&
                    newPassword !== passwordResetUser?.userId &&
                    newPassword === confirmPassword
                  )}
                  className="w-full disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold p-3 rounded-lg text-xs tracking-wide transition shadow-md flex items-center justify-center gap-2 mt-4"
                >
                  <Lock className="w-4 h-4" /> Save New Password & Login
                </button>
              </form>
            </div>
          ) : !selectedRole ? (
            /* ========================================== */
            /* STEP 1: SIAS ROLE PICKER - Pagpili ng Role */
            /* ========================================== */
            <div className="space-y-4 animate-fade-in">
              <div className="text-center mb-2 sm:mb-4">
                <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#7c191e]">Tracer Authentication Portal</h2>
                <div className="h-0.5 w-12 bg-amber-500 mx-auto mt-2" />
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:gap-3.5">
                 <button
                  id="role-btn-super-admin"
                  onClick={() => handleRoleSelect('Super Admin')}
                  className="flex items-center justify-between p-3 sm:p-4 bg-slate-50/70 hover:bg-[#7c191e]/5 hover:-translate-y-0.5 hover:shadow-md hover:border-[#7c191e]/30 border border-slate-200/80 rounded-xl transition-all duration-300 text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 sm:p-2.5 bg-[#7c191e]/10 text-[#7c191e] rounded-xl group-hover:bg-[#7c191e] group-hover:text-white transition-all duration-300 shrink-0">
                      <ShieldAlert className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <span className="block text-xs sm:text-sm font-extrabold text-slate-800 tracking-wide">Super Administrator</span>
                      <span className="block text-[9px] sm:text-[10px] text-slate-400 font-medium leading-tight mt-0.5">System-wide admin management and user credentials control</span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-[#7c191e] opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 mr-1 sm:mr-2">&rarr;</span>
                </button>
                <button
                  id="role-btn-admin"
                  onClick={() => handleRoleSelect('Administrator')}
                  className="flex items-center justify-between p-3 sm:p-4 bg-slate-50/70 hover:bg-[#7c191e]/5 hover:-translate-y-0.5 hover:shadow-md hover:border-[#7c191e]/30 border border-slate-200/80 rounded-xl transition-all duration-300 text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 sm:p-2.5 bg-[#7c191e]/10 text-[#7c191e] rounded-xl group-hover:bg-[#7c191e] group-hover:text-white transition-all duration-300 shrink-0">
                      <Shield className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <span className="block text-xs sm:text-sm font-extrabold text-slate-800 tracking-wide">Administrator</span>
                      <span className="block text-[9px] sm:text-[10px] text-slate-400 font-medium leading-tight mt-0.5">Tracer program controls and system configurations</span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-[#7c191e] opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 mr-1 sm:mr-2">&rarr;</span>
                </button>

                <button
                  id="role-btn-chair"
                  onClick={() => handleRoleSelect('Department Chairperson')}
                  className="flex items-center justify-between p-3 sm:p-4 bg-slate-50/70 hover:bg-[#7c191e]/5 hover:-translate-y-0.5 hover:shadow-md hover:border-[#7c191e]/30 border border-slate-200/80 rounded-xl transition-all duration-300 text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 sm:p-2.5 bg-[#7c191e]/10 text-[#7c191e] rounded-xl group-hover:bg-[#7c191e] group-hover:text-white transition-all duration-300 shrink-0">
                      <BookOpen className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <span className="block text-xs sm:text-sm font-extrabold text-slate-800 tracking-wide">Department Chairperson</span>
                      <span className="block text-[9px] sm:text-[10px] text-slate-400 font-medium leading-tight mt-0.5">BSC College program analytics and student tracking</span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-[#7c191e] opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 mr-1 sm:mr-2">&rarr;</span>
                </button>

                <button
                  id="role-btn-alumni"
                  onClick={() => handleRoleSelect('Alumni')}
                  className="flex items-center justify-between p-3 sm:p-4 bg-slate-50/70 hover:bg-[#7c191e]/5 hover:-translate-y-0.5 hover:shadow-md hover:border-[#7c191e]/30 border border-slate-200/80 rounded-xl transition-all duration-300 text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 sm:p-2.5 bg-[#7c191e]/10 text-[#7c191e] rounded-xl group-hover:bg-[#7c191e] group-hover:text-white transition-all duration-300 shrink-0">
                      <Users className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <span className="block text-xs sm:text-sm font-extrabold text-slate-800 tracking-wide">College Graduate / Alumni</span>
                      <span className="block text-[9px] sm:text-[10px] text-slate-400 font-medium leading-tight mt-0.5">Submit tracer logs, updates, and skill inventories</span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-[#7c191e] opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 mr-1 sm:mr-2">&rarr;</span>
                </button>

                <button
                  id="role-btn-employer"
                  onClick={() => handleRoleSelect('Employer')}
                  className="flex items-center justify-between p-3 sm:p-4 bg-slate-50/70 hover:bg-[#7c191e]/5 hover:-translate-y-0.5 hover:shadow-md hover:border-[#7c191e]/30 border border-slate-200/80 rounded-xl transition-all duration-300 text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 sm:p-2.5 bg-[#7c191e]/10 text-[#7c191e] rounded-xl group-hover:bg-[#7c191e] group-hover:text-white transition-all duration-300 shrink-0">
                      <Briefcase className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <span className="block text-xs sm:text-sm font-extrabold text-slate-800 tracking-wide">Partner Employer / Company</span>
                      <span className="block text-[9px] sm:text-[10px] text-slate-400 font-medium leading-tight mt-0.5">Post open vacancy bulletins and match skilled talent</span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-[#7c191e] opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 mr-1 sm:mr-2">&rarr;</span>
                </button>
              </div>

              <div className="pt-3 text-center border-t border-slate-100">
                <span className="text-[9px] leading-relaxed text-slate-400 block font-medium">Batanes State College Graduate Tracer.</span>
              </div>
            </div>
          ) : (
            /* ========================================== */
            /* STEP 2: FORM INPUT PARA SA CREDENTIALS     */
            /* ========================================== */
            <div className="space-y-4 animate-fade-in text-slate-800">
              <div className="flex items-center gap-3 pb-2 mb-2 border-b border-slate-100">
                <button
                  type="button"
                  onClick={handleBackToRoles}
                  className="px-2.5 py-1 text-xs border border-slate-200 hover:bg-slate-150 rounded-lg transition font-bold text-slate-650 cursor-pointer"
                >
                  &larr; Switch Role
                </button>
                <span className="text-xs font-extrabold text-[#7c191e]">Role: {selectedRole}</span>
              </div>
              {errorMessage && (
                <div role="alert" className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label htmlFor="user-id-input" className="block text-xs font-semibold text-slate-600 mb-1">User ID / Username</label>
                  <input
                    id="user-id-input"
                    type="text"
                    required
                    value={userIdInput}
                    onChange={(e) => setUserIdInput(e.target.value)}
                    placeholder={
                      selectedRole === 'Alumni'
                        ? 'e.g., BSC-2020-001'
                        : selectedRole === 'Administrator'
                          ? 'e.g., admin'
                          : selectedRole === 'Department Chairperson'
                            ? 'e.g., chair_it, chair_hm'
                            : 'Enter User ID / Username'
                    }
                    className="w-full bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="password-input" className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
                  <div className="relative">
                    <input
                      id="password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-medium pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 scale-90"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex justify-end mt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRecovery(true);
                        setRecoveryStep(1);
                        setRecoveryError('');
                        setRecoverySuccess('');
                      }}
                      className="text-[11px] font-bold text-[#7c191e] hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>

                <button
                  id="btn-login-submit"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#7c191e] hover:bg-[#5f1316] text-white font-bold p-3 rounded-lg text-xs tracking-wider transition-all duration-200 uppercase shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Verifying...
                    </>
                  ) : (
                    <>Login to Dashboard &rarr;</>
                  )}
                </button>

               
              </form>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
