import {
  Dimensions,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Formik } from "formik";
import * as Yup from "yup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../../../config";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

// Validation Schema using Yup
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const showModal = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleFormSubmit = async (values) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/userSignin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful:", data);
        let mytoken = data.token;
        await AsyncStorage.setItem("token", mytoken);
        router.push("/(tabs)");
      } else {
        // console.error("Login failed:", data.message);
        showModal(
          "Login Failed",
          data.message || "Please check your credentials."
          
        );
         router.push({
               pathname: "/(pages)/forms/verifyCode",
               params: { email: values.email },
          });
      }
    } catch (error) {
      // console.error("Error during login:", error);
      showModal("Error", "An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Alert Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
        validateOnMount={true}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          isValid,
        }) => (
          <KeyboardAvoidingView
            behavior={Platform.OS === "android" ? "padding" : "height"}
            style={styles.keyboardAvoidingView}
            keyboardVerticalOffset={Platform.OS === "android" ? 60 : 0}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps="handled"
            >
              {/* Header Image */}
              <View style={{backgroundColor:"#fff", margin:20, borderRadius:10, elevation:5}}>
              <View style={styles.profileContainer}>
                <Image
                  source={require("../../../assets/icon.png")}
                  style={styles.avatar}
                />
              </View>
              {/* Login Form */}
              <View style={styles.formContainer}>
                <Text style={styles.subtitle}>Reset Your password</Text>

                {/* Email Input */}
                <Text style={styles.label}>Enter Your Email</Text>
                <View style={styles.inputContainer}>
                  <MaterialIcons
                    name="email"
                    size={24}
                    color="#fff"
                    style={styles.icon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="example@gmail.com"
                    placeholderTextColor="gray"
                    value={values.email}
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {touched.email && errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
                {/* Login Button with Loading Indicator */}
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
                    <Text style={styles.loginButtonText}>Reset Password</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.divider}>
                  <View style={styles.line} />
                  <Text style={styles.or}>or</Text>
                  <View style={styles.line} />
                </View>

                {/* Sign Up Link */}
                <View style={styles.signupContainer}>
                  <Text style={styles.signupText}>Already have an account?</Text>
                  <TouchableOpacity
                    onPress={() => router.push("/(pages)/forms/signin")}
                  >
                    <Text style={styles.signupLink}>Sign In</Text>
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

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: "#f2f2f2",
    shadowColor: "#000",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    marginTop: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 15,
    color: "#000",
    textAlign: "center",
    marginBottom: 30,
  },
  label: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
    marginLeft: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "black",
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#fff",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
  rememberForgotContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingHorizontal: 5,
  },
  rememberText: {
    color: "#333",
    fontSize: 15,
  },
  forgotText: {
    color: "#333",
    fontSize: 15,
    textDecorationLine: "underline",
  },
  loginButton: {
    backgroundColor: "#000",
    borderRadius: 30,
    marginHorizontal: 50,
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    marginTop:20
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
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",

  },
  signupText: {
    color: "#333",
    fontSize: 16,
  },
  signupLink: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
    textDecorationLine: "underline",
    marginLeft: 5,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#666",
  },
  modalButton: {
    backgroundColor: "#333",
    borderRadius: 10,
    padding: 12,
    paddingHorizontal: 30,
    elevation: 2,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  cialButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F1F1",
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
  },
  twitterButton: {
    backgroundColor: "#E8F6FE",
  },
  icon: {
    marginRight: 12,
  },
  socialText: {
    fontSize: 16,
    color: "#333",
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
    backgroundColor: "#ccc",
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
});
