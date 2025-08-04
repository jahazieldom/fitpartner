import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { layout, typography, components, spacing } from "../../styles";
import { validateEmail, register, getCompanies } from "../../services/auth";
import { useAuth } from "@/context/AuthContext";
import { showMessage } from "react-native-flash-message";
import Autocomplete from '@/components/Autocomplete';

const getRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for(let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function RegisterWizard({ onSubmit }) {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const initialPass = getRandomString(9)
  const [email, setEmail] = useState(getRandomString(5) + "@test.com");
  const [password, setPassword] = useState(initialPass);
  const [confirmPassword, setConfirmPassword] = useState(initialPass);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [company, setCompany] = useState(null);
  const [companies, setCompanies] = useState([]);

  const goToLogin = () => router.push("/(auth)/login");
  const { setAuthenticated } = useAuth();

  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getCompanies();
        // Por seguridad valida que sea array
        if (Array.isArray(response.companies)) {
          setCompanies(response.companies);
        } else {
          setCompanies([]);
        }
      } catch (err) {
        console.error(err);
        setCompanies([]);
      }
    };

    fetchData();
  }, []);

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
        schema: company?.schema_name,
        email: email,
        password: password,
        first_name: firstName,
        last_name: lastName,
        birth_date: Boolean(birthDate) ? birthDate : null,
        source: "mobile_app",
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
          <View style={{ position: "relative", zIndex: 10 }}>
            <Autocomplete
              data={companies}
              labelKey="name"
              placeholder="Seleccionar gimnasio"
              initialValue={company}
              onSelect={(item) => setCompany(item)}
              containerStyle={{ marginVertical: 16 }}
            />
          </View>
          { Boolean(company) && 
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
