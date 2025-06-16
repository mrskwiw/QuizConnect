import { Link } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { Button } from '../components/ui/Button';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <Brain className="h-16 w-16 text-blue-600 mb-4" />
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Page not found</h2>
      <p className="text-gray-600 max-w-md mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex space-x-4">
        <Link to="/">
          <Button variant="primary">Go to Home</Button>
        </Link>
        <Link to="/browse">
          <Button variant="secondary">Browse Quizzes</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;