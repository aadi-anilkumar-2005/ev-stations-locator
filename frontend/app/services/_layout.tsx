import { Stack } from "expo-router/stack";

export default function ServicesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="showrooms" />
      <Stack.Screen name="service-stations" />
      <Stack.Screen name="battery-shops" />
    </Stack>
  );
}
