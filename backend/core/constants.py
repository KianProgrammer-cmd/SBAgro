class UserRole:
    ADMIN = 'ADMIN'
    SELLER = 'SELLER'
    BUYER = 'BUYER'
    CHOICES = (
        (ADMIN, 'Admin'),
        (SELLER, 'Seller'),
        (BUYER, 'Buyer'),
    )


class OrderStatus:
    PENDING = 'PENDING'
    PAID = 'PAID'
    SHIPPED = 'SHIPPED'
    DELIVERED = 'DELIVERED'
    CANCELLED = 'CANCELLED'
    CHOICES = (
        (PENDING, 'Pending'),
        (PAID, 'Paid'),
        (SHIPPED, 'Shipped'),
        (DELIVERED, 'Delivered'),
        (CANCELLED, 'Cancelled'),
    )


class PaymentGateway:
    ZARINPAL = 'ZARINPAL'
    PAYPAL = 'PAYPAL'
    CHOICES = ((ZARINPAL, 'ZarinPal'), (PAYPAL, 'PayPal'))


class PaymentStatus:
    PENDING = 'PENDING'
    SUCCESS = 'SUCCESS'
    FAILED = 'FAILED'
    CHOICES = ((PENDING, 'Pending'), (SUCCESS, 'Success'), (FAILED, 'Failed'))
