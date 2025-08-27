import { Image } from "expo-image";
import { TouchableOpacity } from "react-native";

import { View } from "@/components/ui";
import { cn } from "@/lib/cn";

export const Guardian = ({
  src,
  selected,
  onPress,
}: {
  src: string;
  selected: boolean;
  onPress?: () => void;
}) => (
  <TouchableOpacity onPress={onPress} className="flex-1">
    <View
      className={cn(
        "w-full p-2 bg-content2 rounded-xl border-2 border-transparent",
        selected && "border-accent bg-accent/20",
      )}
    >
      <Image
        source={src}
        style={{ width: "100%", height: "100%" }}
        contentFit="contain"
      />
    </View>
  </TouchableOpacity>
);
