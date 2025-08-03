import { Stack, useRouter, useSegments } from "expo-router";
import { ThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { useFonts, Cairo_300Light, Cairo_400Regular, Cairo_700Bold } from "@expo-google-fonts/cairo";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import FlashMessage from "react-native-flash-message";
import SplashScreen from './splashscreen'

function AppRouter() {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated === null) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(app)/");
    }
  }, [isAuthenticated, segments]);

  return (
    <Stack>
      {/* Define aquí tus pantallas */}
      <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
      <Stack.Screen name="(app)/index" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

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
        <AppRouter />
        <FlashMessage position="top" />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
