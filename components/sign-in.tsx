// import React, { useState } from "react";
// import { SafeAreaView, Alert, View, Text } from "react-native";
// import { supabase } from "@/lib/supabase";
// import { Colors, Button, TextField } from "react-native-ui-lib";

// type Props = {
//   onSignUp: () => void;
// };

// export default function SignIn({ onSignUp }: Props) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   async function signInWithEmail() {
//     if (!email || !password) {
//       Alert.alert("Error", "Please enter both email and password.");
//       return;
//     }

//     setLoading(true);
//     const { error } = await supabase.auth.signInWithPassword({
//       email: email,
//       password: password,
//     });

//     if (error) Alert.alert("Error", error.message);
//     setLoading(false);
//   }

//   return (
//     <SafeAreaView className="bg-black h-full w-full">
//       <View className="flex flex-col p-5">
//         <View className="flex items-center flex-grow-0">
//           <Text className="text-white text-6xl font-bold py-2">walletwise</Text>
//         </View>
//         <View className="flex flex-col flex-grow-0 mt-20">
//           <TextField
//             className="my-5 bg-white/10 rounded-2xl px-2 py-5 text-white"
//             onChangeText={setEmail}
//             value={email}
//             placeholder="Email"
//             floatingPlaceholder
//             floatingPlaceholderColor={Colors.yellow20}
//             keyboardType="email-address"
//             autoCapitalize="none"
//           />
//           <TextField
//             className="my-5 bg-white/10 rounded-2xl px-2 py-5 text-white"
//             onChangeText={setPassword}
//             value={password}
//             placeholder="Password"
//             floatingPlaceholder
//             floatingPlaceholderColor={Colors.yellow20}
//             secureTextEntry
//             autoCapitalize="none"
//           />
//         </View>
//         <View className="flex flex-col justify-end mt-28">
//           <Button
//             className="my-5 rounded-2xl"
//             size="large"
//             label="Sign In"
//             backgroundColor={Colors.yellow20}
//             onPress={signInWithEmail}
//             disabled={loading}
//           />
//           <Button
//             className="my-5 rounded-2xl"
//             size="large"
//             label="Create an Account"
//             backgroundColor={Colors.blue30}
//             onPress={onSignUp}
//           />
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// }

import React, { useState } from "react";
import {
  SafeAreaView,
  Alert,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { supabase } from "@/lib/supabase";

type Props = {
  onSignUp: () => void;
};

export default function SignIn({ onSignUp }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert("Error", error.message);
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* WalletWise Title */}
      <Text style={styles.title}>WalletWise</Text>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/147/147144.png",
          }} // Placeholder avatar image
          style={styles.avatar}
        />
      </View>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor="#BDBDBD"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#BDBDBD"
          autoCapitalize="none"
        />
        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Forgot password?</Text>
        </TouchableOpacity>
      </View>

      {/* Sign In Button */}
      <TouchableOpacity
        style={styles.signInButton}
        onPress={signInWithEmail}
        disabled={loading}
      >
        <Text style={styles.signInText}>Sign In</Text>
      </TouchableOpacity>

      {/* Register Option */}
      <TouchableOpacity onPress={onSignUp}>
        <Text style={styles.registerText}>
          Don’t have an account?{" "}
          <Text style={styles.registerLink}>Register</Text>
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0E0E0E", // Dark background for modern look
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#EFA00B", // Gold color for title to stand out
    textTransform: "uppercase", // Makes title text uppercase for strong branding
  },
  avatarContainer: {
    backgroundColor: "#1E1E1E", // Dark gray for avatar background to blend in
    borderRadius: 100,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#000", // Adds subtle shadow for depth
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  inputContainer: {
    width: "80%",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#1E1E1E", // Dark input background for consistency
    padding: 15,
    borderRadius: 30,
    fontSize: 16,
    color: "#fff", // White text for contrast
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#343434", // Border color for refined input field
  },
  forgotPassword: {
    marginTop: 10,
    color: "#EFA00B", // Gold color for emphasis
    textAlign: "right",
    fontSize: 14,
  },
  signInButton: {
    backgroundColor: "#EFA00B", // Gold sign-in button for visual appeal
    padding: 15,
    borderRadius: 30,
    width: "80%",
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#EFA00B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  signInText: {
    color: "#0E0E0E", // Dark text on light button for contrast
    fontSize: 18,
    fontWeight: "bold",
  },
  registerText: {
    fontSize: 14,
    color: "#BDBDBD", // Light gray text for subtle design
  },
  registerLink: {
    color: "#EFA00B", // Gold color for the register link
    fontWeight: "bold",
  },
});
