import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Vendor } from '../types/vendor';
import { vendorsApi } from '../services/vendorsApi';
import { VendorDetail } from '../components/VendorDetail';
import { theme } from '../theme/tokens';

interface VendorDetailScreenProps {
  vendorId: string;
  onBack?: () => void;
}

export const VendorDetailScreen: React.FC<VendorDetailScreenProps> = ({
  vendorId,
  onBack,
}) => {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vendorsApi.getVendorById(vendorId).then((data) => {
      setVendor(data);
      setLoading(false);
    });
  }, [vendorId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!vendor) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Vendor not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <VendorDetail vendor={vendor} onBack={onBack} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.typography.fontSize.md,
  },
});