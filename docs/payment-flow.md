# جریان پرداخت

1. خریدار سفارش را از سبد خرید می‌سازد (Order + OrderItem ها) — POST /api/orders/
2. خریدار درگاه را انتخاب و پرداخت را آغاز می‌کند — POST /api/payments/initiate/
3. کاربر به درگاه (ZarinPal/PayPal) هدایت می‌شود
4. بعد از پرداخت، کاربر به callback_url برمی‌گردد
5. فرانت‌اند POST /api/payments/verify/<id>/ را صدا می‌زند
6. بک‌اند مستقیماً از API درگاه استعلام تایید می‌کند (نه بر اساس پارامترهای URL)
7. در صورت موفقیت: Payment.status=SUCCESS، Order.status=PAID، و می‌توان فاکتور را صادر کرد
