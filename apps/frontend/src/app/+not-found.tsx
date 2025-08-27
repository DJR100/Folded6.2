import { Link, Stack } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";

import { Text, View } from "@/components/ui";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Text variant="h1">This screen does not exist.</Text>
        <Link href="/" style={styles.link}>
          <Text variant="p">Go to home!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
