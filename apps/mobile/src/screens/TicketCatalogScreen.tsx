import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { TicketCard } from '../components/TicketCard';
import { Ticket } from '../types/ticket';
import { theme } from '../theme/tokens';

export const TicketCatalogScreen: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // placeholder data; replace with real API call
  useEffect(() => {
    const mock: Ticket[] = [
      {
        id: 't1',
        eventId: 'e1',
        tier: { id: 'tier1', name: 'General', description: '', price: 20, currency: 'USD', remaining: 50 },
        status: 'available',
      },
      {
        id: 't2',
        eventId: 'e1',
        tier: { id: 'tier2', name: 'VIP', description: '', price: 100, currency: 'USD', remaining: 5 },
        status: 'available',
      },
    ];
    setTickets(mock);
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TicketCard ticket={item} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  list: {
    paddingVertical: theme.spacing.sm,
  },
});
