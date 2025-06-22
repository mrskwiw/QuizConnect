import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';

const PendingVerification = () => {
  return (
    <div className="text-center">
      <MailCheck className="mx-auto h-12 w-12 text-green-500" />
      <h3 className="mt-4 text-xl font-bold">Verify your email</h3>
      <p className="mt-2 text-sm text-gray-600">
        We've sent a verification link to your email address. Please check your inbox and click the link to activate your account.
      </p>
      <div className="mt-6">
        <Link
          to="/login"
          className="text-blue-600 hover:text-blue-800"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default PendingVerification;