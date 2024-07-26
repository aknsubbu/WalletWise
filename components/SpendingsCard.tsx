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

interface SpendingsCardProps {
  category: string;
  amount: number;
  savingsImpact: number;
}

export default function SpendingsCard(data: SpendingsCardProps) {
  return (
    <View className="border-2 border-gray-500 p-5 rounded-xl m-2 ">
      <Text className="text-white text-2xl font-bold">{data.category}</Text>
      <Text className="pt-2 text-white text-4xl font-light">
        $ {data.amount}
      </Text>
      <Text>
        <Text className="text-gray-500 text-xl ">Savings Impact</Text>
        <Text className="text-green-500 text-xl "> {data.savingsImpact}%</Text>
      </Text>
    </View>
  );
}
