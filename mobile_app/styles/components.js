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
  card: {
    width: '100%',
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: spacing.md,
    marginVertical: spacing.sm,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 6,
    // elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: spacing.xs,
    color: colors.textPrimary || "#000",
  },
  cardContent: {
    fontSize: 14,
    color: colors.textSecondary || "#555",
  },
});

export default components;
