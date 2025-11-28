// src/types/index.ts

export enum SubjectType {
  CHEMISTRY = 'chemistry',
  PHYSICS = 'physics',
  BIOLOGY = 'biology'
}

export enum TaskType {
  SLIDER = 'slider',           // Slayderli topshiriq
  MULTIPLE_CHOICE = 'multiple_choice', // Test savollari
  MATCHING = 'matching',       // Moslashtirish
  FILL_BLANK = 'fill_blank',   // Bo'sh joyni to'ldirish
  DRAG_DROP = 'drag_drop',     // Sudrab tashlash
  CALCULATION = 'calculation', // Hisoblash
  EXPERIMENT = 'experiment'    // Virtual eksperiment
}

export interface Grade {
  id: number;
  name: string;
  lessons: Lesson[];
}

export interface Subject {
  id: SubjectType;
  title: string;
  description: string;
  color: string;
  icon: string;
  grades: Grade[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  duration: string;
  tasks: Task[];
}

export interface Task {
  id: string;
  type: TaskType;
  question: string;
  instructions: string;
  data: any; // Har bir task turiga qarab o'zgaradi
  correctAnswer: any;
  points: number;
  hint?: string;
}

// Multiple Choice uchun
export interface MultipleChoiceData {
  options: { id: string; text: string }[];
}

// Matching uchun
export interface MatchingData {
  leftItems: { id: string; text: string }[];
  rightItems: { id: string; text: string }[];
  correctPairs: { left: string; right: string }[];
}

// Fill Blank uchun
export interface FillBlankData {
  text: string; // "Suvning formulasi ___" kabi
  blanks: { id: string; answer: string }[];
}

// Slider/Experiment uchun
export interface ExperimentData {
  targetValue: number;
  tolerance: number;
  initialParams: Record<string, number>;
  unit: string;
}

// Calculation uchun
export interface CalculationData {
  formula: string;
  variables: { name: string; value: number; unit: string }[];
  correctAnswer: number;
  unit: string;
}

export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  xp: number;
  streak: number;
  badges: string[];
  achievements: Record<string, boolean>;
  progress: Record<string, LessonProgress>;
  lastLoginDate: string;
  createdAt: string;
}

export interface LessonProgress {
  videoWatched: boolean;
  tasksCompleted: string[]; // Bajarilgan task ID lari
  totalScore: number;
  bestScore: number;
  attempts: number;
  completedAt?: string;
}

export interface AIResult {
  score: number;
  explanation: string;
  confidence: number;
}
