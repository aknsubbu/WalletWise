import { AppState } from "react-native";
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// Ensure that your environment variables are correctly defined
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Create the Supabase client with necessary configurations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Necessary for React Native, as there is no URL bar to track sessions
  },
});

// Ensure that Supabase Auth continues to refresh the session when the app is in the foreground.
// The session is refreshed automatically while the app is active, and auto-refresh stops when
// the app is not in the foreground (e.g., backgrounded or closed).
AppState.addEventListener("change", (nextAppState) => {
  if (nextAppState === "active") {
    // When the app returns to the foreground, start auto-refresh
    supabase.auth.startAutoRefresh();
  } else {
    // When the app is backgrounded or closed, stop auto-refresh to avoid unnecessary activity
    supabase.auth.stopAutoRefresh();
  }
});
