import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';

const DatePickerInput = ({ values, handleChange, handleBlur }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [date, setDate] = useState(
    values?.dob ? new Date(values.dob) : new Date(),
  );

  const onChange = (event, selectedDate) => {
    setShowPicker(Platform.OS === 'ios'); // keeps open on iOS
    if (selectedDate) {
      setDate(selectedDate);
      handleChange('dob')(selectedDate.toISOString().split('T')[0]);
    }
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
      }}
    >
      <TextInput
        style={{ flex: 1, paddingVertical: 10 }}
        placeholder="Date of Birth (YYYY-MM-DD)"
        value={values?.dob}
        onChangeText={handleChange('dob')}
        onBlur={handleBlur('dob')}
        editable={false} // prevents manual typing
      />
      <TouchableOpacity onPress={() => setShowPicker(true)}>
        <Icon name="calendar-outline" size={24} color="#333" />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="calendar"
          onChange={onChange}
          maximumDate={new Date()} // optional: prevent future dates
        />
      )}
    </View>
  );
};

export default DatePickerInput;
