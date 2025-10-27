import type { GovernmentScheme, TutorialVideo } from '../types';

export const mockGovernmentSchemes: GovernmentScheme[] = [
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


export const mockTutorialVideos: TutorialVideo[] = [
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
