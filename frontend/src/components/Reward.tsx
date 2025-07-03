import { motion } from 'framer-motion';
import { rewardStatus } from '@/data/mock';

export default function Reward() {
  return (
    <motion.div 
      className="mb-8 rounded-xl bg-gradient-to-r from-blue-700 to-purple-700 p-6 text-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">每日登录奖励</h3>
          <p className="mt-2">
            {rewardStatus.claimed ? '今日奖励已领取' : `今日可领取 ${rewardStatus.amount} 能量水晶`}
          </p>
        </div>
        <motion.button
          className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 text-2xl font-bold"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          disabled={rewardStatus.claimed}
        >
          {rewardStatus.claimed ? '✓' : rewardStatus.amount}
        </motion.button>
      </div>
    </motion.div>
  );
}