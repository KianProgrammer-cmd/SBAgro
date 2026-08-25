# معماری SBAgro

مونوریپو با دو سرویس اصلی: `frontend` (Next.js) و `backend` (Django REST API)، پشت یک Nginx reverse proxy.
سه نقش کاربری: BUYER، SELLER، ADMIN — کنترل دسترسی در سطح API با کلاس‌های permission در `core/permissions.py` اعمال می‌شود.
