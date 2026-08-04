import React, { useState, useEffect } from 'react';
import { Bell, ChevronDown, Settings, LogOut, X, Menu, Sun, Moon, WifiOff, RefreshCw } from 'lucide-react';

export default function Header({
  activeUser,
  notifications,
  setCurrentTab,
  profileDropdownOpen,
  setProfileDropdownOpen,
  mobileMenuOpen,
  setMobileMenuOpen,
  handleLogout,
  darkMode,
  onToggleDarkMode,
  isOnline = true,
  pendingSyncCount = 0,
  isSyncing = false,
  triggerManualSync = () => {}
}) {

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
          <span className="hidden sm:block text-[9px] text-slate-400 font-bold mt-1.5 tracking-tight font-sans uppercase">Batanes State College</span>
        </div>
      </div>

      {/* Kanang Bahagi: Mga aksyon para sa active user (Dark Mode, Notifications, Profile) */}
      <div className="flex items-center gap-1 sm:gap-3">

        {/* Connection Status Indicator */}
        {!isOnline ? (
          <div className="flex items-center gap-1 px-2 py-1 sm:px-2.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase tracking-wider animate-pulse" title="Offline Mode">
            <WifiOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Offline</span>
            {pendingSyncCount > 0 && <span className="bg-amber-200 px-1.5 py-0.2 rounded-full ml-1">{pendingSyncCount}</span>}
          </div>
        ) : isSyncing ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase tracking-wider">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Syncing</span>
          </div>
        ) : pendingSyncCount > 0 ? (
          <button 
            onClick={triggerManualSync}
            className="flex items-center gap-1 px-1.5 py-1 sm:gap-1.5 sm:px-2.5 rounded-full bg-[#1e4620]/10 text-[#1e4620] border border-[#1e4620]/20 text-[10px] font-bold uppercase tracking-wider hover:bg-[#1e4620]/25 transition cursor-pointer"
            title="Click to sync changes now"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sync ({pendingSyncCount})</span>
            <span className="inline sm:hidden">({pendingSyncCount})</span>
          </button>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Connected</span>
          </div>
        )}

        {/* Toggle para sa Dark Mode Switcher */}
        <button
          onClick={onToggleDarkMode}
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
            className="flex items-center gap-1.5 sm:gap-2.5 hover:bg-slate-50 p-1 sm:px-2.5 rounded-xl transition text-left cursor-pointer"
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
              <span className="block text-xs font-bold text-slate-800 leading-none">
                {activeUser.name.split(' ')[0]}
              </span>
              <span className="block text-[10px] text-slate-400 font-semibold mt-0.5 capitalize">
                {activeUser.role}
              </span>
            </div>
            <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Dropdown Action Menu para sa Profile Settings, Alerts, at Sign Out */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 animate-fade-in font-sans text-xs">
              <div className="px-4 py-2 bg-slate-50/80 border-b border-slate-100 mb-1 text-slate-500">
                <p className="font-bold text-slate-800 truncate">{activeUser.name}</p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{activeUser.email}</p>
              </div>
              <button
                onClick={() => {
                  setCurrentTab('Settings');
                  setProfileDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 font-bold flex items-center gap-2 transition"
              >
                <Settings className="w-4 h-4 text-slate-400" /> Account Settings
              </button>
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
