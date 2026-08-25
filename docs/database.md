# مدل‌های دیتابیس (خلاصه)

User (role: ADMIN/SELLER/BUYER) → SellerProfile / BuyerProfile
Province → City
Product (seller, category, province, city)
Cart → CartItem (product, quantity)
Order → OrderItem (product, seller, quantity, unit_price)
Payment (order, gateway, status, idempotency_key)
Invoice (order)
Notification (user)
