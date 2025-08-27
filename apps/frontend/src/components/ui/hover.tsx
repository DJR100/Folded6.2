import React, { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

const Hover = ({
  top = 0,
  left = 0,
  amplitude = 6,
  children,
}: {
  top?: number;
  left?: number;
  amplitude?: number;
  children?: React.ReactNode;
}) => {
  // Create animated values for x and y positions
  const positionX = useRef(new Animated.Value(0)).current;
  const positionY = useRef(new Animated.Value(0)).current;

  const animate = () => {
    // Animate to new position
    Animated.timing(positionY, {
      toValue: amplitude,
      duration: 1000,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.quad),
    }).start(() =>
      Animated.timing(positionY, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.quad),
      }).start(() => animate()),
    );
  };

  useEffect(() => {
    setTimeout(() => {
      animate();
    }, Math.random() * 1000);
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        top,
        left,
        transform: [{ translateX: positionX }, { translateY: positionY }],
      }}
    >
      {children}
    </Animated.View>
  );
};

export default Hover;
