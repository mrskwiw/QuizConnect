import React from 'react';
import { User } from '../../types';
import { FollowButton } from './FollowButton';

interface ProfileHeaderProps {
  user: User;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  return (
    <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 p-4 bg-white rounded-lg shadow">
      <img
        src={user.avatarUrl || `https://api.dicebear.com/8.x/identicon/svg?seed=${user.username}`}
        alt={user.username}
        className="w-24 h-24 rounded-full"
      />
      <div className="flex-grow">
        <h1 className="text-2xl font-bold">{user.username}</h1>
        <p className="text-gray-600">{user.bio}</p>
        <div className="flex space-x-4 mt-2">
          <div>
            <span className="font-bold">{user.stats.quizzesCreated}</span> Quizzes
          </div>
          <div>
            <span className="font-bold">{user.stats.followers}</span> Followers
          </div>
          <div>
            <span className="font-bold">{user.stats.following}</span> Following
          </div>
        </div>
      </div>
      <div>
        <FollowButton userId={user.id} />
      </div>
    </div>
  );
};