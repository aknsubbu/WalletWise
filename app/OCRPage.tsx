import React, { useState, useRef, useEffect } from "react";
import { Text, TouchableOpacity, View, Image, Platform } from "react-native";
import { CameraView, CameraProps, useCameraPermissions } from "expo-camera";
import MlkitOcr from "react-native-mlkit-ocr";

interface CameraPreviewProps {
  photoURI: string;
  retakePicture: () => void;
  processPhoto: () => void;
}

// TODO : Switch the OCR to the backend...

export default function App() {
  const cameraRef = useRef<CameraView | null>(null);
  const [facing, setFacing] = useState<CameraProps["facing"]>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [photoURI, setPhotoURI] = useState<string>("");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [ocrInProgress, setOcrInProgress] = useState(false);
  const [mlkitAvailable, setMlkitAvailable] = useState(false);

  useEffect(() => {
    const checkMlkitAvailability = async () => {
      let retries = 0;
      const maxRetries = 5;

      while (retries < maxRetries) {
        if (MlkitOcr && typeof MlkitOcr.detectFromUri === "function") {
          console.log("MLKit OCR is available");
          setMlkitAvailable(true);
          return;
        }
        console.log(
          `MLKit OCR not available, retrying... (${retries + 1}/${maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
        retries++;
      }

      console.error("MLKit OCR is not available after multiple attempts");
    };

    checkMlkitAvailability();
  }, []);

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
    if (!mlkitAvailable) {
      console.error("MLKit OCR is not available");
      return;
    }
    setOcrInProgress(true);
    await doOCR();
    setOcrInProgress(false);
    setPreviewVisible(false);
  };

  const doOCR = async () => {
    console.log("Starting OCR");
    console.log("Photo URI:", photoURI);

    if (!photoURI) {
      console.error("Photo URI is null or empty");
      return;
    }

    try {
      let uri = photoURI;
      if (Platform.OS === "ios" && !photoURI.startsWith("file://")) {
        uri = `file://${photoURI}`;
      }

      const result = await MlkitOcr.detectFromUri(uri);
      console.log("OCR Result:", result);
      console.log("OCR completed");
    } catch (error) {
      console.error("OCR Error:", error);
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
      {ocrInProgress && (
        <Text className="p-4 text-center">OCR in progress...</Text>
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
          <Text className="text-white text-lg">Get Data</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
