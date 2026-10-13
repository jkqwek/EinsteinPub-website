from django.db import models

from apps.images import shrink_image


class Photo(models.Model):
    """Фото для страницы «Галерея»."""

    image = models.ImageField("Фото", upload_to="gallery/")
    caption = models.CharField("Подпись", max_length=200, blank=True)
    sort_order = models.PositiveIntegerField("Порядок", default=0)

    class Meta:
        verbose_name = "Фото"
        verbose_name_plural = "Фото"
        ordering = ["sort_order", "id"]

    def __str__(self):
        return self.caption or f"Фото {self.pk}"

    def save(self, *args, **kwargs):
        shrink_image(self.image)
        super().save(*args, **kwargs)
