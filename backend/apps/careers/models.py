from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver


def private_storage():
    """Резюме лежат вне MEDIA_ROOT: их не раздают ни Django, ни nginx,
    скачать файл можно только через админский API (ResumeDownloadView)."""
    return FileSystemStorage(location=settings.PRIVATE_MEDIA_ROOT)


class Vacancy(models.Model):
    """Должность на странице «Вакансии»."""

    title = models.CharField("Должность", max_length=100)
    description = models.TextField("Описание", blank=True)
    schedule = models.CharField("График", max_length=100, blank=True)
    salary = models.CharField("Зарплата", max_length=100, blank=True)
    is_open = models.BooleanField("Открыта", default=True)
    sort_order = models.PositiveIntegerField("Порядок", default=0)

    class Meta:
        verbose_name = "Вакансия"
        verbose_name_plural = "Вакансии"
        ordering = ["sort_order", "id"]

    def __str__(self):
        return self.title


class Application(models.Model):
    """Отклик с сайта. Должность хранится текстом, чтобы отклик не менялся,
    когда вакансию переименуют или удалят. Пустая строка — «Любая вакансия»."""

    class Status(models.TextChoices):
        NEW = "new", "Новый"
        REVIEWED = "reviewed", "Рассмотрен"
        INVITED = "invited", "Приглашён на собеседование"
        REJECTED = "rejected", "Отказ"

    position = models.CharField("Вакансия", max_length=100, blank=True)
    name = models.CharField("Имя", max_length=100)
    phone = models.CharField("Телефон", max_length=30)
    email = models.EmailField("Email", blank=True)
    about = models.TextField("О себе и опыт", max_length=3000, blank=True)
    resume = models.FileField(
        "Резюме", upload_to="resumes/", storage=private_storage, blank=True
    )
    status = models.CharField(
        "Статус", max_length=20, choices=Status, default=Status.NEW
    )
    created_at = models.DateTimeField("Создан", auto_now_add=True)

    class Meta:
        verbose_name = "Отклик"
        verbose_name_plural = "Отклики"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name}, {self.position or 'любая вакансия'}"


# Файл удаляется вместе с откликом: из API, из админки Django и при массовом удалении
@receiver(post_delete, sender=Application)
def delete_resume_file(sender, instance, **kwargs):
    instance.resume.delete(save=False)
