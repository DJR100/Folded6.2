import { Text, View } from "@/components/ui";

export const Streak = ({ streak }: { streak: number }) => (
  <View className="flex flex-row gap-1 items-center justify-center mt-[-4px]">
    <Text className="text-sm mt-[-3px]">🔥</Text>
    <Text className="text-center mt-[-2px]" muted>
      {streak} day streak
    </Text>
  </View>
);
