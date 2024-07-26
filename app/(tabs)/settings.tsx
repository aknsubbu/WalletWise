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
import { Switch } from "react-native-paper";

export default function SettingsPage() {
  const [budgetAlertToggle, setBudgetAlertToggle] = useState(false);
  const [weeklyReportToggle, setWeeklyReportToggle] = useState(false);
  const [monthlyReportToggle, setMonthlyReportToggle] = useState(false);

  const ToggleBudgetAlertSwitch = () =>
    setBudgetAlertToggle(!budgetAlertToggle);
  const ToggleWeeklyReportSwitch = () =>
    setWeeklyReportToggle(!weeklyReportToggle);
  const ToggleMonthlyReportSwitch = () =>
    setMonthlyReportToggle(!monthlyReportToggle);

  return (
    <SafeAreaView>
      <View className="flex p-5">
        <Text className="text-white text-3xl font-bold py-2">Settings</Text>
        {/* Settings Begin */}
        <View className="flex flex-col">
          {/* budget alerts */}
          <View className="flex flex-row items-center py-2">
            <View className="flex flex-col">
              <Text className="text-white text-xl">
                Automated Budget Alerts
              </Text>
              <Text className="text-gray-500 break-before-auto ">
                On Push Notification
              </Text>
            </View>
            <View className="flex flex-grow justify-end items-end mr-5">
              <Switch
                value={budgetAlertToggle}
                onValueChange={ToggleBudgetAlertSwitch}
                color="#EFA00B"
              />
            </View>
          </View>
          {/*Reports */}
          {/* Weekly Report */}
          <View className="flex flex-row items-center py-2">
            <View className="flex flex-col">
              <Text className="text-white text-xl">
                Get Weekly Spending Reports
              </Text>
              <Text className="text-gray-500 break-before-auto ">
                A customised spending flashback
              </Text>
            </View>
            <View className="flex flex-grow justify-end items-end mr-5">
              <Switch
                value={weeklyReportToggle}
                onValueChange={ToggleWeeklyReportSwitch}
                color="#EFA00B"
              />
            </View>
          </View>
          {/* Montly Report */}
          <View className="flex flex-row items-center py-2">
            <View className="flex flex-col">
              <Text className="text-white text-xl">
                Get Montly Spending Reports
              </Text>
              <Text className="text-gray-500 break-before-auto ">
                A customised spending flashback
              </Text>
            </View>
            <View className="flex flex-grow justify-end items-end mr-5">
              <Switch
                value={monthlyReportToggle}
                onValueChange={ToggleMonthlyReportSwitch}
                color="#EFA00B"
              />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
