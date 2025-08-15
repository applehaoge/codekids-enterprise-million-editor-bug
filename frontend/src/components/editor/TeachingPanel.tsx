import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

interface TeachingPanelProps {
  imageData?: string;
}

export default function TeachingPanel({ imageData }: TeachingPanelProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameQueue = useRef<string[]>([]);
  const animationRef = useRef<number>();

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  // ✅ 接收后端发来的帧并入队（带前缀 FRAME:）
  useEffect(() => {
    if (imageData?.startsWith('data:image')) {
      frameQueue.current.push(imageData);
    }
  }, [imageData]);

  // ✅ 渲染帧（用 requestAnimationFrame 替代 setInterval）
  useEffect(() => {
    let frameCount = 0;
    let lastSecond = Date.now();

    const drawFrame = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const next = frameQueue.current.shift();
      if (next && ctx) {
        const img = new Image();
        img.src = next;
        img.onload = () => {
          const displayWidth = canvas.clientWidth;
          const displayHeight = canvas.clientHeight;

          // ✅ 跳过非法尺寸以避免 NaN 等异常
          if (Number.isNaN(displayWidth) || Number.isNaN(displayHeight) || displayWidth <= 0 || displayHeight <= 0) {
            return;
          }

          if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
          }

          // ✅ 渲染图像
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
      }

      // ✅ 统计帧率
      frameCount++;
      const now = Date.now();
      if (now - lastSecond >= 1000) {
        console.log(`🟢 当前帧率：${frameCount} FPS`);
        frameCount = 0;
        lastSecond = now;
      }

      animationRef.current = requestAnimationFrame(drawFrame);
    };

    animationRef.current = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(animationRef.current!);
  }, []);


  return (
    <motion.div
      className={`rounded-xl bg-white shadow-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : 'h-full flex flex-col'}`}
      style={{ overflow: 'hidden' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      {/* 顶部工具栏 */}
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-xl font-bold text-blue-800">运行结果</h3>
        <div className="flex gap-2">
          <motion.button className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center">
            <i className="fa-solid fa-pause"></i>
          </motion.button>
          <motion.button className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center">
            <i className="fa-solid fa-play"></i>
          </motion.button>
          <motion.button className="w-10 h-10 rounded-full bg-yellow-500 text-white flex items-center justify-center">
            <i className="fa-solid fa-gauge-high"></i>
          </motion.button>
          <motion.button
            className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center"
            onClick={toggleFullscreen}
          >
            <i className={`fa-solid ${isFullscreen ? 'fa-minimize' : 'fa-maximize'}`}></i>
          </motion.button>
        </div>
      </div>

      {/* 动画画布区域 */}
      <div className={`relative ${isFullscreen ? 'h-[calc(100vh-80px)]' : 'flex-1 bg-gradient-to-b from-blue-50 to-purple-50 min-h-[300px]'}`}>
        <div className="absolute inset-0 p-4">
          <div className="relative w-full h-full">
            <div className="absolute inset-0 bg-white rounded-lg shadow-inner">
              <canvas
                ref={canvasRef}
                className="w-full h-full mx-auto block rounded shadow"
                style={{ display: 'block' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 角色背景（全屏隐藏） */}
      {!isFullscreen && (
        <div className="p-3 border-t">
          <h4 className="text-sm font-bold mb-2 text-blue-800">角色和背景</h4>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                className="border border-purple-300 rounded p-1 cursor-pointer hover:shadow-sm"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-10 h-10 bg-blue-100 rounded"></div>
                <p className="text-xs text-center mt-1">角色 {item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
