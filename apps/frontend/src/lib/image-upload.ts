import storage from "@react-native-firebase/storage";

export const uploadProfileImage = async (
  uri: string,
  userId: string,
): Promise<string> => {
  try {
    if (__DEV__) console.log("Starting image upload...", { uri, userId });

    // Create a unique filename
    const filename = `profile-images/${userId}/${Date.now()}.jpg`;

    // Create storage reference
    const reference = storage().ref(filename);

    // Upload file
    if (__DEV__) console.log("Uploading to:", filename);
    await reference.putFile(uri);

    // Get download URL
    const downloadURL = await reference.getDownloadURL();
    if (__DEV__) console.log("Upload successful, URL:", downloadURL);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image");
  }
};
