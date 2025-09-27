import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { layout, typography, components, spacing } from "../../styles";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { login as apiLogin } from "../../services/auth";
import { showMessage } from "react-native-flash-message";
import { useRouter } from "expo-router";
import { useEffect } from 'react';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("iliana@test.com");
  const [password, setPassword] = useState("oikjijok");

  const {login, authenticated, loading} = useAuth(); 

  useEffect(() => {
    if (!loading && authenticated) {
      router.replace("/(tabs)/home"); // si ya hay sesión, ir a home
    }
  }, [loading, authenticated]);

  const handleRegisterPress = () => {
    router.push('/(auth)/register');
  };

  const handleLoginPress = async () => {
    try {
      // Llamada a la API
      const data = await apiLogin(email, password);

      // Guardamos la sesión en el contexto y storage
      await login(data);

      showMessage({
        message: `Hola ${data.instance.first_name}!`,
        type: "success",
        icon: "success",
        duration: 3000,
      });

      router.replace("/(tabs)/home");
    } catch (error) {
      console.error(error)
      showMessage({
        message: "Login incorrecto",
        description: error?.data?.detail || "Ocurrió un error",
        type: "danger",
        icon: "danger",
        duration: 3000,
      });
    }
  };

  if (loading || (authenticated && !loading)) {
    return <View><Text>Cargando...</Text></View>;
  }

  return (
    <View style={[layout.padding]}>
      <Text style={typography.heading}>Iniciar sesión</Text>

      <TextInput
        placeholder="Correo electrónico"
        style={components.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Contraseña"
        style={components.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[components.button, { marginTop: spacing.md }]}
        onPress={handleLoginPress}
      >
        <Text style={components.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[components.button, { marginTop: spacing.md }]}
        onPress={handleRegisterPress}
      >
        <Text style={components.buttonText}>Registrarme</Text>
      </TouchableOpacity>
    </View>
  );
}
