# 🎭 Demo Mode - Payment Testing

## Apa itu Demo Mode?

Demo Mode adalah fitur untuk testing payment flow **tanpa** memerlukan:
- ❌ Midtrans API keys
- ❌ Midtrans account
- ❌ Real payment gateway
- ❌ Internet connection untuk payment

Perfect untuk:
- ✅ Development lokal
- ✅ Testing UI/UX
- ✅ Demo ke client
- ✅ CI/CD testing

## Setup Demo Mode

### 1. Enable Demo Mode

Edit `.env`:
```env
PAYMENT_DEMO_MODE="true"
```

### 2. Restart Server

```bash
pnpm dev
```

### 3. Test Payment Flow

```
1. Login: customer@rescuefood.local / password123
2. Browse marketplace
3. Pilih listing (non-donation)
4. Pilih quantity
5. Klik "Pesan sekarang"
6. Redirect ke payment page
7. Lihat badge "🎭 DEMO MODE AKTIF"
8. Klik "Bayar Sekarang"
9. Dialog konfirmasi muncul:
   - OK = Payment Success
   - Cancel = Payment Failed
10. Order auto-confirmed jika success
```

## Demo Mode vs Real Midtrans

| Feature | Demo Mode | Real Midtrans |
|---------|-----------|---------------|
| API Keys Required | ❌ No | ✅ Yes |
| Real Payment | ❌ No | ✅ Yes |
| Payment Methods | Simulated | QRIS, GoPay, VA, etc |
| Webhook | ❌ No | ✅ Yes |
| Testing Speed | ⚡ Instant | 🐌 Depends on gateway |
| Cost | 💰 Free | 💰 Sandbox free, Production paid |

## How Demo Mode Works

### Backend (lib/midtrans.ts)

```typescript
if (PAYMENT_DEMO_MODE) {
  return {
    token: `DEMO-${Date.now()}-${random}`,
    redirect_url: `/payment/demo?order_id=${orderId}`,
  };
}
```

### Frontend (components/payment-checkout.tsx)

```typescript
if (midtransConfig.demoMode) {
  const confirmed = window.confirm("Simulasi pembayaran?");
  
  if (confirmed) {
    // Update order status to CONFIRMED
    // Redirect to success page
  }
}
```

## Switching Between Modes

### Enable Demo Mode (Development)

```env
PAYMENT_DEMO_MODE="true"
```

### Disable Demo Mode (Use Real Midtrans)

```env
PAYMENT_DEMO_MODE="false"
MIDTRANS_SERVER_KEY="SB-Mid-server-YOUR_KEY"
MIDTRANS_CLIENT_KEY="SB-Mid-client-YOUR_KEY"
```

## Visual Indicators

### Demo Mode Active

- 🎭 Badge di payment page: "DEMO MODE AKTIF"
- Dialog konfirmasi saat bayar
- No Midtrans Snap popup

### Real Midtrans Active

- No demo badge
- Midtrans Snap popup
- Real payment methods

## Testing Scenarios

### Success Payment (Demo)

```
1. Klik "Bayar Sekarang"
2. Dialog muncul
3. Klik "OK"
4. Order status: PENDING → CONFIRMED
5. Redirect ke order detail
6. URL: /orders/[id]?payment=success&demo=true
```

### Failed Payment (Demo)

```
1. Klik "Bayar Sekarang"
2. Dialog muncul
3. Klik "Cancel"
4. Error message: "Payment cancelled"
5. Order status: tetap PENDING
6. User bisa retry
```

## Troubleshooting

### Demo mode tidak aktif

**Check:**
```bash
# Cek .env
cat .env | grep PAYMENT_DEMO_MODE

# Should output: PAYMENT_DEMO_MODE="true"
```

**Fix:**
```bash
# Edit .env
echo 'PAYMENT_DEMO_MODE="true"' >> .env

# Restart server
pnpm dev
```

### Badge tidak muncul

**Check:**
- Restart dev server setelah edit .env
- Clear browser cache
- Check console untuk error

### Order tidak auto-confirm

**Check:**
- Pastikan klik "OK" di dialog
- Check console untuk API error
- Verify order status di database

## Production Checklist

Sebelum deploy ke production:

- [ ] Set `PAYMENT_DEMO_MODE="false"`
- [ ] Add real Midtrans keys
- [ ] Test dengan Midtrans sandbox
- [ ] Setup webhook URL
- [ ] Test all payment methods
- [ ] Remove demo mode code (optional)

## FAQ

**Q: Apakah demo mode aman untuk production?**
A: Tidak! Demo mode hanya untuk development. Set `PAYMENT_DEMO_MODE="false"` di production.

**Q: Apakah order di demo mode tersimpan di database?**
A: Ya, order tetap tersimpan. Hanya payment gateway yang disimulasikan.

**Q: Bisakah switch mode tanpa restart?**
A: Tidak, perlu restart server setelah edit .env.

**Q: Apakah webhook bekerja di demo mode?**
A: Tidak, webhook hanya bekerja dengan real Midtrans.

## Next Steps

Setelah testing dengan demo mode:

1. **Get Midtrans Account**: https://dashboard.sandbox.midtrans.com/register
2. **Get API Keys**: Settings → Access Keys
3. **Update .env**: Add real keys
4. **Disable Demo Mode**: Set `PAYMENT_DEMO_MODE="false"`
5. **Test Real Payment**: Try QRIS, GoPay, VA
6. **Setup Webhook**: For auto status update

---

Happy testing! 🎉
