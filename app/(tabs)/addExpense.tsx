// import React, { useState } from "react";
// import {
//   StyleSheet,
//   View,
//   TouchableOpacity,
//   Text,
//   Dimensions,
//   SafeAreaView,
//   Image,
// } from "react-native";
// import { router } from "expo-router";
// import { Button, Avatar } from "react-native-paper";

// import AvatarClickHandle from "@/components/functions/AvatarClickHandle";

// export default function AddExpense() {
//   return (
//     <SafeAreaView>
//       <View className=" flex flex-row p-5 ">
//         <View className="flex flex-col justify-center">
//           <Text className="text-3xl text-white font-bold">Add an Expense</Text>
//         </View>
//         <View className="flex justify-center items-end  flex-grow">
//           <Avatar.Image
//             size={50}
//             source={require("../../assets/images/people_icon.png")}
//             onTouchEnd={AvatarClickHandle}
//           />
//         </View>
//       </View>
//       <View className=" flex flex-row pt-2 pl-5 w-full justify-center items-center gap-4">
//         <View>
//           <Button
//             icon="file-find"
//             mode="contained"
//             buttonColor="#EFA00B"
//             onPress={() => console.log("Pressed")}
//             className=" rounded-xl mx-1 my-3 w-full"
//           >
//             Browse Files
//           </Button>
//         </View>
//         <View>
//           <Button
//             icon="camera"
//             mode="contained"
//             buttonColor="#EFA00B"
//             onPress={() => router.push("/OCRPage")}
//             className=" rounded-xl mx-1 my-3 w-full"
//           >
//             Take a Picture
//           </Button>
//         </View>
//       </View>
//       <View>
//         {/* manual entry */}
//         <View className="flex flex-col p-5 ">
//           <Text className="text-white text-xl font-bold">
//             Add your spending manually
//           </Text>
//           <Text className="text-gray-500 pt-2">
//             Add the details manually if you don&apos;t have a reciept...
//           </Text>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// }

import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useRef, useState } from "react";
import {
	Animated,
	Pressable,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import {
	Avatar,
	Button,
	Modal,
	Portal,
	Provider,
	TextInput,
} from "react-native-paper";

import { router } from "expo-router";

export default function AddExpense() {
	const [date, setDate] = useState(new Date());
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [amount, setAmount] = useState("");
	const [category, setCategory] = useState("");
	const [account, setAccount] = useState("");
	const [showCustomModal, setShowCustomModal] = useState(false); // For modal
	const [customEntry, setCustomEntry] = useState(""); // Store custom input
	const [customType, setCustomType] = useState(""); // Track if it's for category or account
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
	const [showSuccessModal, setShowSuccessModal] = useState(false); // Success message modal

	// Animations
	const headerFade = useRef(new Animated.Value(0)).current;
	const datePickerSlide = useRef(new Animated.Value(-50)).current;
	const saveButtonBounce = useRef(new Animated.Value(1)).current;
	const categorySlide = useRef(new Animated.Value(200)).current; // Start off-screen to the right
	const amountBounce = useRef(new Animated.Value(0.5)).current; // Bounce-in for amount

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
		}).start(); // Slide categories from right to left

		Animated.spring(amountBounce, {
			toValue: 1,
			friction: 2,
			useNativeDriver: true,
		}).start(); // Bounce-in for amount

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

	// Handle save button press with bounce animation
	const handleSavePress = () => {
		// Clear the fields
		setAmount("");
		setCategory("");
		setAccount("");
		setDate(new Date());

		Animated.sequence([
			Animated.spring(saveButtonBounce, {
				toValue: 1.2,
				friction: 2,
				tension: 200,
				useNativeDriver: true,
			}),
			Animated.spring(saveButtonBounce, {
				toValue: 1,
				friction: 2,
				tension: 200,
				useNativeDriver: true,
			}),
		]).start(() => setShowSuccessModal(true)); // Show success modal
	};

	// Show modal when 'Other' is selected
	const handleOtherSelection = (type) => {
		setCustomType(type);
		setShowCustomModal(true);
	};

	// Add custom category or account
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
			<SafeAreaView style={styles.container}>
				<Animated.View style={[styles.header, { opacity: headerFade }]}>
					<Text style={styles.headerText}>Add an Expense</Text>
					<Avatar.Image
						size={50}
						source={require("../../assets/images/people_icon.png")}
						onTouchEnd={() => console.log("Avatar clicked")}
					/>
				</Animated.View>
				<ScrollView contentContainerStyle={styles.scrollContainer}>
					<View className=" flex flex-row pt-2 pl-5 w-full justify-center items-center gap-4">
						<View>
							<Button
								icon="file-find"
								mode="contained"
								buttonColor="#EFA00B"
								onPress={() => console.log("Pressed")}
								className=" rounded-xl mx-1 my-3 w-full"
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
								className=" rounded-xl mx-1 my-3 w-full"
							>
								Take a Picture
							</Button>
						</View>
					</View>
					<TouchableOpacity
						onPress={() => setShowDatePicker(true)}
						style={styles.field}
					>
						<Text style={styles.label}>Date</Text>
						<Text style={styles.value}>{date.toDateString()}</Text>
					</TouchableOpacity>

					{showDatePicker && (
						<Animated.View
							style={{ transform: [{ translateY: datePickerSlide }] }}
						>
							<DateTimePicker
								value={date}
								mode="date"
								display="default"
								onChange={(event, selectedDate) => {
									setShowDatePicker(false);
									if (selectedDate) setDate(selectedDate);
								}}
							/>
						</Animated.View>
					)}

					{/* Bounce-In for Amount Input */}
					<Animated.View style={{ transform: [{ scale: amountBounce }] }}>
						<TextInput
							label="Amount"
							keyboardType="numeric"
							value={amount}
							onChangeText={setAmount}
							style={[styles.input, styles.amountInput]} // Change text color to white and make bold
							theme={{ colors: { text: "#FFFFFF" } }} // Ensure text color is white
						/>
					</Animated.View>

					{/* Animated Category Sliding */}
					<View style={styles.field}>
						<Text style={styles.label}>Category</Text>
						<Animated.ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={styles.categoryContainer}
							style={{ transform: [{ translateX: categorySlide }] }} // Slide in from right
						>
							{categories.map((cat) => (
								<TouchableOpacity
									key={cat}
									onPress={() =>
										cat === "Other"
											? handleOtherSelection("category")
											: setCategory(cat)
									}
									style={[
										styles.categoryButton,
										category === cat && styles.selectedCategory,
									]}
								>
									<Text style={styles.categoryText}>{cat}</Text>
								</TouchableOpacity>
							))}
						</Animated.ScrollView>
					</View>

					{/* Account Selection */}
					<View style={styles.field}>
						<Text style={styles.label}>Account</Text>
						<Animated.ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={styles.categoryContainer} // Using same styling as categories
						>
							{accounts.map((acc) => (
								<TouchableOpacity
									key={acc}
									onPress={() =>
										acc === "Other"
											? handleOtherSelection("account")
											: setAccount(acc)
									}
									style={[
										styles.categoryButton, // Use same button style as category
										account === acc && styles.selectedCategory,
									]}
								>
									<Text style={styles.categoryText}>{acc}</Text>
								</TouchableOpacity>
							))}
						</Animated.ScrollView>
					</View>

					{/* Add Button with Ripple and Bounce */}
					<Animated.View style={{ transform: [{ scale: saveButtonBounce }] }}>
						<Pressable
							android_ripple={{ color: "#EFA00B", borderless: false }}
							onPress={handleSavePress}
							style={styles.saveButton}
						>
							<Button icon="plus" mode="contained" buttonColor="#EFA00B">
								Add
							</Button>
						</Pressable>
					</Animated.View>
				</ScrollView>

				{/* Modal for adding custom category or account */}
				<Portal>
					<Modal
						visible={showCustomModal}
						onDismiss={() => setShowCustomModal(false)}
					>
						<View style={styles.modalContent}>
							<TextInput
								label={`Enter new ${customType}`}
								value={customEntry}
								onChangeText={setCustomEntry}
								style={styles.modalInput}
							/>
							<Button
								mode="contained"
								buttonColor="#EFA00B" // Orange color for add button
								onPress={handleAddCustomEntry}
							>
								Add {customType === "category" ? "Category" : "Account"}
							</Button>
						</View>
					</Modal>
				</Portal>

				{/* Success Modal */}
				<Portal>
					<Modal
						visible={showSuccessModal}
						onDismiss={() => setShowSuccessModal(false)}
					>
						<View style={styles.successModal}>
							<Text style={styles.successText}>Expense Added</Text>
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

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#0E0E0E",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 15,
		backgroundColor: "#1F1F1F",
	},
	headerText: {
		fontSize: 20,
		color: "#FFFFFF",
		fontWeight: "bold",
	},
	scrollContainer: {
		padding: 15,
	},
	field: {
		marginVertical: 10,
	},
	label: {
		color: "#EFA00B",
		fontSize: 16,
		fontWeight: "bold",
	},
	value: {
		fontSize: 16,
		color: "#FFFFFF",
		fontWeight: "bold",
	},
	input: {
		backgroundColor: "#333333",
		marginVertical: 5,
		padding: 10,
		borderRadius: 5,
	},
	amountInput: {
		color: "#FFFFFF", // Change text color to white for amount
	},
	categoryContainer: {
		flexDirection: "row",
	},
	categoryButton: {
		padding: 10,
		marginHorizontal: 5,
		backgroundColor: "#525252",
		borderRadius: 20,
	},
	selectedCategory: {
		backgroundColor: "#EFA00B",
	},
	categoryText: {
		color: "#FFFFFF",
		fontWeight: "bold",
	},
	saveButton: {
		marginTop: 20,
		padding: 10,
	},
	modalContent: {
		padding: 20,
		backgroundColor: "#FFFFFF",
		borderRadius: 10,
	},
	modalInput: {
		marginBottom: 15,
	},
	successModal: {
		padding: 20,
		backgroundColor: "#FFFFFF",
		borderRadius: 10,
		alignItems: "center",
		maxWidth: 300,
		alignSelf: "center",
	},
	successText: {
		fontSize: 18,
		color: "#000000",
		marginBottom: 10,
		fontWeight: "bold",
	},
});
