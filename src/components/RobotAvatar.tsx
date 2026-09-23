import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../utils/audio';

interface RobotAvatarProps {
  isCurrent?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
  onWinkComplete?: () => void;
}

export const RobotAvatar: React.FC<RobotAvatarProps> = ({
  isCurrent = false,
  size = 'lg',
  className = '',
  onWinkComplete
}) => {
  const avatarRef = useRef<HTMLDivElement>(null);
  const [lookOffset, setLookOffset] = useState({ x: 0, y: 0, tiltX: 0, tiltY: 0, tiltZ: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [isRightWinking, setIsRightWinking] = useState(false);
  const [isSmiling, setIsSmiling] = useState(false);
  const [clickTiltZ, setClickTiltZ] = useState(0);
  const [clickNodY, setClickNodY] = useState(0);
  const lastActiveTimestamp = useRef<number>(Date.now());
  const smileTimeoutRef = useRef<number | null>(null);

  // Each avatar instance gets a unique random initial delay (2s to 9s) so multiple avatars never wink at the same time
  const initialWinkOffset = useRef<number>(Math.floor(Math.random() * 7000) + 2000);

  // Proportioned size mapping with minimum pixel constraints to prevent flex collapse
  const sizeClasses = {
    sm: 'w-10 h-10 min-w-[40px] min-h-[40px]',
    md: 'w-12 h-12 min-w-[48px] min-h-[48px]',
    lg: 'w-14 h-14 md:w-16 md:h-16 min-w-[56px] min-h-[56px]',
    xl: 'w-24 h-24 min-w-[96px] min-h-[96px]',
    '2xl': 'w-36 h-36 md:w-44 md:h-44 min-w-[144px] min-h-[144px]',
    '3xl': 'w-48 h-48 md:w-56 md:h-56 min-w-[192px] min-h-[192px]'
  };

  // Interactive Click Handler: Cheerful chime, playful head tilt, and smiling expression
  const handleAvatarClick = () => {
    sounds.playCuteSmile();

    setIsSmiling(true);

    const randomTilt = Math.random() > 0.5 ? 7.5 : -7.5;
    setClickTiltZ(randomTilt);
    setClickNodY(-4);

    if (smileTimeoutRef.current) {
      clearTimeout(smileTimeoutRef.current);
    }

    setTimeout(() => {
      setClickNodY(0);
    }, 450);

    smileTimeoutRef.current = window.setTimeout(() => {
      setIsSmiling(false);
      setClickTiltZ(0);
      setClickNodY(0);
      if (onWinkComplete) onWinkComplete();
    }, 2000);
  };

  // 1. Autonomous Right-Eye Wink (~10s cycle, individually desynchronized per avatar instance)
  useEffect(() => {
    let winkTimeout: number;
    let winkCloseTimeout: number;

    const executeWink = () => {
      if (!isSmiling) {
        setIsRightWinking(true);
        winkCloseTimeout = window.setTimeout(() => {
          setIsRightWinking(false);
          if (onWinkComplete) onWinkComplete();
        }, 420);
      }
      // Schedule next wink in ~10s (approx 9.5s - 10.8s for natural organic feel)
      const nextInterval = 9500 + Math.random() * 1300;
      winkTimeout = window.setTimeout(executeWink, nextInterval);
    };

    // First wink uses the per-instance staggered offset (each avatar winks at different times)
    winkTimeout = window.setTimeout(executeWink, initialWinkOffset.current);

    return () => {
      clearTimeout(winkTimeout);
      clearTimeout(winkCloseTimeout);
    };
  }, [isSmiling, onWinkComplete]);

  // 2. Autonomous Natural Double-Eye Micro-Blink (every 3.2s to 5.2s)
  useEffect(() => {
    let blinkTimeout: number;
    let blinkResetTimeout: number;

    const scheduleNextBlink = () => {
      const delay = 3200 + Math.random() * 2000;
      blinkTimeout = window.setTimeout(() => {
        if (!isRightWinking && !isSmiling) {
          setIsBlinking(true);
          blinkResetTimeout = window.setTimeout(() => {
            setIsBlinking(false);
            scheduleNextBlink();
          }, 110);
        } else {
          scheduleNextBlink();
        }
      }, delay);
    };

    const initialBlinkDelay = Math.random() * 2500 + 1000;
    blinkTimeout = window.setTimeout(scheduleNextBlink, initialBlinkDelay);

    return () => {
      clearTimeout(blinkTimeout);
      clearTimeout(blinkResetTimeout);
    };
  }, [isRightWinking, isSmiling]);

  // 2. 3D Cursor & Pointer Tracking + Head Tilt Engine
  useEffect(() => {
    if (!isCurrent) {
      setLookOffset({ x: 0, y: 0, tiltX: 0, tiltY: 0, tiltZ: 0 });
      return;
    }

    let animationFrameId: number;
    let idleIntervalId: number;

    const updateCoordinates = (clientX: number, clientY: number) => {
      lastActiveTimestamp.current = Date.now();
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        if (!avatarRef.current) return;
        const rect = avatarRef.current.getBoundingClientRect();
        const avatarCenterX = rect.left + rect.width / 2;
        const avatarCenterY = rect.top + rect.height * 0.54;

        const deltaX = clientX - avatarCenterX;
        const deltaY = clientY - avatarCenterY;
        const distance = Math.hypot(deltaX, deltaY);

        const maxOffset = size === '3xl' ? 10 : size === '2xl' ? 8 : size === 'xl' ? 6 : size === 'lg' ? 4.5 : 3;
        const reach = Math.min(window.innerWidth, window.innerHeight) * 0.45;
        const travelRatio = Math.min(distance / reach, 1);
        const angle = Math.atan2(deltaY, deltaX);

        const targetX = Math.cos(angle) * (travelRatio * maxOffset);
        const targetY = Math.sin(angle) * (travelRatio * (maxOffset * 0.65));

        const tiltX = Math.max(Math.min((deltaX / window.innerWidth) * 11, 8.5), -8.5);
        const tiltY = Math.max(Math.min((deltaY / window.innerHeight) * -11, 7), -7);
        const tiltZ = tiltX * 0.35;

        setLookOffset({
          x: targetX,
          y: targetY,
          tiltX,
          tiltY,
          tiltZ
        });
      });
    };

    const handlePointerMove = (e: PointerEvent) => {
      updateCoordinates(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        updateCoordinates(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handlePointerLeave = () => {
      setLookOffset({ x: 0, y: 0, tiltX: 0, tiltY: 0, tiltZ: 0 });
    };

    idleIntervalId = window.setInterval(() => {
      if (Date.now() - lastActiveTimestamp.current > 2800 && !isRightWinking && !isBlinking && !isSmiling) {
        const randomGlances = [
          { x: 0, y: 0, tiltX: 0, tiltY: 0, tiltZ: 0 },
          { x: -1.6, y: 0.8, tiltX: -1.8, tiltY: 0.8, tiltZ: -0.6 },
          { x: 1.6, y: 0.6, tiltX: 1.8, tiltY: 0.6, tiltZ: 0.6 },
          { x: 0, y: 1.2, tiltX: 0, tiltY: -1.2, tiltZ: 0 },
          { x: 0, y: 0, tiltX: 0, tiltY: 0, tiltZ: 0 }
        ];
        const nextGlance = randomGlances[Math.floor(Math.random() * randomGlances.length)];
        setLookOffset(nextGlance);
      }
    }, 2500);

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerMove);
      window.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
      cancelAnimationFrame(animationFrameId);
      clearInterval(idleIntervalId);
    };
  }, [isCurrent, size, isRightWinking, isBlinking, isSmiling]);

  const showRightWink = isRightWinking;
  const showBothHappyEyes = isSmiling;

  return (
    <div
      ref={avatarRef}
      onClick={handleAvatarClick}
      title="Click me to smile! 😊"
      className={`relative select-none flex-shrink-0 flex items-center justify-center cursor-pointer group ${sizeClasses[size]} ${className}`}
      style={{
        perspective: '700px',
        transformStyle: 'preserve-3d'
      }}
    >
      {/* 3D Tilted & Floating Robot Head with Spring Physics */}
      <div
        className={`w-full h-full relative transition-transform duration-250 ease-out group-hover:scale-105 ${
          !isSmiling ? 'animate-robot-float' : ''
        }`}
        style={{
          transform: isCurrent
            ? `rotateY(${lookOffset.tiltX}deg) rotateX(${lookOffset.tiltY}deg) rotateZ(${lookOffset.tiltZ + clickTiltZ}deg) translateY(${clickNodY}px)`
            : `rotateY(0deg) rotateX(0deg) rotateZ(${clickTiltZ}deg) translateY(${clickNodY}px)`
        }}
      >
        {/* Glossy White Ceramic Robot Helmet Base */}
        <img
          src="/assets/robot-avatar.png"
          alt="Maybank AI Robot"
          className="w-full h-full object-contain pointer-events-none drop-shadow-md"
        />

        {/* ========================================================================= */}
        {/* CURVED DARK VISOR SCREEN                                                  */}
        {/* ========================================================================= */}
        <div
          className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center overflow-hidden"
          style={{
            top: '31%',
            left: '23%',
            width: '54%',
            height: '49%',
            borderRadius: '45%'
          }}
        >
          {/* Cyber Visor Ambient Depth */}
          <div className="absolute inset-0 bg-radial from-sky-900/50 via-transparent to-transparent opacity-70" />

          {/* ===================================================================== */}
          {/* CUTE EXPRESSIVE DIGITAL CYAN EYES (Lush Proportions & Cuteness)        */}
          {/* ===================================================================== */}
          <div
            className="relative flex items-center justify-center gap-[18%] w-full transition-transform duration-150 ease-out"
            style={{
              height: '56%',
              transform: `translate3d(${lookOffset.x}px, ${lookOffset.y}px, 0px)`
            }}
          >
            {/* -------------------- LEFT EYE -------------------- */}
            {showBothHappyEyes ? (
              /* Beautiful SVG Smiling Happy Eyelid Arc */
              <div className="relative flex items-center justify-center w-[26%] h-[75%] animate-in zoom-in-75 duration-150">
                <svg viewBox="0 0 20 16" className="w-full h-full text-cyan-300 drop-shadow-[0_0_8px_#38BDF8]">
                  <path
                    d="M 2 11 C 5 3, 15 3, 18 11"
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            ) : (
              /* Left Eye Normal / Blinking */
              <div
                className={`relative bg-gradient-to-b from-[#BAE6FD] via-[#38BDF8] to-[#0284C7] rounded-full transition-all rotate-[-3deg] ${
                  isBlinking ? 'scale-y-[0.08]' : 'scale-y-100'
                }`}
                style={{
                  width: '26%',
                  height: '84%',
                  boxShadow:
                    '0 0 8px #38BDF8, 0 0 16px rgba(56, 189, 248, 0.85), inset 0 1.5px 2px rgba(255,255,255,0.95)',
                  transitionDuration: isBlinking ? '60ms' : '150ms'
                }}
              >
                {/* Primary Glossy Catchlight Sparkle */}
                <div className="absolute top-[12%] left-[16%] w-[38%] h-[34%] bg-white rounded-full opacity-95 shadow-xs" />
                {/* Secondary Cute Twinkle */}
                <div className="absolute bottom-[16%] right-[18%] w-[22%] h-[20%] bg-white/90 rounded-full" />
              </div>
            )}

            {/* -------------------- RIGHT EYE -------------------- */}
            {showBothHappyEyes || showRightWink ? (
              /* Beautiful SVG Smiling Happy Eyelid Arc */
              <div className="relative flex items-center justify-center w-[26%] h-[75%] animate-in zoom-in-75 duration-150">
                <svg viewBox="0 0 20 16" className="w-full h-full text-cyan-300 drop-shadow-[0_0_8px_#38BDF8]">
                  <path
                    d="M 2 11 C 5 3, 15 3, 18 11"
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            ) : (
              /* Right Eye Normal / Blinking */
              <div
                className={`relative bg-gradient-to-b from-[#BAE6FD] via-[#38BDF8] to-[#0284C7] rounded-full transition-all rotate-[3deg] ${
                  isBlinking ? 'scale-y-[0.08]' : 'scale-y-100'
                }`}
                style={{
                  width: '26%',
                  height: '84%',
                  boxShadow:
                    '0 0 8px #38BDF8, 0 0 16px rgba(56, 189, 248, 0.85), inset 0 1.5px 2px rgba(255,255,255,0.95)',
                  transitionDuration: isBlinking ? '60ms' : '150ms'
                }}
              >
                {/* Primary Glossy Catchlight Sparkle */}
                <div className="absolute top-[12%] left-[16%] w-[38%] h-[34%] bg-white rounded-full opacity-95 shadow-xs" />
                {/* Secondary Cute Twinkle */}
                <div className="absolute bottom-[16%] right-[18%] w-[22%] h-[20%] bg-white/90 rounded-full" />
              </div>
            )}
          </div>

          {/* ===================================================================== */}
          {/* CUTE GLOWING DIGITAL CYAN SMILE ARC (Appears on Avatar Click)          */}
          {/* ===================================================================== */}
          <div
            className={`transition-all duration-300 flex items-center justify-center w-full ${
              isSmiling ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-1 pointer-events-none'
            }`}
            style={{
              height: '24%',
              marginTop: '1%'
            }}
          >
            <svg viewBox="0 0 32 16" className="w-[36%] h-full text-cyan-300 drop-shadow-[0_0_8px_#38BDF8]">
              <path
                d="M 4 4 Q 16 15 28 4"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Curved Specular Visor Glass Reflection */}
          <div
            className="absolute inset-0 pointer-events-none rounded-[45%]"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.06) 35%, transparent 55%, rgba(255,255,255,0.12) 100%)'
            }}
          />
        </div>
      </div>
    </div>
  );
};
