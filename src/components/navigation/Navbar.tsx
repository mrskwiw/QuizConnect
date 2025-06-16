import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, User, Search, Menu, X, LogOut, Plus, BarChart2, Sparkles, Crown, CreditCard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      closeMenu();
    }
  };

  const getSubscriptionBadge = () => {
    if (!user?.subscription) return null;
    
    const { tier } = user.subscription;
    if (tier === 'free') return null;
    
    const badgeConfig = {
      pro: { icon: Sparkles, color: 'text-blue-600', bg: 'bg-blue-100' },
      premium: { icon: Crown, color: 'text-purple-600', bg: 'bg-purple-100' }
    };
    
    const config = badgeConfig[tier];
    if (!config) return null;
    
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color} ml-2`}>
        <Icon size={12} className="mr-1" />
        {tier.toUpperCase()}
      </span>
    );
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center" onClick={closeMenu}>
              <Brain className="h-8 w-8 text-blue-600" aria-hidden="true" />
              <span className="ml-2 text-xl font-bold text-gray-900">QuizConnect</span>
            </Link>
          </div>

          {/* Desktop search */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search quizzes..."
                  className="input pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                >
                  <Search size={20} />
                </button>
              </div>
            </form>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/browse" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium">
              Browse
            </Link>
            <Link to="/templates" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium flex items-center">
              <Sparkles size={16} className="mr-1" />
              Templates
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/create-quiz" className="btn-primary px-3 py-1.5 text-sm">
                  <Plus size={16} className="mr-1" /> Create Quiz
                </Link>
                <div className="relative group">
                  <button className="flex items-center text-gray-700 hover:text-blue-600 group-hover:text-blue-600">
                    <span className="mr-1 flex items-center">
                      {user?.username}
                      {getSubscriptionBadge()}
                    </span>
                    <User size={20} />
                  </button>
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <Link to="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      <BarChart2 size={16} className="inline mr-2" /> Dashboard
                    </Link>
                    <Link to={`/profile/${user?.username}`} className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      <User size={16} className="inline mr-2" /> My Profile
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <Link to="/pricing" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      <CreditCard size={16} className="inline mr-2" /> 
                      {user?.subscription?.tier === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut size={16} className="inline mr-2" /> Sign out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium">
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary px-3 py-1.5 text-sm">
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 pt-2 pb-4 px-4 space-y-3">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search quizzes..."
                className="input pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              >
                <Search size={20} />
              </button>
            </div>
          </form>

          <Link
            to="/browse"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            onClick={closeMenu}
          >
            Browse
          </Link>
          
          <Link
            to="/templates"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 flex items-center"
            onClick={closeMenu}
          >
            <Sparkles size={16} className="mr-2" />
            Templates
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link
                to="/create-quiz"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                onClick={closeMenu}
              >
                Create Quiz
              </Link>
              <Link
                to="/dashboard"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                onClick={closeMenu}
              >
                Dashboard
              </Link>
              <Link
                to={`/profile/${user?.username}`}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 flex items-center"
                onClick={closeMenu}
              >
                My Profile
                {getSubscriptionBadge()}
              </Link>
              <Link
                to="/pricing"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                onClick={closeMenu}
              >
                <CreditCard size={16} className="inline mr-2" />
                {user?.subscription?.tier === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
              </Link>
              <button
                onClick={() => {
                  logout();
                  closeMenu();
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              >
                Sign out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col space-y-2">
              <Link to="/login" className="btn-secondary" onClick={closeMenu}>
                Sign in
              </Link>
              <Link to="/register" className="btn-primary" onClick={closeMenu}>
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};