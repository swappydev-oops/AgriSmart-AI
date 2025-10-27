export interface UserProfile {
  name: string;
  email?: string;
  mobile: string;
  country: string;
  state: string;
  district: string;
  tashil: string;
}

export interface User extends UserProfile {
  password?: string;
}

export type BotType = 'agriculture' | 'pest' | 'buyer' | 'weather';

export interface Message {
  role: 'user' | 'bot';
  text: string;
  imageUrl?: string | null;
}

export interface GovernmentScheme {
  title: { [key: string]: string };
  description: { [key: string]: string };
  link: string;
}

export interface TutorialVideo {
    id: number;
    title: { [key: string]: string };
    description: { [key: string]: string };
    youtubeId: string;
    tags: string[];
}
