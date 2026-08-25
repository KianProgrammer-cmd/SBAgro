from django.core.mail import send_mail
from django.conf import settings


def send_email_notification(to_email: str, subject: str, message: str):
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else None, [to_email])
