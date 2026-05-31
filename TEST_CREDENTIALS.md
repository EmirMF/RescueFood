# Test Credentials

## Default Users (Seeded)

Semua user menggunakan password yang sama: **`password123`**

### Customer
- **Email**: `customer@rescuefood.local`
- **Password**: `password123`
- **Role**: CUSTOMER
- **Name**: Nadia Putri

### Merchant
- **Email**: `merchant@rescuefood.local`
- **Password**: `password123`
- **Role**: MERCHANT
- **Name**: Green Oven Bakery

### Charity
- **Email**: `charity@rescuefood.local`
- **Password**: `password123`
- **Role**: CHARITY
- **Name**: Komunitas Berbagi Bandung

### Admin
- **Email**: `admin@rescuefood.local`
- **Password**: `password123`
- **Role**: ADMIN
- **Name**: System Admin

## How to Seed Database

Jika database kosong atau perlu reset:

```bash
# Reset database dan run seed
npx prisma migrate reset --force

# Atau hanya run seed
npx prisma db seed
```

## Login Flow

1. Buka http://localhost:3000/auth
2. Pilih role yang ingin digunakan
3. Masukkan email dan password
4. Klik "Masuk"

## Testing Payment Flow

### As Customer:

1. Login dengan `customer@rescuefood.local` / `password123`
2. Browse marketplace
3. Pilih listing (yang bukan donation)
4. Pilih quantity (max 5)
5. Klik "Pesan sekarang"
6. Redirect ke payment page
7. Klik "Bayar Sekarang"
8. Pilih metode pembayaran di Midtrans Snap
9. Complete payment (sandbox mode)
10. Redirect ke order detail

### As Merchant:

1. Login dengan `merchant@rescuefood.local` / `password123`
2. Buka dashboard merchant
3. Lihat order yang masuk
4. Cek payment status = PAID
5. Confirm order (auto-confirmed setelah payment)
6. Mark as ready for pickup
7. Scan QR atau input pickup code
8. Complete pickup

## Notes

- Password untuk semua user adalah `password123` (bukan `123`)
- Seed script akan membuat sample listings dan data lainnya
- Database akan di-reset setiap kali `prisma migrate reset`
- Untuk production, ganti password dengan yang lebih secure
