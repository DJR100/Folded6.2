import { router } from "expo-router";
import { useState } from "react";

import { OnboardingLayout } from "@/components/layouts/onboarding";
import { Input, Text, View } from "@/components/ui";
import { useAuthContext } from "@/hooks/use-auth-context";
import { cn } from "@/lib/cn";

export default function Onboarding() {
  const { setOnboarding, updateUser } = useAuthContext();
  const [message, setMessage] = useState<string>("");
  const maxLength = 200;

  const onComplete = async () => {
    await updateUser("message", message);
    setOnboarding(5);
    router.push("/onboarding/5");
  };

  return (
    <OnboardingLayout
      title="What's your motivational message to other gamblers?"
      titleClassName="text-left"
      button={{
        text: "Continue",
        onPress: onComplete,
      }}
    >
      {/* <Text variant="p">
        You are not alone in this journey.
        A key part of recovery is giving and receiving support from others.
      </Text> */}
      <Text variant="p">
        Please take some time to write a motivational message. Your message will
        be sent to other recovering gamblers when we detect that they are at
        risk of relapsing.
      </Text>
      <Text variant="p" className="text-danger">
        You may not be granted access to the community if your message is
        generic or not thoughtful.
      </Text>
      <View className="flex flex-col gap-2 items-end justify-center">
        <Text
          variant="p"
          muted
          className={cn(
            "text-sm",
            message.length > maxLength * 0.8 && "text-danger",
          )}
        >
          {message.length} / {maxLength}
        </Text>

        <Input
          placeholder={`Message (max. ${maxLength} characters)`}
          multiline
          maxLength={maxLength}
          onChangeText={setMessage}
        />
      </View>
    </OnboardingLayout>
  );
}
