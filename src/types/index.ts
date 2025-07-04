export interface UserProfile {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}

export interface CalorieEntry {
  id: string;
  date: string;
  calories: number;
  meal: string;
  food: string;
}

export interface WorkoutSet {
  reps: number;
  weight: number;
  completed: boolean;
}

export interface WorkoutSession {
  id: string;
  exerciseId: string;
  date: string; // ISO date string
  sets: WorkoutSet[];
  notes?: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  description?: string;
  instructions?: string;
  isCustom: boolean;
  // Add default sets/reps for planning
  defaultSets?: number;
  defaultReps?: number;
  defaultWeight?: number;
}

export interface WorkoutEntry {
  id: string;
  exerciseId: string;
  date: string;
  sets: WorkoutSet[];
}

// Updated to store exercise IDs instead of full exercise objects
export interface WorkoutPlan {
  [key: string]: string[]; // Array of exercise IDs
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';