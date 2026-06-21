import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

export function useRefreshOnFocus(
  refresh: () => void | Promise<void>
) {
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );
}
