from django.db import models

from apps.images import shrink_image


class Event(models.Model):
    """Событие паба: концерт, дегустация, квиз."""

    title = models.CharField("Название", max_length=150)
    starts_at = models.DateTimeField("Дата и время")
    description = models.TextField("Описание", blank=True)
    image = models.ImageField("Фото", upload_to="events/", blank=True, null=True)
    is_published = models.BooleanField("Опубликовано", default=True)

    class Meta:
        verbose_name = "Событие"
        verbose_name_plural = "События"
        ordering = ["starts_at"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        shrink_image(self.image)
        super().save(*args, **kwargs)
