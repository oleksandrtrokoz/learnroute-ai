# LearnRoute AI

LearnRoute AI is an adaptive learning web app focused on quadratic equations. It combines diagnostics, personalized explanations, semantic grading, symbolic safety checks, and progress tracking in one student-centered flow.

## Features

### Student Experience
- Guided flow: `Setup -> Lesson -> Practice -> Summary`
- 3-question baseline diagnostic using correctness, response time, and confidence
- Multiple explanation modes: `Step-by-step`, `Visual`, `Analogy`, `Simplified`
- Practice with instant feedback, hints, and step-level coaching
- Spaced review queue with `Review Now`
- Local session persistence (resume after refresh)

### AI and Grading
- Semantic answer matching
- Reasoning quality scoring
- Misconception detection with targeted feedback
- Symbolic safety checks for root-based answers
- Adaptive difficulty by skill mastery
- Free-response tutor endpoint

### Progress and Analytics
- Knowledge-state bars by skill
- Learning path unlocks based on consistent streaks
- Attempt history and confidence calibration
- Session summary with strengths, misconceptions, and next actions
- Teacher-facing error clusters

## Tech Stack
- Frontend: `HTML`, `CSS`, `Vanilla JavaScript`
- Backend: `Python` (`http.server`)
- Optional AI upgrades: `sentence-transformers`, `sympy`

## Project Structure
```text
.
|-- index.html
|-- styles.css
|-- app.js
|-- learnroute_ai_backend.py
`-- README.md
```

## Quick Start

### 1) Prerequisites
- Python 3.9+ installed and available in terminal

### 2) Optional stronger AI dependencies
```bash
pip install sentence-transformers sympy
```

### 3) Start the backend
```bash
python learnroute_ai_backend.py
```

You should see:
- `Frontend URL: http://127.0.0.1:8008/`
- `Health URL: http://127.0.0.1:8008/health`

### 4) Open the app
- Visit `http://127.0.0.1:8008/` in your browser
- Do not open `index.html` directly via `file://`

## User Flow
1. Choose language and preferred explanation mode.
2. Complete the 3-question diagnostic.
3. Receive a starting node and adaptive lesson.
4. Practice with AI-generated questions and feedback.
5. Unlock nodes through consistent correct streaks.
6. Finish with a session summary and recommended next actions.

## API Endpoints
- `GET /health`
- `POST /api/grade-response`
- `POST /api/generate-question`
- `POST /api/explain-modes`
- `POST /api/tutor-turn`
- `POST /api/review-queue`
- `POST /api/teacher-summary`

## Screenshots Checklist
- [ ] Hero + setup screen (`docs/screenshots/01-setup.png`)
- [ ] Diagnostic question view (`docs/screenshots/02-diagnostic.png`)
- [ ] Lesson mode view (`docs/screenshots/03-lesson.png`)
- [ ] Practice feedback view (`docs/screenshots/04-practice.png`)
- [ ] Progress tab (path + mastery + review) (`docs/screenshots/05-progress.png`)
- [ ] Session summary (`docs/screenshots/06-summary.png`)

## Demo GIF Checklist
- [ ] 20-30s overview GIF (`docs/demo/learnroute-overview.gif`)
- [ ] Start at setup and launch diagnostic
- [ ] Show one incorrect answer and hint usage
- [ ] Show explanation mode switch
- [ ] Show mastery/progress update
- [ ] End on summary card

## 3-Minute Demo Script
1. Open LearnRoute AI and quickly show setup options (language + explanation mode).
2. Run the 3-question diagnostic to establish a starting level.
3. Show the adaptive lesson generated for the learner's current node.
4. Submit one wrong practice answer and show hint ladder plus targeted feedback.
5. Submit a corrected answer and show mastery/path update.
6. Close on the summary card and progress tab to show strengths, misconceptions, and next actions.

## Troubleshooting
- If the app says backend is offline, start `python learnroute_ai_backend.py` and open `http://127.0.0.1:8008/` (not `file://`).
- If `python` is not found, install Python, reopen terminal, then try `py learnroute_ai_backend.py` on Windows.
- If optional packages are missing, the app still runs using fallback similarity logic.

## Debug Mode
- Open `http://127.0.0.1:8008/?debug=1` to show developer-only diagnostics.

## License
Add your preferred license (MIT is a common choice for student and portfolio projects).
