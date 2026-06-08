import Svg, { Circle, Path } from 'react-native-svg';

interface BrandMarkProps {
  size?: number;
}

export function BrandMark({ size = 42 }: BrandMarkProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Circle cx="32" cy="32" r="32" fill="#2BE4A3" />
      <Path d="M20 18c6 4 9 9 10 14-1 8-5 14-12 18" stroke="#06121B" strokeWidth="4" strokeLinecap="round" />
      <Path d="M44 18c-6 4-9 9-10 14 1 8 5 14 12 18" stroke="#06121B" strokeWidth="4" strokeLinecap="round" />
      <Circle cx="32" cy="32" r="5" fill="#06121B" />
    </Svg>
  );
}
