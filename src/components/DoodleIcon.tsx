import React from 'react';
import Svg, { Path, Circle, Line, G, Rect } from 'react-native-svg';

interface DoodleIconProps {
  name: string;
  size?: number;
  isSelected?: boolean;
}

export default function DoodleIcon({ name, size = 60, isSelected = false }: DoodleIconProps) {
  const strokeWidth = 3;
  const strokeColor = '#1E1B4B'; // dark blue stroke for outline/doodle look

  switch (name) {
    case 'stabbing':
      // Spiky multi-point star doodle with sparks (sharp pain)
      // Orange / yellow color palette
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60">
          {/* Main spiky star shape */}
          <Path
            d="M30 6 L35 21 L50 15 L41 29 L54 40 L38 39 L40 54 L30 42 L20 54 L22 39 L6 40 L19 29 L10 15 L25 21 Z"
            fill={isSelected ? '#F97316' : '#FFD0A6'}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Inner details to look sketchy */}
          <Path
            d="M30 14 L32 24 L42 20 L35 29"
            stroke={strokeColor}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
          {/* Little sparks */}
          <Circle cx={12} cy={12} r={2} fill="#EF4444" />
          <Circle cx={48} cy={10} r={2.5} fill="#EF4444" />
          <Circle cx={48} cy={48} r={2} fill="#EF4444" />
          <Circle cx={10} cy={46} r={2.5} fill="#EF4444" />
        </Svg>
      );

    case 'pressing':
      // Playful children's toy stack / pyramid (representing pressure/squeezing)
      // Multi-colored segments like the Adobe image
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60">
          {/* Base block (pink/red) */}
          <Path
            d="M12 48 L48 48 C48 44, 44 42, 40 42 L20 42 C16 42, 12 44, 12 48 Z"
            fill={isSelected ? '#EF4444' : '#FECACA'}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Second block (orange) */}
          <Path
            d="M16 42 L44 42 C44 38, 41 36, 38 36 L22 36 C19 36, 16 38, 16 42 Z"
            fill={isSelected ? '#F97316' : '#FFEDD5'}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Third block (green) */}
          <Path
            d="M20 36 L40 36 C40 32, 38 30, 36 30 L24 30 C22 30, 20 32, 20 36 Z"
            fill={isSelected ? '#10B981' : '#D1FAE5'}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Fourth block (blue) */}
          <Path
            d="M24 30 L36 30 C36 26, 34 24, 32 24 L28 24 C26 24, 24 26, 24 30 Z"
            fill={isSelected ? '#3B82F6' : '#DBEAFE'}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Yellow Star on top */}
          <Path
            d="M30 8 L33 14 L39 14 L34 18 L36 24 L30 20 L24 24 L26 18 L21 14 L27 14 Z"
            fill={isSelected ? '#FBBF24' : '#FEF08A'}
            stroke={strokeColor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Concentric squeeze arcs */}
          <Path
            d="M6 30 C4 24, 10 18, 10 18"
            fill="none"
            stroke={strokeColor}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <Path
            d="M54 30 C56 24, 50 18, 50 18"
            fill="none"
            stroke={strokeColor}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </Svg>
      );

    case 'spinning':
      // A colorful pinwheel toy with a stick (spinning feeling)
      // Pink, green, blue, yellow sails
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60">
          {/* Stick */}
          <Line
            x1={30}
            y1={30}
            x2={30}
            y2={54}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Pinwheel blades */}
          {/* Blade 1 (Blue) */}
          <Path
            d="M30 30 C30 20, 38 12, 38 20 C38 28, 30 30, 30 30"
            fill={isSelected ? '#3B82F6' : '#DBEAFE'}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Blade 2 (Pink) */}
          <Path
            d="M30 30 C40 30, 48 38, 40 38 C32 38, 30 30, 30 30"
            fill={isSelected ? '#EC4899' : '#FCE7F3'}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Blade 3 (Green) */}
          <Path
            d="M30 30 C30 40, 22 48, 22 40 C22 32, 30 30, 30 30"
            fill={isSelected ? '#10B981' : '#D1FAE5'}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Blade 4 (Yellow) */}
          <Path
            d="M30 30 C20 30, 12 22, 20 22 C28 22, 30 30, 30 30"
            fill={isSelected ? '#FBBF24' : '#FEF08A'}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Center Pin */}
          <Circle
            cx={30}
            cy={30}
            r={4}
            fill="#EF4444"
            stroke={strokeColor}
            strokeWidth={2}
          />
          {/* Spin arrows/decorations */}
          <Path
            d="M12 16 A 18 18 0 0 1 48 16"
            fill="none"
            stroke={strokeColor}
            strokeWidth={2}
            strokeDasharray="4 4"
            strokeLinecap="round"
          />
        </Svg>
      );

    case 'burning':
      // Cozy campfire with wooden logs and bright orange/yellow flames (burning pain)
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60">
          {/* Crossed logs */}
          <Path
            d="M14 48 L46 42"
            stroke={strokeColor}
            strokeWidth={5}
            strokeLinecap="round"
          />
          <Path
            d="M14 48 L46 42"
            stroke="#92400E"
            strokeWidth={3}
            strokeLinecap="round"
          />
          <Path
            d="M46 48 L14 42"
            stroke={strokeColor}
            strokeWidth={5}
            strokeLinecap="round"
          />
          <Path
            d="M46 48 L14 42"
            stroke="#B45309"
            strokeWidth={3}
            strokeLinecap="round"
          />

          {/* Outer Orange Flame */}
          <Path
            d="M30 8 C40 18, 46 26, 46 38 C46 46, 14 46, 14 38 C14 26, 20 18, 30 8 Z"
            fill={isSelected ? '#F97316' : '#FFEDD5'}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Inner Yellow Flame */}
          <Path
            d="M30 18 C36 24, 40 28, 40 38 C40 43, 20 43, 20 38 C20 28, 24 24, 30 18 Z"
            fill={isSelected ? '#FBBF24' : '#FEF08A'}
            stroke={strokeColor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Sparks */}
          <Circle cx={22} cy={12} r={1.5} fill="#EF4444" />
          <Circle cx={38} cy={10} r={2} fill="#F59E0B" />
        </Svg>
      );

    case 'morning':
      // Cute smiling sun doodle with wavy rays (morning pain)
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60">
          {/* Sun body */}
          <Circle
            cx={30}
            cy={30}
            r={15}
            fill={isSelected ? '#FBBF24' : '#FEF08A'}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* Wavy Rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            // Rays starting from r=18 to r=26
            const x1 = 30 + 18 * Math.cos(rad);
            const y1 = 30 + 18 * Math.sin(rad);
            const x2 = 30 + 26 * Math.cos(rad);
            const y2 = 30 + 26 * Math.sin(rad);
            // Draw slightly wavy rays
            const midX = 30 + 22 * Math.cos(rad) + 2 * Math.sin(rad);
            const midY = 30 + 22 * Math.sin(rad) - 2 * Math.cos(rad);
            return (
              <Path
                key={angle}
                d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
            );
          })}
          {/* Smiling face inside sun */}
          <Circle cx={25} cy={28} r={2} fill={strokeColor} />
          <Circle cx={35} cy={28} r={2} fill={strokeColor} />
          <Path
            d="M 26 34 Q 30 38 34 34"
            fill="none"
            stroke={strokeColor}
            strokeWidth={2}
            strokeLinecap="round"
          />
          {/* Rosy Cheeks */}
          <Circle cx={22} cy={31} r={1.5} fill="#EF4444" opacity={0.6} />
          <Circle cx={38} cy={31} r={1.5} fill="#EF4444" opacity={0.6} />
        </Svg>
      );

    case 'evening':
      // Sleepy crescent moon wearing a sleeping cap (evening pain)
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60">
          {/* Crescent Moon */}
          <Path
            d="M38 12 C26 12 16 22 16 34 C16 44, 24 52, 34 52 C37 52, 40 50, 42 48 C28 46, 24 30, 38 20 C42 20, 44 21, 46 22 C44 16, 41 12, 38 12 Z"
            fill={isSelected ? '#818CF8' : '#DBEAFE'}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Sleeping cap on top of moon */}
          <Path
            d="M26 16 C22 10, 16 10, 10 13 C12 18, 16 21, 23 21 Z"
            fill={isSelected ? '#EF4444' : '#FCA5A5'}
            stroke={strokeColor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Striped pattern on cap */}
          <Path
            d="M19 14 L16 17"
            stroke={strokeColor}
            strokeWidth={1.5}
          />
          <Path
            d="M23 15 L20 19"
            stroke={strokeColor}
            strokeWidth={1.5}
          />
          {/* Cap pompom */}
          <Circle
            cx={9}
            cy={12}
            r={3}
            fill="white"
            stroke={strokeColor}
            strokeWidth={1.5}
          />
          {/* Sleeping face */}
          <Path
            d="M27 34 Q29 32 31 34"
            fill="none"
            stroke={strokeColor}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <Path
            d="M27 39 H32"
            stroke={strokeColor}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          {/* Stars */}
          <Path
            d="M48 16 L49 19 L52 19 L50 21 L51 24 L48 22 L45 24 L46 21 L44 19 L47 19 Z"
            fill="#FEF08A"
            stroke={strokeColor}
            strokeWidth={1}
            strokeLinejoin="round"
          />
          <Path
            d="M12 40 L13 42 L15 42 L13.5 43.5 L14 45.5 L12 44 L10 45.5 L10.5 43.5 L9 42 L11 42 Z"
            fill="#FEF08A"
            stroke={strokeColor}
            strokeWidth={1}
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'random':
      // A bright, colorful rainbow with fluffy clouds (random / anytime pain)
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60">
          {/* Rainbow Arcs */}
          {/* Red Arc */}
          <Path
            d="M12 42 A 18 18 0 0 1 48 42"
            fill="none"
            stroke={isSelected ? '#EF4444' : '#FECACA'}
            strokeWidth={4.5}
            strokeLinecap="round"
          />
          {/* Yellow Arc */}
          <Path
            d="M16 42 A 14 14 0 0 1 44 42"
            fill="none"
            stroke={isSelected ? '#FBBF24' : '#FEF08A'}
            strokeWidth={4.5}
            strokeLinecap="round"
          />
          {/* Blue Arc */}
          <Path
            d="M20 42 A 10 10 0 0 1 40 42"
            fill="none"
            stroke={isSelected ? '#3B82F6' : '#DBEAFE'}
            strokeWidth={4.5}
            strokeLinecap="round"
          />

          {/* Left Cloud */}
          <Path
            d="M6 42 C4 42, 2 40, 2 37 C2 34, 5 32, 8 32 C9 29, 13 29, 15 32 C17 31, 20 33, 20 36 C20 39, 18 42, 14 42 Z"
            fill="white"
            stroke={strokeColor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Right Cloud */}
          <Path
            d="M40 42 C38 42, 36 39, 36 36 C36 33, 39 31, 41 32 C43 29, 47 29, 48 32 C51 32, 54 34, 54 37 C54 40, 52 42, 50 42 Z"
            fill="white"
            stroke={strokeColor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Outline support details on rainbow */}
          <Path
            d="M12 42 A 18 18 0 0 1 48 42"
            fill="none"
            stroke={strokeColor}
            strokeWidth={1.5}
            strokeDasharray="2 2"
          />
        </Svg>
      );

    case 'cant-play':
      // Colorful playground ball with a band-aid on it (stops me from playing)
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60">
          {/* Ball Base */}
          <Circle
            cx={30}
            cy={30}
            r={18}
            fill={isSelected ? '#10B981' : '#A7F3D0'}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* Ball stripes to make it look like a toy */}
          <Path
            d="M14 22 C22 28, 38 28, 46 22"
            fill="none"
            stroke={strokeColor}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <Path
            d="M14 38 C22 32, 38 32, 46 38"
            fill="none"
            stroke={strokeColor}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <Path
            d="M30 12 L30 48"
            fill="none"
            stroke={strokeColor}
            strokeWidth={1.5}
            strokeDasharray="3 3"
          />

          {/* Band-aid background */}
          <G transform="rotate(30, 30, 30)">
            <Rect
              x={14}
              y={24}
              width={32}
              height={12}
              rx={4}
              fill="#FFE2C4"
              stroke={strokeColor}
              strokeWidth={2.5}
            />
            {/* Band-aid center pad */}
            <Rect
              x={22}
              y={24.5}
              width={16}
              height={11}
              fill="#FDBA74"
              opacity={0.8}
            />
            {/* Band-aid dots */}
            <Circle cx={17} cy={30} r={1} fill={strokeColor} />
            <Circle cx={19} cy={30} r={1} fill={strokeColor} />
            <Circle cx={41} cy={30} r={1} fill={strokeColor} />
            <Circle cx={43} cy={30} r={1} fill={strokeColor} />
          </G>
        </Svg>
      );

    case 'tired':
      // A puffy, sleepy cloud with closed eyes and Zzz bubbles (makes me tired)
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60">
          {/* Cloud body */}
          <Path
            d="M18 42 C12 42, 8 38, 8 32 C8 26, 12 22, 18 23 C20 16, 36 16, 40 23 C46 22, 50 26, 50 32 C50 38, 46 42, 40 42 Z"
            fill={isSelected ? '#E2E8F0' : '#F1F5F9'}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Sleepy Eyes (^^) */}
          <Path
            d="M20 31 Q23 29 25 31"
            fill="none"
            stroke={strokeColor}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <Path
            d="M31 31 Q34 29 36 31"
            fill="none"
            stroke={strokeColor}
            strokeWidth={2}
            strokeLinecap="round"
          />
          {/* Calm Smile */}
          <Path
            d="M26 35 Q28 37 30 35"
            fill="none"
            stroke={strokeColor}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          {/* Zzz text doodles */}
          <Path
            d="M38 10 L44 10 L38 16 L44 16"
            fill="none"
            stroke={strokeColor}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M45 16 L49 16 L45 20 L49 20"
            fill="none"
            stroke={strokeColor}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'angry':
      // Red angry cloud with a yellow lightning bolt sticking out (makes me angry)
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60">
          {/* Angry Red/Coral Cloud */}
          <Path
            d="M18 36 C12 36, 8 32, 8 26 C8 20, 12 16, 18 17 C20 10, 36 10, 40 17 C46 16, 50 20, 50 26 C50 32, 46 36, 40 36 Z"
            fill={isSelected ? '#F43F5E' : '#FFE4E6'}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Angry Eyes (\ /) */}
          <Path
            d="M18 22 L24 24"
            stroke={strokeColor}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <Path
            d="M38 22 L32 24"
            stroke={strokeColor}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <Circle cx={21} cy={26} r={2} fill={strokeColor} />
          <Circle cx={35} cy={26} r={2} fill={strokeColor} />
          {/* Angry Frown mouth */}
          <Path
            d="M25 31 Q28 28 31 31"
            fill="none"
            stroke={strokeColor}
            strokeWidth={2}
            strokeLinecap="round"
          />

          {/* Lightning bolt coming out */}
          <Path
            d="M28 32 L20 44 L30 44 L24 55 L38 41 L28 41 Z"
            fill={isSelected ? '#FBBF24' : '#FEF08A'}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'alarm':
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60">
          {/* Radiating alarm lines */}
          <Path
            d="M12 28 C10 26, 10 22, 12 20"
            fill="none"
            stroke={strokeColor}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <Path
            d="M48 28 C50 26, 50 22, 48 20"
            fill="none"
            stroke={strokeColor}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <Path
            d="M15 15 L20 19"
            stroke={strokeColor}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <Path
            d="M45 15 L40 19"
            stroke={strokeColor}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <Path
            d="M30 10 L30 15"
            stroke={strokeColor}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          {/* Base of the siren */}
          <Path
            d="M16 42 L44 42 C46 42, 46 48, 44 48 L16 48 C14 48, 14 42, 16 42 Z"
            fill="#E2E8F0"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Siren glass dome */}
          <Path
            d="M20 42 C20 22, 40 22, 40 42 Z"
            fill={isSelected ? '#EF4444' : '#FCA5A5'}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Inner highlight line to make it shiny/doodly */}
          <Path
            d="M24 38 C24 28, 30 26, 30 26"
            fill="none"
            stroke="white"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </Svg>
      );

    default:
      return null;
  }
}


