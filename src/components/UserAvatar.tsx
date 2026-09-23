import React from 'react';

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  size = 'md',
  className = ''
}) => {
  const sizeMap = {
    sm: 'w-7 h-7 min-w-[28px] min-h-[28px]',
    md: 'w-8 h-8 min-w-[32px] min-h-[32px]',
    lg: 'w-10 h-10 min-w-[40px] min-h-[40px]'
  };

  return (
    <div
      className={`relative rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm ring-2 ring-slate-200/80 dark:ring-white/20 bg-gradient-to-b from-sky-400 to-indigo-600 dark:from-sky-500 dark:to-indigo-700 select-none ${sizeMap[size]} ${className}`}
      title="User Profile"
      aria-label="User Avatar"
    >
      {/* Modern Illustrated Face Avatar SVG */}
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full transform translate-y-0.5"
      >
        {/* Soft Background Radial Light */}
        <circle cx="32" cy="32" r="32" fill="url(#avatar-bg-grad)" opacity="0.3" />

        {/* Hair - Back layer */}
        <path
          d="M18 30C18 19 23 11 32 11C41 11 46 19 46 30C46 32 45 36 45 36H19C19 36 18 32 18 30Z"
          fill="#1E293B"
        />

        {/* Neck */}
        <rect x="27" y="38" width="10" height="9" rx="3" fill="#FBD38D" />
        {/* Neck shadow */}
        <path d="M27 39C29 41 35 41 37 39V42C35 44 29 44 27 42V39Z" fill="#ED8936" opacity="0.4" />

        {/* Shoulders / Shirt */}
        <path
          d="M14 58C14 47 22 44 27 44H37C42 44 50 47 50 58V64H14V58Z"
          fill="#0EA5E9"
        />
        {/* Shirt Inner Collar V-neck */}
        <path d="M28 44L32 50L36 44H28Z" fill="#FBD38D" />
        <path d="M29 44L32 49L35 44H29Z" fill="#ED8936" opacity="0.3" />

        {/* Ears */}
        <ellipse cx="20" cy="32" rx="2.5" ry="3.5" fill="#FBD38D" />
        <ellipse cx="44" cy="32" rx="2.5" ry="3.5" fill="#FBD38D" />

        {/* Head / Face Base */}
        <rect x="22" y="21" width="20" height="20" rx="10" fill="#FEEBC8" />

        {/* Hair - Front / Bangs Styled */}
        <path
          d="M20 25C21 16 28 12 36 12C43 12 45 17 44 23C42 22 39 21 35 22C30 23 26 21 23 26C21.5 27 20.5 26.5 20 25Z"
          fill="#0F172A"
        />
        {/* Sideburns */}
        <path d="M22 25V31C22 31.5 21.5 32 21 32C20.5 32 20 31.5 20 31V25C20 25 21 25 22 25Z" fill="#0F172A" />
        <path d="M42 25V31C42 31.5 42.5 32 43 32C43.5 32 44 31.5 44 31V25C44 25 43 25 42 25Z" fill="#0F172A" />

        {/* Eyebrows */}
        <path d="M25 25.5C26.5 25 28.5 25 29.5 26" stroke="#0F172A" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M34.5 26C35.5 25 37.5 25 39 25.5" stroke="#0F172A" strokeWidth="1.2" strokeLinecap="round" />

        {/* Friendly Eyes */}
        <ellipse cx="27.5" cy="28.5" rx="1.5" ry="1.8" fill="#0F172A" />
        <ellipse cx="36.5" cy="28.5" rx="1.5" ry="1.8" fill="#0F172A" />
        {/* Eye Catchlights */}
        <circle cx="27" cy="27.8" r="0.5" fill="#FFFFFF" />
        <circle cx="36" cy="27.8" r="0.5" fill="#FFFFFF" />

        {/* Cute Nose */}
        <path d="M32 28.5V31.5C32 32 31.5 32.3 31 32.3" stroke="#ED8936" strokeWidth="1" strokeLinecap="round" />

        {/* Friendly Smile */}
        <path
          d="M28.5 34.5C29.5 36.5 34.5 36.5 35.5 34.5"
          stroke="#C05621"
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        {/* Rosy Cheeks */}
        <circle cx="24.5" cy="32.5" r="1.8" fill="#F6AD55" opacity="0.5" />
        <circle cx="39.5" cy="32.5" r="1.8" fill="#F6AD55" opacity="0.5" />

        <defs>
          <radialGradient
            id="avatar-bg-grad"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(32 20) rotate(90) scale(40)"
          >
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};
