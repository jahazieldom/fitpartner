import { StyleSheet } from "react-native";
import spacing from "./spacing";

const layout = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    // flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  column: {
    flexDirection: "column",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  spaceBetween: {
    justifyContent: "space-between",
  },
  fullWidth: {
    width: "100%",
  },
  fullHeight: {
    height: "100%",
  },
  padding: {
    padding: spacing.md,
  },
  marginBottom: {
    marginBottom: spacing.md,
  },
  gap: {
    gap: spacing.sm, // Solo en React Native 0.71+
  },
});

export default layout;
