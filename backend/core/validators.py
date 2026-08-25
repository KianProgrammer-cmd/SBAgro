import re
from django.core.exceptions import ValidationError

IRAN_MOBILE_REGEX = re.compile(r'^09\d{9}$')


def validate_iran_mobile(value):
    if not IRAN_MOBILE_REGEX.match(value):
        raise ValidationError('شماره موبایل معتبر نیست.')
