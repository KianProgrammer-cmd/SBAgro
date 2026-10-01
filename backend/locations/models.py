from django.db import models


class Province(models.Model):
    """
    استان‌های ایران
    """

    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="نام استان",
    )

    name_en = models.CharField(
        max_length=100,
        blank=True,
        default="",
        verbose_name="نام انگلیسی",
    )

    code = models.CharField(
        max_length=10,
        blank=True,
        default="",
        db_index=True,
        verbose_name="کد استان",
    )

    class Meta:
        db_table = "provinces"
        ordering = ["name"]
        verbose_name = "استان"
        verbose_name_plural = "استان‌ها"

    def __str__(self):
        return self.name


class City(models.Model):
    """
    شهرهای ایران
    """

    province = models.ForeignKey(
        Province,
        related_name="cities",
        on_delete=models.CASCADE,
        verbose_name="استان",
    )

    name = models.CharField(
        max_length=150,
        verbose_name="نام شهر",
    )

    name_en = models.CharField(
        max_length=150,
        blank=True,
        default="",
        verbose_name="نام انگلیسی",
    )

    code = models.CharField(
        max_length=20,
        blank=True,
        default="",
        db_index=True,
        verbose_name="کد شهر",
    )

    class Meta:
        db_table = "cities"

        ordering = [
            "name",
        ]

        verbose_name = "شهر"
        verbose_name_plural = "شهرها"

        constraints = [
            models.UniqueConstraint(
                fields=["province", "name"],
                name="unique_city_per_province",
            )
        ]

        indexes = [
            models.Index(
                fields=["province", "name"],
            ),
        ]

    def __str__(self):
        return f"{self.name} - {self.province.name}"