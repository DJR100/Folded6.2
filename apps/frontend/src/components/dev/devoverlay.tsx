import React, { useState } from "react";
import { ScrollView } from "react-native";
import { Href, router } from "expo-router";
import { Button, Text, View } from "@/components/ui";
import { useAuthContext } from "@/hooks/use-auth-context";

const routes = [
  "/onboarding",
  "/onboarding/1",
  "/onboarding/2",
  "/onboarding/recovery-progress",
  "/onboarding/3",
  "/onboarding/4",
  "/onboarding/5",
  "/onboarding/6",
  "/onboarding/7",
  "/onboarding/8",
  "/post-onboarding",
  "/dashboard",
  "/settings",
] as const;

export function DevOverlay() {
  const { updateUser, setOnboarding, setPostOnboarding } = useAuthContext();
  const [open, setOpen] = useState(false);

  return (
    <View className="absolute bottom-4 right-4 items-end gap-2">
      {open && (
        <View className="w-64 max-h-96 bg-content2 rounded-2xl p-3">
          <Text variant="h4" className="mb-2">Developer Panel</Text>
          <ScrollView contentContainerStyle={{ gap: 8 }}>
            <Button
              variant="danger"
              text="Reset onboarding (tier=0)"
              onPress={async () => {
                await updateUser("tier", 0);
                setOnboarding(0);
                setPostOnboarding(0);
              }}
            />
            {routes.map((href) => (
              <Button
                key={href}
                text={href}
                onPress={() => router.push(href as Href)}
              />
            ))}
          </ScrollView>
        </View>
      )}
      <Button
        variant="glass"
        size="icon"
        text={undefined}
        iconL={<Text className="font-bold">DEV</Text>}
        onPress={() => setOpen((v) => !v)}
      />
    </View>
  );
}
