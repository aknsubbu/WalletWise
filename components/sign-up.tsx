import React, { useState } from "react";
import { SafeAreaView, Alert, View, Text, ScrollView } from "react-native";
import { supabase } from "@/lib/supabase";
import { Colors, Button, TextField } from "react-native-ui-lib";

type Props = {
  onSignIn: () => void;
};

export default function SignUp({ onSignIn }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    if (!email || !password || !username || !fullName) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert("Error", error.message);
      console.log(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          username: username,
          full_name: fullName,
          avatar_url: avatarUrl || null,
          website: website || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.user.id);

      if (profileError) {
        console.error("Profile insert error:", profileError);
        Alert.alert(
          "Error",
          "Failed to create profile: " + profileError.message
        );
      } else {
        Alert.alert("Success", "Account created successfully!");
        onSignIn();
      }
    } else {
      console.error("Unexpected error: User data is null after sign up");
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    }

    setLoading(false);
  }

  return (
    <SafeAreaView className="bg-black h-full w-full">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="flex flex-col px-6 py-10">
          <View className="flex items-center flex-grow-0 mb-8">
            <Text className="text-white text-6xl font-bold">walletwise</Text>
          </View>
          <Text className="text-white text-2xl text-center mb-8">
            Create Your Account
          </Text>
          <View className="flex flex-col space-y-6">
            <TextField
              className="bg-white/10 rounded-2xl px-5 py-4 text-white"
              onChangeText={setEmail}
              value={email}
              placeholder="Email *"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextField
              className="bg-white/10 rounded-2xl px-5 py-4 text-white"
              onChangeText={setPassword}
              value={password}
              placeholder="Password *"
              secureTextEntry
              autoCapitalize="none"
            />
            <TextField
              className="bg-white/10 rounded-2xl px-5 py-4 text-white"
              onChangeText={setUsername}
              value={username}
              placeholder="Username *"
              autoCapitalize="none"
            />
            <TextField
              className="bg-white/10 rounded-2xl px-5 py-4 text-white"
              onChangeText={setFullName}
              value={fullName}
              placeholder="Full Name *"
            />
            <TextField
              className="bg-white/10 rounded-2xl px-5 py-4 text-white"
              onChangeText={setAvatarUrl}
              value={avatarUrl}
              placeholder="Avatar URL (optional)"
              autoCapitalize="none"
            />
            <TextField
              className="bg-white/10 rounded-2xl px-5 py-4 text-white"
              onChangeText={setWebsite}
              value={website}
              placeholder="Website (optional)"
              autoCapitalize="none"
            />
          </View>
          <View className="flex flex-col mt-10 space-y-4">
            <Button
              className="rounded-2xl"
              size={Button.sizes.large}
              label="Sign Up"
              backgroundColor={Colors.yellow20}
              onPress={signUpWithEmail}
              disabled={loading}
            />
            <Button
              className="rounded-2xl"
              size={Button.sizes.large}
              label="Back to Sign In"
              backgroundColor={Colors.blue30}
              onPress={onSignIn}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
