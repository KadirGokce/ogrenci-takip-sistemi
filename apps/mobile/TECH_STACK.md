# Mobile App Tech Stack

## Framework & Platform
- **Expo (React Native)**: Modern, cross-platform mobile development framework.

## State & Navigation
- **React Navigation**: Ekranlar arası geçiş ve yönlendirme için.
- **React Context**: Global state yönetimi için (ör: Supabase oturum yönetimi).

## UI & Styling
- **NativeWind (Tailwind for React Native)**: Hızlı ve tutarlı stil oluşturma.
- **Custom UI Components**: Ortak buton, input, form, vs. bileşenler.

## API & Data
- **Zod ile Tip Güvenli API**: Tüm API istek/response şemaları ve tipleri `@repo/schemas` üzerinden import edilir.
- **Fetch/HTTP**: API ile haberleşme için standart fetch veya yardımcı kütüphaneler.

## TypeScript
- **TypeScript**: Tüm kod tip güvenli ve modern TypeScript ile yazılır.
- **Ortak tsconfig**: Monorepo uyumlu, sıkı ve güncel TypeScript ayarları.

---

## Ortak Şema ve Tip Kullanımı
- API ile haberleşirken, istek ve response tipleri doğrudan `@repo/schemas`'tan import edilir.
- Böylece backend ve mobil arasında tam tip uyumluluğu sağlanır.

**Örnek:**
```ts
import { TestCreateSchema, type TestCreate } from "@repo/schemas";

// API'ye veri gönderirken:
const body: TestCreate = { name: "örnek" };
```

---