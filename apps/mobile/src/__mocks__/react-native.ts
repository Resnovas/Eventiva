import React from 'react';

export const View = ({ children, style, testID, ...props }: any) =>
  React.createElement('div', { 'data-testid': testID, style, ...props }, children);

export const Text = ({ children, style, testID, ...props }: any) =>
  React.createElement('span', { 'data-testid': testID, style, ...props }, children);

export const TextInput = ({ value, onChangeText, placeholder, secureTextEntry, testID, ...props }: any) =>
  React.createElement('input', {
    'data-testid': testID,
    value,
    placeholder,
    type: secureTextEntry ? 'password' : 'text',
    onChange: (e: any) => onChangeText && onChangeText(e.target.value),
    ...props,
  });

export const TouchableOpacity = ({ children, onPress, disabled, testID, ...props }: any) =>
  React.createElement(
    'button',
    {
      'data-testid': testID,
      onClick: onPress,
      disabled,
      ...props,
    },
    children
  );

export const ActivityIndicator = ({ testID, ...props }: any) =>
  React.createElement('div', { 'data-testid': testID, ...props }, 'Loading...');

export const StyleSheet = {
  create: (styles: any) => styles,
};

export const SafeAreaView = View;
export const ScrollView = View;

export default {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  ScrollView,
};
