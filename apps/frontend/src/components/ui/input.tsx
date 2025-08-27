import React, { useState } from "react";
import { TextInput } from "react-native";

import { colors } from "@/constants/colors";
import { cn } from "@/lib/cn";

interface InputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  className?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  onBlur?: (value: string | undefined) => void;
  onSubmitEditing?: () => void;
  returnKeyType?: "done" | "go" | "next" | "search" | "send";
  blurOnSubmit?: boolean;
  multiline?: boolean;
  maxLength?: number;
}

export const Input = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = "default",
  onBlur,
  onSubmitEditing,
  returnKeyType = "done",
  blurOnSubmit = true,
  multiline = false,
  maxLength,
}: InputProps) => {
  const [val, setVal] = useState(value);
  return (
    <TextInput
      className={cn(
        "w-full px-4 py-3 rounded-full bg-content3 text-white text-xl text-center",
        multiline && "h-24 text-left rounded-lg",
      )}
      placeholderTextColor={colors.foreground + "50"}
      placeholder={placeholder}
      value={val}
      onChangeText={(v) => {
        if (keyboardType === "numeric") {
          // Only allow numeric input with decimals
          const numericValue = v.replace(/[^0-9.]/g, "");
          // Prevent multiple decimal points
          const parts = numericValue.split(".");
          const sanitizedValue =
            parts[0] + (parts.length > 1 ? "." + parts[1] : "");
          setVal(sanitizedValue);
          onChangeText?.(sanitizedValue);
        } else {
          setVal(v);
          onChangeText?.(v);
        }
      }}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      onBlur={() => onBlur?.(val)}
      onSubmitEditing={onSubmitEditing}
      returnKeyType={returnKeyType}
      blurOnSubmit={blurOnSubmit}
      multiline={multiline}
      maxLength={maxLength}
      textAlignVertical={multiline ? "top" : "center"}
    />
  );
};
