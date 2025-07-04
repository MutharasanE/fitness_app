import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, CalorieEntry, Exercise, WorkoutEntry, WorkoutPlan, DayOfWeek, WorkoutSession, WorkoutSet } from '../types';

interface ExerciseData {
  exerciseId: string;
  sets: Array<{
    reps: number;
    weight: number;
    date: string;
  }>;
}

interface FitnessContextType {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  calorieEntries: CalorieEntry[];
  addCalorieEntry: (entry: Omit<CalorieEntry, 'id'>) => void;
  exercises: Exercise[];
  addCustomExercise: (exercise: Omit<Exercise, 'id' | 'isCustom'>) => void;
  deleteCustomExercise: (id: string) => void;
  workoutEntries: WorkoutEntry[];
  addWorkoutEntry: (entry: Omit<WorkoutEntry, 'id'>) => void;
  workoutPlan: WorkoutPlan;
  updateWorkoutPlan: (day: DayOfWeek, exerciseIds: string[]) => void;
  addExerciseToDay: (day: DayOfWeek, exerciseId: string) => void;
  removeExerciseFromDay: (day: DayOfWeek, exerciseId: string) => void;
  getCurrentDayPlan: () => Exercise[];
  getMaintenanceCalories: () => number;
  exerciseHistory: ExerciseData[];
  addExerciseSet: (exerciseId: string, reps: number, weight: number) => void;
  getExerciseHistoryByDateRange: (exerciseId: string, startDate: string, endDate: string) => Array<{reps: number; weight: number; date: string}>;
  getTodaysExerciseSets: (exerciseId: string) => Array<{reps: number; weight: number; date: string}>;
  workoutSessions: WorkoutSession[];
  addWorkoutSession: (session: Omit<WorkoutSession, 'id'>) => void;
  updateWorkoutSession: (sessionId: string, updates: Partial<WorkoutSession>) => void;
  getExerciseHistory: (exerciseId: string) => WorkoutSession[];
  getTodaysWorkout: (exerciseId: string) => WorkoutSession | undefined;
}

const FitnessContext = createContext<FitnessContextType | undefined>(undefined);

const defaultExercises: Exercise[] = [
  // Chest
  { id: 'chest_1', name: 'Bench Press', category: 'chest', isCustom: false, defaultSets: 3, defaultReps: 10, defaultWeight: 135 },
  { id: 'chest_2', name: 'Push-ups', category: 'chest', isCustom: false, defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
  { id: 'chest_3', name: 'Incline Dumbbell Press', category: 'chest', isCustom: false, defaultSets: 3, defaultReps: 10, defaultWeight: 50 },
  { id: 'chest_4', name: 'Dumbbell Flyes', category: 'chest', isCustom: false, defaultSets: 3, defaultReps: 12, defaultWeight: 25 },

  // Back
  { id: 'back_1', name: 'Pull-ups', category: 'back', isCustom: false, defaultSets: 3, defaultReps: 8, defaultWeight: 0 },
  { id: 'back_2', name: 'Deadlift', category: 'back', isCustom: false, defaultSets: 3, defaultReps: 5, defaultWeight: 185 },
  { id: 'back_3', name: 'Bent-over Row', category: 'back', isCustom: false, defaultSets: 3, defaultReps: 10, defaultWeight: 135 },
  { id: 'back_4', name: 'Lat Pulldown', category: 'back', isCustom: false, defaultSets: 3, defaultReps: 12, defaultWeight: 100 },
  { id: 'back_5', name: 'T-Bar Row', category: 'back', isCustom: false, defaultSets: 3, defaultReps: 10, defaultWeight: 90 },

  // Shoulders
  { id: 'shoulders_1', name: 'Overhead Press', category: 'shoulders', isCustom: false, defaultSets: 3, defaultReps: 8, defaultWeight: 95 },
  { id: 'shoulders_2', name: 'Lateral Raises', category: 'shoulders', isCustom: false, defaultSets: 3, defaultReps: 15, defaultWeight: 15 },
  { id: 'shoulders_3', name: 'Front Raises', category: 'shoulders', isCustom: false, defaultSets: 3, defaultReps: 12, defaultWeight: 15 },
  { id: 'shoulders_4', name: 'Rear Delt Flyes', category: 'shoulders', isCustom: false, defaultSets: 3, defaultReps: 15, defaultWeight: 10 },

  // Biceps
  { id: 'biceps_1', name: 'Bicep Curls', category: 'biceps', isCustom: false, defaultSets: 3, defaultReps: 12, defaultWeight: 25 },
  { id: 'biceps_2', name: 'Hammer Curls', category: 'biceps', isCustom: false, defaultSets: 3, defaultReps: 12, defaultWeight: 25 },
  { id: 'biceps_3', name: 'Preacher Curls', category: 'biceps', isCustom: false, defaultSets: 3, defaultReps: 10, defaultWeight: 30 },
  { id: 'biceps_4', name: 'Cable Curls', category: 'biceps', isCustom: false, defaultSets: 3, defaultReps: 12, defaultWeight: 40 },

  // Triceps
  { id: 'triceps_1', name: 'Tricep Dips', category: 'triceps', isCustom: false, defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
  { id: 'triceps_2', name: 'Close-grip Bench Press', category: 'triceps', isCustom: false, defaultSets: 3, defaultReps: 10, defaultWeight: 115 },
  { id: 'triceps_3', name: 'Overhead Tricep Extension', category: 'triceps', isCustom: false, defaultSets: 3, defaultReps: 12, defaultWeight: 35 },
  { id: 'triceps_4', name: 'Tricep Pushdowns', category: 'triceps', isCustom: false, defaultSets: 3, defaultReps: 15, defaultWeight: 50 },

  // Forearms
  { id: 'forearms_1', name: 'Wrist Curls', category: 'forearms', isCustom: false, defaultSets: 3, defaultReps: 20, defaultWeight: 15 },
  { id: 'forearms_2', name: 'Reverse Curls', category: 'forearms', isCustom: false, defaultSets: 3, defaultReps: 15, defaultWeight: 20 },
  { id: 'forearms_3', name: 'Farmer\'s Walk', category: 'forearms', isCustom: false, defaultSets: 3, defaultReps: 30, defaultWeight: 50 },
  
  // Legs
  { id: 'legs_1', name: 'Squats', category: 'legs', isCustom: false, defaultSets: 3, defaultReps: 10, defaultWeight: 155 },
  { id: 'legs_2', name: 'Lunges', category: 'legs', isCustom: false, defaultSets: 3, defaultReps: 12, defaultWeight: 25 },
  { id: 'legs_3', name: 'Leg Press', category: 'legs', isCustom: false, defaultSets: 3, defaultReps: 15, defaultWeight: 200 },
  { id: 'legs_4', name: 'Romanian Deadlift', category: 'legs', isCustom: false, defaultSets: 3, defaultReps: 10, defaultWeight: 135 },
  { id: 'legs_5', name: 'Calf Raises', category: 'legs', isCustom: false, defaultSets: 3, defaultReps: 20, defaultWeight: 45 },
  { id: 'legs_6', name: 'Leg Curls', category: 'legs', isCustom: false, defaultSets: 3, defaultReps: 12, defaultWeight: 80 },
  
  // Abs
  { id: 'abs_1', name: 'Plank', category: 'abs', isCustom: false, defaultSets: 3, defaultReps: 60, defaultWeight: 0 },
  { id: 'abs_2', name: 'Crunches', category: 'abs', isCustom: false, defaultSets: 3, defaultReps: 25, defaultWeight: 0 },
  { id: 'abs_3', name: 'Russian Twists', category: 'abs', isCustom: false, defaultSets: 3, defaultReps: 30, defaultWeight: 10 },
  { id: 'abs_4', name: 'Mountain Climbers', category: 'abs', isCustom: false, defaultSets: 3, defaultReps: 20, defaultWeight: 0 },
  { id: 'abs_5', name: 'Bicycle Crunches', category: 'abs', isCustom: false, defaultSets: 3, defaultReps: 20, defaultWeight: 0 },
];

const getDefaultWorkoutPlan = (): WorkoutPlan => ({
  Monday: ['chest_1', 'chest_2', 'triceps_1', 'abs_1'],
  Tuesday: ['back_1', 'back_3', 'biceps_1', 'abs_2'],
  Wednesday: ['legs_1', 'legs_2', 'legs_5', 'abs_3'],
  Thursday: ['shoulders_1', 'shoulders_2', 'forearms_1', 'abs_4'],
  Friday: ['back_2', 'triceps_2', 'biceps_2', 'abs_5'],
  Saturday: [], // Optional day
  Sunday: [], // Rest day
});

export const FitnessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [calorieEntries, setCalorieEntries] = useState<CalorieEntry[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>(defaultExercises);
  const [workoutEntries, setWorkoutEntries] = useState<WorkoutEntry[]>([]);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan>(getDefaultWorkoutPlan());
  const [exerciseHistory, setExerciseHistory] = useState<ExerciseData[]>([]);
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (workoutSessions.length > 0) {
      saveWorkoutSessions();
    }
  }, [workoutSessions]);

  useEffect(() => {
    if (exerciseHistory.length > 0) {
      saveExerciseHistory();
    }
  }, [exerciseHistory]);

  const saveWorkoutSessions = async () => {
    try {
      await AsyncStorage.setItem('workoutSessions', JSON.stringify(workoutSessions));
    } catch (error) {
      console.error('Error saving workout sessions:', error);
    }
  };

  const saveExerciseHistory = async () => {
    try {
      await AsyncStorage.setItem('exerciseHistory', JSON.stringify(exerciseHistory));
    } catch (error) {
      console.error('Error saving exercise history:', error);
    }
  };

  const loadData = async () => {
    try {
      const profile = await AsyncStorage.getItem('userProfile');
      const calories = await AsyncStorage.getItem('calorieEntries');
      const customExercises = await AsyncStorage.getItem('customExercises');
      const workouts = await AsyncStorage.getItem('workoutEntries');
      const plan = await AsyncStorage.getItem('workoutPlan');
      const history = await AsyncStorage.getItem('exerciseHistory');
      const sessions = await AsyncStorage.getItem('workoutSessions');

      if (profile) setUserProfileState(JSON.parse(profile));
      if (calories) setCalorieEntries(JSON.parse(calories));
      if (customExercises) {
        const custom = JSON.parse(customExercises);
        setExercises([...defaultExercises, ...custom]);
      }
      if (workouts) setWorkoutEntries(JSON.parse(workouts));
      if (plan) setWorkoutPlan(JSON.parse(plan));
      if (history) setExerciseHistory(JSON.parse(history));
      if (sessions) setWorkoutSessions(JSON.parse(sessions));

      console.log('Data loaded successfully');
      console.log('Workout sessions loaded:', sessions ? JSON.parse(sessions).length : 0);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const setUserProfile = async (profile: UserProfile) => {
    setUserProfileState(profile);
    await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
  };

  const addCalorieEntry = async (entry: Omit<CalorieEntry, 'id'>) => {
    const newEntry = { ...entry, id: Date.now().toString() };
    const updated = [...calorieEntries, newEntry];
    setCalorieEntries(updated);
    await AsyncStorage.setItem('calorieEntries', JSON.stringify(updated));
  };

  const addCustomExercise = async (exercise: Omit<Exercise, 'id' | 'isCustom'>) => {
    const newExercise = { 
      ...exercise, 
      id: `custom_${Date.now()}`, 
      isCustom: true,
      defaultSets: exercise.defaultSets || 3,
      defaultReps: exercise.defaultReps || 10,
      defaultWeight: exercise.defaultWeight || 0,
    };
    const updated = [...exercises, newExercise];
    setExercises(updated);
    
    const customOnly = updated.filter(e => e.isCustom);
    await AsyncStorage.setItem('customExercises', JSON.stringify(customOnly));
  };

  const addExerciseSet = async (exerciseId: string, reps: number, weight: number) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const newSet = {
        reps,
        weight,
        date: today,
      };

      const updatedHistory = [...exerciseHistory];
      const existingExerciseIndex = updatedHistory.findIndex(ex => ex.exerciseId === exerciseId);

      if (existingExerciseIndex >= 0) {
        updatedHistory[existingExerciseIndex].sets.push(newSet);
      } else {
        updatedHistory.push({
          exerciseId,
          sets: [newSet],
        });
      }

      setExerciseHistory(updatedHistory);
      
      // Immediately save to storage
      await AsyncStorage.setItem('exerciseHistory', JSON.stringify(updatedHistory));
      console.log('Exercise history saved to storage');
    } catch (error) {
      console.error('Error adding exercise set:', error);
    }
  };

  const addWorkoutSession = async (session: Omit<WorkoutSession, 'id'>) => {
    try {
      const newSession: WorkoutSession = {
        ...session,
        id: Date.now().toString(),
      };
      
      console.log('Adding workout session:', newSession);
      
      const updated = [...workoutSessions, newSession];
      setWorkoutSessions(updated);
      
      // Immediately save to storage
      await AsyncStorage.setItem('workoutSessions', JSON.stringify(updated));
      console.log('Workout session saved to storage');
    } catch (error) {
      console.error('Error adding workout session:', error);
    }
  };

  const updateWorkoutSession = async (sessionId: string, updates: Partial<WorkoutSession>) => {
    try {
      console.log('Updating workout session:', sessionId, updates);
      
      const updated = workoutSessions.map(session =>
        session.id === sessionId ? { ...session, ...updates } : session
      );
      
      setWorkoutSessions(updated);
      
      // Immediately save to storage
      await AsyncStorage.setItem('workoutSessions', JSON.stringify(updated));
      console.log('Workout session updated in storage');
    } catch (error) {
      console.error('Error updating workout session:', error);
    }
  };

  const getExerciseHistory = (exerciseId: string): WorkoutSession[] => {
    return workoutSessions
      .filter(session => session.exerciseId === exerciseId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getTodaysWorkout = (exerciseId: string): WorkoutSession | undefined => {
    const today = new Date().toISOString().split('T')[0];
    return workoutSessions.find(
      session => session.exerciseId === exerciseId && session.date.startsWith(today)
    );
  };

  const getExerciseHistoryByDateRange = (
    exerciseId: string, 
    startDate: string, 
    endDate: string
  ): Array<{reps: number; weight: number; date: string}> => {
    const exerciseData = exerciseHistory.find(ex => ex.exerciseId === exerciseId);
    
    if (!exerciseData) return [];

    return exerciseData.sets.filter(set => {
      const setDate = new Date(set.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return setDate >= start && setDate <= end;
    });
  };

  const getTodaysExerciseSets = (exerciseId: string): Array<{reps: number; weight: number; date: string}> => {
    const today = new Date().toISOString().split('T')[0];
    return getExerciseHistoryByDateRange(exerciseId, today, today);
  };

  const deleteCustomExercise = async (id: string) => {
    // Remove from exercises list
    const updatedExercises = exercises.filter(e => e.id !== id);
    setExercises(updatedExercises);
    
    // Remove from all workout plans
    const updatedPlan = { ...workoutPlan };
    Object.keys(updatedPlan).forEach(day => {
      updatedPlan[day as DayOfWeek] = updatedPlan[day as DayOfWeek].filter(exerciseId => exerciseId !== id);
    });
    setWorkoutPlan(updatedPlan);
    
    // Remove from exercise history
    const updatedHistory = exerciseHistory.filter(ex => ex.exerciseId !== id);
    setExerciseHistory(updatedHistory);

    // Remove from workout sessions
    const updatedSessions = workoutSessions.filter(session => session.exerciseId !== id);
    setWorkoutSessions(updatedSessions);
    
    // Save to storage
    const customOnly = updatedExercises.filter(e => e.isCustom);
    await AsyncStorage.setItem('customExercises', JSON.stringify(customOnly));
    await AsyncStorage.setItem('workoutPlan', JSON.stringify(updatedPlan));
    await AsyncStorage.setItem('exerciseHistory', JSON.stringify(updatedHistory));
    await AsyncStorage.setItem('workoutSessions', JSON.stringify(updatedSessions));
  };

  const addWorkoutEntry = async (entry: Omit<WorkoutEntry, 'id'>) => {
    const newEntry = { ...entry, id: Date.now().toString() };
    const updated = [...workoutEntries, newEntry];
    setWorkoutEntries(updated);
    await AsyncStorage.setItem('workoutEntries', JSON.stringify(updated));
  };

  const updateWorkoutPlan = async (day: DayOfWeek, exerciseIds: string[]) => {
    const updated = { ...workoutPlan, [day]: exerciseIds };
    setWorkoutPlan(updated);
    await AsyncStorage.setItem('workoutPlan', JSON.stringify(updated));
  };

  const addExerciseToDay = async (day: DayOfWeek, exerciseId: string) => {
    const currentExercises = workoutPlan[day] || [];
    if (!currentExercises.includes(exerciseId)) {
      const updated = { ...workoutPlan, [day]: [...currentExercises, exerciseId] };
      setWorkoutPlan(updated);
      await AsyncStorage.setItem('workoutPlan', JSON.stringify(updated));
    }
  };

  const removeExerciseFromDay = async (day: DayOfWeek, exerciseId: string) => {
    const currentExercises = workoutPlan[day] || [];
    const updated = { 
      ...workoutPlan, 
      [day]: currentExercises.filter(id => id !== exerciseId) 
    };
    setWorkoutPlan(updated);
    await AsyncStorage.setItem('workoutPlan', JSON.stringify(updated));
  };

  const getCurrentDayPlan = (): Exercise[] => {
    const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    const exerciseIds = workoutPlan[today] || [];
    
    return exerciseIds
      .map(id => exercises.find(ex => ex.id === id))
      .filter(Boolean) as Exercise[];
  };

  const getMaintenanceCalories = (): number => {
    if (!userProfile) return 2000;
    
    const { weight, height, age, gender, activityLevel } = userProfile;
    
    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    
    // Apply activity multiplier
    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    
    return Math.round(bmr * multipliers[activityLevel]);
  };

  const value: FitnessContextType = {
    userProfile,
    setUserProfile,
    calorieEntries,
    addCalorieEntry,
    exercises,
    addCustomExercise,
    deleteCustomExercise,
    workoutEntries,
    addWorkoutEntry,
    workoutPlan,
    updateWorkoutPlan,
    addExerciseToDay,
    removeExerciseFromDay,
    getCurrentDayPlan,
    getMaintenanceCalories,
    exerciseHistory,
    addExerciseSet,
    getExerciseHistory,
    getExerciseHistoryByDateRange,
    getTodaysExerciseSets,
    workoutSessions,
    addWorkoutSession,
    updateWorkoutSession,
    getTodaysWorkout,
  };

  return (
    <FitnessContext.Provider value={value}>
      {children}
    </FitnessContext.Provider>
  );
};

export const useFitness = () => {
  const context = useContext(FitnessContext);
  if (!context) {
    throw new Error('useFitness must be used within a FitnessProvider');
  }
  return context;
};