import { router } from "expo-router";
import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";

export default function Home() {
	return (
		<View className="flex-1 items-center justify-center bg-background p-4 gap-y-4">
			<H1 className="text-center">Ana Sayfa</H1>
			<Muted className="text-center">
				Artık giriş yaptınız ve bu oturum uygulamayı kapattıktan sonra bile 
				devam edecek.
			</Muted>
			<Button
				className="w-full"
				variant="default"
				size="default"
				onPress={() => router.push("/(protected)/modal")}
			>
				<Text>Modal Aç</Text>
			</Button>
		</View>
	);
}
