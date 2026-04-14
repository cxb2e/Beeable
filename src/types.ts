export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: 'student' | 'teacher';
  xp: number;
  coins: number;
  streak: number;
  lastActiveDate?: string;
  speakingLevel: number;
  writingLevel: number;
  speakingProgress: number;
  writingProgress: number;
}

export interface GameResult {
  id?: string;
  gameType: string;
  score: number;
  totalQuestions: number;
  date: string;
  xpEarned?: number;
  coinsEarned?: number;
}

export interface SpeakingAttempt {
  id?: string;
  targetText: string;
  recognizedText: string;
  isCorrect: boolean;
  score: number;
  feedback?: string;
  date: string;
  level: number;
  xpEarned?: number;
}

export interface WritingCheck {
  id?: string;
  originalText: string;
  correctedText: string;
  feedback: string;
  date: string;
  level: number;
  xpEarned?: number;
}

export interface TheoryItem {
  id: string;
  title: string;
  content: string;
  category: 'lexical' | 'technical' | 'grammar';
  order?: number;
}

export interface GameQuestion {
  id: string;
  question: string;
  options: string[];
  answer: string;
  category?: string;
  order?: number;
  explanation?: string;
}

export interface SpeakingPrompt {
  id: string;
  text: string;
  translation: string;
  category?: string;
  order?: number;
  level?: number;
}

export interface WritingTopic {
  id: string;
  title: string;
  description: string;
  category?: string;
  order?: number;
  level?: number;
}

export interface UserTask {
  id: string;
  title: string;
  time?: string;
  completed: boolean;
  date: string;
}

export interface VocabularyItem {
  id: string;
  term: string;
  pronunciation?: string;
  definitionEnglish: string;
  meaningVietnamese: string;
  examplesInContext: string[];
  relatedWordForms: { form: string; meaning: string }[];
  notes?: string;
  order?: number;
}
