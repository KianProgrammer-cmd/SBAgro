from django.conf import settings
from django.db import models


class BuyerProfile(models.Model):
    """Extra profile data for users with role=BUYER."""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='buyer_profile')
    shipping_address = models.TextField(blank=True)
    postal_code = models.CharField(max_length=10, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'buyer_profiles'

    def __str__(self):
        return self.user.username
