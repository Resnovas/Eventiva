import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { theme } from '../theme/tokens';
import { Ticket } from '../types/ticket';

export const SalesHistory: React.FC = () => {
  const [sales, setSales] = useState<Ticket[]>([]);

  // mock data; replace with real API call
  useEffect(() => {
    const mock: Ticket[] = [
      {
        id: 't1',
        eventId: 'e1',
        tier: { id: 'tier1', name: 'General', description: '', price: 20, currency: 'USD', remaining: 0 },
        status: 'sold',
        holderName: 'Alice',
        purchasedAt: '2026-08-30T12:00:00Z',
      },
      {
        id: 't2',
        eventId: 'e1',
        tier: { id: 'tier2', name: 'VIP', description: '', price: 100, currency: 'USD', remaining: 0 },
        status: 'sold',
        holderName: 'Bob',
        purchasedAt: '2026-08-31T15:30:00Z',
      },
    ];
    setSales(mock);
  }, []);

  const renderItem = ({ item }: { item: Ticket }) => (
    <View style={styles.item}>
      <Text style={styles.title}>Ticket {item.id}</Text>
      <Text style={styles.detail}>Tier: {item.tier.name}</Text>
      <Text style={styles.detail}>Buyer: {item.holderName ?? 'N/A'}</Text>
      <Text style={styles.detail}>Date: {new Date(item.purchasedAt!).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={sales}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<Text style={styles.empty}>No sales yet.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  item: {
    backgroundColor: theme.colors.cardBackground,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  detail: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  separator: {
    height: theme.spacing.sm,
  },
  empty: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.lg,
    fontSize: theme.typography.fontSize.md,
  },
});
