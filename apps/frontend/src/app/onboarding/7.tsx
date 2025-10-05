import {
  AntDesign,
  Feather,
  FontAwesome6,
  MaterialIcons,
} from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ScrollView } from "react-native";

import { Guardian } from "@/components/guardian";
import { OnboardingLayout } from "@/components/layouts/onboarding";
import { Button, Text, View } from "@/components/ui";
import { colors } from "@/constants/colors";
import { useAuthContext } from "@/hooks/use-auth-context";

export default function Onboarding() {
  const { setOnboarding } = useAuthContext();

  const onComplete = async () => {
    setOnboarding(8);
    router.push("/onboarding/8");
  };

  return (
    <OnboardingLayout title="Take the first step">
      <ScrollView>
        <View className="flex flex-col gap-8 pb-10">
          {/* Top */}
          <View className="flex flex-col items-center gap-4 p-4 py-8 rounded-xl bg-content2">
            <Text variant="h2" className="text-center">
              Regain control of your life
            </Text>
            <View className="flex flex-col gap-2">
              {/* Row */}
              <View className="flex flex-row items-center gap-2">
                <View className="p-1 rounded-full w-6 aspect-square bg-accent flex flex-row items-center justify-center">
                  <FontAwesome6 name="brain" size={12} color="black" />
                </View>
                <Text>Improve your impulse control</Text>
              </View>
              <View className="flex flex-row items-center gap-2">
                <View className="p-1 rounded-full w-6 aspect-square bg-accent flex flex-row items-center justify-center">
                  <FontAwesome6 name="link" size={12} color="black" />
                </View>
                <Text>Be more trustworthy</Text>
              </View>
              <View className="flex flex-row items-center gap-2">
                <View className="p-1 rounded-full w-6 aspect-square bg-accent flex flex-row items-center justify-center">
                  <FontAwesome6 name="dollar" size={12} color="black" />
                </View>
                <Text>Build your finances back up</Text>
              </View>
              <View className="flex flex-row items-center gap-2">
                <View className="p-1 rounded-full w-6 aspect-square bg-accent flex flex-row items-center justify-center">
                  <FontAwesome6 name="link" size={12} color="black" />
                </View>
                <Text>Receive community support</Text>
              </View>
            </View>
          </View>

          {/* Stars */}
          <View className="flex flex-col gap-4 items-center">
            <View className="flex flex-row items-center gap-2 border border-accent/20 p-4 py-3 rounded-full">
              <AntDesign name="star" size={20} color={colors.accent} />
              <AntDesign name="star" size={20} color={colors.accent} />
              <AntDesign name="star" size={20} color={colors.accent} />
              <AntDesign name="star" size={20} color={colors.accent} />
              <AntDesign name="star" size={20} color={colors.accent} />
            </View>

            <Text variant="p" muted className="text-center italic">
              "Gambling was ruining my life. I lost everything and I wasted so
              much time doing it. I lied to everyone around me. I didn't think I
              could fix things, until I found Folded."
            </Text>
          </View>

          {/* Support Joe */}
          <View className="flex flex-col gap-4 p-4 py-8 rounded-xl bg-content2">
            <Text variant="h2" className="text-center">
              Support James
            </Text>
            <View className="flex justify-center items-center h-40">
              <Image
                source={require("@/assets/images/faces/face-0.jpg")}
                style={{ aspectRatio: 1, height: 100, borderRadius: 70 }}
              />
            </View>
            <Text variant="p" className="text-center">
              People like James need support. Join the community to help them
              out.
            </Text>
          </View>

          {/* Access */}
          <View className="flex flex-col gap-4 p-4 py-8 rounded-xl bg-content2">
            <Text variant="h2" className="text-center">
              Get access to help
            </Text>
            <View className="flex flex-col gap-2">
              {/* Row */}
              <Row>Gambling recovery trackers</Row>
              <Row>Community support forums</Row>
              {/* <Row>
                One-click self-exclusion from gambling sites
              </Row> */}
              {/* <Row>Gambling site and app blocker</Row> */}
              <Row>Gambling hotline access</Row>
              <Row>Panic button to prevent relapses</Row>
              {/* <Row>Debt renegotiation service access</Row> */}
            </View>
          </View>

          {/* Accountability partner */}
          {/* <View className="flex flex-col gap-4 p-4 py-8 rounded-xl bg-content2">
            <Text variant="h2" className="text-center">
              Accountability partner
            </Text>

            <Text variant="p" className="text-left">
              Ability to set up a trusted friend, family member or partner to
              receive texts if we detect suspicious transactions in your bank
              account (you connect your bank account in the next step)
            </Text>
          </View> */}
        </View>
      </ScrollView>

      {/* Footer */}
      <Button text="Join" onPress={onComplete} />
      <View className="flex flex-col items-center gap-2">
        <Text variant="sm" muted>
          Purchase appears discreetly
        </Text>

        <View className="flex flex-row gap-1 items-center">
          <Text variant="sm" muted>
            Cancel anytime
          </Text>

          <AntDesign
            name="checkcircle"
            size={10}
            color={colors.accent}
            className="mr-2"
          />

          <Text variant="sm" muted>
            Money back guarantee
          </Text>

          <MaterialIcons name="shield" size={12} color={colors.accent} />
        </View>
      </View>
    </OnboardingLayout>
  );
}

const Row = ({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) => (
  <View className="flex flex-row items-center gap-2">
    <View className="p-1 rounded-full w-6 aspect-square bg-accent flex flex-row items-center justify-center">
      {icon ?? <Feather name="check" size={12} color="black" />}
    </View>
    <Text>{children}</Text>
  </View>
);
