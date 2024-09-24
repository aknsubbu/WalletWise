import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Linking,
  TouchableOpacity,
  Image,
} from "react-native";
import { Avatar } from "react-native-paper";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Profile {
  id: string;
  username: string;
  full_name: string;
  picture_url: string | null;
  website: string | null;
}

type IconName = "email-outline" | "web";

const FallbackAvatar = () => (
  <Image
    source={require("../../assets/images/people_icon.png")}
    style={{ width: 100, height: 100, borderRadius: 50 }}
  />
);

const ProfileAvatar = ({ url }: { url: string | null | undefined }) => {
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

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
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

        setUser(user);
        setProfile(profileData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchUserAndProfile();
  }, []);

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
            icon="email-outline"
            label="Email"
            value={user?.email || "Not provided"}
          />
          {profile?.website && (
            <InfoItem
              icon="web"
              label="Website"
              value={profile.website}
              onPress={() => Linking.openURL(profile.website!)}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface InfoItemProps {
  icon: IconName;
  label: string;
  value: string;
  onPress?: () => void;
}

const InfoItem = ({ icon, label, value, onPress }: InfoItemProps) => (
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
