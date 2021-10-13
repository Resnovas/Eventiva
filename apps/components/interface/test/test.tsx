import React from 'react'
import { TouchableHighlight } from 'react-native'

export type TestProps = {
  onPress: () => void
  children: React.ReactNode
};

export function Test({ onPress, children }: TestProps) {
  return <TouchableHighlight onPress={onPress}>{children}</TouchableHighlight>;
}
