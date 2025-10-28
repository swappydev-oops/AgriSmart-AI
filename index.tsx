
import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Chat, Part } from "@google/genai";
import type { MutableRefObject } from 'react';

// --- TYPES (from types.ts) ---
interface UserProfile {
  name: string;
  email?: string;
  mobile: string;
  country: string;
  state: string;
  district: string;
  tashil: string;
}

interface User extends UserProfile {
  password?: string;
}

type BotType = 'agriculture' | 'pest' | 'buyer' | 'weather';

interface Message {
  role: 'user' | 'bot';
  text: string;
  imageUrl?: string | null;
}

interface GovernmentScheme {
  title: { [key: string]: string };
  description: { [key: string]: string };
  link: string;
}

interface TutorialVideo {
    id: number;
    title: { [key: string]: string };
    description: { [key: string]: string };
    youtubeId: string;
    tags: string[];
}

// --- MOCK DATA (from data/mockData.ts) ---
const mockGovernmentSchemes: GovernmentScheme[] = [
  {
    title: {
      en: 'PM-KISAN Scheme',
      mr: 'पंतप्रधान किसान योजना',
      hi: 'पीएम-किसान योजना',
    },
    description: {
      en: 'Financial support for small and marginal farmers.',
      mr: 'अल्प व अत्यल्प भूधारक शेतकऱ्यांसाठी आर्थिक सहाय्य.',
      hi: 'छोटे और सीमांत किसानों के लिए वित्तीय सहायता।',
    },
    link: 'https://pmkisan.gov.in/',
  },
  {
    title: {
      en: 'Pradhan Mantri Fasal Bima Yojana',
      mr: 'प्रधानमंत्री फसल विमा योजना',
      hi: 'प्रधानमंत्री फसल बीमा योजना',
    },
    description: {
      en: 'Insurance coverage and financial support to farmers in the event of failure of any of the notified crops.',
      mr: 'अधिसूचित पिकांपैकी कोणत्याही पिकाच्या नुकसानी झाल्यास शेतकऱ्यांना विमा संरक्षण आणि आर्थिक सहाय्य.',
      hi: 'अधिसूचित फसलों में से किसी के भी विफल होने की स्थिति में किसानों को बीमा कवरेज और वित्तीय सहायता।',
    },
    link: 'https://pmfby.gov.in/',
  },
  {
    title: {
      en: 'Soil Health Card Scheme',
      mr: 'मृदा आरोग्य कार्ड योजना',
      hi: 'मृदा स्वास्थ्य कार्ड योजना',
    },
    description: {
      en: 'Helping farmers to improve soil health and increase productivity.',
      mr: 'शेतकऱ्यांना जमिनीचे आरोग्य सुधारण्यास आणि उत्पादकता वाढविण्यात मदत करणे.',
      hi: 'किसानों को मिट्टी के स्वास्थ्य में सुधार और उत्पादकता बढ़ाने में मदद करना।',
    },
    link: 'https://soilhealth.dac.gov.in/',
  },
];

const mockTutorialVideos: TutorialVideo[] = [
  {
    id: 1,
    title: {
      en: 'Modern Drip Irrigation Techniques',
      mr: 'आधुनिक ठिबक सिंचन तंत्र',
      hi: 'आधुनिक ड्रिप सिंचाई तकनीकें',
    },
    description: {
      en: 'Learn how to set up and maintain a drip irrigation system for water conservation and better crop yield.',
      mr: 'पाण्याची बचत आणि उत्तम पीक उत्पादनासाठी ठिबक सिंचन प्रणाली कशी स्थापित करावी आणि त्याची देखभाल कशी करावी ते शिका.',
      hi: 'जल संरक्षण और बेहतर फसल उपज के लिए ड्रिप सिंचाई प्रणाली स्थापित करने और बनाए रखने का तरीका जानें।',
    },
    youtubeId: 'p28hT26i4-g',
    tags: ['agriculture', 'irrigation'],
  },
  {
    id: 2,
    title: {
      en: 'Organic Pest Control Methods',
      mr: 'सेंद्रिय कीड नियंत्रण पद्धती',
      hi: 'जैविक कीट नियंत्रण विधियाँ',
    },
    description: {
      en: 'Discover effective and natural ways to manage pests in your farm without using harmful chemicals.',
      mr: 'हानिकारक रसायनांचा वापर न करता तुमच्या शेतातील कीटकांचे व्यवस्थापन करण्याचे प्रभावी आणि नैसर्गिक मार्ग शोधा.',
      hi: 'हानिकारक रसायनों का उपयोग किए बिना अपने खेत में कीटों का प्रबंधन करने के प्रभावी और प्राकृतिक तरीके खोजें।',
    },
    youtubeId: 'r_pP_Mn0FpI',
    tags: ['pest', 'agriculture'],
  },
  {
    id: 3,
    title: {
      en: 'Soil Testing and Nutrient Management',
      mr: 'माती परीक्षण आणि पोषक तत्व व्यवस्थापन',
      hi: 'मृदा परीक्षण और पोषक तत्व प्रबंधन',
    },
    description: {
      en: 'A step-by-step guide on how to test your soil and manage nutrients for optimal plant growth.',
      mr: 'तुमच्या जमिनीची चाचणी कशी करावी आणि वनस्पतींच्या चांगल्या वाढीसाठी पोषक तत्वांचे व्यवस्थापन कसे करावे यासाठी एक टप्प्याटप्प्याने मार्गदर्शक.',
      hi: 'अपनी मिट्टी का परीक्षण कैसे करें और इष्टतम पौधों की वृद्धि के लिए पोषक तत्वों का प्रबंधन कैसे करें, इस पर एक कदम-दर-कदम मार्गदर्शिका।',
    },
    youtubeId: '6Lz_28zlo8g',
    tags: ['agriculture', 'soil'],
  },
];


// --- ICONS (from components/Icons.tsx) ---
const LeafIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><path d="M11 20A7 7 0 0 1 4 13V8a5 5 0 0 1 10 0v5a7 7 0 0 1-7 7Zm8-16a5 5 0 0 0-10 0v5a7 7 0 0 0 14 0V8a5 5 0 0 0-4-4Z"/></svg>;
const BugIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><path d="M12 20a8 8 0 0 1-8-8V7a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v5a8 8 0 0 1-8 8Z"/><path d="M16 4h-2a2 2 0 0 0-4 0H8"/><path d="M12 20v-4"/><path d="M12 4V2"/><path d="m7.5 7.5-.5-.5"/><path d="m17.5 7.5.5-.5"/><path d="m7.5 12.5-.5.5"/><path d="m17.5 12.5.5.5"/></svg>;
const DollarSignIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const CloudSunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m17.66 17.66 1.41 1.41"/><path d="M12 22v-2"/><path d="m6.34 17.66-1.41 1.41"/><path d="M4 12H2"/><path d="m6.34 6.34-1.41-1.41"/><path d="M16 16a2.76 2.76 0 0 1-4 0"/><path d="M20 16.5A4.5 4.5 0 0 0 15.5 12H13a5 5 0 0 0-10 0h.5A4.5 4.5 0 0 0 8 20.5"/></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const GlobeIcon = ({ className = "w-6 h-6" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>;
const PaperclipIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.59a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const BotIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>;
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>;
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;


// --- GEMINI SERVICE (from services/geminiService.ts) ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getLanguageDirective = (language: 'en' | 'mr' | 'hi'): string => {
  const langMap = {
    en: "English",
    mr: "Marathi",
    hi: "Hindi"
  };
  return `Please respond exclusively in ${langMap[language]}.`;
};

const getBaseSystemInstruction = (userProfile: UserProfile): string => {
  return `You are AgriSmart AI, an expert agricultural assistant for farmers.
  Your user's details are:
  - Location: ${userProfile.tashil}, ${userProfile.district}, ${userProfile.state}, ${userProfile.country}.
  
  Provide concise, actionable, and easy-to-understand advice. Be friendly and supportive.`;
};

const agricultureSystemInstruction = (userProfile: UserProfile): string => `
  ${getBaseSystemInstruction(userProfile)}
  Your role is to provide comprehensive guidance on crop cultivation. This includes suggesting the best crops for their location and season, recommending fertilizers, planning irrigation schedules, and creating step-by-step cultivation calendars.
  
  Available tutorial videos for recommendation:
  ${mockTutorialVideos.filter(v => v.tags.includes('agriculture')).map(v => `- "${v.title.en}"`).join('\n')}
  
  If the user's query is related to one of these topics, recommend the relevant video by its full title in your response.
`;

const pestSystemInstruction = (userProfile: UserProfile): string => `
  ${getBaseSystemInstruction(userProfile)}
  Your primary role is to identify pests and diseases from images and provide detailed treatment plans.
  If an image is provided, prioritize its analysis. Your response should be structured:
  1.  **Identification:** Clearly state the likely pest or disease.
  2.  **Explanation:** Briefly describe the issue and its potential impact.
  3.  **Treatment Plan:** Provide clear, numbered steps for both organic and chemical treatment options.
  4.  **Prevention:** Offer advice to prevent future occurrences.
  
  Available tutorial videos for recommendation:
  ${mockTutorialVideos.filter(v => v.tags.includes('pest')).map(v => `- "${v.title.en}"`).join('\n')}
  
  If the user's query is related to one of these topics, recommend the relevant video by its full title in your response.
`;

const buyerSystemInstruction = (userProfile: UserProfile): string => `
  ${getBaseSystemInstruction(userProfile)}
  Your role is to act as a market and buyer assistant. Analyze local market trends, provide the latest prices from nearby markets (mandis), and suggest the best places or buyers to sell crops for a better price. You can also provide a "Sell Smart" comparison of different buyer offers if asked.
`;

const weatherSystemInstruction = (userProfile: UserProfile): string => `
  ${getBaseSystemInstruction(userProfile)}
  Your role is to be a dedicated weather expert. Provide detailed weather forecasts for the user's location. Answer specific questions about rain, wind, humidity, and temperature. Explain how upcoming weather conditions might impact their crops and offer proactive advice.
`;

const getSystemInstruction = (botType: BotType, userProfile: UserProfile): string => {
  switch (botType) {
    case 'agriculture':
      return agricultureSystemInstruction(userProfile);
    case 'pest':
      return pestSystemInstruction(userProfile);
    case 'buyer':
      return buyerSystemInstruction(userProfile);
    case 'weather':
        return weatherSystemInstruction(userProfile);
    default:
      return getBaseSystemInstruction(userProfile);
  }
};

async function getChatResponse(
  chatRef: MutableRefObject<Chat | null>,
  botType: BotType,
  userProfile: UserProfile,
  language: 'en' | 'mr' | 'hi',
  prompt: string,
  base64Image: string | null,
  imageMimeType: string | null
): Promise<string> {

  const systemInstruction = `${getSystemInstruction(botType, userProfile)} ${getLanguageDirective(language)}`;

  if (!chatRef.current) {
    chatRef.current = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: { systemInstruction: systemInstruction },
    });
  }

  try {
    const parts: Part[] = [];
    if (prompt) {
      parts.push({ text: prompt });
    }
    if (base64Image && imageMimeType) {
      parts.push({
        inlineData: {
          data: base64Image,
          mimeType: imageMimeType,
        },
      });
    }

    if (parts.length === 0) {
      return "Please provide some input.";
    }

    const response = await chatRef.current.sendMessage({ message: parts });
    return response.text;

  } catch (error) {
    console.error("Gemini API error:", error);
    chatRef.current = null; // Reset chat on error
    if (error instanceof Error) {
        if (error.message.includes('NETWORK_ERROR')) {
            throw new Error('Could not connect to AI service. Please check your connection.');
        }
    }
    throw new Error('Analysis failed, please try again.');
  }
}

// --- APP COMPONENTS (from App.tsx) ---
type Language = 'en' | 'mr' | 'hi';
type View = 'auth' | 'dashboard' | 'chat';

const AuthComponent: React.FC<{ onLogin: (user: UserProfile) => void }> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  
  const [loginMobile, setLoginMobile] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

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


// --- RENDER APP ---
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
