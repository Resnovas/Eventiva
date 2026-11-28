import { VenueListScreen } from '../../../screens/VenueListScreen';
import { useRouter } from 'expo-router';

export default function VenuesIndexRoute() {
  const router = useRouter();

  return (
    <VenueListScreen
      onSelectVenue={(venue) => {
        router.push(`/(main)/venues/${venue.id}`);
      }}
    />
  );
}