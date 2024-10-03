// import React, { useState, useEffect } from "react";
// import {
//   StyleSheet,
//   View,
//   TouchableOpacity,
//   Text,
//   Dimensions,
//   SafeAreaView,
//   Image,
//   ScrollView,
// } from "react-native";
// import { Button, Avatar, Card } from "react-native-paper";
// import { supabase } from "@/lib/supabase";
// import { User } from "@supabase/supabase-js";
// import { PieChart, LineChart, BarChart } from "react-native-gifted-charts";
// import AvatarClickHandle from "@/components/functions/AvatarClickHandle";

// // ! Need to edit the second button for a different purpose

// interface Profile {
//   id: string;
//   username: string;
//   full_name: string;
//   picture_url: string | null;
//   website: string | null;
// }

// interface BankAccount {
//   id: string;
//   name: string;
//   balance: number;
// }

// interface Transaction {
//   transaction_id: string;
//   user_id: string;
//   amount: number;
//   description: string;
//   t_date: string;
//   category: string;
//   type: string;
//   payment_method: {
//     payment_method_id: string;
//     payment_type: string;
//   };
//   merchant: {
//     merchant_id: string;
//     merchant_name: string;
//     merchant_type: string;
//   };
// }

// interface PieChartData {
//   value: number;
//   text: string;
//   label: string;
// }

// interface LineChartData {
//   date: string;
//   value: number;
// }

// interface BarChartData {
//   value: number;
//   label: string;
//   frontColor: string;
// }

// export default function AnalyticsPage() {
//   const [user, setUser] = useState<User | null>(null);
//   const [profile, setProfile] = useState<Profile | null>(null);
//   const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       fetchUserAndProfile();
//     }, 5000);
//     async function fetchUserAndProfile() {
//       try {
//         const {
//           data: { user },
//           error: userError,
//         } = await supabase.auth.getUser();
//         if (userError) throw userError;

//         const { data: profileData, error: profileError } = await supabase
//           .from("profiles")
//           .select("*")
//           .eq("id", user?.id)
//           .single();
//         if (profileError) throw profileError;

//         const { data: bankAccountsData, error: bankAccountsError } =
//           await supabase
//             .from("bankbalance")
//             .select("*")
//             .eq("user_id", user?.id);
//         if (bankAccountsError) throw bankAccountsError;

//         const { data: transactionData, error: transactionError } =
//           await supabase
//             .from("transactions")
//             .select(
//               `
//               *,
//               payment_method:payment_method_id (
//                 payment_method_id,
//                 payment_type
//               ),
//               merchant:merchant_id (
//                 merchant_id,
//                 merchant_name,
//                 merchant_type
//               )
//             `
//             )
//             .eq("user_id", user?.id);

//         if (transactionError) throw transactionError;
//         console.log(transactionData);
//         console.log(bankAccountsData);
//         setUser(user);
//         setProfile(profileData);
//         setBankAccounts(bankAccountsData);
//         setTransactions(transactionData);
//       } catch (e) {
//         setError(e instanceof Error ? e.message : "An unknown error occurred");
//         console.log(e);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchUserAndProfile();

//     return () => clearInterval(interval);
//   }, []);

//   if (loading) {
//     return (
//       <View className="flex-1 bg-[#0E0E0E] justify-center items-center">
//         <Text className="text-white font-xl font-light">Loading...</Text>
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View className="flex-1 bg-[#0E0E0E] justify-center items-center">
//         <Text className="text-white">Error: {error}</Text>
//       </View>
//     );
//   }

//   const calculateTotalSpending = (transactions: Transaction[]): number => {
//     return transactions.reduce(
//       (total, transaction) =>
//         transaction.type === "Withdrawal" ? total + transaction.amount : total,
//       0
//     );
//   };

//   const calculateTotalIncome = (transactions: Transaction[]): number => {
//     return transactions.reduce(
//       (total, transaction) =>
//         transaction.type === "Deposit" ? total + transaction.amount : total,
//       0
//     );
//   };

//   const calculateAverageTransaction = (transactions: Transaction[]): number => {
//     const withdrawals = transactions.filter((t) => t.type === "Withdrawal");
//     return withdrawals.length > 0
//       ? withdrawals.reduce((sum, t) => sum + t.amount, 0) / withdrawals.length
//       : 0;
//   };

//   const getMostFrequentCategory = (transactions: Transaction[]): string => {
//     const categoryCounts = transactions.reduce(
//       (acc: { [key: string]: number }, transaction) => {
//         acc[transaction.category] = (acc[transaction.category] || 0) + 1;
//         return acc;
//       },
//       {}
//     );
//     return (
//       Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
//       "N/A"
//     );
//   };

//   const getHighestSpendingCategory = (
//     transactions: Transaction[]
//   ): { category: string; amount: number } => {
//     const categorySpending = transactions.reduce(
//       (acc: { [key: string]: number }, transaction) => {
//         if (transaction.type === "Withdrawal") {
//           acc[transaction.category] =
//             (acc[transaction.category] || 0) + transaction.amount;
//         }
//         return acc;
//       },
//       {}
//     );
//     const highestCategory = Object.entries(categorySpending).sort(
//       (a, b) => b[1] - a[1]
//     )[0];
//     return highestCategory
//       ? { category: highestCategory[0], amount: highestCategory[1] }
//       : { category: "N/A", amount: 0 };
//   };

//   const getLatestTransaction = (
//     transactions: Transaction[]
//   ): Transaction | null => {
//     return (
//       transactions.sort(
//         (a, b) => new Date(b.t_date).getTime() - new Date(a.t_date).getTime()
//       )[0] || null
//     );
//   };

//   const calculateNetSavings = (transactions: Transaction[]): number => {
//     const income = calculateTotalIncome(transactions);
//     const spending = calculateTotalSpending(transactions);
//     return income - spending;
//   };

//   const calculateMostUsedPaymentMethod = (
//     transactions: Transaction[]
//   ): string => {
//     const paymentMethodCounts = transactions.reduce(
//       (acc: { [key: string]: number }, transaction) => {
//         acc[transaction.payment_method.payment_type] =
//           (acc[transaction.payment_method.payment_type] || 0) + 1;
//         return acc;
//       },
//       {}
//     );
//     return (
//       Object.entries(paymentMethodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
//       "N/A"
//     );
//   };

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: "#0E0E0E" }}>
//       <ScrollView>
//         <View className="flex flex-row p-5">
//           <View className="flex flex-col justify-center">
//             <Text className="text-3xl text-white font-bold">Your Hub</Text>
//           </View>
//           <View className="flex justify-center items-end flex-grow">
//             <Avatar.Image
//               size={50}
//               source={require("../../assets/images/people_icon.png")}
//               onTouchEnd={AvatarClickHandle}
//             />
//           </View>
//         </View>

//         {/* <View className="flex flex-col p-5">
//           <Button
//             icon="cash"
//             mode="contained"
//             buttonColor="#EFA00B"
//             onPress={() => console.log("Pressed")}
//             className="rounded-xl mb-2"
//           >
//             Edit your Budget
//           </Button>
//           <Button
//             icon="cash-fast"
//             mode="contained"
//             buttonColor="#EFA00B"
//             onPress={() => console.log("Pressed")}
//             className="rounded-xl"
//           >
//             Quick Actions
//           </Button>
//         </View> */}

//         <View className="p-5">
//           <Card className="mb-4 bg-[#262626]">
//             <Card.Content>
//               <Text className="text-white text-lg mb-2">Total Spending</Text>
//               <Text className="text-[#EFA00B] text-2xl font-bold">
//                 ${calculateTotalSpending(transactions).toFixed(2)}
//               </Text>
//             </Card.Content>
//           </Card>

//           <Card className="mb-4 bg-[#262626]">
//             <Card.Content>
//               <Text className="text-white text-lg mb-2">Total Income</Text>
//               <Text className="text-[#EFA00B] text-2xl font-bold">
//                 ${calculateTotalIncome(transactions).toFixed(2)}
//               </Text>
//             </Card.Content>
//           </Card>

//           <Card className="mb-4 bg-[#262626]">
//             <Card.Content>
//               <Text className="text-white text-lg mb-2">Net Savings</Text>
//               <Text className="text-[#EFA00B] text-2xl font-bold">
//                 ${calculateNetSavings(transactions).toFixed(2)}
//               </Text>
//             </Card.Content>
//           </Card>

//           <Card className="mb-4 bg-[#262626]">
//             <Card.Content>
//               <Text className="text-white text-lg mb-2">
//                 Average Transaction
//               </Text>
//               <Text className="text-[#EFA00B] text-2xl font-bold">
//                 ${calculateAverageTransaction(transactions).toFixed(2)}
//               </Text>
//             </Card.Content>
//           </Card>

//           <Card className="mb-4 bg-[#262626]">
//             <Card.Content>
//               <Text className="text-white text-lg mb-2">
//                 Most Frequent Category
//               </Text>
//               <Text className="text-[#EFA00B] text-2xl font-bold">
//                 {getMostFrequentCategory(transactions)}
//               </Text>
//             </Card.Content>
//           </Card>

//           <Card className="mb-4 bg-[#262626]">
//             <Card.Content>
//               <Text className="text-white text-lg mb-2">
//                 Highest Spending Category
//               </Text>
//               <Text className="text-[#EFA00B] text-2xl font-bold">
//                 {getHighestSpendingCategory(transactions).category}
//               </Text>
//               <Text className="text-white">
//                 ${getHighestSpendingCategory(transactions).amount.toFixed(2)}
//               </Text>
//             </Card.Content>
//           </Card>

//           <Card className="mb-4 bg-[#262626]">
//             <Card.Content>
//               <Text className="text-white text-lg mb-2">
//                 Most Used Payment Method
//               </Text>
//               <Text className="text-[#EFA00B] text-2xl font-bold">
//                 {calculateMostUsedPaymentMethod(transactions)}
//               </Text>
//             </Card.Content>
//           </Card>

//           <Card className="mb-4 bg-[#262626]">
//             <Card.Content>
//               <Text className="text-white text-lg mb-2">
//                 Latest Transaction
//               </Text>
//               {getLatestTransaction(transactions) && (
//                 <>
//                   <Text className="text-[#EFA00B] text-xl font-bold">
//                     ${getLatestTransaction(transactions)?.amount.toFixed(2)}
//                   </Text>
//                   <Text className="text-white">
//                     {getLatestTransaction(transactions)?.merchant.merchant_name}
//                   </Text>
//                   <Text className="text-gray-400">
//                     {new Date(
//                       getLatestTransaction(transactions)?.t_date || ""
//                     ).toLocaleDateString()}
//                   </Text>
//                 </>
//               )}
//             </Card.Content>
//           </Card>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { PieChart, BarChart } from "react-native-gifted-charts";
import { supabase } from "../../lib/supabaseClient";
import { format, parseISO, subMonths } from "date-fns";
import { MaterialIcons } from "@expo/vector-icons";
import { Card, Avatar, Button } from "react-native-paper";
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

  if (loading || !fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <LinearGradient
          colors={["#1a1a1a", "#2a2a2a"]}
          style={styles.gradientBackground}
        >
          <View style={styles.header}>
            <Text style={styles.headerText}>Financial Overview</Text>
            <Avatar.Image
              size={40}
              source={require("../../assets/images/people_icon.png")}
              onTouchEnd={AvatarClickHandle}
            />
          </View>

          <Card style={styles.summaryCard}>
            <Card.Content style={styles.summaryContent}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Income</Text>
                <Text style={styles.summaryValue}>
                  ${totalIncome.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Expenses</Text>
                <Text style={styles.summaryValue}>
                  ${totalSpending.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Savings</Text>
                <Text style={styles.summaryValue}>
                  ${netSavings.toFixed(2)}
                </Text>
              </View>
            </Card.Content>
          </Card>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Expense Breakdown</Text>
            <PieChart
              data={pieChartData}
              // showText
              textColor="white"
              radius={150}
              innerRadius={80}
              textSize={12}
              labelsPosition="outward"
              showValuesAsLabels={true}
            />
            <View style={styles.legendContainer}>
              {pieChartData.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendColor,
                      { backgroundColor: item.color },
                    ]}
                  />
                  <Text style={styles.legendText}>
                    {item.label} ({item.text})
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Monthly Spending</Text>
            <BarChart
              data={barChartData}
              barWidth={30}
              spacing={20}
              roundedTop
              roundedBottom
              hideRules
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={styles.chartAxisText}
              xAxisLabelTextStyle={styles.chartAxisText}
              noOfSections={5}
              maxValue={Math.max(...barChartData.map((item) => item.value))}
            />
          </View>

          <Card style={styles.dataCard}>
            <Card.Content>
              <Text style={styles.dataTitle}>Average Transaction</Text>
              <Text style={styles.dataValue}>
                ${calculateAverageTransaction(transactions).toFixed(2)}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.dataCard}>
            <Card.Content>
              <Text style={styles.dataTitle}>Most Frequent Category</Text>
              <Text style={styles.dataValue}>
                {getMostFrequentCategory(transactions)}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.dataCard}>
            <Card.Content>
              <Text style={styles.dataTitle}>Highest Spending Category</Text>
              <Text style={styles.dataValue}>
                {getHighestSpendingCategory(transactions).category}
              </Text>
              <Text style={styles.dataSubValue}>
                ${getHighestSpendingCategory(transactions).amount.toFixed(2)}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.dataCard}>
            <Card.Content>
              <Text style={styles.dataTitle}>Most Used Payment Method</Text>
              <Text style={styles.dataValue}>
                {calculateMostUsedPaymentMethod(transactions)}
              </Text>
            </Card.Content>
          </Card>

          <View style={styles.transactionsList}>
            <Text style={styles.transactionsTitle}>Recent Transactions</Text>
            {transactions.slice(0, 5).map((transaction, index) => (
              <TouchableOpacity
                key={transaction.transaction_id}
                style={styles.transactionItem}
              >
                <MaterialIcons
                  name={
                    transaction.type === "Deposit"
                      ? "attach-money"
                      : "money-off"
                  }
                  size={24}
                  color={transaction.type === "Deposit" ? "#4ECDC4" : "#FF6B6B"}
                  style={styles.transactionIcon}
                />
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionCategory}>
                    {transaction.category}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {formatDate(transaction.t_date)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    transaction.type === "Withdrawal"
                      ? styles.expenseAmount
                      : styles.incomeAmount,
                  ]}
                >
                  {transaction.type === "Withdrawal"
                    ? `-$${transaction.amount.toFixed(2)}`
                    : `$${transaction.amount.toFixed(2)}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  gradientBackground: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingText: {
    fontFamily: "Poppins_400Regular",
    color: "white",
    fontSize: 18,
    textAlign: "center",
    marginTop: 50,
  },
  errorText: {
    fontFamily: "Poppins_400Regular",
    color: "#FF6B6B",
    fontSize: 18,
    textAlign: "center",
    marginTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 28,
    color: "white",
  },
  summaryCard: {
    backgroundColor: "#2a2a2a",
    borderRadius: 20,
    marginBottom: 20,
    elevation: 5,
  },
  summaryContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryLabel: {
    fontFamily: "Poppins_400Regular",
    color: "#9A9A9A",
    fontSize: 14,
  },
  summaryValue: {
    fontFamily: "Poppins_600SemiBold",
    color: "white",
    fontSize: 20,
    marginTop: 5,
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 20,
    backgroundColor: "#2a2a2a",
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  chartTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: "white",
    fontSize: 20,
    marginBottom: 15,
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
    marginBottom: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    fontFamily: "Poppins_400Regular",
    color: "white",
    fontSize: 12,
  },
  chartAxisText: {
    fontFamily: "Poppins_400Regular",
    color: "#9A9A9A",
    fontSize: 10,
  },
  dataCard: {
    backgroundColor: "#2a2a2a",
    borderRadius: 20,
    marginBottom: 15,
    elevation: 5,
  },
  dataTitle: {
    fontFamily: "Poppins_400Regular",
    color: "#9A9A9A",
    fontSize: 14,
    marginBottom: 5,
  },
  dataValue: {
    fontFamily: "Poppins_600SemiBold",
    color: "white",
    fontSize: 20,
  },
  dataSubValue: {
    fontFamily: "Poppins_400Regular",
    color: "#9A9A9A",
    fontSize: 14,
    marginTop: 5,
  },
  transactionsList: {
    marginTop: 20,
  },
  transactionsTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: "white",
    fontSize: 20,
    marginBottom: 15,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    elevation: 3,
  },
  transactionIcon: {
    marginRight: 15,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionCategory: {
    fontFamily: "Poppins_600SemiBold",
    color: "white",
    fontSize: 16,
  },
  transactionDate: {
    fontFamily: "Poppins_400Regular",
    color: "#9A9A9A",
    fontSize: 12,
  },
  transactionAmount: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
  },
  incomeAmount: {
    color: "#4ECDC4",
  },
  expenseAmount: {
    color: "#FF6B6B",
  },
});

export default FinanceOverview;
