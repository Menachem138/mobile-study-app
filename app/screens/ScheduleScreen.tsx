import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { MainSchedule } from '../components/MainSchedule';
import { BackupSchedule } from '../components/BackupSchedule';
import { RulesBoard } from '../components/RulesBoard';

const Tab = createMaterialTopTabNavigator();

export function ScheduleScreen() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: { backgroundColor: '#E8EAF6' },
        tabBarIndicatorStyle: { backgroundColor: '#3F51B5' },
      }}
    >
      <Tab.Screen
        name="MainSchedule"
        component={MainSchedule}
        options={{ title: 'לוח זמנים' }}
      />
      <Tab.Screen
        name="BackupSchedule"
        component={BackupSchedule}
        options={{ title: 'תוכנית גיבוי' }}
      />
      <Tab.Screen
        name="RulesBoard"
        component={RulesBoard}
        options={{ title: 'כללים חשובים' }}
      />
    </Tab.Navigator>
  );
}
