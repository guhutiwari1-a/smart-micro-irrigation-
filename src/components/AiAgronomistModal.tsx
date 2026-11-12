/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User, Volume2, Share2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { LanguageMode } from '../types/irrigation';

interface AiAgronomistModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageMode;
  onPlayAudioAdvice: (text: string) => void;
  farmContext: {
    locationName: string;
    kisanName: string;
    avgMoisture: number;
    waterTableDepthFeet: number;
    alertLevel: string;
    crops: string[];
  };
}

interface Message {
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export const AiAgronomistModal: React.FC<AiAgronomistModalProps> = ({
  isOpen,
  onClose,
  language,
  onPlayAudioAdvice,
  farmContext,
}) => {
  const isHindi = language === 'hi';

  const initialGreeting = isHindi
    ? `नमस्ते ${farmContext.kisanName} जी! मैं आपका हाइड्रोसेंस AI कृषि सलाहकार हूँ। आपके खेत (${farmContext.locationName}) में टमाटर के खेत में नमी 17% (कम) है, जबकि बोरवेल जल स्तर ${farmContext.waterTableDepthFeet} फीट पर सुरक्षित है। आज आप फसल सिंचाई या बोरवेल सुरक्षा के बारे में क्या पूछना चाहते हैं?`
    : `Hello ${farmContext.kisanName}! I am your HydroSense AI Agronomist for ${farmContext.locationName}. Sector B (Tomato) has low root moisture (17%), while your borewell water table is at ${farmContext.waterTableDepthFeet} feet (${farmContext.alertLevel}). How can I help you today?`;

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: initialGreeting,
      time: 'Just now',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  if (!isOpen) return null;

  const quickPromptsHindi = [
    '35°C धूप में टमाटर को कब पानी दें?',
    'बोरवेल में पानी कम हो रहा है, क्या उपाय करें?',
    'ड्रिप में घुलनशील NPK खाद कैसे दें?',
  ];

  const quickPromptsEnglish = [
    'How should I schedule drip in 35°C heat?',
    'How to prevent borewell water table depletion?',
    'How to dose NPK fertilizer through drip lines?',
  ];

  const quickPrompts = isHindi ? quickPromptsHindi : quickPromptsEnglish;

  const handleSend = async (userText: string) => {
    if (!userText.trim()) return;

    const newMsg: Message = {
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputQuery('');
    setIsThinking(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY || (window as any).GEMINI_API_KEY;
      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are a friendly Indian agricultural agronomist and hydrogeologist advisor for rural farmers using HydroSense AI.
Farmer details:
- Name: ${farmContext.kisanName}
- Location: ${farmContext.locationName}
- Crops: ${farmContext.crops.join(', ')}
- Borewell water depth: ${farmContext.waterTableDepthFeet} feet
- Language preference: ${isHindi ? 'Hindi (हिंदी)' : 'English'}

Farmer asked: "${userText}"

Reply concisely (under 120 words) in ${isHindi ? 'simple, warm, respectful Hindi with practical rural agricultural advice' : 'simple, clear English with practical advice'}. Mention drip pulse timings, straw mulch, or borewell protection.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const reply = response.text || (isHindi ? 'सिंचाई सलाह तैयार की गई।' : 'Advisory generated.');
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        setTimeout(() => {
          let reply = '';
          const lower = userText.toLowerCase();
          if (isHindi) {
            if (lower.includes('धूप') || lower.includes('35') || lower.includes('गर्मी') || lower.includes('टमाटर')) {
              reply = '35°C तापमान में टमाटर को केवल सुबह 05:30 से 07:30 बजे या शाम 6:30 बजे ही 25 मिनट ड्रिप से पानी दें। दोपहर में पानी देने से 40% पानी भाप बन जाता है और तना झुलस सकता है। पौधों की जड़ों के पास सूखी घास या प्लास्टिक मल्च अवश्य लगाएं।';
            } else if (lower.includes('बोरवेल') || lower.includes('भूजल') || lower.includes('पानी कम')) {
              reply = 'बोरवेल जल स्तर को बचाने के लिए: 1) मोटर को लगातार 8 घंटे चलाने के बजाय 2-2 घंटे के अंतराल पर चलाएं। 2) खुली नाली के स्थान पर 100% ड्रिप अपनाएं। 3) खेत के ढलान पर सोक-पिट (Recharge Pit) बनाएं जिससे बारिश का पानी सीधे बोरवेल एक्विफर में पहुंचे।';
            } else if (lower.includes('खाद') || lower.includes('npk') || lower.includes('फर्टिगेशन')) {
              reply = 'ड्रिप से खाद देते समय पहले 10 मिनट सादा पानी चलाएं, फिर वेंचुरी से NPK 19:19:19 या 0:52:34 का घोल 20 मिनट तक दें, और अंत में 10 मिनट दोबारा सादा पानी चलाकर पाइप को पूरी तरह साफ रखें ताकि ड्रिपर चोक न हों।';
            } else {
              reply = `आपके ${farmContext.crops.join(', ')} के लिए सलाह: ड्रिप लाइन का प्रेशर 2.0 से 2.2 बार रखें। इससे पानी हर पौधे तक एक समान पहुंचेगा और बिजली की 30% बचत होगी।`;
            }
          } else {
            if (lower.includes('heat') || lower.includes('35') || lower.includes('tomato')) {
              reply = 'In 35°C heat, schedule your drip irrigation strictly between 05:30 AM and 07:30 AM (or post 6:30 PM). Midday watering causes rapid vapor loss and stem scald. Organic straw mulching is highly recommended to retain moisture.';
            } else if (lower.includes('borewell') || lower.includes('depletion')) {
              reply = 'To protect your borewell: 1) Replace continuous 8-hour pumping with split 2-hour cycles. 2) Switch completely to micro-drip. 3) Construct a farm percolation recharge trench to feed monsoon runoff back into the aquifer.';
            } else {
              reply = 'Ensure your drip lateral pressure is regulated at 2.1 bar for uniform emitter discharge and zero pump overload.';
            }
          }

          setMessages((prev) => [
            ...prev,
            {
              sender: 'ai',
              text: reply,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }, 500);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: isHindi
            ? 'सलाह: सुबह 05:30 बजे ड्रिप चलाएं और बोरवेल मोटर को अनावश्यक देर तक न चलने दें।'
            : 'Advice: Run drip cycles at 05:30 AM and restrict pump runtimes to avoid aquifer drawdown.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleShareAdvice = (text: string) => {
    const waText = `*कृषि वैज्ञानिक सलाह (HydroSense AI)*\n${text}\n- रामेश्वर पाटिल, नासिक`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-slate-950/80 backdrop-blur">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-4 md:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isHindi ? 'AI कृषि वैज्ञानिक व सलाहकार' : 'AI Agronomist Advisor'}
              </h3>
              <p className="text-xs text-slate-400">
                {farmContext.kisanName} • {farmContext.locationName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto space-y-3 p-1 max-h-96 pr-2">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-300 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-2 ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                }`}
              >
                <p>{m.text}</p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
                  <span>{m.time}</span>
                  {m.sender === 'ai' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onPlayAudioAdvice(m.text)}
                        className="hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
                        title="आवाज़ में सुनें"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{isHindi ? 'सुनें' : 'Listen'}</span>
                      </button>
                      <button
                        onClick={() => handleShareAdvice(m.text)}
                        className="hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
                        title="WhatsApp शेयर"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center gap-2 text-xs text-slate-400 pl-10">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
              <span>{isHindi ? 'कृषि सलाह तैयार हो रही है...' : 'Analyzing crop parameters...'}</span>
            </div>
          )}
        </div>

        {/* Quick Question Prompts */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] text-slate-400 font-bold block">
            {isHindi ? 'सुझाए गए प्रश्न:' : 'Common Farmer Questions:'}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="text-xs px-3 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-slate-300 hover:text-emerald-300 hover:border-emerald-600 transition-colors cursor-pointer text-left"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(inputQuery)}
            placeholder={isHindi ? 'फसल, ड्रिप समय, या बोरवेल से जुड़ा सवाल पूछें...' : 'Ask about irrigation schedules, mulch, or borewell...'}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={() => handleSend(inputQuery)}
            disabled={!inputQuery.trim() || isThinking}
            className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition-colors cursor-pointer"
            aria-label="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
