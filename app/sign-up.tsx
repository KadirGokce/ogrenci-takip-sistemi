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

const formSchema = z
	.object({
		username: z
			.string()
			.min(3, "Kullanıcı adı en az 3 karakter olmalıdır.")
			.max(50, "Kullanıcı adı en fazla 50 karakter olabilir.")
			.regex(/^[a-zA-Z0-9_@.-]+$/, "Kullanıcı adı sadece harf, rakam, alt çizgi, @, nokta ve tire içerebilir."),
		password: z
			.string()
			.min(8, "Şifre en az 8 karakter olmalıdır.")
			.max(16, "Şifre en fazla 16 karakter olabilir.")
			.regex(
				/^(?=.*[a-z])/,
				"Şifrenizde en az bir küçük harf olmalıdır.",
			)
			.regex(
				/^(?=.*[A-Z])/,
				"Şifrenizde en az bir büyük harf olmalıdır.",
			)
			.regex(/^(?=.*[0-9])/, "Şifrenizde en az bir rakam olmalıdır."),
		confirmPassword: z.string().min(8, "Şifre en az 8 karakter olmalıdır."),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Şifreler eşleşmiyor.",
		path: ["confirmPassword"],
	});

export default function SignUp() {
	const { signUp } = useAuth();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			username: "",
			password: "",
			confirmPassword: "",
		},
	});

	async function onSubmit(data: z.infer<typeof formSchema>) {
		try {
			await signUp(data.username, data.password);
			form.reset();
		} catch (error: any) {
			console.error("Sign up error:", error);
			
			// Show user-friendly error message
			let errorMessage = "Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.";
			
			if (error?.message) {
				if (error.message.includes("User already registered")) {
					errorMessage = "Bu kullanıcı adı zaten kullanılıyor. Lütfen farklı bir kullanıcı adı deneyin.";
				} else if (error.message.includes("Password should be at least")) {
					errorMessage = "Şifre en az 6 karakter olmalıdır.";
				} else if (error.message.includes("Invalid email")) {
					errorMessage = "Lütfen geçerli bir kullanıcı adı girin.";
				} else {
					errorMessage = error.message;
				}
			}
			
			Alert.alert("Kayıt Hatası", errorMessage);
		}
	}

	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
			<View className="flex-1 gap-4 web:m-4">
				<H1 className="self-start">Kayıt Ol</H1>
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
						<FormField
							control={form.control}
							name="confirmPassword"
							render={({ field }) => (
								<FormInput
									label="Şifre Tekrar"
									placeholder="Şifrenizi tekrar girin"
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
					<Text>Kayıt Ol</Text>
				)}
			</Button>
		</SafeAreaView>
	);
}
