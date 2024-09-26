import React, { useState, useEffect } from "react";
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
import { Button, Avatar, Card } from "react-native-paper";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { PieChart, LineChart, BarChart } from "react-native-gifted-charts";
import AvatarClickHandle from "@/components/functions/AvatarClickHandle";

// ! Need to edit the second button for a different purpose

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
  label: string;
}

interface LineChartData {
  date: string;
  value: number;
}

interface BarChartData {
  value: number;
  label: string;
  frontColor: string;
}

export default function AnalyticsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchUserAndProfile();
    }, 5000);
    async function fetchUserAndProfile() {
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
        console.log(transactionData);
        console.log(bankAccountsData);
        setUser(user);
        setProfile(profileData);
        setBankAccounts(bankAccountsData);
        setTransactions(transactionData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "An unknown error occurred");
        console.log(e);
      } finally {
        setLoading(false);
      }
    }
    fetchUserAndProfile();

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-[#0E0E0E] justify-center items-center">
        <Text className="text-white font-xl font-light">Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-[#0E0E0E] justify-center items-center">
        <Text className="text-white">Error: {error}</Text>
      </View>
    );
  }

  const calculateTotalSpending = (transactions: Transaction[]): number => {
    return transactions.reduce(
      (total, transaction) =>
        transaction.type === "Withdrawal" ? total + transaction.amount : total,
      0
    );
  };

  const calculateTotalIncome = (transactions: Transaction[]): number => {
    return transactions.reduce(
      (total, transaction) =>
        transaction.type === "Deposit" ? total + transaction.amount : total,
      0
    );
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

  const getLatestTransaction = (
    transactions: Transaction[]
  ): Transaction | null => {
    return (
      transactions.sort(
        (a, b) => new Date(b.t_date).getTime() - new Date(a.t_date).getTime()
      )[0] || null
    );
  };

  const calculateNetSavings = (transactions: Transaction[]): number => {
    const income = calculateTotalIncome(transactions);
    const spending = calculateTotalSpending(transactions);
    return income - spending;
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0E0E0E" }}>
      <ScrollView>
        <View className="flex flex-row p-5">
          <View className="flex flex-col justify-center">
            <Text className="text-3xl text-white font-bold">Your Hub</Text>
          </View>
          <View className="flex justify-center items-end flex-grow">
            <Avatar.Image
              size={50}
              source={require("../../assets/images/people_icon.png")}
              onTouchEnd={AvatarClickHandle}
            />
          </View>
        </View>

        {/* <View className="flex flex-col p-5">
          <Button
            icon="cash"
            mode="contained"
            buttonColor="#EFA00B"
            onPress={() => console.log("Pressed")}
            className="rounded-xl mb-2"
          >
            Edit your Budget
          </Button>
          <Button
            icon="cash-fast"
            mode="contained"
            buttonColor="#EFA00B"
            onPress={() => console.log("Pressed")}
            className="rounded-xl"
          >
            Quick Actions
          </Button>
        </View> */}

        <View className="p-5">
          <Card className="mb-4 bg-[#262626]">
            <Card.Content>
              <Text className="text-white text-lg mb-2">Total Spending</Text>
              <Text className="text-[#EFA00B] text-2xl font-bold">
                ${calculateTotalSpending(transactions).toFixed(2)}
              </Text>
            </Card.Content>
          </Card>

          <Card className="mb-4 bg-[#262626]">
            <Card.Content>
              <Text className="text-white text-lg mb-2">Total Income</Text>
              <Text className="text-[#EFA00B] text-2xl font-bold">
                ${calculateTotalIncome(transactions).toFixed(2)}
              </Text>
            </Card.Content>
          </Card>

          <Card className="mb-4 bg-[#262626]">
            <Card.Content>
              <Text className="text-white text-lg mb-2">Net Savings</Text>
              <Text className="text-[#EFA00B] text-2xl font-bold">
                ${calculateNetSavings(transactions).toFixed(2)}
              </Text>
            </Card.Content>
          </Card>

          <Card className="mb-4 bg-[#262626]">
            <Card.Content>
              <Text className="text-white text-lg mb-2">
                Average Transaction
              </Text>
              <Text className="text-[#EFA00B] text-2xl font-bold">
                ${calculateAverageTransaction(transactions).toFixed(2)}
              </Text>
            </Card.Content>
          </Card>

          <Card className="mb-4 bg-[#262626]">
            <Card.Content>
              <Text className="text-white text-lg mb-2">
                Most Frequent Category
              </Text>
              <Text className="text-[#EFA00B] text-2xl font-bold">
                {getMostFrequentCategory(transactions)}
              </Text>
            </Card.Content>
          </Card>

          <Card className="mb-4 bg-[#262626]">
            <Card.Content>
              <Text className="text-white text-lg mb-2">
                Highest Spending Category
              </Text>
              <Text className="text-[#EFA00B] text-2xl font-bold">
                {getHighestSpendingCategory(transactions).category}
              </Text>
              <Text className="text-white">
                ${getHighestSpendingCategory(transactions).amount.toFixed(2)}
              </Text>
            </Card.Content>
          </Card>

          <Card className="mb-4 bg-[#262626]">
            <Card.Content>
              <Text className="text-white text-lg mb-2">
                Most Used Payment Method
              </Text>
              <Text className="text-[#EFA00B] text-2xl font-bold">
                {calculateMostUsedPaymentMethod(transactions)}
              </Text>
            </Card.Content>
          </Card>

          <Card className="mb-4 bg-[#262626]">
            <Card.Content>
              <Text className="text-white text-lg mb-2">
                Latest Transaction
              </Text>
              {getLatestTransaction(transactions) && (
                <>
                  <Text className="text-[#EFA00B] text-xl font-bold">
                    ${getLatestTransaction(transactions)?.amount.toFixed(2)}
                  </Text>
                  <Text className="text-white">
                    {getLatestTransaction(transactions)?.merchant.merchant_name}
                  </Text>
                  <Text className="text-gray-400">
                    {new Date(
                      getLatestTransaction(transactions)?.t_date || ""
                    ).toLocaleDateString()}
                  </Text>
                </>
              )}
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
