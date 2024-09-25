import React, { useState, useEffect } from "react";
import {
	SafeAreaView,
	View,
	Text,
	ScrollView,
	Image,
	Dimensions,
} from "react-native";
import { Avatar, Button } from "react-native-paper";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { PieChart } from "react-native-chart-kit"; // Import PieChart

interface Transaction {
	id: string;
	amount: number;
	category: string;
	t_date: string; // Changed 'date' to 't_date' to match your data structure
}

const FallbackAvatar = () => (
	<Image
		source={require("../../assets/images/people_icon.png")}
		style={{ width: 50, height: 50, borderRadius: 25 }}
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
			size={50}
			source={{ uri: url }}
			onError={() => setImageError(true)}
		/>
	);
};

export default function AnalyticsPage() {
	const [user, setUser] = useState<User | null>(null);
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [categoryBreakdown, setCategoryBreakdown] = useState<
		{ name: string; color: string; amount: number }[]
	>([]);
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // Track selected category

	const [categories] = useState([
		{ name: "Food", color: "#FF6F61" },
		{ name: "Social Life", color: "#4A90E2" },
		{ name: "Pets", color: "#FFD700" },
		{ name: "Transport", color: "#50E3C2" },
		{ name: "Culture", color: "#9B51E0" },
		{ name: "Household", color: "#FF9F40" },
		{ name: "Apparel", color: "#FFCC00" },
		{ name: "Beauty & Health", color: "#E91E63" },
		{ name: "Education", color: "#66BB6A" },
		{ name: "Gift", color: "#FF7043" },
		{ name: "Entertainment", color: "#29B6F6" },
		{ name: "Other", color: "#607D8B" },
	]);

	useEffect(() => {
		async function fetchUserAndTransactions() {
			try {
				const {
					data: { user },
					error: userError,
				} = await supabase.auth.getUser();
				if (userError) throw userError;

				const { data: transactionsData, error: transactionsError } =
					await supabase
						.from("transactions")
						.select("*")
						.eq("user_id", user?.id);

				if (transactionsError) throw transactionsError;
				console.log("Transaction Data", transactionsData);
				setUser(user);
				setTransactions(transactionsData || []);
				calculateCategoryBreakdown(transactionsData || []);
			} catch (e) {
				setError(e instanceof Error ? e.message : "An unknown error occurred");
			} finally {
				setLoading(false);
			}
		}

		fetchUserAndTransactions();
	}, []);

	const calculateCategoryBreakdown = (transactions: Transaction[]) => {
		const categoryTotals: { [key: string]: number } = {};

		transactions.forEach((transaction) => {
			if (!categoryTotals[transaction.category]) {
				categoryTotals[transaction.category] = 0;
			}
			categoryTotals[transaction.category] += transaction.amount;
		});

		const breakdown = categories
			.map((cat) => ({
				name: cat.name,
				color: cat.color,
				amount: categoryTotals[cat.name] || 0,
			}))
			.filter((entry) => entry.amount > 0); // Filter out categories with no transactions

		setCategoryBreakdown(breakdown);
	};

	const generatePieChartData = () => {
		const totalAmount = categoryBreakdown.reduce(
			(sum, item) => sum + item.amount,
			0
		);
		return categoryBreakdown.map((item) => ({
			name: item.name,
			amount: item.amount,
			color: item.color,
			legendFontColor: "#FFF",
			legendFontSize: 12,
			percentage: ((item.amount / totalAmount) * 100).toFixed(1), // Calculate percentage
		}));
	};

	const handleCategoryPress = (index: number) => {
		const selected = categoryBreakdown[index].name;
		setSelectedCategory(selected); // Set the selected category
	};

	const formatDate = (dateString: string) => {
		const options = { year: "numeric", month: "long", day: "numeric" };
		return new Date(dateString).toLocaleDateString(undefined, options);
	};

	const sortedTransactions = transactions.sort(
		(a, b) => new Date(b.t_date).getTime() - new Date(a.t_date).getTime()
	); // Sort transactions by date (newest first)

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
			<ScrollView className="p-5">
				{/* User Info Section */}
				<View className="flex flex-row p-5 items-center">
					<Text className="text-3xl text-white font-bold">Your Hub</Text>
					<View className="ml-auto">
						<ProfileAvatar url={user?.user_metadata.avatar_url} />
					</View>
				</View>

				{/* Pie Chart Section */}
				<View className="mb-8">
					<Text className="text-xl text-white mb-4">Spending by Category:</Text>
					{categoryBreakdown.length > 0 ? (
						<PieChart
							data={generatePieChartData()}
							width={Dimensions.get("window").width - 20} // Full width of the screen
							height={250}
							chartConfig={{
								backgroundColor: "#000",
								backgroundGradientFrom: "#000",
								backgroundGradientTo: "#000",
								color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
								labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
							}}
							accessor={"amount"}
							backgroundColor={"transparent"}
							paddingLeft={"15"}
							absolute // Show absolute values
							hasLegend={true}
						/>
					) : (
						<Text className="text-white">No data available for chart.</Text>
					)}

					{selectedCategory && (
						<Text className="text-center text-lg text-yellow-400 mt-4">
							Selected Category: {selectedCategory}
						</Text>
					)}
				</View>

				{/* Transaction List */}
				<View className="mb-8">
					<Text className="text-xl text-white">Your Transactions:</Text>
					{sortedTransactions.length === 0 ? (
						<Text className="text-white mt-2">No transactions found</Text>
					) : (
						sortedTransactions.map((transaction, index) => (
							<View key={index} className="mt-4 p-4 bg-gray-800 rounded-lg">
								<Text className="text-white font-bold">
									Amount: ${transaction.amount.toFixed(2)}
								</Text>
								<Text className="text-white">
									Category: {transaction.category}
								</Text>
								<Text className="text-white">
									Date: {formatDate(transaction.t_date)}
								</Text>
							</View>
						))
					)}
				</View>

				{/* Buttons Section */}
				<View className="flex flex-row">
					<Button
						icon="cash"
						mode="contained"
						buttonColor="#EFA00B"
						onPress={() => console.log("Edit Budget")}
						className="rounded-xl mr-1"
					>
						Edit your Budget
					</Button>
					<Button
						icon="plus"
						mode="contained"
						buttonColor="#EFA00B"
						onPress={() => console.log("Add Transaction")}
						className="rounded-xl mr-1"
					>
						Add Transaction
					</Button>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
