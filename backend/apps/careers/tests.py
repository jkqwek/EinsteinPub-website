import tempfile
from pathlib import Path
from unittest import mock

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Application, Vacancy


class ApplicationTests(TestCase):
    def setUp(self):
        cache.clear()  # сбрасывает лимит 3 отклика в час
        # Файлы резюме пишутся во временную папку, а не в backend/private_media
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        storage = Application._meta.get_field("resume").storage
        patcher = mock.patch.object(storage, "location", tmp.name)
        patcher.start()
        self.addCleanup(patcher.stop)

        self.client = APIClient()
        self.vacancy = Vacancy.objects.create(title="Бармен")

    def apply(self, **fields):
        data = {"name": "Анна", "phone": "+7 900 123-45-67", "adult": True, "consent": True, **fields}
        return self.client.post("/api/applications/", data, format="multipart")

    def test_resume_is_saved_privately_and_only_admin_downloads_it(self):
        res = self.apply(
            vacancy=self.vacancy.id,
            resume=SimpleUploadedFile("cv.pdf", b"%PDF-1.7 resume", content_type="application/pdf"),
        )
        self.assertEqual(res.status_code, 201, res.content)
        application = Application.objects.get()
        self.assertEqual(application.position, "Бармен")
        url = f"/api/admin/applications/{application.id}/resume/"

        User = get_user_model()
        staff = User.objects.create_user("staff", "staff@example.com", "x", is_staff=True)
        admin = User.objects.create_user("boss", "boss@example.com", "x", is_staff=True, is_admin=True)

        self.client.force_authenticate(staff)
        self.assertEqual(self.client.get(url).status_code, 403)

        self.client.force_authenticate(admin)
        res = self.client.get(url)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(b"".join(res.streaming_content), b"%PDF-1.7 resume")
        res.close()

        path = Path(application.resume.path)
        self.client.delete(f"/api/admin/applications/{application.id}/")
        self.assertFalse(path.exists())

    def test_rejects_file_that_only_pretends_to_be_pdf(self):
        res = self.apply(resume=SimpleUploadedFile("cv.pdf", b"MZ\x90\x00 not a pdf"))
        self.assertEqual(res.status_code, 400)
        self.assertIn("resume", res.json())

    def test_requires_resume_or_about_and_adult(self):
        self.assertIn("about", self.apply().json())
        self.assertIn("adult", self.apply(about="Работал барменом", adult=False).json())

    def test_rejects_closed_vacancy(self):
        self.vacancy.is_open = False
        self.vacancy.save()
        res = self.apply(vacancy=self.vacancy.id, about="Опыт 2 года")
        self.assertIn("vacancy", res.json())
