#!/usr/bin/env python3
"""
LearnRoute AI backend.

Run:
  python learnroute_ai_backend.py

Optional dependencies for stronger AI behavior:
  pip install sentence-transformers sympy

The server exposes JSON endpoints used by the frontend app:
  GET  /health
  POST /api/grade-response
  POST /api/generate-question
  POST /api/explain-modes
  POST /api/tutor-turn
  POST /api/review-queue
  POST /api/teacher-summary
"""

from __future__ import annotations

import json
import math
import random
import re
import time
import uuid
from collections import Counter
from datetime import datetime, timedelta, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Dict, List, Tuple
from urllib.parse import urlparse

try:
    from sentence_transformers import SentenceTransformer, util as st_util

    ST_MODEL = SentenceTransformer("all-MiniLM-L6-v2")
    HAS_SENTENCE_TRANSFORMERS = True
except Exception:
    ST_MODEL = None
    st_util = None
    HAS_SENTENCE_TRANSFORMERS = False

try:
    import sympy as sp

    HAS_SYMPY = True
except Exception:
    sp = None
    HAS_SYMPY = False

HOST = "127.0.0.1"
PORT = 8008
BASE_DIR = Path(__file__).resolve().parent

STATIC_ROUTE_MAP = {
    "/": "index.html",
    "/index.html": "index.html",
    "/styles.css": "styles.css",
    "/app.js": "app.js",
}

CONTENT_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
}

WORD_RE = re.compile(r"[A-Za-z0-9_+-]+")
NUMBER_RE = re.compile(r"[-+]?\d*\.?\d+")


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").strip().lower())


def tokenize(text: str) -> List[str]:
    return [m.group(0).lower() for m in WORD_RE.finditer(text or "")]


def counter_cosine(a: Counter, b: Counter) -> float:
    if not a or not b:
        return 0.0
    common = set(a.keys()) & set(b.keys())
    dot = sum(a[token] * b[token] for token in common)
    norm_a = math.sqrt(sum(v * v for v in a.values()))
    norm_b = math.sqrt(sum(v * v for v in b.values()))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


def semantic_similarity(a: str, b: str) -> float:
    """Return 0..1 similarity."""
    if HAS_SENTENCE_TRANSFORMERS:
        embeddings = ST_MODEL.encode([a or "", b or ""], normalize_embeddings=True)
        raw = float(st_util.cos_sim(embeddings[0], embeddings[1]))
        return max(0.0, min(1.0, (raw + 1.0) / 2.0))

    vec_a = Counter(tokenize(a))
    vec_b = Counter(tokenize(b))
    return max(0.0, min(1.0, counter_cosine(vec_a, vec_b)))


def best_match(answer: str, accepted: List[str]) -> Tuple[str, float]:
    best_text = ""
    best_score = 0.0
    for candidate in accepted:
        score = semantic_similarity(answer, candidate)
        if score > best_score:
            best_text = candidate
            best_score = score
    return best_text, best_score


def confidence_band(score: float) -> str:
    if score >= 0.88:
        return "high"
    if score >= 0.74:
        return "medium"
    return "low"


def parse_numbers(text: str) -> List[float]:
    values = []
    for token in NUMBER_RE.findall(text or ""):
        try:
            values.append(float(token))
        except ValueError:
            continue
    return values


def verify_roots_safety(equation: str, roots: List[float], answer_text: str) -> Dict[str, Any]:
    """Safety layer: verify whether numbers in answer satisfy equation."""
    note = "symbolic-check-unavailable"
    verified = False

    if not HAS_SYMPY:
        return {"verified": False, "note": note}

    try:
        expr_text = equation.replace("^", "**").replace("=0", "")
        expr = sp.sympify(expr_text)
        free_symbols = sorted(list(expr.free_symbols), key=lambda s: str(s))
        symbol = free_symbols[0] if free_symbols else sp.symbols("x")

        guessed = parse_numbers(answer_text)
        if not guessed:
            return {"verified": False, "note": "no-numeric-roots-detected"}

        checked = []
        for n in guessed:
            val = float(sp.N(expr.subs(symbol, n)))
            checked.append(abs(val) < 1e-6)

        all_checked = bool(checked) and all(checked)

        # When expected roots are provided, require full root-set agreement.
        if roots:
            rounded_detected = sorted({round(v, 6) for v in guessed})
            rounded_expected = sorted({round(v, 6) for v in roots})
            detected_set = set(rounded_detected)
            expected_set = set(rounded_expected)

            if detected_set == expected_set:
                verified = True
                note = "detected-roots-match-expected-roots"
            elif detected_set and detected_set.issubset(expected_set):
                verified = False
                note = "partial-root-set-detected"
            elif all_checked:
                verified = False
                note = "detected-roots-valid-but-expected-set-mismatch"
            else:
                verified = False
                note = "at-least-one-detected-root-failed-substitution"
            return {"verified": verified, "note": note}

        if all_checked:
            verified = True
            note = "all-detected-roots-satisfy-equation"
        else:
            verified = False
            note = "at-least-one-detected-root-failed-substitution"

        return {"verified": verified, "note": note}
    except Exception as exc:
        return {"verified": False, "note": f"verification-error:{exc}"}


def detect_misconception(answer: str, misconceptions: List[Dict[str, Any]]) -> Dict[str, Any] | None:
    answer_n = normalize(answer)
    best = None
    best_score = 0.0

    for item in misconceptions:
        patterns = item.get("patterns", [])
        label = item.get("label", item.get("id", "unknown"))
        feedback = item.get("feedback", "Try the hint ladder and re-check your setup.")

        local_best = 0.0
        for pattern in patterns:
            pattern_n = normalize(pattern)
            if not pattern_n:
                continue
            if pattern_n == answer_n:
                local_best = 1.0
                break
            local_best = max(local_best, semantic_similarity(answer_n, pattern_n))

        if local_best > best_score:
            best_score = local_best
            best = {
                "id": item.get("id", "unknown"),
                "label": label,
                "feedback": feedback,
                "score": round(local_best, 4),
            }

    if best and best_score >= 0.55:
        return best
    return None


def generate_style_explanations(prompt: str, style: str, language: str = "en") -> Dict[str, str]:
    prompt_short = prompt.strip().rstrip("?")

    if language == "es":
        return {
            "step": (
                f"Paso a paso para: {prompt_short}.\n"
                "1) Identifica datos y objetivo.\n"
                "2) Aplica una regla por vez.\n"
                "3) Verifica signos y resultado final."
            ),
            "visual": (
                f"Modo visual para: {prompt_short}.\n"
                "Dibuja ejes o bloques algebraicos, marca cambios y simetrías, y responde desde la forma."
            ),
            "analogy": (
                f"Analogía para: {prompt_short}.\n"
                "Piensa en una balanza: operaciones iguales en ambos lados mantienen el equilibrio."
            ),
            "simple": (
                f"Versión simple para: {prompt_short}.\n"
                "Quédate con la regla central y evita detalles avanzados hasta acertar una vez."
            ),
            "selected": style,
        }

    return {
        "step": (
            f"Step-by-step for: {prompt_short}.\n"
            "1) Identify knowns and target.\n"
            "2) Apply one rule at a time.\n"
            "3) Re-check signs and substitution.\n"
            "4) State why each step is valid."
        ),
        "visual": (
            f"Visual mode for: {prompt_short}.\n"
            "Sketch axis/shape blocks, mark symmetry and direction, then infer the answer from structure.\n"
            "Use intercepts, turning point, and mirror symmetry as anchors."
        ),
        "analogy": (
            f"Analogy mode for: {prompt_short}.\n"
            "Treat equation balancing like weights on both sides of a scale.\n"
            "Translate each symbol to a concrete action before solving."
        ),
        "simple": (
            f"Simplified mode for: {prompt_short}.\n"
            "Use one core rule first and delay edge cases until one successful attempt.\n"
            "After one correct attempt, add one extra detail only."
        ),
        "selected": style,
    }


def build_hint_ladder(question_prompt: str, style: str, misconception: Dict[str, Any] | None, language: str = "en") -> List[str]:
    if language == "es":
        hints = [
            "Pista 1: Define qué te piden exactamente antes de operar.",
            "Pista 2: Escribe el paso intermedio y verifica signos.",
            "Pista 3: Sustituye tu resultado en la ecuación para comprobarlo.",
        ]
        if misconception:
            hints[1] = f"Pista 2: Corrige este patrón detectado ({misconception['label']}) y vuelve al paso intermedio."
        return hints

    hints = [
        "Hint 1: Restate the target in one short sentence before solving.",
        "Hint 2: Write one intermediate step and check sign handling.",
        "Hint 3: Plug your result back into the equation to verify.",
    ]
    if misconception:
        hints[1] = f"Hint 2: We detected a likely pattern ({misconception['label']}). Fix that pattern in your intermediate step."
    return hints


def grade_reasoning_steps(reasoning: str, skill: str, language: str = "en") -> List[Dict[str, Any]]:
    text = (reasoning or "").strip()
    if not text:
        if language == "es":
            return [
                {
                    "step": 1,
                    "status": "missing",
                    "label": "Escribe al menos 2 pasos para mostrar tu razonamiento.",
                    "score": 0.0,
                }
            ]
        return [
            {
                "step": 1,
                "status": "missing",
                "label": "Add at least 2 written steps so the tutor can diagnose your method.",
                "score": 0.0,
            }
        ]

    lines = [normalize(part) for part in re.split(r"[\n;]+", text) if normalize(part)]
    if not lines:
        lines = [normalize(text)]

    skill_templates = {
        "basics": [
            ("both roots", "both positive and negative roots"),
            ("check by substitution", "substitute each root back"),
        ],
        "factoring": [
            ("find multiply-add pair", "numbers multiply to constant and add to middle term"),
            ("expand to verify", "expand factors to verify original expression"),
        ],
        "graphing": [
            ("set y to zero", "set y=0 to find x-intercepts"),
            ("use symmetry", "include mirrored intercept or axis symmetry"),
        ],
        "applications": [
            ("factor then zero product", "factor model then set each factor equal to zero"),
            ("check sign conversion", "roots have opposite signs from factor form"),
        ],
    }
    templates = skill_templates.get(skill, skill_templates["basics"])

    feedback: List[Dict[str, Any]] = []
    for idx, (label_en, desc_en) in enumerate(templates, start=1):
        probe = f"{label_en} {desc_en}"
        best = 0.0
        for line in lines:
            best = max(best, semantic_similarity(line, probe))

        if best >= 0.58:
            status = "ok"
            label = (
                f"Paso {idx} sólido: {desc_en}."
                if language == "es"
                else f"Step {idx} looks solid: {desc_en}."
            )
        else:
            status = "missing"
            label = (
                f"Falta el paso {idx}: {desc_en}."
                if language == "es"
                else f"Step {idx} is missing: {desc_en}."
            )

        feedback.append(
            {
                "step": idx,
                "status": status,
                "label": label,
                "score": round(best, 4),
            }
        )

    return feedback


def build_tutor_reply(
    student_prompt: str,
    context_prompt: str,
    style: str,
    language: str = "en",
    misconception: Dict[str, Any] | None = None,
) -> Dict[str, Any]:
    student_prompt = student_prompt.strip()
    context_prompt = context_prompt.strip()
    root_prompt = context_prompt or student_prompt or "quadratic equation"
    explanations = generate_style_explanations(root_prompt, style, language)
    hints = build_hint_ladder(root_prompt, style, misconception, language)

    if language == "es":
        preface = (
            f"Pregunta del estudiante: {student_prompt}\n"
            f"Enfoque activo: {style}.\n"
            "Respuesta del tutor: identifica una regla clave, aplica un ejemplo corto y confirma con sustitución."
        )
        follow_up = "Pregunta de comprobación: ¿qué cambia y qué permanece igual cuando pasas de la ecuación a su forma factorizada?"
    else:
        preface = (
            f"Student prompt: {student_prompt}\n"
            f"Active mode: {style}.\n"
            "Tutor response: isolate one key rule, run one short example, and verify by substitution."
        )
        follow_up = "Check question: what changes and what stays invariant when you move from equation form to factored form?"

    return {
        "message": f"{preface}\n\n{explanations.get(style, explanations.get('step', ''))}",
        "hints": hints,
        "follow_up_question": follow_up,
    }


def choose_difficulty(skill_mastery: Dict[str, float], skill: str) -> str:
    value = float(skill_mastery.get(skill, 0.45))
    if value < 0.45:
        return "easy"
    if value < 0.75:
        return "medium"
    return "hard"


def generate_quadratic_question(skill: str, difficulty: str, language: str) -> Dict[str, Any]:
    qid = f"q-{uuid.uuid4().hex[:8]}"
    skill = skill or "basics"
    difficulty = difficulty or "medium"

    if skill == "basics":
        n = random.choice([3, 4, 5, 6, 7, 8, 9]) if difficulty != "hard" else random.choice([10, 11, 12])
        val = n * n
        prompt_en = f"Solve x^2 = {val}."
        prompt_es = f"Resuelve x^2 = {val}."
        accepted = [
            f"x={n} or x=-{n}",
            f"x=-{n} or x={n}",
            f"{n} or -{n}",
            f"-{n} or {n}",
            f"x=±{n}",
        ]
        misconceptions = [
            {
                "id": "missed_negative",
                "label": "Missed negative root",
                "patterns": [f"x={n}", f"{n}"],
                "feedback": "You kept one branch only. Square roots typically produce both positive and negative roots.",
            }
        ]
        hint_ladder = [
            "Set up both square-root branches (+ and -).",
            "Write both candidate values explicitly before finalizing.",
            "Substitute both values to verify the equation equals zero.",
        ]
        verification = {"type": "roots", "equation": f"x^2-{val}=0", "roots": [float(n), float(-n)]}
    elif skill == "factoring":
        a = random.choice([2, 3, 4, 5, 6])
        b = random.choice([3, 4, 5, 7])
        s = a + b
        p = a * b
        prompt_en = f"Factor x^2 + {s}x + {p}."
        prompt_es = f"Factoriza x^2 + {s}x + {p}."
        accepted = [
            f"(x+{a})(x+{b})",
            f"(x+{b})(x+{a})",
            f"(x + {a})(x + {b})",
            f"(x + {b})(x + {a})",
        ]
        misconceptions = [
            {
                "id": "factor_pair",
                "label": "Wrong factor pair",
                "patterns": [f"(x+1)(x+{p})", f"(x+2)(x+{max(2, p//2)})"],
                "feedback": "Your pair may multiply correctly but the middle-term sum does not match.",
            }
        ]
        hint_ladder = [
            "Find two numbers that multiply to the constant term.",
            "Check that the same two numbers also add to the x coefficient.",
            "Write both factors and expand quickly to confirm.",
        ]
        verification = {"type": "factoring", "equation": f"x^2+{s}*x+{p}=0", "roots": [float(-a), float(-b)]}
    elif skill == "graphing":
        r = random.choice([2, 3, 4, 5])
        prompt_en = f"For y = x^2 - {r*r}, where does the graph cross the x-axis?"
        prompt_es = f"Para y = x^2 - {r*r}, ¿dónde cruza la gráfica el eje x?"
        accepted = [
            f"x={r} and x=-{r}",
            f"x=-{r} and x={r}",
            f"{r} and -{r}",
            f"-{r} and {r}",
            f"x=±{r}",
            f"(-{r},0) and ({r},0)",
        ]
        misconceptions = [
            {
                "id": "missed_negative",
                "label": "Missed negative intercept",
                "patterns": [f"x={r}", f"{r}"],
                "feedback": "Good start. This parabola is symmetric, so include the mirrored intercept too.",
            }
        ]
        hint_ladder = [
            "Set y = 0 to find x-intercepts.",
            f"Solve x^2 = {r*r} using both square-root branches.",
            "Write intercepts in x-value form or coordinate form.",
        ]
        verification = {"type": "roots", "equation": f"x^2-{r*r}=0", "roots": [float(r), float(-r)]}
    else:
        # applications
        a = random.choice([2, 3, 4, 5])
        b = random.choice([3, 4, 6])
        s = a + b
        p = a * b
        prompt_en = f"A model gives A(t) = t^2 + {s}t + {p}. For A=0, what values of t solve it?"
        prompt_es = f"Un modelo da A(t) = t^2 + {s}t + {p}. Para A=0, ¿qué valores de t resuelven?"
        accepted = [
            f"t=-{a} and t=-{b}",
            f"t=-{b} and t=-{a}",
            f"-{a} and -{b}",
            f"-{b} and -{a}",
            f"t=-{a}, t=-{b}",
        ]
        misconceptions = [
            {
                "id": "factor_pair",
                "label": "Sign error in roots",
                "patterns": [f"t={a} and t={b}", f"{a} and {b}"],
                "feedback": "The signs are likely flipped when converting factors to roots.",
            }
        ]
        hint_ladder = [
            "Factor the quadratic first.",
            "Set each factor to zero and solve separately.",
            "Root signs are opposite to factor signs in (t + k).",
        ]
        verification = {"type": "roots", "equation": f"t^2+{s}*t+{p}=0", "roots": [float(-a), float(-b)]}

    prompt = prompt_es if language == "es" else prompt_en
    return {
        "id": qid,
        "skill": skill,
        "difficulty": difficulty,
        "prompt": prompt,
        "accepted": accepted,
        "misconceptions": misconceptions,
        "hint_ladder": hint_ladder,
        "verification": verification,
        "source": "ai-generated-template",
    }


def update_skill_mastery(current: Dict[str, float], skill: str, correct: bool, score: float) -> Dict[str, float]:
    result = dict(current or {})
    base = float(result.get(skill, 0.45))
    delta = 0.08 if correct else -0.06
    delta += (score - 0.5) * 0.05
    next_value = max(0.05, min(0.98, base + delta))
    result[skill] = round(next_value, 4)
    return result


def build_review_queue(skill_mastery: Dict[str, float], now_ts: float | None = None) -> List[Dict[str, Any]]:
    now = datetime.fromtimestamp(now_ts or time.time(), tz=timezone.utc)
    queue = []
    for skill, mastery in sorted(skill_mastery.items(), key=lambda kv: kv[1]):
        if mastery < 0.45:
            delay_min = 15
            priority = "high"
        elif mastery < 0.65:
            delay_min = 60
            priority = "medium"
        else:
            delay_min = 180
            priority = "low"
        queue.append(
            {
                "skill": skill,
                "mastery": round(float(mastery), 4),
                "priority": priority,
                "due_at": (now + timedelta(minutes=delay_min)).isoformat(),
            }
        )
    return queue


def cluster_events(events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    clusters: List[Dict[str, Any]] = []
    threshold = 0.74

    for ev in events:
        text = " | ".join(
            [
                str(ev.get("skill", "")),
                str(ev.get("misconception", "")),
                str(ev.get("answer", "")),
                str(ev.get("prompt", "")),
            ]
        )
        placed = False
        for cluster in clusters:
            sim = semantic_similarity(text, cluster["prototype"])
            if sim >= threshold:
                cluster["count"] += 1
                cluster["examples"].append(text)
                placed = True
                break
        if not placed:
            clusters.append(
                {
                    "prototype": text,
                    "count": 1,
                    "examples": [text],
                }
            )

    clusters.sort(key=lambda c: c["count"], reverse=True)
    output = []
    for idx, cluster in enumerate(clusters[:5], start=1):
        proto = cluster["prototype"]
        intervention = (
            "Run a short remediation set with step-by-step mode and require one reasoning line per step."
            if "factor" in proto.lower()
            else "Use visual mode and mirrored examples before returning to mixed practice."
        )
        output.append(
            {
                "cluster_id": f"cluster-{idx}",
                "count": cluster["count"],
                "prototype": proto[:180],
                "intervention": intervention,
            }
        )
    return output


def grade_response(payload: Dict[str, Any]) -> Dict[str, Any]:
    answer = str(payload.get("answer", ""))
    reasoning = str(payload.get("reasoning", ""))
    question = payload.get("question", {}) or {}
    accepted = question.get("accepted", []) or []
    style = payload.get("style", "step")
    language = payload.get("language", "en")
    skill = payload.get("skill", question.get("skill", "basics"))
    student_state = payload.get("student_state", {}) or {}

    best_text, best_score = best_match(answer, accepted)
    band = confidence_band(best_score)

    misconceptions = question.get("misconceptions", []) or []
    misconception = detect_misconception(answer, misconceptions)

    # Semantic reasoning bonus: if reasoning aligns with prompt, slight boost.
    reasoning_score = 0.0
    prompt = question.get("prompt", "")
    if reasoning:
        reasoning_score = semantic_similarity(reasoning, prompt)

    score = min(1.0, (best_score * 0.85) + (reasoning_score * 0.15))
    is_correct = score >= 0.78

    safety = {"verified": False, "note": "not-applicable"}
    verification = question.get("verification")
    if verification and verification.get("type") == "roots":
        safety = verify_roots_safety(
            verification.get("equation", ""),
            [float(v) for v in verification.get("roots", [])],
            answer,
        )
        if safety.get("verified"):
            is_correct = True
            score = max(score, 0.9)
        else:
            # Hard fail for root-set mismatches even if semantic score is high.
            hard_fail_notes = {
                "partial-root-set-detected",
                "detected-roots-valid-but-expected-set-mismatch",
                "at-least-one-detected-root-failed-substitution",
                "no-numeric-roots-detected",
            }
            if safety.get("note") in hard_fail_notes:
                is_correct = False
                score = min(score, 0.69)

    explanations = generate_style_explanations(prompt, style, language)
    hint_ladder = build_hint_ladder(prompt, style, misconception, language)
    step_feedback = grade_reasoning_steps(reasoning, skill, language)

    mastery_in = student_state.get("skill_mastery", {}) or {}
    mastery_out = update_skill_mastery(mastery_in, skill, is_correct, score)

    next_difficulty = choose_difficulty(mastery_out, skill)

    event = {
        "timestamp": time.time(),
        "skill": skill,
        "prompt": prompt,
        "answer": answer,
        "misconception": misconception.get("id") if misconception else "none",
        "correct": is_correct,
        "score": round(score, 4),
    }

    review_queue = build_review_queue(mastery_out, now_ts=time.time())

    if language == "es":
        if is_correct:
            feedback = "Buen avance. Tu respuesta es consistente y tu razonamiento va en buena dirección."
        else:
            feedback = "Vas cerca. Revisa un paso clave, usa la siguiente pista y vuelve a intentar."
    else:
        if is_correct:
            feedback = "Nice progress. Your answer is consistent, and your reasoning is on track."
        else:
            feedback = "You are close. Recheck one key step, use the next hint, and try again."

    return {
        "is_correct": is_correct,
        "score": round(score, 4),
        "match_score": round(best_score, 4),
        "reasoning_score": round(reasoning_score, 4),
        "confidence_band": band,
        "best_match": best_text,
        "misconception": misconception,
        "feedback": feedback,
        "hint_ladder": hint_ladder,
        "step_feedback": step_feedback,
        "explanations": explanations,
        "next_difficulty": next_difficulty,
        "skill_mastery": mastery_out,
        "review_queue": review_queue,
        "event": event,
        "safety": safety,
        "ai_engine": "sentence-transformers" if HAS_SENTENCE_TRANSFORMERS else "fallback-token-cosine",
    }


class LearnRouteHandler(BaseHTTPRequestHandler):
    server_version = "LearnRouteAI/1.0"

    def _set_headers(self, code: int = 200) -> None:
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Request-Private-Network")
        self.send_header("Access-Control-Allow-Private-Network", "true")
        self.send_header("Vary", "Origin, Access-Control-Request-Private-Network")
        self.end_headers()

    def _read_json(self) -> Dict[str, Any]:
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length) if length else b"{}"
        if not raw:
            return {}
        return json.loads(raw.decode("utf-8"))

    def _write(self, payload: Dict[str, Any], code: int = 200) -> None:
        self._set_headers(code)
        self.wfile.write(json.dumps(payload, ensure_ascii=False).encode("utf-8"))

    def _write_raw(self, body: bytes, content_type: str, code: int = 200) -> None:
        self.send_response(code)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def _serve_static(self, request_path: str) -> bool:
        rel = STATIC_ROUTE_MAP.get(request_path)
        if not rel:
            return False

        file_path = BASE_DIR / rel
        if not file_path.exists() or not file_path.is_file():
            self._write_raw(b"Not found", "text/plain; charset=utf-8", 404)
            return True

        body = file_path.read_bytes()
        content_type = CONTENT_TYPES.get(file_path.suffix.lower(), "application/octet-stream")
        self._write_raw(body, content_type, 200)
        return True

    def log_message(self, fmt: str, *args: Any) -> None:
        # Keep the console output short and useful.
        print("[learnroute-ai] " + (fmt % args))

    def do_OPTIONS(self) -> None:
        self._set_headers(204)

    def do_GET(self) -> None:
        request_path = urlparse(self.path).path

        if self._serve_static(request_path):
            return

        if request_path == "/health":
            self._write(
                {
                    "ok": True,
                    "engine": "sentence-transformers" if HAS_SENTENCE_TRANSFORMERS else "fallback-token-cosine",
                    "symbolic_verifier": HAS_SYMPY,
                    "server_time": time.time(),
                }
            )
            return

        self._write({"ok": False, "error": "not-found"}, 404)

    def do_POST(self) -> None:
        try:
            payload = self._read_json()
        except Exception as exc:
            self._write({"ok": False, "error": f"invalid-json:{exc}"}, 400)
            return

        request_path = urlparse(self.path).path

        try:
            if request_path == "/api/grade-response":
                result = grade_response(payload)
                self._write({"ok": True, **result})
                return

            if request_path == "/api/generate-question":
                skill = payload.get("skill", "basics")
                difficulty = payload.get("difficulty", "medium")
                language = payload.get("language", "en")
                question = generate_quadratic_question(skill, difficulty, language)
                self._write({"ok": True, "question": question})
                return

            if request_path == "/api/explain-modes":
                prompt = payload.get("prompt", "Quadratic concept")
                style = payload.get("style", "step")
                language = payload.get("language", "en")
                explanations = generate_style_explanations(prompt, style, language)
                self._write({"ok": True, "explanations": explanations})
                return

            if request_path == "/api/tutor-turn":
                student_prompt = payload.get("student_prompt", "")
                context_prompt = payload.get("context_prompt", "")
                style = payload.get("style", "step")
                language = payload.get("language", "en")
                misconception = payload.get("misconception")
                reply = build_tutor_reply(student_prompt, context_prompt, style, language, misconception)
                self._write({"ok": True, **reply})
                return

            if request_path == "/api/review-queue":
                mastery = payload.get("skill_mastery", {}) or {}
                queue = build_review_queue(mastery)
                self._write({"ok": True, "review_queue": queue})
                return

            if request_path == "/api/teacher-summary":
                events = payload.get("events", []) or []
                clusters = cluster_events(events)
                self._write({"ok": True, "clusters": clusters})
                return

            self._write({"ok": False, "error": "not-found"}, 404)
        except Exception as exc:
            self._write({"ok": False, "error": f"server-error:{exc}"}, 500)


def main() -> None:
    try:
        server = ThreadingHTTPServer((HOST, PORT), LearnRouteHandler)
    except OSError as exc:
        print(f"Failed to start backend on http://{HOST}:{PORT} ({exc})", flush=True)
        print("If another app is using this port, stop it or change PORT in this file.", flush=True)
        raise

    print(f"LearnRoute AI backend running at http://{HOST}:{PORT}/", flush=True)
    print(f"Frontend URL: http://{HOST}:{PORT}/", flush=True)
    print(f"Health URL: http://{HOST}:{PORT}/health", flush=True)
    print(
        "Engine:",
        "sentence-transformers" if HAS_SENTENCE_TRANSFORMERS else "fallback-token-cosine",
        "| symbolic verifier:",
        HAS_SYMPY,
        flush=True,
    )
    server.serve_forever()


if __name__ == "__main__":
    main()
