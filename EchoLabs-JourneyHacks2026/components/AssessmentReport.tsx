
import React from 'react';
import { AssessmentResult } from '../types';

interface AssessmentReportProps {
  result: AssessmentResult;
  onDone: () => void;
}

const AssessmentReport: React.FC<AssessmentReportProps> = ({ result, onDone }) => {
  return (
    <div className="max-w-4xl mx-auto p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-10 text-white text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
            <span className="text-4xl font-black">{result.predictedGrade}</span>
          </div>
          <h2 className="text-3xl font-bold mb-1">Assessment Complete!</h2>
          <p className="text-indigo-100">Great job, {result.studentName}. Here is your breakdown.</p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
              <div className="text-slate-400 text-xs font-bold uppercase mb-1">Filler Words</div>
              <div className="text-3xl font-black text-slate-800">{result.totalFillerCount}</div>
              <div className="text-xs text-slate-400 mt-1">Found in transcript</div>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
              <div className="text-slate-400 text-xs font-bold uppercase mb-1">Hesitations</div>
              <div className="text-3xl font-black text-slate-800">{result.pauseCount}</div>
              <div className="text-xs text-slate-400 mt-1">Notable pauses detected</div>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
              <div className="text-slate-400 text-xs font-bold uppercase mb-1">Duration</div>
              <div className="text-3xl font-black text-slate-800">{Math.floor(result.durationSeconds / 60)}m {result.durationSeconds % 60}s</div>
              <div className="text-xs text-slate-400 mt-1">Exam session length</div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <i className="fas fa-comment-dots text-indigo-500"></i> AI Feedback
              </h3>
              <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 text-slate-700 leading-relaxed whitespace-pre-wrap">
                {result.feedback}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <i className="fas fa-list-ol text-indigo-500"></i> Filler Frequency
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(result.fillerWords).map(([word, count]) => (
                  <div key={word} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-white">
                    <span className="text-sm font-medium text-slate-500 italic capitalize">{word}</span>
                    <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <i className="fas fa-file-lines text-indigo-500"></i> Transcript
              </h3>
              <div className="max-h-60 overflow-y-auto border border-slate-100 rounded-2xl p-6 bg-slate-50 space-y-3">
                {result.transcript.map((t, i) => (
                  <div key={i} className="text-sm">
                    <span className={`font-bold uppercase text-[10px] mr-2 ${t.role === 'user' ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {t.role === 'user' ? result.studentName : 'AI Assessor'}
                    </span>
                    <span className="text-slate-600">{t.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button 
          onClick={onDone}
          className="bg-slate-800 hover:bg-slate-900 text-white px-12 py-4 rounded-2xl font-bold shadow-lg transition-all"
        >
          Return to Portal
        </button>
      </div>
    </div>
  );
};

export default AssessmentReport;
