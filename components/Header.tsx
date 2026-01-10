import React from "react";

interface HeaderProps {
  onGoHome: () => void;
  role: string;
}

const Header: React.FC<HeaderProps> = ({ onGoHome, role }) => {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
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
          <span className="text-xs font-semibold px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 uppercase tracking-wider">
            {role} Portal
          </span>
        )}
      </div>
    </header>
  );
};

export default Header;
