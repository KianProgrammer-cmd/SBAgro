from django.conf import settings
from django.db import models


class SellerProfile(models.Model):
    """Extra profile data + payout info for users with role=SELLER."""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='seller_profile')
    farm_name = models.CharField(max_length=150, blank=True)
    bio = models.TextField(blank=True)
    bank_account_number = models.CharField(max_length=34, blank=True)
    bank_iban = models.CharField(max_length=34, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'seller_profiles'

    def __str__(self):
        return self.farm_name or self.user.username
