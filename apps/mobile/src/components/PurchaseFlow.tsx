import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput } from 'react-native';
import { theme } from '../theme/tokens';
import { TicketTier, PaymentMethod } from '../types/ticket';

interface PurchaseFlowProps {
  tier: TicketTier;
  onComplete: (success: boolean) => void;
}

export const PurchaseFlow: React.FC<PurchaseFlowProps> = ({ tier, onComplete }) => {
  const [step, setStep] = useState(1);
  const [quantity, setQuantity] = useState('1');
  const [buyerName, setBuyerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <View style={styles.container}>
      {step === 1 && (
        <View>
          <Text style={styles.title}>Select Quantity for {tier.name}</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />
          <Button title="Next" onPress={nextStep} />
        </View>
      )}

      {step === 2 && (
        <View>
          <Text style={styles.title}>Buyer Information</Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={buyerName}
            onChangeText={setBuyerName}
          />
          <View style={styles.buttons}>
            <Button title="Back" onPress={prevStep} />
            <Button title="Next" onPress={nextStep} />
          </View>
        </View>
      )}

      {step === 3 && (
        <View>
          <Text style={styles.title}>Payment Method</Text>
          <View style={styles.paymentButtons}>
            <Button title="Cash" onPress={() => setPaymentMethod('cash')} />
            <Button title="Card" onPress={() => setPaymentMethod('card')} />
          </View>
          {paymentMethod && (
            <View style={styles.buttons}>
              <Button title="Back" onPress={prevStep} />
              <Button title="Next" onPress={nextStep} />
            </View>
          )}
        </View>
      )}

      {step === 4 && (
        <View>
          <Text style={styles.title}>Confirmation</Text>
          <Text>Tier: {tier.name}</Text>
          <Text>Quantity: {quantity}</Text>
          <Text>Buyer: {buyerName}</Text>
          <Text>Method: {paymentMethod}</Text>
          <Text>Total: ${tier.price * Number(quantity)}</Text>
          <View style={styles.buttons}>
             <Button title="Confirm Purchase" onPress={() => onComplete(true)} />
             <Button title="Cancel" onPress={() => onComplete(false)} color="red" />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    marginBottom: theme.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  paymentButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.md,
  }
});
