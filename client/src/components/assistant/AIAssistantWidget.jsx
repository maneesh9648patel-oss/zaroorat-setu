import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, Sparkles, X, Send, Mic, MicOff, Volume2, VolumeX, ArrowRight, 
  MessageSquare, HelpCircle, Heart, PhoneCall, BookOpen, Utensils, Cpu, ShieldCheck, Play
} from 'lucide-react';
import BrandLogo from '../common/BrandLogo';
import { useLanguage } from '../../contexts/LanguageContext';

export default function AIAssistantWidget({ isOpen: propIsOpen, onClose: propOnClose, onOpen: propOnOpen }) {
  const navigate = useNavigate();
  const { language, currentSpeechLang, currentDialect, t } = useLanguage();

  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = propIsOpen !== undefined ? propIsOpen : internalOpen;

  const handleOpen = () => {
    if (propOnOpen) propOnOpen();
    else setInternalOpen(true);
  };

  const handleClose = () => {
    handleStopTTS();
    if (propOnClose) propOnClose();
    else setInternalOpen(false);
  };

  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const [isSpeakingTTS, setIsSpeakingTTS] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: "नमस्ते! मैं 'सेतु साथी' (Setu Sahayak) हूँ — ZarooratSetu का AI सहायक। बांदा और REC Banda क्षेत्र में आवश्यक संसाधनों (किताबें, कैलकुलेटर, बर्तन, टूल्स) या आपातकालीन रक्त सहायता के बारे में मुझसे पूछें या नीचे दिए विकल्पों पर टैप करें।",
      suggestions: [
        "🩸 मुझे इमरजेंसी ब्लड या मेडिकल सहायता चाहिए",
        "📚 Casio कैलकुलेटर या B.Tech बुक्स उधार लेनी हैं",
        "🍲 शादी/कार्यक्रम के लिए 50L पतीला और थाली सेट",
        "📞 बिना इंटरनेट मिस्ड कॉल से कैसे सहायता लें?"
      ],
      time: "Just now"
    }
  ]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Read aloud via Web Speech API Text-to-Speech
  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (!text) {
      setIsSpeakingTTS(false);
      return;
    }

    try {
      const cleanText = text.replace(/[*_#]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = currentSpeechLang || 'hi-IN';
      utterance.rate = 0.95;

      utterance.onstart = () => setIsSpeakingTTS(true);
      utterance.onend = () => setIsSpeakingTTS(false);
      utterance.onerror = () => setIsSpeakingTTS(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS error:", e);
      setIsSpeakingTTS(false);
    }
  };

  const handleStopTTS = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeakingTTS(false);
  };

  // Speech-to-Text via Web Speech API
  const handleToggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setSpeechError("Speech recognition not supported in your browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = currentSpeechLang || 'hi-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
        // Automatically send after voice capture
        handleSendMessage(transcript);
      };

      recognition.onerror = () => {
        setSpeechError("Mic input error. You can type your question.");
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setSpeechError("Could not start microphone.");
      setIsListening(false);
    }
  };

  // Smart local conversational responder
  const getSmartLocalResponse = (query) => {
    const text = (query || '').toLowerCase();

    if (text.includes('blood') || text.includes('khoon') || text.includes('ब्लड') || text.includes('खून') || text.includes('hospital') || text.includes('अस्पताल') || text.includes('dawa') || text.includes('emergency')) {
      return {
        reply: "यदि आपको आपातकालीन रक्त (जैसे B+, O+ आदि) या जीवनरक्षक चिकित्सा सहायता चाहिए, तो जिला अस्पताल बांदा (District Hospital) और सिविल लाइन्स नेटवर्क में पंजीकृत दाताओं से तुरंत संपर्क किया जा सकता है। आप तुरंत 'Emergency' श्रेणी में अनुरोध दर्ज करें।",
        suggestions: ["आपातकालीन रक्त अनुरोध दर्ज करें", "जिला अस्पताल बांदा हेल्पलाइन क्या है?"],
        actionLink: { label: "तत्काल आपातकालीन अनुरोध दर्ज करें", path: "/new-request", state: { prefilled: { category: "Medical", urgency: "Urgent" } } }
      };
    }

    if (text.includes('calculator') || text.includes('कैलकुलेटर') || text.includes('casio') || text.includes('book') || text.includes('kitab') || text.includes('किताब') || text.includes('exam') || text.includes('परीक्षा')) {
      return {
        reply: "REC Banda मेकर क्लब और छात्र स्वयंसेवकों द्वारा Casio fx-991EX साइंटिफिक कैलकुलेटर, B.Tech इंजीनियरिंग बुक्स (Sem 1-4), UPPSC सिविल सेवा नोट्स और मिनी-ड्राफ्टर पूरी तरह निःशुल्क उधार उपलब्ध हैं।",
        suggestions: ["Casio fx-991EX कैलकुलेटर देखना है", "इंजीनियरिंग बुक्स सेट उधार लेना है"],
        actionLink: { label: "पढ़ाई सामग्री कैटलॉग खोलें", path: "/borrow-return", state: { activeCategory: "Study Material" } }
      };
    }

    if (text.includes('patila') || text.includes('पतीला') || text.includes('bartan') || text.includes('बर्तन') || text.includes('thali') || text.includes('थाली') || text.includes('kadhai') || text.includes('शादी')) {
      return {
        reply: "पारिवारिक व सामुदायिक आयोजनों के लिए बांदा कम्युनिटी किचन द्वारा 50 लीटर का बड़ा एल्युमीनियम पतीला (देग), 50 थाली-कटोरी-गिलास सेट, भारी कड़ाही और 25L पानी का कैंपर उधार उपलब्ध है। प्रयोग के बाद स्वच्छ करके वापस करें।",
        suggestions: ["50L बड़ा पतीला उधार कैसे लें?", "50 थाली सेट उपलब्ध है क्या?"],
        actionLink: { label: "पारिवारिक बर्तन कैटलॉग देखें", path: "/borrow-return", state: { activeCategory: "Family Utensils" } }
      };
    }

    if (text.includes('solar') || text.includes('सोलर') || text.includes('लालटेन') || text.includes('tool') || text.includes('multimeter') || text.includes('उपकरण')) {
      return {
        reply: "इलेक्ट्रॉनिक्स व टूल्स पूल में सोल्डरिंग स्टेशन, डिजिटल मल्टीमीटर, 20 घंटे बैकअप वाली सोलर इमरजेंसी लालटेन, नेबुलाइज़र मशीन और पोर्टेबल फुल एचडी प्रोजेक्टर उपलब्ध हैं।",
        suggestions: ["सोलर इमरजेंसी लालटेन देखना है", "डिजिटल मल्टीमीटर व सोल्डरिंग किट"],
        actionLink: { label: "इलेक्ट्रॉनिक्स व टूल्स देखें", path: "/borrow-return", state: { activeCategory: "Electronics" } }
      };
    }

    if (text.includes('offline') || text.includes('missed') || text.includes('call') || text.includes('sms') || text.includes('internet') || text.includes('मिस्ड') || text.includes('कॉल') || text.includes('इंटरनेट')) {
      return {
        reply: "जिन नागरिकों के पास स्मार्टफ़ोन या इंटरनेट नहीं है, वे टोल-फ्री 1800-ZAROORAT पर एक मिस्ड कॉल या एसएमएस दे सकते हैं। हमारा ऑटोमेटेड वेबहुक टिकट जनरेट करता है और बांदा के स्थानीय स्वयंसेवक उन्हें कॉल-बैक करके ज़रूरत दर्ज करते हैं।",
        suggestions: ["स्वयंसेवक सहायता डेस्क खोलें", "टोल-फ्री नंबर क्या है?"],
        actionLink: { label: "ऑफलाइन सहायता डेस्क खोलें", path: "/volunteer-assist" }
      };
    }

    return {
      reply: "नमस्ते! मैं 'सेतु साथी' (Setu Sahayak) हूँ — ZarooratSetu का AI सहायक। REC Banda और आस-पास के क्षेत्रों में आवश्यक सामग्री (किताबें, कैलकुलेटर, बर्तन, टूल्स, रक्त) के लिए आप सीधे नई ज़रूरत दर्ज कर सकते हैं या कैटलॉग देख सकते हैं।",
      suggestions: ["नई ज़रूरत दर्ज करें", "सामग्री कैटलॉग देखें", "ऑफलाइन 1800-ZAROORAT"],
      actionLink: { label: "नई ज़रूरत दर्ज करें", path: "/new-request" }
    };
  };

  // Send message to backend or local AI Assistant service
  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          language: language || 'hi',
          history: messages.slice(-4).map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      if (!response.ok) throw new Error("API route not reachable");
      const data = await response.json();

      if (data && data.success) {
        const assistantMsg = {
          id: `ast_${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
          suggestions: data.suggestions || [],
          actionLink: data.actionLink || null,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, assistantMsg]);
        if (ttsEnabled) {
          speakText(data.reply);
        }
      } else {
        throw new Error(data?.error || "AI reply error");
      }
    } catch (err) {
      // Instant intelligent fallback
      const localResp = getSmartLocalResponse(text);
      const assistantMsg = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        text: localResp.reply,
        suggestions: localResp.suggestions || [],
        actionLink: localResp.actionLink || null,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
      if (ttsEnabled) {
        speakText(localResp.reply);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FLOATING TRIGGER BUTTON (Always visible at bottom-right) */}
      {!isOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50">
          <button
            onClick={handleOpen}
            className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-terracotta to-terracotta-hover text-white shadow-2xl hover:scale-105 active:scale-95 transition border-2 border-white/20 group"
            title="Open ZarooratSetu AI Assistant (सेतु साथी)"
            aria-label="AI Assistant"
          >
            <div className="relative">
              <Sparkles className="w-5 h-5 text-softYellow animate-spin-slow" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-teal ring-2 ring-white animate-pulse" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-[11px] font-black tracking-wide leading-none text-white">
                AI सेतु साथी
              </div>
              <div className="text-[9px] text-softYellow font-bold mt-0.5">
                24/7 Sahayak (Run)
              </div>
            </div>
          </button>
        </div>
      )}

      {/* CHAT PANEL MODAL / DRAWER */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[95vw] sm:w-[440px] max-h-[85vh] sm:max-h-[640px] flex flex-col bg-white rounded-3xl shadow-[0_12px_48px_rgba(43,27,16,0.35)] border border-darkbrown/15 overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-darkbrown text-cream p-4 flex items-center justify-between shrink-0 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <BrandLogo size="sm" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-teal border-2 border-darkbrown" />
              </div>
              <div>
                <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                  <span>सेतु साथी (Setu Sahayak)</span>
                  <span className="px-2 py-0.2 rounded-full bg-softYellow/20 text-softYellow text-[9px] font-extrabold border border-softYellow/30">
                    AI Live
                  </span>
                </h3>
                <p className="text-[10px] text-cream/70 font-semibold">
                  24/7 Voice & Chat Assistant · REC Banda
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* TTS Audio toggle */}
              <button
                onClick={() => {
                  if (isSpeakingTTS) handleStopTTS();
                  setTtsEnabled(!ttsEnabled);
                }}
                className={`p-1.5 rounded-xl transition ${
                  ttsEnabled ? 'text-softYellow hover:bg-white/10' : 'text-cream/40 hover:bg-white/10'
                }`}
                title={ttsEnabled ? "Voice readout enabled (बोलकर सुनाएगा)" : "Voice readout disabled"}
              >
                {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="p-1.5 rounded-xl text-cream/70 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Category Chips Strip */}
          <div className="bg-cream/70 px-3 py-2 border-b border-darkbrown/10 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar shrink-0">
            <button
              onClick={() => handleSendMessage("मुझे जिला अस्पताल बांदा में इमरजेंसी ब्लड या दवा चाहिए")}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-terracotta hover:text-white text-darkbrown font-bold border border-darkbrown/10 shrink-0 transition flex items-center gap-1"
            >
              <span>🩸</span> <span>इमरजेंसी ब्लड</span>
            </button>
            <button
              onClick={() => handleSendMessage("मुझे एग्जाम के लिए Casio fx-991EX कैलकुलेटर व किताबें चाहिए")}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-teal hover:text-white text-darkbrown font-bold border border-darkbrown/10 shrink-0 transition flex items-center gap-1"
            >
              <span>📚</span> <span>कैलकुलेटर / किताबें</span>
            </button>
            <button
              onClick={() => handleSendMessage("शादी या कार्यक्रम के लिए बड़ा पतीला और 50 थाली सेट चाहिए")}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-darkbrown hover:text-cream text-darkbrown font-bold border border-darkbrown/10 shrink-0 transition flex items-center gap-1"
            >
              <span>🍲</span> <span>बर्तन (पतीला/थाली)</span>
            </button>
            <button
              onClick={() => handleSendMessage("बिना इंटरनेट मिस्ड कॉल और एसएमएस से सहायता कैसे मिलेगी?")}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-terracotta hover:text-white text-darkbrown font-bold border border-darkbrown/10 shrink-0 transition flex items-center gap-1"
            >
              <span>📞</span> <span>बिना इंटरनेट मदद</span>
            </button>
          </div>

          {/* Messages Stream Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-cream/20 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-3xl space-y-2 shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-terracotta text-white rounded-br-none'
                      : 'bg-white text-darkbrown border border-darkbrown/10 rounded-bl-none'
                  }`}
                >
                  <div className="leading-relaxed font-medium">
                    {msg.text}
                  </div>

                  {/* Action Link Button if provided */}
                  {msg.actionLink && (
                    <div className="pt-1.5 border-t border-darkbrown/10">
                      <button
                        onClick={() => {
                          handleClose();
                          navigate(msg.actionLink.path, { state: msg.actionLink.state });
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-teal hover:bg-teal-hover text-white font-extrabold text-[11px] shadow-sm transition flex items-center justify-center gap-1.5"
                      >
                        <span>{msg.actionLink.label}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Read Aloud button on assistant messages */}
                  {msg.sender === 'assistant' && (
                    <div className="flex items-center justify-between pt-1 text-[10px] text-darkbrown/50">
                      <button
                        onClick={() => speakText(msg.text)}
                        className="flex items-center gap-1 font-bold text-teal hover:underline"
                        title="Read aloud"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>सुने (Listen)</span>
                      </button>
                      <span>{msg.time}</span>
                    </div>
                  )}
                </div>

                {/* Quick suggestions bubbles */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                    {msg.suggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(sug)}
                        className="text-[11px] py-1 px-2.5 rounded-full bg-white hover:bg-cream-dark text-darkbrown font-semibold border border-darkbrown/15 shadow-2xs transition text-left"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-darkbrown/60 p-2.5 bg-white rounded-2xl border border-darkbrown/10 w-fit">
                <Sparkles className="w-4 h-4 text-terracotta animate-spin" />
                <span className="font-semibold">सेतु साथी सोच रहा है...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Speech error indicator */}
          {speechError && (
            <div className="px-3 py-1 bg-amber-100 text-amber-900 text-[10px] font-semibold border-t border-amber-200">
              {speechError}
            </div>
          )}

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-darkbrown/10 flex items-center gap-2 shrink-0"
          >
            {/* Mic speech-to-text trigger */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-2.5 rounded-2xl transition ${
                isListening
                  ? 'bg-terracotta text-white mic-listening'
                  : 'bg-cream text-terracotta hover:bg-terracotta hover:text-white border border-terracotta/20'
              }`}
              title="Speak in Hindi/English (बोलकर पूछें)"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Text input */}
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="अपनी ज़रूरत पूछें (उदा. कैलकुलेटर, पतीला, रक्त)..."
              className="flex-1 px-3.5 py-2.5 rounded-2xl border border-darkbrown/15 bg-cream/30 text-xs font-semibold text-darkbrown outline-none focus:ring-2 focus:ring-terracotta transition"
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="p-2.5 rounded-2xl bg-terracotta disabled:opacity-40 hover:bg-terracotta-hover text-white transition shadow-sm"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
