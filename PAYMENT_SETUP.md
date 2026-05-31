# Payment Integration - Midtrans Sandbox

## Quick Start (Demo Mode)

Untuk testing tanpa setup Midtrans API keys, gunakan **Demo Mode**:

1. Pastikan `.env` memiliki:
   ```env
   PAYMENT_DEMO_MODE="true"
   ```

2. Restart dev server:
   ```bash
   pnpm dev
   ```

3. Test payment flow:
   - Login sebagai customer
   - Pesan item
   - Klik "Bayar Sekarang"
   - Dialog konfirmasi muncul
   - Klik OK untuk simulasi success
   - Order otomatis confirmed

**Demo mode tidak memerlukan Midtrans API keys dan cocok untuk development/testing!**

---

## Setup Midtrans Sandbox (Production-like)

### 1. Daftar Akun Midtrans Sandbox

1. Kunjungi https://dashboard.sandbox.midtrans.com/register
2. Daftar dengan email Anda
3. Verifikasi email
4. Login ke dashboard

### 2. Dapatkan API Keys

1. Login ke https://dashboard.sandbox.midtrans.com
2. Klik **Settings** → **Access Keys**
3. Copy **Server Key** dan **Client Key**
4. Update file `.env`:

```env
MIDTRANS_SERVER_KEY="SB-Mid-server-YOUR_SERVER_KEY_HERE"
MIDTRANS_CLIENT_KEY="SB-Mid-client-YOUR_CLIENT_KEY_HERE"
MIDTRANS_IS_PRODUCTION="false"
PAYMENT_DEMO_MODE="false"  # Set to false to use real Midtrans
```

**Note:** Pastikan keys dimulai dengan `SB-Mid-` untuk sandbox mode.

### 3. Setup Webhook (Optional untuk Testing)

1. Di dashboard Midtrans, klik **Settings** → **Configuration**
2. Set **Payment Notification URL**: `https://your-domain.com/api/payment/webhook`
3. Untuk local testing, gunakan ngrok:
   ```bash
   ngrok http 3000
   ```
4. Update webhook URL dengan ngrok URL

## Payment Flow

### Customer Journey

```
1. Customer pilih listing
   ↓
2. Pilih quantity (max 5 per customer)
   ↓
3. Klik "Pesan sekarang"
   ↓
4. Redirect ke /payment/[orderId]
   ↓
5. Klik "Bayar Sekarang"
   ↓
6. Midtrans Snap popup muncul
   ↓
7. Pilih metode pembayaran:
   - QRIS (scan QR)
   - GoPay
   - ShopeePay
   - Virtual Account (BCA, BNI, BRI, Permata)
   ↓
8. Selesaikan pembayaran
   ↓
9. Redirect ke /orders/[orderId]?payment=success
   ↓
10. Order status otomatis berubah ke CONFIRMED
```

### Merchant Journey

```
1. Merchant terima notifikasi order baru
   ↓
2. Cek payment status = PAID
   ↓
3. Siapkan makanan
   ↓
4. Mark as Ready for Pickup
   ↓
5. Customer datang dengan pickup code
   ↓
6. Scan QR atau input manual
   ↓
7. Complete Pickup
```

## Testing Payment (Sandbox)

### Test Cards

Midtrans Sandbox menyediakan test payment methods:

**QRIS:**
- Scan QR code yang muncul
- Di sandbox, otomatis success setelah beberapa detik

**GoPay:**
- Nomor: `081234567890`
- PIN: `123456`

**Virtual Account:**
- BCA VA: Bayar dengan nomor VA yang digenerate
- BNI VA: Bayar dengan nomor VA yang digenerate
- Gunakan simulator di dashboard Midtrans

### Simulate Payment

1. Buat order
2. Klik "Bayar Sekarang"
3. Pilih metode pembayaran
4. Di dashboard Midtrans, klik **Transactions**
5. Cari order Anda
6. Klik **Actions** → **Change Status**
7. Pilih **Settlement** untuk simulate success payment

## API Endpoints

### POST /api/orders/[orderId]/payment

Create payment token untuk order.

**Request:**
```typescript
// No body required
```

**Response:**
```json
{
  "data": {
    "token": "snap-token-here",
    "redirectUrl": "https://app.sandbox.midtrans.com/snap/v2/...",
    "orderId": "order-id"
  }
}
```

### POST /api/payment/webhook

Webhook untuk menerima notifikasi dari Midtrans.

**Request Body (dari Midtrans):**
```json
{
  "order_id": "ORDER-xxx-timestamp",
  "transaction_status": "settlement",
  "fraud_status": "accept",
  "status_code": "200",
  "gross_amount": "50000",
  "signature_key": "...",
  "payment_type": "qris"
}
```

**Response:**
```json
{
  "data": {
    "message": "Notification processed"
  }
}
```

## Database Schema

### Order Model

```prisma
model Order {
  id                String        @id @default(cuid())
  customerId        String
  listingId         String
  merchantId        String
  quantity          Int
  totalPrice        Int
  status            OrderStatus   @default(PENDING)
  pickupCode        String
  paymentStatus     PaymentStatus @default(PENDING)
  paymentMethod     String?
  midtransToken     String?
  midtransOrderId   String?       @unique
  paidAt            DateTime?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  EXPIRED
  REFUNDED
}
```

## Payment Status Mapping

| Midtrans Status | Our Status | Description |
|----------------|------------|-------------|
| `pending` | `PENDING` | Menunggu pembayaran |
| `settlement` | `PAID` | Pembayaran berhasil |
| `capture` (fraud=accept) | `PAID` | Pembayaran berhasil (card) |
| `capture` (fraud!=accept) | `PENDING` | Menunggu review fraud |
| `deny` | `FAILED` | Pembayaran ditolak |
| `cancel` | `FAILED` | Pembayaran dibatalkan |
| `expire` | `FAILED` | Pembayaran expired |

## Security

### Signature Verification

Setiap webhook dari Midtrans diverifikasi dengan signature:

```typescript
const hash = crypto
  .createHash("sha512")
  .update(orderId + statusCode + grossAmount + SERVER_KEY)
  .digest("hex");

if (hash !== signature_key) {
  // Invalid signature, reject
}
```

### CSRF Protection

Payment API endpoints menggunakan CSRF token yang sama dengan endpoint lain.

## Troubleshooting

### Payment popup tidak muncul

1. Cek console browser untuk error
2. Pastikan Snap script loaded: `window.snap` harus ada
3. Cek Client Key di `.env` sudah benar

### Webhook tidak diterima

1. Pastikan webhook URL sudah di-set di dashboard Midtrans
2. Untuk local testing, gunakan ngrok
3. Cek log server untuk error

### Payment status tidak update

1. Cek webhook diterima di `/api/payment/webhook`
2. Cek signature verification
3. Cek log Midtrans di dashboard

### Order tidak auto-confirm setelah payment

1. Cek `paymentStatus` di database = `PAID`
2. Cek webhook logic di `route.ts`
3. Pastikan order status = `PENDING` sebelum payment

## Production Checklist

- [ ] Update `.env` dengan production keys
- [ ] Set `MIDTRANS_IS_PRODUCTION="true"`
- [ ] Update webhook URL ke production domain
- [ ] Test semua payment methods
- [ ] Setup monitoring untuk failed payments
- [ ] Setup email notification untuk payment success/failed
- [ ] Implement refund logic (optional)
- [ ] Add payment timeout handling
- [ ] Add retry mechanism untuk failed webhooks

## Support

- Midtrans Documentation: https://docs.midtrans.com
- Midtrans Dashboard: https://dashboard.sandbox.midtrans.com
- Support: support@midtrans.com
