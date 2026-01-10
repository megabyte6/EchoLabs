import React, { useState, useEffect } from "react";
import { Assessment, AssessmentResult } from "../types";

interface TeacherDashboardProps {
  onBack: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onBack }) => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newNotes, setNewNotes] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("echolabs_assessments");
    if (saved) setAssessments(JSON.parse(saved));

    const savedResults = localStorage.getItem("echolabs_results");
    if (savedResults) setResults(JSON.parse(savedResults));
  }, []);

  const handleCreate = () => {
    if (!newTitle || !newNotes) return;

    const newAssessment: Assessment = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTitle,
      notes: newNotes,
      code: Math.floor(100000 + Math.random() * 900000).toString(),
      createdAt: Date.now(),
    };

    const updated = [newAssessment, ...assessments];
    setAssessments(updated);
    localStorage.setItem("echolabs_assessments", JSON.stringify(updated));

    setNewTitle("");
    setNewNotes("");
    setShowCreate(false);
  };

  const getSubmissionsFor = (id: string) =>
    results.filter((r) => r.assessmentId === id);

  return (
    <div className="max-w-6xl mx-auto p-6 dark:text-white">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">
            Teacher Workspace
          </h2>
          <p className="text-slate-500 dark:text-white/80">
            Create assessments and monitor student performance.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> New Assessment
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 overflow-hidden dark:bg-slate-950 dark:border dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                Create Oral Assessment
              </h3>
              <button
                onClick={() => setShowCreate(false)}
                className="text-slate-400 hover:text-slate-600 dark:text-white/70 dark:hover:text-white"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-white">
                  Assessment Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Biology: Cell Structure Midterm"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-white">
                  Study Notes & Rubric
                </label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={8}
                  placeholder="Paste the notes students should be familiar with here..."
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                ></textarea>
              </div>
              <button
                onClick={handleCreate}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-md transition-colors"
              >
                Launch Assessment
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessments.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <div className="bg-slate-100 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-clipboard-list text-3xl text-slate-300 dark:text-slate-500"></i>
            </div>
            <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-300">
              No assessments yet
            </h3>
            <p className="text-slate-400 dark:text-slate-400">
              Click the button above to create your first one.
            </p>
          </div>
        ) : (
          assessments.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow dark:bg-slate-950 dark:border-slate-800"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-slate-800 line-clamp-1 dark:text-white">
                  {item.title}
                </h3>
                <span className="bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold px-2 py-1 rounded border border-emerald-100 dark:border-emerald-500/30 uppercase">
                  {item.code}
                </span>
              </div>
              <p className="text-slate-500 text-sm mb-6 line-clamp-3 bg-slate-50 p-3 rounded-lg italic dark:text-white/85 dark:bg-slate-900">
                {item.notes}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="text-sm text-slate-400 dark:text-white/70">
                  <i className="fas fa-users mr-1"></i>{" "}
                  {getSubmissionsFor(item.id).length} Submissions
                </div>
                <button
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-bold flex items-center gap-1"
                  onClick={() => {
                    /* View Results logic would go here in a full app */
                  }}
                >
                  View Details <i className="fas fa-arrow-right text-xs"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {results.length > 0 && (
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-slate-800 mb-6 dark:text-white">
            Recent Submissions
          </h3>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm dark:bg-slate-950 dark:border-slate-800">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider dark:bg-slate-900 dark:text-white/80">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Assessment</th>
                  <th className="px-6 py-4">Grade</th>
                  <th className="px-6 py-4">Fillers</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {results.slice(0, 10).map((res, i) => (
                  <tr
                    key={i}
                    className="hover:bg-indigo-50/30 transition-colors dark:hover:bg-white/5"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-white">
                      {res.studentName}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-white/80">
                      {assessments.find((a) => a.id === res.assessmentId)
                        ?.title || "Deleted"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          res.predictedGrade === "A"
                            ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                            : res.predictedGrade === "B"
                              ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300"
                              : "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        {res.predictedGrade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-white/80">
                      {res.totalFillerCount}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 dark:text-white/70">
                      {new Date(res.completedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold text-sm">
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
