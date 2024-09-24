import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, SafeAreaView, ScrollView } from "react-native";
import { Avatar } from "react-native-paper";
import HomePageChart from "@/components/homePageChart";
import SpendingsCard from "@/components/SpendingsCard";
import AvatarClickHandle from "@/components/functions/AvatarClickHandle";
import { supabase } from "@/lib/supabase"; // Import supabase

const App = () => {
	const [session, setSession] = useState(null);
	const [name, setName] = useState("Karthikeyan");
	const [currMonthSpend, setCurrMonthSpend] = useState(54501);
	const [savingsImpact, setSavingsImpact] = useState(10);

	useEffect(() => {
		const fetchSessionData = async () => {
			try {
				const {
					data: { session },
				} = await supabase.auth.getSession();
				console.log("Session", session);
				setSession(session);
				if (session?.user) {
					setName(session.user.email?.split("@")[0]); // Set name to the user's email

					const { data, error } = await supabase
						.from("users")
						.select()
						.eq("email", session.user.email)
						.single()

					if (error) {
						console.error("Error fetching user data:", error);
					} else {
						// Handle user data if needed
						console.log("User data:", data);
					}
				}
			} catch (error) {
				console.error("Error fetching session:", error);
			}
		};

		fetchSessionData();
	}, []);

	return (
		<SafeAreaView style={styles.container}>
			<View className="flex flex-row p-5">
				<View className="flex flex-col">
					<Text className="text-2xl text-white">Hi,</Text>
					<Text className="text-4xl font-extrabold text-white">{name}</Text>
				</View>
				<View className="flex justify-center items-end flex-grow">
					<Avatar.Image
						size={50}
						source={require("../../assets/images/people_icon.png")}
						onTouchEnd={AvatarClickHandle}
					/>
				</View>
			</View>
			{/* Header over */}

			<ScrollView className="mb-20">
				<View className="pt-2">
					<View className="pl-5">
						<Text className="text-white text-2xl font-black">This month</Text>
						<Text className="pt-2 text-white text-4xl font-light">
							$ {currMonthSpend}
						</Text>
						<Text>
							<Text className="text-gray-500 text-xl">Savings Impact</Text>
							<Text className="text-green-500 text-xl"> {savingsImpact}%</Text>
						</Text>
					</View>
					<View className="py-5 pr-5">
						<HomePageChart />
					</View>
					<View className="p-5 mb-10">
						<SpendingsCard category="Food" amount={2000} savingsImpact={10} />
						<SpendingsCard category="Travel" amount={5000} savingsImpact={10} />
						<SpendingsCard
							category="Entertainment"
							amount={5000}
							savingsImpact={10}
						/>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#000", // Set your desired background color
	},
});

export default App;
