import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SilhouetteId, PatternId } from '../utils/characterBuilder';

export type PainType = 'stabbing' | 'pressing' | 'spinning' | 'burning';
export type PainTiming = 'morning' | 'evening' | 'random';
export type PainEffect = 'cant-play' | 'tired' | 'angry';

export interface MedicalData {
  colorMeaning: string;
  colorDescription: string;
  patternMeaning: string;
  patternDescription: string;
  effectMeaning: string;
  effectDescription: string;
}

export interface CharacterData {
  name: string;
  silhouette: SilhouetteId;
  painType: PainType;
  painTiming: PainTiming;
  painEffect: PainEffect;
  color: string;
  pattern: PatternId;
  emoji: string;
  personality: string;
  catchphrase: string;
  medical: MedicalData;
}

export interface PainEntry {
  id: string;
  timestamp: number;
  level: number;
  characterReaction: string;
  medicalNote: string;
}

interface CharacterStore {
  character: CharacterData | null;
  painHistory: PainEntry[];
  setCharacter: (c: CharacterData) => Promise<void>;
  addPainEntry: (entry: PainEntry) => Promise<void>;
  loadFromStorage: () => Promise<void>;
  clearAll: () => Promise<void>;
}

export const useCharacterStore = create<CharacterStore>((set, get) => ({
  character: null,
  painHistory: [],

  setCharacter: async (c) => {
    set({ character: c });
    await AsyncStorage.setItem('character', JSON.stringify(c));
  },

  addPainEntry: async (entry) => {
    const updated = [entry, ...get().painHistory].slice(0, 100);
    set({ painHistory: updated });
    await AsyncStorage.setItem('painHistory', JSON.stringify(updated));
  },

  loadFromStorage: async () => {
    try {
      const charRaw = await AsyncStorage.getItem('character');
      const histRaw = await AsyncStorage.getItem('painHistory');
      set({
        character: charRaw ? JSON.parse(charRaw) : null,
        painHistory: histRaw ? JSON.parse(histRaw) : [],
      });
    } catch (e) {
      console.warn('Failed to load from storage', e);
    }
  },

  clearAll: async () => {
    await AsyncStorage.multiRemove(['character', 'painHistory']);
    set({ character: null, painHistory: [] });
  },
}));
