import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  SafeAreaView,
  Image,
} from "react-native";
import { Button, Avatar } from "react-native-paper";

export default function ProfilePage() {
  const [name, setName] = useState("Karthikeyan");

  return (
    <SafeAreaView>
      <View className=" flex flex-row p-5 ">
        <View className="flex flex-col justify-center">
          <Text className="text-3xl text-white font-bold">{name}</Text>
        </View>
        <View className="flex justify-center items-end  flex-grow">
          <Avatar.Image
            size={50}
            source={require("../../assets/images/people_icon.png")}
          />
        </View>
      </View>
      <View className="pt-2 pl-5">
        <View>
          {/* <Text className="text-white font-bold text-2xl">Spendings</Text> */}
        </View>
      </View>
    </SafeAreaView>
  );
}
