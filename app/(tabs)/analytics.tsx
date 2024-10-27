import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { PieChart, BarChart } from "react-native-gifted-charts";
import { supabase } from "../../lib/supabaseClient";
import { format, parseISO, subMonths } from "date-fns";
import { MaterialIcons } from "@expo/vector-icons";
import { Avatar } from "react-native-paper";
import { User } from "@supabase/supabase-js";
import AvatarClickHandle from "@/components/functions/AvatarClickHandle";
import { LinearGradient } from "expo-linear-gradient";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";

interface Profile {
  id: string;
  username: string;
  full_name: string;
  picture_url: string | null;
  website: string | null;
}

interface BankAccount {
  id: string;
  name: string;
  balance: number;
}

interface Transaction {
  transaction_id: string;
  user_id: string;
  amount: number;
  description: string;
  t_date: string;
  category: string;
  type: string;
  payment_method: {
    payment_method_id: string;
    payment_type: string;
  };
  merchant: {
    merchant_id: string;
    merchant_name: string;
    merchant_type: string;
  };
}

interface PieChartData {
  value: number;
  text: string;
  color: string;
  label: string;
}

interface BarChartData {
  value: number;
  label: string;
  frontColor: string;
}

const FinanceOverview = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalSpending, setTotalSpending] = useState(0);
  const [netSavings, setNetSavings] = useState(0);
  const [pieChartData, setPieChartData] = useState<PieChartData[]>([]);
  const [barChartData, setBarChartData] = useState<BarChartData[]>([]);
  const [selectedPieChartItem, setSelectedPieChartItem] =
    useState<PieChartData | null>(null);
  const [selectedBarChartItem, setSelectedBarChartItem] =
    useState<BarChartData | null>(null);

  let [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user?.id)
          .single();
        if (profileError) throw profileError;

        const { data: bankAccountsData, error: bankAccountsError } =
          await supabase
            .from("bankbalance")
            .select("*")
            .eq("user_id", user?.id);
        if (bankAccountsError) throw bankAccountsError;

        const { data: transactionData, error: transactionError } =
          await supabase
            .from("transactions")
            .select(
              `
            *,
            payment_method:payment_method_id (
              payment_method_id,
              payment_type
            ),
            merchant:merchant_id (
              merchant_id,
              merchant_name,
              merchant_type
            )
          `
            )
            .eq("user_id", user?.id);

        if (transactionError) throw transactionError;

        setUser(user);
        setProfile(profileData);
        setBankAccounts(bankAccountsData);
        setTransactions(transactionData);

        // Calculate totals
        const income = transactionData
          .filter((t) => t.type === "Deposit")
          .reduce((sum, t) => sum + t.amount, 0);
        const spending = transactionData
          .filter((t) => t.type === "Withdrawal")
          .reduce((sum, t) => sum + t.amount, 0);
        setTotalIncome(income);
        setTotalSpending(spending);
        setNetSavings(income - spending);

        // Calculate pie chart data
        const pieData = calculatePieChartData(transactionData);
        setPieChartData(pieData);

        // Calculate bar chart data
        const barData = calculateBarChartData(transactionData);
        setBarChartData(barData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "An unknown error occurred");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndProfile();
    const interval = setInterval(fetchUserAndProfile, 5000);

    return () => clearInterval(interval);
  }, []);

  const calculatePieChartData = (
    transactions: Transaction[]
  ): PieChartData[] => {
    const withdrawals = transactions.filter((t) => t.type === "Withdrawal");
    const totalWithdrawals = withdrawals.reduce((sum, t) => sum + t.amount, 0);

    const categorySpending = withdrawals.reduce(
      (acc: { [key: string]: number }, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      },
      {}
    );

    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#F7B731", "#5D5F6E"];
    return Object.entries(categorySpending)
      .map(([category, value], index) => ({
        value,
        text: `${((value / totalWithdrawals) * 100).toFixed(1)}%`,
        color: colors[index % colors.length],
        label: category,
      }))
      .sort((a, b) => b.value - a.value); // Sort by value in descending order
  };

  const calculateBarChartData = (
    transactions: Transaction[]
  ): BarChartData[] => {
    const monthlySpending: { [key: string]: number } = {};
    const today = new Date();
    const sixMonthsAgo = subMonths(today, 5);

    for (let i = 0; i <= 5; i++) {
      const month = format(subMonths(today, i), "MMM");
      monthlySpending[month] = 0;
    }

    transactions.forEach((t) => {
      if (t.type === "Withdrawal") {
        const transactionDate = parseISO(t.t_date);
        if (transactionDate >= sixMonthsAgo) {
          const month = format(transactionDate, "MMM");
          monthlySpending[month] += t.amount;
        }
      }
    });

    const colors = [
      "#4ECDC4",
      "#45B7D1",
      "#F7B731",
      "#FF6B6B",
      "#5D5F6E",
      "#A3A1FB",
    ];
    return Object.entries(monthlySpending)
      .reverse()
      .map(([month, value], index) => ({
        value,
        label: month,
        frontColor: colors[index % colors.length],
      }));
  };

  const formatDate = (date: string) => {
    return format(parseISO(date), "MMM d, yyyy");
  };

  const calculateAverageTransaction = (transactions: Transaction[]): number => {
    const withdrawals = transactions.filter((t) => t.type === "Withdrawal");
    return withdrawals.length > 0
      ? withdrawals.reduce((sum, t) => sum + t.amount, 0) / withdrawals.length
      : 0;
  };

  const getMostFrequentCategory = (transactions: Transaction[]): string => {
    const categoryCounts = transactions.reduce(
      (acc: { [key: string]: number }, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + 1;
        return acc;
      },
      {}
    );
    return (
      Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "N/A"
    );
  };

  const getHighestSpendingCategory = (
    transactions: Transaction[]
  ): { category: string; amount: number } => {
    const categorySpending = transactions.reduce(
      (acc: { [key: string]: number }, transaction) => {
        if (transaction.type === "Withdrawal") {
          acc[transaction.category] =
            (acc[transaction.category] || 0) + transaction.amount;
        }
        return acc;
      },
      {}
    );
    const highestCategory = Object.entries(categorySpending).sort(
      (a, b) => b[1] - a[1]
    )[0];
    return highestCategory
      ? { category: highestCategory[0], amount: highestCategory[1] }
      : { category: "N/A", amount: 0 };
  };

  const calculateMostUsedPaymentMethod = (
    transactions: Transaction[]
  ): string => {
    const paymentMethodCounts = transactions.reduce(
      (acc: { [key: string]: number }, transaction) => {
        acc[transaction.payment_method.payment_type] =
          (acc[transaction.payment_method.payment_type] || 0) + 1;
        return acc;
      },
      {}
    );
    return (
      Object.entries(paymentMethodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "N/A"
    );
  };

  const onPieChartPress = (item: PieChartData) => {
    setSelectedPieChartItem(item);
  };

  const onBarChartPress = (item: BarChartData) => {
    setSelectedBarChartItem(item);
  };

  if (loading || !fontsLoaded) {
    return (
      <View className="flex-1 bg-[#1a1a1a] justify-center items-center">
        <Text className="text-white text-lg font-poppins-regular">
          Loading...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-[#1a1a1a] justify-center items-center">
        <Text className="text-[#FF6B6B] text-lg font-poppins-regular">
          Error: {error}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#000000]">
      <ScrollView>
        <LinearGradient
          colors={["#1a1a1a", "#000000"]}
          className="flex-1 px-5 pt-5"
        >
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-white text-2xl font-poppins-semibold">
              Financial Overview
            </Text>
            <Avatar.Image
              size={40}
              source={require("../../assets/images/people_icon.png")}
              onTouchEnd={AvatarClickHandle}
            />
          </View>

          <View className="mb-5">
            <View className="bg-[#2a2a2a] rounded-3xl p-4 elevation-5 mb-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-[#9A9A9A] text-lg font-poppins-regular">
                  Income
                </Text>
                <Text className="text-white text-xl font-poppins-semibold">
                  ${totalIncome.toFixed(2)}
                </Text>
              </View>
            </View>

            <View className="bg-[#2a2a2a] rounded-3xl p-4 elevation-5 mb-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-[#9A9A9A] text-lg font-poppins-regular">
                  Expenses
                </Text>
                <Text className="text-white text-xl font-poppins-semibold">
                  ${totalSpending.toFixed(2)}
                </Text>
              </View>
            </View>

            <View className="bg-[#2a2a2a] rounded-3xl p-4 elevation-5">
              <View className="flex-row justify-between items-center">
                <Text className="text-[#9A9A9A] text-lg font-poppins-regular">
                  Savings
                </Text>
                <Text className="text-white text-xl font-poppins-semibold">
                  ${netSavings.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-[#2a2a2a] rounded-3xl my-5 p-5 elevation-5 items-center">
            <Text className="text-white text-xl font-poppins-semibold mb-4">
              Expense Breakdown
            </Text>
            <PieChart
              data={pieChartData}
              textColor="white"
              radius={150}
              innerRadius={80}
              textSize={12}
              labelsPosition="outward"
              showValuesAsLabels={true}
              onPress={onPieChartPress}
            />
            <View className="flex-row flex-wrap justify-center mt-5">
              {pieChartData.map((item, index) => (
                <View key={index} className="flex-row items-center mr-4 mb-2">
                  <View
                    className={`w-3 h-3 rounded-full mr-1`}
                    style={{ backgroundColor: item.color }}
                  />
                  <Text className="text-white text-xs font-poppins-regular">
                    {item.label} ({item.text})
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="bg-[#2a2a2a] rounded-3xl my-5 p-5 elevation-5 items-center">
            <Text className="text-white text-xl font-poppins-semibold mb-4">
              Monthly Spending
            </Text>
            <BarChart
              data={barChartData}
              barWidth={30}
              spacing={20}
              roundedTop
              roundedBottom
              hideRules
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={{
                color: "#9A9A9A",
                fontSize: 10,
                fontFamily: "Poppins_400Regular",
              }}
              xAxisLabelTextStyle={{
                color: "#9A9A9A",
                fontSize: 10,
                fontFamily: "Poppins_400Regular",
              }}
              noOfSections={5}
              maxValue={Math.max(...barChartData.map((item) => item.value))}
              onPress={onBarChartPress}
              height={200} // Add a fixed height
              width={300} // Add a fixed width
            />
          </View>

          {/* ... (keep the other data cards and transaction list, converting their styles to Tailwind CSS) */}
          <View className="space-y-4">
            <View className="bg-[#2a2a2a] rounded-3xl p-4 elevation-5">
              <Text className="text-[#9A9A9A] text-base font-poppins-regular mb-1">
                Average Transaction
              </Text>
              <Text className="text-white text-xl font-poppins-semibold">
                ${calculateAverageTransaction(transactions).toFixed(2)}
              </Text>
            </View>

            <View className="bg-[#2a2a2a] rounded-3xl p-4 elevation-5">
              <Text className="text-[#9A9A9A] text-base font-poppins-regular mb-1">
                Most Frequent Category
              </Text>
              <Text className="text-white text-xl font-poppins-semibold">
                {getMostFrequentCategory(transactions)}
              </Text>
            </View>

            <View className="bg-[#2a2a2a] rounded-3xl p-4 elevation-5">
              <Text className="text-[#9A9A9A] text-base font-poppins-regular mb-1">
                Highest Spending Category
              </Text>
              <Text className="text-white text-xl font-poppins-semibold">
                {getHighestSpendingCategory(transactions).category}
              </Text>
              <Text className="text-[#9A9A9A] text-sm font-poppins-regular mt-1">
                ${getHighestSpendingCategory(transactions).amount.toFixed(2)}
              </Text>
            </View>

            <View className="bg-[#2a2a2a] rounded-3xl p-4 elevation-5">
              <Text className="text-[#9A9A9A] text-base font-poppins-regular mb-1">
                Most Used Payment Method
              </Text>
              <Text className="text-white text-xl font-poppins-semibold">
                {calculateMostUsedPaymentMethod(transactions)}
              </Text>
            </View>
          </View>

          {/* <View className="mt-6">
            <Text className="text-white text-xl font-poppins-semibold mb-4">
              Recent Transactions
            </Text>
            {transactions.slice(0, 5).map((transaction, index) => (
              <TouchableOpacity
                key={transaction.transaction_id}
                className="flex-row items-center bg-[#2a2a2a] rounded-2xl p-4 mb-3 elevation-3"
              >
                <MaterialIcons
                  name={
                    transaction.type === "Deposit"
                      ? "attach-money"
                      : "money-off"
                  }
                  size={24}
                  color={transaction.type === "Deposit" ? "#4ECDC4" : "#FF6B6B"}
                  style={{ marginRight: 15 }}
                />
                <View className="flex-1">
                  <Text className="text-white text-base font-poppins-semibold">
                    {transaction.category}
                  </Text>
                  <Text className="text-[#9A9A9A] text-sm font-poppins-regular">
                    {formatDate(transaction.t_date)}
                  </Text>
                </View>
                <Text
                  className={`text-base font-poppins-semibold ${
                    transaction.type === "Withdrawal"
                      ? "text-[#FF6B6B]"
                      : "text-[#4ECDC4]"
                  }`}
                >
                  {transaction.type === "Withdrawal" ? "-" : "+"}$
                  {transaction.amount.toFixed(2)}
                </Text>
              </TouchableOpacity>
            ))}
          </View> */}
        </LinearGradient>
      </ScrollView>

      <Modal
        visible={!!selectedPieChartItem}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedPieChartItem(null)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-[#2a2a2a] p-5 rounded-3xl w-4/5">
            <Text className="text-white text-xl font-poppins-semibold mb-2">
              {selectedPieChartItem?.label}
            </Text>
            <Text className="text-[#9A9A9A] text-base font-poppins-regular mb-2">
              Amount: ${selectedPieChartItem?.value.toFixed(2)}
            </Text>
            <Text className="text-[#9A9A9A] text-base font-poppins-regular">
              Percentage: {selectedPieChartItem?.text}
            </Text>
            <TouchableOpacity
              className="mt-4 bg-[#3a3a3a] py-2 px-4 rounded-full"
              onPress={() => setSelectedPieChartItem(null)}
            >
              <Text className="text-white text-center font-poppins-regular">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!selectedBarChartItem}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedBarChartItem(null)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-[#2a2a2a] p-5 rounded-3xl w-4/5">
            <Text className="text-white text-xl font-poppins-semibold mb-2">
              {selectedBarChartItem?.label}
            </Text>
            <Text className="text-[#9A9A9A] text-base font-poppins-regular">
              Total Spending: ${selectedBarChartItem?.value.toFixed(2)}
            </Text>
            <TouchableOpacity
              className="mt-4 bg-[#3a3a3a] py-2 px-4 rounded-full"
              onPress={() => setSelectedBarChartItem(null)}
            >
              <Text className="text-white text-center font-poppins-regular">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default FinanceOverview;
