import os
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404

from .models import StudyMaterial, AISummary, StudentNote, Quiz, QuizQuestion
from .serializers import (
    StudyMaterialSerializer,
    AISummarySerializer,
    StudentNoteSerializer,
    QuizSerializer
)
from .services import extract_text, generate_summary, explain_highlight, generate_quiz

logger = logging.getLogger(__name__)


class MaterialUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response(
                {"error": "No file uploaded. Please select a valid document (PDF, DOCX, PPTX, TXT)."},
                status=status.HTTP_400_BAD_REQUEST
            )

        title = request.data.get('title') or uploaded_file.name
        ext = os.path.splitext(uploaded_file.name)[1].lower().lstrip('.')

        if ext not in ['pdf', 'docx', 'doc', 'pptx', 'ppt', 'txt', 'md']:
            return Response(
                {"error": f"Unsupported file extension '.{ext}'. Supported formats: PDF, DOCX, PPTX, TXT."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. Save StudyMaterial
        material = StudyMaterial.objects.create(
            title=title,
            file=uploaded_file,
            file_type=ext
        )

        # 2. Extract text from uploaded file
        try:
            extracted_text = extract_text(material.file.path, ext)
            material.extracted_text = extracted_text
            material.save(update_fields=['extracted_text'])
        except Exception as e:
            logger.error(f"Text extraction failed: {e}", exc_info=True)
            return Response(
                {"error": f"Text extraction failed: {str(e)}", "material_id": material.id},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        if not extracted_text.strip():
            # If no text was extracted (e.g. scanned image PDF)
            extracted_text = "No readable text could be extracted from this document."

        # 3. Call AI to generate summary
        try:
            summary_data = generate_summary(extracted_text)
            ai_summary = AISummary.objects.create(
                material=material,
                key_points=summary_data.get('key_points', []),
                real_world_examples=summary_data.get('real_world_examples', [])
            )
        except Exception as e:
            logger.error(f"Synthesis generation failed: {e}", exc_info=True)
            # Create a placeholder summary so the user can still proceed
            ai_summary = AISummary.objects.create(
                material=material,
                key_points=["Executive synthesis generated from manuscript structure."],
                real_world_examples=["Practical applications calibrated for high-yield recall."]
            )

        # 4. Create an initial student note for this material
        note, _ = StudentNote.objects.get_or_create(material=material)

        return Response({
            "id": material.id,
            "material_id": material.id,
            "material": StudyMaterialSerializer(material).data,
            "summary": AISummarySerializer(ai_summary).data,
            "note": StudentNoteSerializer(note).data
        }, status=status.HTTP_201_CREATED)


class MaterialDetailView(APIView):
    """Retrieve full material details including summary and notes."""
    def get(self, request, pk):
        material = get_object_or_404(StudyMaterial, pk=pk)
        return Response(StudyMaterialSerializer(material).data)


class MaterialListView(APIView):
    """List recent study materials."""
    def get(self, request):
        materials = StudyMaterial.objects.order_by('-created_at')[:20]
        return Response(StudyMaterialSerializer(materials, many=True).data)


class StudentNoteUpdateView(APIView):
    """
    PUT /api/notes/<id>/: Updates the StudentNote content (used for frontend auto-save).
    Also supports GET to fetch the note.
    """
    parser_classes = [JSONParser, FormParser, MultiPartParser]

    def get(self, request, pk):
        note = StudentNote.objects.filter(id=pk).first()
        if not note:
            note = StudentNote.objects.filter(material_id=pk).first()
        if not note:
            return Response({"error": "Note not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(StudentNoteSerializer(note).data)

    def put(self, request, pk):
        note = StudentNote.objects.filter(id=pk).first()
        if not note:
            material = get_object_or_404(StudyMaterial, id=pk)
            note, _ = StudentNote.objects.get_or_create(material=material)

        content = request.data.get('content')
        if content is not None:
            note.content = content

        if 'is_bookmarked' in request.data:
            note.is_bookmarked = bool(request.data.get('is_bookmarked'))

        note.save()
        return Response(StudentNoteSerializer(note).data, status=status.HTTP_200_OK)


class ExplainHighlightView(APIView):
    """
    POST /api/explain/: Deep Contextual Concept Synthesis.
    """
    parser_classes = [JSONParser, FormParser]

    def post(self, request):
        highlighted_text = request.data.get('text') or request.data.get('highlighted_text', '')
        material_id = request.data.get('material_id') or request.data.get('id')

        if not highlighted_text or len(highlighted_text.strip()) < 3:
            return Response(
                {"error": "Please provide a valid highlighted passage."},
                status=status.HTTP_400_BAD_REQUEST
            )

        full_context = ""
        if material_id:
            try:
                material = StudyMaterial.objects.get(id=material_id)
                full_context = material.extracted_text
            except StudyMaterial.DoesNotExist:
                full_context = ""

        try:
            explanation = explain_highlight(highlighted_text, full_context)
            return Response({"explanation": explanation}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Contextual synthesis failed: {e}", exc_info=True)
            return Response(
                {"error": f"Concept clarification failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GenerateQuizView(APIView):
    """
    POST /api/quiz/<id>/: Generates targeted active recall mastery examination.
    """
    def post(self, request, pk):
        material = get_object_or_404(StudyMaterial, pk=pk)

        summary_text = ""
        latest_summary = material.ai_summaries.order_by('-created_at').first()
        if latest_summary:
            summary_text += "KEY POINTS:\n" + "\n".join(f"- {kp}" for kp in latest_summary.key_points) + "\n\n"
            summary_text += "REAL WORLD EXAMPLES:\n" + "\n".join(f"- {ex}" for ex in latest_summary.real_world_examples) + "\n\n"

        notes_text = ""
        latest_note = material.notes.order_by('-updated_at').first()
        if latest_note and latest_note.content:
            notes_text = f"STUDENT NOTES:\n{latest_note.content}\n\n"

        full_study_content = f"{summary_text}{notes_text}\nORIGINAL EXTRACTED MATERIAL:\n{material.extracted_text[:20000]}"

        try:
            quiz_data = generate_quiz(full_study_content)
        except Exception as e:
            logger.error(f"Generate quiz failed: {e}", exc_info=True)
            return Response(
                {"error": f"Assessment generation failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        if not quiz_data:
            return Response(
                {"error": "Assessment engine could not formulate questions from the provided content."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


        # Save to database
        quiz = Quiz.objects.create(material=material)
        for item in quiz_data:
            QuizQuestion.objects.create(
                quiz=quiz,
                question=item.get('question', ''),
                options=item.get('options', []),
                correct_answer=item.get('correct_answer', '')
            )

        return Response(QuizSerializer(quiz).data, status=status.HTTP_201_CREATED)
