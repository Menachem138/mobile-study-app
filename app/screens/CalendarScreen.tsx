import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

type ViewMode = 'day' | 'week' | 'month';

export function CalendarScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  return (
    <View>
      <Text>לוח שנה</Text>
      <View>
        <TouchableOpacity onPress={() => setViewMode('day')}>
          <Text>יום</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setViewMode('week')}>
          <Text>שבוע</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setViewMode('month')}>
          <Text>חודש</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
