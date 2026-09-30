from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Кастомная модель пользователя."""

    email = models.EmailField("Email", unique=True)
    is_admin = models.BooleanField("Администратор", default=False)
    created_at = models.DateTimeField("Дата регистрации", auto_now_add=True)

    REQUIRED_FIELDS = ["email"]

    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"
        ordering = ["-created_at"]

    def __str__(self):
        return self.username