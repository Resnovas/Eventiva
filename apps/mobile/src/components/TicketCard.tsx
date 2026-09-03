import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ticket } from '../types/ticket';
import { theme } from '../theme/tokens';

interface TicketCardProps {
  ticket: Ticket;
  onPress?: (ticket: Ticket) => void;
}

export const TicketCard: React.FC<TicketCardProps> = React.memo(({ ticket, onPress }) => {
  const statusColor = (() => {
    switch (ticket.status) {
      case 'available': return theme.colors.success;
      case 'sold': return theme.colors.warning;
      case 'used': return theme.colors.primary;
      case 'cancelled': return theme.colors.danger;
      default: return theme.colors.cardBackground;
    }
  })();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress && onPress(ticket)}
      activeOpacity={0.7}
      accessibilityRole="button"
    >
      <View style={styles.header}>
        <Text style={styles.title}>{ticket.tier.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{ticket.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.price}>${ticket.tier.price} {ticket.tier.currency}</Text>
      <Text style={styles.remaining}>Remaining: {ticket.tier.remaining}</Text>
    </TouchableOpacity>
  );
});

TicketCard.displayName = 'TicketCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    color: theme.colors.textLight,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  price: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  remaining: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});
