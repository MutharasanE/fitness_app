import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StatusBar } from 'expo-status-bar';

import CalorieTracker from './src/screens/CalorieTracker';
import WorkoutTracker from './src/screens/WorkoutTracker';
import ExerciseDetail from './src/screens/ExerciseDetail';
import CustomExercises from './src/screens/CustomExercises';
import { FitnessProvider } from './src/context/FitnessContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function WorkoutStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="WorkoutMain" 
        component={WorkoutTracker} 
        options={{ title: 'Workout Tracker' }} 
      />
      <Stack.Screen 
        name="ExerciseDetail" 
        component={ExerciseDetail} 
        options={{ title: 'Exercise Details' }} 
      />
      <Stack.Screen 
        name="CustomExercises" 
        component={CustomExercises} 
        options={{ title: 'Custom Exercises' }} 
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';
          if (route.name === 'Calories') iconName = 'restaurant';
          else if (route.name === 'Workout') iconName = 'fitness-center';
          
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Calories" 
        component={CalorieTracker}
        options={{ title: '🍎 Calorie Tracker' }}
      />
      <Tab.Screen 
        name="Workout" 
        component={WorkoutStack} 
        options={{ 
          headerShown: false,
          title: '💪 Workouts'
        }} 
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <PaperProvider>
      <FitnessProvider>
        <NavigationContainer>
          <StatusBar style="light" backgroundColor="#4CAF50" />
          <MainTabs />
        </NavigationContainer>
      </FitnessProvider>
    </PaperProvider>
  );
}
