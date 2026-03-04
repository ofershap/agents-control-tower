import React from "react";
import { Box, Text, useInput } from "ink";

const BORDER = "#1e3a5f";
const BODY = "#c9d1d9";
const AMBER = "#e8912d";
const RED = "#f85149";

interface ConfirmationProps {
  message: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function Confirmation({
  message,
  destructive,
  onConfirm,
  onCancel,
}: ConfirmationProps) {
  useInput((input) => {
    if (input === "y") onConfirm();
    if (input === "n" || input === "q") onCancel();
  });

  return (
    <Box
      borderStyle="single"
      borderColor={destructive ? RED : BORDER}
      paddingX={1}
    >
      <Text color={BODY}>{message}</Text>
      <Text>{"   "}</Text>
      <Text color={AMBER} bold>
        y
      </Text>
      <Text color={BODY}> yes</Text>
      <Text>{"    "}</Text>
      <Text color={AMBER} bold>
        n
      </Text>
      <Text color={BODY}> no</Text>
    </Box>
  );
}
