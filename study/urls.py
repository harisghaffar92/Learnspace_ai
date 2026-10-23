from django.urls import path
from .views import (
    MaterialUploadView,
    MaterialDetailView,
    MaterialListView,
    StudentNoteUpdateView,
    ExplainHighlightView,
    GenerateQuizView
)

urlpatterns = [
    path('upload/', MaterialUploadView.as_view(), name='material-upload'),
    path('materials/', MaterialListView.as_view(), name='material-list'),
    path('materials/<int:pk>/', MaterialDetailView.as_view(), name='material-detail'),
    path('notes/<int:pk>/', StudentNoteUpdateView.as_view(), name='note-update'),
    path('explain/', ExplainHighlightView.as_view(), name='explain-highlight'),
    path('quiz/<int:pk>/', GenerateQuizView.as_view(), name='generate-quiz'),
]
