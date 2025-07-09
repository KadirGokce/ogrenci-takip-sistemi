import {
	createContext,
	PropsWithChildren,
	useContext,
	useEffect,
	useState,
} from "react";
import { SplashScreen, useRouter } from "expo-router";

import { Session } from "@supabase/supabase-js";

import { supabase } from "@/config/supabase";

SplashScreen.preventAutoHideAsync();

type AuthState = {
	initialized: boolean;
	session: Session | null;
	signUp: (username: string, password: string) => Promise<void>;
	signIn: (username: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthState>({
	initialized: false,
	session: null,
	signUp: async () => {},
	signIn: async () => {},
	signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Helper function to convert username to email format if needed
const formatUsernameAsEmail = (username: string) => {
	// If username already contains @, use it as is
	if (username.includes('@')) {
		return username;
	}
	// Otherwise, append a domain
	return `${username}@app.local`;
};

export function AuthProvider({ children }: PropsWithChildren) {
	const [initialized, setInitialized] = useState(false);
	const [session, setSession] = useState<Session | null>(null);
	const router = useRouter();

	const signUp = async (username: string, password: string) => {
		try {
			// Format username as email if needed
			const email = formatUsernameAsEmail(username);
			
			const { data, error } = await supabase.auth.signUp({
				email: email,
				password,
				options: {
					data: {
						username: username, // Store original username in user metadata
					}
				}
			});

			if (error) {
				console.error("Error signing up:", error);
				throw error;
			}

			if (data.session) {
				setSession(data.session);
				console.log("User signed up:", data.user);
			} else {
				console.log("No user returned from sign up");
			}
		} catch (error) {
			console.error("Sign up error:", error);
			throw error;
		}
	};

	const signIn = async (username: string, password: string) => {
		try {
			// Format username as email if needed
			const email = formatUsernameAsEmail(username);
			
			const { data, error } = await supabase.auth.signInWithPassword({
				email: email,
				password,
			});

			if (error) {
				console.error("Error signing in:", error);
				throw error;
			}

			if (data.session) {
				setSession(data.session);
				console.log("User signed in:", data.user);
			} else {
				console.log("No user returned from sign in");
			}
		} catch (error) {
			console.error("Sign in error:", error);
			throw error;
		}
	};

	const signOut = async () => {
		try {
			const { error } = await supabase.auth.signOut();

			if (error) {
				console.error("Error signing out:", error);
				throw error;
			} else {
				setSession(null);
				console.log("User signed out");
			}
		} catch (error) {
			console.error("Sign out error:", error);
			throw error;
		}
	};

	useEffect(() => {
		let mounted = true;

		const initializeAuth = async () => {
			try {
				// Get initial session
				const { data: { session }, error } = await supabase.auth.getSession();
				
				if (error) {
					console.error("Error getting session:", error);
				} else if (mounted) {
					setSession(session);
				}

				// Listen for auth changes
				const { data: { subscription } } = supabase.auth.onAuthStateChange(
					async (event, session) => {
						console.log("Auth state changed:", event, session?.user?.email);
						if (mounted) {
							setSession(session);
						}
					}
				);

				if (mounted) {
					setInitialized(true);
				}

				return () => {
					subscription.unsubscribe();
				};
			} catch (error) {
				console.error("Auth initialization error:", error);
				if (mounted) {
					setInitialized(true);
				}
			}
		};

		initializeAuth();

		return () => {
			mounted = false;
		};
	}, []);

	useEffect(() => {
		if (initialized) {
			SplashScreen.hideAsync();
			if (session) {
				router.replace("/");
			} else {
				router.replace("/welcome");
			}
		}
	}, [initialized, session, router]);

	return (
		<AuthContext.Provider
			value={{
				initialized,
				session,
				signUp,
				signIn,
				signOut,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
