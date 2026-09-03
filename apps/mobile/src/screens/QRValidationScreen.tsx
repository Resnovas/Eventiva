import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { QRCodeScanner } from '../components/QRCodeScanner';
import { theme } from '../theme/tokens';

export const QRValidationScreen: React.FC = () => {
  const handleScan = (code: string) => {
    // TODO: validate code against backend
    console.log('Scanned', code);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Validate Ticket</Text>
      <QRCodeScanner onScan={handleScan} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    textAlign: 'center',
    marginVertical: theme.spacing.lg,
    color: theme.colors.textPrimary,
  },
});
