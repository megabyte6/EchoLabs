import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import TeacherDashboard from './components/TeacherDashboard';
import StudentPortal from './components/StudentPortal';
import AssessmentSession from './components/AssessmentSession';
import AssessmentReport from './components/AssessmentReport';
import { UserRole, Assessment, AssessmentResult } from './types';

// Google User Type
interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

const App: React.FC = () => {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<UserRole>(UserRole.NONE);
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(
    null,
  );
  const [studentName, setStudentName] = useState("");
  const [assessmentResult, setAssessmentResult] =
    useState<AssessmentResult | null>(null);

  // Replace with your actual Google Client ID
  const GOOGLE_CLIENT_ID = '808241493676-fr9m765g74eq3k7tj5dq35i0gfjnkem2.apps.googleusercontent.com';

  const parseJwt = (token: string) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  };

  const handleCredentialResponse = useCallback((response: any) => {
    const decoded = parseJwt(response.credential);
    const userData: GoogleUser = {
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
      sub: decoded.sub,
    };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  // Render Google Sign-In button
  const renderGoogleButton = useCallback(() => {
    if (!window.google?.accounts?.id) return;

    const buttonDiv = document.getElementById('googleSignInButton');
    if (buttonDiv) {
      // Clear any existing button first
      buttonDiv.innerHTML = '';
      window.google.accounts.id.renderButton(buttonDiv, {
        theme: 'filled_blue',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
      });
    }
  }, []);

  // Initialize Google Sign-In
  const initializeGoogleSignIn = useCallback(() => {
    if (!window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });

    // Render the sign-in button if the div exists
    renderGoogleButton();

    // Prompt for one-tap sign-in only if not signed in
    if (!user) {
      window.google.accounts.id.prompt();
    }
  }, [handleCredentialResponse, renderGoogleButton, user]);

  // Check for stored user and load Google Identity Services script
  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsLoading(false);
      return;
    }

    // Check if script is already loaded
    if (window.google?.accounts?.id) {
      initializeGoogleSignIn();
      setIsLoading(false);
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      // Script is loading, wait for it
      const checkGoogle = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkGoogle);
          initializeGoogleSignIn();
          setIsLoading(false);
        }
      }, 100);
      
      return () => clearInterval(checkGoogle);
    }

    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.id = 'google-signin-script';
    document.body.appendChild(script);

    script.onload = () => {
      initializeGoogleSignIn();
      setIsLoading(false);
    };

    script.onerror = () => {
      setIsLoading(false);
    };
  }, [initializeGoogleSignIn]);

  // Re-render Google Sign-In button when user signs out or sign-in screen is shown
  useEffect(() => {
    if (!user && !isLoading) {
      // Wait a bit for DOM to be ready after render
      const timer = setTimeout(() => {
        if (window.google?.accounts?.id) {
          // Re-initialize to ensure callback is set
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
          });
          renderGoogleButton();
        } else {
          // If Google API not loaded yet, initialize it
          initializeGoogleSignIn();
        }
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [user, isLoading, handleCredentialResponse, renderGoogleButton, initializeGoogleSignIn]);

  const handleSignOut = () => {
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
    setUser(null);
    setRole(UserRole.NONE);
    setCurrentAssessment(null);
    setAssessmentResult(null);
    localStorage.removeItem('user');
  };

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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  // Not authenticated - show sign in
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header onGoHome={reset} role={UserRole.NONE} />
        
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-graduation-cap text-2xl"></i>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Welcome to EchoLabs
              </h2>
              <p className="text-slate-500">
                Sign in with Google to get started
              </p>
            </div>

            <div className="flex justify-center">
              <div id="googleSignInButton"></div>
            </div>

            <p className="text-xs text-slate-400 text-center mt-6">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </main>

        <footer className="py-8 border-t border-slate-200 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} EchoLabs Oral Assessment AI. Powered by Google Gemini.
        </footer>
      </div>
    );
  }

  // Authenticated - show main app
  return (
    <div className="min-h-screen flex flex-col">
      <Header onGoHome={reset} role={role} />

      {/* User Info Bar (persistent) */}
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={user.picture} 
              alt={user.name}
              className="w-8 h-8 rounded-full"
            />
            <span className="text-sm text-slate-600 font-medium">{user.name}</span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">{user.email}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-2"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <main className="flex-1">
        {role === UserRole.NONE && (
          <div className="max-w-4xl mx-auto py-20 px-6 text-center">
            <h2 className="text-5xl font-black text-slate-800 dark:text-white mb-6 tracking-tight">
              Master Your Oral <br />
              <span className="text-indigo-600 dark:text-indigo-300">
                Assessments
              </span>{" "}
              with AI.
            </h2>
            <p className="text-xl text-slate-500 dark:text-slate-200 mb-12 max-w-2xl mx-auto">
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
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 border border-indigo-100 dark:bg-slate-900 dark:text-indigo-300 dark:border-slate-800">
                    <i className={`fas ${feature.icon} text-xl`}></i>
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-white mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-200">
                    {feature.desc}
                  </p>
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
              <StudentPortal onStartAssessment={startStudentSession} userName={user.name} />
            )}
          </>
        )}
      </main>

      <footer className="py-8 border-t border-slate-200 dark:border-slate-800 text-center text-slate-400 dark:text-slate-200 text-sm">
        &copy; {new Date().getFullYear()} EchoLabs - An AI oral assessment
        platform. Powered by Google Gemini.
      </footer>
    </div>
  );
};

// TypeScript declaration for Google
declare global {
  interface Window {
    google: any;
  }
}

export default App;