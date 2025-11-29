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


export interface VisualizationPlan {
  template: "explosion_bubbles" | "crystal_growth" | "gas_evolution" | "flash" | "rust_growth" | "crystal_glow" | "organic_growth" | "gas_dissolve" | "acid_formation" | "none";
  duration_ms: number;
  colors: string[];
  effects: {
    bubbles?: boolean;
    flash?: boolean;
    explosion?: boolean;
    crystals?: boolean;
    smoke?: boolean;
    glow?: boolean;
    particles?: boolean;
    slow_growth?: boolean;
  };
  recommended_3d_assets: {
    product_model: string | null;
  };
}

export interface ReactionResult {
  possible: boolean;
  reaction_type?: string;
  explanation: string;
  products: string[];
  visualization_plan: VisualizationPlan;
  why_no_reaction?: string;
}

// --- ELEKTRONIKA TIPLARI ---
export enum ComponentType {
  BATTERY = 'battery',
  RESISTOR = 'resistor',
  LAMP = 'lamp',
  SWITCH = 'switch',
  CAPACITOR = 'capacitor',
  VOLTMETER = 'voltmeter',
  AMMETER = 'ammeter',
  WIRE = 'wire'
}

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  rotation: number;
  properties: Record<string, any>;
  nodes: string[];
}

export interface SimulationResult {
  nodes: Record<string, number>;
  currents: Record<string, number>;
}

// --- KINEMATIKA TIPLARI ---
export interface PhysicalObject {
  id: string;
  name: string;
  mass: number;
  area: number;
  dragCoefficient: number;
  frictionCoefficient: number;
  color: string;
  shape: 'sphere' | 'cube';
}

export interface EnvParams {
  gravity: number;
  airDensity: number;
  windSpeed: number;
  rampAngle: number;
}

export interface SimulationState {
  t: number;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  acceleration: { x: number; y: number };
  displacement: number;
}

export type Tab = 'kinematics' | 'electrodynamics';


export type ExperimentType = 'MICROSCOPE' | 'DISSECTION' | 'DNA' | 'ENZYMES' | 'OSMOSIS' | null;

export interface SlideType {
  id: string;
  name: string;
  type: 'onion' | 'cheek' | 'bacteria';
  image: string;
}

export interface Nucleotide {
  id: string;
  base: 'A' | 'T' | 'G' | 'C';
  x: number;
  y: number;
  isFixed?: boolean;
}

export type DnaStrand = Nucleotide[];
