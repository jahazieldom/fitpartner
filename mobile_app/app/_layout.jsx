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
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { LocaleConfig } from 'react-native-calendars';

function MagicLinkHandler() {
  useEffect(() => {
    // Detectar si la app ya estaba abierta
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });

    // Escuchar cuando la app se abre con un link
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleUrl(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleUrl = (url) => {
    const { queryParams } = Linking.parse(url);
    const token = queryParams?.token;

    if (token) {
      Alert.alert("Token recibido", token);
      // Aquí envías el token a tu API para validar y generar sesión
      // fetch("/auth/magic-login", { method: "POST", body: JSON.stringify({ token }) })
    }
  };

  return null;
}

LocaleConfig.locales['es'] = {
  monthNames: [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ],
  monthNamesShort: [
    'Ene','Feb','Mar','Abr','May','Jun',
    'Jul','Ago','Sep','Oct','Nov','Dic'
  ],
  dayNames: [
    'Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'
  ],
  dayNamesShort: ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
  today: 'Hoy'
};

LocaleConfig.defaultLocale = 'es';


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
      <SafeAreaProvider>
        <SafeAreaView edges={['top']} style={{flex: 1}}>
          <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <Slot />
            <MagicLinkHandler />
            <FlashMessage position="top" />
            <StatusBar style="auto" />
          </ThemeProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
