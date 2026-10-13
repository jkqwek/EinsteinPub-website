# Стартовое меню, с которым запускался сайт. Фото персонал загрузит в админке.

from django.db import migrations

CATEGORIES = [
    ("Beers", "Пиво"),
    ("Cocktails", "Коктейли"),
    ("Wines", "Вина"),
    ("Mains", "Горячее"),
]

DISHES = [
    ("Beers", "Квантовый IPA", 450, "Хмелевой, с цитрусовыми нотами, 6,5% алк."),
    ("Beers", "Стаут «Относительность»", 490, "Тёмный шоколад, жжёный солод, 8% алк."),
    ("Cocktails", "Алхимик", 750, "Джин, бузина, дымящийся розмарин"),
    ("Cocktails", "Кот Шрёдингера", 790, "Бурбон, биттеры, загадочное послевкусие"),
    ("Mains", "Свинина «Яблоко Ньютона»", 1290, "Томлёная свиная грудинка, яблочное пюре"),
]


def seed_menu(apps, schema_editor):
    Category = apps.get_model("menu", "Category")
    Dish = apps.get_model("menu", "Dish")
    categories = {
        slug: Category.objects.create(slug=slug, name=name, sort_order=i)
        for i, (slug, name) in enumerate(CATEGORIES)
    }
    for slug, name, price, description in DISHES:
        Dish.objects.create(
            category=categories[slug], name=name, price=price, description=description
        )


class Migration(migrations.Migration):
    dependencies = [
        ("menu", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_menu, migrations.RunPython.noop),
    ]
