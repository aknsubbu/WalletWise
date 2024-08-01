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

import AvatarClickHandle from "@/components/functions/AvatarClickHandle";

export default function AddExpense() {
  return (
    <SafeAreaView>
      <View className=" flex flex-row p-5 ">
        <View className="flex flex-col justify-center">
          <Text className="text-3xl text-white font-bold">Add an Expense</Text>
        </View>
        <View className="flex justify-center items-end  flex-grow">
          <Avatar.Image
            size={50}
            source={require("../../assets/images/people_icon.png")}
            onTouchEnd={AvatarClickHandle}
          />
        </View>
      </View>
      <View className="pt-2 pl-5">
        <View>
          <Button
            icon="file-find"
            mode="contained"
            buttonColor="#EFA00B"
            onPress={() => console.log("Pressed")}
            className=" rounded-xl mx-1 my-3"
          >
            Browse Files
          </Button>
        </View>
        <View>
          <Button
            icon="camera"
            mode="contained"
            buttonColor="#EFA00B"
            onPress={() => console.log("Pressed")}
            className=" rounded-xl mx-1 my-3"
          >
            Take a Picture
          </Button>
        </View>
      </View>
      <View>{/* manual entry */}</View>
    </SafeAreaView>
  );
}
