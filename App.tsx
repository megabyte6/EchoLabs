import React, { useState } from "react";
import Header from "./components/Header";
import TeacherDashboard from "./components/TeacherDashboard";
import StudentPortal from "./components/StudentPortal";
import AssessmentSession from "./components/AssessmentSession";
import AssessmentReport from "./components/AssessmentReport";
import { UserRole, Assessment, AssessmentResult } from "./types";

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.NONE);
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(
    null,
  );
  const [studentName, setStudentName] = useState("");
  const [assessmentResult, setAssessmentResult] =
    useState<AssessmentResult | null>(null);

  const reset = () => {
    setRole(UserRole.NONE);
    setCurrentAssessment(null);
    setAssessmentResult(null);
  };

  const startStudentSession = (assessment: Assessment, name: string) => {
    setCurrentAssessment(assessment);
    setStudentName(name);
  };

  const handleFinishAssessment = (result: AssessmentResult) => {
    setAssessmentResult(result);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onGoHome={reset} role={role} />

      <main className="flex-1">
        {role === UserRole.NONE && (
          <div className="max-w-4xl mx-auto py-20 px-6 text-center">
            <h2 className="text-5xl font-black text-slate-800 mb-6 tracking-tight">
              Master Your Oral <br />
              <span className="text-indigo-600">Assessments</span> with AI.
            </h2>
            <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto">
              An AI-powered platform for automated oral exams. Seamlessly
              conduct 1-on-1 conversations, get instant grades, and detailed
              speech analytics.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                onClick={() => setRole(UserRole.TEACHER)}
                className="w-full sm:w-64 bg-slate-800 hover:bg-slate-900 text-white px-8 py-5 rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-3 transition-all"
              >
                <i className="fas fa-chalkboard-user"></i> I'm a Teacher
              </button>
              <button
                onClick={() => setRole(UserRole.STUDENT)}
                className="w-full sm:w-64 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-5 rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-3 transition-all"
              >
                <i className="fas fa-user-graduate"></i> I'm a Student
              </button>
            </div>

            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: "fa-robot",
                  title: "AI Assessor",
                  desc: "Real-time natural conversations grounded in your course notes.",
                },
                {
                  icon: "fa-chart-line",
                  title: "Speech Analytics",
                  desc: "Detailed tracking of filler words (um, uh), pauses, and fluency.",
                },
                {
                  icon: "fa-check-double",
                  title: "Instant Grading",
                  desc: "Predicted grades and qualitative feedback delivered instantly.",
                },
              ].map((feature, i) => (
                <div key={i} className="p-6 text-left">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 border border-indigo-100">
                    <i className={`fas ${feature.icon} text-xl`}></i>
                  </div>
                  <h4 className="font-bold text-slate-800 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-slate-500">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {role === UserRole.TEACHER && <TeacherDashboard onBack={reset} />}

        {role === UserRole.STUDENT && (
          <>
            {assessmentResult ? (
              <AssessmentReport result={assessmentResult} onDone={reset} />
            ) : currentAssessment ? (
              <AssessmentSession
                assessment={currentAssessment}
                studentName={studentName}
                onFinish={handleFinishAssessment}
              />
            ) : (
              <StudentPortal onStartAssessment={startStudentSession} />
            )}
          </>
        )}
      </main>

      <footer className="py-8 border-t border-slate-200 text-center text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} EchoLabs - An AI oral assessment
        platform. Powered by Google Gemini.
      </footer>
    </div>
  );
};

export default App;
