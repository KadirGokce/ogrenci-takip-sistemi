import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ActivityIndicator, View, Alert } from "react-native";
import * as z from "zod";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormInput } from "@/components/ui/form";
import { Text } from "@/components/ui/text";
import { H1 } from "@/components/ui/typography";
import { useAuth } from "@/context/supabase-provider";

const formSchema = z.object({
	username: z
		.string()
		.min(3, "Kullanıcı adı en az 3 karakter olmalıdır.")
		.max(50, "Kullanıcı adı en fazla 50 karakter olabilir."),
	password: z
		.string()
		.min(8, "Şifre en az 8 karakter olmalıdır.")
		.max(64, "Şifre en fazla 64 karakter olabilir."),
});

export default function SignIn() {
	const { signIn } = useAuth();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			username: "",
			password: "",
		},
	});

	async function onSubmit(data: z.infer<typeof formSchema>) {
		try {
			await signIn(data.username, data.password);
			form.reset();
		} catch (error: any) {
			console.error("Sign in error:", error);
			
			// Show user-friendly error message
			let errorMessage = "Giriş yaparken bir hata oluştu. Lütfen tekrar deneyin.";
			
			if (error?.message) {
				if (error.message.includes("Invalid login credentials")) {
					errorMessage = "Kullanıcı adı veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.";
				} else if (error.message.includes("Email not confirmed")) {
					errorMessage = "Lütfen e-posta adresinizi kontrol edin ve hesabınızı onaylayın.";
				} else {
					errorMessage = error.message;
				}
			}
			
			Alert.alert("Giriş Hatası", errorMessage);
		}
	}

	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
			<View className="flex-1 gap-4 web:m-4">
				<H1 className="self-start ">Giriş Yap</H1>
				<Form {...form}>
					<View className="gap-4">
						<FormField
							control={form.control}
							name="username"
							render={({ field }) => (
								<FormInput
									label="Kullanıcı Adı"
									placeholder="Kullanıcı adınızı girin"
									autoCapitalize="none"
									autoComplete="username"
									autoCorrect={false}
									{...field}
								/>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormInput
									label="Şifre"
									placeholder="Şifrenizi girin"
									autoCapitalize="none"
									autoCorrect={false}
									secureTextEntry
									{...field}
								/>
							)}
						/>
					</View>
				</Form>
			</View>
			<Button
				size="default"
				variant="default"
				onPress={form.handleSubmit(onSubmit)}
				disabled={form.formState.isSubmitting}
				className="web:m-4"
			>
				{form.formState.isSubmitting ? (
					<ActivityIndicator size="small" />
				) : (
					<Text>Giriş Yap</Text>
				)}
			</Button>
		</SafeAreaView>
	);
}
