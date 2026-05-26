import { CharacterData, PainType, PainTiming, PainEffect } from '../store/characterStore';

export type SilhouetteId = 'blob' | 'cloud' | 'star' | 'drop' | 'round';
export type PatternId = 'stripes' | 'dots' | 'swirls' | 'solid';

export interface QuestionnaireAnswers {
  silhouette: SilhouetteId;
  painType: PainType;
  painTiming: PainTiming;
  painEffect: PainEffect;
  name: string;
}

// ─── Color = Pain Type ───────────────────────────────────────────────────────
export const PAIN_TYPE_CONFIG: Record<PainType, {
  color: string;
  colorName: string;
  medicalLabel: string;
  medicalDescription: string;
  emoji: string;
  childLabel: string;
}> = {
  stabbing: {
    color: '#EF4444',
    colorName: 'Red',
    medicalLabel: 'Acute Nociceptive Pain',
    medicalDescription: 'Sharp and localized pain with nociceptive features — may indicate local tissue irritation',
    emoji: '',
    childLabel: 'Stabbing',
  },
  pressing: {
    color: '#8B5CF6',
    colorName: 'Purple',
    medicalLabel: 'Pressure / Tension Pain',
    medicalDescription: 'Continuous pressive pain with tension-type features — common in functional primary pain',
    emoji: '',
    childLabel: 'Squeezing',
  },
  spinning: {
    color: '#3B82F6',
    colorName: 'Blue',
    medicalLabel: 'Colicky / Visceral Pain',
    medicalDescription: 'Spasmodic and colicky pain with visceral features — points to GI system involvement',
    emoji: '',
    childLabel: 'Spinning',
  },
  burning: {
    color: '#F97316',
    colorName: 'Orange',
    medicalLabel: 'Neuropathic Pain',
    medicalDescription: 'Burning sensation with neuropathic features — possible involvement of central pain processing component',
    emoji: '',
    childLabel: 'Burning',
  },
};

// ─── Pattern = Pain Timing ────────────────────────────────────────────────────
export const PAIN_TIMING_CONFIG: Record<PainTiming, {
  pattern: PatternId;
  patternName: string;
  medicalLabel: string;
  medicalDescription: string;
  childLabel: string;
}> = {
  morning: {
    pattern: 'stripes',
    patternName: 'Horizontal Stripes',
    medicalLabel: 'Sleep / Rest Related Pain',
    medicalDescription: 'Pain occurs in the morning — may indicate post-sleep hyperalgesia, common in primary pain',
    childLabel: 'Morning',
  },
  evening: {
    pattern: 'dots',
    patternName: 'Dots',
    medicalLabel: 'Activity Accumulated Pain',
    medicalDescription: 'Pain occurs in the evening — worsens with daily stress/activity, characterises postural or activity-dependent pain',
    childLabel: 'Evening',
  },
  random: {
    pattern: 'swirls',
    patternName: 'Swirls',
    medicalLabel: 'Spontaneous / Unpredictable Pain',
    medicalDescription: 'Pain without a clear trigger — a core feature of Central Sensitization Syndrome',
    childLabel: 'Randomly',
  },
};

// ─── Silhouette = Pain Effect ─────────────────────────────────────────────────
export const PAIN_EFFECT_CONFIG: Record<PainEffect, {
  medicalLabel: string;
  medicalDescription: string;
  childLabel: string;
  emoji: string;
}> = {
  'cant-play': {
    medicalLabel: 'High Disability Score',
    medicalDescription: 'Pain significantly impairs physical activity — low Pediatric Quality of Life (PedsQL) function score, important to monitor',
    childLabel: 'Stops me from playing',
    emoji: '',
  },
  'tired': {
    medicalLabel: 'Fatigue-Dominant Profile',
    medicalDescription: 'Fatigue as a dominant side effect — common in Nociplastic Pain, check sleep patterns recommended',
    childLabel: 'Makes me tired',
    emoji: '',
  },
  'angry': {
    medicalLabel: 'High Emotional Impact',
    medicalDescription: 'Prominent emotional impact — secondary anxiety/depression component possible, psychological referral might be considered',
    childLabel: 'Makes me angry',
    emoji: '',
  },
};

// ─── Silhouette options to show in questionnaire ──────────────────────────────
export const SILHOUETTE_OPTIONS: { id: SilhouetteId; label: string; emoji: string; description: string }[] = [
  { id: 'blob',  label: 'Blob',   emoji: '', description: 'Soft and curvy' },
  { id: 'cloud', label: 'Cloud',  emoji: '', description: 'Puffy and light' },
  { id: 'star',  label: 'Star',   emoji: '', description: 'Sharp and pointy' },
  { id: 'drop',  label: 'Drop',   emoji: '', description: 'Fluid and smooth' },
  { id: 'round', label: 'Circle', emoji: '', description: 'Simple and round' },
];

// ─── Build character ──────────────────────────────────────────────────────────
export function buildCharacter(answers: QuestionnaireAnswers): CharacterData {
  const typeConfig = PAIN_TYPE_CONFIG[answers.painType];
  const timingConfig = PAIN_TIMING_CONFIG[answers.painTiming];
  const effectConfig = PAIN_EFFECT_CONFIG[answers.painEffect];

  return {
    name: answers.name,
    silhouette: answers.silhouette,
    painType: answers.painType,
    painTiming: answers.painTiming,
    painEffect: answers.painEffect,
    color: typeConfig.color,
    pattern: timingConfig.pattern,
    emoji: typeConfig.emoji,
    personality: typeConfig.childLabel,
    catchphrase: getCatchphrase(answers.painType, answers.painEffect),
    // Medical data for doctor dashboard
    medical: {
      colorMeaning: typeConfig.medicalLabel,
      colorDescription: typeConfig.medicalDescription,
      patternMeaning: timingConfig.medicalLabel,
      patternDescription: timingConfig.medicalDescription,
      effectMeaning: effectConfig.medicalLabel,
      effectDescription: effectConfig.medicalDescription,
    },
  };
}

function getCatchphrase(type: PainType, effect: PainEffect): string {
  const map: Record<string, string> = {
    'stabbing+cant-play': 'I feel like a cactus covered in LEGO bricks. Playtime is officially canceled.',
    'stabbing+tired': 'Sharp pain, but honestly, sleeping is way more fun anyway.',
    'stabbing+angry': 'I am sharp, annoying, and I demand chocolate cookies as compensation.',
    'pressing+cant-play': 'I am hugging your tummy with the strength of 100 annoying little monkeys.',
    'pressing+tired': 'Squeezing and tired. Can we just lie down and blame the weather?',
    'pressing+angry': 'I\'m squeezing you, and yes, it\'s making us both grumpy. Deal with it.',
    'spinning+cant-play': 'I am dizzy like a washing machine on turbo mode. Do not shake me!',
    'spinning+tired': 'Spinning and spinning... Everything is moving, and I need a nap. Immediately.',
    'spinning+angry': 'I am dizzy, cranky, and I refuse to cooperate with gravity.',
    'burning+cant-play': 'I\'m hot like a spicy taco. Playtime is definitely off the menu.',
    'burning+tired': 'Hot, burning, and tired. I feel like a melted popsicle in the sun.',
    'burning+angry': 'I\'m burning like a tiny fire-breathing dragon. Do not poke the dragon!',
  };
  return map[`${type}+${effect}`] ?? 'I am your pain buddy — and I am programmed to be sarcastic.';
}

// ─── Pain scenes ──────────────────────────────────────────────────────────────
export const PAIN_SCENES: Record<number, {
  title: string;
  description: string;
  emoji: string;
  medicalNote: string;
}> = {
  1: {
    title: 'Butterflies in the stomach!',
    description: 'Cute little butterflies are fluttering inside',
    emoji: '',
    medicalNote: 'NRS 1-2: Mild pain, no functional impairment',
  },
  2: {
    title: 'A noisy band playing!',
    description: 'Little musical instruments are playing together',
    emoji: '',
    medicalNote: 'NRS 3-4: Moderate pain, annoying but manageable',
  },
  3: {
    title: 'Like a washing machine!',
    description: 'My stomach is spinning and spinning like laundry in a drum',
    emoji: '',
    medicalNote: 'NRS 5-6: Moderate-severe pain, interferes with activities',
  },
  4: {
    title: 'A giant pitching a tent!',
    description: 'A silly little giant built a camp right inside my tummy',
    emoji: '',
    medicalNote: 'NRS 7-8: Severe pain, requires intervention',
  },
  5: {
    title: 'A rock party in the tummy!',
    description: 'Everyone is dancing and playing loud, noisy music inside',
    emoji: '',
    medicalNote: 'NRS 9-10: Extremely severe pain, urgent intervention required',
  },
};
