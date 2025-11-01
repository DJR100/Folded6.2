import { Redirect, router } from "expo-router";

import { Button, Text, View } from "@/components/ui";
import Face from "@/components/ui/face";
import Hover from "@/components/ui/hover";
import { useAuthContext } from "@/hooks/use-auth-context";
import { useResponsive } from "@/lib/responsive";

export default function SignIn() {
  const { user } = useAuthContext();
  const { vw, ms } = useResponsive();
  const faceSize = Math.min(vw(32), ms(120));

  if (user?.tier) return <Redirect href="/dashboard" />;
  // Do not auto-redirect to onboarding. Let users tap to continue.

  return (
    <View className="flex-1 flex gap-2">
      <View className="w-full">
        <Text className="text-center text-3xl font-bold my-8 mb-4">FOLDED</Text>
      </View>

      {/* Faces band (flex) – use percentage placement but within a taller band to avoid overlapping headline/buttons */}
      <View className="flex-1 w-full items-center justify-center mb-2">
        <Hover topPct={10} leftPct={18} offsetX={-faceSize / 2} offsetY={-faceSize / 2}>
          <Face
            name="Scott"
            streak={7}
            src={require("@/assets/images/faces/face-0.jpg")}
          />
        </Hover>
        <Hover topPct={12} leftPct={50} offsetX={-faceSize / 2} offsetY={-faceSize / 2}>
          <Face
            name="Mark"
            streak={16}
            src={require("@/assets/images/faces/face-1.jpg")}
          />
        </Hover>
        <Hover topPct={10} leftPct={82} offsetX={-faceSize / 2} offsetY={-faceSize / 2}>
          <Face
            name="Nathan"
            streak={86}
            src={require("@/assets/images/faces/face-2.jpg")}
          />
        </Hover>
        <Hover topPct={32} leftPct={18} offsetX={-faceSize / 2} offsetY={-faceSize / 2}>
          <Face
            name="Natalie"
            streak={40}
            src={require("@/assets/images/faces/face-10.jpg")}
          />
        </Hover>
        <Hover topPct={34} leftPct={50} offsetX={-faceSize / 2} offsetY={-faceSize / 2}>
          <Face
            name="Navin"
            streak={32}
            src={require("@/assets/images/faces/face-4.jpg")}
          />
        </Hover>
        <Hover topPct={32} leftPct={82} offsetX={-faceSize / 2} offsetY={-faceSize / 2}>
          <Face
            name="Jasmine"
            streak={12}
            src={require("@/assets/images/faces/face-8.jpg")}
          />
        </Hover>
      </View>

      <View className="w-full flex items-center gap-8 pt-8 px-4">
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
