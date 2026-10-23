# Antigravity IDE: Master Build Plan for LearnSpace AI

## 1. Project Overview & Directives
**Project Name:** LearnSpace AI
**Stack:** Python/Django REST Framework (Backend), PostgreSQL (Database), React/Vite/Tailwind (Frontend), Groq API (LLM).
**Objective:** Build an AI-powered study platform supporting PDF, DOCX, PPTX, and TXT files. It must include auto-summarization, a split-screen study dashboard, interactive debounced notes, a "Highlight to Explain" Micro-RAG feature, and dynamic quiz generation.
**Agent Directive:** Execute this plan sequentially. Set up the environment, scaffold the backend, configure the PostgreSQL database, implement the multi-file parsing and AI logic, expose the APIs, and finally build the React frontend. Do not stop until the full stack is running.

---

## 2. Environment & Dependencies Setup

**Backend Initialization:**
1. Create a root directory `learnspace-ai` and initialize a git repository.
2. Create and activate a Python virtual environment (`venv`).
3. Run: `pip install django djangorestframework psycopg2-binary django-cors-headers groq pdfplumber python-docx python-pptx python-dotenv`
4. Run: `django-admin startproject core .` and `python manage.py startapp study`

**Frontend Initialization:**
1. Run: `npm create vite@latest frontend -- --template react`
2. Navigate into `frontend` and run: `npm install axios lucide-react react-dropzone react-quill tailwindcss postcss autoprefixer`
3. Run: `npx tailwindcss init -p`
4. Configure `tailwind.config.js` to scan the `./src` directory.

---

## 3. Backend & Database Configuration (Django)

**Settings (`core/settings.py`):**
1. Add `rest_framework`, `corsheaders`, and `study` to `INSTALLED_APPS`.
2. Add `corsheaders.middleware.CorsMiddleware` to `MIDDLEWARE`.
3. Set `CORS_ALLOW_ALL_ORIGINS = True`.
4. Configure `DATABASES` for PostgreSQL (assume localhost, port 5432).

**Models (`study/models.py`):**
Implement the following relational schema:
*   `StudyMaterial`: title (CharField), file (FileField), file_type (CharField), extracted_text (TextField).
*   `AISummary`: material (ForeignKey), key_points (JSONField), real_world_examples (JSONField).
*   `StudentNote`: material (ForeignKey), content (TextField), is_bookmarked (BooleanField).
*   `Quiz`: material (ForeignKey).
*   `QuizQuestion`: quiz (ForeignKey), question (TextField), options (JSONField), correct_answer (CharField).

Execute `python manage.py makemigrations` and `python manage.py migrate`.

---

## 4. Multi-Format Parsing & AI Engine (`study/services.py`)

Create `study/services.py` and implement these core functions:

1.  **`extract_text(file_path, file_extension)`:**
    *   `pdf`: Use `pdfplumber.open()` and extract text page by page.
    *   `docx`: Use `docx.Document()` and extract paragraph text.
    *   `pptx`: Use `pptx.Presentation()` and extract text from slide shapes.
    *   `txt`: Read standard UTF-8.
2.  **Groq API Integration (`groq_client = Groq()`):**
    *   `generate_summary(text)`: Ask the LLM for a JSON object with `key_points` (array of strings) and `real_world_examples` (array of strings).
    *   `explain_highlight(highlighted_text, full_context)`: Ask the LLM to explain the highlighted text simply, using the surrounding context. Returns plain text.
    *   `generate_quiz(notes_and_summary_text)`: Ask the LLM for a JSON array of 5 questions. Each must have `question`, `options` (array of 4), and `correct_answer`.

---

## 5. API Endpoints (`study/views.py`)

Implement the following DRF endpoints:
1.  **`POST /api/upload/`**: Handles file upload, saves to `StudyMaterial`, triggers `extract_text`, calls `generate_summary`, saves `AISummary`, and returns the material ID.
2.  **`PUT /api/notes/<id>/`**: Updates the `StudentNote` content (used for frontend auto-save).
3.  **`POST /api/explain/`**: Accepts text and material ID, calls `explain_highlight`, and returns the explanation string.
4.  **`POST /api/quiz/<id>/`**: Triggers `generate_quiz`, saves the questions to the database, and returns the JSON payload.

---

## 6. Frontend Architecture (React/Vite)

**Component Structure (`frontend/src/`):**

1.  **`App.jsx`**: Main state manager. If no material is selected, render `UploadZone`. Otherwise, render `StudyDashboard`.
2.  **`UploadZone.jsx`**: Use `react-dropzone`. Accept `.pdf, .docx, .pptx, .txt`. Show a loading spinner during the backend AI processing phase.
3.  **`StudyDashboard.jsx` (Split Screen):**
    *   **Left Side (AI Summary):** Display `key_points` and `real_world_examples`. 
        *   *Micro-RAG Logic:* Add an `onMouseUp` event listener. If `window.getSelection().toString()` has length > 10, render a floating "✨ Explain" button. Clicking it calls `/api/explain/` and displays the result in a tooltip/modal.
    *   **Right Side (Workspace):** 
        *   Render `ReactQuill` for notes. Use a 2-second debounce on the `onChange` event to automatically `PUT` data to `/api/notes/<id>/`.
        *   Add a "Generate Quiz" button at the bottom.
4.  **`QuizModal.jsx`**: Opened via the "Generate Quiz" button. Calls `/api/quiz/<id>/`, renders the 5 multiple-choice questions dynamically, handles user selection, and displays a final score.

---

## 7. Final Output & Execution
After generating all files, start the Django development server on port 8000 and the Vite server on port 5173. Verify that the file upload, Micro-RAG highlighting, and quiz generation flows are functional.