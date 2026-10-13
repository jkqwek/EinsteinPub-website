from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Booking(models.Model):
    """Заявка на бронь стола с сайта. Персонал перезванивает и меняет статус."""

    class Status(models.TextChoices):
        NEW = "new", "Новая"
        CONFIRMED = "confirmed", "Подтверждена"
        CANCELLED = "cancelled", "Отменена"

    name = models.CharField("Имя", max_length=100)
    phone = models.CharField("Телефон", max_length=30)
    guests = models.PositiveSmallIntegerField(
        "Гостей", validators=[MinValueValidator(1), MaxValueValidator(12)]
    )
    date = models.DateField("Дата")
    time = models.TimeField("Время")
    wishes = models.TextField("Пожелания", max_length=1000, blank=True)
    status = models.CharField(
        "Статус", max_length=20, choices=Status, default=Status.NEW
    )
    created_at = models.DateTimeField("Создана", auto_now_add=True)

    class Meta:
        verbose_name = "Бронь"
        verbose_name_plural = "Брони"
        ordering = ["date", "time"]

    def __str__(self):
        return f"{self.name}, {self.date:%d.%m} {self.time:%H:%M}"
