// apps/frontend/src/components/feedback-modal.tsx
import AntDesign from "@expo/vector-icons/AntDesign";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "@react-native-firebase/firestore";
import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Input, Text, View } from "@/components/ui";
import { useAuthContext } from "@/hooks/use-auth-context";
import { db } from "@/lib/firebase";

type Mode = "menu" | "bug" | "general" | "feature";

export function FeedbackModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<Mode>("menu");
  const insets = useSafeAreaInsets();

  // General feedback rotating placeholder
  const generalPHs = useMemo(
    () => [
      "Something confusing?",
      "Anything feel slow or clunky?",
      "Love something?",
    ],
    [],
  );
  const [generalPHIndex, setGeneralPHIndex] = useState(() =>
    Math.floor(Math.random() * generalPHs.length),
  );
  const generalPH = generalPHs[generalPHIndex];

  // Bug fields
  const [bugWhat, setBugWhat] = useState("");
  const [bugTrying, setBugTrying] = useState("");

  // General fields
  const [sentiment, setSentiment] = useState<string | null>(null);
  const [generalText, setGeneralText] = useState("");

  // Feature fields
  const [featureIdea, setFeatureIdea] = useState("");
  const [featureDesc, setFeatureDesc] = useState("");
  const [featureImpact, setFeatureImpact] = useState<
    "nice" | "helpful" | "must" | null
  >(null);

  const { user } = useAuthContext();

  const submitFeedback = async (
    type: "bug" | "general" | "feature",
    payload: Record<string, any>,
  ) => {
    if (!user?.uid) throw new Error("Must be signed in to submit feedback");
    await addDoc(collection(db, "feedback"), {
      type,
      ...payload,
      userId: user.uid,
      email: user.email ?? null,
      createdAt: serverTimestamp(),
    });
  };

  const resetAndClose = () => {
    setMode("menu");
    setBugWhat("");
    setBugTrying("");
    setSentiment(null);
    setGeneralText("");
    setFeatureIdea("");
    setFeatureDesc("");
    setFeatureImpact(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={resetAndClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={insets.top + 12}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background px-4 pt-4 pb-6 rounded-t-2xl max-h-[85%]">
            <ScrollView
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
              showsVerticalScrollIndicator={false}
            >
              <View className="flex-row items-center justify-between mb-3">
                <Text variant="h3">
                  {mode === "menu"
                    ? "Send Feedback"
                    : mode === "bug"
                      ? "Report a Bug"
                      : mode === "general"
                        ? "General Feedback"
                        : "Feature Idea"}
                </Text>
                <TouchableOpacity onPress={resetAndClose}>
                  <AntDesign name="close" size={22} color="white" />
                </TouchableOpacity>
              </View>

              {mode === "menu" && (
                <View className="flex gap-3">
                  <Button text="Report Bug" onPress={() => setMode("bug")} />
                  <Button
                    text="General Feedback"
                    onPress={() => setMode("general")}
                  />
                  <Button
                    text="Feature Idea"
                    onPress={() => setMode("feature")}
                  />
                  <Text className="text-xs opacity-60 text-center mt-1">
                    Includes device/app details. We may email you about this.
                  </Text>
                  <Button
                    variant="secondary"
                    text="Close"
                    onPress={resetAndClose}
                  />
                </View>
              )}

              {mode === "bug" && (
                <View className="flex gap-3">
                  <View className="gap-2">
                    <Text>What went wrong?</Text>
                    <Input
                      placeholder="App froze on Weekly Tracker"
                      value={bugWhat}
                      onChangeText={setBugWhat}
                    />
                  </View>

                  <View className="gap-2">
                    <Text>What were you trying to do?</Text>
                    <Input
                      placeholder="Start today’s challenge"
                      value={bugTrying}
                      onChangeText={setBugTrying}
                    />
                  </View>

                  <Button
                    text="Send bug"
                    onPress={async () => {
                      await submitFeedback("bug", {
                        what: bugWhat,
                        trying: bugTrying,
                      });
                      Alert.alert("Thanks!", "Bug report received ✅");
                      resetAndClose();
                    }}
                  />
                  <Text className="text-xs opacity-60">
                    Includes device/app details. We may email you about this.
                  </Text>
                  <Button
                    variant="secondary"
                    text="Back"
                    onPress={() => setMode("menu")}
                  />
                </View>
              )}

              {mode === "general" && (
                <View className="flex gap-3">
                  <View className="flex-row gap-2 justify-center">
                    {["😍", "👍", "😐", "😕", "😡"].map((emoji) => (
                      <View key={emoji} className="w-14">
                        <Button
                          text={emoji}
                          variant={sentiment === emoji ? "accent" : "secondary"}
                          onPress={() => setSentiment(emoji)}
                        />
                      </View>
                    ))}
                  </View>

                  <View className="gap-2">
                    <Text>Help us improve.</Text>
                    <Input
                      placeholder={generalPH}
                      value={generalText}
                      onChangeText={setGeneralText}
                      multiline
                    />
                  </View>

                  <Button
                    text="Send feedback"
                    onPress={async () => {
                      await submitFeedback("general", {
                        sentiment,
                        text: generalText,
                      });
                      Alert.alert("Appreciate it", "Logged! 🙌");
                      resetAndClose();
                      setGeneralPHIndex((i) => (i + 1) % generalPHs.length);
                    }}
                  />
                  <Text className="text-xs opacity-60">
                    Includes device/app details. We may email you about this.
                  </Text>
                  <Button
                    variant="secondary"
                    text="Back"
                    onPress={() => setMode("menu")}
                  />
                </View>
              )}

              {mode === "feature" && (
                <View className="flex gap-3">
                  <View className="gap-2">
                    <Text>Idea in one sentence</Text>
                    <Input
                      placeholder="Calendar view with green ticked days"
                      value={featureIdea}
                      onChangeText={setFeatureIdea}
                    />
                  </View>

                  <View className="gap-2">
                    <Text>Brief description (optional)</Text>
                    <Input
                      placeholder="So I can track streaks across months"
                      value={featureDesc}
                      onChangeText={setFeatureDesc}
                      multiline
                    />
                  </View>

                  <Text className="text-center">Impact</Text>
                  <View className="flex-row gap-2 justify-center">
                    {[
                      { key: "nice", label: "Random" },
                      { key: "helpful", label: "Helpful" },
                      { key: "must", label: "Must have" },
                    ].map((chip) => (
                      <View key={chip.key} className="flex-1 max-w-[140px]">
                        <Button
                          text={chip.label}
                          variant={
                            featureImpact === (chip.key as any)
                              ? "accent"
                              : "secondary"
                          }
                          onPress={() => setFeatureImpact(chip.key as any)}
                        />
                      </View>
                    ))}
                  </View>

                  <Button
                    text="Send idea"
                    onPress={async () => {
                      await submitFeedback("feature", {
                        idea: featureIdea,
                        description: featureDesc,
                        impact: featureImpact,
                      });
                      Alert.alert("Great idea", "Saved! ✨");
                      resetAndClose();
                    }}
                  />
                  <Text className="text-xs opacity-60">
                    Includes device/app details. We may email you about this.
                  </Text>
                  <Button
                    variant="secondary"
                    text="Back"
                    onPress={() => setMode("menu")}
                  />
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
