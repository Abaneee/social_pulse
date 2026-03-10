import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, User, Bot, Volume2, VolumeX, X, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const VoiceAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    const synth = window.speechSynthesis;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchHistory = async () => {
        try {
            const response = await api.get('/chat/');
            setMessages(response.data);
        } catch (err) {
            console.error("Failed to fetch chat history", err);
        }
    };

    const speak = (text) => {
        if (!synth) return;
        synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        synth.speak(utterance);
    };

    const handleSendMessage = async (text = input) => {
        const query = text.trim();
        if (!query) return;

        setMessages(prev => [...prev, { role: 'user', content: query }]);
        setInput('');
        setLoading(true);

        try {
            const response = await api.post('/chat/', { query });
            const aiResponse = response.data.response;
            setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
            speak(aiResponse);
        } catch (err) {
            console.error("Chat error", err);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error connecting to the AI services." }]);
        } finally {
            setLoading(false);
        }
    };

    const startListening = () => {
        if (!recognition) {
            alert("Speech recognition not supported in this browser.");
            return;
        }

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            handleSendMessage(transcript);
        };

        recognition.start();
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-slate-900/95 border border-cyan-500/30 rounded-2xl shadow-2xl flex flex-col backdrop-blur-xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-cyan-500/10">
                            <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                                <Bot size={20} />
                                <span>Pulse AI Assistant</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl flex gap-2 ${msg.role === 'user'
                                        ? 'bg-cyan-600 text-white rounded-tr-none'
                                        : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                                        }`}>
                                        {msg.role === 'assistant' && <Bot size={16} className="shrink-0 mt-1" />}
                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                        {msg.role === 'user' && <User size={16} className="shrink-0 mt-1" />}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700 text-cyan-400 animate-pulse">
                                        AI is thinking...
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
                            <div className="flex gap-2">
                                <button
                                    onClick={isListening ? () => { } : startListening}
                                    className={`p-2 rounded-xl transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-800 text-cyan-400 hover:bg-slate-700'}`}
                                >
                                    {isListening ? <Mic size={20} /> : <MicOff size={20} />}
                                </button>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Ask about your data..."
                                    className="flex-1 bg-slate-800 rounded-xl px-4 py-2 text-sm text-white border border-slate-700 focus:outline-none focus:border-cyan-500 transition-colors"
                                />
                                <button
                                    onClick={() => handleSendMessage()}
                                    className="p-2 bg-cyan-600 rounded-xl text-white hover:bg-cyan-500 transition-colors"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="w-14 h-14 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-cyan-500/20"
                    >
                        <MessageSquare size={28} />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VoiceAssistant;
