import React from 'react';

export default function Sidebar({ navigationItems, currentTab, handleTabChange }) {
  return (
    <aside className="hidden md:flex w-60 bg-gradient-to-b from-[#581014] to-[#3a0a0d] text-slate-100 flex-col shrink-0 border-r border-[#3b0a0d]">
      {/* Modern Logo Brand Section on top of sidebar */}
      <div className="p-4 border-b border-[#3b0a0d]/60 flex items-center justify-center select-none bg-black/10">
        <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          BSC Portal
        </span>
      </div>

      {/* Listahan ng mga menu links para sa desktop sidebar navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navigationItems.map(item => {
          const isSelected = item.id === currentTab;
          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center justify-between py-2.5 pr-2.5 rounded-lg text-xs font-bold transition-all duration-200 ease-out select-none cursor-pointer ${
                isSelected
                  ? 'bg-white/10 text-white shadow-md border-l-4 border-amber-400 pl-3'
                  : 'hover:bg-white/5 hover:text-white hover:translate-x-1 text-slate-200/80 border-l-4 border-transparent pl-3'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span className="tracking-wide">{item.name}</span>
              </div>
              {/* Alert count badge para sa mga notifications o bagong mensahe */}
              {item.count && item.count > 0 ? (
                <span className="bg-amber-400 text-slate-900 rounded-full font-mono text-[9px] px-1.5 py-0.5 font-extrabold animate-pulse">
                  {item.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Bersyon at simpleng label sa pinakailalim ng sidebar */}
      <div className="p-4 border-t border-[#3b0a0d]/60 text-slate-400/50 text-[9px] text-center uppercase tracking-widest font-extrabold select-none bg-black/10">
        BSC GRADUATE TRACER
      </div>
    </aside>
  );
}
