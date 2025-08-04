import React from "react";
import { Slot } from "expo-router";
import { ThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { AuthProvider } from "@/context/AuthContext";
import { useFonts } from "expo-font";
import { Cairo_300Light, Cairo_400Regular, Cairo_700Bold } from "@expo-google-fonts/cairo";
import { StatusBar } from "expo-status-bar";
import FlashMessage from "react-native-flash-message";
import SplashScreen from "./splashscreen";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Cairo_300Light,
    Cairo_400Regular,
    Cairo_700Bold,
  });

  if (!loaded) return <SplashScreen />;

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Slot />
        <FlashMessage position="top" />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
