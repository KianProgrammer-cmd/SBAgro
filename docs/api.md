# نقشه API (خلاصه)

- POST /api/auth/register/
- POST /api/auth/login/
- POST /api/auth/refresh/
- GET/PATCH /api/auth/me/
- GET /api/locations/provinces/
- GET /api/locations/cities/?province=<id>
- GET/POST /api/products/
- GET/PATCH/DELETE /api/products/<id>/
- GET /api/products/mine/  (seller)
- GET/POST /api/cart/items/
- GET/POST /api/orders/
- POST /api/payments/initiate/
- POST /api/payments/verify/<payment_id>/
- GET /api/invoices/
- GET /api/notifications/
- GET /api/reports/platform-stats/  (admin)
