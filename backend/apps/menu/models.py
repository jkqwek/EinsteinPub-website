from django.db import models


class Category(models.Model):
    """Категория меню: Пиво, Коктейли, Вина, Горячее."""

    # slug = id категории на фронте: "Beers", "Cocktails", "Wines", "Mains"
    slug = models.SlugField("URL-идентификатор", max_length=50, unique=True)
    name = models.CharField("Название", max_length=100)
    sort_order = models.PositiveIntegerField("Порядок", default=0)
    is_active = models.BooleanField("Активна", default=True)

    class Meta:
        verbose_name = "Категория"
        verbose_name_plural = "Категории"
        ordering = ["sort_order", "name"]

    def __str__(self):
        return self.name


class Dish(models.Model):
    """Блюдо или напиток из меню."""

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="dishes",
        verbose_name="Категория",
    )
    name = models.CharField("Название", max_length=100)
    description = models.TextField("Описание", blank=True)
    price = models.PositiveIntegerField("Цена, ₽")
    weight = models.CharField("Граммовка / объём", max_length=30, blank=True)
    image = models.ImageField("Фото", upload_to="dishes/", blank=True, null=True)
    sort_order = models.PositiveIntegerField("Порядок", default=0)
    is_available = models.BooleanField("Доступно", default=True)
    created_at = models.DateTimeField("Создано", auto_now_add=True)
    updated_at = models.DateTimeField("Обновлено", auto_now=True)

    class Meta:
        verbose_name = "Блюдо"
        verbose_name_plural = "Блюда"
        ordering = ["sort_order", "name"]

    def __str__(self):
        return f"{self.name} ({self.category.name})"