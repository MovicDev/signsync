import {
  Dimensions,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import React, { useState } from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Formik } from "formik";
import * as Yup from "yup";
import { router } from "expo-router";
import { API_BASE_URL } from '../../../config';
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

 Dimensions.get("window");

const signup = () => {
  // State management
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    visible: false,
    title: "",
    message: "",
  });

  // Validation schema
  const validationSchema = Yup.object().shape({
    username: Yup.string().required("Username is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .required("Password is required"),
  });

  // Modal control functions
  const showModal = (title, message) => {
    setModalInfo({ visible: true, title, message });
  };

  const hideModal = () => {
    setModalInfo({ ...modalInfo, visible: false });
  };

  // Form submission handler
  const handleFormSubmit = async (values) => {
    setIsLoading(true);
  
    try {
      const response = await fetch(`${API_BASE_URL}/userSignup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || "Verify Your Mail";
        
        // Check for common error cases
        if (errorMessage.includes("already registered")) {
          showModal("Email Exists", "This email is already registered. Please use a different email or login.");
        } else if (errorMessage.includes("fields are required")) {
          showModal("Missing Information", "Please fill in all required fields.");
        } else {
          showModal("Registration Failed", errorMessage);
        }
        return;
      }
      const data = await response.json();
      if (data.success || response.status === 201) {
         hideModal();
         router.push({
       pathname: "/(pages)/forms/verifyCode",
       params: { email: values.email },
  });
      } else {
        showModal(
          "Something went wrong",
          data.message 
        );
      }
    } catch (error) {
      showModal(
        "Network Error",
        "Couldn't connect to the server. Please check your internet connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Modal Component */}
      <Modal
  animationType="fade"
  transparent={true}
  visible={modalInfo.visible}
  onRequestClose={hideModal}
>
  <View style={styles.modalOverlay}>
    <View style={[
      styles.modalContainer,
      modalInfo.title.includes('Success') ? styles.successModal : styles.errorModal
    ]}>
      <Text style={styles.modalTitle}>{modalInfo.title}</Text>
      <Text style={styles.modalMessage}>{modalInfo.message}</Text>
      <TouchableOpacity
        style={styles.modalButton}
        onPress={hideModal}
      >
        <Text style={styles.modalButtonText}>OK</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
      <Formik
        initialValues={{ username: "", email: "", password: "" }}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          isValid,
          touched,
        }) => (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : null}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Back Button */}
              <View style={styles.backButton}>
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={styles.backTouchable}
                >
                  <Icon name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
              </View>

              {/* Title */}
              <View style={styles.header}>
                <Text style={styles.title}>Register</Text>
                <Text style={styles.subtitle}>Create your account</Text>
              </View>

              {/* Form Inputs */}
              <View style={styles.formContainer}>
                {/* Username */}
                <Text style={styles.label}>Enter Your Username</Text>
                <View style={styles.inputContainer}>
                  <Icon name="account" size={24} color="#fff" />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your username"
                    onChangeText={handleChange("username")}
                    onBlur={handleBlur("username")}
                    value={values.username}
                    placeholderTextColor={"gray"}
                  />
                </View>
                {touched.username && errors.username && (
                  <Text style={styles.error}>{errors.username}</Text>
                )}

                {/* Email */}
                <Text style={styles.label}>Enter Your Email</Text>
                <View style={styles.inputContainer}>
                  <Icon name="email" size={24} color="#fff" />
                  <TextInput
                    style={styles.input}
                    placeholder="example@gmail.com"
                    keyboardType="email-address"
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                    value={values.email}
                    placeholderTextColor={"gray"}
                    autoCapitalize="none"
                  />
                </View>
                {touched.email && errors.email && (
                  <Text style={styles.error}>{errors.email}</Text>
                )}

                {/* Password */}
                <Text style={styles.label}>Enter Your Password</Text>
                <View style={styles.inputContainer}>
                  <Icon name="lock" size={24} color="#fff" />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    secureTextEntry={!showPassword}
                    onChangeText={handleChange("password")}
                    onBlur={handleBlur("password")}
                    value={values.password}
                    placeholderTextColor={"gray"}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Icon
                      name={showPassword ? "eye-off" : "eye"}
                      size={24}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </View>
                {touched.password && errors.password && (
                  <Text style={styles.error}>{errors.password}</Text>
                )}

                {/* Terms */}
                <Text style={styles.termsText}>
                  By registering, you are agreeing to our Terms of Use and
                  Privacy Policy
                </Text>

                {/* Register Button */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[
                      styles.loginButton,
                      (!isValid || isLoading) && styles.disabledButton,
                    ]}
                    onPress={handleSubmit}
                    activeOpacity={0.8}
                    disabled={!isValid || isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.loginButtonText}>REGISTER</Text>
                    )}
                  </TouchableOpacity>
                  <View style={styles.divider}>
                    <View style={styles.line} />
                    <Text style={styles.or}>or</Text>
                    <View style={styles.line} />
                  </View>
                  <TouchableOpacity style={styles.socialButton}>
                    <AntDesign
                      name="google"
                      size={24}
                      color="#DB4437"
                      style={styles.icon}
                    />
                    <Text style={styles.socialText}>Sign Up with Google</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.socialButton, styles.twitterButton]}
                  >
                    <FontAwesome6
                      name="x-twitter"
                      size={24}
                      color="black"
                      style={styles.icon}
                    />
                    <Text style={styles.socialText}>Sign Up with Twitter</Text>
                  </TouchableOpacity>
                  {/* Link to Sign In */}
                  <View style={styles.signInRow}>
                    <Text>Already have an account?</Text>
                    <TouchableOpacity
                      onPress={() => router.push("/(pages)/forms/login")}
                    >
                      <Text style={styles.signInText}> Sign In</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </Formik>
    </SafeAreaView>
  );
};

export default signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: "#fff",
    padding: 10,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20, // Add some padding at the bottom
  },
  backButton: {
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 20,
    backgroundColor: "transparent",
    alignItems: "flex-start",
    width: 40,
    height: 40,
    marginLeft: 10,
    justifyContent: "center",
  },
  backTouchable: {
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 50,
    color: "black",
  },
  subtitle: {
    fontSize: 15,
    color: "#000",
  },
  formContainer: {
    marginHorizontal: 10,
  },
  label: {
    marginHorizontal: 10,
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    borderRadius: 5,
    marginHorizontal: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
    height: 50,
  },
  input: {
    flex: 1,
    height: "100%",
    paddingLeft: 10,
    color: "#fff",
  },
  buttonContainer: {
    marginTop: 30,
    hoverShadowColor: "red",
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#000",
    marginHorizontal: 50,
    padding: 15,
    borderRadius: 30,
  },
  loginButton: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 30,
    marginHorizontal: 50,
    justifyContent: "center",
    alignItems: "center",
    height: 50,
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  loginButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  error: {
    color: "red",
    marginHorizontal: 10,
    marginBottom: 5,
    marginTop: -10,
    fontSize: 12,
  },
  signInRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  signInText: {
    fontWeight: "bold",
    textDecorationLine: "underline",
    color: "#333",
    marginLeft: 5,
  },
  termsText: {
    color: "#333",
    fontSize: 15,
    textAlign: "center",
    paddingHorizontal: 40,
    marginTop: 10,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 30,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#CCC",
  },
  or: {
    marginHorizontal: 10,
    color: "#888",
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F1F1",
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
    textAlign: "center",
    justifyContent: "center",
  },
  socialText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  twitterButton: {
    backgroundColor: "#E8F6FE",
  },
  icon: {
    marginRight: 12,
  },
  // Add these styles to your existing StyleSheet
modalOverlay: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
},
modalContainer: {
  width: '80%',
  backgroundColor: 'white',
  borderRadius: 10,
  padding: 20,
  alignItems: 'center',
},
modalTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  marginBottom: 10,
  color: '#333',
},
modalMessage: {
  fontSize: 16,
  textAlign: 'center',
  marginBottom: 20,
  color: '#666',
},
modalButton: {
  backgroundColor: '#000',
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 5,
},
modalButtonText: {
  color: 'white',
  fontSize: 16,
  fontWeight: 'bold',
},
successModal: {
  borderTopWidth: 4,
  borderTopColor: '#4BB543', // Green for success
},
errorModal: {
  borderTopWidth: 4,
  borderTopColor: '#ff3333', // Red for error
},
});
