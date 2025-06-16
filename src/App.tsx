import { BrowserRouter as Router } from 'react-router-dom';
import { AppRoutes } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;