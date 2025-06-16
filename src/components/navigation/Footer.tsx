import { Link } from 'react-router-dom';
import { Brain, Twitter, Facebook, Instagram, Github } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center">
              <Brain className="h-6 w-6 text-blue-600" aria-hidden="true" />
              <span className="ml-2 text-xl font-bold text-gray-900">QuizConnect</span>
            </Link>
            <p className="mt-2 text-gray-600 text-sm">
              Test your knowledge and challenge others with our interactive quiz platform.
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-blue-600">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-600">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-600">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-600">
                <Github size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Explore</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/browse" className="text-gray-600 hover:text-blue-600 text-sm">
                  Browse Quizzes
                </Link>
              </li>
              <li>
                <Link to="/browse?category=Popular" className="text-gray-600 hover:text-blue-600 text-sm">
                  Popular Quizzes
                </Link>
              </li>
              <li>
                <Link to="/browse?category=Recent" className="text-gray-600 hover:text-blue-600 text-sm">
                  Recent Quizzes
                </Link>
              </li>
              <li>
                <Link to="/browse?category=Featured" className="text-gray-600 hover:text-blue-600 text-sm">
                  Featured Quizzes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Resources</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/help" className="text-gray-600 hover:text-blue-600 text-sm">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/guidelines" className="text-gray-600 hover:text-blue-600 text-sm">
                  Community Guidelines
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-blue-600 text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-blue-600 text-sm">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-blue-600 text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-blue-600 text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-gray-600 hover:text-blue-600 text-sm">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-600 text-center">
            © {currentYear} QuizConnect. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};