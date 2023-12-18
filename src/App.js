
import { AuthenticatedUserProvider } from './providers';
import { RootNavigator } from './navigation/RootNavigator';

export default function App() {

  return (

    <AuthenticatedUserProvider>
          <RootNavigator />
    </AuthenticatedUserProvider>
    
  );
}