import React from "react";
import { Stack, Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
