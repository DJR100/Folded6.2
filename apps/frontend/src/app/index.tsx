import { Redirect, router } from "expo-router";

import { Button, Text, View } from "@/components/ui";
import Face from "@/components/ui/face";
import Hover from "@/components/ui/hover";
import { useAuthContext } from "@/hooks/use-auth-context";

export default function SignIn() {
  const { user } = useAuthContext();

  if (user?.tier) return <Redirect href="/dashboard" />;
  // Do not auto-redirect to onboarding. Let users tap to continue.

  return (
    <View className="flex-1 flex gap-2">
      <View className="w-full">
        <Text className="text-center text-3xl font-bold my-8 mb-4">FOLDED</Text>
      </View>

      <View className="flex-1 w-full items-center justify-center">
        <Hover top={-20} left={-100}>
          <Face
            name="James"
            streak={7}
            src={require("@/assets/images/faces/face-0.jpg")}
          />
        </Hover>
        <Hover top={10} left={60}>
          <Face
            name="Jerome"
            streak={16}
            src={require("@/assets/images/faces/face-1.jpg")}
          />
        </Hover>
        <Hover top={-10} left={220}>
          <Face
            name="Jed"
            streak={86}
            src={require("@/assets/images/faces/face-2.jpg")}
          />
        </Hover>
        <Hover top={200} left={0}>
          <Face
            name="Jeff"
            streak={32}
            src={require("@/assets/images/faces/face-3.jpg")}
          />
        </Hover>
        <Hover top={180} left={160}>
          <Face
            name="James"
            streak={32}
            src={require("@/assets/images/faces/face-4.jpg")}
          />
        </Hover>
        <Hover top={160} left={320}>
          <Face
            name="Jake"
            streak={32}
            src={require("@/assets/images/faces/face-4.jpg")}
          />
        </Hover>
      </View>

      <View className="w-full flex items-center gap-8 pt-6 px-4">
        {/* Title */}
        <View className="w-full flex items-center gap-2">
          <Text variant="h1" className="text-center">
            Are you ready to{"\n"}
            <Text variant="h1" className="text-accent">
              quit forever?
            </Text>
          </Text>
          <Text variant="p" className="text-center px-2" muted>
            Join the community for people committed to quitting gambling.
          </Text>
        </View>

        {/* Buttons */}
        <View className="w-full flex items-center gap-3 mb-6">
          <Button
            variant="accent"
            text={user ? "Continue onboarding" : "Sign in / Create account"}
            onPress={() =>
              user ? router.push("/onboarding") : router.push("/auth/sign-in")
            }
          />
        </View>
      </View>
    </View>
  );
}
