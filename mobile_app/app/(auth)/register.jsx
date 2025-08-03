import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { layout, typography, components, spacing } from "../../styles";
import { validateEmail, register } from "../../services/auth";
import { useAuth } from "@/context/AuthContext";
import { showMessage } from "react-native-flash-message";

export default function RegisterWizard({ onSubmit }) {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [schema, setSchema] = useState("");

  const goToLogin = () => router.push("/(auth)/login");
  const { setAuthenticated } = useAuth();

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password); // opcional

    if (password.length < minLength) {
      return "Password must be at least 8 characters long.";
    }
    // if (!hasUpperCase) {
    //   return "Password must include at least one uppercase letter.";
    // }
    // if (!hasLowerCase) {
    //   return "Password must include at least one lowercase letter.";
    // }
    // if (!hasDigit) {
    //   return "Password must include at least one number.";
    // }
    // if (!hasSpecialChar) {
    //   return "Password must include at least one special character.";
    // }

    return null; // valid
  }

  const handleNextStep = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please complete all fields.");
      return;
    }

    let passwordValidationError = validatePassword(password)
    if (passwordValidationError) {
      Alert.alert("Error", passwordValidationError);
      return
    }

    let emailValidation = await validateEmail(email)
    if (emailValidation.status == "error") {
      Alert.alert("Error de validación", emailValidation.message);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error de validación", "Las contraseñas no coinciden");
      return;
    }

    setStep(2);
  };

  const handleSubmit = async () => {
    if (!firstName || !lastName) {
      Alert.alert("Error", "Es necesario especificar nombre y apellidos para continuar");
      return;
    }

    try {
      let response = await register({
        schema: schema,
        email: email,
        password: password,
        first_name: firstName,
        last_name: lastName,
        birth_date: Boolean(birthDate) ? birthDate : null,
      })
      let user = response.instance
      setAuthenticated(true)
      showMessage({
        message: `Hola ${user.first_name}!`,
        type: "success", // success, info, warning, danger
        icon: "success",
        duration: 3000,
      });
    } catch (error) {
      Alert.alert("Error en registro", error.data?.detail);
    }
  };

  return (
    <View style={[layout.padding]}>
      <Text style={typography.heading}>Sign Up</Text>

      {step === 1 && (
        <>
          <TextInput
            placeholder="Email"
            style={components.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            placeholder="Password"
            style={components.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TextInput
            placeholder="Confirm Password"
            style={components.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[components.button, { marginTop: spacing.md }]}
            onPress={handleNextStep}
          >
            <Text style={components.buttonText}>Next</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 2 && (
        <>
          <TextInput
            placeholder="Gimnasio"
            style={components.input}
            value={schema}
            onChangeText={setSchema}
          />
          { Boolean(schema && schema.trim()) && 
          <>
            <TextInput
              placeholder="First Name"
              style={components.input}
              value={firstName}
              onChangeText={setFirstName}
            />

            <TextInput
              placeholder="Last Name"
              style={components.input}
              value={lastName}
              onChangeText={setLastName}
            />

            <TextInput
              placeholder="Birth Date (YYYY-MM-DD)"
              style={components.input}
              value={birthDate}
              onChangeText={setBirthDate}
            />
            <TouchableOpacity
              style={[components.button, { marginTop: spacing.md }]}
              onPress={handleSubmit}
            >
              <Text style={components.buttonText}>Register</Text>
            </TouchableOpacity>
          </>
          }


          <TouchableOpacity
            style={[components.button, { marginTop: spacing.sm }]}
            onPress={() => setStep(1)}
          >
            <Text style={components.buttonText}>Back</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity
        style={[components.button, { marginTop: spacing.md }]}
        onPress={goToLogin}
      >
        <Text style={components.buttonText}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </View>
  );
}
