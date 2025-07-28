import { motion } from 'framer-motion';

export const Greeting = () => {
  return (
    <div className="text-center py-16">
      {/* Book-style opening */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="mb-16"
      >
        <div className="text-6xl mb-8">🏰</div>
        <h1 className="text-5xl font-serif font-bold text-amber-200 mb-6 tracking-wide">
          THE ADVENTURE BEGINS
        </h1>
        <div className="w-24 h-0.5 bg-amber-600/50 mx-auto mb-8" />
        <p className="text-xl text-amber-400/80 font-serif italic leading-relaxed max-w-2xl mx-auto">
          In the realm where shadows dance with light, where ancient magic flows through forgotten pathways, 
          a new chapter in the chronicles of legend is about to be written...
        </p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 1.5 }}
        className="font-serif text-lg leading-8 text-slate-300 max-w-3xl mx-auto space-y-6"
      >
        <p className="text-justify">
          The ancient scrolls speak of heroes who would rise in the darkest hour, when the veil between worlds grows thin 
          and destiny calls forth champions from the realm of possibility. The air itself hums with anticipation, 
          waiting for brave souls to step forward and claim their place in the eternal tapestry of adventure.
        </p>
        
        <p className="text-center text-amber-300/80 font-medium">
          Will you heed the call of destiny?
        </p>
      </motion.div>
    </div>
  );
};
