import { FontAwesome } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Octicons from "@expo/vector-icons/Octicons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { doc, updateDoc } from "@react-native-firebase/firestore";
import { BlurView } from "expo-blur";
import React, { useRef, useState } from "react";
import { Linking, Platform, ScrollView, TouchableOpacity } from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from "react-native-vision-camera";

import { Button, Text, View } from "@/components/ui";
import { colors } from "@/constants/colors";
import { useAuthContext } from "@/hooks/use-auth-context";
import { db } from "@/lib/firebase";

// Crisis resources data
const CRISIS_RESOURCES = [
  {
    title: "National Suicide Prevention Lifeline",
    subtitle: "24/7 crisis support",
    phone: "988",
    description: "Free and confidential support for people in distress",
    icon: "phone" as const,
  },
  {
    title: "Crisis Text Line",
    subtitle: "Text HOME to 741741",
    phone: "741741",
    description: "24/7 crisis support via text message",
    icon: "message" as const,
    isText: true,
  },
  {
    title: "National Problem Gambling Helpline",
    subtitle: "1-800-522-4700",
    phone: "1-800-522-4700",
    description: "24/7 confidential help for problem gambling",
    icon: "phone" as const,
  },
  {
    title: "Gamblers Anonymous",
    subtitle: "Find local meetings",
    website: "https://www.gamblersanonymous.org/ga/locations",
    description: "Support groups and meetings in your area",
    icon: "users" as const,
  },
  {
    title: "National Council on Problem Gambling",
    subtitle: "Resources and support",
    website: "https://www.ncpgambling.org/help-treatment/help-by-state/",
    description: "State-specific resources and treatment options",
    icon: "info-circle" as const,
  },
];

export const PanicButton = () => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const crisisResourcesSheetRef = useRef<BottomSheet>(null);
  const relapseConfirmationSheetRef = useRef<BottomSheet>(null);
  const { user } = useAuthContext();
  const { hasPermission, requestPermission } = useCameraPermission();
  const cameraDevice = useCameraDevice("front");
  const [isResetting, setIsResetting] = useState(false);

  // Calculate current progress for confirmation dialog
  const getCurrentProgress = () => {
    if (!user?.streak?.start) return null;

    const streakMs = Date.now() - user.streak.start;
    const days = Math.floor(streakMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (streakMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );

    // Calculate approximate money saved (if available)
    const monthlySaving = user?.demographic?.gambling?.monthlySpend ?? 0;
    const dailySaving =
      (typeof monthlySaving === "number" ? monthlySaving : 0) / 30;
    const moneySaved = dailySaving * days;

    return {
      days,
      hours,
      moneySaved,
      dailyChallengeStreak: user?.dailyChallenge?.streakCount || 0,
    };
  };

  const onClickPanicButton = async () => {
    await requestPermission();
    bottomSheetRef.current?.expand();
  };

  const onPressRelapse = () => {
    // Close main panic button sheet and open confirmation
    bottomSheetRef.current?.close();
    setTimeout(() => {
      relapseConfirmationSheetRef.current?.expand();
    }, 300);
  };

  const handleConfirmRelapse = async () => {
    if (!user || isResetting) return;

    try {
      setIsResetting(true);

      // Reset both streak.start AND daily challenge data
      await updateDoc(doc(db, "users", user.uid), {
        "streak.start": Date.now(),
        "dailyChallenge.streakCount": 0,
        "dailyChallenge.lastCompletedDate": null,
        "dailyChallenge.currentWeek": [
          false,
          false,
          false,
          false,
          false,
          false,
          false,
        ],
        "dailyChallenge.currentDayState": "pending",
      });

      console.log("🔄 Reset streak and daily challenge data due to relapse");
      relapseConfirmationSheetRef.current?.close();
    } catch (error) {
      console.error("Failed to reset progress:", error);
    } finally {
      setIsResetting(false);
    }
  };

  const onPressThinkingOfRelapsing = () => {
    // Close main panic button sheet and open crisis resources
    bottomSheetRef.current?.close();
    setTimeout(() => {
      crisisResourcesSheetRef.current?.expand();
    }, 300);
  };

  const handleContactResource = async (
    resource: (typeof CRISIS_RESOURCES)[0],
  ) => {
    try {
      if (resource.phone) {
        if (resource.isText) {
          await Linking.openURL(`sms:${resource.phone}`);
        } else {
          await Linking.openURL(`tel:${resource.phone}`);
        }
      } else if (resource.website) {
        await Linking.openURL(resource.website);
      }
    } catch (error) {
      console.error("Failed to open resource:", error);
    }
  };

  const renderResourceIcon = (iconName: string) => {
    const iconProps = { size: 24, color: colors.accent };

    switch (iconName) {
      case "phone":
        return <FontAwesome name="phone" {...iconProps} />;
      case "message":
        return <MaterialIcons name="message" {...iconProps} />;
      case "users":
        return <FontAwesome name="users" {...iconProps} />;
      case "info-circle":
        return <FontAwesome name="info-circle" {...iconProps} />;
      default:
        return <FontAwesome name="info-circle" {...iconProps} />;
    }
  };

  const progress = getCurrentProgress();

  return (
    <>
      <Button
        iconL={
          <FontAwesome
            name="exclamation-triangle"
            size={20}
            color="white"
            className="mt-1"
          />
        }
        text="Panic Button"
        variant="danger"
        onPress={onClickPanicButton}
      />

      {/* Main Panic Button Sheet */}
      <Portal name="bottom-sheet">
        <BottomSheet
          index={-1}
          ref={bottomSheetRef}
          snapPoints={["90%"]}
          enablePanDownToClose
          enableHandlePanningGesture
          enableContentPanningGesture
          enableOverDrag
          backgroundStyle={{ backgroundColor: colors.dangerBackground }}
          handleIndicatorStyle={{ backgroundColor: colors.foreground }}
        >
          <BottomSheetView
            style={{
              height: "100%",
              paddingBottom: Platform.OS === "android" ? 50 : 0,
            }}
          >
            <View className="flex flex-col gap-4 p-4 pt-2 h-full justify-between overflow-hidden">
              <View className="flex flex-col gap-4 overflow-y-auto">
                <Text variant="h2" className="text-danger text-center">
                  Panic Button
                </Text>
                {hasPermission && cameraDevice !== undefined && (
                  <>
                    <View className="rounded-2xl overflow-hidden h-[500px]">
                      <Camera
                        style={{
                          width: "100%",
                          height: "100%",
                        }}
                        device={cameraDevice}
                        isActive={true}
                      />
                      <BlurView className="absolute bottom-0 left-0 right-0 p-4">
                        <Text variant="h1" className="text-center px-4">
                          Don't let this slip define you.
                        </Text>
                      </BlurView>
                    </View>
                  </>
                )}
              </View>
              <View className="flex flex-col gap-2">
                <Button
                  iconL={
                    <Octicons
                      name="thumbsdown"
                      size={18}
                      color={colors.danger}
                    />
                  }
                  text="I relapsed"
                  variant="dangerOutline"
                  onPress={onPressRelapse}
                />
                <Button
                  iconL={
                    <AntDesign
                      name="exclamationcircleo"
                      size={20}
                      color={colors.foreground}
                    />
                  }
                  text="I'm thinking of relapsing"
                  variant="danger"
                  onPress={onPressThinkingOfRelapsing}
                />
              </View>
            </View>
          </BottomSheetView>
        </BottomSheet>
      </Portal>

      {/* Relapse Confirmation Sheet */}
      <Portal name="relapse-confirmation-sheet">
        <BottomSheet
          index={-1}
          ref={relapseConfirmationSheetRef}
          snapPoints={["85%"]}
          enablePanDownToClose
          enableHandlePanningGesture
          enableContentPanningGesture
          enableOverDrag
          backgroundStyle={{ backgroundColor: colors.background }}
          handleIndicatorStyle={{ backgroundColor: colors.foreground }}
        >
          <BottomSheetView
            style={{
              height: "100%",
              paddingBottom: Platform.OS === "android" ? 50 : 0,
            }}
          >
            <ScrollView className="flex-1 p-4 pt-2">
              {/* Header */}
              <View className="flex-row items-center justify-between mb-6">
                <Text variant="h2" className="text-danger">
                  Reset Progress
                </Text>
                <TouchableOpacity
                  onPress={() => relapseConfirmationSheetRef.current?.close()}
                >
                  <AntDesign name="close" size={24} color={colors.foreground} />
                </TouchableOpacity>
              </View>

              {/* Recovery Message */}
              <View className="bg-content2 rounded-xl p-4 mb-6">
                <Text variant="h3" className="mb-3 text-accent">
                  Recovery is a journey
                </Text>
                <Text className="text-foreground mb-3">
                  Relapses can be part of recovery. What matters most is getting
                  back on track. You're taking responsibility, which shows
                  strength.
                </Text>
                <Text className="text-foreground">
                  Consider reaching out for support before resetting your
                  progress.
                </Text>
              </View>

              {/* Progress Impact */}
              {progress && (
                <View className="bg-danger/10 border border-danger/30 rounded-xl p-4 mb-6">
                  <Text variant="h3" className="text-danger mb-4">
                    This will reset your progress:
                  </Text>

                  <View className="space-y-3">
                    {/* Recovery Time */}
                    <View className="flex-row items-center">
                      <FontAwesome
                        name="clock-o"
                        size={20}
                        color={colors.danger}
                      />
                      <View className="ml-3">
                        <Text className="text-foreground font-semibold">
                          Recovery Time:{" "}
                          {progress.days > 0
                            ? `${progress.days} days, ${progress.hours} hours`
                            : `${progress.hours} hours`}
                        </Text>
                        <Text className="text-foreground/70 text-sm">
                          Will reset to 0
                        </Text>
                      </View>
                    </View>

                    {/* Money Saved */}
                    {progress.moneySaved > 0 && (
                      <View className="flex-row items-center">
                        <FontAwesome
                          name="dollar"
                          size={20}
                          color={colors.danger}
                        />
                        <View className="ml-3">
                          <Text className="text-foreground font-semibold">
                            Money Saved: ${progress.moneySaved.toFixed(2)}
                          </Text>
                          <Text className="text-foreground/70 text-sm">
                            Counter will restart
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Daily Challenge Streak */}
                    {progress.dailyChallengeStreak > 0 && (
                      <View className="flex-row items-center">
                        <FontAwesome
                          name="fire"
                          size={20}
                          color={colors.danger}
                        />
                        <View className="ml-3">
                          <Text className="text-foreground font-semibold">
                            Daily Challenge Streak:{" "}
                            {progress.dailyChallengeStreak} days
                          </Text>
                          <Text className="text-foreground/70 text-sm">
                            Will reset to 0
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Alternative Options */}
              <View className="mb-6">
                <Text variant="h3" className="mb-3">
                  Before you reset, consider:
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    relapseConfirmationSheetRef.current?.close();
                    setTimeout(() => {
                      crisisResourcesSheetRef.current?.expand();
                    }, 300);
                  }}
                  className="bg-accent/20 border border-accent/30 rounded-xl p-4 mb-3"
                >
                  <View className="flex-row items-center">
                    <FontAwesome name="heart" size={20} color={colors.accent} />
                    <View className="ml-3 flex-1">
                      <Text className="text-foreground font-semibold">
                        Get support instead
                      </Text>
                      <Text className="text-foreground/70 text-sm">
                        Access crisis resources and helplines
                      </Text>
                    </View>
                    <FontAwesome
                      name="chevron-right"
                      size={16}
                      color={colors.foreground}
                    />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => relapseConfirmationSheetRef.current?.close()}
                  className="bg-content2 rounded-xl p-4"
                >
                  <View className="flex-row items-center">
                    <FontAwesome
                      name="pause"
                      size={20}
                      color={colors.foreground}
                    />
                    <View className="ml-3 flex-1">
                      <Text className="text-foreground font-semibold">
                        Take a moment
                      </Text>
                      <Text className="text-foreground/70 text-sm">
                        Close this and think it through
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Confirmation Buttons */}
            <View className="p-4 pt-0">
              <Text className="text-center text-foreground/70 text-sm mb-4">
                Only reset if you're certain. This action cannot be undone.
              </Text>

              <View className="space-y-6">
                <Button
                  text={isResetting ? "Resetting..." : "Yes, reset my progress"}
                  variant="danger"
                  disabled={isResetting}
                  onPress={handleConfirmRelapse}
                />
                <View className="mt-4"></View>
                <Button
                  text="Cancel"
                  variant="outline"
                  onPress={() => {
                    relapseConfirmationSheetRef.current?.close();
                    setTimeout(() => {
                      bottomSheetRef.current?.expand();
                    }, 300);
                  }}
                />
              </View>
            </View>
          </BottomSheetView>
        </BottomSheet>
      </Portal>

      {/* Crisis Resources Sheet */}
      <Portal name="crisis-resources-sheet">
        <BottomSheet
          index={-1}
          ref={crisisResourcesSheetRef}
          snapPoints={["90%"]}
          enablePanDownToClose
          enableHandlePanningGesture
          enableContentPanningGesture
          enableOverDrag
          backgroundStyle={{ backgroundColor: colors.background }}
          handleIndicatorStyle={{ backgroundColor: colors.foreground }}
        >
          <BottomSheetView
            style={{
              height: "100%",
              paddingBottom: Platform.OS === "android" ? 50 : 0,
            }}
          >
            <View className="flex-1 p-4 pt-2">
              {/* Header */}
              <View className="flex-row items-center justify-between mb-6">
                <Text variant="h2" className="text-accent">
                  Crisis Resources
                </Text>
                <TouchableOpacity
                  onPress={() => crisisResourcesSheetRef.current?.close()}
                >
                  <AntDesign name="close" size={24} color={colors.foreground} />
                </TouchableOpacity>
              </View>

              {/* Immediate Help Banner */}
              <View className="bg-danger/20 border border-danger/30 rounded-xl p-4 mb-6">
                <Text variant="h3" className="text-danger mb-2">
                  Need immediate help?
                </Text>
                <Text className="text-foreground mb-3">
                  If you're having thoughts of suicide or self-harm, please
                  reach out immediately.
                </Text>
                <TouchableOpacity
                  onPress={() => handleContactResource(CRISIS_RESOURCES[0])}
                  className="bg-danger rounded-lg p-3 flex-row items-center justify-center"
                >
                  <FontAwesome
                    name="phone"
                    size={18}
                    color="white"
                    className="mr-2"
                  />
                  <Text className="text-white font-semibold ml-2">
                    Call 988 Now
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Resources List */}
              <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
              >
                <Text variant="h3" className="mb-4">
                  Support Resources
                </Text>

                {CRISIS_RESOURCES.map((resource, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleContactResource(resource)}
                    className="bg-content2 rounded-xl p-4 mb-3 flex-row items-center"
                  >
                    <View className="mr-4">
                      {renderResourceIcon(resource.icon)}
                    </View>
                    <View className="flex-1">
                      <Text variant="h4" className="mb-1">
                        {resource.title}
                      </Text>
                      <Text className="text-accent mb-1">
                        {resource.subtitle}
                      </Text>
                      <Text className="text-foreground/70 text-sm">
                        {resource.description}
                      </Text>
                    </View>
                    <FontAwesome
                      name="chevron-right"
                      size={16}
                      color={colors.foreground}
                    />
                  </TouchableOpacity>
                ))}

                {/* Additional Support Message */}
                <View className="bg-content2 rounded-xl p-4 mt-4 mb-6">
                  <Text variant="h4" className="mb-2 text-accent">
                    You're not alone
                  </Text>
                  <Text className="text-foreground">
                    Recovery is a journey, and having urges doesn't mean you've
                    failed. These resources are here to support you whenever you
                    need them.
                  </Text>
                </View>
              </ScrollView>

              {/* Back Button */}
              <View className="pt-4">
                <Button
                  text="Back to Panic Button"
                  variant="outline"
                  onPress={() => {
                    crisisResourcesSheetRef.current?.close();
                    setTimeout(() => {
                      bottomSheetRef.current?.expand();
                    }, 300);
                  }}
                />
              </View>
            </View>
          </BottomSheetView>
        </BottomSheet>
      </Portal>
    </>
  );
};
