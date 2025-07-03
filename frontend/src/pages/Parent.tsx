import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { parentStats, learningRecords, weeklyData } from '@/data/parentMock';

export default function Parent() {
  const [timeLimit, setTimeLimit] = useState(parentStats.timeLimit);
  const [notifications, setNotifications] = useState(parentStats.notifications);

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="min-h-screen bg-green-50 font-comic">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-4xl font-bold text-green-800">家长中心</h1>
        
        {/* 数据看板 */}
        <motion.div 
          className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-xl font-bold text-gray-700">总学习时长</h3>
            <div className="flex items-end">
              <span className="text-4xl font-bold text-orange-500">{parentStats.totalHours}</span>
              <span className="ml-2 text-gray-500">小时</span>
            </div>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-xl font-bold text-gray-700">完成课程</h3>
            <div className="flex items-end">
              <span className="text-4xl font-bold text-orange-500">{parentStats.courses}</span>
              <span className="ml-2 text-gray-500">门</span>
            </div>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-xl font-bold text-gray-700">获得奖励</h3>
            <div className="flex items-end">
              <span className="text-4xl font-bold text-orange-500">{parentStats.rewards}</span>
              <span className="ml-2 text-gray-500">水晶</span>
            </div>
          </div>
        </motion.div>

        {/* 学习时长图表 */}
        <motion.div 
          className="mb-8 rounded-xl bg-white p-6 shadow-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="mb-4 text-xl font-bold text-gray-700">本周学习时长</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="hours" 
                  fill="#2E8B57"
                  animationBegin={100}
                  animationDuration={1000}
                >
                  {weeklyData.map((entry, index) => (
                    <stop 
                      key={`bar-gradient-${index}`} 
                      offset="0%" 
                      stopColor="#2E8B57" 
                      stopOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* 使用控制 */}
          <motion.div 
            className="rounded-xl bg-white p-6 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="mb-4 text-xl font-bold text-gray-700">使用时间控制</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-gray-700">每日使用时间限制</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="30"
                    max="120"
                    step="10"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                  <span className="text-lg font-bold text-orange-500">{timeLimit}分钟</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 通知设置 */}
          <motion.div 
            className="rounded-xl bg-white p-6 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="mb-4 text-xl font-bold text-gray-700">通知设置</h3>
            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <motion.div
                  key={key}
                  className="flex items-center justify-between rounded-lg bg-gray-100 p-4"
                  whileHover={{ scale: 1.02 }}
                >
                  <label className="text-gray-700">
                    {key === 'newCourse' && '新课程通知'}
                    {key === 'reward' && '奖励通知'}
                    {key === 'weeklyReport' && '每周报告'}
                  </label>
                  <button
                    onClick={() => toggleNotification(key as keyof typeof notifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* 学习报告 */}
        <motion.div 
          className="mt-8 rounded-xl bg-white p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="mb-4 text-xl font-bold text-gray-700">最近学习记录</h3>
          <div className="space-y-4">
            {learningRecords.map((record, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div>
                  <h4 className="font-bold text-green-800">{record.course}</h4>
                  <p className="text-sm text-gray-500">{record.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{record.duration}分钟</p>
                  <p className="text-sm text-orange-500">+{record.reward}水晶</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}