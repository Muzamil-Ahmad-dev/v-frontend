  import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '../shared/utils/AuthContext';
import AppRoutes from './routes';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
