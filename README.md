# LearnSpace — Cognitive Study Sanctuary

An active study sanctuary and manuscript synthesis platform supporting PDF, DOCX, PPTX, and TXT documents. Features real-time contextual concept deep-dives, a split-screen study dashboard, debounced precision notes, and targeted active recall mastery examinations.

---

## Architecture & Tech Stack

- **Backend**: Python 3.14, Django 6, Django REST Framework
- **Database**: PostgreSQL (with automatic local SQLite fallback for development)
- **Frontend**: React 19, Vite 8, TailwindCSS v4, Lucide Icons, React Quill
- **Parsing Engine**: `pdfplumber`, `python-docx`, `python-pptx`
- **Synthesis Engine**: High-throughput contextual synthesis & active recall formulation

---

## Key Features

1. **Multi-Format Manuscript Ingestion**:
   - Ingest PDF, Word (.docx), PowerPoint (.pptx), and text (.txt) files.
   - Extracts structured textual content page-by-page and slide-by-slide.

2. **Executive Synthesis & Case Briefings**:
   - High-density core strategic principles and empirical case studies.

3. **Split-Screen Studio Dashboard**:
   - **Left Panel**: Executive briefing, key takeaways, real-world applications, and full manuscript source view.
   - **Right Panel**: Full rich-text notes workspace with automatic 2-second debounced persistence.

4. **Contextual Concept Deep-Dives**:
   - Select any passage (> 10 characters) across the manuscript to trigger the floating **"✦ Clarify Concept"** button.
   - Instantly reveals a contextual breakdown with single-click **"Embed in Notes"** functionality.

5. **Active Recall Mastery Examinations**:
   - Dynamic 5-question multiple choice examinations custom-formulated from your study notes and manuscript.
   - Instant grading, interactive explanations, and score tracking.

6. **Warm Obsidian Studio Aesthetic**:
   - Refined dark studio palette featuring charcoal obsidian backgrounds, burnished honey gold accents, and Newsreader editorial typography.

---

## Quickstart Guide

### 1. Clone the Repository

```bash
git clone https://github.com/harisghaffar92/Learnspace_ai.git
cd Learnspace_ai
```

### 2. Backend Setup

```bash
# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate   # On Windows
# source venv/bin/activate # On Unix/macOS

# Install dependencies
pip install django djangorestframework psycopg2-binary django-cors-headers groq pdfplumber python-docx python-pptx python-dotenv

# Configure environment
cp .env.example .env
# Fill in your DB_PASSWORD and GROQ_API_KEY in .env

# Run database migrations
python manage.py migrate

# Start the Django development server
python manage.py runserver 127.0.0.1:8000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Visit `http://127.0.0.1:5173/` in your browser.

---

## API Endpoints

- `POST /api/upload/`: Multi-part manuscript upload and automated executive synthesis.
- `GET /api/materials/`: List recent study sessions.
- `GET /api/materials/<id>/`: Retrieve full session details, briefing, and notes.
- `PUT /api/notes/<id>/`: Debounced auto-save for student notes.
- `POST /api/explain/`: Contextual concept clarification.
- `POST /api/quiz/<id>/`: Generate dynamic 5-question active recall examination.
