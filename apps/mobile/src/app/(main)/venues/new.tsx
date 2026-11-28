import { StyleSheet, SafeAreaView, View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../theme/tokens';

export default function VenueNewRoute() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <MaterialCommunityIcons name="map-marker-plus" size={64} color={theme.colors.textMuted} />
        <Text style={styles.title}>Add Venue</Text>
        <Text style={styles.comingSoon}>Venue creation form coming soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg },
  title: { fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.textPrimary, marginTop: theme.spacing.md },
  comingSoon: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textMuted, marginTop: theme.spacing.lg },
});