import { StyleSheet } from "react-native";
import colors from "./colors";

const typography = StyleSheet.create({
  heading: {
    fontSize: 28,
    color: colors.text,
    paddingVertical: 10,
    fontFamily: "Cairo_700Bold",
  },
  subheading: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  body: {
    fontSize: 14,
    color: colors.text,
    fontFamily: "Cairo_400Regular",
  },
  muted: {
    fontSize: 14,
    color: colors.muted,
  },
});

export default typography;
