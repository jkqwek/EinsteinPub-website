from io import BytesIO
from pathlib import Path

from django.core.files.base import ContentFile
from PIL import Image, ImageOps
from rest_framework import serializers

MAX_SIDE = 1600


def shrink_image(field):
    """Сжимает только что загруженное фото: до 1600 px по длинной стороне, в WebP.

    Вызывать из save() модели до super().save(). Уже сохранённые фото не трогает.
    """
    if not field or field._committed:
        return
    image = ImageOps.exif_transpose(Image.open(field))  # фото с телефона хранят поворот в EXIF
    image.thumbnail((MAX_SIDE, MAX_SIDE))
    has_alpha = image.mode in ("RGBA", "LA", "P")
    buffer = BytesIO()
    image.convert("RGBA" if has_alpha else "RGB").save(buffer, "WEBP", quality=82)
    field.save(f"{Path(field.name).stem}.webp", ContentFile(buffer.getvalue()), save=False)


class ImageUrlField(serializers.ImageField):
    """Отдаёт путь вида /media/... (или "" без фото), а не абсолютный URL.

    Абсолютный URL за прокси (Vite, nginx) получился бы с чужим хостом или http вместо https.
    """

    def to_representation(self, value):
        return value.url if value else ""
