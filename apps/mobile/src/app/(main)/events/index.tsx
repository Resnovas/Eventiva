import { EventListScreen } from '../../../screens/EventListScreen';
import { useRouter } from 'expo-router';

export default function EventsIndexRoute() {
  const router = useRouter();

  return (
    <EventListScreen
      onSelectEvent={(event) => {
        router.push(`/(main)/events/${event.id}`);
      }}
      onCreateEventPress={() => {
        router.push('/(main)/events/new');
      }}
    />
  );
}