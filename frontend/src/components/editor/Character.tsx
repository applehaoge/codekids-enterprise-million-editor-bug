import { motion } from 'framer-motion';

export default function Character() {
  const characterImage = 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=Friendly%20robot%20character%20for%20kids%20coding%20app%2C%20cartoon%20style&sign=8818fcbe6fe54d15b276fa1c854c8358';

  return (
    <motion.div 
      className="mt-4 rounded-xl bg-white shadow-lg overflow-hidden p-4 flex items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <motion.div
        className="w-16 h-16 rounded-full overflow-hidden mr-4"
        animate={{
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <img 
          src={characterImage}
          alt="帮助角色"
          className="w-full h-full object-cover"
        />
      </motion.div>
      <div>
        <h4 className="font-bold text-green-800">代码小助手</h4>
        <p className="text-sm text-gray-600">试试运行你的代码看看效果吧!</p>
      </div>
    </motion.div>
  );
}