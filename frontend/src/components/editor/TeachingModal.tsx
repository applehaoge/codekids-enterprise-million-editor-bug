import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { teachingMaterials } from '@/data/editorMock';
import { toast } from 'sonner';

interface TeachingModalProps {
  onQuizSuccess?: () => void;
}

export default function TeachingModal({ onQuizSuccess }: TeachingModalProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentMaterial = teachingMaterials[0];
  const totalPages = currentMaterial.pages.length;

  const playSuccessSound = () => {
    try {
      // 使用更可靠的base64音频数据
      const audioSrc = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTZWxmIExvdmUgVjFCQ1RIAAAAFQAAAFdvbmRlcmZ1bCBXaW5kb3dzIE1USVQAAAAFAAAAQ29weXJpZ2h0IEFwcGxlIENvbXB1dGVyLCBJbmMuAAAABQAAABFkaWdpdGFsIG1hc3RlcmluZwAAAAA=';
      
      // 确保audioRef存在
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      
      // 重置并播放
      audioRef.current.src = '';
      audioRef.current.src = audioSrc;
      audioRef.current.volume = 0.5;
      audioRef.current.load();
      
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.error('播放音效失败:', e);
          // 回退方案：使用浏览器内置提示音
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = ctx.createOscillator();
          oscillator.type = 'triangle';
          oscillator.connect(ctx.destination);
          oscillator.start();
          setTimeout(() => oscillator.stop(), 300);
        });
      }
    } catch (e) {
      console.error('音效初始化失败:', e);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleQuizSubmit = () => {
    if (quizAnswer === 'A') {
      playSuccessSound();
      toast.success('回答正确！获得5个能量水晶');
      setShowQuiz(false);
      setIsMinimized(true);
      onQuizSuccess?.();
    } else {
      toast.error('回答错误，请再试一次');
    }
  };

  if (isMinimized) {
    return (
      <motion.div
        className="fixed bottom-4 left-4 z-50"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <motion.button 
          className="w-14 h-14 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-xl"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsMinimized(false)}
        >
          <i className="fa-solid fa-book-open text-xl"></i>
          <motion.div 
            className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <span className="text-xs">!</span>
          </motion.div>
        </motion.button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="w-full max-w-2xl bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl overflow-hidden"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{
            scale: 0.5,
            x: -150,
            y: 300,
            opacity: 0,
            transition: { 
              duration: 0.5,
              ease: "easeInOut"
            }
          }}
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white flex justify-between items-center">
            <h3 className="text-xl font-bold">课前教学</h3>
            <div className="flex gap-2">
              <motion.button
                className="flex items-center gap-1 bg-pink-500 text-white px-3 py-1 rounded-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowVideo(true)}
              >
                <i className="fa-solid fa-video"></i>
                <span>视频教学</span>
              </motion.button>
              <motion.button 
                className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center"
                onClick={() => setIsMinimized(true)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
              >
                <i className="fa-solid fa-minus"></i>
              </motion.button>
              <motion.button 
                className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center"
                onClick={() => setIsMinimized(true)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
              >
                <i className="fa-solid fa-xmark"></i>
              </motion.button>
            </div>
          </div>

          <div className="p-6 h-96 overflow-y-auto">
            {showVideo ? (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="w-full aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <button className="bg-orange-500 text-white p-6 rounded-full">
                    <i className="fa-solid fa-play text-3xl"></i>
                  </button>
                </div>
                <button 
                  className="text-blue-600 underline"
                  onClick={() => setShowVideo(false)}
                >
                  返回教学内容
                </button>
              </div>
            ) : showQuiz ? (
              <div className="space-y-4">
                <h4 className="text-lg font-bold">测试题</h4>
                <p className="mb-4">以下哪个是Python的输出语句？</p>
                <div className="space-y-2">
                  {['A. print()', 'B. echo()', 'C. output()', 'D. console.log()'].map((option) => (
                    <label key={option} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-blue-50 cursor-pointer">
                      <input 
                        type="radio" 
                        name="quiz" 
                        value={option[0]}
                        onChange={(e) => setQuizAnswer(e.target.value)}
                        className="accent-orange-500"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
                <button 
                  className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg"
                  onClick={handleQuizSubmit}
                >
                  提交答案
                </button>
              </div>
            ) : (
              <>
                {currentMaterial.pages[currentPage].type === 'text' && (
                  <p className="text-gray-700">{currentMaterial.pages[currentPage].content}</p>
                )}
                {currentMaterial.pages[currentPage].type === 'image' && (
                  <img 
                    src={currentMaterial.pages[currentPage].content} 
                    alt="教学图片"
                    className="w-full h-64 object-contain mb-4"
                  />
                )}
              </>
            )}
          </div>

          <div className="p-4 border-t flex justify-between items-center">
            <button 
              className={`px-4 py-2 rounded-lg ${currentPage === 0 ? 'bg-gray-200 text-gray-500' : 'bg-blue-500 text-white'}`}
              onClick={handlePrev}
              disabled={currentPage === 0}
            >
              上一页
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: totalPages }).map((_, index) => (
                <div 
                  key={index}
                  className={`w-2 h-2 rounded-full ${currentPage === index ? 'bg-orange-500' : 'bg-gray-300'}`}
                />
              ))}
            </div>

            {currentPage === totalPages - 1 ? (
              <button 
                className="px-4 py-2 bg-green-500 text-white rounded-lg"
                onClick={() => setShowQuiz(true)}
              >
                学会了
              </button>
            ) : (
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                onClick={handleNext}
              >
                下一页
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}