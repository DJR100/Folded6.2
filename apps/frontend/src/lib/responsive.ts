import { useWindowDimensions } from "react-native";

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const baseW = 375; // iPhone 11/12/13/14 baseline width
  const baseH = 812; // baseline height

  const s = (size: number) => (width / baseW) * size; // horizontal scale
  const vs = (size: number) => (height / baseH) * size; // vertical scale
  const ms = (size: number, factor = 0.2) => size + (s(size) - size) * factor; // moderated

  const vw = (pct: number) => (width * pct) / 100;
  const vh = (pct: number) => (height * pct) / 100;

  const isSmallPhone = width < 360;
  const isTablet = Math.min(width, height) >= 768;

  return { width, height, s, vs, ms, vw, vh, isSmallPhone, isTablet };
}


