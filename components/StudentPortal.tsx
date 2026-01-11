import React, { useState, useEffect } from "react";
import { Assessment } from "../types";

interface StudentPortalProps {
  onStartAssessment: (assessment: Assessment, studentName: string) => void;
  userName?: string;
}

const StudentPortal: React.FC<StudentPortalProps> = ({ onStartAssessment, userName }) => {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (userName) {
      setName(userName);
    }
  }, [userName]);

  const handleJoin = () => {
    if (!code || !name) {
      setError("Please enter both your name and the assessment code.");
      return;
    }

    const saved = localStorage.getItem("echolabs_assessments");
    if (!saved) {
      setError("No assessments found in the system.");
      return;
    }

    const assessments: Assessment[] = JSON.parse(saved);
    const found = assessments.find((a) => a.code === code);

    if (found) {
      onStartAssessment(found, name);
    } else {
      setError("Invalid code. Please check with your teacher.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl dark:bg-slate-900 dark:border-slate-700">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 dark:bg-indigo-500/20 dark:text-indigo-200">
          <i className="fas fa-id-card text-2xl"></i>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">
          Student Entry
        </h2>
        <p className="text-slate-500 dark:text-slate-100">
          Enter your details to begin the exam.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-white">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder="John Doe"
            disabled={!!userName}
            className={`w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-400 ${userName ? 'bg-slate-50 dark:bg-slate-900 cursor-not-allowed' : ''}`}
          />
          {userName && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Name automatically filled from your account</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-white">
            Assessment Code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError("");
            }}
            placeholder="6-digit code"
            maxLength={6}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-center text-2xl font-mono tracking-widest uppercase transition-all dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-200"
          />
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg border border-red-100 dark:border-red-500/30 flex items-center gap-2">
            <i className="fas fa-circle-exclamation"></i> {error}
          </div>
        )}

        <button
          onClick={handleJoin}
          className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg transition-all transform active:scale-[0.98]"
        >
          Join Session
        </button>
      </div>

      <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-100">
        Requires microphone access. Your conversation will be recorded for
        assessment.
      </p>
    </div>
  );
};

export default StudentPortal;
