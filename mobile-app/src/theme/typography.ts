import { Platform } from "react-native";

export const fontFamily = Platform.select({
  ios: {
    display: "Avenir Next",
    body: "System",
    mono: "Menlo",
  },
  android: {
    display: "sans-serif-medium",
    body: "sans-serif",
    mono: "monospace",
  },
  default: {
    display: "System",
    body: "System",
    mono: "monospace",
  },
});

export const typography = {
  hero: {
    fontSize: 32,
    lineHeight: 38,
    fontFamily: fontFamily?.display,
    fontWeight: "700" as const,
  },
  h1: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: fontFamily?.display,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: fontFamily?.display,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: fontFamily?.display,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fontFamily?.body,
    fontWeight: "400" as const,
  },
  bodyStrong: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fontFamily?.body,
    fontWeight: "600" as const,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fontFamily?.body,
    fontWeight: "500" as const,
  },
  button: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: fontFamily?.display,
    fontWeight: "700" as const,
  },
};
