import { Image } from "expo-image";

import { Text, View } from "@/components/ui";
import { Streak } from "@/components/ui/streak";

const Face = ({
  name,
  streak,
  src,
}: {
  name: string;
  streak: number;
  src: string;
}) => (
  <View className="flex flex-col items-center gap-1">
    <Image source={src} style={{ width: 120, height: 120, borderRadius: 70 }} />
    <View className="flex flex-col">
      <Text className="text-center font-bold">{name}</Text>

      <Streak streak={streak} />
    </View>
  </View>
);

export default Face;
