import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert } from "react-native";
import {
  chooseFile,
  readExcelFile,
  extractTransactionsData,
  extractMerchantData,
  extractPaymentMethodData,
} from "@/components/functions/fileParser";
import { supabase } from "../lib/supabase";

type ExtractedData = {
  transactions: ReturnType<typeof extractTransactionsData>;
  merchants: ReturnType<typeof extractMerchantData>;
  paymentMethods: ReturnType<typeof extractPaymentMethodData>;
};

export default function FilePage() {
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilePick = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await chooseFile();
      if (
        result &&
        !result.canceled &&
        result.assets &&
        result.assets.length > 0
      ) {
        const uri = result.assets[0].uri;
        const records = await readExcelFile(uri);

        if (records) {
          const transactions = extractTransactionsData(records);
          const merchants = extractMerchantData(records);
          const paymentMethods = extractPaymentMethodData(records);
          setExtractedData({ transactions, merchants, paymentMethods });
        }
      }
    } catch (err) {
      setError(
        "Error processing file: " +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getOrCreateMerchant = async (
    merchantName: string,
    category: string
  ) => {
    try {
      const { data: existingMerchant, error: merchantError } = await supabase
        .from("merchants")
        .select("merchant_id")
        .eq("merchant_name", merchantName)
        .single();

      if (merchantError && merchantError.code !== "PGRST116") {
        throw merchantError;
      }

      if (existingMerchant) {
        return existingMerchant.merchant_id;
      }

      const { data: newMerchant, error: createError } = await supabase
        .from("merchants")
        .insert({ merchant_name: merchantName, merchant_type: category })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      return newMerchant.merchant_id;
    } catch (error) {
      console.error("Error in getOrCreateMerchant:", error);
      throw error;
    }
  };

  const getOrCreatePaymentMethod = async (
    paymentType: string,
    userId: string
  ) => {
    try {
      const { data: existingMethod, error: methodError } = await supabase
        .from("payment_methods")
        .select("payment_method_id")
        .eq("payment_type", paymentType)
        .eq("user_id", userId)
        .single();

      if (methodError && methodError.code !== "PGRST116") {
        throw methodError;
      }

      if (existingMethod) {
        return existingMethod.payment_method_id;
      }

      const { data: newMethod, error: createError } = await supabase
        .from("payment_methods")
        .insert({ payment_type: paymentType, user_id: userId })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      return newMethod.payment_method_id;
    } catch (error) {
      console.error("Error in getOrCreatePaymentMethod:", error);
      throw error;
    }
  };

  const pushToSupabase = async () => {
    if (!extractedData) return;

    setIsLoading(true);
    setError(null);
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) {
        throw new Error("No active session found");
      }

      const userId = session.user.id;

      const transactionsToInsert = await Promise.all(
        extractedData.transactions.map(async (transaction) => {
          const merchantId = await getOrCreateMerchant(
            transaction.merchantName,
            transaction.category
          );
          const paymentMethodId = await getOrCreatePaymentMethod(
            transaction.paymentMethod,
            userId
          );

          return {
            user_id: userId,
            amount: transaction.amount,
            t_date: transaction.date.toISOString(),
            category: transaction.category,
            payment_method_id: paymentMethodId,
            merchant_id: merchantId,
            type: transaction.type,
            description: transaction.description || "", // Use empty string if description is undefined
          };
        })
      );

      const { data: insertedTransactions, error: transactionError } =
        await supabase
          .from("transactions")
          .insert(transactionsToInsert)
          .select();

      if (transactionError) throw transactionError;

      setExtractedData(null); // Clear the data after successful push
      Alert.alert(
        "Success",
        `${insertedTransactions.length} transactions successfully pushed to Supabase!`
      );
    } catch (err) {
      setError(
        "Error pushing to Supabase: " +
          (err instanceof Error ? err.message : String(err))
      );
      Alert.alert(
        "Error",
        "Failed to push data to Supabase. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 p-4">
      <TouchableOpacity
        className="bg-blue-500 py-2 px-4 rounded-md"
        onPress={handleFilePick}
        disabled={isLoading}
      >
        <Text className="text-white text-center font-bold">
          Pick Excel File
        </Text>
      </TouchableOpacity>

      {isLoading && (
        <Text className="mt-4 text-gray-600 text-2xl">Loading...</Text>
      )}
      {error && <Text className="mt-4 text-red-500">{error}</Text>}

      {extractedData && (
        <View className="mt-6 text-white">
          <Text className="text-2xl font-light mb-2 text-white">
            Extracted Data:
          </Text>
          <Text className="text-white">
            Transactions: {extractedData.transactions.length}
          </Text>
          <Text className="text-white mb-4">
            Unique Merchants: {extractedData.merchants.length}
          </Text>

          <Text className="text-2xl font-light mb-2 text-white">
            Transaction Preview:
          </Text>
          <FlatList
            data={extractedData.transactions.slice(0, 5)} // Show first 5 transactions as preview
            renderItem={({ item }) => (
              <Text className="text-white mb-1">
                {`${item.date.toLocaleDateString()}: ${item.merchantName} - $${
                  item.amount
                }`}
                {item.description && ` (${item.description})`}
              </Text>
            )}
            keyExtractor={(item, index) => index.toString()}
          />

          <TouchableOpacity
            className="bg-green-500 py-2 px-4 rounded-md mt-4"
            onPress={pushToSupabase}
            disabled={isLoading}
          >
            <Text className="text-white text-center font-bold">
              Push to Supabase
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
