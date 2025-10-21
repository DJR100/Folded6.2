import { useEffect, useState } from "react";
import Purchases, { PurchasesOffering, type CustomerInfo } from "react-native-purchases";
import RevenueCatUI from "react-native-purchases-ui";
import { router } from "expo-router";
import { Button, View, Text } from "@/components/ui";
import { StatusBar, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";

export default function OnboardingPaywall() {
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
 
  // If already entitled, skip forward to step 8 immediately
  useEffect(() => {
    Purchases.getCustomerInfo()
      .then((info) => {
        if (info.entitlements.active["pro"]) {
          router.replace("/onboarding/8");
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const o = await Purchases.getOfferings();
        const current = o.current ?? null;
        if (!isMounted) return;
        if (!current || (current.availablePackages?.length ?? 0) === 0) {
          setOffering(null);
          setLoadError("No purchase options available. Please try again shortly.");
          return;
        }
        setLoadError(null);
        setOffering(current);
      } catch (e) {
        if (__DEV__) console.warn(e);
        if (!isMounted) return;
        setLoadError("Unable to load purchase options. Check your connection and retry.");
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  if (!offering) {
    return (
      <View className="flex-1 items-center justify-center p-6 gap-4">
        <Text>{loadError ?? "Loading..."}</Text>
        {loadError && (
          <View className="flex-row gap-3">
            <Button text="Retry" onPress={() => setReloadKey((k) => k + 1)} />
            <Button text="Back" variant="secondary" onPress={() => router.back()} />
          </View>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView
      edges={["left", "right"]}
      style={[StyleSheet.absoluteFillObject, { backgroundColor: "#000" }]}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <RevenueCatUI.Paywall
        options={{ offering, displayCloseButton: false }}
        onPurchaseCompleted={({ customerInfo }) => {
          const hasPro = !!customerInfo.entitlements.active["pro"];
          if (hasPro) router.replace("/onboarding/8");
        }}
        onRestoreCompleted={({ customerInfo }) => {
          const hasPro = !!customerInfo.entitlements.active["pro"];
          if (hasPro) router.replace("/onboarding/8");
        }}
        onPurchaseError={({ error }) => { if (__DEV__) console.warn(error); }}
      />

      {/* Custom close button overlay in the extreme top-right (partially under status icons) */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => router.back()}
          style={{ position: "absolute", top: 6, right: 8, padding: 10 }}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <AntDesign name="close" size={22} color="#FFFFFFCC" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}