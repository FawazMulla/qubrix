import { createContext, useContext, useState, type ReactNode } from "react";

export type Locale = "en" | "es" | "fr" | "hi" | "ja";

export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  hi: "हिन्दी",
  ja: "日本語",
};

export const copy = {
  en: {
    dashboard: "Dashboard",
    learn: "Learn",
    lab: "Quantum Lab",
    challenges: "Challenges",
    ai: "AI Tutor",
    progress: "Progress",
    greeting: "Welcome back, Alex",
    ready: "Keep building your quantum intuition.",
    ask: "Ask anything about quantum computing...",
    askSub: "Personalized to your background with real-time interactive visual models.",
    voiceReady: "Voice tutor ready",
    listening: "Listening... speak your quantum question",
    voiceAnswer: "The Hadamard gate creates an equal superposition of |0⟩ and |1⟩ states.",
  },
  es: {
    dashboard: "Panel",
    learn: "Aprender",
    lab: "Laboratorio",
    challenges: "Desafíos",
    ai: "Tutor IA",
    progress: "Progreso",
    greeting: "Bienvenido de nuevo, Alex",
    ready: "Continúa desarrollando tu intuición cuántica.",
    ask: "Pregunta cualquier cosa sobre computación cuántica...",
    askSub: "Personalizado a tu nivel con ejemplos interactivos.",
    voiceReady: "Tutor de voz listo",
    listening: "Escuchando... haz tu pregunta cuántica",
    voiceAnswer: "La puerta Hadamard crea una superposición equilibrada entre los estados |0⟩ y |1⟩.",
  },
  fr: {
    dashboard: "Tableau de bord",
    learn: "Apprendre",
    lab: "Lab Quantique",
    challenges: "Défis",
    ai: "Tuteur IA",
    progress: "Progression",
    greeting: "Bon retour, Alex",
    ready: "Développez votre intuition quantique.",
    ask: "Posez vos questions sur l'informatique quantique...",
    askSub: "Adapté à votre niveau avec des visualisations interactives.",
    voiceReady: "Tuteur vocal prêt",
    listening: "À l'écoute... posez votre question",
    voiceAnswer: "La porte Hadamard place le qubit dans une superposition équilibrée des états |0⟩ et |1⟩.",
  },
  hi: {
    dashboard: "डैशबोर्ड",
    learn: "सीखें",
    lab: "क्वांटम लैब",
    challenges: "चुनौतियाँ",
    ai: "एआई ट्यूटर",
    progress: "प्रगति",
    greeting: "नमस्ते, Alex",
    ready: "क्वांटम की समझ को आगे बढ़ाएं।",
    ask: "क्वांटम कंप्यूटिंग के बारे में कुछ भी पूछें...",
    askSub: "आपके स्तर के अनुसार सरल व्याख्याएं और वास्तविक उदाहरण।",
    voiceReady: "वॉइस ट्यूटर तैयार है",
    listening: "सुन रहे हैं... अपना क्वांटम प्रश्न पूछें",
    voiceAnswer: "हडामर्ड गेट स्थिति को |0⟩ और |1⟩ के समान सुपरपोजिशन में ले जाता है।",
  },
  ja: {
    dashboard: "ダッシュボード",
    learn: "学ぶ",
    lab: "量子ラボ",
    challenges: "チャレンジ",
    ai: "AIチューター",
    progress: "進捗",
    greeting: "おかえりなさい、Alex。",
    ready: "量子の学習を続けましょう。",
    ask: "量子コンピューティングについて何でも聞いてください。",
    askSub: "あなたのレベルに合わせ、すぐ試せる例とともに説明します。",
    voiceReady: "音声チューター準備完了",
    listening: "聞いています…量子の質問をどうぞ",
    voiceAnswer: "アダマールゲートは完全なバランスを作ります。量子ビットがゼロまたは一として測定される可能性を等しくします。",
  },
} satisfies Record<Locale, Record<string, string>>;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (typeof copy)[Locale];
}

export const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: copy.en,
});

export function useI18n() {
  return useContext(I18nContext);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");
  const value = { locale, setLocale, t: copy[locale] };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
