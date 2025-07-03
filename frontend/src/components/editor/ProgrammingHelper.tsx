import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { programmingConcepts } from '@/data/editorMock';
import { toast } from 'sonner';

interface ProgrammingHelperProps {
  onClose: () => void;
}

export default function ProgrammingHelper({ onClose }: ProgrammingHelperProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConcept, setSelectedConcept] = useState<any>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // 模糊搜索函数
  const searchConcepts = (term: string) => {
    if (!term.trim()) return [];
    const lowerTerm = term.toLowerCase();
    return programmingConcepts.filter(concept => 
      concept.matches.some(match => 
        match.toLowerCase().includes(lowerTerm) || 
        concept.keyword.toLowerCase().includes(lowerTerm)
      )
    );
  };

  const results = searchTerm ? searchConcepts(searchTerm) : [];

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // 生成概念图片URL
  const getConceptImage = (concept: string) => {
    const prompt = encodeURIComponent(`Cartoon illustration explaining ${concept} concept for kids, simple and colorful`);
    return `https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=%24%7Bprompt%7D&sign=019c5572c50ec00eb25b0055e409b54b`;
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="w-full max-w-4xl bg-white rounded-xl overflow-hidden shadow-xl"
        ref={panelRef}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
      >
        <div className="bg-purple-600 text-white p-4 flex justify-between items-center">
          <h3 className="text-2xl font-bold">编程助手</h3>
          <button 
            onClick={onClose}
            className="text-white hover:text-orange-300 text-2xl"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        
        <div className="p-4 border-b">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedConcept(null);
              }}
              placeholder="搜索编程概念，如'循环'、'函数'..."
              className="w-full rounded-full border border-gray-300 px-6 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
            />
            <i className="fa-solid fa-search absolute left-4 top-4 text-gray-400 text-xl"></i>
          </div>
        </div>

        <div className="h-[70vh] overflow-y-auto p-4">
          {results.length === 0 && searchTerm ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <i className="fa-solid fa-circle-question text-5xl mb-4"></i>
              <p className="text-xl">没有找到相关结果</p>
            </div>
          ) : (
            results.map((concept) => (
              <motion.div 
                key={concept.keyword}
                className="mb-8 bg-blue-50 rounded-xl overflow-hidden shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-purple-800 mb-4">{concept.keyword}</h3>
                    {concept.items.map((item: any) => (
                      <div key={item.title} className="mb-6">
                        <h4 className="text-xl font-bold text-orange-600 mb-2">{item.title}</h4>
                        <p className="text-lg mb-3">{item.description}</p>
                        <div className="bg-white p-3 rounded-lg mb-3">
                          <h5 className="font-bold mb-1">怎么写:</h5>
                          <code className="bg-gray-100 p-2 rounded block text-blue-900">{item.syntax}</code>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <h5 className="font-bold mb-1">试试看:</h5>
                          <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">{item.example}</pre>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white p-4 flex items-center justify-center">
                    <img 
                      src={getConceptImage(concept.keyword)} 
                      alt={concept.keyword}
                      className="w-full h-auto rounded-lg object-contain max-h-64"
                    />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}