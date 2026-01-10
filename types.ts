
export interface Assessment {
  id: string;
  title: string;
  notes: string;
  code: string;
  createdAt: number;
}

export interface TranscriptEntry {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface AssessmentResult {
  assessmentId: string;
  studentName: string;
  transcript: TranscriptEntry[];
  fillerWords: Record<string, number>;
  totalFillerCount: number;
  pauseCount: number;
  predictedGrade: string;
  feedback: string;
  durationSeconds: number;
  completedAt: number;
}

export enum UserRole {
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  NONE = 'NONE'
}
