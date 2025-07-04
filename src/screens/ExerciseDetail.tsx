import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  TextInput,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Text,
} from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { useFitness } from '../context/FitnessContext';

interface ExerciseSet {
  reps: number;
  weight: number;
  date: string;
}
const ExerciseDetail = ({ route }: any) => {
  const { exerciseId } = route.params;
  const { exercises } = useFitness();
  
  const [sets, setSets] = useState<ExerciseSet[]>([]);
  const [currentReps, setCurrentReps] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const exercise = exercises.find((ex) => ex.id === exerciseId);
  
  if (!exercise) {
    return (
      <View style={styles.container}>
        <Text>Exercise not found</Text>
      </View>
    );
  }

  const addSet = () => {
    const newSet: ExerciseSet = {
      reps: parseInt(currentReps),
      weight: parseFloat(currentWeight),
      date: new Date().toISOString().split('T')[0],
    };

    setSets([...sets, newSet]);
    setCurrentReps('');
    setCurrentWeight('');
  };

  const getChartData = () => {
    const today = new Date().toISOString().split('T')[0];
    const todaySets = sets.filter((set) => set.date === today);

    return {
      labels: todaySets.map((_, index) => `Set ${index + 1}`),
      datasets: [
        {
          data: todaySets.map((set) => set.weight),
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.infoCard}>
        <Card.Content>
          <Title>{exercise.name}</Title>
          <Paragraph>
            Category: {exercise.category.toUpperCase()}
            {exercise.isCustom && ' (Custom)'}
          </Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.addSetCard}>
        <Card.Content>
          <Title>Add Set</Title>
          <TextInput
            placeholder="Reps"
            value={currentReps}
            onChangeText={setCurrentReps}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            placeholder="Weight (lbs/kg)"
            value={currentWeight}
            onChangeText={setCurrentWeight}
            keyboardType="numeric"
            style={styles.input}
          />
          <Button mode="contained" onPress={addSet} style={styles.addButton}>
            Add Set
          </Button>
        </Card.Content>
      </Card>

      {sets.filter((set) => set.date === new Date().toISOString().split('T')[0]).length > 0 && (
        <Card style={styles.chartCard}>
          <Card.Content>
            <Title>Today's Progress</Title>
            <LineChart
              data={getChartData()}
              width={Dimensions.get('window').width - 32}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
    borderRadius: 16,
  },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
  },
              }}
              style={styles.chart}
            />
          </Card.Content>
        </Card>
      )}

      <Card style={styles.historyCard}>
        <Card.Content>
          <Title>Today's Sets</Title>
          {sets
            .filter((set) => set.date === new Date().toISOString().split('T')[0])
            .map((set, index) => (
              <View key={index} style={styles.setRow}>
                <Text>
                  Set {index + 1}: {set.reps} reps × {set.weight} lbs
                </Text>
              </View>
            ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  infoCard: {
    margin: 16,
  },
  addSetCard: {
    margin: 16,
  },
  input: {
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    backgroundColor: 'white',
  },
  addButton: {
    marginTop: 8,
  },
  chartCard: {
    margin: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  historyCard: {
    margin: 16,
  },
  setRow: {
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});

export default ExerciseDetail;