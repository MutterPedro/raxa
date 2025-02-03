import React from 'react';
import User from '../../core/entities/User';

interface AvatarProps {
  user: User;
}

const Avatar: React.FC<AvatarProps> = ({ user }) => {
  const getColorFromName = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${hash % 360}, 70%, 80%)`;
    return color;
  };

  const firstLetter = user.name.charAt(0).toUpperCase();
  const backgroundColor = getColorFromName(user.name);

  return (
    <div
      className="size-12 flex-none rounded-full flex items-center justify-center"
      style={{ backgroundColor, width: '48px', height: '48px' }}
    >
      <span className="text-white text-lg">{firstLetter}</span>
    </div>
  );
};

export default Avatar;
