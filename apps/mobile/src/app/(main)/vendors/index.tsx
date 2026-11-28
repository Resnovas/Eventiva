import { VendorListScreen } from '../../../screens/VendorListScreen';
import { useRouter } from 'expo-router';

export default function VendorsIndexRoute() {
  const router = useRouter();

  return (
    <VendorListScreen
      onSelectVendor={(vendor) => {
        router.push(`/(main)/vendors/${vendor.id}`);
      }}
    />
  );
}