from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import UploadedImage, AnswerKey
from .serializers import UploadedImageSerializer, AnswerKeySerializer
from .process_omr import process_omr_sheet, parse_answer_key_file

class UploadedImageListView(generics.ListCreateAPIView):
    queryset = UploadedImage.objects.all().order_by('-uploaded_at')
    serializer_class = UploadedImageSerializer

class AnswerKeyUploadView(APIView):
    def post(self, request):
        serializer = AnswerKeySerializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            try:
                parsed = parse_answer_key_file(instance.file.path)
                instance.answers = parsed
                instance.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                instance.delete()
                return Response({'error': f'Failed to process answer key: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class EvaluateImagesView(APIView):
    def post(self, request):
        try:
            key = AnswerKey.objects.latest('uploaded_at')
            if not key.answers:
                return Response({'error': 'Answer key not parsed. Please re-upload.'}, status=400)

            # 🔥 FIX: Convert string keys to integers
            parsed_key = {int(k): v for k, v in key.answers.items()}

            images = UploadedImage.objects.filter(evaluation_result__isnull=True)
            if not images.exists():
                return Response({'message': 'No new images to evaluate.'}, status=200)

            evaluated = []
            for img in images:
                try:
                    result = process_omr_sheet(img.image.path, parsed_key)
                    img.evaluation_result = result
                    img.save()
                    evaluated.append({
                        'image_id': img.id,
                        'title': img.title,
                        'result': result
                    })
                except Exception as e:
                    evaluated.append({
                        'image_id': img.id,
                        'title': img.title,
                        'error': str(e)
                    })

            return Response(evaluated, status=200)

        except AnswerKey.DoesNotExist:
            return Response({'error': 'No answer key uploaded yet.'}, status=400)
        except Exception as e:
            return Response({'error': f'Unexpected error: {str(e)}'}, status=500)

