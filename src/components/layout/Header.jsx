import React, { useState, useEffect } from 'react';
import { Bell, ChevronDown, Settings, LogOut, X, Menu, Sun, Moon } from 'lucide-react';

export default function Header({
  activeUser,
  notifications,
  setCurrentTab,
  profileDropdownOpen,
  setProfileDropdownOpen,
  mobileMenuOpen,
  setMobileMenuOpen,
  handleLogout
}) {
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200/70 h-16 flex items-center justify-between px-4 md:px-6 shrink-0 z-30 font-sans shadow-premium">
      {/* Kaliwang Bahagi: Logo ng CareerPath at Batanes State College */}
      <div className="flex items-center gap-3 select-none">
        {/* Rounded na logo badge na naglalaman ng BSC image asset */}
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md shrink-0 overflow-hidden border border-slate-100 p-1">
          <img src="/assets/logo.png" alt="BSC Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <span className="block text-[13px] font-sans font-black text-[#7c191e] uppercase tracking-wide leading-none">CareerPath</span>
          <span className="block text-[9px] text-slate-400 font-bold mt-1.5 tracking-tight font-sans uppercase">Batanes State College</span>
        </div>
      </div>

      {/* Kanang Bahagi: Mga aksyon para sa active user (Dark Mode, Notifications, Profile) */}
      <div className="flex items-center gap-1 sm:gap-3">

        {/* Toggle para sa Dark Mode Switcher */}
        <button
          onClick={toggleDarkMode}
          className="p-2 text-slate-500 hover:text-[#1e4620] hover:bg-slate-50 rounded-lg transition relative shrink-0"
          title="Toggle Dark Mode"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-500 animate-pulse" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Icon para sa Notifications/Alerts ng system */}
        <button
          onClick={() => setCurrentTab('Notifications')}
          className="p-2 text-slate-500 hover:text-[#1e4620] hover:bg-slate-50 rounded-lg transition relative shrink-0"
          title="System alerts and updates"
        >
          <Bell className="w-4 h-4" />
          {notifications.filter(n => !n.read).length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-1 ring-white" />
          )}
        </button>

        {/* Divider Line */}
        <div className="hidden sm:block h-6 w-[1px] bg-slate-200" />

        {/* Interactive Profile Area na may profile photo initial at dropdown button */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 hover:bg-slate-50 p-1 px-2.5 rounded-xl transition text-left cursor-pointer"
          >
            {activeUser.avatar ? (
              <img 
                src={activeUser.avatar} 
                alt="Profile Avatar" 
                className="w-8 h-8 rounded-full object-cover shadow-sm border border-amber-400/50 uppercase shrink-0" 
              />
            ) : (
              <div className="w-8 h-8 bg-[#7c191e] rounded-full flex items-center justify-center font-extrabold text-xs text-white shadow-sm border border-amber-400/50 uppercase shrink-0">
                {activeUser.name.charAt(0)}
              </div>
            )}
            <div className="hidden sm:block">
              <span className="block text-xs font-bold text-slate-800 leading-none lowercase">
                {activeUser.name.split(' ')[0]}
              </span>
              <span className="block text-[10px] text-slate-400 font-semibold mt-0.5 capitalize">
                {activeUser.role}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Dropdown Action Menu para sa Profile Settings, Alerts, at Sign Out */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 animate-fade-in font-sans text-xs">
              <div className="px-4 py-2 bg-slate-50/80 border-b border-slate-100 mb-1 text-slate-500">
                <p className="font-bold text-slate-800 truncate">{activeUser.name}</p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{activeUser.email}</p>
              </div>
              {/* NOTE: Binago natin ito para tanging Administrator lamang ang makakakita at makaka-access sa 'Portal Settings' mula sa dropdown, dahil ang SettingsView ay naglalaman ng SMTP broadcast at invitations na para sa Admin lamang (tinanggal natin ito para sa mga employer, alumni, at chairperson). */}
              {activeUser.role === 'Administrator' && (
                <button
                  onClick={() => {
                    setCurrentTab('Settings');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 font-bold flex items-center gap-2 transition"
                >
                  <Settings className="w-4 h-4 text-slate-400" /> Portal Settings
                </button>
              )}
              <button
                onClick={() => {
                  setCurrentTab('Notifications');
                  setProfileDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 font-bold flex items-center gap-2 transition"
              >
                <Bell className="w-4 h-4 text-slate-400" /> System Alerts
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 font-bold flex items-center gap-2 transition"
              >
                <LogOut className="w-4 h-4 text-rose-500" /> Sign Out Portal
              </button>
            </div>
          )}
        </div>

        {/* Mobile Drawer Menu Button para sa responsive layouts */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

      </div>
    </header>
  );
}
