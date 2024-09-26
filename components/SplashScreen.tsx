import React from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

const SplashScreenComponent = () => {
  return (
    <View style={styles.container}>
      <LottieView
        style={styles.lottie}
        source={require("../assets/images/lottie-animations.json")}
        autoPlay
        loop={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  lottie: {
    width: "100%",
    height: "100%",
  },
});

export default SplashScreenComponent;
