import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import {
  Avatar,
  Button,
  Modal,
  Portal,
  Provider,
  TextInput,
  Menu,
} from "react-native-paper";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
// Assuming you have a type for your user

export default function AddExpense() {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [account, setAccount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [merchant, setMerchant] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customEntry, setCustomEntry] = useState("");
  const [customType, setCustomType] = useState<"category" | "account" | "">("");
  const [categories, setCategories] = useState([
    "Food",
    "Social Life",
    "Pets",
    "Transport",
    "Culture",
    "Household",
    "Apparel",
    "Beauty & Health",
    "Education",
    "Gift",
    "Other",
  ]);
  const [accounts, setAccounts] = useState([
    "Bank Accounts",
    "Cash",
    "Credit",
    "Other",
  ]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showTransactionTypeMenu, setShowTransactionTypeMenu] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);

  const headerFade = useRef(new Animated.Value(0)).current;
  const datePickerSlide = useRef(new Animated.Value(-50)).current;
  const saveButtonBounce = useRef(new Animated.Value(1)).current;
  const categorySlide = useRef(new Animated.Value(200)).current;
  const amountBounce = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.timing(headerFade, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    Animated.timing(categorySlide, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();

    Animated.spring(amountBounce, {
      toValue: 1,
      friction: 2,
      useNativeDriver: true,
    }).start();

    if (showDatePicker) {
      Animated.timing(datePickerSlide, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [
    headerFade,
    datePickerSlide,
    showDatePicker,
    categorySlide,
    amountBounce,
  ]);

  const handleSavePress = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("User not authenticated");

      if (!amount || !category || !type || !merchant || !account) {
        Alert.alert("Error", "Please fill in all required fields.");
        return;
      }

      // Check if user exists in the profiles table
      const { data: existingUser, error: userCheckError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (userCheckError) {
        if (userCheckError.code === "PGRST116") {
          Alert.alert("Error", "User not found. Please sign in again.");
          return;
        }
        throw userCheckError;
      }

      // Check if merchant exists or create a new one
      let merchantId;
      const { data: existingMerchant, error: merchantError } = await supabase
        .from("merchants")
        .select("merchant_id")
        .eq("merchant_name", merchant)
        .single();

      if (merchantError && merchantError.code !== "PGRST116") {
        throw merchantError;
      }

      if (!existingMerchant) {
        const { data: newMerchant, error: createError } = await supabase
          .from("merchants")
          .upsert({ merchant_name: merchant, merchant_type: category })
          .select()
          .single();

        if (createError) throw createError;
        merchantId = newMerchant.merchant_id;
      } else {
        merchantId = existingMerchant.merchant_id;
      }

      const transactionData = {
        user_id: user.id,
        amount: parseFloat(amount),
        t_date: date.toISOString(),
        category,
        payment_method: account, // Using account name directly instead of payment_method_id
        merchant_id: merchantId,
        type, // 'Deposit' or 'Withdrawal'
        description,
      };

      const { data, error } = await supabase
        .from("transactions")
        .insert([transactionData])
        .select();

      if (error) throw error;

      console.log("Transaction saved:", data);
      setShowSuccessModal(true);
      resetForm();
    } catch (error) {
      console.error("Error saving transaction:", error);
      Alert.alert("Error", "Failed to save transaction. Please try again.");
    }
  };
  const resetForm = () => {
    setAmount("");
    setCategory("");
    setAccount("");
    setDate(new Date());
    setPaymentMethod("");
    setMerchant("");
    setTransactionType("");
    setType("");
    setDescription("");
  };

  const handleOtherSelection = (type: "category" | "account") => {
    setCustomType(type);
    setShowCustomModal(true);
  };

  const handleAddCustomEntry = () => {
    if (customType === "category") {
      setCategories((prevCategories) => [
        ...prevCategories.filter((cat) => cat !== "Other"),
        customEntry,
        "Other",
      ]);
      setCategory(customEntry);
    } else if (customType === "account") {
      setAccounts((prevAccounts) => [
        ...prevAccounts.filter((acc) => acc !== "Other"),
        customEntry,
        "Other",
      ]);
      setAccount(customEntry);
    }
    setShowCustomModal(false);
    setCustomEntry("");
  };

  return (
    <Provider>
      <SafeAreaView className="flex-1 bg-[#0E0E0E]">
        <Animated.View
          className="flex-row items-center justify-between p-4 bg-[#1F1F1F]"
          style={{ opacity: headerFade }}
        >
          <Text className="text-2xl text-white font-bold">Add an Expense</Text>
          <Avatar.Image
            size={50}
            source={require("../../assets/images/people_icon.png")}
            onTouchEnd={() => console.log("Avatar clicked")}
          />
        </Animated.View>
        <ScrollView className="p-4">
          <View className="flex-row justify-center items-center gap-4 pt-2 pl-5 w-full">
            <View>
              <Button
                icon="file-find"
                mode="contained"
                buttonColor="#EFA00B"
                onPress={() => console.log("Pressed")}
                className="rounded-xl mx-1 my-3 w-full "
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
                className="rounded-xl mx-1 my-3 w-full"
              >
                Take a Picture
              </Button>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="my-2"
          >
            <Text className="text-[#EFA00B] text-base font-bold">Date</Text>
            <Text className="text-white text-base font-bold">
              {date.toDateString()}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <Animated.View
              style={{ transform: [{ translateY: datePickerSlide }] }}
            >
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDate(selectedDate);
                }}
              />
            </Animated.View>
          )}

          <Animated.View style={{ transform: [{ scale: amountBounce }] }}>
            <TextInput
              label="Amount"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              className="bg-[#333333] my-1 p-2 rounded text-white rounded-xl"
              theme={{ colors: { text: "#FFFFFF" } }}
            />
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: amountBounce }] }}>
            <TextInput
              label="Merchant"
              value={merchant}
              onChangeText={setMerchant}
              className=" bg-[#333333] my-1 p-2 rounded-xl text-white"
            />
          </Animated.View>
          <Animated.View style={{ transform: [{ scale: amountBounce }] }}>
            <TextInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              className="bg-[#333333] my-1 p-2 rounded-xl text-white"
              theme={{ colors: { text: "#FFFFFF" } }}
            />
          </Animated.View>

          <View className="my-2">
            <Text className="text-[#EFA00B] text-base font-bold p-2">
              Category
            </Text>
            <Animated.ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row"
              style={{ transform: [{ translateX: categorySlide }] }}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() =>
                    cat === "Other"
                      ? handleOtherSelection("category")
                      : setCategory(cat)
                  }
                  className={`p-4 mx-1 rounded-full ${
                    category === cat ? "bg-[#EFA00B]" : "bg-[#525252]"
                  }`}
                >
                  <Text className="text-white font-bold">{cat}</Text>
                </TouchableOpacity>
              ))}
            </Animated.ScrollView>
          </View>

          <View className="my-2">
            <Text className="text-[#EFA00B] text-base font-bold p-2">
              Payment Method
            </Text>
            <Animated.ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row"
            >
              {accounts.map((acc) => (
                <TouchableOpacity
                  key={acc}
                  onPress={() =>
                    acc === "Other"
                      ? handleOtherSelection("account")
                      : setAccount(acc)
                  }
                  className={`p-4 mx-1 rounded-full ${
                    account === acc ? "bg-[#EFA00B]" : "bg-[#525252]"
                  }`}
                >
                  <Text className="text-white font-bold">{acc}</Text>
                </TouchableOpacity>
              ))}
            </Animated.ScrollView>
          </View>

          <Menu
            visible={showTypeMenu}
            onDismiss={() => setShowTypeMenu(false)}
            anchor={
              <Button
                onPress={() => setShowTypeMenu(true)}
                className="p-2 border-2 border-[#EFA00B] rounded-xl m-2"
              >
                {type || "Select Type"}
              </Button>
            }
          >
            <Menu.Item
              onPress={() => {
                setType("Deposit");
                setShowTypeMenu(false);
              }}
              title="Deposit"
            />
            <Menu.Item
              onPress={() => {
                setType("Withdrawal");
                setShowTypeMenu(false);
              }}
              title="Withdrawal"
            />
          </Menu>

          <Animated.View style={{ transform: [{ scale: saveButtonBounce }] }}>
            <Pressable
              android_ripple={{ color: "#EFA00B", borderless: false }}
              onPress={handleSavePress}
              className="mt-5 p-2"
            >
              <Button icon="plus" mode="contained" buttonColor="#EFA00B">
                Add Transaction
              </Button>
            </Pressable>
          </Animated.View>
        </ScrollView>

        <Portal>
          <Modal
            visible={showCustomModal}
            onDismiss={() => setShowCustomModal(false)}
          >
            <View className="bg-white p-5 rounded-lg">
              <TextInput
                label={`Enter new ${customType}`}
                value={customEntry}
                onChangeText={setCustomEntry}
                className="mb-4"
              />
              <Button
                mode="contained"
                buttonColor="#EFA00B"
                onPress={handleAddCustomEntry}
              >
                Add {customType === "category" ? "Category" : "Account"}
              </Button>
            </View>
          </Modal>
        </Portal>

        <Portal>
          <Modal
            visible={showSuccessModal}
            onDismiss={() => setShowSuccessModal(false)}
          >
            <View className="bg-white p-5 rounded-lg items-center max-w-[300px] self-center">
              <Text className="text-lg text-black mb-2 font-bold">
                Transaction Added
              </Text>
              <Button
                mode="contained"
                buttonColor="#EFA00B"
                onPress={() => setShowSuccessModal(false)}
              >
                OK
              </Button>
            </View>
          </Modal>
        </Portal>
      </SafeAreaView>
    </Provider>
  );
}
