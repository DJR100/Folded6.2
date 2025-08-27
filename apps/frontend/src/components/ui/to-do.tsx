import { AntDesign } from "@expo/vector-icons";
import { useState } from "react";
import { TouchableOpacity } from "react-native";

import { Text, View } from "@/components/ui";
import { colors } from "@/constants/colors";
import { cn } from "@/lib/cn";

export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: React.ReactNode;
}

export const ToDo = ({
  todos,
  updateTodo,
}: {
  todos: Todo[];
  updateTodo: (id: string, completed: boolean) => void;
}) => (
  <View className="flex flex-col gap-2">
    {todos.map((todo) => (
      <TodoItem key={todo.id} {...todo} setCompleted={updateTodo} />
    ))}
  </View>
);

const TodoItem = ({
  id,
  title,
  description,
  icon,
  completed,
  setCompleted,
}: Todo & { setCompleted: (id: string, completed: boolean) => void }) => {
  const [isCompleted, _] = useState(completed);

  return (
    <View className="flex flex-row items-center justify-between">
      {/* Icon */}
      <View>
        {icon ?? <AntDesign name="check" size={24} color={colors.foreground} />}
      </View>

      {/* Content */}
      <View className="flex flex-col gap-1">
        <Text
          variant="h4"
          className={cn(isCompleted && "line-through opacity-50")}
        >
          {title}
        </Text>
        <Text
          variant="p"
          className={cn(isCompleted && "line-through opacity-50")}
        >
          {description}
        </Text>
      </View>

      {/* Checkbox */}
      <View>
        <TouchableOpacity onPress={() => setCompleted(id, !isCompleted)}>
          <View
            className={cn(
              "w-6 h-6 rounded-full border-2 border-foreground/50 flex items-center justify-center",
              isCompleted && "bg-accent border-accent",
            )}
          >
            {isCompleted && (
              <AntDesign name="check" size={24} color={colors.foreground} />
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};
