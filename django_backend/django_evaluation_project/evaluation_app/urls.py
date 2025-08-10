from django.urls import path
from .views import UploadedImageListView, AnswerKeyUploadView, EvaluateImagesView

urlpatterns = [
    path('images/', UploadedImageListView.as_view(), name='image-list-create'),
    path('upload-answer-key/', AnswerKeyUploadView.as_view(), name='upload-answer-key'),
    path('evaluate-images/', EvaluateImagesView.as_view(), name='evaluate-images'),    
]
