import AntDesign from "@expo/vector-icons/AntDesign";
import EvilIcons from "@expo/vector-icons/build/EvilIcons";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { Button, Text, View } from "@/components/ui";
import { cn } from "@/lib/cn";

export const OnboardingLayout = ({
  children,
  progress,
  button,
  className,
  title,
  onBack,
  titleClassName,
}: {
  children?: React.ReactNode;
  progress?: number;
  button?: {
    text: string;
    onPress: () => void | Promise<void>;
    disabled?: boolean;
    icon?: React.ReactNode | null;
    loading?: boolean;
  };
  className?: string;
  title?: string;
  onBack?: () => void;
  titleClassName?: string;
}) => (
  <KeyboardAvoidingView
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    style={{ flex: 1 }}
  >
    <View
      className={cn("flex-1 mb-6 pb-4 px-4", progress === undefined && "pt-8")}
    >
      {(onBack !== undefined || progress !== undefined) && (
        <View className="flex flex-row items-center gap-2 justify-start">
          {onBack !== undefined && (
            <Button
              size="icon"
              variant="ghost"
              iconL={
                <EvilIcons
                  name="chevron-left"
                  size={40}
                  className="absolute mt-[-7px]"
                  color="white"
                />
              }
              onPress={onBack}
            />
          )}

          {/* Progress bar */}
          {progress !== undefined && (
            <View className="flex-1 py-6">
              <View className="w-full h-3 bg-content2 rounded-full">
                <View
                  className="bg-accent h-full rounded-full"
                  style={{ width: `${progress * 100}%` }}
                />
              </View>
            </View>
          )}
        </View>
      )}

      {title && (
        <Text variant="h1" className={cn("mb-8 text-center", titleClassName)}>
          {title}
        </Text>
      )}

      {/* Content */}
      <View className={cn("flex-1 flex flex-col gap-2", className)}>
        {children}
      </View>

      {button && (
        <Button
          text={button.text}
          onPress={button.onPress}
          disabled={button.disabled || button.loading}
          iconR={
            button.loading ? (
              <ActivityIndicator size="small" color="black" />
            ) : button.icon === null ? null : button.icon === undefined ? (
              <AntDesign name="arrowright" size={18} color="black" />
            ) : (
              button.icon
            )
          }
        />
      )}
    </View>
  </KeyboardAvoidingView>
);
