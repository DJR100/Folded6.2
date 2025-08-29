import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";

import { OnboardingLayout } from "@/components/layouts/onboarding";
import { Text, View } from "@/components/ui";
import { Streak } from "@/components/ui/streak";
import { useAuthContext } from "@/hooks/use-auth-context";
import { cn } from "@/lib/cn";

export default function Onboarding() {
  const { setOnboarding, updateUser } = useAuthContext();

  const [selectedUser, setSelectedUser] = useState<string>("user-0");

  const onComplete = () => {
    updateUser("guardian.buddy.userId", selectedUser);
    setOnboarding(7);
    router.push("/onboarding/7");
  };

  return (
    <OnboardingLayout
      title="Join The Community"
      titleClassName="text-left"
      button={{
        text: "Continue",
        onPress: onComplete,
        disabled: selectedUser === undefined,
      }}
      // onBack={() => {
      //   setOnboarding(5);
      //   router.back();
      // }}
    >
      <ScrollView>
        <View className="flex flex-col gap-2">
          <Text variant="p">
            Folded is community based. We rely on peer support.
          </Text>

          <View className="flex flex-col gap-4 mt-4">
            <Friend
              message="You're stronger than the urge. Gambling won't fix what's hurting - it only takes more. Step back, breathe, and choose peace. You deserve a life of control, not chaos. Help is out there."
              name="Jay Peterson"
              streak={32}
              src={require("@/assets/images/faces/face-6.jpg")}
              selected={selectedUser === "user-0"}
              onPress={() => setSelectedUser("user-0")}
            />

            {/* Between tile 1 and 2 */}
            <Text variant="p">
              The first step to joining this community is to take a 7-day bet on
              yourself, with us cheering you on.
            </Text>

            <Friend
              message="You're not alone - gambling is a trap, not a solution. Every time you walk away, you're winning your life back. Choose freedom. Choose yourself."
              name="Scott Heyworth"
              streak={67}
              src={require("@/assets/images/faces/face-7.jpg")}
              selected={selectedUser === "user-1"}
              onPress={() => setSelectedUser("user-1")}
            />

            {/* Between tile 2 and 3 */}
            <Text variant="p">
              Imagine looking back in seven days and seeing real progress. Let’s
              make that happen together.
            </Text>

            <Friend
              message="That next bet won’t change the past, but stopping now can change your future. You’re worth more than the losses. You have the power to take your life back."
              name="Chance Klein"
              streak={15}
              src={require("@/assets/images/faces/face-0.jpg")}
              selected={selectedUser === "user-2"}
              onPress={() => setSelectedUser("user-2")}
            />
          </View>
        </View>
      </ScrollView>
    </OnboardingLayout>
  );
}

const Friend = ({
  message,
  name,
  streak,
  src,
  selected,
  onPress,
}: {
  message: string;
  name: string;
  streak: number;
  src: string;
  selected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress}>
    <View
      className={cn(
        // Always show green outline and accent glow
        "py-4 px-6 rounded-xl bg-content2 flex flex-col gap-4 border-2 border-accent bg-accent/20",
      )}
    >
      <Text>"{message}"</Text>

      <View className="flex flex-row items-center gap-2">
        <Image
          source={src}
          style={{ width: 50, height: 50, borderRadius: 100 }}
        />
        <View className="flex flex-col gap-1">
          <Text variant="p">{name}</Text>
          <Streak streak={streak} />
        </View>
      </View>
    </View>
  </TouchableOpacity>
);
