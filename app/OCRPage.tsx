import React, { useState, useRef } from "react";
import { Text, TouchableOpacity, View, Image, Platform } from "react-native";
import { CameraView, CameraProps, useCameraPermissions } from "expo-camera";
import * as FileSystem from "expo-file-system";

import performOCR from "@/components/functions/OpenAIInterface";

interface CameraPreviewProps {
  photoURI: string;
  retakePicture: () => void;
  processPhoto: () => void;
}

export default function App() {
  const cameraRef = useRef<CameraView | null>(null);
  const [facing, setFacing] = useState<CameraProps["facing"]>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [photoURI, setPhotoURI] = useState<string>("");
  const [imageText, setImageData] = useState<string>("");
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
  };

  const processPhoto = async () => {
    setTransmissionInProgress(true);
    await transmitImage();
    setTransmissionInProgress(false);
    setPreviewVisible(false);
  };

  const transmitImage = async () => {
    console.log("Starting image transmission");
    console.log("Photo URI:", photoURI);

    if (!photoURI) {
      console.error("Photo URI is null or empty");
      return;
    }

    try {
      // Read the file as a base64 string
      const base64 = await FileSystem.readAsStringAsync(photoURI, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Send the request to your backend
      const response = performOCR(base64);
      // setImageData(response);
      console.log("Image transmission completed");
    } catch (error) {
      console.error("Image Transmission Error:", error);
    }
  };

  return (
    <View className="flex-1">
      {previewVisible ? (
        <CameraPreview
          photoURI={photoURI}
          retakePicture={retakePicture}
          processPhoto={processPhoto}
        />
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
        <Text className="p-4 text-center">
          Image transmission in progress...
        </Text>
      )}
    </View>
  );
}

const CameraPreview: React.FC<CameraPreviewProps> = ({
  photoURI,
  retakePicture,
  processPhoto,
}) => {
  return (
    <View className="flex-1">
      <Image source={{ uri: photoURI }} className="flex-1" />
      <View className="flex-row justify-between p-4 bg-black bg-opacity-50 absolute bottom-0 left-0 right-0">
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
          <Text className="text-white text-lg">Send Image</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
