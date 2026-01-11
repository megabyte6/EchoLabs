import React, { useState, useEffect, useRef, useCallback } from "react";
import { Assessment, TranscriptEntry, AssessmentResult } from "../types";
import { createLiveSession, getAnalysis } from "../services/geminiService";
import { decodeAudioData, decode, createBlob } from "../services/audioService";

interface AssessmentSessionProps {
  assessment: Assessment;
  studentName: string;
  onFinish: (result: AssessmentResult) => void;
}

const AssessmentSession: React.FC<AssessmentSessionProps> = ({
  assessment,
  studentName,
  onFinish,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [timer, setTimer] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const outAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const transcriptRef = useRef<TranscriptEntry[]>([]);

  const micStreamRef = useRef<MediaStream | null>(null);
  const inputSourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const closingRef = useRef(false);

  const currentInputTranscription = useRef("");
  const currentOutputTranscription = useRef("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // Auto-scroll chat to bottom when transcript updates
  useEffect(() => {
    if (chatContainerRef.current && transcript.length > 0) {
      const scrollContainer = chatContainerRef.current;
      // Use requestAnimationFrame for smooth scrolling
      requestAnimationFrame(() => {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      });
    }
  }, [transcript]);

  const startAssessment = async () => {
    try {
      closingRef.current = false;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const inCtx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )({ sampleRate: 16000 });
      const outCtx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )({ sampleRate: 24000 });

      audioContextRef.current = inCtx;
      outAudioContextRef.current = outCtx;

      const sessionPromise = createLiveSession(assessment.notes, {
        onopen: () => {
          setIsActive(true);
          const source = inCtx.createMediaStreamSource(stream);
          const scriptProcessor = inCtx.createScriptProcessor(4096, 1, 1);

          inputSourceNodeRef.current = source;
          scriptProcessorRef.current = scriptProcessor;

          scriptProcessor.onaudioprocess = (event) => {
            if (closingRef.current) return;

            const inputData = event.inputBuffer.getChannelData(0);
            const pcmBlob = createBlob(inputData);

            sessionPromise.then((session: any) => {
              if (closingRef.current) return;

              // Avoid sending once the session is closing/closed.
              // Some implementations expose an underlying WebSocket as `session.ws`.
              const ws: WebSocket | undefined = session?.ws;
              if (ws && ws.readyState !== WebSocket.OPEN) return;

              try {
                session.sendRealtimeInput({ media: pcmBlob });
              } catch {
                // Ignore send errors during shutdown.
              }
            });
          };

          source.connect(scriptProcessor);
          scriptProcessor.connect(inCtx.destination);
        },
        onmessage: async (message: any) => {
          // Transcription handling
          if (message.serverContent?.outputTranscription) {
            currentOutputTranscription.current +=
              message.serverContent.outputTranscription.text;
          } else if (message.serverContent?.inputTranscription) {
            currentInputTranscription.current +=
              message.serverContent.inputTranscription.text;
          }

          if (message.serverContent?.turnComplete) {
            if (currentInputTranscription.current) {
              const entry: TranscriptEntry = {
                role: "user",
                text: currentInputTranscription.current,
                timestamp: Date.now(),
              };
              transcriptRef.current.push(entry);
              setTranscript([...transcriptRef.current]);
              currentInputTranscription.current = "";
            }
            if (currentOutputTranscription.current) {
              const entry: TranscriptEntry = {
                role: "model",
                text: currentOutputTranscription.current,
                timestamp: Date.now(),
              };
              transcriptRef.current.push(entry);
              setTranscript([...transcriptRef.current]);
              currentOutputTranscription.current = "";
            }
            
          }

          // Audio playback
          const audioBase64 =
            message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioBase64) {
            nextStartTimeRef.current = Math.max(
              nextStartTimeRef.current,
              outCtx.currentTime,
            );
            const buffer = await decodeAudioData(
              decode(audioBase64),
              outCtx,
              24000,
              1,
            );
            const sourceNode = outCtx.createBufferSource();
            sourceNode.buffer = buffer;
            sourceNode.connect(outCtx.destination);
            sourceNode.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            sourcesRef.current.add(sourceNode);
            sourceNode.onended = () => sourcesRef.current.delete(sourceNode);
          }

          if (message.serverContent?.interrupted) {
            sourcesRef.current.forEach((s) => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
        },
        onerror: (err: any) => console.error("Session Error:", err),
        onclose: () => setIsActive(false),
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Microphone Access Error:", err);
      alert("Microphone access is required for the oral assessment.");
    }
  };

  const finishAssessment = async () => {
    setIsAnalyzing(true);
    closingRef.current = true;

    // Stop producing audio immediately so we don't send frames on a closing/closed socket.
    try {
      scriptProcessorRef.current?.disconnect();
    } catch {}
    try {
      inputSourceNodeRef.current?.disconnect();
    } catch {}
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    micStreamRef.current = null;

    try {
      await audioContextRef.current?.close();
    } catch {}
    audioContextRef.current = null;

    // Stop any queued playback
    sourcesRef.current.forEach((s) => {
      try {
        s.stop();
      } catch {}
    });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;

    try {
      await outAudioContextRef.current?.close();
    } catch {}
    outAudioContextRef.current = null;

    if (sessionRef.current) {
      try {
        sessionRef.current.close();
      } catch {}
    }

    // Analyze transcript
    try {
      const analysis = await getAnalysis(
        transcriptRef.current,
        assessment.notes,
      );
      const result: AssessmentResult = {
        assessmentId: assessment.id,
        studentName,
        transcript: transcriptRef.current,
        ...analysis,
        durationSeconds: timer,
        completedAt: Date.now(),
      };

      const saved = localStorage.getItem("echolabs_results");
      const results = saved ? JSON.parse(saved) : [];
      localStorage.setItem(
        "echolabs_results",
        JSON.stringify([result, ...results]),
      );

      onFinish(result);
    } catch (err) {
      console.error("Analysis Error:", err);
      alert("Failed to analyze assessment results.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col h-[calc(100vh-80px)]">
      {!isActive && !isAnalyzing && transcript.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center bg-white p-12 rounded-3xl border border-slate-200 shadow-2xl max-w-lg dark:bg-slate-950 dark:border-slate-800">
            <div className="w-20 h-20 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <i className="fas fa-microphone text-3xl"></i>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2 dark:text-white">
              Ready to Start?
            </h2>
            <p className="text-slate-500 mb-8 dark:text-white/90">
              Hi {studentName}, you are about to start{" "}
              <span className="font-bold text-slate-800 dark:text-white">
                {assessment.title}
              </span>
              . Ensure you are in a quiet room and your microphone is working.
            </p>
            <button
              onClick={startAssessment}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
            >
              Start My Exam
            </button>
          </div>
        </div>
      ) : isAnalyzing ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 border-4 border-indigo-100 rounded-full dark:border-slate-800"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Finalizing Results
          </h2>
          <p className="text-slate-500 mt-2 max-w-sm dark:text-white/90">
            AI is analyzing your conversation, counting filler words, and
            determining your predicted grade. One moment please...
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="flex items-center justify-between mb-6 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold border border-indigo-100 dark:bg-slate-900 dark:text-indigo-200 dark:border-slate-800">
                {formatTime(timer)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {assessment.title}
                </h3>
                <p className="text-xs text-emerald-500 font-bold uppercase flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>{" "}
                  Live Session
                </p>
              </div>
            </div>
            <button
              onClick={finishAssessment}
              className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-6 py-2 rounded-xl font-bold border border-rose-200 transition-colors dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-200 dark:border-rose-500/30"
            >
              End Exam
            </button>
          </div>

          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto bg-slate-50 rounded-3xl p-6 mb-6 border border-slate-200 space-y-4 dark:bg-slate-950 dark:border-slate-800 min-h-0"
            style={{ scrollBehavior: 'smooth', overflowAnchor: 'none' }}
          >
            {transcript.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50 italic dark:text-white/80">
                <i className="fas fa-wave-square text-4xl mb-4"></i>
                <p>Waiting for speech input...</p>
              </div>
            ) : (
              transcript.map((entry, i) => (
                <div
                  key={`${entry.timestamp}-${i}`}
                  className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                      entry.role === "user"
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-white text-slate-800 rounded-tl-none border border-slate-200 dark:bg-slate-900 dark:text-white dark:border-slate-800"
                    }`}
                  >
                    <p className="text-sm break-words">{entry.text}</p>
                  </div>
                </div>
              ))
            )}
            <div className="h-1 pb-4" aria-hidden="true"></div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg flex items-center justify-between dark:bg-slate-950 dark:border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex gap-1 items-end h-8">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-2 bg-indigo-600 rounded-full animate-pulse"
                    style={{
                      animationDelay: `${i * 0.15}s`,
                      height: '12px',
                      width: '8px',
                    }}
                  ></div>
                ))}
              </div>
              <p className="text-slate-500 font-medium italic dark:text-white/90">
                Gemini is listening...
              </p>
            </div>
            <div className="text-slate-400 text-sm dark:text-white/80">
              Transcript is saved automatically.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentSession;
