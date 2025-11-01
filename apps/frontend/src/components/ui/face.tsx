import { Image } from "expo-image";

import { Text, View } from "@/components/ui";
import { Streak } from "@/components/ui/streak";
import { useResponsive } from "@/lib/responsive";

const Face = ({
  name,
  streak,
  src,
}: {
  name: string;
  streak: number;
  src: string;
}) => {
  const { vw, ms } = useResponsive();
  const size = Math.min(vw(32), ms(120));
  return (
    <View className="flex flex-col items-center gap-1">
      <Image source={src} style={{ width: size, height: size, borderRadius: size / 2 }} />
      <View className="flex flex-col">
        <Text className="text-center font-bold">{name}</Text>
        <Streak streak={streak} />
      </View>
    </View>
  );
};

export default Face;
