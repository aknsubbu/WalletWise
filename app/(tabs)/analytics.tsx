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

// ! Need to edit the second button for a different purpose

export default function AnalyticsPage() {
  return (
    <SafeAreaView>
      <View className=" flex flex-row p-5 ">
        <View className="flex flex-col justify-center">
          <Text className="text-3xl text-white font-bold">Your Hub</Text>
        </View>
        <View className="flex justify-center items-end  flex-grow">
          <Avatar.Image
            size={50}
            source={require("../../assets/images/people_icon.png")}
            onTouchEnd={AvatarClickHandle}
          />
        </View>
      </View>
      {/* end of header... start of page content */}
      <View className="flex flex-cpt-2 pl-5">
        <View className="flex flex-row max-w-screen-lg">
          <Button
            icon="cash"
            mode="contained"
            buttonColor="#EFA00B"
            onPress={() => console.log("Pressed")}
            className=" rounded-xl mr-1"
          >
            Edit your Budget
          </Button>
          <Button
            icon="cash-fast"
            mode="contained"
            buttonColor="#EFA00B"
            onPress={() => console.log("Pressed")}
            className=" rounded-xl ml-1"
          >
            Edit your Budget
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
