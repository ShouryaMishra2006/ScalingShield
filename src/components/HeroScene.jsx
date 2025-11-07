import Spline from '@splinetool/react-spline';
import { motion } from 'framer-motion';

function HeroScene() {
  return (
    <section className="relative h-64 sm:h-72 md:h-80 lg:h-96 w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
      <Spline
        scene="https://prod.spline.design/DtQLjBkD1UpownGS/scene.splinecode"
        style={{ width: '100%', height: '100%' }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white dark:from-black via-transparent to-transparent" />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="absolute bottom-4 left-4 right-4 flex items-center justify-between"
      >
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
            Live Security Overview
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Futuristic 3D shield signifies protected perimeter</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-emerald-500 text-xs font-medium bg-emerald-500/10 px-2.5 py-1.5 rounded-md border border-emerald-500/20">
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Real-Time Feed Active
        </div>
      </motion.div>
    </section>
  );
}

export default HeroScene;
