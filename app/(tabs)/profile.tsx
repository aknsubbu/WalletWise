import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Linking,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
} from "react-native";
import { Avatar, Button } from "react-native-paper";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";

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

interface BudgetLimit {
  id: string;
  category: string;
  limit: number;
  spent: number;
}

type IconName = "email-outline" | "web" | "bank" | "cash-multiple";

interface AddBankAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string, balance: number) => void;
}

interface AddBudgetLimitModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (category: string, limit: number) => void;
}

const FallbackAvatar: React.FC = () => (
  <Image
    source={require("../../assets/images/people_icon.png")}
    style={{ width: 100, height: 100, borderRadius: 50 }}
  />
);

interface ProfileAvatarProps {
  url: string | null | undefined;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ url }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (url) {
      Image.prefetch(url).catch(() => setImageError(true));
    }
  }, [url]);

  if (!url || imageError) {
    return <FallbackAvatar />;
  }

  return (
    <Avatar.Image
      size={100}
      source={{ uri: url }}
      onError={() => setImageError(true)}
    />
  );
};

// const AddBankAccountModal: React.FC<AddBankAccountModalProps> = ({
//   visible,
//   onClose,
//   onAdd,
// }) => {
//   const [accountName, setAccountName] = useState("");
//   const [balance, setBalance] = useState("");

//   const handleAdd = () => {
//     onAdd(accountName, parseFloat(balance));
//     setAccountName("");
//     setBalance("");
//     onClose();
//   };

//   return (
//     <Modal visible={visible} animationType="slide" transparent>
//       <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
//         <View className="bg-gray-800 p-5 rounded-lg w-4/5">
//           <Text className="text-white text-xl font-bold mb-4">
//             Add Bank Account
//           </Text>
//           <TextInput
//             className="bg-gray-700 text-white p-2 rounded mb-4"
//             placeholder="Account Name"
//             placeholderTextColor="#999"
//             value={accountName}
//             onChangeText={setAccountName}
//           />
//           <TextInput
//             className="bg-gray-700 text-white p-2 rounded mb-4"
//             placeholder="Initial Balance"
//             placeholderTextColor="#999"
//             value={balance}
//             onChangeText={setBalance}
//             keyboardType="numeric"
//           />
//           <View className="flex-row justify-end">
//             <Button onPress={onClose} textColor="white">
//               Cancel
//             </Button>
//             <Button onPress={handleAdd} textColor="white">
//               Add
//             </Button>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// };

const AddBudgetLimitModal: React.FC<AddBudgetLimitModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");

  const handleAdd = () => {
    onAdd(category, parseFloat(limit));
    setCategory("");
    setLimit("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
        <View className="bg-gray-800 p-5 rounded-lg w-4/5">
          <Text className="text-white text-xl font-bold mb-4">
            Set Budget Limit
          </Text>
          <TextInput
            className="bg-gray-700 text-white p-2 rounded mb-4"
            placeholder="Category"
            placeholderTextColor="#999"
            value={category}
            onChangeText={setCategory}
          />
          <TextInput
            className="bg-gray-700 text-white p-2 rounded mb-4"
            placeholder="Limit Amount"
            placeholderTextColor="#999"
            value={limit}
            onChangeText={setLimit}
            keyboardType="numeric"
          />
          <View className="flex-row justify-end">
            <Button onPress={onClose} textColor="white">
              Cancel
            </Button>
            <Button onPress={handleAdd} textColor="white">
              Add
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [budgetLimits, setBudgetLimits] = useState<BudgetLimit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);

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

        // const { data: budgetLimitsData, error: budgetLimitsError } =
        //   await supabase
        //     .from("budget_limits")
        //     .select("*")
        //     .eq("user_id", user?.id);
        // if (budgetLimitsError) throw budgetLimitsError;

        setUser(user);
        setProfile(profileData);
        setBankAccounts(bankAccountsData);
        // setBudgetLimits(budgetLimitsData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "An unknown error occurred");
        console.log(e);
      } finally {
        setLoading(false);
      }
    }

    return () => clearInterval(interval);

    fetchUserAndProfile();
  }, []);

  const handleAddBankAccount = async (name: string, balance: number) => {
    try {
      const { data, error } = await supabase
        .from("bankbalance")
        .insert({ user_id: user?.id, balance })
        .select()
        .single();
      if (error) throw error;
      setBankAccounts([...bankAccounts, data]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add bank account");
    }
  };

  // const handleAddBudgetLimit = async (category: string, limit: number) => {
  //   try {
  //     const { data, error } = await supabase
  //       .from("budget_limits")
  //       .insert({ user_id: user?.id, category, limit, spent: 0 })
  //       .select()
  //       .single();
  //     if (error) throw error;
  //     setBudgetLimits([...budgetLimits, data]);
  //   } catch (e) {
  //     setError(e instanceof Error ? e.message : "Failed to add budget limit");
  //   }
  // };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <Text className="text-white text-lg text-center mt-5">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <Text className="text-red-500 text-lg text-center mt-5">
          Error: {error}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView className="flex-grow p-5">
        <View className="items-center mb-8">
          <ProfileAvatar url={profile?.picture_url} />
          <Text className="text-white text-2xl font-bold mt-3">
            {profile?.full_name}
          </Text>
          <Text className="text-gray-400 text-base mt-1">
            @{profile?.username}
          </Text>
        </View>
        <View className="mb-8">
          <InfoItem
            key="email-info"
            icon="email-outline"
            label="Email"
            value={user?.email || "Not provided"}
          />
          {profile?.website && (
            <InfoItem
              key="website-info"
              icon="web"
              label="Website"
              value={profile.website}
              onPress={() => Linking.openURL(profile.website!)}
            />
          )}
        </View>
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-xl font-bold">Bank Accounts</Text>
            {/* <Button onPress={() => setShowAddBankModal(true)} textColor="white">
              Add Account
            </Button> */}
          </View>
          {bankAccounts.map((account) => (
            // <View className="flex flex-row items-start justify-start h-fit border-2 bg-[#EFA00B] rounded-xl p-3">
            //   <InfoItem
            //     key={account.id}
            //     icon="bank"
            //     label={account.name}
            //     value=""
            //   />
            //   <View className="flex justify-center items-center">
            //     <Text className="text-white text-3xl font-light">
            //       ${}
            //     </Text>
            //   </View>
            // </View>
            <View
              key={account.id}
              className="bg-[#EFA00B] p-5 rounded-2xl mb-5 flex-row justify-between items-center"
            >
              <View>
                <Text className="text-white text-3xl font-bold">
                  {account.balance.toFixed(2) || "$5,500.50"}
                </Text>
                <Text className="text-white text-base">Net Balance</Text>
              </View>
              <FontAwesome name="bank" size={50} color="white" />
            </View>
          ))}
          {/* end of balance card... */}
        </View>
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            {/* <Button
              onPress={() => setShowAddBudgetModal(true)}
              textColor="white"
            >
              Set Limit
            </Button> */}
          </View>
          {budgetLimits.map((budget) => (
            <View key={budget.id}>
              <Text className="text-white text-xl font-bold">
                Budget Limits
              </Text>
              <View className="bg-[#EFA00B] p-5 rounded-2xl mb-5 flex-row justify-between items-center">
                <View>
                  <Text className="text-white text-3xl font-bold">
                    {budget.spent.toFixed(2) || "$5,500.50"}
                  </Text>
                  <Text className="text-white text-base">Net Balance</Text>
                </View>
                <FontAwesome name="bank" size={50} color="white" />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      {/* <AddBankAccountModal
        visible={showAddBankModal}
        onClose={() => setShowAddBankModal(false)}
        onAdd={handleAddBankAccount}
      /> */}
      {/* <AddBudgetLimitModal
        visible={showAddBudgetModal}
        onClose={() => setShowAddBudgetModal(false)}
        onAdd={handleAddBudgetLimit}
      /> */}
    </SafeAreaView>
  );
}

interface InfoItemProps {
  icon: IconName;
  label: string;
  value: string;
  onPress?: () => void;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value, onPress }) => (
  <View className="flex-row items-center mb-4">
    <MaterialCommunityIcons name={icon} size={24} color="#FFFFFF" />
    <View className="ml-4">
      <Text className="text-gray-400 text-sm">{label}</Text>
      <Text className="text-white text-base mt-1" onPress={onPress}>
        {value}
      </Text>
    </View>
  </View>
);
