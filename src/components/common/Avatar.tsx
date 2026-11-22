import React, { useState } from 'react';
import User from '../../core/entities/User';

interface AvatarProps {
  user: User;
  size?: string;
  highlight?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ user, size = '48px', highlight = false }) => {
  // Provider photo URLs need the network; when one fails (offline) fall back to initials.
  const [pictureFailed, setPictureFailed] = useState(false);

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
  const showPicture = !!user.photo_url && !pictureFailed;

  return (
    <div
      className={`relative rounded-full flex-none flex items-center justify-center overflow-hidden ava-group ${
        highlight ? 'ring-2 ring-brand-500' : ''
      }`}
      style={{ backgroundColor, width: size, height: size }}
    >
      {showPicture ? (
        <img
          src={user.photo_url}
          alt=""
          data-testid="avatar-picture"
          className="w-full h-full object-cover"
          onError={() => setPictureFailed(true)}
        />
      ) : (
        <span className="text-brand-950 text-lg">{firstLetter}</span>
      )}
      <div className="absolute bottom-full mb-2 hidden ava-group-hover:block bg-black text-white text-xs rounded py-1 px-2">
        {user.name}
      </div>
    </div>
  );
};

export default Avatar;
