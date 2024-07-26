import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  SafeAreaView,
  Image,
  ScrollView,
} from "react-native";
import { Button, Avatar } from "react-native-paper";

import HomePageChart from "@/components/homePageChart";
import SpendingsCard from "@/components/SpendingsCard";

const App = () => {
  const [name, setName] = useState("Karthikeyan");
  const [currMonthSpend, setCurrMonthSpend] = useState(54501);
  const [savingsImpact, setSavingsImpact] = useState(10);
  return (
    <SafeAreaView>
      <View className=" flex flex-row p-5 ">
        <View className="flex flex-col">
          <Text className="text-2xl text-white">Hi,</Text>
          <Text className="text-4xl font-extrabold text-white">{name}</Text>
        </View>
        <View className="flex justify-center items-end  flex-grow">
          <Avatar.Image
            size={50}
            source={require("../../assets/images/people_icon.png")}
          />
        </View>
      </View>
      {/* header over */}

      <ScrollView className="mb-20">
        <View className="pt-2 ">
          <View className="pl-5">
            <Text className="text-white text-2xl font-black">This month</Text>
            <Text className="pt-2 text-white text-4xl font-light">
              $ {currMonthSpend}
            </Text>
            <Text>
              <Text className="text-gray-500 text-xl ">Savings Impact</Text>
              <Text className="text-green-500 text-xl "> {savingsImpact}%</Text>
            </Text>
          </View>
          <View className="py-5 pr-5">
            <HomePageChart />
          </View>
          <View className="p-5 mb-10">
            <SpendingsCard category="Food" amount={2000} savingsImpact={10} />
            <SpendingsCard category="Travel" amount={5000} savingsImpact={10} />
            <SpendingsCard
              category="Entertainment"
              amount={5000}
              savingsImpact={10}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
