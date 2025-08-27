import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { PhotoCaptureProps, PhotoResult } from "@folded/types";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Alert, TouchableOpacity } from "react-native";

import { Text, View } from "@/components/ui";

export function PhotoCapture({
  onPhotoTaken,
  onSkip,
  isLoading = false,
}: PhotoCaptureProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  // Request permissions (reuse from profile-edit-modal.tsx)
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted" || cameraStatus.status !== "granted") {
      Alert.alert(
        "Permissions needed",
        "Please grant camera and photo library permissions to complete the daily challenge.",
      );
      return false;
    }
    return true;
  };

  const handleCameraPress = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      setIsProcessing(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: false, // No editing needed for daily challenge
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const photo: PhotoResult = {
          uri: result.assets[0].uri,
          type: "camera",
        };
        onPhotoTaken(photo);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGalleryPress = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      setIsProcessing(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false, // No editing needed for daily challenge
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const photo: PhotoResult = {
          uri: result.assets[0].uri,
          type: "gallery",
        };
        onPhotoTaken(photo);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkipPress = () => {
    Alert.alert(
      "Skip Challenge",
      "Are you sure you want to skip today's challenge? Your streak will reset at midnight.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Skip",
          style: "destructive",
          onPress: onSkip,
        },
      ],
    );
  };

  const isButtonDisabled = isLoading || isProcessing;

  return (
    <View className="flex-1 bg-background">
      {/* Main Content Card - Exact same structure as intro */}
      <View className="flex-1 px-4">
        <View
          className="rounded-3xl p-8 justify-center"
          style={{
            backgroundColor: "#8B5CF6", // Changed from teal to purple
            minHeight: 500,
            flex: 1,
          }}
        >
          {/* Header section - Moved up by height of words */}
          <View className="mb-12" style={{ marginTop: -40 }}>
            <Text className="text-white text-lg font-medium mb-4 text-left">
              Daily Challenge
            </Text>

            <Text
              className="text-white text-2xl font-bold text-center leading-tight mb-8"
              style={{ lineHeight: 32 }}
            >
              Snap a photo of what{"\n"}you're doing right{"\n"}now.
            </Text>
          </View>

          {/* Centrally aligned action section - EXACT same structure as intro */}
          <View className="items-center">
            {/* Skip Option */}
            <TouchableOpacity
              onPress={handleSkipPress}
              disabled={isButtonDisabled}
              className="mb-8"
            >
              <Text
                className="text-white text-base font-medium"
                style={{ opacity: isButtonDisabled ? 0.5 : 0.6 }}
              >
                Skip
              </Text>
            </TouchableOpacity>

            {/* Photo Action Buttons - Black icons with white backgrounds */}
            <View
              className="flex-row justify-center items-center"
              style={{ gap: 40 }}
            >
              {/* Gallery Button */}
              <TouchableOpacity
                onPress={handleGalleryPress}
                disabled={isButtonDisabled}
                className="w-20 h-20 rounded-full items-center justify-center"
                style={{
                  backgroundColor: "#FFFFFF", // White background
                  opacity: isButtonDisabled ? 0.5 : 1,
                }}
              >
                <MaterialIcons name="photo-library" size={40} color="black" />
              </TouchableOpacity>

              {/* Camera Button */}
              <TouchableOpacity
                onPress={handleCameraPress}
                disabled={isButtonDisabled}
                className="w-20 h-20 rounded-full items-center justify-center"
                style={{
                  backgroundColor: "#FFFFFF", // White background
                  opacity: isButtonDisabled ? 0.5 : 1,
                }}
              >
                <MaterialIcons name="camera-alt" size={40} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom spacing */}
      <View className="h-20" />

      {/* Loading overlay */}
      {isProcessing && (
        <View
          className="absolute inset-0 bg-black items-center justify-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
        >
          <Text className="text-white text-lg">Processing photo...</Text>
        </View>
      )}
    </View>
  );
}
