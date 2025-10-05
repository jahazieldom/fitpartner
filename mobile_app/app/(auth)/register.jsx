import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { layout, typography, components, spacing } from "../../styles";
import { validateEmail, register, getCompanies } from "../../services/auth";
import { useAuth } from "@/context/AuthContext";
import { showMessage } from "react-native-flash-message";
import Autocomplete from '@/components/Autocomplete';
import CustomText from '@/components/CustomText';
import DatePicker from '@/components/DatePicker';

export default function RegisterWizard({ onSubmit }) {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [company, setCompany] = useState(null);
  const [companies, setCompanies] = useState([]);

  const goToLogin = () => router.push("/(auth)/login");
  const { setAuthenticated } = useAuth();

  // Refs para los inputs
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const birthDateRef = useRef(null);

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
      passwordRef.current?.focus()
      return;
    }

    setStep(2)

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
      console.log(error)
      Alert.alert("Error en registro", error.data?.detail);
    }
  };

  const [showPicker, setShowPicker] = useState(false);

  return (
    <View style={[layout.padding]}>
      <Text style={typography.heading}>Crear mi cuenta</Text>

      {step === 1 && (
        <>
        <CustomText style={{paddingVertical: 10}}>Esta información es la que usarás para iniciar sesión.</CustomText>
          <TextInput
            placeholder="Email"
            style={components.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none" 
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            autoFocus
          />

          <TextInput
            placeholder="Password"
            style={components.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            ref={passwordRef}
            returnKeyType="next"
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
            selectTextOnFocus
          />

          <TextInput
            placeholder="Confirm Password"
            style={components.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            ref={confirmPasswordRef}
            returnKeyType="done"
            onSubmitEditing={handleNextStep}
            selectTextOnFocus
          />

          <TouchableOpacity
            style={[components.button, { marginTop: spacing.md }]}
            onPress={handleNextStep}
          >
            <Text style={components.buttonText}>Continuar</Text>
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
              autoFocus
            />
          </View>
          { Boolean(company) && 
          <>
            <TextInput
              placeholder="Nombre"
              style={components.input}
              value={firstName}
              onChangeText={setFirstName}
            />

            <TextInput
              placeholder="Apellidos"
              style={components.input}
              value={lastName}
              onChangeText={setLastName}
            />

            <TextInput
              placeholder="Fecha de nacimiento"
              style={components.input}
              value={birthDate}
              ref={birthDateRef}
              onFocus={() => {setShowPicker(true)}}
            />
            <TouchableOpacity
              style={[components.button, { marginTop: spacing.md }]}
              onPress={handleSubmit}
            >
              <Text style={components.buttonText}>Finalizar</Text>
            </TouchableOpacity>
          </>
          }


          <TouchableOpacity
            style={[components.button, { marginTop: spacing.sm }]}
            onPress={() => setStep(1)}
          >
            <Text style={components.buttonText}>Atrás</Text>
          </TouchableOpacity>
        </>
      )}


      <DatePicker 
        visible={showPicker} 
        onClose={() => setShowPicker(false)}
        onConfirm={(date) => {
          setBirthDate(date.toISOString().split('T')[0])
          birthDateRef.current.blur()
        }}
        label="Fecha de nacimiento"
      />

      <TouchableOpacity
        style={[components.button, { marginTop: spacing.md }]}
        onPress={goToLogin}
      >
        <Text style={components.buttonText}>¿Ya tienes una cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );
}
