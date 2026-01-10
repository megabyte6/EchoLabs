import React, { useEffect, useState } from "react";

interface HeaderProps {
  onGoHome: () => void;
  role: string;
}

const Header: React.FC<HeaderProps> = ({ onGoHome, role }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "dark") return true;
      if (stored === "light") return false;
      return (
        window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false
      );
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }

    try {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch {
      // ignore
    }
  }, [isDark]);

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 dark:bg-slate-950 dark:border-slate-800">
      <div
        className="flex items-center gap-2 cursor-pointer group"
        onClick={onGoHome}
      >
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
          <i className="fas fa-microphone-lines text-xl"></i>
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
          EchoLabs
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {role !== "NONE" && (
          <span className="text-xs font-semibold px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 uppercase tracking-wider dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800">
            {role} Portal
          </span>
        )}

        <button
          type="button"
          onClick={() => setIsDark((v) => !v)}
          className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm flex items-center justify-center transition-colors dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-100"
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          title={isDark ? "Light theme" : "Dark theme"}
        >
          <i className={`fas ${isDark ? "fa-sun" : "fa-moon"}`}></i>
        </button>
      </div>
    </header>
  );
};

export default Header;
