import React, { useState, useEffect } from 'react';
import { leaderboardService } from '../lib/database';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { Crown } from 'lucide-react';
import { LeaderboardEntry } from '../types';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [timeframe, setTimeframe] = useState<'weekly' | 'lifetime'>('weekly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const data = await leaderboardService.getLeaderboard(timeframe);
        setLeaderboardData(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
      setLoading(false);
    };

    fetchLeaderboard();
  }, [timeframe]);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-yellow-700';
    return 'text-gray-500';
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Leaderboard</h1>
      <div className="flex space-x-2 mb-4">
        <Button
          variant={timeframe === 'weekly' ? 'primary' : 'secondary'}
          onClick={() => setTimeframe('weekly')}
        >
          Weekly
        </Button>
        <Button
          variant={timeframe === 'lifetime' ? 'primary' : 'secondary'}
          onClick={() => setTimeframe('lifetime')}
        >
          All-Time
        </Button>
      </div>
      <Card>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Rank</th>
                  <th className="text-left p-4">User</th>
                  <th className="text-right p-4">Points</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((entry, index) => (
                  <tr key={entry.user_id} className="border-b">
                    <td className={`p-4 font-bold ${getRankColor(index + 1)}`}>
                      {index < 3 ? <Crown className="inline-block mr-2" /> : null}
                      {index + 1}
                    </td>
                    <td className="p-4">
                      <Link to={`/profile/${entry.user.username}`} className="flex items-center space-x-3">
                        <img
                          src={entry.user.avatar_url || `https://api.dicebear.com/8.x/identicon/svg?seed=${entry.user.username}`}
                          alt={entry.user.username}
                          className="w-10 h-10 rounded-full"
                        />
                        <span className="font-medium">{entry.user.username}</span>
                      </Link>
                    </td>
                    <td className="text-right p-4 font-bold">
                      {timeframe === 'weekly' ? entry.weekly_points : entry.lifetime_points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;