import React, { useState } from "react";
import { SafeAreaView, Alert, StyleSheet, View, Text } from "react-native";
import { supabase } from "../lib/supabase";
import {
  Assets,
  Colors,
  Spacings,
  Button,
  Keyboard,
  TextField,
  TextFieldRef,
  FieldContextType,
  TextFieldProps,
  SegmentedControl,
  Icon,
} from "react-native-ui-lib";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    if (!session)
      Alert.alert("Please check your inbox for email verification!");
    setLoading(false);
  }

  return (
    <SafeAreaView className="bg-black h-full w-full">
      <View className="flex flex-col p-5">
        <View className="flex items-center flex-grow-0">
          <Text className="text-white text-6xl font-bold py-2 ">
            walletwise
          </Text>
        </View>

        <View className="flex flex-col flex-grow-0 mt-20">
          <View>
            <TextField
              className="my-5 bg-white/10 rounded-2xl px-2 py-5  text-white"
              onChangeText={(text) => setEmail(text)}
              value={email}
              placeholder={"Email"}
              floatingPlaceholder
              floatingPlaceholderColor={Colors.yellow20}
            />
          </View>
          <View>
            <TextField
              className="my-5 bg-white/10 rounded-2xl px-2 py-5 text-white"
              onChangeText={(text) => setPassword(text)}
              value={password}
              secureTextEntry={true}
              placeholder={"Password"}
              floatingPlaceholder
              floatingPlaceholderColor={Colors.yellow20}
              autoCapitalize={"none"}
            />
          </View>
        </View>

        <View className="flex flex-col justify-end mt-28">
          <Button
            className="my-5 rounded-2xl"
            size="large"
            label={"Sign In"}
            backgroundColor={Colors.yellow20}
            onPress={() => signInWithEmail()}
          />

          <Button
            className="my-5 rounded-2xl"
            size="large"
            label={"Sign Out"}
            backgroundColor={Colors.yellow20}
            onPress={() => signUpWithEmail()}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
