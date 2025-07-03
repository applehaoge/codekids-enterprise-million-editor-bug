import { motion } from 'framer-motion';
import { featureCards } from '@/data/mock';

export default function FeatureCards() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {featureCards.map((card) => (
        <motion.a
          key={card.id}
          href={card.link}
           className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 p-8 text-center shadow-lg hover:shadow-xl"
          whileHover={{ y: -5, transition: { type: 'spring', stiffness: 300 } }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-800">
            <i className={`${card.icon} text-2xl`}></i>
          </div>
          <h3 className="text-xl font-bold">{card.title}</h3>
        </motion.a>
      ))}
    </div>
  );
}