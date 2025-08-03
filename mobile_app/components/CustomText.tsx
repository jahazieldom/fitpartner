import { Text } from "react-native";

// Mapas para pesos y tamaños
const fontWeights = {
  light: "Cairo_300Light",
  regular: "Cairo_400Regular",
  bold: "Cairo_700Bold",
};

const fontSizes = {
  small: 14,
  medium: 16,
  large: 20,
};

export default function CustomText({
  children,
  weight = "regular", // 'light' | 'regular' | 'bold'
  size = "medium",     // 'small' | 'medium' | 'large'
  style,
  ...props
}) {
  const fontFamily = fontWeights[weight] || fontWeights.regular;
  const fontSize = fontSizes[size] || fontSizes.medium;

  return (
    <Text
      {...props}
      style={[{ fontFamily, fontSize }, style]}
    >
      {children}
    </Text>
  );
}
