import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Card, Title } from 'react-native-paper';
import { WorkoutSession } from '../types';

interface ExerciseChartProps {
  sessions: WorkoutSession[];
  exerciseName: string;
}

const ExerciseChart: React.FC<ExerciseChartProps> = ({ sessions, exerciseName }) => {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 64;
  const chartHeight = 200;

  // Get max weight for scaling
  const maxWeight = Math.max(
    ...sessions.flatMap(session =>
      session.sets.map(set => set.weight)
    ),
    1
  );

  // Get last 10 sessions
  const recentSessions = sessions.slice(0, 10).reverse();

  const renderDataPoint = (session: WorkoutSession, index: number) => {
    const maxWeightInSession = Math.max(...session.sets.map(set => set.weight));
    const height = (maxWeightInSession / maxWeight) * (chartHeight - 40);
    const x = (index / Math.max(recentSessions.length - 1, 1)) * (chartWidth - 40) + 20;
    const y = chartHeight - height - 20;

    return (
      <View key={session.id}>
        <View
          style={[
            styles.dataPoint,
            {
              left: x - 4,
              top: y - 4,
            },
          ]}
        />
        <Text
          style={[
            styles.dataLabel,
            {
              left: x - 15,
              top: y + 15,
            },
          ]}
        >
          {maxWeightInSession}
        </Text>
      </View>
    );
  };

  if (sessions.length === 0) {
    return (
      <Card style={styles.container}>
        <Card.Content>
          <Title>Progress Chart</Title>
          <Text style={styles.noDataText}>No workout data available</Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      <Card.Content>
        <Title>Progress Chart - {exerciseName}</Title>
        <Text style={styles.subtitle}>Max Weight per Session</Text>
        
        <View style={[styles.chart, { width: chartWidth, height: chartHeight }]}>
          {/* Y-axis labels */}
          <Text style={[styles.axisLabel, { top: 10, left: 0 }]}>{maxWeight}</Text>
          <Text style={[styles.axisLabel, { top: chartHeight / 2, left: 0 }]}>
            {Math.round(maxWeight / 2)}
          </Text>
          <Text style={[styles.axisLabel, { bottom: 20, left: 0 }]}>0</Text>

          {/* Grid lines */}
          <View style={[styles.gridLine, { top: 20, width: chartWidth - 20 }]} />
          <View style={[styles.gridLine, { top: chartHeight / 2, width: chartWidth - 20 }]} />
          <View style={[styles.gridLine, { bottom: 20, width: chartWidth - 20 }]} />

          {/* Data points */}
          {recentSessions.map(renderDataPoint)}

          {/* Connect points with lines */}
          {recentSessions.length > 1 && (
            <View style={styles.lineContainer}>
              {/* Simple line rendering - in a real app, you'd use SVG */}
            </View>
          )}
        </View>

        <Text style={styles.chartFooter}>
          Showing last {recentSessions.length} workouts
        </Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  chart: {
    position: 'relative',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginVertical: 16,
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2196F3',
  },
  dataLabel: {
    position: 'absolute',
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    width: 30,
  },
  axisLabel: {
    position: 'absolute',
    fontSize: 10,
    color: '#666',
    width: 15,
  },
  gridLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#ddd',
    left: 20,
  },
  lineContainer: {
    position: 'absolute',
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 20,
  },
  chartFooter: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default ExerciseChart;