import React from "react";
import { Modal } from "react-native";

import { Button, Text, View } from "@/components/ui";
import { useAuthContext } from "@/hooks/use-auth-context";
import { api } from "@/lib/firebase";

export function SettingsModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { signOut } = useAuthContext();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-background px-4 pt-4 pb-6 rounded-t-2xl">
          <Text variant="h3" className="text-center mb-4">
            Settings
          </Text>

          <View className="flex gap-3">
            {/*
            <Button
              onPress={async () => {
                await signOut();
                onClose();
              }}
              text="Sign Out"
            />

            <Button
              onPress={async () => {
                console.log("performFakeGambling");
                await api({ endpoint: "test-performFakeGambling" });
                console.log("performFakeGambling done");
              }}
              text="Fake gamble transaction"
            />
            */}

            <Text className="text-center opacity-60">Coming soon</Text>

            <Button variant="secondary" onPress={onClose} text="Close" />
          </View>
        </View>
      </View>
    </Modal>
  );
}
