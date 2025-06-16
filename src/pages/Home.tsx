import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Search, Award, Users, BarChart2, Sparkles, Zap, Clock } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { Quiz, QuizCategory } from '../types';
import { getMockQuizzes } from '../utils/mockData';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [featuredQuizzes, setFeaturedQuizzes] = useState<Quiz[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<QuizCategory[]>([]);

  useEffect(() => {
    // Get mock quizzes and categories for the demo
    const quizzes = getMockQuizzes();
    setFeaturedQuizzes(quizzes.slice(0, 4));
    
    const uniqueCategories = Array.from(
      new Set(quizzes.map((quiz) => quiz.category))
    ) as QuizCategory[];
    
    setCategories(uniqueCategories.slice(0, 6));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/browse?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative -mt-8 py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
              Challenge Your Mind with <span className="text-yellow-300">Interactive Quizzes</span>
            </h1>
            <p className="text-xl mb-8 text-blue-100 max-w-xl">
              Create, share, and take quizzes on any topic. Connect with others and test your knowledge in a fun and engaging way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={isAuthenticated ? "/create-quiz" : "/register"} className="btn-accent text-lg">
                {isAuthenticated ? "Create a Quiz" : "Get Started"} <ArrowRight className="ml-2" size={20} />
              </Link>
              <Link to="/browse" className="btn bg-white text-blue-700 hover:bg-blue-50 text-lg">
                Browse Quizzes
              </Link>
              <Link to="/templates" className="btn bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-700 text-lg">
                <Sparkles className="mr-2" size={20} />
                Use Templates
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute -top-6 -left-6 w-64 h-64 bg-blue-500 rounded-full opacity-30 animate-pulse"></div>
              <div className="absolute -bottom-10 -right-10 w-80 h-80 bg-indigo-500 rounded-full opacity-20 animate-pulse delay-1000"></div>
              <div className="relative bg-white text-gray-800 rounded-lg shadow-xl p-8 z-10 transform transition-transform hover:scale-105">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">Sample Quiz</h3>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">Technology</span>
                </div>
                <div className="space-y-4 mb-6">
                  <div className="p-3 border border-gray-200 rounded-md hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer">
                    <p className="font-medium">What does HTML stand for?</p>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-md hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer">
                    <p className="font-medium">Which language is used for styling web pages?</p>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-md hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer">
                    <p className="font-medium">What is the latest version of JavaScript?</p>
                  </div>
                </div>
                <button className="btn-primary w-full">Start Quiz</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 bg-white rounded-lg shadow-md -mt-8 max-w-4xl mx-auto">
        <div className="container mx-auto px-8">
          <h2 className="text-2xl font-bold text-center mb-6">Find the Perfect Quiz</h2>
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by topic, category, or keyword..."
                className="input py-3 pl-12 pr-4 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary py-1">
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Quick Start Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link to="/create-quiz" className="group">
              <Card variant="interactive" className="h-full text-center p-8">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                  <Brain className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Create from Scratch</h3>
                <p className="text-gray-600 mb-4">
                  Build your own quiz with complete control over questions, format, and settings.
                </p>
                <Button variant="primary" fullWidth>
                  Start Creating
                </Button>
              </Card>
            </Link>

            <Link to="/templates" className="group">
              <Card variant="interactive" className="h-full text-center p-8">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                  <Sparkles className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Use a Template</h3>
                <p className="text-gray-600 mb-4">
                  Jump-start with professionally designed templates for various topics and purposes.
                </p>
                <Button variant="primary" fullWidth>
                  Browse Templates
                </Button>
              </Card>
            </Link>

            <Link to="/browse" className="group">
              <Card variant="interactive" className="h-full text-center p-8">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Take a Quiz</h3>
                <p className="text-gray-600 mb-4">
                  Explore thousands of quizzes created by the community and test your knowledge.
                </p>
                <Button variant="primary" fullWidth>
                  Start Exploring
                </Button>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Popular Categories</h2>
            <Link to="/browse" className="text-blue-600 hover:text-blue-800 flex items-center">
              View all <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/browse?category=${encodeURIComponent(category)}`}
                className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center hover:shadow-md hover:border-blue-200 transition-all duration-200"
              >
                <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  {/* For demo purposes, using Brain icon for all categories */}
                  <Brain size={24} />
                </div>
                <h3 className="font-semibold text-gray-800">{category}</h3>
                <p className="text-sm text-gray-500 mt-1">12+ Quizzes</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Quizzes */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Quizzes</h2>
            <Link to="/browse?featured=true" className="text-blue-600 hover:text-blue-800 flex items-center">
              View all <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredQuizzes.map((quiz) => (
              <Link to={`/quiz/${quiz.id}`} key={quiz.id} className="quiz-card">
                <div className="h-40 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-t-lg flex items-center justify-center p-4 text-white">
                  <h3 className="text-xl font-bold text-center">{quiz.title}</h3>
                </div>
                <div className="p-4 flex-grow">
                  <div className="flex justify-between items-center mb-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">
                      {quiz.category}
                    </span>
                    <span className="text-sm text-gray-500">{quiz.difficulty}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{quiz.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="flex items-center mr-3">
                      <Users size={14} className="mr-1" />
                      {quiz.stats.timesPlayed}
                    </span>
                    <span className="flex items-center">
                      <Award size={14} className="mr-1" />
                      {quiz.stats.likes}
                    </span>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full mr-2"></div>
                    <span className="text-sm font-medium">{quiz.author.username}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose QuizConnect?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Create Custom Quizzes</h3>
              <p className="text-gray-600">
                Design engaging quizzes with multiple question types. Set time limits, add images, and customize settings to match your needs.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Professional Templates</h3>
              <p className="text-gray-600">
                Save time with our library of professionally designed templates for education, business, entertainment, and more.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Connect with Others</h3>
              <p className="text-gray-600">
                Follow friends, share quizzes, and engage with a community of knowledge enthusiasts from around the world.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Track Your Progress</h3>
              <p className="text-gray-600">
                Monitor your performance, earn points, and see how you stack up against others with detailed statistics.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Advanced Question Types</h3>
              <p className="text-gray-600">
                Create engaging content with multiple choice, matching, fill-in-the-blank, short answer, and essay questions.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Quick Setup</h3>
              <p className="text-gray-600">
                Get started in minutes with our intuitive quiz builder or choose from ready-made templates for instant results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Challenge Yourself?</h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Join thousands of users who are creating, sharing, and taking quizzes every day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={isAuthenticated ? "/create-quiz" : "/register"} className="btn-accent text-lg">
              {isAuthenticated ? "Create Your First Quiz" : "Join for Free"} <ArrowRight className="ml-2" size={20} />
            </Link>
            <Link to="/templates" className="btn bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-700 text-lg">
              <Sparkles className="mr-2" size={20} />
              Explore Templates
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;