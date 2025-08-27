import { Text as RNText, type TextProps as RNTextProps } from "react-native";

import { cn } from "@/lib/cn";

export type TextProps = RNTextProps & {
  variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "sm" | "default";
  muted?: boolean;
};

export function Text({
  className,
  variant = "default",
  muted,
  ...rest
}: TextProps) {
  className = className
    ?.replaceAll("font-black", "font-[Satoshi-Black]")
    .replaceAll("font-bold", "font-[Satoshi-Bold]")
    .replaceAll("font-medium", "font-[Satoshi-Medium]")
    .replaceAll("font-regular", "font-[Satoshi-Regular]")
    .replaceAll("font-light", "font-[Satoshi-Light]");
  return (
    <RNText
      className={cn(
        "text-foreground",
        variant === "default" ? "text-lg font-[Satoshi-Regular]" : undefined,
        variant === "h1"
          ? "text-4xl leading-[40px] font-[Satoshi-Bold]"
          : undefined,
        variant === "h2" ? "text-2xl font-[Satoshi-Bold]" : undefined,
        variant === "h3" ? "text-lg font-[Satoshi-Medium]" : undefined,
        variant === "h4" ? "text-base font-[Satoshi-Medium]" : undefined,
        variant === "h5" ? "text-sm font-[Satoshi-Medium]" : undefined,
        variant === "h6" ? "text-xs font-[Satoshi-Medium]" : undefined,
        variant === "p" ? "text-xl font-[Satoshi-Regular]" : undefined,
        variant === "sm" ? "text-sm font-[Satoshi-Regular]" : undefined,
        muted ? "text-muted" : undefined,
        className,
      )}
      {...rest}
    />
  );
}
