# Группа «Персонал»: полный доступ к меню, событиям, галерее и броням, без доступа к пользователям.
# Сотруднику нужно включить «Статус персонала» и добавить его в эту группу.

from django.contrib.auth.management import create_permissions
from django.db import migrations

STAFF_APPS = ["menu", "events", "gallery", "bookings"]


def create_staff_group(apps, schema_editor):
    # Права на модели Django создаёт только после всех миграций; создаём их сейчас,
    # иначе на свежей базе группе нечего выдать
    for app_config in apps.get_app_configs():
        app_config.models_module = True
        create_permissions(app_config, apps=apps, verbosity=0)
        app_config.models_module = None

    Group = apps.get_model("auth", "Group")
    Permission = apps.get_model("auth", "Permission")
    group, _ = Group.objects.get_or_create(name="Персонал")
    group.permissions.set(
        Permission.objects.filter(content_type__app_label__in=STAFF_APPS)
    )


def delete_staff_group(apps, schema_editor):
    apps.get_model("auth", "Group").objects.filter(name="Персонал").delete()


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0001_initial"),
        ("auth", "0012_alter_user_first_name_max_length"),
        ("contenttypes", "0002_remove_content_type_name"),
        ("menu", "0002_seed_menu"),
        ("events", "0001_initial"),
        ("gallery", "0001_initial"),
        ("bookings", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(create_staff_group, delete_staff_group),
    ]
