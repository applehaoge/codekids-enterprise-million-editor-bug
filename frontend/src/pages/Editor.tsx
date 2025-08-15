import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import CodeEditor from '@/components/editor/CodeEditor';
import TeachingPanel from '@/components/editor/TeachingPanel';
import TeachingModal from '@/components/editor/TeachingModal';
import AITools from '@/components/editor/AITools';
import MotivationPanel from '@/components/editor/MotivationPanel';

export default function Editor() {
  const [showFeedback, setShowFeedback] = useState(false);

  /* 运行结果 —— 图片 & 文本 */
  const [imageData, setImageData] = useState('');
  const [consoleOutput, setConsoleOutput] = useState('');

  const [feedback, setFeedback] = useState('');
  const [showTeachingModal, setShowTeachingModal] = useState(true);
  const [showAITools, setShowAITools] = useState(false);
  const [crystalCount, setCrystalCount] = useState(125);
  const [isFullscreen, setIsFullscreen] = useState(false);

  /* WebSocket 只建一次，用 ref 保存 */
  const socketRef = useRef<WebSocket | null>(null);

  /* 初次进入时生成演示圆形图 */
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.arc(100, 100, 90, 0, 2 * Math.PI);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();
      setImageData(canvas.toDataURL());
    }
  }, []);

  /* 建立 WebSocket 连接（只建立一次） */
  useEffect(() => {
    const wsUrl = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${import.meta.env.VITE_WS_HOST || 'localhost'}:${import.meta.env.VITE_WS_PORT || 5000}${import.meta.env.VITE_WS_PATH || '/ws'}`;
    console.log('连接的 WS 地址（来自 ENV）:', wsUrl);
    const ws = new WebSocket(wsUrl); // 走 Java 中转
    socketRef.current = ws;

    ws.onopen = () => console.log('✅ WebSocket 连接已建立');
    ws.onerror = (e) => console.error('WebSocket 错误：', e);
    ws.onclose = () => console.log('WebSocket 连接已关闭');
    ws.onmessage = (e) => {
      console.log('收到执行结果：', e.data);
      setConsoleOutput(e.data);
    };

    return () => ws.close();
  }, []);

  /* 首次进入 & 读取本地存储 */
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedEditor');
    if (!hasVisited) {
      setShowTeachingModal(true);
      localStorage.setItem('hasVisitedEditor', 'true');
    }

    const savedCrystals = localStorage.getItem('crystalCount');
    if (savedCrystals) {
      setCrystalCount(parseInt(savedCrystals));
    }
  }, []);

  /* 增加水晶 */
  const handleCrystalAdd = (amount: number) => {
    const newCount = crystalCount + amount;
    setCrystalCount(newCount);
    localStorage.setItem('crystalCount', newCount.toString());
  };

  /* 发送代码到后端 */
  function sendCode() {
    const editorEl = document.getElementById('editor') as HTMLTextAreaElement | null;
    if (!editorEl) return;

    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      alert('WebSocket 未连接好');
      return;
    }

    const message = {
      mode: 'raw',
      hidden_code: '',
      student_code: editorEl.value,
    };
    socketRef.current.send(JSON.stringify(message));
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 font-comic flex flex-col"
      style={{ fontFamily: 'Comic Sans MS, Comic Sans, cursive' }}
    >
      <Header />
      <main className="container mx-auto px-4 flex-1 pb-32">
        <div className="flex flex-col lg:flex-row gap-4 pt-2 min-h-[calc(85vh-200px)] relative">
          {/* 代码编辑区 */}
          <div className={`flex flex-col min-w-0 ${isFullscreen ? 'w-full' : 'w-full lg:w-8/12'}`}>
            <div className="mb-2">
              <MotivationPanel crystalCount={crystalCount} onCrystalAdd={handleCrystalAdd} />
            </div>
            <div className="flex-1 min-h-[400px] relative">
              <CodeEditor
                onToggleAITools={() => setShowAITools(!showAITools)}
                isFullscreen={isFullscreen}
                onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
                setShowAITools={setShowAITools}
                /* 运行结果回调 ↓ */
                setImageData={setImageData}
                consoleOutput={consoleOutput}
                setConsoleOutput={setConsoleOutput}
              />
              {showAITools && <AITools onClose={() => setShowAITools(false)} />}
            </div>
          </div>

          {/* 运行结果区 */}
          {!isFullscreen && (
            <div className="w-full lg:w-4/12 flex flex-col min-w-0">
              <div className="h-full" style={{ overflow: 'hidden' }}>
                <TeachingPanel output={consoleOutput} imageData={imageData} />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 课前教学弹框 */}
      {showTeachingModal && <TeachingModal onQuizSuccess={() => handleCrystalAdd(5)} />}

      {/* 悬浮反馈按钮 */}
      <motion.div
        className="fixed bottom-8 right-8 z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <button
          className="w-14 h-14 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-xl"
          onClick={() => setShowFeedback(true)}
        >
          <i className="fa-solid fa-envelope text-xl"></i>
        </button>
      </motion.div>

      {/* 反馈弹窗 */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-xl p-6 w-full max-w-md"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <h3 className="text-xl font-bold mb-4">反馈意见</h3>
            <textarea
              className="w-full h-32 p-3 border rounded-lg mb-4"
              placeholder="请输入您的反馈..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 bg-gray-200 rounded-lg" onClick={() => setShowFeedback(false)}>
                取消
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                onClick={() => {
                  alert('感谢您的反馈！');
                  setShowFeedback(false);
                }}
              >
                提交
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}
