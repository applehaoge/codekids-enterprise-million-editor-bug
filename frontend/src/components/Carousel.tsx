import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { carouselData } from '@/data/mock';

export default function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === carouselData.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-[40vh] w-full overflow-hidden rounded-xl">
      {carouselData.map((item, index) => (
        <motion.div
          key={item.id}
          className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-r from-blue-800 to-purple-800 p-8 text-white"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: index === currentIndex ? 1 : 0,
            transition: { duration: 0.5 }
          }}
        >
          <img 
            src={item.image} 
            alt={item.title} 
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          />
          <div className="relative z-10 max-w-2xl text-center">
            <motion.h2 
              className="mb-4 text-4xl font-bold"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ type: 'spring', stiffness: 100 }}
            >
              {item.title}
            </motion.h2>
            <motion.p 
              className="mb-6 text-xl"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ type: 'spring', stiffness: 100 }}
            >
              {item.desc}
            </motion.p>
            <motion.a
              href={item.link}
              className="inline-block rounded-full bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              立即体验
            </motion.a>
          </div>
        </motion.div>
      ))}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {carouselData.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-3 w-3 rounded-full ${index === currentIndex ? 'bg-orange-500' : 'bg-white'}`}
          />
        ))}
      </div>
    </div>
  );
}