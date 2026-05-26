import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, TextInput, Alert, Dimensions,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Circle, Path, Line, Rect } from 'react-native-svg';
import Character from '../components/Character';
import { useCharacterStore, PainEntry } from '../store/characterStore';
import { RootStackParamList } from '../../App';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'ParentDashboard'> };
const { width } = Dimensions.get('window');
const PIN = '1234';

const LEVEL_COLORS = ['', '#A7F3D0', '#FDE68A', '#FCD34D', '#FCA5A5', '#F87171'];
const LEVEL_LABELS = ['', 'Barely any', 'Bothersome', 'Uncomfortable', 'Hurts a lot', 'Hurts so bad!'];
const LEVEL_NRS    = ['', 'NRS 1-2', 'NRS 3-4', 'NRS 5-6', 'NRS 7-8', 'NRS 9-10'];

// Custom Mini Icons
function MiniDashboardIcon({ name }: { name: 'color' | 'pattern' | 'effect' | 'summary' | 'total' | 'avg' | 'max' }) {
  const strokeColor = '#1E1B4B';
  switch (name) {
    case 'color':
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={2.5}>
          <Path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19H12V22Z" fill="#FFEEDB" stroke={strokeColor} strokeWidth={2} />
          <Circle cx={7.5} cy={10.5} r={1.5} fill="#EF4444" />
          <Circle cx={11.5} cy={7.5} r={1.5} fill="#3B82F6" />
          <Circle cx={16.5} cy={9.5} r={1.5} fill="#10B981" />
        </Svg>
      );
    case 'pattern':
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={2.5}>
          <Path d="M12 2L2 12L12 22L22 12L12 2Z" fill="#E0F2FE" />
          <Path d="M12 6L6 12L12 18L18 12L12 6Z" fill="none" stroke={strokeColor} strokeWidth={1.5} />
        </Svg>
      );
    case 'effect':
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={2.5}>
          <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="#FEE2E2" />
          <Line x1={12} y1={9} x2={12} y2={13} />
          <Line x1={12} y1={17} x2={12.01} y2={17} />
        </Svg>
      );
    case 'summary':
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={2.5}>
          <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#FFEEDB" />
          <Path d="M14 2v6h6" />
          <Line x1={16} y1={13} x2={8} y2={13} />
          <Line x1={16} y1={17} x2={8} y2={17} />
        </Svg>
      );
    case 'total':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={2.5}>
          <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#E0F2FE" />
          <Path d="M14 2v6h6" />
          <Line x1={12} y1={12} x2={8} y2={12} />
          <Line x1={14} y1={16} x2={8} y2={16} />
        </Svg>
      );
    case 'avg':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={2.5}>
          <Rect x={3} y={11} width={4} height={9} rx={1} fill="#FEF3C7" />
          <Rect x={10} y={4} width={4} height={16} rx={1} fill="#FEF3C7" />
          <Rect x={17} y={8} width={4} height={12} rx={1} fill="#FEF3C7" />
        </Svg>
      );
    case 'max':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={2.5}>
          <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#FEE2E2" />
        </Svg>
      );
    default:
      return null;
  }
}

export default function ParentDashboardScreen({ navigation }: Props) {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState<'legend' | 'history' | 'stats'>('legend');
  const { character, painHistory, clearAll } = useCharacterStore();

  const handlePin = () => {
    if (pin === PIN) { setUnlocked(true); setPinError(false); }
    else { setPinError(true); setPin(''); }
  };

  const handleClear = () => {
    Alert.alert('Delete History', 'Delete all data? This action is irreversible.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { clearAll(); navigation.replace('SilhouetteSelection'); } },
    ]);
  };

  if (!unlocked) {
    return (
      <SafeAreaView style={styles.safe}>
        <Animated.View entering={FadeIn.duration(400)} style={styles.pinContainer}>
          {/* Stethoscope SVG representation instead of doctor emoji */}
          <View style={styles.pinIconWrapper}>
            <Svg width={70} height={70} viewBox="0 0 24 24" fill="none" stroke="#1E1B4B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M4.5 16.5c-1.5 1.25-2.5 3-2.5 5 0 1 .5 1.5 1.5 1.5h17c1 0 1.5-.5 1.5-1.5 0-2-1-3.75-2.5-5" fill="#FFEEDB" />
              <Path d="M12 2C8 2 6 5.5 6 9c0 3 2 4.5 6 4.5s6-1.5 6-4.5c0-3.5-2-7-6-7z" fill="#FFEEDB" />
              <Path d="M12 13.5v5" />
              <Circle cx={12} cy={20.5} r={2} fill="#FF9F1C" />
            </Svg>
          </View>
          
          <Text style={styles.pinTitle}>Professional Access</Text>
          <Text style={styles.pinSub}>Parents / Doctors / Caregivers</Text>
          <Text style={styles.pinHint}>Access Code (Default: 1234)</Text>
          <TextInput
            style={[styles.pinInput, pinError && { borderColor: '#EF4444' }]}
            value={pin} onChangeText={setPin} keyboardType="numeric"
            secureTextEntry maxLength={4} placeholder="••••"
            placeholderTextColor="#C7D2FE" textAlign="center" autoFocus
          />
          {pinError && <Text style={styles.pinError}>Wrong code, try again</Text>}
          <TouchableOpacity style={styles.pinBtn} onPress={handlePin}>
            <Text style={styles.pinBtnText}>Enter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
            <Text style={styles.backLinkText}>← Back to Lobby</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  const totalEntries = painHistory.length;
  const last7 = painHistory.filter((e) => Date.now() - e.timestamp < 7 * 86400000);
  const avg7 = last7.length
    ? (last7.reduce((a, e) => a + e.level, 0) / last7.length).toFixed(1) : '—';
  const maxLevel = painHistory.length ? Math.max(...painHistory.map((e) => e.level)) : 0;

  // Chart data
  const dayMap: Record<string, number[]> = {};
  painHistory.slice(0, 30).forEach((e) => {
    const day = new Date(e.timestamp).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' });
    if (!dayMap[day]) dayMap[day] = [];
    dayMap[day].push(e.level);
  });
  const chartDays = Object.entries(dayMap).slice(0, 7).reverse().map(([day, levels]) => ({
    day, avg: levels.reduce((a, b) => a + b, 0) / levels.length, count: levels.length,
  }));

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.dashHeader}>
        <TouchableOpacity style={styles.closeBtnWrapper} onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.dashTitle}>Professional Dashboard</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['legend', 'history', 'stats'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'legend' ? 'Key' : tab === 'history' ? 'History' : 'Stats'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── TAB: LEGEND (Medical Key) ── */}
        {activeTab === 'legend' && character && (
          <Animated.View entering={FadeIn.duration(350)}>
            <Text style={styles.sectionTitle}>Patient's Character</Text>

            {/* Character display */}
            <View style={styles.charDisplayCard}>
              <Character character={character} size={110} showName animated={false} />
              <View style={styles.charInfo}>
                <Text style={styles.charInfoName}>{character.name}</Text>
                <Text style={styles.charInfoSub}>Created on: {new Date().toLocaleDateString('en-US')}</Text>
              </View>
            </View>

            {/* Edit/Update button */}
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('SilhouetteSelection')}
            >
              <Text style={styles.editBtnText}>Update Character Details (Questionnaire)</Text>
            </TouchableOpacity>

            {/* Medical key */}
            <Text style={styles.sectionTitle}>Medical Character Key</Text>
            <Text style={styles.sectionSub}>
              Each visual feature of the character represents clinical data reported by the patient
            </Text>

            <MedicalKeyCard
              visual="Character Color"
              visualValue={character.color}
              label={character.medical.colorMeaning}
              description={character.medical.colorDescription}
              iconType="color"
              colorSwatch={character.color}
            />
            <MedicalKeyCard
              visual="Character Pattern"
              visualValue={getPatternName(character.pattern)}
              label={character.medical.patternMeaning}
              description={character.medical.patternDescription}
              iconType="pattern"
            />
            <MedicalKeyCard
              visual="Impact on Function"
              visualValue={character.painEffect}
              label={character.medical.effectMeaning}
              description={character.medical.effectDescription}
              iconType="effect"
              highlight
            />

            {/* Summary for doctor */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <MiniDashboardIcon name="summary" />
                <Text style={styles.summaryTitle}>Clinical Summary</Text>
              </View>
              <Text style={styles.summaryText}>
                Patient reports <Text style={styles.bold}>{character.medical.colorMeaning}</Text>,
                {' '}which occurs mostly {getTimingLabel(character.painTiming)} ({character.medical.patternMeaning}).
                {'\n\n'}
                Impact on function: <Text style={styles.bold}>{character.medical.effectMeaning}</Text>.
                {'\n\n'}
                {character.medical.effectDescription}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* ── TAB: HISTORY ── */}
        {activeTab === 'history' && (
          <Animated.View entering={FadeIn.duration(350)}>
            <Text style={styles.sectionTitle}>Recent Pain Reports</Text>
            {painHistory.length === 0 && (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No reports recorded yet</Text>
              </View>
            )}
            {painHistory.slice(0, 30).map((entry) => (
              <PainEntryRow key={entry.id} entry={entry} />
            ))}
          </Animated.View>
        )}

        {/* ── TAB: STATS ── */}
        {activeTab === 'stats' && (
          <Animated.View entering={FadeIn.duration(350)}>
            <View style={styles.statsGrid}>
              <DashStat label="Total Reports" value={String(totalEntries)} iconType="total" color="#E0F2FE" />
              <DashStat label="7-Day Average" value={String(avg7)} iconType="avg" color="#FEF3C7" />
              <DashStat label="Max Intensity" value={maxLevel ? `${maxLevel}/5` : '—'} iconType="max" color="#FEE2E2" />
            </View>

            {chartDays.length > 0 ? (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Pain Intensity — Last 7 Days</Text>
                <View style={styles.chart}>
                  {chartDays.map(({ day, avg, count }) => {
                    const barH = (avg / 5) * 90;
                    const color = LEVEL_COLORS[Math.round(avg)] || '#A7F3D0';
                    return (
                      <View key={day} style={styles.barCol}>
                        <Text style={styles.barCount}>{count}x</Text>
                        <View style={styles.barTrack}>
                          <View style={[styles.bar, { height: barH, backgroundColor: color }]} />
                        </View>
                        <Text style={styles.barAvg}>{avg.toFixed(1)}</Text>
                        <Text style={styles.barDay}>{day}</Text>
                      </View>
                    );
                  })}
                </View>
                {/* NRS legend */}
                <View style={styles.nrsLegend}>
                  {[1,2,3,4,5].map((l) => (
                    <View key={l} style={styles.nrsRow}>
                      <View style={[styles.nrsDot, { backgroundColor: LEVEL_COLORS[l] }]} />
                      <Text style={styles.nrsText}>Pain Level {l}: {LEVEL_LABELS[l]} ({LEVEL_NRS[l]})</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Not enough data to display charts yet</Text>
              </View>
            )}
          </Animated.View>
        )}

        <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
          <Text style={styles.clearBtnText}>Delete All Data</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Medical Key Card ─────────────────────────────────────────────────────────
function MedicalKeyCard({ visual, visualValue, label, description, iconType, colorSwatch, highlight }: {
  visual: string; visualValue: string; label: string; description: string;
  iconType: 'color' | 'pattern' | 'effect'; colorSwatch?: string; highlight?: boolean;
}) {
  return (
    <View style={[styles.medCard, highlight && styles.medCardHighlight]}>
      <View style={styles.medCardTop}>
        <View style={styles.medIconContainer}>
          <MiniDashboardIcon name={iconType} />
        </View>
        <View style={styles.medCardTopText}>
          <Text style={styles.medVisual}>{visual}</Text>
          <View style={styles.medVisualValueRow}>
            {colorSwatch && (
              <View style={[styles.colorSwatch, { backgroundColor: colorSwatch }]} />
            )}
            <Text style={styles.medVisualValue}>{visualValue}</Text>
          </View>
        </View>
      </View>
      <View style={styles.medCardDivider} />
      <Text style={styles.medLabel}>{label}</Text>
      <Text style={styles.medDesc}>{description}</Text>
    </View>
  );
}

// ─── Pain Entry Row ───────────────────────────────────────────────────────────
function PainEntryRow({ entry }: { entry: PainEntry }) {
  const date = new Date(entry.timestamp);
  const dateStr = date.toLocaleDateString('en-US', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });
  const color = LEVEL_COLORS[entry.level];
  return (
    <View style={styles.entryRow}>
      <View style={[styles.entryBadge, { backgroundColor: color }]}>
        <Text style={styles.entryLevel}>Level {entry.level}</Text>
        <Text style={styles.entryNRS}>{LEVEL_NRS[entry.level]}</Text>
      </View>
      <View style={styles.entryText}>
        <Text style={styles.entryReaction}>{entry.characterReaction}</Text>
        <Text style={styles.entryMedNote}>{entry.medicalNote}</Text>
        <Text style={styles.entryDate}>{dateStr}</Text>
      </View>
    </View>
  );
}

// ─── Dash Stat ────────────────────────────────────────────────────────────────
function DashStat({ label, value, iconType, color }: { label: string; value: string; iconType: 'total' | 'avg' | 'max'; color: string }) {
  return (
    <View style={[styles.statCard, { backgroundColor: color }]}>
      <View style={styles.statIconContainer}>
        <MiniDashboardIcon name={iconType} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function getPatternName(p: string) {
  const map: Record<string, string> = { stripes: 'horizontal stripes', dots: 'dots', swirls: 'swirls', solid: 'solid' };
  return map[p] || p;
}
function getTimingLabel(t: string) {
  const map: Record<string, string> = { morning: 'in the morning', evening: 'in the evening', random: 'randomly' };
  return map[t] || t;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FDF9F2' },
  // PIN
  pinContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  pinIconWrapper: {
    marginBottom: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFEEDB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1E1B4B',
  },
  pinTitle: { fontSize: 26, fontWeight: '900', color: '#1E1B4B', textAlign: 'center', marginBottom: 6 },
  pinSub: { fontSize: 16, fontWeight: '700', color: '#6B7280', marginBottom: 24, textAlign: 'center' },
  pinHint: { fontSize: 14, fontWeight: '800', color: '#D97706', marginBottom: 12, textAlign: 'center' },
  pinInput: {
    width: 180, height: 68, borderRadius: 22, borderWidth: 3, borderColor: '#1E1B4B',
    backgroundColor: 'white', fontSize: 32, fontWeight: '800', color: '#1E1B4B',
    letterSpacing: 12, textAlign: 'center',
    shadowColor: '#1E1B4B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10,
  },
  pinError: { color: '#EF4444', fontSize: 14, fontWeight: '800', marginTop: 10 },
  pinBtn: {
    marginTop: 24, backgroundColor: '#FF9F1C', paddingHorizontal: 48, paddingVertical: 16,
    borderRadius: 20, borderWidth: 3, borderColor: '#1E1B4B',
    shadowColor: '#1E1B4B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8,
  },
  pinBtnText: { color: 'white', fontSize: 18, fontWeight: '900' },
  backLink: { marginTop: 24, padding: 10 },
  backLinkText: { color: '#9CA3AF', fontSize: 16, fontWeight: '800' },
  
  // Dashboard Header
  dashHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10,
  },
  closeBtnWrapper: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFEEDB',
    justifyContent: 'center', alignItems: 'center', borderWidth: 2.5, borderColor: '#1E1B4B',
  },
  closeBtn: { fontSize: 18, color: '#1E1B4B', fontWeight: '900' },
  dashTitle: { fontSize: 22, fontWeight: '900', color: '#1E1B4B' },

  // Tabs
  tabs: {
    flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 16,
  },
  tab: {
    flex: 1, height: 48, borderRadius: 16, backgroundColor: '#FFFDF9',
    alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: '#1E1B4B',
  },
  tabActive: { backgroundColor: '#FF9F1C' },
  tabText: { fontSize: 14, fontWeight: '900', color: '#1E1B4B', opacity: 0.6 },
  tabTextActive: { color: 'white', opacity: 1 },
  
  scroll: { padding: 16, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 19, fontWeight: '900', color: '#1E1B4B', marginBottom: 8, marginTop: 10,
  },
  sectionSub: {
    fontSize: 14, color: '#6B7280', marginBottom: 18, lineHeight: 20, fontWeight: '600',
  },

  // Character display
  charDisplayCard: {
    backgroundColor: '#FFFDF9', borderRadius: 24, padding: 20, marginBottom: 16,
    flexDirection: 'row', alignItems: 'center', gap: 16, borderWidth: 3, borderColor: '#1E1B4B',
    shadowColor: '#1E1B4B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8,
  },
  charInfo: { flex: 1 },
  charInfoName: { fontSize: 24, fontWeight: '900', color: '#1E1B4B', marginBottom: 4 },
  charInfoSub: { fontSize: 13, color: '#9CA3AF', fontWeight: '600' },

  // Edit/Update Details button
  editBtn: {
    backgroundColor: '#FF9F1C',
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#1E1B4B',
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#1E1B4B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8,
    elevation: 4,
  },
  editBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: 'white',
  },

  // Medical key cards
  medCard: {
    backgroundColor: 'white', borderRadius: 22, padding: 18, marginBottom: 14,
    borderWidth: 3, borderColor: '#1E1B4B',
    shadowColor: '#1E1B4B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 6,
  },
  medCardHighlight: { backgroundColor: '#FFF5F5', borderColor: '#EF4444' },
  medCardTop: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 12 },
  medIconContainer: {
    width: 42, height: 42, borderRadius: 12, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#1E1B4B',
  },
  medCardTopText: { flex: 1 },
  medVisual: { fontSize: 12, color: '#9CA3AF', fontWeight: '800', marginBottom: 4, textTransform: 'uppercase' },
  medVisualValueRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  colorSwatch: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#1E1B4B' },
  medVisualValue: { fontSize: 16, fontWeight: '900', color: '#1E1B4B' },
  medCardDivider: { height: 2, backgroundColor: '#1E1B4B', opacity: 0.15, marginBottom: 12 },
  medLabel: { fontSize: 16, fontWeight: '900', color: '#1E1B4B', marginBottom: 6 },
  medDesc: { fontSize: 14, color: '#4B5563', lineHeight: 20, fontWeight: '600' },

  // Summary Card
  summaryCard: {
    backgroundColor: '#FFEEDB', borderRadius: 22, padding: 20, marginBottom: 24,
    borderWidth: 3, borderColor: '#1E1B4B',
  },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  summaryTitle: { fontSize: 18, fontWeight: '900', color: '#1E1B4B' },
  summaryText: { fontSize: 15, color: '#1E1B4B', lineHeight: 24, fontWeight: '700' },
  bold: { fontWeight: '900', color: '#1E1B4B' },

  // History & Empty
  entryRow: {
    flexDirection: 'row', backgroundColor: 'white', borderRadius: 20, padding: 16,
    marginBottom: 12, borderWidth: 3, borderColor: '#1E1B4B', gap: 12, alignItems: 'center',
    shadowColor: '#1E1B4B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 6,
  },
  entryBadge: { borderRadius: 14, paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center', minWidth: 80, borderWidth: 2, borderColor: '#1E1B4B' },
  entryLevel: { fontSize: 14, fontWeight: '900', color: '#1E1B4B' },
  entryNRS: { fontSize: 11, color: '#4B5563', fontWeight: '800', marginTop: 2 },
  entryText: { flex: 1 },
  entryReaction: { fontSize: 16, fontWeight: '900', color: '#1E1B4B' },
  entryMedNote: { fontSize: 13, color: '#D97706', fontWeight: '800', marginTop: 4 },
  entryDate: { fontSize: 12, color: '#9CA3AF', marginTop: 4, fontWeight: '700' },
  emptyCard: {
    backgroundColor: '#FFFDF9', borderRadius: 20, padding: 32, alignItems: 'center',
    borderWidth: 3, borderColor: '#1E1B4B', marginVertical: 12,
  },
  emptyText: { textAlign: 'center', color: '#9CA3AF', fontSize: 16, fontWeight: '800' },

  // Stats
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, borderRadius: 20, padding: 14, alignItems: 'center', borderWidth: 3, borderColor: '#1E1B4B' },
  statIconContainer: { marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: '900', color: '#1E1B4B' },
  statLabel: { fontSize: 11, color: '#4B5563', fontWeight: '800', textAlign: 'center', marginTop: 4 },

  // Chart
  chartCard: {
    backgroundColor: 'white', borderRadius: 24, padding: 20, marginBottom: 24,
    borderWidth: 3, borderColor: '#1E1B4B',
    shadowColor: '#1E1B4B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.05, shadowRadius: 10,
  },
  chartTitle: { fontSize: 16, fontWeight: '900', color: '#1E1B4B', marginBottom: 20, textAlign: 'center' },
  chart: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 130, marginBottom: 20 },
  barCol: { alignItems: 'center', gap: 3 },
  barTrack: { height: 90, justifyContent: 'flex-end' },
  barCount: { fontSize: 10, color: '#9CA3AF', fontWeight: '800' },
  bar: { width: 24, borderRadius: 8, minHeight: 6, borderWidth: 2, borderColor: '#1E1B4B' },
  barAvg: { fontSize: 11, fontWeight: '900', color: '#1E1B4B' },
  barDay: { fontSize: 10, color: '#9CA3AF', fontWeight: '800' },
  
  nrsLegend: { borderTopWidth: 2, borderColor: '#1E1B4B', opacity: 0.8, paddingTop: 16, gap: 8 },
  nrsRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nrsDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2.5, borderColor: '#1E1B4B' },
  nrsText: { fontSize: 13, color: '#4B5563', fontWeight: '800' },

  // Delete All Data button
  clearBtn: {
    marginTop: 20, borderWidth: 3, borderColor: '#EF4444', backgroundColor: '#FFF5F5',
    borderRadius: 18, paddingVertical: 16, alignItems: 'center',
    shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 6,
  },
  clearBtnText: { color: '#EF4444', fontWeight: '900', fontSize: 16 },
});
