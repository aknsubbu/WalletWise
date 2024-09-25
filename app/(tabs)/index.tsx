import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from "react-native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Provider } from "react-native-paper";

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

function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<
    "Bank Accounts" | "Cash" | "Debit Card" | "All"
  >("All");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesQuery = transaction.merchant.merchant_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesPaymentMethod =
      selectedFilter === "All" ||
      transaction.payment_method.payment_type === selectedFilter;

    return matchesQuery && matchesPaymentMethod;
  });

  if (loading) {
    return (
      <View className="flex-1 bg-[#0E0E0E] justify-center items-center">
        <Text className="text-white">Loading...</Text>
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

  return (
    <View className="flex-1 bg-[#0E0E0E] p-5">
      {/* User Information */}
      <View className="flex-row justify-between items-center mb-5">
        <View>
          <Text className="text-white text-lg font-bold">Welcome back</Text>
          <Text className="text-white text-4xl font-bold">
            {profile?.full_name || "User"}
          </Text>
        </View>
        <Image
          source={{
            uri:
              profile?.picture_url ||
              "https://randomuser.me/api/portraits/men/1.jpg",
          }}
          className="w-15 h-15 rounded-full"
        />
      </View>

      {/* Balance Card */}
      <View className="bg-[#EFA00B] p-5 rounded-2xl mb-5 flex-row justify-between items-center">
        <View>
          <Text className="text-white text-3xl font-bold">
            ${bankAccounts[0]?.balance.toFixed(2) || "0.00"}
          </Text>
          <Text className="text-white text-base">Net Balance</Text>
        </View>
        <FontAwesome name="bank" size={50} color="white" />
      </View>

      {/* Search Bar and Filter Button */}
      <View className="flex-row items-center mb-5">
        <TextInput
          className="flex-1 bg-[#333333] text-white rounded-xl p-3 mr-2"
          placeholder="Search for transactions"
          placeholderTextColor="gray"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          className="bg-[#333333] rounded-xl p-3 flex-row items-center"
          onPress={() => setFilterVisible(true)}
        >
          <Text className="text-white mr-2">Filter</Text>
          <MaterialIcons name="filter-list" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={filterVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFilterVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 bg-opacity-80">
          <View className="bg-[#222222] p-5 rounded-2xl w-4/5">
            <Text className="text-white text-xl mb-4">Select Filter</Text>
            {["All", "Bank Accounts", "Cash", "Debit Card"].map((option) => (
              <TouchableOpacity
                key={option}
                className="bg-[#444444] p-3 rounded-xl mb-2"
                onPress={() => {
                  setSelectedFilter(
                    option as "All" | "Bank Accounts" | "Cash" | "Debit Card"
                  );
                  setFilterVisible(false);
                }}
              >
                <Text className="text-white text-center">{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Transaction List with Scrollable View */}
      <ScrollView className="mb-5" nestedScrollEnabled={true}>
        <View className="p-3 bg-[#333333] rounded-xl">
          <Text className="text-white text-lg mb-2">Transactions</Text>

          {filteredTransactions.map((transaction, index) => (
            <View
              key={index}
              className="flex-row items-center p-4 bg-[#444444] rounded-xl mb-2"
            >
              <FontAwesome name="coffee" size={24} color="white" />
              <View className="flex-1 ml-3">
                <Text className="text-white text-base">
                  {transaction.merchant.merchant_name}
                </Text>
                <Text className="text-gray-400 text-sm">
                  {new Date(transaction.t_date).toLocaleDateString()}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-white text-sm">
                  ${transaction.amount.toFixed(2)}
                </Text>
                <Text
                  className={
                    transaction.type === "Deposit"
                      ? "text-green-500 text-sm"
                      : "text-red-500 text-sm"
                  }
                >
                  {transaction.type}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export default function App() {
  return (
    <Provider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#0E0E0E" }}>
        <Dashboard />
      </SafeAreaView>
    </Provider>
  );
}
