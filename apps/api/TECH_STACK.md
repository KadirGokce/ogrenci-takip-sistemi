# API Tech Stack

## Backend Framework
- **Hono.js**: Minimal, fast, and modern web framework for building APIs.

## Database & ORM
- **Supabase**: Hosted Postgres database (used as the main data store).
- **Prisma**: Type-safe ORM for database access and migrations.

## Validation
- **Zod**: TypeScript-first schema validation library.
- **@hono/zod-validator**: Hono.js middleware for request validation using Zod schemas.

## TypeScript
- **TypeScript**: Strongly-typed JavaScript for safer and more maintainable code.
- **Custom tsconfig**: Strict, modern, and monorepo-friendly TypeScript configuration.

## Other
- **Logger, CORS, Pretty JSON**: Hono.js built-in middlewares for logging, CORS, and pretty-printing JSON responses.

---

### Özet
Bu API projesi, modern TypeScript ekosisteminin en güncel ve güvenli araçlarıyla, Supabase üzerinde çalışan, Hono.js tabanlı, tip güvenli ve kolayca genişletilebilir bir altyapı sunar. 

---

## API Endpoint Geliştirme İpuçları ve Örnekler

### 1. Doğrulama (Validation)
- Her endpointte gelen veriyi Zod ile doğrulayın.
- Hatalı veri geldiğinde detaylı ve kullanıcıya yardımcı olacak hata mesajları dönün.

**Örnek:**
```ts
const UserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

app.post("/register",
  zValidator("json", UserSchema, (result, c) => {
    if (!result.success) {
      return c.json({ success: false, error: result.error.issues }, 400);
    }
  }),
  async (c) => { /* ... */ }
);
```

### 2. Hata Yönetimi
- Hataları standart bir formatta döndürün (ör: `{ success: false, error: ... }`).
- Beklenmeyen hatalarda 500, validasyon hatalarında 400 kodu kullanın.

**Örnek:**
```ts
try {
  // ...
} catch (error) {
  return c.json({ success: false, error: "Beklenmeyen bir hata oluştu" }, 500);
}
```

### 3. Güvenlik
- Kimlik doğrulama gerektiren endpointlerde JWT veya benzeri bir mekanizma kullanın.
- CORS ayarlarını doğru yapılandırın.
- Hassas verileri asla response içinde döndürmeyin.

### 4. Standart Response Formatı
- Başarılı cevaplarda `{ success: true, data: ... }` formatını kullanın.
- Hatalı cevaplarda `{ success: false, error: ... }` formatını kullanın.

### 5. Swagger/OpenAPI Desteği
- API'nizi dokümante etmek için OpenAPI/Swagger kullanmayı düşünün.

### 6. Performans
- Gereksiz büyük veri göndermekten kaçının.
- Gerekirse pagination, filtreleme gibi teknikler kullanın.

### 7. Endpoint İsimlendirme
- RESTful standartlara uygun, anlamlı ve tutarlı endpoint isimleri kullanın.
  - GET `/users`, POST `/users`, GET `/users/:id`, DELETE `/users/:id` gibi.

---

## Ortak Zod Şemaları ve Tipleri (packages/schemas)

- Tüm API istek ve response Zod şemaları ile TypeScript tipleri `packages/schemas` altında tutulur.
- API, mobil ve diğer projeler bu şemaları doğrudan import ederek kullanır.
- Böylece tip ve validasyon tek kaynaktan yönetilir, tekrar ve tutarsızlık önlenir.

**Kullanım Örneği:**

```ts
// API veya başka bir projede:
import { TestCreateSchema, type TestCreate } from "@repo/schemas";

app.post(
  "/test",
  zValidator("json", TestCreateSchema, ...),
  async (c) => {
    const body: TestCreate = c.req.valid("json");
    // ...
  }
);
```

> **Not:** Yeni bir endpoint veya veri modeli eklerken önce `packages/schemas`'a ekleyin, sonra diğer projelerde import edin. 