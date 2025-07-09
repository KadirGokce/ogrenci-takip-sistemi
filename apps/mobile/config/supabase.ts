import { AppState, Platform } from "react-native";

import "react-native-get-random-values";
import * as aesjs from "aes-js";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

// Platform-specific storage implementation
const isWeb = Platform.OS === 'web';

class LargeSecureStore {
	private async _encrypt(key: string, value: string) {
		// Generate a 32-byte (256-bit) key for AES-256
		const encryptionKey = crypto.getRandomValues(new Uint8Array(32));
		const cipher = new aesjs.ModeOfOperation.ctr(
			encryptionKey,
			new aesjs.Counter(1),
		);
		const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value));
		
		// Use localStorage for web, SecureStore for native
		if (isWeb) {
			localStorage.setItem(
				`encryption_key_${key}`,
				aesjs.utils.hex.fromBytes(encryptionKey),
			);
		} else {
			await SecureStore.setItemAsync(
				key,
				aesjs.utils.hex.fromBytes(encryptionKey),
			);
		}
		return aesjs.utils.hex.fromBytes(encryptedBytes);
	}
	
	private async _decrypt(key: string, value: string) {
		let encryptionKeyHex: string | null;
		
		// Use localStorage for web, SecureStore for native
		if (isWeb) {
			encryptionKeyHex = localStorage.getItem(`encryption_key_${key}`);
		} else {
			encryptionKeyHex = await SecureStore.getItemAsync(key);
		}
		
		if (!encryptionKeyHex) {
			return encryptionKeyHex;
		}
		
		try {
			const encryptionKey = aesjs.utils.hex.toBytes(encryptionKeyHex);
			
			// Validate key size
			if (encryptionKey.length !== 32) {
				console.warn('Invalid key size, clearing corrupted data');
				await this.removeItem(key);
				return null;
			}
			
			const cipher = new aesjs.ModeOfOperation.ctr(
				encryptionKey,
				new aesjs.Counter(1),
			);
			const decryptedBytes = cipher.decrypt(aesjs.utils.hex.toBytes(value));
			return aesjs.utils.utf8.fromBytes(decryptedBytes);
		} catch (error) {
			console.error('Decryption error:', error);
			// If decryption fails, clear the corrupted data
			await this.removeItem(key);
			return null;
		}
	}
	
	async getItem(key: string) {
		try {
			if (isWeb) {
				const encrypted = localStorage.getItem(key);
				if (!encrypted) {
					return encrypted;
				}
				return await this._decrypt(key, encrypted);
			} else {
				const encrypted = await AsyncStorage.getItem(key);
				if (!encrypted) {
					return encrypted;
				}
				return await this._decrypt(key, encrypted);
			}
		} catch (error) {
			console.error('Error getting item:', error);
			return null;
		}
	}
	
	async removeItem(key: string) {
		try {
			if (isWeb) {
				localStorage.removeItem(key);
				localStorage.removeItem(`encryption_key_${key}`);
			} else {
				await AsyncStorage.removeItem(key);
				await SecureStore.deleteItemAsync(key);
			}
		} catch (error) {
			console.error('Error removing item:', error);
		}
	}
	
	async setItem(key: string, value: string) {
		try {
			const encrypted = await this._encrypt(key, value);
			if (isWeb) {
				localStorage.setItem(key, encrypted);
			} else {
				await AsyncStorage.setItem(key, encrypted);
			}
		} catch (error) {
			console.error('Error setting item:', error);
			throw error;
		}
	}
	
	async clear() {
		try {
			if (isWeb) {
				// Only clear Supabase-related items from localStorage
				const keysToRemove = [];
				for (let i = 0; i < localStorage.length; i++) {
					const key = localStorage.key(i);
					if (key && (key.startsWith('sb-') || key.startsWith('encryption_key_'))) {
						keysToRemove.push(key);
					}
				}
				keysToRemove.forEach(key => localStorage.removeItem(key));
			} else {
				await AsyncStorage.clear();
			}
		} catch (error) {
			console.error('Error clearing storage:', error);
		}
	}
}

// Create storage instance
const storage = new LargeSecureStore();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		storage: storage,
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
	},
});

AppState.addEventListener("change", (state) => {
	if (state === "active") {
		supabase.auth.startAutoRefresh();
	} else {
		supabase.auth.stopAutoRefresh();
	}
});
