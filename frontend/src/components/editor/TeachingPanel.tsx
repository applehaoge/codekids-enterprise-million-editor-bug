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

  useEffect(() => {
    if (imageData?.startsWith('data:image')) {
      frameQueue.current.push(imageData);
    }
  }, [imageData]);

  useEffect(() => {
    let frameCount = 0;
    let lastSecond = Date.now();
    let lastRenderTime = 0;
    const targetFps = 30;
    const minFrameInterval = 1000 / targetFps;
    let running = true;

    const drawFrame = (time?: number) => {
      if (!running) return;
      const canvas = canvasRef.current;
      if (document.hidden || !canvas) {
        animationRef.current = requestAnimationFrame(drawFrame);
        return;
      }

      const editorFocused = !!(document.activeElement && (document.activeElement as HTMLElement).closest && (document.activeElement as HTMLElement).closest('.monaco-editor'));
      const effectiveMinInterval = editorFocused ? 1000 / 2 : minFrameInterval;

      const now = performance.now();
      if (time === undefined) time = now;
      if (now - lastRenderTime < effectiveMinInterval) {
        animationRef.current = requestAnimationFrame(drawFrame);
        return;
      }
      lastRenderTime = now;

      const ctx = canvas.getContext('2d');
      const next = frameQueue.current.shift();
      if (next && ctx) {
        const img = new Image();
        img.src = next;
        img.onload = () => {
          const displayWidth = canvas.clientWidth;
          const displayHeight = canvas.clientHeight;
          if (Number.isNaN(displayWidth) || Number.isNaN(displayHeight) || displayWidth <= 0 || displayHeight <= 0) {
            return;
          }
          if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
          }
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
      }

      frameCount++;
      const nowMs = Date.now();
      if (nowMs - lastSecond >= 1000) {
        console.log(`🟢 当前帧率：${frameCount} FPS`);
        frameCount = 0;
        lastSecond = nowMs;
      }

      animationRef.current = requestAnimationFrame(drawFrame);
    };

    animationRef.current = requestAnimationFrame(drawFrame);

    const handleVisibility = () => {
      if (document.hidden) {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      } else {
        if (!animationRef.current) animationRef.current = requestAnimationFrame(drawFrame);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      running = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
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
