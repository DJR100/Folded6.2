import { useEffect, useState } from "react";
import Purchases, { PurchasesOffering, type CustomerInfo } from "react-native-purchases";
import RevenueCatUI from "react-native-purchases-ui";
import { router, useLocalSearchParams } from "expo-router";
import { Button, View, Text } from "@/components/ui";
import { StatusBar, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";
import { RC_ENTITLEMENT_ID } from "@/lib/revenuecat";

export default function OnboardingPaywall() {
  const { source } = useLocalSearchParams<{ source?: string }>();
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
 
  // If already entitled, skip forward to step 8 immediately
  useEffect(() => {
    // When opened from Settings, always show the paywall even for subscribed users
    if (source === "settings") return;
    Purchases.getCustomerInfo()
      .then((info) => {
        if (info.entitlements.active[RC_ENTITLEMENT_ID]) {
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
          const hasPro = !!customerInfo.entitlements.active[RC_ENTITLEMENT_ID];
          if (!hasPro) return;

          if (source === "settings") {
            Alert.alert(
              "Subscription active",
              "Your subscription is active. Enjoy Pro features.",
              [{ text: "OK", onPress: () => router.replace("/dashboard") }],
            );
          } else {
            Alert.alert(
              "Thanks!",
              "Your purchase is confirmed.",
              [{ text: "Continue", onPress: () => router.replace("/onboarding/8") }],
            );
          }
        }}
        onRestoreCompleted={({ customerInfo }) => {
          const hasPro = !!customerInfo.entitlements.active[RC_ENTITLEMENT_ID];
          if (!hasPro) return;

          if (source === "settings") {
            Alert.alert(
              "Subscription restored",
              "We found your active subscription and restored access.",
              [{ text: "OK", onPress: () => router.replace("/dashboard") }],
            );
          } else {
            Alert.alert(
              "Restored",
              "Access has been restored.",
              [{ text: "Continue", onPress: () => router.replace("/onboarding/8") }],
            );
          }
        }}
        onPurchaseError={({ error }) => {
          if (__DEV__) console.warn(error);
          // If Apple shows "You are currently subscribed", attempt restore and unlock
          (async () => {
            try {
              const info = await Purchases.getCustomerInfo();
              let has = !!info.entitlements.active[RC_ENTITLEMENT_ID];
              if (!has) {
                const restored = await Purchases.restorePurchases();
                has = !!restored.entitlements.active[RC_ENTITLEMENT_ID];
              }
              if (has) {
                if (source === "settings") {
                  Alert.alert(
                    "Subscription restored",
                    "We found your active subscription and restored access.",
                    [{ text: "OK", onPress: () => router.replace("/dashboard") }],
                  );
                } else {
                  Alert.alert(
                    "Restored",
                    "Access has been restored.",
                    [{ text: "Continue", onPress: () => router.replace("/onboarding/8") }],
                  );
                }
              }
            } catch {}
          })();
        }}
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