import AntDesign from "@expo/vector-icons/AntDesign";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  TouchableOpacity,
} from "react-native";

import { Button, Input, Text, View } from "@/components/ui";
import { useAuthContext } from "@/hooks/use-auth-context";
import { uploadProfileImage } from "@/lib/image-upload";

interface ProfileEditModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  visible,
  onClose,
}) => {
  const { user, updateUser } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(user?.displayName || "");
  const [profileImageUri, setProfileImageUri] = useState<string | null>(
    user?.photoURL || null,
  );

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted" || cameraStatus.status !== "granted") {
      Alert.alert(
        "Permissions needed",
        "Please grant camera and photo library permissions to upload a profile picture.",
      );
      return false;
    }
    return true;
  };

  const showImageOptions = () => {
    Alert.alert(
      "Select Profile Picture",
      "Choose how you'd like to add your profile picture",
      [
        {
          text: "Take Photo",
          onPress: takePhoto,
        },
        {
          text: "Choose from Library",
          onPress: pickImage,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
    );
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio
        quality: 0.8,
      });

      if (!result.canceled) {
        console.log("📸 Photo taken:", result.assets[0].uri);
        setProfileImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio
        quality: 0.8,
      });

      if (!result.canceled) {
        console.log("🖼️ Image selected:", result.assets[0].uri);
        setProfileImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleSave = async () => {
    if (!user) return;

    console.log("💾 Saving profile changes...");
    setLoading(true);

    try {
      // Test just username first
      if (username !== user.displayName && username.trim()) {
        console.log("Updating username to:", username);
        await updateUser("displayName", username);
        console.log("✅ Username updated");
      }

      // Upload and persist profile image if changed
      if (profileImageUri && profileImageUri !== user.photoURL) {
        console.log("📤 Uploading profile image:", profileImageUri);
        const downloadURL = await uploadProfileImage(profileImageUri, user.uid);
        await updateUser("photoURL", downloadURL);
        console.log("✅ Photo URL saved to user document");
      }

      Alert.alert("Success", "Profile updated successfully!");
      onClose();
    } catch (error) {
      console.error("❌ Error saving profile:", error);
      Alert.alert("Error", "Failed to save profile changes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    console.log("❌ Cancelled profile edit");
    // Reset to original values
    setUsername(user?.displayName || "");
    setProfileImageUri(user?.photoURL || null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <BlurView intensity={50} style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View className="flex-1 justify-center items-center px-6">
            <View className="bg-background rounded-2xl p-6 w-full max-w-sm">
              {/* Header */}
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-xl font-semibold">Edit Profile</Text>
                <TouchableOpacity onPress={handleCancel}>
                  <AntDesign name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>

              {/* Profile Picture */}
              <View className="items-center mb-6">
                <View className="relative">
                  <View
                    className="w-32 h-32 rounded-full border-2 border-gray-400 items-center justify-center"
                    style={{ borderColor: "#9CA3AF" }}
                  >
                    {profileImageUri ? (
                      <Image
                        source={{ uri: profileImageUri }}
                        style={{ width: 124, height: 124, borderRadius: 62 }}
                        contentFit="cover"
                      />
                    ) : (
                      <Text className="text-4xl">👤</Text>
                    )}
                  </View>

                  {/* Plus icon in bottom right */}
                  <TouchableOpacity
                    onPress={showImageOptions}
                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-accent rounded-full items-center justify-center border-2 border-background"
                  >
                    <AntDesign name="plus" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Username Input */}
              <View className="mb-6">
                <Input
                  placeholder="Add username"
                  value={username}
                  onChangeText={setUsername}
                  maxLength={30}
                />
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Button
                    text="Cancel"
                    variant="secondary"
                    onPress={handleCancel}
                    disabled={loading}
                  />
                </View>
                <View className="flex-1">
                  <Button
                    text={loading ? "Saving..." : "Save"}
                    onPress={handleSave}
                    disabled={loading}
                  />
                </View>
              </View>

              {/* Debug info - remove later */}
              <View className="mt-4 opacity-50">
                <Text className="text-xs">
                  Debug: User ID: {user?.uid?.slice(0, 8)}...
                </Text>
                <Text className="text-xs">
                  Current username: {user?.displayName || "none"}
                </Text>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  );
};
