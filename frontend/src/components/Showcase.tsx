import { motion } from 'framer-motion';
import { showcaseData } from '@/data/mock';

export default function Showcase() {
  return (
    <div className="py-8">
      <h2 className="mb-6 text-3xl font-bold text-white">学员作品展示</h2>
      <div className="flex gap-6 overflow-x-auto pb-4">
        {showcaseData.map((item) => (
          <motion.div
            key={item.id}
            className="flex min-w-[300px] flex-col rounded-xl bg-white shadow-lg"
            whileHover={{ scale: 1.02 }}
          >
            <img 
              src={item.image} 
              alt={item.title} 
              className="h-48 w-full rounded-t-xl object-cover"
            />
            <div className="p-4">
              <h3 className="mb-2 text-xl font-bold">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}