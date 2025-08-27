import { View as RNView, type ViewProps } from "react-native";

export function View({ className, ...otherProps }: ViewProps) {
  return <RNView className={className} {...otherProps} />;
}
