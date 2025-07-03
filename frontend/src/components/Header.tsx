import { motion } from 'framer-motion';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-800 to-purple-800 shadow-md h-12">
      {/* 导航栏样式说明：
        - sticky top-0: 固定顶部
        - z-50: 确保在其他元素上方
        - bg-gradient-to-r from-blue-800 to-purple-800: 蓝色到紫色的渐变背景
        - shadow-md: 中等阴影效果
        - h-12: 高度12个单位(48px)
        修改这些类可以调整导航栏的外观和位置 */}

      <div className="container mx-auto h-full flex items-center justify-between px-4">
        <motion.a 
          href="/" 
          className="text-2xl font-bold text-white"
          whileHover={{ scale: 1.05 }}
        >
          CodeKids
        </motion.a>
        
        <nav className="hidden md:block h-full">
          <ul className="flex gap-6 h-full items-center">
            <li>
              <motion.a 
                href="/" 
                className="text-white hover:text-orange-300"
                whileHover={{ scale: 1.1 }}
              >
                首页
              </motion.a>
            </li>
            <li>
              <motion.a 
                href="/learn" 
                className="text-white hover:text-orange-300"
                whileHover={{ scale: 1.1 }}
              >
                学习
              </motion.a>
            </li>
            <li>
              <motion.a 
                href="/parent" 
                className="text-white hover:text-orange-300"
                whileHover={{ scale: 1.1 }}
              >
                家长中心
              </motion.a>
            </li>
          </ul>
        </nav>

        <motion.button 
          className="flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-blue-800"
          whileHover={{ scale: 1.05 }}
        >
          <i className="fa-solid fa-globe"></i>
          <span>中文</span>
        </motion.button>
      </div>
    </header>
  );
}