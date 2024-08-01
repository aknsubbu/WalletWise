import { CameraView, CameraProps, useCameraPermissions } from "expo-camera";
import { useState, useEffect, useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Button } from "react-native-paper";

const { createWorker } = require("tesseract.js");

export default function App() {
  // @ts-ignore: just being lazy with types here
  const cameraRef = useRef<CameraView>(undefined);
  const [facing, setFacing] = useState<CameraProps["facing"]>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [pictureSizes, setPictureSizes] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState(undefined);
  const [imageText, setImageText] = useState("");
  const [photoURI, setPhotoURI] = useState<string>("");

  async function doOCR() {
    const worker = await createWorker("eng", 1, {
      logger: (m: any) => console.log(m),
    });
    const {
      data: { text },
    } = await worker.recognize(photoURI);
    console.log(text);
    setImageText(text);
    await worker.terminate();
  }

  useEffect(() => {
    async function getSizes() {
      if (permission?.granted && cameraRef.current) {
        const sizes = await cameraRef.current.getAvailablePictureSizesAsync();
        setPictureSizes(sizes);
      }
    }
    getSizes();
  }, [permission, cameraRef]);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-center">
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission}>Grant Permission</Button>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  async function takePicture() {
    const photo = await cameraRef.current?.takePictureAsync();
    if (photo) {
      setPhotoURI(JSON.stringify(photo));
      console.log("Picture Taken");
    }
    console.log(JSON.stringify(photo));
  }

  return (
    <View className="flex-1 justify-center">
      <CameraView className="flex-1" facing={facing}>
        <View className="flex-1 flex-row bg-transparent m-16 items-end justify-center">
          <Button
            className="text-white border-2 border-[#EFA00B] rounded-xl m-2 p-2 "
            onPress={toggleCameraFacing}
          >
            Flip Camera
          </Button>
          <Button
            className="text-white border-2 border-[#EFA00B] rounded-xl m-2 p-2"
            onPress={takePicture}
          >
            Take Picture
          </Button>
        </View>
      </CameraView>
    </View>
  );
}
