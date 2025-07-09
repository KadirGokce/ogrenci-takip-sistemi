# Turbo Repo Setup

Bu proje, Turbo repo kullanarak monorepo yapısında kurulmuş bir uygulama koleksiyonudur.

## Proje Yapısı

```
├── apps/
│   ├── mobile/          # React Native (Expo) uygulaması
│   └── api/             # Hono.js API sunucusu
├── packages/
│   ├── schemas/         # Paylaşılan Zod şemaları
│   ├── typescript-config/ # Paylaşılan TypeScript konfigürasyonu
│   └── eslint-config/   # Paylaşılan ESLint konfigürasyonu
├── package.json         # Root package.json
└── turbo.json          # Turbo konfigürasyonu
```

## Kurulum

```bash
# Bağımlılıkları yükle
yarn install

# Tüm projeleri build et
yarn build

# Geliştirme modunda çalıştır
yarn dev
```

## Projeler

### Mobile App (React Native + Expo)
- **Konum**: `apps/mobile/`
- **Teknoloji**: React Native, Expo, TypeScript
- **Çalıştırma**: `yarn workspace @repo/mobile start`

### API Server (Hono.js)
- **Konum**: `apps/api/`
- **Teknoloji**: Hono.js, TypeScript
- **Çalıştırma**: `yarn workspace @repo/api dev`
- **Port**: 3000

### Shared Schemas
- **Konum**: `packages/schemas/`
- **Teknoloji**: Zod
- **Kullanım**: Hem mobile hem API tarafında type-safe veri doğrulama

## Type-Safe API İletişimi

### Shared Schemas Kullanımı

```typescript
// packages/schemas/src/index.ts
import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
});
```

### API'de Kullanım

```typescript
// apps/api/src/index.ts
import { LoginSchema, UserSchema } from "@repo/schemas";

app.post("/auth/login", async (c) => {
  const body = await c.req.json();
  const validatedData = LoginSchema.parse(body); // Type-safe validation
  // ...
});
```

### Mobile'da Kullanım

```typescript
// apps/mobile/src/services/api.ts
import { LoginSchema, type Login } from "@repo/schemas";

const login = async (data: Login) => {
  const validatedData = LoginSchema.parse(data);
  // API çağrısı...
};
```

## Komutlar

```bash
# Tüm projeleri build et
yarn build

# Geliştirme modunda çalıştır
yarn dev

# Lint kontrolü
yarn lint

# Temizlik
yarn clean

# Format
yarn format
```

## Workspace Komutları

```bash
# Sadece mobile'ı çalıştır
yarn workspace @repo/mobile start

# Sadece API'yi çalıştır
yarn workspace @repo/api dev

# Schemas'ı build et
yarn workspace @repo/schemas build
```

## Özellikler

- ✅ Turbo repo ile monorepo yönetimi
- ✅ Yarn workspaces
- ✅ Type-safe API iletişimi (Zod)
- ✅ Paylaşılan şemalar
- ✅ Hono.js API sunucusu
- ✅ React Native (Expo) mobile uygulaması
- ✅ TypeScript desteği
- ✅ ESLint konfigürasyonu 