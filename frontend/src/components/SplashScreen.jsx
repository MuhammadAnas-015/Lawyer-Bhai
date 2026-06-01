import { useEffect, useState } from 'react';
import { motion, useMotionValue, animate } from 'motion/react';
import { Scale } from 'lucide-react';

export default function SplashScreen({ onContinue }) {
  const [progress, setProgress] = useState(0);
  const motionProgress = useMotionValue(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const animation = animate(motionProgress, 100, {
      duration: 4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setProgress(latest),
      onComplete: () => { if (onContinue) setTimeout(onContinue, 300); },
    });
    return () => animation.stop();
  }, [motionProgress]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const particleCount = isMobile ? 10 : 20;
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 10 + 15,
    delay: Math.random() * 2,
  }));

  return (
    <div className="flex items-center justify-center overflow-hidden" style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #0B6238 0%, #0E7A45 50%, #0B6238 100%)', zIndex: 9999 }}>
      {/* Animated background grid */}
      <motion.div className="absolute inset-0 opacity-10" initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} transition={{ duration: 2 }}>
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
          animate={{ backgroundPosition: ['0px 0px', '50px 50px'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/20"
          style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
          animate={{ y: [0, -100, 0], opacity: [0, 1, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}

      {/* Radial glow */}
      <motion.div className="absolute inset-0 opacity-20" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 0.2, scale: 1 }} transition={{ duration: 1.5 }}>
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] md:w-[600px] md:h-[600px] rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px]"
          style={{ backgroundColor: 'rgba(46,164,98,0.3)' }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 w-full max-w-2xl">
        {/* 3D Rotating Scale Icon */}
        <motion.div
          className="relative mb-6 sm:mb-8 md:mb-12"
          initial={{ opacity: 0, scale: 0.3, rotateY: -180, y: -50 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0, y: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Outer glow ring */}
          <motion.div className="absolute inset-0 -m-6 sm:-m-8 md:-m-12" animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
            <div className="size-full rounded-full border border-white/20" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.6)]" />
          </motion.div>

          {/* Middle ring */}
          <motion.div className="absolute inset-0 -m-4 sm:-m-6 md:-m-8" animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}>
            <div className="size-full rounded-full border border-white/10" />
          </motion.div>

          {/* 3D Scale container */}
          <motion.div
            className="relative"
            animate={{ rotateY: [0, 360], rotate: [-2, 2, -2] }}
            transition={{
              rotateY: { duration: 8, repeat: Infinity, ease: 'linear' },
              rotate: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
            }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <motion.div
              className="absolute inset-0 -m-3 sm:-m-4 md:-m-6 rounded-full blur-xl sm:blur-2xl"
              style={{ background: 'linear-gradient(135deg, rgba(46,164,98,0.25), rgba(93,186,131,0.2))' }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/30"
              animate={{ boxShadow: ['0 0 40px rgba(255,255,255,0.2)', '0 0 60px rgba(255,255,255,0.4)', '0 0 40px rgba(255,255,255,0.2)'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                <Scale className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 text-white opacity-90" strokeWidth={1.5} />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* App name + tagline */}
        <motion.div
          className="text-center mb-6 sm:mb-8 md:mb-12 px-4"
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl mb-2 sm:mb-3 md:mb-4 text-white drop-shadow-lg leading-tight font-extrabold"
            style={{ letterSpacing: '-0.02em' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            Lawyer Bhai AI
          </motion.h1>
          <motion.p
            className="text-xs sm:text-sm md:text-base lg:text-lg text-white/80 tracking-wide px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            Pakistan ka AI Legal Assistant
          </motion.p>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          className="w-56 sm:w-72 md:w-80 lg:w-96 px-4"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative h-1 sm:h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/30">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="h-full bg-gradient-to-r from-white via-green-100 to-white rounded-full"
              style={{ width: `${progress}%` }}
              animate={{ boxShadow: ['0 0 15px rgba(255,255,255,0.6)', '0 0 25px rgba(255,255,255,0.8)', '0 0 15px rgba(255,255,255,0.6)'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          <motion.div className="mt-4 sm:mt-5 flex justify-center gap-1.5 sm:gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 0.5 }}>
            {[0, 0.2, 0.4].map((d, i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"
                animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: d }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Corner decorations */}
      <motion.div className="absolute top-0 left-0 w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 opacity-10" initial={{ opacity: 0, scale: 0, x: -50, y: -50 }} animate={{ opacity: 0.15, scale: 1, x: 0, y: 0 }} transition={{ delay: 0.2, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}>
        <motion.div className="size-full border-l border-t sm:border-l-2 sm:border-t-2 border-white/30" animate={{ borderColor: ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0.3)'] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
      </motion.div>
      <motion.div className="absolute bottom-0 right-0 w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 opacity-10" initial={{ opacity: 0, scale: 0, x: 50, y: 50 }} animate={{ opacity: 0.15, scale: 1, x: 0, y: 0 }} transition={{ delay: 0.2, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}>
        <motion.div className="size-full border-r border-b sm:border-r-2 sm:border-b-2 border-white/30" animate={{ borderColor: ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0.3)'] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }} />
      </motion.div>
    </div>
  );
}
