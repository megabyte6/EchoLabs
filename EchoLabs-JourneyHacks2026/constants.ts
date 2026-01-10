
export const MODELS = {
  LIVE: 'gemini-2.5-flash-native-audio-preview-12-2025',
  ANALYSIS: 'gemini-3-flash-preview'
};

export const VOICES = {
  ASSESSOR: 'Kore',
  STUDENT_DEFAULT: 'Puck'
};

export const DEFAULT_RUBRIC = `
Assess the student based on:
1. Content Accuracy: Did they understand the uploaded notes?
2. Fluency: Smoothness of speech, minimal hesitation.
3. Vocabulary: Appropriate use of terminology.
4. Reasoning: Ability to explain concepts.

Grade Scale: A (Excellent), B (Good), C (Satisfactory), D (Needs Improvement), F (Fail).
`;
