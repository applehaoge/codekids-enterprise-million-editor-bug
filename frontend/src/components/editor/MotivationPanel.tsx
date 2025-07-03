import { motion } from 'framer-motion';

interface MotivationPanelProps {
  crystalCount: number;
  onCrystalAdd?: (amount: number) => void;
}

export default function MotivationPanel({ crystalCount, onCrystalAdd }: MotivationPanelProps) {
  const progress = Math.min(100, (crystalCount / 200) * 100);
  
  return (
    <motion.div 
      className="flex items-center gap-3 bg-white rounded-xl shadow-lg px-3 py-1"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      <div className="flex items-center">
        <i className="fa-solid fa-gem text-orange-500 text-2xl mr-2"></i>
        <span className="font-bold text-green-800">{crystalCount}</span>
      </div>
      <div className="w-32 h-4 bg-gray-200 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-green-500 to-orange-500"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>
      <motion.button
        className="text-xs bg-green-700 text-white px-3 py-1 rounded-full"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onCrystalAdd && onCrystalAdd(5)}
      >
        获取更多
      </motion.button>
    </motion.div>
  );
}