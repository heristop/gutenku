import { useLocalStorage as useVueUseLocalStorage } from '@vueuse/core';

export function useExpandedState(key: string, defaultValue = true) {
  const value = useVueUseLocalStorage(key, defaultValue);
  const toggle = () => {
    value.value = !value.value;
  };
  return { value, toggle };
}
