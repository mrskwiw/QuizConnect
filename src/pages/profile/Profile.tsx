import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  User, 
  Calendar, 
  Trophy, 
  Award, 
  Star, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Target,
  Crown,
  Flame,
  Heart,
  Zap,
  Grid,
  Edit
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { userService, badgeService } from '../../lib/database';
import { User as UserType, UserBadge, UserAchievement, BadgeRarity } from '../../types';

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<UserType | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'achievements'>('overview');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!username) return;

      try {
        setIsLoading(true);
        
        // Find user by username
        const users = await userService.searchUsers(username);
        const foundUser = users.find(u => u.username === username);
        
        if (foundUser) {
          setUser(foundUser);
          
          // Fetch badges and achievements
          const [userBadges, userAchievements] = await Promise.all([
            badgeService.getUserBadges(foundUser.id),
            badgeService.getUserAchievements(foundUser.id)
          ]);
          
          setBadges(userBadges);
          setAchievements(userAchievements);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">User not found</h2>
        <p className="text-gray-600 mb-8">The user you're looking for doesn't exist.</p>
        <Link to="/browse">
          <Button variant="primary">Browse Quizzes</Button>
        </Link>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === user.id;

  const getBadgeIcon = (iconName: string) => {
    const iconMap: Record<string, React.ElementType> = {
      BookOpen,
      Crown,
      Trophy,
      Play: Target,
      Target,
      Zap,
      Star,
      Users,
      Heart,
      Award,
      Calendar,
      Flame
    };
    const IconComponent = iconMap[iconName] || Award;
    return <IconComponent size={20} />;
  };

  const getAchievementIcon = (iconName: string) => {
    const iconMap: Record<string, React.ElementType> = {
      UserCheck: User,
      PlusCircle: BookOpen,
      CheckCircle: Target,
      Star,
      UserPlus: Users,
      ThumbsUp: Heart,
      MessageCircle: Users,
      Award,
      Calendar,
      Grid
    };
    const IconComponent = iconMap[iconName] || Award;
    return <IconComponent size={16} />;
  };

  const getRarityColor = (rarity: BadgeRarity): string => {
    const colors = {
      common: 'bg-gray-100 text-gray-800 border-gray-200',
      uncommon: 'bg-green-100 text-green-800 border-green-200',
      rare: 'bg-blue-100 text-blue-800 border-blue-200',
      epic: 'bg-purple-100 text-purple-800 border-purple-200',
      legendary: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[rarity] || colors.common;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {user.username[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{user.username}</h1>
                {user.bio && (
                  <p className="text-gray-600 mb-3 max-w-md">{user.bio}</p>
                )}
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <span className="flex items-center">
                    <Calendar size={16} className="mr-1" />
                    Joined {new Date(user.createdAt).toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                  <span className="flex items-center">
                    <Users size={16} className="mr-1" />
                    {user.stats.followers} followers
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-2">
              {isOwnProfile ? (
                <Link to="/profile/edit">
                  <Button variant="secondary" icon={<Edit size={18} />}>
                    Edit Profile
                  </Button>
                </Link>
              ) : (
                <Button variant="primary">
                  Follow
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Points and Rankings */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="h-6 w-6 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-500">This Week</span>
            </div>
            <p className="text-3xl font-bold text-blue-600 mb-1">{user.stats.weeklyPoints}</p>
            <p className="text-sm text-gray-500">Rank #{user.stats.weeklyRank || 'Unranked'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-6 w-6 text-yellow-600 mr-2" />
              <span className="text-sm font-medium text-gray-500">All Time</span>
            </div>
            <p className="text-3xl font-bold text-yellow-600 mb-1">{user.stats.lifetimePoints}</p>
            <p className="text-sm text-gray-500">Rank #{user.stats.lifetimeRank || 'Unranked'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Award className="h-6 w-6 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-gray-500">Badges</span>
            </div>
            <p className="text-3xl font-bold text-purple-600 mb-1">{badges.length}</p>
            <p className="text-sm text-gray-500">Earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Star className="h-6 w-6 text-green-600 mr-2" />
              <span className="text-sm font-medium text-gray-500">Achievements</span>
            </div>
            <p className="text-3xl font-bold text-green-600 mb-1">{achievements.length}</p>
            <p className="text-sm text-gray-500">Unlocked</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'badges', label: 'Badges', icon: Award },
            { id: 'achievements', label: 'Achievements', icon: Star }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as 'overview' | 'badges' | 'achievements')}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon size={16} className="mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{user.stats.quizzesCreated}</div>
                  <div className="text-sm text-gray-600">Quizzes Created</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{user.stats.quizzesTaken}</div>
                  <div className="text-sm text-gray-600">Quizzes Taken</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{user.stats.averageScore}%</div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{user.stats.following}</div>
                  <div className="text-sm text-gray-600">Following</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Badges</CardTitle>
            </CardHeader>
            <CardContent>
              {badges.length > 0 ? (
                <div className="space-y-3">
                  {badges.slice(0, 4).map((userBadge) => (
                    <div key={userBadge.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: userBadge.badge.color }}
                      >
                        {getBadgeIcon(userBadge.badge.icon)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{userBadge.badge.name}</p>
                        <p className="text-sm text-gray-500">{userBadge.badge.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getRarityColor(userBadge.badge.rarity)}`}>
                        {userBadge.badge.rarity}
                      </span>
                    </div>
                  ))}
                  {badges.length > 4 && (
                    <button
                      onClick={() => setActiveTab('badges')}
                      className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium py-2"
                    >
                      View all {badges.length} badges
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No badges earned yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'badges' && (
        <Card>
          <CardHeader>
            <CardTitle>Badges Collection</CardTitle>
          </CardHeader>
          <CardContent>
            {badges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((userBadge) => (
                  <div key={userBadge.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white flex-shrink-0"
                        style={{ backgroundColor: userBadge.badge.color }}
                      >
                        {getBadgeIcon(userBadge.badge.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold truncate">{userBadge.badge.name}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getRarityColor(userBadge.badge.rarity)}`}>
                            {userBadge.badge.rarity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{userBadge.badge.description}</p>
                        <p className="text-xs text-gray-500">
                          Earned {new Date(userBadge.earnedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No badges earned yet</p>
                <p className="text-sm text-gray-400">Complete quizzes and engage with the community to earn badges!</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'achievements' && (
        <Card>
          <CardHeader>
            <CardTitle>Achievements Unlocked</CardTitle>
          </CardHeader>
          <CardContent>
            {achievements.length > 0 ? (
              <div className="space-y-4">
                {achievements.map((userAchievement) => (
                  <div key={userAchievement.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white">
                      {getAchievementIcon(userAchievement.achievement.icon)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold">{userAchievement.achievement.name}</h3>
                        <div className="flex items-center space-x-2">
                          {userAchievement.achievement.pointsReward > 0 && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                              +{userAchievement.achievement.pointsReward} pts
                            </span>
                          )}
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                            {userAchievement.achievement.category}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{userAchievement.achievement.description}</p>
                      <p className="text-xs text-gray-500">
                        Unlocked {new Date(userAchievement.unlockedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No achievements unlocked yet</p>
                <p className="text-sm text-gray-400">Start creating and taking quizzes to unlock achievements!</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}