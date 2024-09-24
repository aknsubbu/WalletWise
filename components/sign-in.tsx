import React, { useState } from "react";
import { SafeAreaView, Alert, View, Text } from "react-native";
import { supabase } from "@/lib/supabase";
import { Colors, Button, TextField } from "react-native-ui-lib";

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
    <SafeAreaView className="bg-black h-full w-full">
      <View className="flex flex-col p-5">
        <View className="flex items-center flex-grow-0">
          <Text className="text-white text-6xl font-bold py-2">walletwise</Text>
        </View>
        <View className="flex flex-col flex-grow-0 mt-20">
          <TextField
            className="my-5 bg-white/10 rounded-2xl px-2 py-5 text-white"
            onChangeText={setEmail}
            value={email}
            placeholder="Email"
            floatingPlaceholder
            floatingPlaceholderColor={Colors.yellow20}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextField
            className="my-5 bg-white/10 rounded-2xl px-2 py-5 text-white"
            onChangeText={setPassword}
            value={password}
            placeholder="Password"
            floatingPlaceholder
            floatingPlaceholderColor={Colors.yellow20}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>
        <View className="flex flex-col justify-end mt-28">
          <Button
            className="my-5 rounded-2xl"
            size="large"
            label="Sign In"
            backgroundColor={Colors.yellow20}
            onPress={signInWithEmail}
            disabled={loading}
          />
          <Button
            className="my-5 rounded-2xl"
            size="large"
            label="Create an Account"
            backgroundColor={Colors.blue30}
            onPress={onSignUp}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
