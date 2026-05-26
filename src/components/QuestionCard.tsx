import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import DoodleIcon from './DoodleIcon';

const { width } = Dimensions.get('window');

interface Option {
  label: string;
  emoji: string; // Left in interface for compatibility/builder types
  value: string;
}

interface QuestionCardProps {
  question: string;
  options: Option[];
  selected: string | null;
  onSelect: (value: string) => void;
}

// Map option values to specific children's book colors
const OPTION_COLORS: Record<string, {
  selectedBg: string;
  selectedText: string;
  unselectedBg: string;
}> = {
  stabbing: { selectedBg: '#FFEDD5', selectedText: '#F97316', unselectedBg: '#FFFDF9' },   // Soft Orange
  pressing: { selectedBg: '#FCE7F3', selectedText: '#EC4899', unselectedBg: '#FFFDF9' },   // Soft Pink
  spinning: { selectedBg: '#E0F2FE', selectedText: '#3B82F6', unselectedBg: '#FFFDF9' },   // Soft Blue
  burning: { selectedBg: '#FEE2E2', selectedText: '#EF4444', unselectedBg: '#FFFDF9' },   // Soft Red
  morning: { selectedBg: '#FEF9C3', selectedText: '#CA8A04', unselectedBg: '#FFFDF9' },   // Sun Yellow
  evening: { selectedBg: '#E0E7FF', selectedText: '#4F46E5', unselectedBg: '#FFFDF9' },   // Indigo Blue
  random: { selectedBg: '#CCFBF1', selectedText: '#0D9488', unselectedBg: '#FFFDF9' },    // Teal Rainbow
  'cant-play': { selectedBg: '#D1FAE5', selectedText: '#10B981', unselectedBg: '#FFFDF9' }, // Pastel Green
  tired: { selectedBg: '#E2E8F0', selectedText: '#475569', unselectedBg: '#FFFDF9' },     // Grey Cloud
  angry: { selectedBg: '#FFE4E6', selectedText: '#F43F5E', unselectedBg: '#FFFDF9' },     // Red/Rose Storm
};

export default function QuestionCard({
  question,
  options,
  selected,
  onSelect,
}: QuestionCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>
      <View style={styles.optionsGrid}>
        {options.map((opt) => {
          const isSelected = selected === opt.value;
          const colors = OPTION_COLORS[opt.value] || {
            selectedBg: '#FFEEDB',
            selectedText: '#FF9F1C',
            unselectedBg: '#FFFDF9',
          };

          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.optionCard,
                { backgroundColor: isSelected ? colors.selectedBg : colors.unselectedBg },
                isSelected && { shadowOpacity: 0.15, transform: [{ translateY: -2 }] },
              ]}
              onPress={() => onSelect(opt.value)}
              activeOpacity={0.8}
            >
              <View style={styles.iconContainer}>
                <DoodleIcon name={opt.value} size={65} isSelected={isSelected} />
              </View>
              <Text style={[
                styles.optionLabel,
                { color: isSelected ? colors.selectedText : '#4B5563' }
              ]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  question: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E1B4B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 32,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
    width: '100%',
  },
  optionCard: {
    width: (width - 60) / 2,
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1E1B4B',
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    marginBottom: 14,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
});

