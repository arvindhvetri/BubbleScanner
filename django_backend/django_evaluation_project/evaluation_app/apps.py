# evaluation_app/apps.py
from django.apps import AppConfig
import os
from django.conf import settings

class EvaluationAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'evaluation_app'

    def ready(self):

        from .models import UploadedImage, AnswerKey

        # Delete all uploaded images and their files
        for img in UploadedImage.objects.all():
            if img.image:
                try:
                    os.remove(img.image.path)
                except:
                    pass
            img.delete()

        # Delete all answer key files
        for key in AnswerKey.objects.all():
            if key.file:
                try:
                    os.remove(key.file.path)
                except:
                    pass
            key.delete()
