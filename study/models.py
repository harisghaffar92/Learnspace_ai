from django.db import models

class StudyMaterial(models.Model):
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='study_materials/')
    file_type = models.CharField(max_length=50)
    extracted_text = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.file_type})"


class AISummary(models.Model):
    material = models.ForeignKey(StudyMaterial, on_delete=models.CASCADE, related_name='ai_summaries')
    key_points = models.JSONField(default=list)
    real_world_examples = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"AI Summary for {self.material.title}"


class StudentNote(models.Model):
    material = models.ForeignKey(StudyMaterial, on_delete=models.CASCADE, related_name='notes')
    content = models.TextField(blank=True, default='')
    is_bookmarked = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Notes for {self.material.title}"


class Quiz(models.Model):
    material = models.ForeignKey(StudyMaterial, on_delete=models.CASCADE, related_name='quizzes')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Quiz #{self.id} for {self.material.title}"


class QuizQuestion(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question = models.TextField()
    options = models.JSONField(default=list)
    correct_answer = models.CharField(max_length=255)

    def __str__(self):
        return f"Question {self.id} (Quiz #{self.quiz_id})"
