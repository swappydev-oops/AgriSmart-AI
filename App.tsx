import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getChatResponse } from './services/geminiService';
import type { User, UserProfile, BotType, Message, GovernmentScheme, TutorialVideo } from './types';
import { mockGovernmentSchemes, mockTutorialVideos } from './data/mockData';
import {
  LeafIcon, BugIcon, DollarSignIcon, CloudSunIcon,
  LogoutIcon, GlobeIcon, SendIcon, PaperclipIcon, XIcon,
  UserIcon, BotIcon, ArrowLeftIcon, PlayIcon
} from './components/Icons';
import { Chat } from '@google/genai';

type Language = 'en' | 'mr' | 'hi';
type View = 'auth' | 'dashboard' | 'chat';

// --- Auth Component ---
const AuthComponent: React.FC<{ onLogin: (user: UserProfile) => void }> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  
  // Login State
  const [loginMobile, setLoginMobile] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Registration State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regCountry, setRegCountry] = useState('India');
  const [regState, setRegState] = useState('');
  const [regDistrict, setRegDistrict] = useState('');
  const [regTashil, setRegTashil] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const users: User[] = JSON.parse(localStorage.getItem('agri_users') || '[]');
    const user = users.find(u => u.mobile === loginMobile && u.password === loginPassword);
    if (user) {
      onLogin(user);
    } else {
      setError('Incorrect mobile number or password.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!regName || !regMobile || !regState || !regDistrict || !regTashil || !regPassword) {
      setError('Please fill all required fields.');
      return;
    }
    const users: User[] = JSON.parse(localStorage.getItem('agri_users') || '[]');
    if (users.some(u => u.mobile === regMobile)) {
      setError('A user with this mobile number already exists.');
      return;
    }
    const newUser: User = { name: regName, email: regEmail, mobile: regMobile, country: regCountry, state: regState, district: regDistrict, tashil: regTashil, password: regPassword };
    users.push(newUser);
    localStorage.setItem('agri_users', JSON.stringify(users));
    onLogin(newUser);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        {isRegistering ? (
          <>
            <h2 className="text-2xl font-bold text-center text-gray-800">Create Account</h2>
            <form onSubmit={handleRegister} className="space-y-4">
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <input type="text" placeholder="Full Name" value={regName} onChange={e => setRegName(e.target.value)} required className="w-full px-4 py-2 border rounded-md" />
              <input type="email" placeholder="Email (Optional)" value={regEmail} onChange={e => setRegEmail(e.target.value)} className="w-full px-4 py-2 border rounded-md" />
              <input type="tel" placeholder="Mobile Number" value={regMobile} onChange={e => setRegMobile(e.target.value)} required className="w-full px-4 py-2 border rounded-md" />
              <input type="text" placeholder="Country" value={regCountry} onChange={e => setRegCountry(e.target.value)} required className="w-full px-4 py-2 border rounded-md" />
              <input type="text" placeholder="State" value={regState} onChange={e => setRegState(e.target.value)} required className="w-full px-4 py-2 border rounded-md" />
              <input type="text" placeholder="District" value={regDistrict} onChange={e => setRegDistrict(e.target.value)} required className="w-full px-4 py-2 border rounded-md" />
              <input type="text" placeholder="Tashil / Taluka" value={regTashil} onChange={e => setRegTashil(e.target.value)} required className="w-full px-4 py-2 border rounded-md" />
              <input type="password" placeholder="Password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required className="w-full px-4 py-2 border rounded-md" />
              <button type="submit" className="w-full px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700">Register</button>
            </form>
            <p className="text-sm text-center text-gray-600">
              Already have an account?{' '}
              <button onClick={() => setIsRegistering(false)} className="font-medium text-green-600 hover:underline">Login</button>
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center text-gray-800">Welcome Back</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <input type="tel" placeholder="Mobile Number" value={loginMobile} onChange={e => setLoginMobile(e.target.value)} required className="w-full px-4 py-2 border rounded-md" />
              <input type="password" placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required className="w-full px-4 py-2 border rounded-md" />
              <button type="submit" className="w-full px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700">Login</button>
            </form>
            <p className="text-sm text-center text-gray-600">
              Don't have an account?{' '}
              <button onClick={() => setIsRegistering(true)} className="font-medium text-green-600 hover:underline">Register</button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

// --- Dashboard Component ---
const DashboardComponent: React.FC<{ user: UserProfile, onSelectBot: (bot: BotType) => void, onLogout: () => void, language: Language, onLanguageChange: (lang: Language) => void }> = ({ user, onSelectBot, onLogout, language, onLanguageChange }) => {
    const [selectedVideo, setSelectedVideo] = useState<TutorialVideo | null>(null);

    const translations = {
        welcome: { en: `Welcome, ${user.name}`, mr: `स्वागत आहे, ${user.name}`, hi: `आपका स्वागत है, ${user.name}` },
        chooseAssistant: { en: 'Choose Your AI Assistant', mr: 'तुमचा AI सहाय्यक निवडा', hi: 'अपना AI सहायक चुनें' },
        govSchemes: { en: 'Government Schemes', mr: 'सरकारी योजना', hi: 'सरकारी योजनाएं' },
        tutorialVideos: { en: 'Tutorial Videos', mr: 'प्रशिक्षण व्हिडिओ', hi: 'ट्यूटोरियल वीडियो' },
        agriculture: { en: 'AI Agriculture Assistance', mr: 'AI कृषी सहाय्य', hi: 'AI कृषि सहायता' },
        pest: { en: 'Pest Attacks Assistance', mr: 'कीड हल्ला सहाय्य', hi: 'कीट आक्रमण सहायता' },
        buyer: { en: 'Buyer Assistance', mr: 'खरेदीदार सहाय्य', hi: 'क्रेता सहायता' },
        weather: { en: 'Weather Assistant', mr: 'हवामान सहाय्यक', hi: 'मौसम सहायक' },
    };

    const assistants: { type: BotType; icon: React.ReactElement; title: keyof typeof translations }[] = [
        { type: 'agriculture', icon: <LeafIcon />, title: 'agriculture' },
        { type: 'pest', icon: <BugIcon />, title: 'pest' },
        { type: 'buyer', icon: <DollarSignIcon />, title: 'buyer' },
        { type: 'weather', icon: <CloudSunIcon />, title: 'weather' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            <header className="bg-white shadow-sm p-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-green-600">AgriSmart AI</h1>
                <div className="flex items-center space-x-4">
                    <div className="relative">
                      <select value={language} onChange={(e) => onLanguageChange(e.target.value as Language)} className="pl-8 pr-4 py-2 border rounded-md appearance-none bg-transparent">
                          <option value="en">English</option>
                          <option value="mr">मराठी</option>
                          <option value="hi">हिन्दी</option>
                      </select>
                      <GlobeIcon className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
                    </div>
                    <button onClick={onLogout} className="p-2 text-gray-500 hover:text-gray-700" title="Logout"><LogoutIcon /></button>
                </div>
            </header>
            <main className="p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-semibold mb-6">{translations.welcome[language]}</h2>

                <section className="mb-10">
                    <h3 className="text-xl font-bold mb-4">{translations.chooseAssistant[language]}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {assistants.map(bot => (
                            <button key={bot.type} onClick={() => onSelectBot(bot.type)} className="p-6 bg-white rounded-lg shadow hover:shadow-lg hover:-translate-y-1 transition-all text-center">
                                <div className="mx-auto bg-green-100 text-green-600 rounded-full w-16 h-16 flex items-center justify-center mb-4">{bot.icon}</div>
                                <h4 className="text-lg font-semibold">{translations[bot.title][language]}</h4>
                            </button>
                        ))}
                    </div>
                </section>
                
                <section className="mb-10">
                    <h3 className="text-xl font-bold mb-4">{translations.govSchemes[language]}</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mockGovernmentSchemes.map((scheme, index) => (
                            <a href={scheme.link} target="_blank" rel="noopener noreferrer" key={index} className="block p-4 bg-white rounded-lg shadow hover:shadow-lg hover:-translate-y-1 transition-all">
                                <h4 className="font-bold text-green-700">{scheme.title[language]}</h4>
                                <p className="text-sm text-gray-600 mt-1">{scheme.description[language]}</p>
                            </a>
                        ))}
                    </div>
                </section>

                <section>
                    <h3 className="text-xl font-bold mb-4">{translations.tutorialVideos[language]}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mockTutorialVideos.map((video) => (
                            <div key={video.id} className="bg-white rounded-lg shadow overflow-hidden group">
                                <div className="relative">
                                    <img src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`} alt={video.title[language]} className="w-full h-40 object-cover" />
                                    <button onClick={() => setSelectedVideo(video)} className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <PlayIcon />
                                    </button>
                                </div>
                                <div className="p-4">
                                    <h4 className="font-semibold">{video.title[language]}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{video.description[language]}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
             {selectedVideo && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setSelectedVideo(null)}>
                    <div className="bg-white p-4 rounded-lg" onClick={(e) => e.stopPropagation()}>
                        <iframe
                            width="560"
                            height="315"
                            src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
                            title={selectedVideo.title[language]}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Chat Component ---
const ChatComponent: React.FC<{ botType: BotType; user: UserProfile; onEndChat: () => void; language: Language }> = ({ botType, user, onEndChat, language }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const chatRef = useRef<Chat | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMessages([]);
        chatRef.current = null;
    }, [botType]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });

    const handleSendMessage = async () => {
        if (!inputValue.trim() && !imageFile) return;

        const userMessage: Message = { role: 'user', text: inputValue, imageUrl: imagePreview };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setImageFile(null);
        setImagePreview(null);
        setIsLoading(true);
        setError(null);

        try {
            const base64Image = imageFile ? await fileToBase64(imageFile) : null;
            const responseText = await getChatResponse(chatRef, botType, user, language, inputValue, base64Image, imageFile?.type || null);
            setMessages(prev => [...prev, { role: 'bot', text: responseText }]);
        } catch (e: any) {
            setError(e.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };
    
    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const botTitles = {
        agriculture: { en: 'AI Agriculture Assistant', mr: 'AI कृषी सहाय्य', hi: 'AI कृषि सहायता' },
        pest: { en: 'Pest Attacks Assistant', mr: 'कीड हल्ला सहाय्य', hi: 'कीट आक्रमण सहायता' },
        buyer: { en: 'Buyer Assistance', mr: 'खरेदीदार सहाय्य', hi: 'क्रेता सहायता' },
        weather: { en: 'Weather Assistant', mr: 'हवामान सहाय्यक', hi: 'मौसम सहायक' },
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <header className="flex items-center justify-between p-4 bg-white border-b">
                <button onClick={onEndChat} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                    <ArrowLeftIcon />
                    <span className="font-semibold">Back to Dashboard</span>
                </button>
                <h1 className="text-xl font-semibold">{botTitles[botType][language]}</h1>
            </header>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                 {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'bot' && <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0"><BotIcon/></div>}
                        <div className={`p-3 rounded-lg max-w-lg ${msg.role === 'user' ? 'bg-green-600 text-white rounded-br-none' : 'bg-white rounded-bl-none'}`}>
                            {msg.imageUrl && <img src={msg.imageUrl} alt="upload preview" className="rounded-md mb-2 max-h-48" />}
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                        {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0"><UserIcon/></div>}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0"><BotIcon/></div>
                        <div className="p-3 rounded-lg bg-white rounded-bl-none">
                             <div className="flex items-center space-x-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-0"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-200"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-400"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <footer className="p-4 bg-white border-t">
                 {error && <p className="text-red-500 text-sm mb-2 text-center">{error}</p>}
                 {imagePreview && (
                    <div className="relative inline-block mb-2">
                        <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-md" />
                        <button onClick={removeImage} className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full p-1"><XIcon /></button>
                    </div>
                )}
                <div className="flex items-center bg-gray-100 rounded-lg p-2">
                    <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} placeholder="Type your message..." className="flex-1 bg-transparent focus:outline-none resize-none" rows={1} />
                    <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageChange} />
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-gray-700"><PaperclipIcon /></button>
                    <button onClick={handleSendMessage} disabled={isLoading || (!inputValue.trim() && !imageFile)} className="p-2 text-white bg-green-600 rounded-lg disabled:bg-green-300 transition"><SendIcon /></button>
                </div>
            </footer>
        </div>
    );
};

// --- Main App Component ---
const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>('auth');
    const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
    const [currentBot, setCurrentBot] = useState<BotType>('agriculture');
    const [language, setLanguage] = useState<Language>('en');

    useEffect(() => {
        const loggedInUser = localStorage.getItem('agri_user');
        if (loggedInUser) {
            setActiveUser(JSON.parse(loggedInUser));
            setCurrentView('dashboard');
        }
    }, []);

    const handleLogin = (user: UserProfile) => {
        localStorage.setItem('agri_user', JSON.stringify(user));
        setActiveUser(user);
        setCurrentView('dashboard');
    };

    const handleLogout = () => {
        localStorage.removeItem('agri_user');
        setActiveUser(null);
        setCurrentView('auth');
    };

    const handleSelectBot = (bot: BotType) => {
        setCurrentBot(bot);
        setCurrentView('chat');
    };
    
    const handleEndChat = () => {
        setCurrentView('dashboard');
    };

    if (currentView === 'auth') {
        return <AuthComponent onLogin={handleLogin} />;
    }

    if (currentView === 'dashboard' && activeUser) {
        return <DashboardComponent user={activeUser} onSelectBot={handleSelectBot} onLogout={handleLogout} language={language} onLanguageChange={setLanguage} />;
    }

    if (currentView === 'chat' && activeUser) {
        return <ChatComponent botType={currentBot} user={activeUser} onEndChat={handleEndChat} language={language} />;
    }
    
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
};

export default App;
