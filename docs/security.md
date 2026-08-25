# امنیت SBAgro

- JWT با انقضای کوتاه (۱۵ دقیقه) + refresh token با چرخش (rotation)
- Rate limiting روی ورود، ثبت‌نام، و پرداخت
- RBAC در سطح API، نه فقط UI
- تایید پرداخت همیشه سمت سرور با استعلام مستقیم از درگاه
- هدرهای امنیتی HTTP در core/middleware.py
- هش پسورد با الگوریتم پیش‌فرض Django (PBKDF2) — قابل ارتقا به Argon2
