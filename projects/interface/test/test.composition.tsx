import React from 'react';
import { Test } from './test';
import { Text } from 'react-native';

export const BasicTest = () => (
  <Test onPress={() => {}}>
    <Text>Hello Button</Text>
  </Test>
);
