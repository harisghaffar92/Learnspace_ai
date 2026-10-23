from rest_framework import serializers
from .models import StudyMaterial, AISummary, StudentNote, Quiz, QuizQuestion

class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = ['id', 'question', 'options', 'correct_answer']


class QuizSerializer(serializers.ModelSerializer):
    questions = QuizQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'material', 'questions', 'created_at']


class StudentNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentNote
        fields = ['id', 'material', 'content', 'is_bookmarked', 'updated_at']


class AISummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = AISummary
        fields = ['id', 'material', 'key_points', 'real_world_examples', 'created_at']


class StudyMaterialSerializer(serializers.ModelSerializer):
    ai_summary = serializers.SerializerMethodField()
    latest_note = serializers.SerializerMethodField()

    class Meta:
        model = StudyMaterial
        fields = [
            'id',
            'title',
            'file',
            'file_type',
            'extracted_text',
            'created_at',
            'ai_summary',
            'latest_note'
        ]

    def get_ai_summary(self, obj):
        summary = obj.ai_summaries.order_by('-created_at').first()
        if summary:
            return AISummarySerializer(summary).data
        return None

    def get_latest_note(self, obj):
        note = obj.notes.order_by('-updated_at').first()
        if note:
            return StudentNoteSerializer(note).data
        return None
