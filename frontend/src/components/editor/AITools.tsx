import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { aiInteractions } from '@/data/editorMock';

interface AIToolsProps {
  onClose: () => void;
}

export default function AITools({ onClose }: AIToolsProps) {
  const aiAvatar = 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=Friendly%20AI%20assistant%20avatar%2C%20cartoon%20style&sign=ec87195e75ac4ccbb9102167d1048036';
  const userAvatar = 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=Child%20user%20avatar%2C%20cartoon%20style&sign=da734dcffa5a222f1a52a58e3e503871';
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState(aiInteractions);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      const newMessage = {
        type: 'question',
        content: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      
      // 模拟AI回复
      setTimeout(() => {
        const reply = {
          type: 'answer',
          content: `这是对"${message}"的模拟回复`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, reply]);
      }, 1000);
    }
  };

  const startVoiceInput = () => {
    setIsListening(true);
    // 模拟语音输入
    setTimeout(() => {
      setMessage('这是模拟的语音输入内容');
    }, 2000);
  };

  return (
    <motion.div 
      className="absolute right-0 top-[87px] h-[65vh] rounded-tl-lg rounded-bl-lg rounded-br-lg rounded-tr-none bg-white shadow-lg w-[280px] z-40 flex flex-col overflow-hidden"
      /* 保持原有位置参数不变 */
    >
       <div className="bg-purple-600 text-white p-4 flex justify-between items-center h-11">
        <h3 className="text-xl font-bold">AI 助手</h3>
        <button 
          onClick={onClose}
          className="text-white hover:text-orange-300"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>
      
       <div ref={chatContainerRef} className="p-2 flex-1 overflow-y-auto space-y-2">
         {messages.map((interaction, index) => (
           <div key={index} className={`flex ${interaction.type === 'question' ? 'justify-end' : 'justify-start'}`}>
             <div className="flex max-w-[80%] gap-2">
               {interaction.type === 'answer' && (
                <img 
                  src={aiAvatar}
                  alt="AI头像"
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
               <div className={`p-3 rounded-lg ${interaction.type === 'question' ? 'bg-blue-100 rounded-tr-none' : 'bg-purple-100 rounded-tl-none'}`}>
                <p className="text-sm">{interaction.content}</p>
              </div>
              {interaction.type === 'question' && (
                <img 
                  src={userAvatar}
                  alt="用户头像"
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
            </div>
          </div>
        ))}
      </div>

       {/* 输入区域 - 整合到对话框主体中 */}
       <div className="p-3 bg-white border-t">
         {/* 添加border-t使输入框与对话框视觉上更整合 */}
         <div className="flex items-center gap-2 w-full">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="输入消息..."
             className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 min-w-0"
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
              <button 
                onClick={() => {
                  if (isListening) {
                    setIsListening(false);
                    // 这里可以添加停止录音的逻辑
                  } else {
                    startVoiceInput();
                  }
                }}
                className={`w-10 h-10 rounded-full flex-shrink-0 ${isListening ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                aria-label="语音输入"
              >
                <i className={`fa-solid ${isListening ? 'fa-stop' : 'fa-microphone'}`}></i>
              </button>
          <button 
            onClick={handleSend}
             className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0"
            aria-label="发送消息"
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </motion.div>
  );
}