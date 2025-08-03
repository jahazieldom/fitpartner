import { StyleSheet } from "react-native";
import colors from "./colors";
import spacing from "./spacing";

const components = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: spacing.sm,
    borderRadius: 6,
    marginBottom: spacing.md,
    fontFamily: "Cairo_400Regular",
  },
});

export default components;
