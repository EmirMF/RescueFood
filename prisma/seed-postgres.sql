TRUNCATE TABLE
  "Message",
  "Notification",
  "Wishlist",
  "Review",
  "DonationClaim",
  "Order",
  "FoodListing",
  "AppSetting",
  "Charity",
  "Merchant",
  "User"
RESTART IDENTITY CASCADE;

INSERT INTO "AppSetting" ("key", "value", "createdAt", "updatedAt") VALUES
  ('ADMIN_FEE_FLAT', '2500', NOW(), NOW());

INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "status", "createdAt", "updatedAt") VALUES
  ('user_admin', 'RescueFood Admin', 'admin@rescuefood.local', '$2b$10$aTaO/FkNaTPmheSFJCScquflIPD3wlj6hWFyCnRToeuku86Xh2xsa', 'ADMIN', 'ACTIVE', NOW(), NOW()),
  ('user_customer_nadia', 'Nadia Putri', 'customer@rescuefood.local', '$2b$10$aTaO/FkNaTPmheSFJCScquflIPD3wlj6hWFyCnRToeuku86Xh2xsa', 'CUSTOMER', 'ACTIVE', NOW(), NOW()),
  ('user_customer_budi', 'Budi Santoso', 'budi@rescuefood.local', '$2b$10$aTaO/FkNaTPmheSFJCScquflIPD3wlj6hWFyCnRToeuku86Xh2xsa', 'CUSTOMER', 'ACTIVE', NOW(), NOW()),
  ('user_customer_siti', 'Siti Rahayu', 'siti@rescuefood.local', '$2b$10$aTaO/FkNaTPmheSFJCScquflIPD3wlj6hWFyCnRToeuku86Xh2xsa', 'CUSTOMER', 'ACTIVE', NOW(), NOW()),
  ('user_merchant_green_oven', 'Green Oven Bakery', 'merchant@rescuefood.local', '$2b$10$aTaO/FkNaTPmheSFJCScquflIPD3wlj6hWFyCnRToeuku86Xh2xsa', 'MERCHANT', 'ACTIVE', NOW(), NOW()),
  ('user_merchant_rasa', 'Rasa Kantin Bandung', 'rasa@rescuefood.local', '$2b$10$aTaO/FkNaTPmheSFJCScquflIPD3wlj6hWFyCnRToeuku86Xh2xsa', 'MERCHANT', 'ACTIVE', NOW(), NOW()),
  ('user_merchant_pending', 'Kopi Senja', 'pending-merchant@rescuefood.local', '$2b$10$aTaO/FkNaTPmheSFJCScquflIPD3wlj6hWFyCnRToeuku86Xh2xsa', 'MERCHANT', 'ACTIVE', NOW(), NOW()),
  ('user_merchant_rejected', 'Dapur Lama', 'rejected-merchant@rescuefood.local', '$2b$10$aTaO/FkNaTPmheSFJCScquflIPD3wlj6hWFyCnRToeuku86Xh2xsa', 'MERCHANT', 'ACTIVE', NOW(), NOW()),
  ('user_charity_bandung', 'Komunitas Berbagi Bandung', 'charity@rescuefood.local', '$2b$10$aTaO/FkNaTPmheSFJCScquflIPD3wlj6hWFyCnRToeuku86Xh2xsa', 'CHARITY', 'ACTIVE', NOW(), NOW());

INSERT INTO "Merchant" ("id", "userId", "businessName", "address", "latitude", "longitude", "phone", "verificationStatus", "averageRating", "createdAt", "updatedAt") VALUES
  ('merchant_green_oven', 'user_merchant_green_oven', 'Green Oven Bakery', 'Jl. Ir. H. Juanda No. 153, Dago, Bandung', -6.885602, 107.613716, '+6281234567890', 'VERIFIED', 5, NOW(), NOW()),
  ('merchant_rasa', 'user_merchant_rasa', 'Rasa Kantin Bandung', 'Jl. Dipati Ukur No. 35, Coblong, Bandung', -6.889797, 107.617737, '+6282211122233', 'VERIFIED', 4, NOW(), NOW()),
  ('merchant_pending', 'user_merchant_pending', 'Kopi Senja', 'Jl. Trunojoyo No. 18, Bandung', -6.90394, 107.610138, '+6281333344455', 'PENDING', 0, NOW(), NOW()),
  ('merchant_rejected', 'user_merchant_rejected', 'Dapur Lama', 'Jl. Cihampelas No. 90, Bandung', -6.893481, 107.604512, '+6281555566677', 'REJECTED', 0, NOW(), NOW());

INSERT INTO "Charity" ("id", "userId", "organizationName", "address", "verificationStatus", "createdAt", "updatedAt") VALUES
  ('charity_bandung', 'user_charity_bandung', 'Komunitas Berbagi Bandung', 'Coblong, Bandung', 'VERIFIED', NOW(), NOW());

INSERT INTO "FoodListing" ("id", "merchantId", "title", "description", "category", "imageUrl", "originalPrice", "discountedPrice", "quantity", "mode", "pickupLocation", "pickupLatitude", "pickupLongitude", "pickupStartTime", "pickupEndTime", "consumeBefore", "allergenInfo", "impactKgCo2", "status", "createdAt", "updatedAt") VALUES
  ('listing_sourdough', 'merchant_green_oven', 'Sourdough & Pastry Rescue Box', 'Paket roti sourdough, croissant, dan pastry dari batch sore. Cocok untuk sarapan keluarga atau sharing.', 'bakery', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80', 85000, 42000, 8, 'SALE', 'Jl. Ir. H. Juanda No. 153, Dago, Bandung', -6.885602, 107.613716, '2026-06-01 09:00:00', '2026-06-01 12:00:00', '2026-06-02 08:00:00', 'Contains gluten, dairy, and egg.', 12, 'ACTIVE', NOW(), NOW()),
  ('listing_rice_bowl', 'merchant_rasa', 'Rice Bowl Ayam Jamur', 'Rice bowl matang dari lunch service. Porsi lengkap dengan ayam jamur, sayur, dan sambal terpisah.', 'rice_meal', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80', 38000, 19000, 15, 'SALE', 'Jl. Dipati Ukur No. 35, Coblong, Bandung', -6.889797, 107.617737, '2026-06-01 15:00:00', '2026-06-01 18:00:00', '2026-06-01 21:00:00', 'Contains soy and garlic.', 24, 'ACTIVE', NOW(), NOW()),
  ('listing_produce_pack', 'merchant_rasa', 'Fresh Produce Pack', 'Paket sayur dan buah layak konsumsi dari prep dapur harian. Baik untuk dimasak di hari yang sama.', 'produce', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80', 45000, 22000, 10, 'SALE', 'Jl. Dipati Ukur No. 35, Coblong, Bandung', -6.889797, 107.617737, '2026-06-02 10:00:00', '2026-06-02 13:00:00', '2026-06-03 08:00:00', 'No common allergens.', 18, 'ACTIVE', NOW(), NOW()),
  ('listing_mini_cake_draft', 'merchant_green_oven', 'Mini Cake Box', 'Draft listing untuk merchant mencoba flow edit sebelum dipublikasikan.', 'snack', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80', 65000, 32000, 6, 'SALE', 'Jl. Ir. H. Juanda No. 153, Dago, Bandung', -6.885602, 107.613716, '2026-06-03 14:00:00', '2026-06-03 17:00:00', '2026-06-04 08:00:00', 'Contains gluten, dairy, and egg.', 8, 'DRAFT', NOW(), NOW()),
  ('listing_donation_box', 'merchant_rasa', 'Nasi Box Donasi Komunitas', 'Nasi box matang dari event kampus. Backend donation tetap ada walaupun charity web disembunyikan.', 'rice_meal', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80', 30000, 0, 24, 'DONATION', 'Jl. Dipati Ukur No. 35, Coblong, Bandung', -6.889797, 107.617737, '2026-06-02 16:00:00', '2026-06-02 18:00:00', '2026-06-02 21:00:00', 'Ask merchant for allergen details.', 35, 'ACTIVE', NOW(), NOW());

INSERT INTO "Order" ("id", "customerId", "listingId", "merchantId", "quantity", "adminFee", "totalPrice", "status", "pickupCode", "paymentStatus", "paymentMethod", "midtransOrderId", "paidAt", "createdAt", "updatedAt") VALUES
  ('order_ready', 'user_customer_nadia', 'listing_sourdough', 'merchant_green_oven', 1, 2500, 44500, 'READY_FOR_PICKUP', 'RF-4821', 'PAID', 'qris', 'RF-SEED-4821', '2026-05-31 10:00:00', NOW(), NOW()),
  ('order_completed_green', 'user_customer_budi', 'listing_sourdough', 'merchant_green_oven', 2, 2500, 86500, 'COMPLETED', 'RF-4822', 'PAID', 'bank_transfer', 'RF-SEED-4822', '2026-05-30 16:30:00', NOW(), NOW()),
  ('order_completed_rasa', 'user_customer_siti', 'listing_rice_bowl', 'merchant_rasa', 3, 2500, 59500, 'COMPLETED', 'RF-4823', 'PAID', 'qris', 'RF-SEED-4823', '2026-05-31 12:15:00', NOW(), NOW()),
  ('order_pending_payment', 'user_customer_nadia', 'listing_produce_pack', 'merchant_rasa', 1, 2500, 24500, 'PENDING', 'RF-4824', 'PENDING', NULL, 'RF-SEED-4824', NULL, NOW(), NOW());

INSERT INTO "Review" ("id", "orderId", "customerId", "merchantId", "rating", "comment", "createdAt") VALUES
  ('review_green', 'order_completed_green', 'user_customer_budi', 'merchant_green_oven', 5, 'Roti dan pastry-nya fresh. Pickup cepat dan staff-nya ramah.', NOW()),
  ('review_rasa', 'order_completed_rasa', 'user_customer_siti', 'merchant_rasa', 4, 'Rice bowl masih enak dan porsinya pas. Senang bisa bantu mengurangi food waste.', NOW());

INSERT INTO "Message" ("id", "orderId", "senderId", "content", "createdAt") VALUES
  ('message_ready_customer', 'order_ready', 'user_customer_nadia', 'Halo, saya akan pickup sekitar jam 11.30 ya.', NOW()),
  ('message_ready_merchant', 'order_ready', 'user_merchant_green_oven', 'Siap, pesanan sudah kami siapkan di kasir depan.', NOW()),
  ('message_pending_customer', 'order_pending_payment', 'user_customer_nadia', 'Apakah produce pack bisa diambil lebih cepat?', NOW()),
  ('message_pending_merchant', 'order_pending_payment', 'user_merchant_rasa', 'Bisa, mulai jam 10.00 sudah tersedia.', NOW());

INSERT INTO "Wishlist" ("id", "userId", "listingId", "createdAt") VALUES
  ('wishlist_nadia_sourdough', 'user_customer_nadia', 'listing_sourdough', NOW()),
  ('wishlist_nadia_rice', 'user_customer_nadia', 'listing_rice_bowl', NOW()),
  ('wishlist_budi_produce', 'user_customer_budi', 'listing_produce_pack', NOW());

INSERT INTO "Notification" ("id", "userId", "type", "title", "message", "read", "actionUrl", "metadata", "createdAt") VALUES
  ('notification_admin_seed', 'user_admin', 'MERCHANT_VERIFIED', 'Seed database ready', 'Demo users, merchants, listings, orders, and admin fee are available.', false, '/admin/verification', NULL, NOW()),
  ('notification_green_order', 'user_merchant_green_oven', 'NEW_ORDER', 'Order ready for pickup', 'Nadia Putri has a paid pickup order waiting.', false, '/merchant/orders/order_ready', NULL, NOW()),
  ('notification_nadia_ready', 'user_customer_nadia', 'ORDER_READY', 'Pickup ready', 'Green Oven Bakery has marked your order ready for pickup.', false, '/orders/order_ready', NULL, NOW());

INSERT INTO "DonationClaim" ("id", "charityId", "listingId", "merchantId", "quantity", "status", "pickupCode", "createdAt", "updatedAt") VALUES
  ('claim_donation_box', 'charity_bandung', 'listing_donation_box', 'merchant_rasa', 12, 'APPROVED', 'DC-2148', NOW(), NOW());
