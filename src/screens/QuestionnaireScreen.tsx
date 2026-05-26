import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Dimensions, KeyboardAvoidingView, Platform,
} from 'react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import QuestionCard from '../components/QuestionCard';
import Character from '../components/Character';
import {
  buildCharacter, SilhouetteId,
} from '../utils/characterBuilder';
import { useCharacterStore, PainType, PainTiming, PainEffect } from '../store/characterStore';
import { RootStackParamList } from '../../App';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Questionnaire'>;
  route: RouteProp<RootStackParamList, 'Questionnaire'>;
};

const STEPS = [
  {
    id: 'painType',
    question: 'How does your pain feel?',
    options: [
      { label: 'Stabbing', emoji: '', value: 'stabbing' },
      { label: 'Squeezing', emoji: '', value: 'pressing' },
      { label: 'Spinning', emoji: '', value: 'spinning' },
      { label: 'Burning', emoji: '', value: 'burning' },
    ],
  },
  {
    id: 'painTiming',
    question: 'When does the pain happen most?',
    options: [
      { label: 'In the morning', emoji: '', value: 'morning' },
      { label: 'In the evening', emoji: '', value: 'evening' },
      { label: 'For no reason', emoji: '', value: 'random' },
    ],
  },
  {
    id: 'painEffect',
    question: 'What does the pain do to you?',
    options: [
      { label: 'Stops me from playing', emoji: '', value: 'cant-play' },
      { label: 'Makes me tired', emoji: '', value: 'tired' },
      { label: 'Makes me angry', emoji: '', value: 'angry' },
    ],
  },
  { id: 'name' },
];

export default function QuestionnaireScreen({ navigation, route }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [name, setName] = useState('');
  const [isExcited, setIsExcited] = useState(false);
  const setCharacter = useCharacterStore((s) => s.setCharacter);

  const silhouette = route.params?.silhouette || 'round';
  const currentStep = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  const canNext =
    currentStep.id === 'name' ? name.trim().length > 0
    : !!answers[currentStep.id];

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      const character = buildCharacter({
        silhouette,
        painType: answers.painType as PainType,
        painTiming: answers.painTiming as PainTiming,
        painEffect: answers.painEffect as PainEffect,
        name: name.trim(),
      });
      await setCharacter(character);
      navigation.replace('CharacterReveal');
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((s) => s - 1);
    } else {
      navigation.goBack();
    }
  };

  // Preview character (updates as user answers)
  const previewChar = buildCharacter({
    silhouette,
    painType: (answers.painType as PainType) || 'stabbing',
    painTiming: (answers.painTiming as PainTiming) || 'random',
    painEffect: (answers.painEffect as PainEffect) || 'tired',
    name: name || '?',
  });

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{step + 1}/{STEPS.length}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.header}>Let's create your character!</Text>

          {/* Mini preview */}
          {previewChar && (
            <Animated.View entering={FadeIn} style={styles.previewBox}>
              <Text style={styles.previewLabel}>Here is your friend so far:</Text>
              <Animated.View style={isExcited ? { transform: [{ scale: 1.25 }] } : undefined}>
                <Character
                  character={
                    answers.painType
                      ? previewChar
                      : { ...previewChar, color: '#9CA3AF' }
                  }
                  size={110}
                  showName={false}
                  animated={!isExcited}
                  expression={isExcited ? 'excited' : 'default'}
                />
              </Animated.View>
            </Animated.View>
          )}

          <Animated.View key={step} entering={SlideInRight.duration(300)} style={styles.stepContent}>
            {currentStep.options && (
              <QuestionCard
                question={currentStep.question!}
                options={currentStep.options}
                selected={answers[currentStep.id] ?? null}
                onSelect={(v) => {
                  setAnswers((p) => ({ ...p, [currentStep.id]: v }));
                  setIsExcited(true);
                  setTimeout(() => setIsExcited(false), 800);
                }}
              />
            )}

            {currentStep.id === 'name' && (
              <View style={styles.nameContainer}>
                <Text style={styles.question}>Name your character!</Text>
                <Text style={styles.nameSub}>This character will guide you — what is its name?</Text>
                <TextInput
                  style={styles.nameInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="For example: Spiky, Bubbles..."
                  placeholderTextColor="#9CA3AF"
                  maxLength={12}
                  textAlign="center"
                  autoFocus
                />
              </View>
            )}
          </Animated.View>
        </ScrollView>

        {/* Nav buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.nextBtn, !canNext && styles.nextBtnDisabled]}
            onPress={handleNext}
            disabled={!canNext}
          >
            <Text style={styles.nextBtnText}>
              {step === STEPS.length - 1 ? 'Create character!' : 'Next →'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FDF9F2' },
  flex: { flex: 1 },
  progressContainer: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8, gap: 12,
  },
  progressBg: {
    flex: 1, height: 8, backgroundColor: '#FFEEDB', borderRadius: 4, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#FF9F1C', borderRadius: 4 },
  progressText: { fontSize: 13, color: '#FF9F1C', fontWeight: '700' },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  header: {
    fontSize: 24, fontWeight: '800', color: '#1E1B4B',
    marginBottom: 16, textAlign: 'center',
  },
  previewBox: {
    alignItems: 'center', backgroundColor: 'white', borderRadius: 20,
    padding: 16, marginBottom: 20, shadowColor: '#FF9F1C',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12,
  },
  previewLabel: {
    fontSize: 13, color: '#9CA3AF', marginBottom: 10, fontWeight: '600',
  },
  stepContent: { width: '100%' },
  question: {
    fontSize: 22, fontWeight: '700', color: '#1E1B4B',
    textAlign: 'center', marginBottom: 24, lineHeight: 32,
  },
  // Silhouette step
  silhouetteStep: { alignItems: 'center' },
  silhouetteGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12,
  },
  silhouetteCard: {
    width: (width - 80) / 3,
    backgroundColor: '#FFF5EA', borderRadius: 20, padding: 16,
    alignItems: 'center', borderWidth: 3, borderColor: 'transparent',
    shadowColor: '#FF9F1C', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.05, shadowRadius: 8,
  },
  silhouetteCardSelected: { borderColor: '#FF9F1C', backgroundColor: '#FFEEDB' },
  silhouetteEmoji: { fontSize: 36, marginBottom: 8 },
  silhouetteLabel: { fontSize: 16, fontWeight: '700', color: '#4B5563', marginBottom: 4 },
  silhouetteDesc: { fontSize: 12, color: '#9CA3AF', textAlign: 'center' },
  // Name step
  nameContainer: { width: '100%', alignItems: 'center' },
  nameSub: {
    fontSize: 15, color: '#6B7280', textAlign: 'center',
    marginBottom: 24, lineHeight: 22,
  },
  nameInput: {
    width: '100%', backgroundColor: 'white', borderRadius: 18,
    paddingHorizontal: 20, paddingVertical: 18, fontSize: 20, fontWeight: '700',
    color: '#1E1B4B', borderWidth: 2.5, borderColor: '#FF9F1C',
    shadowColor: '#FF9F1C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12,
  },
  btnRow: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 28, paddingTop: 10, gap: 10 },
  backBtn: {
    paddingHorizontal: 20, paddingVertical: 18, borderRadius: 18, backgroundColor: '#FFEEDB',
  },
  backBtnText: { fontSize: 16, fontWeight: '700', color: '#FF9F1C' },
  nextBtn: {
    flex: 1, backgroundColor: '#FF9F1C', paddingVertical: 18, borderRadius: 18,
    alignItems: 'center', shadowColor: '#FF9F1C',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12,
  },
  nextBtnDisabled: { backgroundColor: '#FFD79E', shadowOpacity: 0 },
  nextBtnText: { fontSize: 18, fontWeight: '800', color: 'white' },
});
