import React from "react";
import { View, Text } from "react-native";
import { LineChart } from "react-native-gifted-charts";

export default function HomePageChart() {
  const data1 = [
    { value: 70 },
    { value: 50 },
    { value: 40 },
    { value: 38 },
    { value: 60 },
    { value: 30 },
    { value: 50 },
    { value: 40 },
    { value: 18 },
  ];

  return (
    <View className="flex py-5 ">
      <LineChart
        areaChart
        curved
        data={data1}
        hideDataPoints
        hideRules
        spacing={68}
        color1="#EFA00B"
        startFillColor1="#EFA00B"
        endFillColor1="#11181C"
        startOpacity={0.9}
        endOpacity={0.2}
        initialSpacing={0}
        noOfSections={4}
        // yAxisColor="white"
        // yAxisThickness={0}
        // yAxisTextStyle={{ color: "gray" }}
        // yAxisLabelSuffix="%"
        // xAxisColor="lightgray"
      />
    </View>
  );
}
