import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Button,
  Card,
  Title,
  Paragraph,
  TextInput,
  FAB,
  Portal,
  Modal,
  List,
  Menu,
} from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';
import { useFitness } from '../context/FitnessContext';
import { Exercise } from '../types';

const CustomExercises = () => {
  const { exercises, addCustomExercise, deleteCustomExercise } = useFitness();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseCategory, setNewExerciseCategory] = useState<Exercise['category']>('chest');
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  
  const categories = [
    { label: 'Chest', value: 'chest' },
    { label: 'Back', value: 'back' },
    { label: 'Shoulders', value: 'shoulders' },
    { label: 'Biceps', value: 'biceps' },
    { label: 'Triceps', value: 'triceps' },
    { label: 'Forearms', value: 'forearms' },
    { label: 'Legs', value: 'legs' },
    { label: 'Abs', value: 'abs' },
  ];

  const handleAddExercise = () => {
    if (!newExerciseName.trim()) {
      Alert.alert('Error', 'Please enter an exercise name');
      return;
    }

    addCustomExercise({
      name: newExerciseName.trim(),
      category: newExerciseCategory,
    });

    setNewExerciseName('');
    setNewExerciseCategory('chest');
    setShowAddModal(false);
    Alert.alert('Success', 'Exercise added successfully!');
  };

  const handleDeleteExercise = (exercise: Exercise) => {
    if (!exercise.isCustom) {
      Alert.alert('Error', 'Cannot delete preset exercises');
      return;
    }

    Alert.alert(
      'Delete Exercise',
      `Are you sure you want to delete "${exercise.name}"? This will remove it from all workout plans.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteCustomExercise(exercise.id),
        },
      ]
    );
  };

  const renderExercisesByCategory = (category: Exercise['category']) => {
    const categoryExercises = exercises.filter(ex => ex.category === category);
    
    if (categoryExercises.length === 0) return null;

    return (
      <Card key={category} style={styles.categoryCard}>
        <Card.Content>
          <Title style={styles.categoryTitle}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Title>
          {categoryExercises.map(exercise => (
            <View key={exercise.id} style={styles.exerciseItem}>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseType}>
                  {exercise.isCustom ? 'Custom' : 'Preset'}
                </Text>
              </View>
              {exercise.isCustom && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteExercise(exercise)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </Card.Content>
      </Card>
    );
  };

  const renderAddModal = () => (
    <Portal>
      <Modal
        visible={showAddModal}
        onDismiss={() => setShowAddModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Title style={styles.modalTitle}>Add Custom Exercise</Title>
        
        <TextInput
          label="Exercise Name"
          value={newExerciseName}
          onChangeText={setNewExerciseName}
          style={styles.input}
          mode="outlined"
        />

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Category</Text>
          <Menu
            visible={categoryMenuVisible}
            onDismiss={() => setCategoryMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setCategoryMenuVisible(true)}
                style={styles.menuButton}
              >
                {categories.find(cat => cat.value === newExerciseCategory)?.label || 'Select category'}
              </Button>
            }
          >
            {categories.map(category => (
              <Menu.Item
                key={category.value}
                onPress={() => {
                  setNewExerciseCategory(category.value as Exercise['category']);
                  setCategoryMenuVisible(false);
                }}
                title={category.label}
              />
            ))}
          </Menu>
        </View>

        <View style={styles.modalButtons}>
          <Button
            mode="outlined"
            onPress={() => setShowAddModal(false)}
            style={styles.modalButton}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleAddExercise}
            style={styles.modalButton}
          >
            Add Exercise
          </Button>
        </View>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Card style={styles.infoCard}>
          <Card.Content>
            <Title>Exercise Management</Title>
            <Paragraph>
              Here you can view all exercises and add custom ones. 
              Custom exercises can be deleted, but preset exercises cannot be removed.
            </Paragraph>
          </Card.Content>
        </Card>

        {categories.map(cat => renderExercisesByCategory(cat.value as Exercise['category']))}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setShowAddModal(true)}
        label="Add Exercise"
      />

      {renderAddModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    marginBottom: 16,
  },
  categoryCard: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2196F3',
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
  },
  exerciseType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  pickerContainer: {
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  modalButton: {
    flex: 0.4,
  },
  menuButton: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    backgroundColor: 'white',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30,
    backgroundColor: 'white',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30,
    backgroundColor: 'white',
  },
});

export default CustomExercises;