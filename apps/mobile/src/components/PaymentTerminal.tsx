import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { theme } from '../theme/tokens';
import { PaymentMethod } from '../types/ticket';

interface PaymentTerminalProps {
  total: number;
  currency: string;
  onComplete: (method: PaymentMethod, amount: number) => void;
  onCancel: () => void;
}

export const PaymentTerminal: React.FC<PaymentTerminalProps> = ({ total, currency, onComplete, onCancel }) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [cashReceived, setCashReceived] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCashPayment = () => {
    setSelectedMethod('cash');
  };

  const handleCardPayment = () => {
    setSelectedMethod('card');
  };

  const processPayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    onComplete(selectedMethod!, selectedMethod === 'cash' ? Number(cashReceived) : total);
    setIsProcessing(false);
  };

  const cashAmount = Number(cashReceived) || 0;
  const change = cashAmount - total;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment Terminal</Text>
        <Text style={styles.total}>
          Total: {currency} {total.toFixed(2)}
        </Text>
      </View>

      <View style={styles.methods}>
        <TouchableOpacity
          style={[styles.methodButton, selectedMethod === 'cash' && styles.selected]}
          onPress={handleCashPayment}
        >
          <Text style={styles.methodIcon}>💵</Text>
          <Text style={styles.methodText}>Cash</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.methodButton, selectedMethod === 'card' && styles.selected]}
          onPress={handleCardPayment}
        >
          <Text style={styles.methodIcon}>💳</Text>
          <Text style={styles.methodText}>Card</Text>
        </TouchableOpacity>
      </View>

      {selectedMethod === 'cash' && (
        <View style={styles.cashSection}>
          <Text style={styles.label}>Cash Received:</Text>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            value={cashReceived}
            onChangeText={setCashReceived}
            placeholder="0.00"
          />
          {cashAmount >= total && (
            <Text style={styles.change}>Change: {currency} {change.toFixed(2)}</Text>
          )}
          {cashAmount < total && cashAmount > 0 && (
            <Text style={styles.insufficient}>Insufficient amount</Text>
          )}
        </View>
      )}

      {selectedMethod === 'card' && (
        <View style={styles.cardSection}>
          <Text style={styles.cardPrompt}>Insert or tap card to pay</Text>
          <View style={styles.cardAnimation}>
            <Text style={styles.cardIcon}>💳</Text>
          </View>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!selectedMethod || (selectedMethod === 'cash' && cashAmount < total)) && styles.disabled
          ]}
          onPress={processPayment}
          disabled={!selectedMethod || (selectedMethod === 'cash' && cashAmount < total) || isProcessing}
        >
          <Text style={styles.confirmText}>
            {isProcessing ? 'Processing...' : 'Confirm Payment'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    margin: theme.spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  total: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginTop: theme.spacing.sm,
  },
  methods: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.lg,
  },
  methodButton: {
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    minWidth: 100,
  },
  selected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  methodIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.xs,
  },
  methodText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  cashSection: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.xl,
    textAlign: 'center',
  },
  change: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.success,
    fontWeight: theme.typography.fontWeight.semibold,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  insufficient: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.danger,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  cardSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  cardPrompt: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  cardAnimation: {
    padding: theme.spacing.xl,
  },
  cardIcon: {
    fontSize: 48,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  confirmButton: {
    flex: 2,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.success,
  },
  confirmText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textLight,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  disabled: {
    backgroundColor: theme.colors.border,
    opacity: 0.5,
  },
});