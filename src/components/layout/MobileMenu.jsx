import React from 'react';
import { X, LogOut } from 'lucide-react';

export default function MobileMenu({
  mobileMenuOpen,
  navigationItems,
  currentTab,
  handleTabChange,
  handleLogout,
  setMobileMenuOpen
}) {
  // Awtomatikong isinasara at ibinabalik ang null kapag hindi naka-open ang mobile menu drawer
  if (!mobileMenuOpen) return null;

  return (
    <>
      {/* Blurred Backdrop Screen Overlay - Sinasakop ang screen sa likod ng menu drawer */}
      <div 
        className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 transition-opacity duration-300"
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Left-Side Sliding Navigation Drawer */}
      <div className="md:hidden fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-[#581014] to-[#3a0a0d] text-slate-100 z-50 flex flex-col shadow-2xl animate-slide-in-left border-r border-[#3b0a0d] font-sans">
        
        {/* Drawer Header Area with Title & Exit Action */}
        <div className="p-4 border-b border-[#3b0a0d]/60 flex items-center justify-between bg-black/10 select-none">
          <span className="text-[11px] text-amber-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            BSC Navigation
          </span>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white cursor-pointer transition"
            title="Close Menu"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Navigation list area */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navigationItems.map(item => {
            const isSelected = item.id === currentTab;
            return (
              <button
                key={item.id}
                onClick={() => {
                  handleTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between py-2.5 pr-2.5 rounded-lg text-xs font-bold transition-all duration-150 select-none cursor-pointer ${
                  isSelected
                    ? 'bg-white/10 text-white border-l-4 border-amber-400 pl-3'
                    : 'hover:bg-white/5 hover:text-white text-slate-200/80 border-l-4 border-transparent pl-3'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span className="tracking-wide">{item.name}</span>
                </div>
                {item.count && item.count > 0 ? (
                  <span className="bg-amber-400 text-slate-900 rounded-full font-mono text-[9px] px-1.5 py-0.5 font-extrabold">
                    {item.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Drawer footer containing Mobile Sign Out */}
        <div className="p-4 border-t border-[#3b0a0d]/60 bg-black/10">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleLogout();
            }}
            className="w-full bg-[#7c191e] hover:bg-[#5f1316] text-white py-2.5 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-2 cursor-pointer transition shadow-md"
          >
            <LogOut className="w-4.5 h-4.5" />
            Sign Out Portal
          </button>
        </div>

      </div>
    </>
  );
}
