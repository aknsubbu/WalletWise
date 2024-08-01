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
import { router } from "expo-router";
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
      <View className=" flex flex-row pt-2 pl-5 w-full justify-center items-center gap-4">
        <View>
          <Button
            icon="file-find"
            mode="contained"
            buttonColor="#EFA00B"
            onPress={() => console.log("Pressed")}
            className=" rounded-xl mx-1 my-3 w-full"
          >
            Browse Files
          </Button>
        </View>
        <View>
          <Button
            icon="camera"
            mode="contained"
            buttonColor="#EFA00B"
            onPress={() => router.push("/OCRPage")}
            className=" rounded-xl mx-1 my-3 w-full"
          >
            Take a Picture
          </Button>
        </View>
      </View>
      <View>
        {/* manual entry */}
        <View className="flex flex-col p-5 ">
          <Text className="text-white text-xl font-bold">
            Add your spending manually
          </Text>
          <Text className="text-gray-500 pt-2">
            Add the details manually if you don&apos;t have a reciept...
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
