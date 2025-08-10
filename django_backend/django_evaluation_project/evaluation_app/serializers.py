# django_backend/evaluation_app/serializers.py
from rest_framework import serializers
from .models import UploadedImage, AnswerKey


class UploadedImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedImage
        fields = '__all__' # This includes 'test_id' and 'test_name' automatically

class AnswerKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = AnswerKey
        fields = '__all__' # This includes 'test_id' and 'test_name' automatically


