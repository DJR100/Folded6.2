import { View } from "../ui";

import { cn } from "@/lib/cn";

export const DashboardLayout = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <View className={cn("w-full h-full bg-background p-4", className)}>
    {children}
  </View>
);
