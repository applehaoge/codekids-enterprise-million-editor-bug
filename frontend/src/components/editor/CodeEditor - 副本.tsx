import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { codeExamples, codeCompletions } from '@/data/editorMock';
import AITools from '@/components/editor/AITools';
import ProgrammingHelper from '@/components/editor/ProgrammingHelper';
import { coursesAPI } from '@/api/courses';

// 显示
interface CodeEditorProps {
  onToggleAITools: () => void;
  setShowAITools: (show: boolean) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  setImageData: (data: string) => void;  // ✅ 添加这个
  consoleOutput: string;                     // 父组件传进来的控制台文本
  setConsoleOutput: (s: string) => void;     // 父组件的更新回调
}

export default function CodeEditor({ 
  onToggleAITools, 
  setShowAITools,
  isFullscreen,
  onToggleFullscreen,
  setImageData,
  consoleOutput,       // 新增
  setConsoleOutput,    // 新增
}: CodeEditorProps) {
  const [code, setCode] = useState(() => {
    const savedCode = localStorage.getItem('savedCode');
    return savedCode || codeExamples[0].code;
  });

  const [activeExample, setActiveExample] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [showProgrammingHelper, setShowProgrammingHelper] = useState(false);
  const [isChineseInput, setIsChineseInput] = useState(false);
 // WebSocket 句柄
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // 清理 WebSocket 连接
    return () => {
      if (wsRef.current) {
        console.log("关闭 WebSocket 连接");
        wsRef.current.close();
      }
    };
  }, []);

  const handleRunWS = () => {
    // 若已有连接，先断开
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
      console.log("现有 WebSocket 连接已关闭");
    }

    setShowConsole(true);
    setConsoleOutput('正在连接 WebSocket ...');

    // 创建新的 WebSocket 连接
    const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${import.meta.env.VITE_WS_HOST || 'localhost'}:${import.meta.env.VITE_WS_PORT || 5000}${import.meta.env.VITE_WS_PATH || '/ws'}`);
    wsRef.current = ws;

    // WebSocket 连接成功时
    ws.onopen = () => {
      console.log('WebSocket 连接成功');
      setConsoleOutput('连接成功，开始运行 ...');
      ws.send(JSON.stringify({ mode: 'raw', hidden_code: '', student_code: code }));
    };

    // WebSocket 消息接收
    ws.onmessage = (e) => {
      console.log('收到 WebSocket 消息：', e.data); // 增加调试输出
      let msg: any = {};
      try {
        msg = JSON.parse(e.data as string);
      } catch (error) {
        console.error('消息解析失败：', error);  // 增加解析错误处理
        setConsoleOutput((p) => p + '\n' + e.data);
        return;
      }

      if (msg.status === 'success') {
        setConsoleOutput((p) => p + '\n' + msg.data);
        if (msg.image) setImageData(msg.image);
      } else if (msg.status === 'error') {
        setConsoleOutput((p) => p + '\n[错误] ' + msg.data);
      }
    };

    // WebSocket 错误处理
    ws.onerror = (err) => {
      console.error('WebSocket 错误：', err);
      setConsoleOutput('WebSocket 错误：' + (err.message || err));

      // 错误时尝试重连
      if (ws.readyState === WebSocket.CLOSED) {
        console.log("WebSocket 已关闭，正在尝试重新连接...");
        setTimeout(handleRunWS, 3000);  // 3秒后重试
      }
    };

    // WebSocket 关闭时
    ws.onclose = () => {
      console.log('WebSocket 连接已关闭');
      setConsoleOutput('WebSocket 连接已关闭');

      // 尝试重新连接
      if (ws.readyState === WebSocket.CLOSED) {
        console.log("WebSocket 已关闭，正在尝试重新连接...");
        setTimeout(handleRunWS, 3000);  // 3秒后重试
      }
    };
  };

  // 全屏切换功能
  const toggleFullscreen = () => {
    if (onToggleFullscreen) {
      onToggleFullscreen();
    }
  };


  return (
    <div className="flex flex-col gap-2 h-full relative min-h-[350px]">
      <motion.div 
        className="rounded-xl shadow-lg overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 relative flex-1"
        style={{ 
          position: 'relative',
          height: isFullscreen ? '100vh' : 'min-h-[300px]'
        }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white p-2 flex justify-between items-center">
          <h3 className="text-md font-bold">Python 编辑器</h3>
          <div className="flex items-center gap-2">
            <select 
              className="bg-blue-700 text-white rounded px-2 py-1 text-sm"
              value={activeExample}
              onChange={(e) => {
                setActiveExample(Number(e.target.value));
                setCode(codeExamples[Number(e.target.value)].code);
              }}
            >
              {codeExamples.map((example, index) => (
                <option key={example.id} value={index}>
                  {example.title}
                </option>
              ))}
            </select>
            <motion.button
              className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleFullscreen}
              title={isFullscreen ? "退出全屏" : "全屏"}
            >
              <i className={`fa-solid ${isFullscreen ? 'fa-minimize' : 'fa-maximize'}`}></i>
            </motion.button>
          </div>
        </div>

        {/* 工具栏 - 固定定位 */}
        <div className="bg-blue-100 p-1 flex gap-2 border-b sticky top-0 z-10">
          <motion.button
            className="flex items-center gap-1 bg-orange-500 text-white px-3 py-1 rounded-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRunWS}
          >
            <i className="fa-solid fa-rocket"></i>
            <span>运行</span>
          </motion.button>
          <motion.button
            className="flex items-center gap-1 bg-pink-500 text-white px-3 py-1 rounded-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={async () => {
              try {
                // 显示保存中状态
                const savePromise = coursesAPI.saveCode('current', code);

                toast.promise(savePromise, {
                  loading: '正在保存到服务器...',
                  success: () => {
                    // 保存成功后也更新本地存储
                    localStorage.setItem('savedCode', code);
                    return '代码已成功保存到云端';
                  },
                  error: (error) => {
                    // 保存失败时回退到本地存储
                    localStorage.setItem('savedCode', code);
                    return `云端保存失败: ${error.message || '未知错误'} (已保存到本地)`;
                  }
                });

                await savePromise;
              } catch (error) {
                console.error('保存代码出错:', error);
              }
            }}
          >
            <i className="fa-solid fa-heart"></i>
            <span>保存</span>
          </motion.button>
          <motion.button
            className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsChineseInput(!isChineseInput);
              setShowKeyboardHelp(true);
            }}
          >
            <i className={`fa-solid ${isChineseInput ? 'fa-language' : 'fa-keyboard'}`}></i>
            <span>{isChineseInput ? '中文' : '英文'}</span>
          </motion.button>
          <motion.button
            className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onToggleAITools()}
          >
            <i className="fa-solid fa-robot"></i>
            <span>AI助手</span>
          </motion.button>
          <motion.button
            className="flex items-center gap-1 bg-purple-500 text-white px-3 py-1 rounded-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowProgrammingHelper(true)}
          >
            <i className="fa-solid fa-search"></i>
            <span>编程助手</span>
          </motion.button>
        </div>

        {/* 代码编辑区 */}
        <div className="relative" style={{ height: isFullscreen ? 'calc(100vh - 80px)' : 'calc(100% - 40px)' }}>
          <div className="relative h-full" onClick={() => setShowSaveOptions(false)}>
            <textarea
              className="w-full h-full p-4 font-mono text-blue-900 bg-gradient-to-b from-blue-50 to-purple-50 overflow-y-auto"
              value={code}
              onChange={(e) => {
                const newCode = e.target.value;
                setCode(newCode);

                // 获取当前光标位置
                const cursorPos = e.target.selectionStart;
                const textBeforeCursor = newCode.substring(0, cursorPos);
                const lines = textBeforeCursor.split('\n');
                const currentLine = lines[lines.length - 1] || '';

                // 获取当前正在输入的单词
                const words = currentLine.split(/\s+/);
                const currentWord = words[words.length - 1] || '';

                // 严格触发条件：必须是字母开头且长度大于0
                const shouldShow = /^[a-zA-Z]/.test(currentWord) && currentWord.length > 0;
                setShowSuggestions(shouldShow);
              }}
              onFocus={() => {}}
              spellCheck="false"
            />
          </div>
        </div>

        {/* 代码补全建议 */}
        {showSuggestions && (
          <div className="absolute left-4 top-16 bg-white shadow-lg rounded-lg z-50 w-64 max-h-96 overflow-y-auto">
            {codeCompletions
              .map(category => ({
                ...category,
                items: category.items.filter(item => {
                  // 获取当前光标位置
                  const textarea = document.querySelector('textarea');
                  if (!textarea) return false;

                  const cursorPos = textarea.selectionStart;
                  const textBeforeCursor = code.substring(0, cursorPos);
                  const lines = textBeforeCursor.split('\n');
                  const currentLine = lines[lines.length - 1] || '';

                  // 获取当前正在输入的单词
                  const words = currentLine.split(/\s+/);
                  const currentWord = words[words.length - 1] || '';

                  // 当编辑器为空或当前单词为空，显示基础建议
                  if (!currentWord.trim()) {
                    return true;
                  }

                  // 严格匹配：必须是字母开头且当前单词是补全项的前缀
                  return /^[a-zA-Z]/.test(currentWord) && 
                         item.keyword.toLowerCase().startsWith(currentWord.toLowerCase());
                })
              }))
              .filter(category => category.items.length > 0)
              .map((category, catIndex) => (
                <div key={catIndex} className="border-b border-gray-200 last:border-b-0">
                  <div className="px-3 py-2 bg-blue-50 text-blue-800 font-bold">
                    {category.category}
                  </div>
                  {category.items.map((item, itemIndex) => (
                    <div 
                      key={itemIndex}
                      className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                      onClick={() => {
                        const textarea = document.querySelector('textarea');
                        if (!textarea) return;

                        const cursorPos = textarea.selectionStart;
                        const textBeforeCursor = code.substring(0, cursorPos);
                        const textAfterCursor = code.substring(cursorPos);

                        // 找到当前单词的起始位置 - 改进多行处理
                        let wordStart = cursorPos;
                        while (wordStart > 0) {
                          const prevChar = textBeforeCursor[wordStart - 1];
                          if (!/[a-zA-Z]/.test(prevChar)) break;
                          wordStart--;
                        }

                        // 确保不会跨行替换
                        const lineStart = textBeforeCursor.lastIndexOf('\n', cursorPos) + 1;
                        wordStart = Math.max(wordStart, lineStart);

                        // 构建新代码：替换当前单词
                        const newCode = 
                          textBeforeCursor.substring(0, wordStart) + 
                          item.keyword + 
                          textAfterCursor;
                          
                        setCode(newCode);
                        setShowSuggestions(false);

                        // 设置光标位置到插入内容之后
                        setTimeout(() => {
                          textarea.setSelectionRange(
                            wordStart + item.keyword.length,
                            wordStart + item.keyword.length
                          );
                          textarea.focus();
                        }, 0);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="font-mono text-blue-900">{item.keyword}</div>
                        <div className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                          {item.translation}
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const utterance = new SpeechSynthesisUtterance(item.keyword);
                            utterance.lang = 'en-US';
                            speechSynthesis.speak(utterance);
                          }}
                          className="text-blue-500 hover:text-orange-500"
                          title="朗读单词"
                        >
                          <i className="fa-solid fa-volume-high"></i>
                        </button>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{item.description}</div>
                    </div>
                  ))}
                </div>
              ))
            }
          </div>
        )}
      </motion.div>

      {/* 控制台面板 */}
      <AnimatePresence>
        {showConsole && (
          <motion.div 
            className="absolute bottom-0 left-0 right-0 rounded-t-xl shadow-lg overflow-hidden bg-white"
            style={{ width: '100%' }}
            initial={{ height: 0, opacity: 0, y: 100 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: 100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 text-white flex justify-between items-center">
              <h4 className="text-lg font-bold">控制台</h4>
              <div className="flex gap-2">
                <motion.button
                  className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowConsole(false)}
                >
                  <i className="fa-solid fa-minus"></i>
                </motion.button>
                <motion.button
                  className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowAITools(true)}
                >
                  <i className="fa-solid fa-robot"></i>
                </motion.button>
              </div>
            </div>
            <div className="p-4 h-40 overflow-auto font-mono text-sm bg-gray-100">
              <pre>{consoleOutput}</pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 键盘帮助提示 */}
      <AnimatePresence>
        {showKeyboardHelp && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-xl p-6 w-full max-w-md"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">如何切换输入法</h3>
                <button 
                  onClick={() => setShowKeyboardHelp(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="mb-4">
                <p className="mb-2 text-center text-lg font-bold text-red-500">请切换为英文符号</p>
                <p className="mb-2 text-center text-sm">切换输入法方式：</p>
                <p className="text-center">1. 按<kbd className="mx-1 px-2 py-1 bg-gray-200 rounded font-mono">Shift</kbd>键</p>
                <p className="text-center">2. 用鼠标点击右下角的中字</p>
              </div>
              <div className="flex justify-center">
                <img 
                  src="https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Cartoon%20style%20keyboard%20with%20orange%20highlighted%20Shift%20key%20and%20Chinese%20input%20switch%20button%20at%20bottom%20right%20corner%2C%20clean%20illustration%20style&sign=5ad9576a5319ee14ef575bde044cf92c"
                  alt="键盘示意图"
                  className="w-full rounded-lg border border-gray-200"
                />
              </div>
              <div className="mt-4 flex justify-center">
                <motion.button 
                  onClick={() => setShowKeyboardHelp(false)}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg font-bold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  好的，我明白了
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
