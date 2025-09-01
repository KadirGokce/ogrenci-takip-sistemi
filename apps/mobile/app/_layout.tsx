import "../global.css";

import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/supabase-provider";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";

const queryClient = new QueryClient();

export default function AppLayout() {
	const { colorScheme } = useColorScheme();

	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
					<Stack.Screen name="(protected)" />
					<Stack.Screen name="welcome" />
					<Stack.Screen
						name="sign-up"
						options={{
							presentation: "modal",
							headerShown: true,
							headerTitle: "Kayıt Ol",
							headerStyle: {
								backgroundColor:
									colorScheme === "dark"
										? colors.dark.background
										: colors.light.background,
							},
							headerTintColor:
								colorScheme === "dark"
									? colors.dark.foreground
									: colors.light.foreground,
							gestureEnabled: true,
						}}
					/>
					<Stack.Screen
						name="sign-in"
						options={{
							presentation: "modal",
							headerShown: true,
							headerTitle: "Giriş Yap",
							headerStyle: {
								backgroundColor:
									colorScheme === "dark"
										? colors.dark.background
										: colors.light.background,
							},
							headerTintColor:
								colorScheme === "dark"
									? colors.dark.foreground
									: colors.light.foreground,
							gestureEnabled: true,
						}}
					/>
				</Stack>
			</AuthProvider>
		</QueryClientProvider>
	);
}
