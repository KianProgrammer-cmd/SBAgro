# SBAgro

مارکت‌پلیس آنلاین محصولات کشاورزی — اتصال کشاورزان (فروشنده) به خریداران.

## استک فنی
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Python, Django, Django REST Framework, SimpleJWT
- **Database:** PostgreSQL
- **Cache/Queue:** Redis
- **Payments:** ZarinPal, PayPal
- **Infra:** Docker, Nginx

## راه‌اندازی سریع (development)

### بک‌اند
```bash
cd backend
python -m venv venv
source venv/bin/activate  # ویندوز: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # مقادیر CHANGE_ME را پر کنید
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### فرانت‌اند
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

### با Docker (کل پروژه یک‌جا)
```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
docker compose up --build
```

## ساختار پروژه
- `backend/` — اپلیکیشن Django (users, sellers, buyers, locations, products, cart, orders, payments, invoices, notifications, reports)
- `frontend/` — اپلیکیشن Next.js با سه پنل: buyer, seller, admin
- `infrastructure/` — Dockerfile ها، تنظیمات Nginx، Redis، Postgres
- `docs/` — مستندات معماری، امنیت، و جریان پرداخت

## امنیت
- هرگز `.env` واقعی را کامیت نکنید — فقط `.env.example` باید در گیت باشد.
- کلیدهای `SECRET_KEY` و `JWT_SECRET_KEY` باید رندوم و طولانی تولید شوند:
  ```bash
  python -c "import secrets; print(secrets.token_urlsafe(50))"
  ```
- تایید پرداخت همیشه سمت سرور و در برابر API واقعی درگاه انجام می‌شود، نه صرفاً بر اساس ریدایرکت کاربر.
- دسترسی نقش‌محور (RBAC) در `backend/core/permissions.py` تعریف شده و باید در تمام endpoint های محافظت‌شده استفاده شود.

## وضعیت این اسکلت پروژه
این یک اسکلت کاری (working scaffold) با مدل‌ها، serializer ها، view ها، احراز هویت JWT، RBAC، و اتصال پایه به دو درگاه پرداخت است — نه یک اپلیکیشن کاملاً آماده‌ی production. قبل از استفاده‌ی واقعی، migration ها را اجرا کنید، تست بنویسید، و مقادیر امنیتی را جایگزین `CHANGE_ME` کنید.
