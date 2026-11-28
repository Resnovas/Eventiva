import { ContactListScreen } from '../../../screens/ContactListScreen';
import { useRouter } from 'expo-router';

export default function ContactsIndexRoute() {
  const router = useRouter();

  return (
    <ContactListScreen
      onSelectContact={(contact) => {
        router.push(`/(main)/contacts/${contact.id}`);
      }}
    />
  );
}