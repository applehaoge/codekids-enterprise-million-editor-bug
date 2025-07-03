import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { shopItems, transactions, userBalance } from '@/data/shopMock';
import { toast } from 'sonner';

export default function Shop() {
  const [activeTab, setActiveTab] = useState('virtual');
  const [selectedItem, setSelectedItem] = useState<typeof shopItems[0] | null>(null);
  const [balance, setBalance] = useState(userBalance.balance);

  const filteredItems = shopItems.filter(item => item.type === activeTab || activeTab === 'all');

  const handleRedeem = (item: typeof shopItems[0]) => {
    if (balance < item.price) {
      toast.error('能量水晶不足');
      return;
    }
    setBalance(prev => prev - item.price);
    setSelectedItem(null);
    toast.success(`成功兑换 ${item.name}`);
  };

  return (
    <div className="min-h-screen bg-green-50 font-comic">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* 水晶余额 */}
        <motion.div 
          className="mb-8 flex items-center justify-between rounded-xl bg-green-700 p-6 text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold">商城</h2>
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-gem text-orange-300 text-2xl"></i>
            <span className="text-xl font-bold">{balance}</span>
          </div>
        </motion.div>

        {/* 分类标签 */}
        <motion.div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {['virtual', 'learning', 'physical'].map((tab) => (
            <motion.button
              key={tab}
              className={`whitespace-nowrap rounded-full px-6 py-2 font-bold ${activeTab === tab ? 'bg-orange-500 text-white' : 'bg-white text-green-800'}`}
              onClick={() => setActiveTab(tab)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tab === 'virtual' && '虚拟道具'}
              {tab === 'learning' && '学习资料'}
              {tab === 'physical' && '实体礼品'}
            </motion.button>
          ))}
        </motion.div>

        {/* 商品网格 */}
        <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              className="rounded-xl bg-white shadow-lg overflow-hidden"
              whileHover={{ y: -5 }}
              onClick={() => setSelectedItem(item)}
            >
              <img 
                src={item.image} 
                alt={item.name}
                className="h-48 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="mb-2 text-lg font-bold text-green-800">{item.name}</h3>
                <div className="flex justify-between items-center">
                  <span className="rounded-full bg-green-700 px-3 py-1 text-sm text-white">
                    {item.price} 水晶
                  </span>
                  <motion.button
                    className="rounded-full bg-orange-500 px-4 py-1 text-sm text-white"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem(item);
                    }}
                  >
                    兑换
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 交易记录 */}
        <h3 className="mb-4 text-2xl font-bold text-green-800">最近交易</h3>
        <div className="rounded-xl bg-white p-6 shadow-lg">
          {transactions.map((transaction) => (
            <motion.div
              key={transaction.id}
              className="flex items-center justify-between border-b border-gray-200 py-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div>
                <h4 className="font-bold text-green-800">{transaction.item}</h4>
                <p className="text-sm text-gray-500">{transaction.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-gem text-orange-500"></i>
                <span className="font-bold">{transaction.amount}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 兑换确认对话框 */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
            >
              <motion.div
                className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="mb-4 text-xl font-bold text-green-800">确认兑换</h3>
                <div className="mb-6 flex items-center gap-4">
                  <img 
                    src={selectedItem.image} 
                    alt={selectedItem.name}
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-bold">{selectedItem.name}</h4>
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-gem text-orange-500"></i>
                      <span>{selectedItem.price} 水晶</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <motion.button
                    className="rounded-full bg-gray-200 px-6 py-2 font-bold text-gray-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedItem(null)}
                  >
                    取消
                  </motion.button>
                  <motion.button
                    className="rounded-full bg-orange-500 px-6 py-2 font-bold text-white"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRedeem(selectedItem)}
                  >
                    确认兑换
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
