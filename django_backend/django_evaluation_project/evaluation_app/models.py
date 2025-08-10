from django.db import models

class UploadedImage(models.Model):
    title = models.CharField(max_length=255, blank=True)
    image = models.ImageField(upload_to='images/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    evaluation_result = models.JSONField(null=True, blank=True)
    

    def __str__(self):
        return self.title or f"Image {self.id}"

class AnswerKey(models.Model):
    file = models.FileField(upload_to='answer_keys/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    answers = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"Answer Key {self.id} ({self.uploaded_at.strftime('%Y-%m-%d %H:%M')})"

