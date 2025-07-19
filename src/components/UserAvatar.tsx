interface UserAvatarProps {
  user: {
    name: string;
    avatar_url?: string;
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function UserAvatar({ user, size = 'md', className = '' }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const baseClasses = `${sizeClasses[size]} rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-400 to-purple-400 text-white font-bold`;

  if (user.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.name}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`${baseClasses} ${className}`}>
      <span>{user.name.charAt(0).toUpperCase()}</span>
    </div>
  );
}

export default UserAvatar; 