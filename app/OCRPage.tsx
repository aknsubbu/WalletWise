import { CameraView, CameraProps, useCameraPermissions } from "expo-camera";
import { useState, useEffect, useRef } from "react";
import { Text, TouchableOpacity, View, ImageBackground } from "react-native";
import { Button } from "react-native-paper";
import { createWorker } from "tesseract.js";

// Define the props for the CameraPreview component
interface CameraPreviewProps {
	photoURI: string;
	retakePicture: () => void;
	savePhoto: () => void;
}

export default function App() {
	const cameraRef = useRef<CameraView | null>(null);
	const [facing, setFacing] = useState<CameraProps["facing"]>("back");
	const [permission, requestPermission] = useCameraPermissions();
	const [pictureSizes, setPictureSizes] = useState<string[]>([]);
	const [photoURI, setPhotoURI] = useState<string>("");
	const [imageText, setImageText] = useState("");
	const [previewVisible, setPreviewVisible] = useState(false);

	async function doOCR() {
		console.log("doOCR");
		console.log(photoURI);
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
	}, [permission]);

	if (!permission) {
		return <View />;
	}

	if (!permission.granted) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<Text style={{ textAlign: "center" }}>
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
			setPhotoURI(photo.uri);
			setPreviewVisible(true);
		}
	}

	const retakePicture = () => {
		setPhotoURI("");
		setPreviewVisible(false);
	};

	const savePhoto = async () => {
		await doOCR();
		setPreviewVisible(false);
	};

	return (
		<View style={{ flex: 1, justifyContent: "center" }}>
			{previewVisible ? (
				<CameraPreview
					photoURI={photoURI}
					retakePicture={retakePicture}
					savePhoto={savePhoto}
				/>
			) : (
				<CameraView style={{ flex: 1 }} facing={facing} ref={cameraRef}>
					<View
						style={{
							flex: 1,
							flexDirection: "row",
							backgroundColor: "transparent",
							margin: 16,
							alignItems: "flex-end",
							justifyContent: "center",
						}}
					>
						<Button onPress={toggleCameraFacing} style={{ margin: 2 }}>
							Flip Camera
						</Button>
						<Button onPress={takePicture} style={{ margin: 2 }}>
							Take Picture
						</Button>
					</View>
				</CameraView>
			)}
			{imageText && <Text style={{ padding: 16 }}>{imageText}</Text>}
		</View>
	);
}

// CameraPreview component with typed props
const CameraPreview = ({
	photoURI,
	retakePicture,
	savePhoto,
}: CameraPreviewProps) => {
	return (
		<View style={{ flex: 1 }}>
			<ImageBackground source={{ uri: photoURI }} style={{ flex: 1 }}>
				<View style={{ flex: 1, justifyContent: "flex-end", padding: 15 }}>
					<View
						style={{ flexDirection: "row", justifyContent: "space-between" }}
					>
						<TouchableOpacity
							onPress={retakePicture}
							style={{
								width: 130,
								height: 40,
								backgroundColor: "#14274e",
								alignItems: "center",
								justifyContent: "center",
								borderRadius: 4,
							}}
						>
							<Text style={{ color: "#fff", fontSize: 20 }}>Re-take</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={savePhoto}
							style={{
								width: 130,
								height: 40,
								backgroundColor: "#14274e",
								alignItems: "center",
								justifyContent: "center",
								borderRadius: 4,
							}}
						>
							<Text style={{ color: "#fff", fontSize: 20 }}>Get Data</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ImageBackground>
		</View>
	);
};

// import { CameraView, CameraProps, useCameraPermissions } from "expo-camera";
// import { useState, useEffect, useRef } from "react";
// import { Text, TouchableOpacity, View } from "react-native";
// import { Button } from "react-native-paper";

// import { createWorker } from "tesseract.js";
// export default function App() {
// 	console.log("OCRPage");
// 	// @ts-ignore: just being lazy with types here
// 	const cameraRef = useRef<CameraView>(undefined);
// 	const [facing, setFacing] = useState<CameraProps["facing"]>("back");
// 	const [permission, requestPermission] = useCameraPermissions();
// 	const [pictureSizes, setPictureSizes] = useState<string[]>([]);
// 	const [selectedSize, setSelectedSize] = useState(undefined);
// 	const [imageText, setImageText] = useState("");
// 	const [photoURI, setPhotoURI] = useState<string>("");

// 	async function doOCR() {
// 		const worker = await createWorker("eng", 1, {
// 			logger: (m: any) => console.log(m),
// 		});
// 		const {
// 			data: { text },
// 		} = await worker.recognize(photoURI);
// 		console.log(text);
// 		setImageText(text);
// 		await worker.terminate();
// 	}

// 	useEffect(() => {
// 		async function getSizes() {
// 			if (permission?.granted && cameraRef.current) {
// 				const sizes = await cameraRef.current.getAvailablePictureSizesAsync();
// 				setPictureSizes(sizes);
// 			}
// 		}
// 		getSizes();
// 	}, [permission, cameraRef]);

// 	if (!permission) {
// 		// Camera permissions are still loading.
// 		return <View />;
// 	}

// 	if (!permission.granted) {
// 		// Camera permissions are not granted yet.
// 		return (
// 			<View className="flex-1 justify-center items-center">
// 				<Text className="text-center">
// 					We need your permission to show the camera
// 				</Text>
// 				<Button onPress={requestPermission}>Grant Permission</Button>
// 			</View>
// 		);
// 	}

// 	function toggleCameraFacing() {
// 		setFacing((current) => (current === "back" ? "front" : "back"));
// 	}

// 	async function takePicture() {
// 		const photo = await cameraRef.current?.takePictureAsync();
// 		console.log("Photooo", photo);
// 		if (photo) {
// 			setPhotoURI(JSON.stringify(photo));
// 			console.log("Picture Taken");
// 		}
// 		console.log(JSON.stringify(photo));
// 	}

// 	return (
// 		<View className="flex-1 justify-center">
// 			<CameraView className="flex-1" facing={facing}>
// 				<View className="flex-1 flex-row bg-transparent m-16 items-end justify-center">
// 					<Button
// 						className="text-white border-2 border-[#EFA00B] rounded-xl m-2 p-2 "
// 						onPress={toggleCameraFacing}
// 					>
// 						Flip Camera
// 					</Button>
// 					<Button
// 						className="text-white border-2 border-[#EFA00B] rounded-xl m-2 p-2"
// 						onPress={takePicture}
// 					>
// 						Take Picture
// 					</Button>
// 				</View>
// 			</CameraView>
// 		</View>
// 	);
// }
