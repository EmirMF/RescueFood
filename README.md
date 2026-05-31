# RescueFood 🍽️

RescueFood adalah platform marketplace untuk makanan surplus yang menghubungkan merchant dengan customer untuk mengurangi food waste. Aplikasi ini dibangun dengan Next.js, Prisma, PostgreSQL, dan terintegrasi dengan Midtrans sandbox untuk payment flow.

## 📋 Fitur Utama

- **Customer Flow**: Browse, search, dan order makanan surplus dengan harga diskon
- **Merchant Dashboard**: Kelola listing makanan, update status pickup
- **Admin Panel**: Verifikasi merchant dan listing untuk trust & safety
- **Payment Integration**: Midtrans sandbox untuk simulasi pembayaran
- **Impact Tracking**: Laporan dampak pengurangan food waste
- **Authentication**: Session-based auth dengan bcrypt password hashing

## 🚀 Quick Start

### Prerequisites

Pastikan sudah terinstall:
- Node.js 20+ 
- pnpm (atau npm/yarn)
- Docker & Docker Compose (untuk PostgreSQL)
- Git

### Instalasi

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd rescuefood
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` dan sesuaikan konfigurasi jika diperlukan. Untuk development lokal, konfigurasi default sudah cukup.

4. **Start PostgreSQL database**
   ```bash
   docker compose up -d postgres
   ```

5. **Setup database schema dan seed data**
   ```bash
   pnpm db:generate
   pnpm db:push
   pnpm db:seed
   ```

6. **Run development server**
   ```bash
   pnpm dev
   ```

7. **Buka aplikasi**
   
   Akses `http://localhost:3000` di browser

### Demo Accounts

Setelah seeding, gunakan akun berikut untuk testing:

| Role | Email | Password |
|------|-------|----------|
| Customer | `customer@rescuefood.local` | `password123` |
| Merchant | `merchant@rescuefood.local` | `password123` |
| Admin | `admin@rescuefood.local` | `password123` |

## 🛠️ Available Scripts

```bash
# Development
pnpm dev              # Start development server

# Build & Production
pnpm build            # Build production bundle
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema to database
pnpm db:seed          # Seed demo data

# Testing
pnpm test:api         # Run API contract tests (requires running DB)
```

## 📁 Project Structure

```
rescuefood/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Login page
│   ├── merchant/          # Merchant dashboard
│   ├── admin/             # Admin panel
│   └── ...
├── components/            # React components
├── lib/                   # Utilities & helpers
│   ├── auth.ts           # Authentication logic
│   ├── prisma.ts         # Prisma client
│   └── ...
├── prisma/               # Database schema & migrations
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
├── public/               # Static assets
├── scripts/              # Utility scripts
└── docs/                 # Documentation

```

## 🗺️ API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current session
- `POST /api/auth/logout` - Logout

### Listings
- `GET /api/listings` - Get all listings (with filters)
- `POST /api/listings` - Create new listing (merchant only)
- `GET /api/listings/[id]` - Get listing detail
- `PUT /api/listings/[id]` - Update listing (merchant only)
- `DELETE /api/listings/[id]` - Delete listing (merchant only)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order (customer only)
- `GET /api/orders/[id]` - Get order detail
- `PUT /api/orders/[id]` - Update order status (merchant only)

### Admin
- `PUT /api/admin/verification/[type]/[id]` - Verify merchant/listing

### Uploads
- `POST /api/uploads` - Upload listing images

## 🌐 Page Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Homepage & marketplace | Public |
| `/auth` | Login page | Public |
| `/listings/[id]` | Listing detail | Public |
| `/profile` | User profile & history | Authenticated |
| `/merchant` | Merchant dashboard | Merchant only |
| `/merchant/listings/new` | Create listing | Merchant only |
| `/merchant/listings/[id]/edit` | Edit listing | Merchant only |
| `/merchant/orders/[id]` | Pickup validation | Merchant only |
| `/admin/verification` | Verification queue | Admin only |
| `/impact` | Impact report | Public |
| `/wishlist` | User wishlist | Authenticated |
| `/notifications` | User notifications | Authenticated |

## 🔧 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS 4
- **Authentication**: Session-based with bcryptjs
- **Payment**: Midtrans Sandbox
- **Maps**: Leaflet
- **QR Code**: qrcode library
- **Package Manager**: pnpm

## 🐳 Docker Support

Project ini menyediakan `docker-compose.yml` untuk menjalankan PostgreSQL:

```bash
# Start PostgreSQL
docker compose up -d postgres

# Stop PostgreSQL
docker compose down

# View logs
docker compose logs -f postgres
```

## 🧪 Testing

API contract tests tersedia untuk memverifikasi endpoint behavior:

```bash
pnpm test:api
```

Test ini akan:
1. Start production server di port 3101
2. Run HTTP API contract checks
3. Reseed database setelah selesai

**Note**: Pastikan PostgreSQL sudah running dan `DATABASE_URL` sudah dikonfigurasi dengan benar.

## 📚 Documentation

Dokumentasi tambahan tersedia di folder `docs/`:

- `docs/current-summary-and-todo.md` - Status dan roadmap
- `docs/stitch-foodrescue-design.md` - Design system reference
- `docs/implementation-roadmap.md` - Implementation plan
- `prd.md` - Product Requirements Document
- `PAYMENT_SETUP.md` - Midtrans integration guide
- `PAYMENT_FLOW_VERIFICATION.md` - Payment flow testing
- `TEST_CREDENTIALS.md` - Test credentials & scenarios
- `DEMO_MODE.md` - Demo mode documentation

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 Environment Variables

Berikut environment variables yang diperlukan (lihat `.env.example`):

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rescuefood?schema=public"

# Auth Secret (REQUIRED in production)
# Generate with: openssl rand -base64 32
AUTH_SECRET="change-this-to-a-random-secret-in-production"

# Environment
NODE_ENV="development"
```

## ⚠️ Important Notes

- Project ini adalah **prototype** untuk demonstrasi konsep
- Midtrans integration menggunakan **sandbox mode** (bukan production)
- Charity/donation features saat ini hidden, API dan model masih tersedia untuk compatibility
- UI menggunakan Stitch design direction tapi belum pixel-perfect match

## 🔐 Security

- Passwords di-hash menggunakan bcryptjs
- Session-based authentication dengan signed cookies
- Input validation di API routes
- Role-based access control (RBAC)

**Production Checklist**:
- [ ] Generate secure `AUTH_SECRET`
- [ ] Setup production PostgreSQL database
- [ ] Configure Midtrans production credentials
- [ ] Enable HTTPS
- [ ] Setup proper CORS policies
- [ ] Configure rate limiting
- [ ] Setup monitoring & logging

## 📄 License

[Specify your license here]

## 👥 Team

[Add your team information here]

---

Built with ❤️ for reducing food waste
