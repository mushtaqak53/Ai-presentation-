
export enum OutputType {
  SLIDES = 'slides',
  WORD = 'word'
}

export enum Tone {
  PROFESSIONAL = 'Professional',
  ACADEMIC = 'Academic',
  SIMPLE = 'Simple',
  BUSINESS = 'Business'
}

export enum Language {
  ENGLISH = 'English',
  URDU = 'Urdu'
}

export interface ThemePalette {
  id: string;
  name: string;
  primary: string; // Hex without # for PPTX
  dark: string;
  light: string;
  accent: string;
  bgGradient: string; // CSS gradient for preview
}

export interface ThemeFont {
  id: string;
  name: string;
  family: string;
}

export interface SlideContent {
  title: string;
  points: string[];
}

export interface DocumentSection {
  heading: string;
  paragraphs: string[];
}

export interface GeneratedData {
  title: string;
  subtitle?: string;
  items: SlideContent[] | DocumentSection[];
  type: OutputType;
}

export interface GenerationParams {
  prompt: string;
  type: OutputType;
  tone: Tone;
  count: number;
  language: Language;
}
