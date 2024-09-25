import React, { useState, useRef } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  Image,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { CameraView, CameraProps, useCameraPermissions } from "expo-camera";
import * as FileSystem from "expo-file-system";
import { Button, TextInput } from "react-native-paper";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";

import performOCR from "@/components/functions/OpenAIInterface";

interface CameraPreviewProps {
  photoURI: string;
  retakePicture: () => void;
  processPhoto: () => void;
}

interface TransactionData {
  merchant_name: string;
  transaction_data: {
    amount: number;
    date: string;
    category: string;
    payment_method: string;
    type: string;
    description: string;
  };
}

export default function OCRPage() {
  const cameraRef = useRef<CameraView | null>(null);
  const [facing, setFacing] = useState<CameraProps["facing"]>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [photoURI, setPhotoURI] = useState<string>("");
  const [transactionData, setTransactionData] =
    useState<TransactionData | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [transmissionInProgress, setTransmissionInProgress] = useState(false);

  if (!permission?.granted) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-center mb-4">
          We need your permission to show the camera
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-blue-500 px-4 py-2 rounded-md"
        >
          <Text className="text-white">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          base64: true,
        });
        if (photo && photo.uri) {
          console.log("Photo taken:", photo.uri);
          setPhotoURI(photo.uri);
          setPreviewVisible(true);
        } else {
          console.error("Failed to take photo: photo object or URI is null");
        }
      } catch (error) {
        console.error("Error taking picture:", error);
      }
    } else {
      console.error("Camera ref is null");
    }
  };

  const retakePicture = () => {
    setPhotoURI("");
    setPreviewVisible(false);
    setTransactionData(null);
  };

  const processPhoto = async () => {
    setTransmissionInProgress(true);
    await transmitImage();
    setTransmissionInProgress(false);
  };

  const transmitImage = async () => {
    console.log("Starting image transmission");
    console.log("Photo URI:", photoURI);

    if (!photoURI) {
      console.error("Photo URI is null or empty");
      return;
    }

    try {
      const base64 = await FileSystem.readAsStringAsync(photoURI, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const response = await performOCR(base64);
      console.log("Response from OCR API:", response);
      setTransactionData(response);
    } catch (error) {
      console.error("Image Transmission Error:", error);
      Alert.alert("Error", "Failed to process the image. Please try again.");
    }
  };

  const saveTransaction = async () => {
    if (!transactionData) {
      Alert.alert("Error", "No transaction data to save.");
      return;
    }

    try {
      const { data: session, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session.session) {
        Alert.alert(
          "Error",
          "You are not authenticated. Please log in and try again."
        );
        return;
      }

      const userId = session.session.user.id;

      const merchantId = await getOrCreateMerchant(
        transactionData.merchant_name,
        transactionData.transaction_data.category
      );
      const paymentMethodId = await getOrCreatePaymentMethod(
        transactionData.transaction_data.payment_method,
        userId
      );

      const category = transactionData.transaction_data.category;

      const transactionDataToSave = {
        user_id: userId,
        amount: transactionData.transaction_data.amount,
        t_date: new Date(transactionData.transaction_data.date).toISOString(),
        category,
        payment_method_id: paymentMethodId,
        merchant_id: merchantId,
        type: transactionData.transaction_data.type,
        description: transactionData.transaction_data.description,
      };

      const { data, error } = await supabase
        .from("transactions")
        .insert([transactionDataToSave])
        .select();

      if (error) throw error;

      console.log("Transaction saved:", data);
      Alert.alert("Success", "Transaction saved successfully!");
      router.push("/");
    } catch (error) {
      console.error("Error saving transaction:", error);
      Alert.alert("Error", "Failed to save transaction. Please try again.");
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

  return (
    <View className="flex-1 bg-[#0E0E0E] text-white">
      {previewVisible ? (
        <ScrollView className="flex-1">
          <Image source={{ uri: photoURI }} className="w-full h-96" />
          {transactionData ? (
            <View className="p-4">
              <Text className="text-white text-xl font-bold mb-4">
                Transaction Details
              </Text>
              <Text className="text-white text-md font-light mb-4">
                Merchant
              </Text>
              <TextInput
                value={transactionData.merchant_name}
                onChangeText={(text) =>
                  setTransactionData({
                    ...transactionData,
                    merchant_name: text,
                  })
                }
                mode="outlined"
                className="mb-2"
                theme={{
                  colors: {
                    primary: "#EFA00B",
                    text: "#FFFFFF",
                    placeholder: "#AAAAAA",
                    background: "#333333",
                    onSurface: "#FFFFFF", // This controls the text color when focused
                  },
                }}
                style={{ color: "#FFFFFF" }} // This ensures the text is always white
                outlineColor="#555555"
                activeOutlineColor="#EFA00B"
              />
              <Text className="text-white text-md font-light mb-4">Amount</Text>
              <TextInput
                value={transactionData.transaction_data.amount.toString()}
                onChangeText={(text) =>
                  setTransactionData({
                    ...transactionData,
                    transaction_data: {
                      ...transactionData.transaction_data,
                      amount: parseFloat(text),
                    },
                  })
                }
                keyboardType="numeric"
                mode="outlined"
                className="mb-2"
                theme={{
                  colors: {
                    primary: "#EFA00B",
                    text: "#FFFFFF",
                    placeholder: "#AAAAAA",
                    background: "#333333",
                    onSurface: "#FFFFFF", // This controls the text color when focused
                  },
                }}
                style={{ color: "#FFFFFF" }} // This ensures the text is always white
                outlineColor="#555555"
                activeOutlineColor="#EFA00B"
              />
              <Text className="text-white text-md font-light mb-4">Date</Text>
              <TextInput
                value={transactionData.transaction_data.date}
                onChangeText={(text) =>
                  setTransactionData({
                    ...transactionData,
                    transaction_data: {
                      ...transactionData.transaction_data,
                      date: text,
                    },
                  })
                }
                mode="outlined"
                className="mb-2"
                theme={{
                  colors: {
                    primary: "#EFA00B",
                    text: "#FFFFFF",
                    placeholder: "#AAAAAA",
                    background: "#333333",
                    onSurface: "#FFFFFF", // This controls the text color when focused
                  },
                }}
                style={{ color: "#FFFFFF" }} // This ensures the text is always white
                outlineColor="#555555"
                activeOutlineColor="#EFA00B"
              />
              <Text className="text-white text-md font-light mb-4">
                Category
              </Text>
              <TextInput
                value={transactionData.transaction_data.category}
                onChangeText={(text) =>
                  setTransactionData({
                    ...transactionData,
                    transaction_data: {
                      ...transactionData.transaction_data,
                      category: text,
                    },
                  })
                }
                mode="outlined"
                className="mb-2"
                theme={{
                  colors: {
                    primary: "#EFA00B",
                    text: "#FFFFFF",
                    placeholder: "#AAAAAA",
                    background: "#333333",
                    onSurface: "#FFFFFF", // This controls the text color when focused
                  },
                }}
                style={{ color: "#FFFFFF" }} // This ensures the text is always white
                outlineColor="#555555"
                activeOutlineColor="#EFA00B"
              />
              <Text className="text-white text-md font-light mb-4">
                Payment Method
              </Text>
              <TextInput
                value={transactionData.transaction_data.payment_method}
                onChangeText={(text) =>
                  setTransactionData({
                    ...transactionData,
                    transaction_data: {
                      ...transactionData.transaction_data,
                      payment_method: text,
                    },
                  })
                }
                mode="outlined"
                className="mb-2"
                theme={{
                  colors: {
                    primary: "#EFA00B",
                    text: "#FFFFFF",
                    placeholder: "#AAAAAA",
                    background: "#333333",
                    onSurface: "#FFFFFF", // This controls the text color when focused
                  },
                }}
                style={{ color: "#FFFFFF" }} // This ensures the text is always white
                outlineColor="#555555"
                activeOutlineColor="#EFA00B"
              />
              <Text className="text-white text-md font-light mb-4">
                Type of Transaction
              </Text>
              <TextInput
                value={transactionData.transaction_data.type}
                onChangeText={(text) =>
                  setTransactionData({
                    ...transactionData,
                    transaction_data: {
                      ...transactionData.transaction_data,
                      type: text,
                    },
                  })
                }
                mode="outlined"
                className="mb-2"
                theme={{
                  colors: {
                    primary: "#EFA00B",
                    text: "#FFFFFF",
                    placeholder: "#AAAAAA",
                    background: "#333333",
                    onSurface: "#FFFFFF", // This controls the text color when focused
                  },
                }}
                style={{ color: "#FFFFFF" }} // This ensures the text is always white
                outlineColor="#555555"
                activeOutlineColor="#EFA00B"
              />
              <Text className="text-white text-md font-light mb-4">
                Description
              </Text>
              <TextInput
                value={transactionData.transaction_data.description}
                onChangeText={(text) =>
                  setTransactionData({
                    ...transactionData,
                    transaction_data: {
                      ...transactionData.transaction_data,
                      description: text,
                    },
                  })
                }
                multiline
                numberOfLines={3}
                mode="outlined"
                className="mb-2"
                theme={{
                  colors: {
                    primary: "#EFA00B",
                    text: "#FFFFFF",
                    placeholder: "#AAAAAA",
                    background: "#333333",
                    onSurface: "#FFFFFF", // This controls the text color when focused
                  },
                }}
                style={{ color: "#FFFFFF" }} // This ensures the text is always white
                outlineColor="#555555"
                activeOutlineColor="#EFA00B"
              />
              <Button
                mode="contained"
                onPress={saveTransaction}
                className="mt-4"
              >
                Save Transaction
              </Button>
            </View>
          ) : (
            <View className="flex-row justify-between p-4">
              <TouchableOpacity
                onPress={retakePicture}
                className="bg-red-500 px-4 py-2 rounded-md"
              >
                <Text className="text-white text-lg">Re-take</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={processPhoto}
                className="bg-green-500 px-4 py-2 rounded-md"
              >
                <Text className="text-white text-lg">Process Image</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      ) : (
        <CameraView className="flex-1" facing={facing} ref={cameraRef}>
          <View className="flex-1 flex-row bg-transparent m-4 items-end justify-center">
            <TouchableOpacity
              onPress={toggleCameraFacing}
              className="bg-blue-500 px-4 py-2 rounded-md mr-2"
            >
              <Text className="text-white">Flip Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={takePicture}
              className="bg-green-500 px-4 py-2 rounded-md ml-2"
            >
              <Text className="text-white">Take Picture</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      )}
      {transmissionInProgress && (
        <Text className="p-4 text-center text-white mb-5">
          Processing image...
        </Text>
      )}
    </View>
  );
}
