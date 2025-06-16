import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Book, CheckCircle, BarChart2, Award, ThumbsUp, Users, Play, Edit, Trophy, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { useQuizzes } from '../hooks/useQuizzes';
import { leaderboardService } from '../lib/database';
import { LeaderboardEntry } from '../types';

const Dashboard = () => {
  const { user } = useAuth();
  const { quizzes: myQuizzes, isLoading: quizzesLoading } = useQuizzes({
    authorId: user?.id,
    limit: 6
  });
  
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lifetimeLeaderboard, setLifetimeLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboards = async () => {
      try {
        setLeaderboardLoading(true);
        const [weekly, lifetime] = await Promise.all([
          leaderboardService.getWeeklyLeaderboard(5),
          leaderboardService.getLifetimeLeaderboard(5)
        ]);
        setWeeklyLeaderboard(weekly);
        setLifetimeLeaderboard(lifetime);
      } catch (error) {
        console.error('Error fetching leaderboards:', error);
      } finally {
        setLeaderboardLoading(false);
      }
    };

    fetchLeaderboards();
  }, []);

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1>Welcome back, {user.username}!</h1>
          <p className="text-gray-600 mt-2">Here's your quiz activity overview</p>
        </div>
        <Link to="/create-quiz">
          <Button variant="primary" icon={<PlusCircle size={18} />}>
            Create New Quiz
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Book className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Quizzes Created</p>
                <p className="text-2xl font-bold">{user.stats.quizzesCreated}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Quizzes Taken</p>
                <p className="text-2xl font-bold">{user.stats.quizzesTaken}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Average Score</p>
                <p className="text-2xl font-bold">{user.stats.averageScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-full mr-4">
                <BarChart2 className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Points</p>
                <p className="text-2xl font-bold">{user.stats.totalPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Points & Rankings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-semibold">This Week</h3>
              </div>
              <span className="text-sm text-gray-500">#{user.stats.weeklyRank || 'Unranked'}</span>
            </div>
            <p className="text-3xl font-bold text-blue-600">{user.stats.weeklyPoints}</p>
            <p className="text-sm text-gray-500">Weekly Points</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Trophy className="h-5 w-5 text-yellow-600 mr-2" />
                <h3 className="font-semibold">All Time</h3>
              </div>
              <span className="text-sm text-gray-500">#{user.stats.lifetimeRank || 'Unranked'}</span>
            </div>
            <p className="text-3xl font-bold text-yellow-600">{user.stats.lifetimePoints}</p>
            <p className="text-sm text-gray-500">Lifetime Points</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="font-semibold">Progress</h3>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Weekly Goal</span>
                <span>{Math.min(100, Math.round((user.stats.weeklyPoints / 100) * 100))}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (user.stats.weeklyPoints / 100) * 100)}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Weekly Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboardLoading ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner />
              </div>
            ) : weeklyLeaderboard.length > 0 ? (
              <div className="space-y-3">
                {weeklyLeaderboard.map((entry, index) => (
                  <div key={entry.userId} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {entry.rank}
                      </span>
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {entry.username[0].toUpperCase()}
                      </div>
                      <span className="font-medium">{entry.username}</span>
                    </div>
                    <span className="font-bold text-blue-600">{entry.points}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No weekly rankings yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              Lifetime Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboardLoading ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner />
              </div>
            ) : lifetimeLeaderboard.length > 0 ? (
              <div className="space-y-3">
                {lifetimeLeaderboard.map((entry, index) => (
                  <div key={entry.userId} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {entry.rank}
                      </span>
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {entry.username[0].toUpperCase()}
                      </div>
                      <span className="font-medium">{entry.username}</span>
                    </div>
                    <span className="font-bold text-yellow-600">{entry.points}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No lifetime rankings yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* My Quizzes */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">My Quizzes</h2>
          <Link to="/my-quizzes" className="text-blue-600 hover:text-blue-800 text-sm">
            View all
          </Link>
        </div>

        {quizzesLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : myQuizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myQuizzes.map((quiz) => (
              <Card key={quiz.id} variant="hover" className="h-full">
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
                  
                  <div className="flex justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <Users size={14} className="mr-1" />
                      {quiz.stats.timesPlayed} plays
                    </span>
                    <span className="flex items-center">
                      <ThumbsUp size={14} className="mr-1" />
                      {quiz.stats.likes} likes
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <Link to={`/quiz/${quiz.id}`} className="flex-1">
                      <Button variant="secondary" size="sm" fullWidth>
                        View
                      </Button>
                    </Link>
                    <Link to={`/quiz/${quiz.id}/edit`} className="flex-1">
                      <Button variant="primary" size="sm" fullWidth icon={<Edit size={14} />}>
                        Edit
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">You haven't created any quizzes yet.</p>
              <Link to="/create-quiz">
                <Button variant="primary" icon={<PlusCircle size={18} />}>
                  Create Your First Quiz
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/create-quiz">
            <Card variant="interactive" className="h-full">
              <CardContent className="p-6 text-center">
                <PlusCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Create Quiz</h3>
                <p className="text-sm text-gray-600">Design a new quiz for others to enjoy</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/browse">
            <Card variant="interactive" className="h-full">
              <CardContent className="p-6 text-center">
                <Play className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Take Quiz</h3>
                <p className="text-sm text-gray-600">Explore and take quizzes from the community</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to={`/profile/${user.username}`}>
            <Card variant="interactive" className="h-full">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">View Profile</h3>
                <p className="text-sm text-gray-600">Check your profile and achievements</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;