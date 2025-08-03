import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { layout, typography, components, spacing } from "../../styles";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { login } from "../../services/auth";
import { showMessage } from "react-native-flash-message";
import { useRouter } from 'expo-router';

export default function LoginForm({ onSubmit }) {
  const router = useRouter();
  
  const [email, setEmail] = useState("jahaziel@admintotal.com");
  const [password, setPassword] = useState("oikjijok");
  const { setAuthenticated } = useAuth();

  const handleRegisterPress = async () => {
    router.push('/(auth)/register')
  }

  const handleLoginPress = async () => {
    try {
      let data = await login(email, password);
      let user = data.instance
      setAuthenticated(true)
      showMessage({
        message: `Hola ${user.first_name}!`,
        type: "success", // success, info, warning, danger
        icon: "success",
        duration: 3000,
      });
    } catch (error) {
      let errorData = error.data
      if (errorData.detail) {
        showMessage({
          message: "Login incorrecto",
          description: errorData.detail,
          type: "danger", // success, info, warning, danger
          icon: "danger",
          duration: 3000,
        });
      }
    }
  };

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

      <TouchableOpacity style={[components.button, { marginTop: spacing.md }]} onPress={handleLoginPress}>
        <Text style={components.buttonText}>Entrar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[components.button, { marginTop: spacing.md }]} onPress={handleRegisterPress}>
        <Text style={components.buttonText}>Registrarme</Text>
      </TouchableOpacity>
    </View>
  );
}
