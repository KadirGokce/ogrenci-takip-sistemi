import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useAuth } from "@/context/supabase-provider";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getApiUrl } from "@/constants/api";

export default function Settings() {
	const { signOut, session } = useAuth();
	const [testEnabled, setTestEnabled] = useState(false);

	const {
		mutate: testApi,
		isPending: testLoading,
		isError: testIsError,
		error: testError,
		isSuccess: testIsSuccess,
		data: testResult,
		reset: resetTest,
	} = useMutation({
		mutationFn: async () => {
			if (!session?.access_token) throw new Error("No access token");
			let res: Response;
			try {
				res = await fetch(getApiUrl('test'), {
					headers: {
						Authorization: `Bearer ${session.access_token}`,
						"Content-Type": "application/json",
					},
				});
			} catch (err) {
				throw new Error("Ağ hatası veya API'ye ulaşılamıyor");
			}
			let data: any;
			try {
				data = await res.json();
			} catch {
				data = null;
			}
			if (!res.ok) {
				throw new Error(data?.error || "API error");
			}
			return data;
		},
	});

	return (
		<View className="flex-1 items-center justify-center bg-background p-4 gap-y-4">
			<H1 className="text-center">Çıkış Yap</H1>
			<Muted className="text-center">
				Çıkış yapın ve karşılama ekranına dönün.
			</Muted>
			<Button
				className="w-full"
				size="default"
				variant="default"
				onPress={async () => {
					await signOut();
				}}
			>
				<Text>Çıkış Yap</Text>
			</Button>

			{/* Test Button */}
			<Button
				className="w-full"
				variant="outline"
				size="default"
				disabled={testLoading}
				onPress={() => {
					resetTest();
					testApi();
				}}
			>
				<Text>API Test Et (Admin)</Text>
			</Button>

			{testLoading && <Text>Yükleniyor...</Text>}
			{testIsError && <Text className="text-red-500">Hata: {testError?.message}</Text>}
			{testIsSuccess && testResult && (
				<Text className="text-green-600">Sonuç: {JSON.stringify(testResult)}</Text>
			)}
		</View>
	);
}
