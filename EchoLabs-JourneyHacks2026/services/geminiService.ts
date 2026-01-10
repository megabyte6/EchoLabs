
import { GoogleGenAI, Type } from "@google/genai";
import { MODELS, DEFAULT_RUBRIC } from "../constants";
import { TranscriptEntry } from "../types";

const API_KEY = process.env.API_KEY || "";

export const getAnalysis = async (transcript: TranscriptEntry[], notes: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const transcriptText = transcript
    .map(t => `${t.role === 'user' ? 'Student' : 'AI Assessor'}: ${t.text}`)
    .join('\n');

  const response = await ai.models.generateContent({
    model: MODELS.ANALYSIS,
    contents: `Analyze this oral assessment transcript based on these reference notes.
    
    Reference Notes:
    ${notes}
    
    Transcript:
    ${transcriptText}
    
    Rubric:
    ${DEFAULT_RUBRIC}
    
    Identify:
    1. Predicted Grade (A-F)
    2. Specific filler words count (um, uh, like, you know)
    3. Qualitative feedback (Strengths, Weaknesses, Suggestions)
    4. Notable pauses or hesitations.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          predictedGrade: { type: Type.STRING },
          fillerWords: {
            type: Type.OBJECT,
            properties: {
              um: { type: Type.NUMBER },
              uh: { type: Type.NUMBER },
              like: { type: Type.NUMBER },
              youKnow: { type: Type.NUMBER }
            }
          },
          totalFillerCount: { type: Type.NUMBER },
          pauseCount: { type: Type.NUMBER },
          feedback: { type: Type.STRING }
        },
        required: ["predictedGrade", "fillerWords", "totalFillerCount", "pauseCount", "feedback"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const createLiveSession = (
  notes: string, 
  callbacks: any
) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  return ai.live.connect({
    model: MODELS.LIVE,
    callbacks,
    config: {
      responseModalities: ['AUDIO'],
      outputAudioTranscription: {},
      inputAudioTranscription: {},
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
      },
      systemInstruction: `You are a professional teacher conducting an oral examination. 
      Your goal is to assess the student's understanding of the following material:
      
      --- MATERIAL BEGIN ---
      ${notes}
      --- MATERIAL END ---
      
      Instructions:
      1. Start by introducing yourself and asking the student if they are ready.
      2. Ask clear, probing questions one at a time.
      3. Listen carefully to their answers.
      4. If they struggle, provide subtle hints without giving the full answer.
      5. Conduct the exam for roughly 3-5 minutes or until you've covered the key concepts.
      6. IMPORTANT: Ensure the transcription includes filler words like 'um' and 'uh' so we can analyze them later.
      7. Keep a supportive yet formal tone.
      8. Keep track of timestamps for each response, if it takes longer than a natural response, record it.`
    }
  });
};
