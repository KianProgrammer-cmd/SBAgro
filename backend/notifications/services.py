from .models import Notification


def create_notification(
    user,
    title,
    message,
):
    return Notification.objects.create(
        user=user,
        title=title,
        message=message,
    )


def notify_product_approved(product):
    return create_notification(
        user=product.seller,
        title="محصول شما تأیید شد",
        message=(
            f'محصول «{product.title}» توسط مدیریت تأیید شد '
            "و اکنون می‌تواند در بازار نمایش داده شود."
        ),
    )


def notify_product_rejected(product, reason):
    return create_notification(
        user=product.seller,
        title="محصول شما رد شد",
        message=(
            f'محصول «{product.title}» توسط مدیریت رد شد.\n\n'
            f"دلیل رد:\n{reason}\n\n"
            "لطفاً محصول را اصلاح کرده و دوباره ارسال کنید."
        ),
    )