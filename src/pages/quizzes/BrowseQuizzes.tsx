import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, Play, Users, ThumbsUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { QuizCategory, QuizDifficulty } from '../../types';
import { useQuizzes } from '../../hooks/useQuizzes';

const BrowseQuizzes = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | ''>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty | ''>('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'rating'>('recent');

  const { quizzes, isLoading, error } = useQuizzes({
    search: searchQuery,
    category: selectedCategory || undefined,
    difficulty: selectedDifficulty || undefined,
    limit: 20
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set('q', searchQuery);
    } else {
      params.delete('q');
    }
    setSearchParams(params);
  };

  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedDifficulty('');
    setSortBy('recent');
    setSearchQuery('');
    setSearchParams({});
  };

  // Sort quizzes based on selected criteria
  const sortedQuizzes = [...quizzes].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.stats.timesPlayed - a.stats.timesPlayed;
      case 'rating':
        return b.stats.likes - a.stats.likes;
      case 'recent':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1>Browse Quizzes</h1>
        <form onSubmit={handleSearch} className="w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 pr-4 w-full md:w-64"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter size={20} className="mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as QuizCategory | '')}
                  className="input"
                >
                  <option value="">All Categories</option>
                  <option value="General Knowledge">General Knowledge</option>
                  <option value="Science">Science</option>
                  <option value="History">History</option>
                  <option value="Geography">Geography</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Sports">Sports</option>
                  <option value="Technology">Technology</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Language">Language</option>
                  <option value="Art">Art</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value as QuizDifficulty | '')}
                  className="input"
                >
                  <option value="">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular' | 'rating')}
                  className="input"
                >
                  <option value="recent">Most Recent</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Most Liked</option>
                </select>
              </div>

              <Button
                variant="secondary"
                fullWidth
                onClick={resetFilters}
              >
                Reset Filters
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quiz Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-red-600 mb-4">Failed to load quizzes</p>
                <Button variant="primary" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : sortedQuizzes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500 mb-4">No quizzes found matching your criteria.</p>
                <Button variant="primary" onClick={resetFilters}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sortedQuizzes.map((quiz) => (
                <Card key={quiz.id} variant="interactive" className="h-full">
                  <div className="h-32 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-t-lg flex items-center justify-center p-4 text-white">
                    <h3 className="text-lg font-bold text-center line-clamp-2">{quiz.title}</h3>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">
                        {quiz.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        quiz.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                        quiz.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {quiz.difficulty}
                      </span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-grow">
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{quiz.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span className="flex items-center">
                        <Users size={14} className="mr-1" />
                        {quiz.stats.timesPlayed} plays
                      </span>
                      <span className="flex items-center">
                        <ThumbsUp size={14} className="mr-1" />
                        {quiz.stats.likes} likes
                      </span>
                      {quiz.timeLimit && (
                        <span className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          {quiz.timeLimit}m
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {quiz.author.username[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-medium">{quiz.author.username}</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Link to={`/quiz/${quiz.id}`}>
                          <Button variant="secondary" size="sm">
                            View
                          </Button>
                        </Link>
                        <Link to={`/take-quiz/${quiz.id}`}>
                          <Button variant="primary" size="sm" icon={<Play size={14} />}>
                            Start
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseQuizzes;