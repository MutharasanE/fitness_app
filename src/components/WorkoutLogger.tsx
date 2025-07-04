import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Card, Title, Button, Checkbox } from 'react-native-paper';
import { Exercise, WorkoutSet, WorkoutSession } from '../types';
import { useFitness } from '../context/FitnessContext';

interface WorkoutLoggerProps {
  exercise: Exercise;
  onComplete?: () => void;
}

const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({ exercise, onComplete }) => {
  const { addWorkoutSession, updateWorkoutSession, getTodaysWorkout } = useFitness();
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [notes, setNotes] = useState('');
  const [existingSession, setExistingSession] = useState<WorkoutSession | undefined>();

  useEffect(() => {
    const todaysSession = getTodaysWorkout(exercise.id);
    if (todaysSession) {
      setExistingSession(todaysSession);
      setSets(todaysSession.sets);
      setNotes(todaysSession.notes || '');
    } else {
      // Initialize with default sets
      const defaultSets = exercise.defaultSets || 3;
      const initialSets: WorkoutSet[] = Array.from({ length: defaultSets }, () => ({
        reps: exercise.defaultReps || 10,
        weight: exercise.defaultWeight || 0,
        completed: false,
      }));
      setSets(initialSets);
    }
  }, [exercise]);

  const updateSet = (index: number, field: keyof WorkoutSet, value: number | boolean) => {
    setSets(prev =>
      prev.map((set, i) =>
        i === index ? { ...set, [field]: value } : set
      )
    );
  };

  const addSet = () => {
    const lastSet = sets[sets.length - 1];
    setSets(prev => [
      ...prev,
      {
        reps: lastSet?.reps || exercise.defaultReps || 10,
        weight: lastSet?.weight || exercise.defaultWeight || 0,
        completed: false,
      },
    ]);
  };

  const removeSet = (index: number) => {
    if (sets.length > 1) {
      setSets(prev => prev.filter((_, i) => i !== index));
    }
  };

  const saveWorkout = async () => {
    try {
      const today = new Date().toISOString();
      const sessionData = {
        exerciseId: exercise.id,
        date: today,
        sets,
        notes,
      };

      console.log('Saving workout:', sessionData);

      if (existingSession) {
        await updateWorkoutSession(existingSession.id, sessionData);
        console.log('Updated existing session');
      } else {
        await addWorkoutSession(sessionData);
        console.log('Added new session');
      }

      Alert.alert('Success', 'Workout saved!', [
        { text: 'OK', onPress: onComplete },
      ]);
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('Error', 'Failed to save workout. Please try again.');
    }
  };

  return (
    <Card style={styles.container}>
      <Card.Content>
        <Title style={styles.title}>{exercise.name}</Title>
        
        {sets.map((set, index) => (
          <View key={index} style={styles.setRow}>
            <Text style={styles.setNumber}>Set {index + 1}</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Weight</Text>
              <TextInput
                style={styles.input}
                value={set.weight.toString()}
                onChangeText={(text) => updateSet(index, 'weight', parseFloat(text) || 0)}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Reps</Text>
              <TextInput
                style={styles.input}
                value={set.reps.toString()}
                onChangeText={(text) => updateSet(index, 'reps', parseInt(text) || 0)}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>

            <Checkbox
              status={set.completed ? 'checked' : 'unchecked'}
              onPress={() => updateSet(index, 'completed', !set.completed)}
            />

            {sets.length > 1 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeSet(index)}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <Button mode="outlined" onPress={addSet} style={styles.addSetButton}>
          Add Set
        </Button>

        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="Notes (optional)"
          multiline
        />

        <Button mode="contained" onPress={saveWorkout} style={styles.saveButton}>
          Save Workout
        </Button>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  setNumber: {
    width: 50,
    fontWeight: 'bold',
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  inputLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    textAlign: 'center',
    backgroundColor: 'white',
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addSetButton: {
    marginVertical: 16,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    backgroundColor: 'white',
    minHeight: 60,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
});

export default WorkoutLogger;