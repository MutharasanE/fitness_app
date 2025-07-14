import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useFitness } from '../context/FitnessContext';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

// Define navigation types
type RootStackParamList = {
  WorkoutTracker: undefined;
  ExerciseDetail: { exerciseId: string };
};

type WorkoutTrackerNavigationProp = StackNavigationProp<
  RootStackParamList,
  'WorkoutTracker'
>;

// Move ExerciseModal outside the main component
interface ExerciseModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  exerciseName: string;
  setExerciseName: (value: string) => void;
  exerciseCategory: string;
  setExerciseCategory: (value: string) => void;
  defaultSets: string;
  setDefaultSets: (value: string) => void;
  defaultReps: string;
  setDefaultReps: (value: string) => void;
  defaultWeight: string;
  setDefaultWeight: (value: string) => void;
  resetForm: () => void;
}

const ExerciseModal: React.FC<ExerciseModalProps> = React.memo(({
  visible,
  onClose,
  onSubmit,
  title,
  exerciseName,
  setExerciseName,
  exerciseCategory,
  setExerciseCategory,
  defaultSets,
  setDefaultSets,
  defaultReps,
  setDefaultReps,
  defaultWeight,
  setDefaultWeight,
  resetForm,
}) => (
  <Modal visible={visible} animationType="slide" transparent>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{title}</Text>
        
        <TextInput
          style={styles.modalInput}
          placeholder="Exercise Name"
          value={exerciseName}
          onChangeText={setExerciseName}
        />
        
        <TextInput
          style={styles.modalInput}
          placeholder="Category (e.g., chest, back, legs)"
          value={exerciseCategory}
          onChangeText={setExerciseCategory}
        />
        
        <TextInput
          style={styles.modalInput}
          placeholder="Default Sets (optional)"
          value={defaultSets}
          onChangeText={setDefaultSets}
          keyboardType="numeric"
        />
        
        <TextInput
          style={styles.modalInput}
          placeholder="Default Reps (optional)"
          value={defaultReps}
          onChangeText={setDefaultReps}
          keyboardType="numeric"
        />
        
        <TextInput
          style={styles.modalInput}
          placeholder="Default Weight (optional)"
          value={defaultWeight}
          onChangeText={setDefaultWeight}
          keyboardType="numeric"
        />
        
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={() => {
              onClose();
              resetForm();
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.modalButton, styles.submitButton]}
            onPress={onSubmit}
          >
            <Text style={styles.submitButtonText}>
              {title.includes('Add') ? 'Add to Today' : 'Update'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
));

const WorkoutTracker: React.FC = () => {
  const navigation = useNavigation<WorkoutTrackerNavigationProp>();
  const {
    getCurrentDayPlan,
    exercises,
    addWorkoutSession,
    getTodaysWorkout,
    workoutSessions,
    addExercise,
    updateExercise,
    deleteExercise,
    updateWorkoutSession,
    addExerciseToDay,
  } = useFitness();

  const todaysPlan = getCurrentDayPlan();
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<any>(null);
  
  // Form states for adding/editing exercises
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseCategory, setExerciseCategory] = useState('');
  const [defaultSets, setDefaultSets] = useState('');
  const [defaultReps, setDefaultReps] = useState('');
  const [defaultWeight, setDefaultWeight] = useState('');

  // Memoize callbacks to prevent unnecessary re-renders
  const handleCloseAddModal = useCallback(() => {
    setShowAddExerciseModal(false);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
  }, []);

  const resetForm = useCallback(() => {
    setExerciseName('');
    setExerciseCategory('');
    setDefaultSets('');
    setDefaultReps('');
    setDefaultWeight('');
    setEditingExercise(null);
  }, []);

  const startExercise = (exerciseId: string) => {
    setActiveExercise(exerciseId);
  };

  const navigateToExerciseDetail = (exerciseId: string) => {
    navigation.navigate('ExerciseDetail', { exerciseId });
  };

  const openEditModal = (exercise: any) => {
    setEditingExercise(exercise);
    setExerciseName(exercise.name);
    setExerciseCategory(exercise.category);
    setDefaultSets(exercise.defaultSets?.toString() || '');
    setDefaultReps(exercise.defaultReps?.toString() || '');
    setDefaultWeight(exercise.defaultWeight?.toString() || '');
    setShowEditModal(true);
  };

  const handleAddExercise = useCallback(async () => {
    if (!exerciseName.trim() || !exerciseCategory.trim()) {
      Alert.alert('Error', 'Please fill in exercise name and category');
      return;
    }

    const newExercise = {
      id: `custom_${Date.now()}`,
      name: exerciseName.trim(),
      category: exerciseCategory.trim(),
      isCustom: true,
      defaultSets: defaultSets ? parseInt(defaultSets) : 3,
      defaultReps: defaultReps ? parseInt(defaultReps) : 10,
      defaultWeight: defaultWeight ? parseFloat(defaultWeight) : 0,
    };

    try {
      await addExercise(newExercise);
      
      // Add to today's workout plan
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = days[new Date().getDay()] as any;
      await addExerciseToDay(today, newExercise.id);
      
      setShowAddExerciseModal(false);
      resetForm();
      Alert.alert('Success', 'Exercise added to today\'s workout!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add exercise');
    }
  }, [exerciseName, exerciseCategory, defaultSets, defaultReps, defaultWeight, addExercise, addExerciseToDay, resetForm]);

  const handleUpdateExercise = useCallback(async () => {
    if (!exerciseName.trim() || !exerciseCategory.trim()) {
      Alert.alert('Error', 'Please fill in exercise name and category');
      return;
    }

    const updatedExercise = {
      ...editingExercise,
      name: exerciseName.trim(),
      category: exerciseCategory.trim(),
      defaultSets: defaultSets ? parseInt(defaultSets) : 3,
      defaultReps: defaultReps ? parseInt(defaultReps) : 10,
      defaultWeight: defaultWeight ? parseFloat(defaultWeight) : 0,
    };

    try {
      await updateExercise(updatedExercise);
      setShowEditModal(false);
      resetForm();
      Alert.alert('Success', 'Exercise updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update exercise');
    }
  }, [exerciseName, exerciseCategory, defaultSets, defaultReps, defaultWeight, editingExercise, updateExercise, resetForm]);

  const handleDeleteExercise = (exerciseId: string) => {
    Alert.alert(
      'Delete Exercise',
      'Are you sure you want to delete this exercise? This will remove it from all workout plans.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExercise(exerciseId);
              Alert.alert('Success', 'Exercise deleted successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete exercise');
            }
          },
        },
      ]
    );
  };

  const completeSet = async (exerciseId: string, reps: number, weight: number) => {
    try {
      const today = new Date().toISOString();
      const existingSession = getTodaysWorkout(exerciseId);

      if (existingSession) {
        // Add set to existing session
        const newSet = { reps, weight, completed: true };
        const updatedSession = {
          ...existingSession,
          sets: [...existingSession.sets, newSet],
        };
        await updateWorkoutSession(updatedSession);
      } else {
        // Create new session
        await addWorkoutSession({
          exerciseId,
          date: today,
          sets: [{ reps, weight, completed: true }],
          notes: '',
        });
      }

      Alert.alert('Set Complete!', `${reps} reps at ${weight} lbs recorded`);
    } catch (error) {
      Alert.alert('Error', 'Failed to record set');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Workout</Text>
        <Text style={styles.subtitle}>
          {todaysPlan.length} exercises planned
        </Text>
        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={() => setShowAddExerciseModal(true)}
        >
          <Text style={styles.addExerciseButtonText}>+ Add Custom Exercise</Text>
        </TouchableOpacity>
      </View>

      {todaysPlan.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No exercises planned for today</Text>
          <Text style={styles.emptySubtext}>
            Add custom exercises to get started with your workout
          </Text>
        </View>
      ) : (
        todaysPlan.map((exercise) => {
          const todaysSession = getTodaysWorkout(exercise.id);
          const isActive = activeExercise === exercise.id;

          return (
            <View key={exercise.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <TouchableOpacity
                  onPress={() => navigateToExerciseDetail(exercise.id)}
                  style={styles.exerciseNameContainer}
                >
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.tapHint}>Tap for detailed tracking</Text>
                </TouchableOpacity>
                <View style={styles.exerciseActions}>
                  <Text style={styles.exerciseCategory}>{exercise.category}</Text>
                  {exercise.isCustom && (
                    <View style={styles.customExerciseActions}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => openEditModal(exercise)}
                      >
                        <Text style={styles.editButtonText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteExercise(exercise.id)}
                      >
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.exerciseDetails}>
                <Text style={styles.defaultText}>
                  Default: {exercise.defaultSets || 3} sets × {exercise.defaultReps || 10} reps
                  {exercise.defaultWeight ? ` @ ${exercise.defaultWeight} lbs` : ''}
                </Text>
              </View>

              {todaysSession && todaysSession.sets.length > 0 && (
                <View style={styles.completedSets}>
                  <Text style={styles.completedTitle}>Completed Sets:</Text>
                  {todaysSession.sets.map((set, index) => (
                    <Text key={index} style={styles.setInfo}>
                      Set {index + 1}: {set.reps} reps @ {set.weight} lbs
                    </Text>
                  ))}
                </View>
              )}

              <View style={styles.exerciseActionButtons}>
                <TouchableOpacity
                  style={[styles.button, isActive && styles.activeButton]}
                  onPress={() => startExercise(exercise.id)}
                >
                  <Text style={styles.buttonText}>
                    {isActive ? 'Active' : 'Start Exercise'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickAddButton}
                  onPress={() => completeSet(
                    exercise.id,
                    exercise.defaultReps || 10,
                    exercise.defaultWeight || 0
                  )}
                >
                  <Text style={styles.buttonText}>Quick Add Set</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Workout Summary</Text>
        <Text style={styles.summaryText}>
          Total Sessions Today: {workoutSessions.filter(s => 
            s.date.startsWith(new Date().toISOString().split('T')[0])
          ).length}
        </Text>
      </View>

      <ExerciseModal
        visible={showAddExerciseModal}
        onClose={handleCloseAddModal}
        onSubmit={handleAddExercise}
        title="Add New Exercise"
        exerciseName={exerciseName}
        setExerciseName={setExerciseName}
        exerciseCategory={exerciseCategory}
        setExerciseCategory={setExerciseCategory}
        defaultSets={defaultSets}
        setDefaultSets={setDefaultSets}
        defaultReps={defaultReps}
        setDefaultReps={setDefaultReps}
        defaultWeight={defaultWeight}
        setDefaultWeight={setDefaultWeight}
        resetForm={resetForm}
      />

            <ExerciseModal
        visible={showEditModal}
        onClose={handleCloseEditModal}
        onSubmit={handleUpdateExercise}
        title="Edit Exercise"
        exerciseName={exerciseName}
        setExerciseName={setExerciseName}
        exerciseCategory={exerciseCategory}
        setExerciseCategory={setExerciseCategory}
        defaultSets={defaultSets}
        setDefaultSets={setDefaultSets}
        defaultReps={defaultReps}
        setDefaultReps={setDefaultReps}
        defaultWeight={defaultWeight}
        setDefaultWeight={setDefaultWeight}
        resetForm={resetForm}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  addExerciseButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },
  addExerciseButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  exerciseCard: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  exerciseNameContainer: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tapHint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  exerciseActions: {
    alignItems: 'flex-end',
  },
  exerciseCategory: {
    fontSize: 12,
    color: '#4CAF50',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  customExerciseActions: {
    flexDirection: 'row',
    gap: 5,
  },
  editButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  editButtonText: {
    color: 'white',
    fontSize: 12,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
  },
  exerciseDetails: {
    marginBottom: 10,
  },
  defaultText: {
    fontSize: 14,
    color: '#666',
  },
  completedSets: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  completedTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  setInfo: {
    fontSize: 12,
    color: '#666',
  },
  exerciseActionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#2196F3',
  },
  quickAddButton: {
    backgroundColor: '#FF9800',
    padding: 12,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  summary: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default WorkoutTracker;
