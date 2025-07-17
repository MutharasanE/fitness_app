import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
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
  Menu,
  Divider,
} from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { useFitness } from '../context/FitnessContext';
import { CalorieEntry, UserProfile } from '../types';

const CalorieTracker = () => {
  const {
    userProfile,
    setUserProfile,
    calorieEntries,
    addCalorieEntry,
    getMaintenanceCalories,
  } = useFitness();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [mealMenuVisible, setMealMenuVisible] = useState(false);
  const [genderMenuVisible, setGenderMenuVisible] = useState(false);
  const [activityMenuVisible, setActivityMenuVisible] = useState(false);
  const [showMealPlanModal, setShowMealPlanModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  
  const [newEntry, setNewEntry] = useState({
    calories: '',
    meal: 'breakfast',
    food: '',
  });
  const [profileData, setProfileData] = useState<UserProfile>({
    weight: 70,
    height: 170,
    age: 25,
    gender: 'male',
    activityLevel: 'moderate',
  });

  useEffect(() => {
    if (userProfile) {
      setProfileData(userProfile);
    }
  }, [userProfile]);

  const getTodayCalories = (): number => {
    const today = new Date().toISOString().split('T')[0];
    return calorieEntries
      .filter(entry => entry.date === today)
      .reduce((sum, entry) => sum + entry.calories, 0);
  };

  const getWeeklyData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const weeklyCalories = last7Days.map(date => {
      return calorieEntries
        .filter(entry => entry.date === date)
        .reduce((sum, entry) => sum + entry.calories, 0);
    });

    const maintenanceCalories = getMaintenanceCalories();
    const labels = last7Days.map(date => {
      const d = new Date(date);
      return d.toLocaleDateString('en', { weekday: 'short' });
    });

    return {
      labels,
      datasets: [
        {
          data: weeklyCalories,
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
          strokeWidth: 2,
        },
        {
          data: Array(7).fill(maintenanceCalories),
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          strokeWidth: 2,
        },
      ],
      legend: ['Intake', 'Maintenance'],
    };
  };

  const handleAddEntry = () => {
    if (!newEntry.calories || !newEntry.food) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    addCalorieEntry({
      date: today,
      calories: parseInt(newEntry.calories),
      meal: newEntry.meal,
      food: newEntry.food,
    });

    setNewEntry({ calories: '', meal: 'breakfast', food: '' });
    setShowAddModal(false);
  };

  const handleSaveProfile = () => {
    if (!profileData.weight || !profileData.height || !profileData.age) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    if (profileData.weight <= 0 || profileData.height <= 0 || profileData.age <= 0) {
      Alert.alert('Error', 'Please enter valid positive numbers');
      return;
    }
    
    setUserProfile(profileData);
    setShowProfileModal(false);
  };

  const todayCalories = getTodayCalories();
  const maintenanceCalories = getMaintenanceCalories();
  const calorieDeficit = maintenanceCalories - todayCalories;

  const mealOptions = [
    { label: 'Breakfast', value: 'breakfast' },
    { label: 'Lunch', value: 'lunch' },
    { label: 'Dinner', value: 'dinner' },
    { label: 'Snack', value: 'snack' },
  ];

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
  ];

  const activityOptions = [
    { label: 'Sedentary', value: 'sedentary' },
    { label: 'Light Activity', value: 'light' },
    { label: 'Moderate Activity', value: 'moderate' },
    { label: 'Active', value: 'active' },
    { label: 'Very Active', value: 'very_active' },
  ];

  const mealPlan = [
    {
      day: 1,
      breakfast: "2 boiled eggs, 1 toast, 1 banana, black coffee with milk",
      lunch: "Chicken rice bowl: 250g baked chicken, 100g cooked plain rice, 100g steamed spinach",
      dinner: "Chicken salad: 250g chicken, 1 boiled egg, lettuce, tomato, cucumber, 1 apple",
      snack: "150g Greek yogurt, 10 almonds, coffee with milk"
    },
    {
      day: 2,
      breakfast: "3 scrambled eggs with spinach, 1 slice rye bread, black coffee",
      lunch: "Quinoa chicken bowl: 250g chicken, 100g cooked quinoa, 100g sautéed spinach",
      dinner: "Chicken stir-fry: 250g chicken, zucchini, mushrooms, 1 orange",
      snack: "150g Greek yogurt, 1 tsp peanut butter, coffee"
    },
    {
      day: 3,
      breakfast: "2 eggs, 30g oats with banana, black coffee",
      lunch: "Bulgur chicken plate: 250g chicken, 100g cooked bulgur, 100g carrots & beans",
      dinner: "Chicken lettuce wraps: 250g chicken, 1 boiled egg, tomato, salad leaves, 1 apple",
      snack: "150g Greek yogurt, 6 walnuts, coffee"
    },
    {
      day: 4,
      breakfast: "3-egg omelette with tomato & onion, black coffee",
      lunch: "Chicken & sweet potato: 250g chicken, 100g sweet potato, 100g spinach",
      dinner: "Spinach chicken: 250g chicken, 100g sautéed spinach with garlic, 1 orange",
      snack: "150g Greek yogurt, 10 almonds, coffee"
    },
    {
      day: 5,
      breakfast: "2 eggs + 1 egg white, 1 toast, 1 banana, black coffee",
      lunch: "Millet chicken bowl: 250g chicken, 100g cooked millet, 100g carrots & peas",
      dinner: "Grilled chicken salad: 250g chicken, 1 tsp olive oil, cucumber salad, 1 apple",
      snack: "150g Greek yogurt, 1 tsp flaxseed, coffee"
    },
    {
      day: 6,
      breakfast: "3 boiled eggs, 1 toast, black coffee",
      lunch: "Chicken & potato: 250g chicken, 100g potato, 100g spinach or mixed veggies",
      dinner: "Chicken & roasted cauliflower: 250g chicken, 1 boiled egg, 100g cauliflower & carrots",
      snack: "150g Greek yogurt, 1 tsp peanut butter"
    },
    {
      day: 7,
      breakfast: "2 boiled eggs, 1 toast, 1 orange, coffee",
      lunch: "Couscous chicken bowl: 250g chicken, 100g couscous, 100g green beans",
      dinner: "Chicken & veggie bowl: 250g chicken, boiled egg, roasted carrots & cauliflower",
      snack: "150g Greek yogurt, 1 tsp chia seeds, coffee"
    }
  ];


  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Profile Setup Card */}
        {!userProfile && (
          <Card style={styles.setupCard}>
            <Card.Content>
              <Title>Setup Your Profile</Title>
              <Paragraph>
                Set up your profile to get accurate calorie calculations
              </Paragraph>
              <Button
                mode="contained"
                onPress={() => setShowProfileModal(true)}
                style={styles.setupButton}
              >
                Setup Profile
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Daily Summary */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title>Today's Summary</Title>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{todayCalories}</Text>
                <Text style={styles.summaryLabel}>Consumed</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{maintenanceCalories}</Text>
                <Text style={styles.summaryLabel}>Maintenance</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[
                  styles.summaryNumber,
                  { color: calorieDeficit > 0 ? '#4CAF50' : '#f44336' }
                ]}>
                  {calorieDeficit > 0 ? '+' : ''}{calorieDeficit}
                </Text>
                <Text style={styles.summaryLabel}>
                  {calorieDeficit > 0 ? 'Deficit' : 'Surplus'}
                </Text>
              </View>
            </View>
            {userProfile && (
              <Button
                mode="outlined"
                onPress={() => setShowProfileModal(true)}
                style={styles.editProfileButton}
              >
                Edit Profile
              </Button>
            )}
          </Card.Content>
        </Card>

        {/* Weekly Chart */}
        <Card style={styles.chartCard}>
          <Card.Content>
            <Title>Weekly Calorie Intake</Title>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={getWeeklyData()}
                width={Dimensions.get('window').width - 60}
                height={220}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                  },
                }}
                bezier
                style={styles.chart}
              />
            </ScrollView>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#2196F3' }]} />
                <Text style={styles.legendText}>Daily Intake</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.legendText}>Maintenance</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Recent Entries */}
        <Card style={styles.entriesCard}>
          <Card.Content>
            <Title>Today's Entries</Title>
            {calorieEntries
              .filter(entry => entry.date === new Date().toISOString().split('T')[0])
              .map(entry => (
                <View key={entry.id} style={styles.entryItem}>
                  <View style={styles.entryInfo}>
                    <Text style={styles.entryFood}>{entry.food}</Text>
                    <Text style={styles.entryMeal}>{entry.meal.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.entryCalories}>{entry.calories} cal</Text>
                </View>
              ))}
            {calorieEntries.filter(entry => entry.date === new Date().toISOString().split('T')[0]).length === 0 && (
              <Paragraph>No entries for today. Add your first meal!</Paragraph>
            )}
          </Card.Content>
        </Card>

         {/* Meal Plan Card */}
        <Card style={styles.mealPlanCard}>
          <Card.Content>
            <Title>7-Day Meal Plan</Title>
            <Paragraph style={styles.mealPlanDescription}>
              Follow this structured meal plan for balanced nutrition
            </Paragraph>
            <Button
              mode="contained"
              onPress={() => setShowMealPlanModal(true)}
              style={styles.mealPlanButton}
              icon="calendar-month"
            >
              View Meal Plan
            </Button>
          </Card.Content>
        </Card>

      </ScrollView>

      {/* Add Entry FAB */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setShowAddModal(true)}
        label="Add Food"
      />

      {/* Add Entry Modal */}
      <Portal>
        <Modal
          visible={showAddModal}
          onDismiss={() => setShowAddModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Title style={styles.modalTitle}>Add Food Entry</Title>
          
          <TextInput
            label="Food Item"
            value={newEntry.food}
            onChangeText={(text) => setNewEntry({ ...newEntry, food: text })}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Calories"
            value={newEntry.calories}
            onChangeText={(text) => setNewEntry({ ...newEntry, calories: text })}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
          />

          {/* Replace RNPickerSelect with Menu */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Meal</Text>
            <Menu
              visible={mealMenuVisible}
              onDismiss={() => setMealMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setMealMenuVisible(true)}
                  style={styles.menuButton}
                >
                  {mealOptions.find(option => option.value === newEntry.meal)?.label || 'Select meal'}
                </Button>
              }
            >
              {mealOptions.map(option => (
                <Menu.Item
                  key={option.value}
                  onPress={() => {
                    setNewEntry({ ...newEntry, meal: option.value });
                    setMealMenuVisible(false);
                  }}
                  title={option.label}
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
              onPress={handleAddEntry}
              style={styles.modalButton}
            >
              Add Entry
            </Button>
          </View>
        </Modal>
      </Portal>

      <Portal>
        <Modal
          visible={showMealPlanModal}
          onDismiss={() => setShowMealPlanModal(false)}
          contentContainerStyle={styles.mealPlanModalContainer}
        >
          <View style={styles.mealPlanHeader}>
            <Title style={styles.modalTitle}>7-Day Meal Plan</Title>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.daySelector}
            >
              {mealPlan.map((day) => (
                <Button
                  key={day.day}
                  mode={selectedDay === day.day ? "contained" : "outlined"}
                  onPress={() => setSelectedDay(day.day)}
                  style={styles.dayButton}
                  compact
                >
                  Day {day.day}
                </Button>
              ))}
            </ScrollView>
          </View>

          <ScrollView style={styles.mealPlanContent}>
            {mealPlan
              .filter(day => day.day === selectedDay)
              .map((day) => (
                <View key={day.day}>
                  <View style={styles.mealSection}>
                    <Text style={styles.mealTitle}>🍳 Breakfast</Text>
                    <Text style={styles.mealDescription}>{day.breakfast}</Text>
                  </View>
                  
                  <Divider style={styles.mealDivider} />
                  
                  <View style={styles.mealSection}>
                    <Text style={styles.mealTitle}>🍽️ Lunch</Text>
                    <Text style={styles.mealDescription}>{day.lunch}</Text>
                  </View>
                  
                  <Divider style={styles.mealDivider} />
                  
                  <View style={styles.mealSection}>
                    <Text style={styles.mealTitle}>🍖 Dinner</Text>
                    <Text style={styles.mealDescription}>{day.dinner}</Text>
                  </View>
                  
                  <Divider style={styles.mealDivider} />
                  
                  <View style={styles.mealSection}>
                    <Text style={styles.mealTitle}>🥜 Snack</Text>
                    <Text style={styles.mealDescription}>{day.snack}</Text>
                  </View>
                </View>
              ))}
          </ScrollView>

          <View style={styles.mealPlanFooter}>
            <Button
              mode="contained"
              onPress={() => setShowMealPlanModal(false)}
              style={styles.closeMealPlanButton}
            >
              Close
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Profile Setup Modal */}
      <Portal>
        <Modal
          visible={showProfileModal}
          onDismiss={() => setShowProfileModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Title style={styles.modalTitle}>Profile Setup</Title>
          
          <TextInput
            label="Weight (kg)"
            value={profileData.weight.toString()}
            onChangeText={(text) => {
              const value = parseFloat(text);
              if (!isNaN(value) || text === '') {
                setProfileData({ ...profileData, weight: value || 0 });
              }
            }}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Height (cm)"
            value={profileData.height.toString()}
            onChangeText={(text) => {
              const value = parseFloat(text);
              if (!isNaN(value) || text === '') {
                setProfileData({ ...profileData, height: value || 0 });
              }
            }}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Age"
            value={profileData.age.toString()}
            onChangeText={(text) => {
              const value = parseInt(text);
              if (!isNaN(value) || text === '') {
                setProfileData({ ...profileData, age: value || 0 });
              }
            }}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
          />

          {/* Replace Gender RNPickerSelect with Menu */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Gender</Text>
            <Menu
              visible={genderMenuVisible}
              onDismiss={() => setGenderMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setGenderMenuVisible(true)}
                  style={styles.menuButton}
                >
                  {genderOptions.find(option => option.value === profileData.gender)?.label || 'Select gender'}
                </Button>
              }
            >
              {genderOptions.map(option => (
                <Menu.Item
                  key={option.value}
                  onPress={() => {
                    setProfileData({ ...profileData, gender: option.value as 'male' | 'female' });
                    setGenderMenuVisible(false);
                  }}
                  title={option.label}
                />
              ))}
            </Menu>
          </View>

          {/* Replace Activity RNPickerSelect with Menu */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Activity Level</Text>
            <Menu
              visible={activityMenuVisible}
              onDismiss={() => setActivityMenuVisible(false)}
                            anchor={
                <Button
                  mode="outlined"
                  onPress={() => setActivityMenuVisible(true)}
                  style={styles.menuButton}
                >
                  {activityOptions.find(option => option.value === profileData.activityLevel)?.label || 'Select activity level'}
                </Button>
              }
            >
              {activityOptions.map(option => (
                <Menu.Item
                  key={option.value}
                  onPress={() => {
                    setProfileData({ ...profileData, activityLevel: option.value as UserProfile['activityLevel'] });
                    setActivityMenuVisible(false);
                  }}
                  title={option.label}
                />
              ))}
            </Menu>
          </View>

          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setShowProfileModal(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSaveProfile}
              style={styles.modalButton}
            >
              Save Profile
            </Button>
          </View>
        </Modal>
      </Portal>
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
  setupCard: {
    marginBottom: 16,
    backgroundColor: '#e3f2fd',
  },
  setupButton: {
    marginTop: 12,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  editProfileButton: {
    marginTop: 16,
  },
  chartCard: {
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  entriesCard: {
    marginBottom: 16,
  },
  entryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  entryInfo: {
    flex: 1,
  },
  entryFood: {
    fontSize: 16,
    fontWeight: '500',
  },
  entryMeal: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  entryCalories: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
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
    maxHeight: '90%',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  menuButton: {
    justifyContent: 'flex-start',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  modalButton: {
    flex: 0.4,
  },
  mealPlanCard: {
    marginBottom: 16,
    backgroundColor: '#f3e5f5',
  },
  mealPlanDescription: {
    marginBottom: 12,
    color: '#666',
  },
  mealPlanButton: {
    backgroundColor: '#9c27b0',
  },
  mealPlanModalContainer: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 8,
    maxHeight: '95%',
    flex: 1,
  },
  mealPlanHeader: {
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  daySelector: {
    marginTop: 15,
  },
  dayButton: {
    marginRight: 8,
    minWidth: 70,
  },
  mealPlanContent: {
    flex: 1,
    padding: 20,
  },
  mealSection: {
    marginBottom: 20,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  mealDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    paddingLeft: 8,
  },
  mealDivider: {
    marginBottom: 20,
    backgroundColor: '#eee',
  },
  mealPlanFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  closeMealPlanButton: {
    backgroundColor: '#9c27b0',
  },
});

export default CalorieTracker;
