const API_BASE = window.location.protocol === "http:" || window.location.protocol === "https:" ? "" : "http://127.0.0.1:8008";
const IS_FILE_CONTEXT = window.location.protocol === "file:";
const BACKEND_POLL_INTERVAL_MS = 25000;
const STORAGE_KEY = "learnroute_session_v2";
const MASTERY_STREAK_REQUIRED = 2;
const STYLE_ORDER = ["step", "visual", "analogy", "simple"];
const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };
const FLOW_ORDER = ["setup", "lesson", "practice", "summary"];
const DEBUG_MODE = new URLSearchParams(window.location.search).get("debug") === "1";

const LANGUAGE_OPTIONS = {
  en: "English",
  es: "Español"
};

const UI_TEXT = {
  en: {
    title: "LearnRoute AI",
    subtitle: "One learner, one route: diagnostics, adaptive lessons, and instant feedback in one flow.",
    flowSetup: "Setup",
    flowLesson: "Lesson",
    flowPractice: "Practice",
    flowSummary: "Summary",
    tabLearn: "Learn",
    tabProgress: "Progress",
    backendStatusLabel: "AI Backend",
    backendChecking: "Checking...",
    backendOnline: "Online",
    backendOffline: "Learning service unavailable right now.",
    debugTitle: "Developer Debug",
    debugSubtitle: "Technical diagnostics are hidden from learners.",
    openViaBackendHint: "Open this app from http://127.0.0.1:8008/ after starting backend. Browser security can block file:// API calls.",
    setupTitle: "Student Setup",
    topicLabel: "Learning Topic",
    langLabel: "Language",
    styleLabel: "Preferred Style",
    modeGuideTitle: "Explanation Modes",
    modeStepTitle: "Step-by-step:",
    modeStepDesc: "Break the problem into ordered steps and validate each one.",
    modeVisualTitle: "Visual:",
    modeVisualDesc: "Convert equations into shape, symmetry, and graph structure.",
    modeAnalogyTitle: "Analogy:",
    modeAnalogyDesc: "Map abstract symbols to concrete, familiar scenarios.",
    modeSimpleTitle: "Simplified:",
    modeSimpleDesc: "Strip to one core rule first, then add complexity gradually.",
    startDiagnostic: "Start 3-Question Diagnostic",
    diagnosticTitle: "Baseline Diagnostic",
    confidenceLabel: "Confidence: {value}/5",
    practiceConfidenceLabel: "Practice Confidence: {value}/5",
    nextQuestion: "Next Question",
    finishDiagnostic: "Finish Diagnostic",
    lessonTitle: "Adaptive Lesson",
    explainDifferently: "Explain It Differently",
    startPractice: "Start Practice",
    practiceTitle: "AI Practice + Feedback",
    answerPlaceholder: "Type your answer",
    reasoningLabel: "Reasoning (optional but recommended)",
    reasoningPlaceholder: "Show your steps or explain your logic.",
    submitAnswer: "Submit",
    showHint: "Hint",
    nextAiQuestion: "Next AI Question",
    hintLadderTitle: "Hint Ladder",
    nextHint: "Reveal Next Hint",
    stepFeedbackTitle: "Step Feedback",
    pathTitle: "Learning Path Dashboard",
    masteryTitle: "Knowledge State",
    reviewTitle: "Spaced Review Queue",
    reviewNow: "Review Now",
    reviewNowNone: "No review item available yet.",
    reviewNowDone: "Jumped to review target: {node}.",
    attemptHistoryTitle: "Attempt History",
    noAttempts: "No attempts yet.",
    sessionSummaryTitle: "Session Summary",
    summaryStrengthsTitle: "Strengths",
    summaryMisconceptionsTitle: "Common Misconceptions",
    summaryNextActionsTitle: "Next Actions",
    summaryNoData: "Complete diagnostic and practice to generate your summary.",
    summaryCalibration: "Confidence calibration error: {value}",
    teacherTitle: "Teacher Dashboard (Lite)",
    teacherClustersTitle: "Error Clusters",
    metricAccuracy: "Diagnostic Accuracy",
    metricTime: "Avg Response Time",
    metricConfidence: "Avg Confidence",
    metricCurrentNode: "Current Mastery Node",
    commonMistakes: "Common Mistakes",
    semanticScore: "Semantic Match",
    reasoningScore: "Reasoning Match",
    confidenceBand: "Confidence Band",
    safetyCheck: "Safety Check",
    metaSkill: "Skill",
    metaDifficulty: "Difficulty",
    metaSource: "Source",
    metaEngine: "Engine",
    tutorTitle: "Free-Response Tutor",
    tutorSubtitle: "Ask for another explanation in your selected mode.",
    tutorPromptLabel: "Your question",
    tutorPromptPlaceholder: "I still do not get why both positive and negative roots matter.",
    askTutor: "Ask Tutor",
    chooseTopic: "Choose a topic",
    styleStep: "Step-by-step",
    styleVisual: "Visual",
    styleAnalogy: "Analogy",
    styleSimple: "Simplified",
    qCounter: "Question {current}/{total}",
    timeLabel: "Time",
    pathDone: "Mastered",
    pathUnlocked: "In Progress",
    pathLocked: "Locked",
    profileLevel: "Level: {level}",
    profileScore: "Mastery Score: {score}",
    profileNode: "Start Node: {node}",
    profileLanguage: "Language: {language}",
    profileStreak: "Streak Needed: {value} correct",
    levelBeginner: "Beginner",
    levelIntermediate: "Intermediate",
    levelAdvanced: "Advanced",
    progressFormat: "{done}/{total} nodes mastered",
    pickTopicPrompt: "Select a topic to begin.",
    feedbackSelectOption: "Pick an option before continuing.",
    feedbackNeedAnswer: "Type an answer first.",
    feedbackCorrect: "Nice work. You are building steady mastery.",
    feedbackFinal: "All nodes mastered. This learner finished the route.",
    feedbackWrongGeneric: "You are close. Focus on one step, use the next hint, and try again.",
    feedbackUnlocked: "Unlocked next node: {node}.",
    diagnosticComplete: "Diagnostic complete. Route generated.",
    noMistakes: "No repeated mistakes yet.",
    noReviewItems: "No review items yet.",
    noClusters: "No clusters yet.",
    pathCurrent: "Current Node",
    allDone: "Route complete. Start a new run to continue practicing.",
    styleShifted: "Explanation style switched to {style}.",
    loadingLesson: "Generating lesson explanation...",
    loadingQuestion: "Generating next AI question...",
    confirmTopicReset: "Switching topic will clear your current progress. Continue?",
    confirmLanguageSwitch: "Switching language will regenerate your current question. Continue?",
    confirmLanguageDraft: "You have an unfinished answer. Switching language will replace this question and clear your draft. Continue?",
    calibrationExcellent: "excellent",
    calibrationGood: "good",
    calibrationNeedsWork: "needs work",
    sessionNextMastery: "Practice {node} until you reach a consistent streak.",
    sessionNextMisconception: "Run a focused retry set for: {label}.",
    sessionNextReview: "Use Review Now for the highest-priority due skill."
  },
  es: {
    title: "LearnRoute AI",
    flowSetup: "Inicio",
    flowLesson: "Leccion",
    flowPractice: "Practica",
    flowSummary: "Resumen",
    tabLearn: "Aprender",
    tabProgress: "Progreso",
    subtitle: "Un estudiante, una ruta: diagnóstico, lecciones adaptativas y retroalimentación instantánea.",
    backendStatusLabel: "Backend de IA",
    debugTitle: "Depuracion",
    debugSubtitle: "Los detalles tecnicos se ocultan para estudiantes.",
    backendChecking: "Verificando...",
    backendOnline: "En línea",
    backendOffline: "Servicio de aprendizaje no disponible ahora.",
    openViaBackendHint: "Abre esta app desde http://127.0.0.1:8008/ después de iniciar el backend. La seguridad del navegador puede bloquear llamadas API desde file://.",
    setupTitle: "Configuración del Estudiante",
    topicLabel: "Tema de aprendizaje",
    langLabel: "Idioma",
    styleLabel: "Estilo preferido",
    modeGuideTitle: "Modos de explicación",
    modeStepTitle: "Paso a paso:",
    modeStepDesc: "Divide el problema en pasos ordenados y valida cada uno.",
    modeVisualTitle: "Visual:",
    modeVisualDesc: "Convierte ecuaciones en forma, simetría y estructura de gráfica.",
    modeAnalogyTitle: "Analogía:",
    modeAnalogyDesc: "Conecta símbolos abstractos con situaciones concretas y familiares.",
    modeSimpleTitle: "Simplificado:",
    modeSimpleDesc: "Quédate con una regla central primero y añade complejidad gradualmente.",
    startDiagnostic: "Iniciar diagnóstico de 3 preguntas",
    diagnosticTitle: "Diagnóstico Base",
    confidenceLabel: "Confianza: {value}/5",
    practiceConfidenceLabel: "Confianza en práctica: {value}/5",
    nextQuestion: "Siguiente pregunta",
    finishDiagnostic: "Finalizar diagnóstico",
    lessonTitle: "Lección Adaptativa",
    explainDifferently: "Explícalo diferente",
    startPractice: "Iniciar práctica",
    practiceTitle: "Práctica con IA + Retroalimentación",
    answerPlaceholder: "Escribe tu respuesta",
    reasoningLabel: "Razonamiento (opcional, pero recomendado)",
    reasoningPlaceholder: "Muestra tus pasos o explica tu lógica.",
    submitAnswer: "Enviar",
    showHint: "Pista",
    nextAiQuestion: "Siguiente pregunta IA",
    hintLadderTitle: "Escalera de pistas",
    nextHint: "Mostrar siguiente pista",
    stepFeedbackTitle: "Retroalimentación por pasos",
    pathTitle: "Ruta de aprendizaje",
    masteryTitle: "Estado de conocimiento",
    reviewTitle: "Cola de repaso espaciado",
    reviewNow: "Repasar ahora",
    reviewNowNone: "Todavía no hay elementos de repaso.",
    reviewNowDone: "Salto al objetivo de repaso: {node}.",
    attemptHistoryTitle: "Historial de intentos",
    noAttempts: "Aún no hay intentos.",
    sessionSummaryTitle: "Resumen de la sesión",
    summaryStrengthsTitle: "Fortalezas",
    summaryMisconceptionsTitle: "Errores frecuentes",
    summaryNextActionsTitle: "Próximas acciones",
    summaryNoData: "Completa diagnóstico y práctica para generar tu resumen.",
    summaryCalibration: "Error de calibración de confianza: {value}",
    teacherTitle: "Panel Docente (Lite)",
    teacherClustersTitle: "Clústeres de error",
    metricAccuracy: "Precisión del diagnóstico",
    metricTime: "Tiempo promedio",
    metricConfidence: "Confianza promedio",
    metricCurrentNode: "Nodo actual de dominio",
    commonMistakes: "Errores comunes",
    semanticScore: "Coincidencia semántica",
    reasoningScore: "Coincidencia de razonamiento",
    confidenceBand: "Banda de confianza",
    safetyCheck: "Verificación de seguridad",
    metaSkill: "Habilidad",
    metaDifficulty: "Dificultad",
    metaSource: "Fuente",
    metaEngine: "Motor",
    tutorTitle: "Tutor de respuesta libre",
    tutorSubtitle: "Pide otra explicación en tu modo seleccionado.",
    tutorPromptLabel: "Tu pregunta",
    tutorPromptPlaceholder: "Aún no entiendo por qué importan las raíces positiva y negativa.",
    askTutor: "Preguntar al tutor",
    chooseTopic: "Elige un tema",
    styleStep: "Paso a paso",
    styleVisual: "Visual",
    styleAnalogy: "Analogía",
    styleSimple: "Simplificado",
    qCounter: "Pregunta {current}/{total}",
    timeLabel: "Tiempo",
    pathDone: "Dominado",
    pathUnlocked: "En progreso",
    pathLocked: "Bloqueado",
    profileLevel: "Nivel: {level}",
    profileScore: "Puntaje de dominio: {score}",
    profileNode: "Nodo inicial: {node}",
    profileLanguage: "Idioma: {language}",
    profileStreak: "Racha requerida: {value} correctas",
    levelBeginner: "Inicial",
    levelIntermediate: "Intermedio",
    levelAdvanced: "Avanzado",
    progressFormat: "{done}/{total} nodos dominados",
    pickTopicPrompt: "Selecciona un tema para comenzar.",
    feedbackSelectOption: "Selecciona una opción antes de continuar.",
    feedbackNeedAnswer: "Escribe una respuesta primero.",
    feedbackCorrect: "Buena respuesta. Tu dominio va mejorando.",
    feedbackFinal: "Todos los nodos están dominados. Ruta completada.",
    feedbackWrongGeneric: "Vas por buen camino. Enfoca un paso clave, usa la siguiente pista y vuelve a intentar.",
    feedbackUnlocked: "Nuevo nodo desbloqueado: {node}.",
    diagnosticComplete: "Diagnóstico completado. Ruta generada.",
    noMistakes: "Aún no hay errores repetidos.",
    noReviewItems: "Aún no hay elementos de repaso.",
    noClusters: "Aún no hay clústeres.",
    pathCurrent: "Nodo actual",
    allDone: "Ruta completa. Inicia otra ejecución para seguir practicando.",
    styleShifted: "El estilo cambió a {style}.",
    loadingLesson: "Generando explicación de la lección...",
    loadingQuestion: "Generando la siguiente pregunta IA...",
    confirmTopicReset: "Cambiar de tema borrará el progreso actual. ¿Continuar?",
    confirmLanguageSwitch: "Cambiar idioma regenerará la pregunta actual. ¿Continuar?",
    confirmLanguageDraft: "Tienes una respuesta sin terminar. Cambiar idioma reemplazará la pregunta y borrará tu borrador. ¿Continuar?",
    calibrationExcellent: "excelente",
    calibrationGood: "buena",
    calibrationNeedsWork: "mejorable",
    sessionNextMastery: "Practica {node} hasta lograr una racha consistente.",
    sessionNextMisconception: "Haz una práctica enfocada para: {label}.",
    sessionNextReview: "Usa Repasar ahora en la habilidad de mayor prioridad."
  }
};

const STYLE_LABEL_KEYS = {
  step: "styleStep",
  visual: "styleVisual",
  analogy: "styleAnalogy",
  simple: "styleSimple"
};

const STYLE_FRAMES = {
  step: {
    en: "Step-by-step mode:\n1) Extract known values.\n2) Apply one operation at a time.\n3) Validate by substitution.\n4) State why each step is valid.",
    es: "Modo paso a paso:\n1) Extrae los datos conocidos.\n2) Aplica una operación por vez.\n3) Verifica por sustitución.\n4) Explica por qué cada paso es válido."
  },
  visual: {
    en: "Visual mode:\nSketch the parabola, mark axis of symmetry, and identify intercepts.\nUse geometry and symmetry before arithmetic.",
    es: "Modo visual:\nDibuja la parábola, marca el eje de simetría e identifica intersecciones.\nUsa geometría y simetría antes de la aritmética."
  },
  analogy: {
    en: "Analogy mode:\nTreat balancing an equation like balancing weight on a scale.\nEvery operation must preserve balance on both sides.",
    es: "Modo analogía:\nTrata el equilibrio de una ecuación como una balanza.\nCada operación debe conservar el equilibrio en ambos lados."
  },
  simple: {
    en: "Simplified mode:\nKeep one core rule in focus, solve the simplest version first, then add details.",
    es: "Modo simplificado:\nConcéntrate en una regla central, resuelve la versión más simple y luego agrega detalles."
  }
};

const MISTAKE_LABELS = {
  missed_negative: {
    en: "Missed negative root",
    es: "Olvido de raíz negativa"
  },
  factor_pair: {
    en: "Wrong factor pair",
    es: "Par de factores incorrecto"
  }
};

const TOPICS = {
  quadratics: {
    label: {
      en: "Quadratic Equations",
      es: "Ecuaciones Cuadráticas"
    },
    nodes: [
      { id: "basics", label: { en: "Basics", es: "Fundamentos" } },
      { id: "factoring", label: { en: "Factoring", es: "Factorización" } },
      { id: "graphing", label: { en: "Graphing", es: "Graficación" } },
      { id: "applications", label: { en: "Applications", es: "Aplicaciones" } }
    ],
    concepts: {
      basics: {
        en: "A quadratic equation has degree two. Solving means finding all values that make the expression equal zero.",
        es: "Una ecuación cuadrática tiene grado dos. Resolverla significa hallar todos los valores que hacen la expresión igual a cero."
      },
      factoring: {
        en: "Factoring rewrites one expression as multiplied factors. Roots become visible from zero-product logic.",
        es: "La factorización reescribe una expresión como factores multiplicados. Las raíces se hacen visibles con la lógica de producto cero."
      },
      graphing: {
        en: "Graphing reveals intercepts, axis of symmetry, and the vertex, which gives a fast structural understanding.",
        es: "La gráfica revela intersecciones, eje de simetría y vértice, lo que da una comprensión estructural rápida."
      },
      applications: {
        en: "Applications connect quadratics to area, motion, and optimization where peak or minimum values matter.",
        es: "Las aplicaciones conectan cuadráticas con área, movimiento y optimización donde importan valores máximos o mínimos."
      }
    },
    diagnostic: [
      {
        skill: "basics",
        prompt: {
          en: "If x^2 = 9, what values can x have?",
          es: "Si x^2 = 9, ¿qué valores puede tener x?"
        },
        options: [
          { id: "a", label: { en: "x = 3 only", es: "Solo x = 3" } },
          { id: "b", label: { en: "x = 3 or x = -3", es: "x = 3 o x = -3" } },
          { id: "c", label: { en: "x = 9", es: "x = 9" } }
        ],
        correct: "b"
      },
      {
        skill: "factoring",
        prompt: {
          en: "Which is the factorization of x^2 + 5x + 6?",
          es: "¿Cuál es la factorización de x^2 + 5x + 6?"
        },
        options: [
          { id: "a", label: { en: "(x + 2)(x + 3)", es: "(x + 2)(x + 3)" } },
          { id: "b", label: { en: "(x + 1)(x + 6)", es: "(x + 1)(x + 6)" } },
          { id: "c", label: { en: "(x + 4)(x + 2)", es: "(x + 4)(x + 2)" } }
        ],
        correct: "a"
      },
      {
        skill: "graphing",
        prompt: {
          en: "For y = (x - 2)^2 + 1, where is the vertex?",
          es: "Para y = (x - 2)^2 + 1, ¿dónde está el vértice?"
        },
        options: [
          { id: "a", label: { en: "(0, 1)", es: "(0, 1)" } },
          { id: "b", label: { en: "(2, 1)", es: "(2, 1)" } },
          { id: "c", label: { en: "(2, -1)", es: "(2, -1)" } }
        ],
        correct: "b"
      }
    ],
  }
};

const state = {
  language: "en",
  topicId: "quadratics",
  preferredStyle: "step",
  activeStyle: "step",
  backend: {
    online: false,
    engine: "-"
  },
  diagnostic: {
    currentIndex: 0,
    responses: [],
    questionStart: 0,
    timerId: null
  },
  profile: null,
  pathStatuses: [],
  currentNodeIndex: 0,
  nodeCorrect: {},
  nodeWrong: {},
  nodeStreak: {},
  mistakes: {},
  practiceVisible: false,
  routeComplete: false,
  currentQuestion: null,
  hintLadder: [],
  hintIndex: 0,
  stepFeedback: [],
  skillMastery: {},
  reviewQueue: [],
  events: [],
  clusters: [],
  lastMisconception: null,
  practiceConfidence: 3,
  confidenceLog: [],
  attemptHistory: [],
  attemptsByQuestion: {},
  requestSerial: {
    question: 0,
    grade: 0,
    lesson: 0,
    diagnostic: 0
  },
  inFlight: {
    question: false,
    grade: false,
    lesson: false,
    tutor: false,
    diagnostic: false
  },
  ui: {
    activeTab: "learn",
    flowStage: "setup",
    devMode: DEBUG_MODE
  }
};

let backendPollTimer = null;
let persistTimer = null;

const el = {
  learnTabBtn: document.getElementById("learnTabBtn"),
  progressTabBtn: document.getElementById("progressTabBtn"),
  learnTab: document.getElementById("learnTab"),
  progressTab: document.getElementById("progressTab"),
  flowStepper: document.getElementById("flowStepper"),
  setupCard: document.getElementById("setupCard"),
  topicSelect: document.getElementById("topicSelect"),
  languageSelect: document.getElementById("languageSelect"),
  styleSelect: document.getElementById("styleSelect"),
  startDiagnosticBtn: document.getElementById("startDiagnosticBtn"),
  backendStatusChip: document.getElementById("backendStatusChip"),
  diagnosticCard: document.getElementById("diagnosticCard"),
  diagProgress: document.getElementById("diagProgress"),
  diagTimer: document.getElementById("diagTimer"),
  diagQuestionText: document.getElementById("diagQuestionText"),
  diagOptions: document.getElementById("diagOptions"),
  confidenceRange: document.getElementById("confidenceRange"),
  confidenceLabel: document.getElementById("confidenceLabel"),
  nextDiagnosticBtn: document.getElementById("nextDiagnosticBtn"),
  lessonCard: document.getElementById("lessonCard"),
  lessonNodeTitle: document.getElementById("lessonNodeTitle"),
  lessonBody: document.getElementById("lessonBody"),
  explainDifferentlyBtn: document.getElementById("explainDifferentlyBtn"),
  startPracticeBtn: document.getElementById("startPracticeBtn"),
  practiceCard: document.getElementById("practiceCard"),
  practicePrompt: document.getElementById("practicePrompt"),
  questionMetaChips: document.getElementById("questionMetaChips"),
  practiceInput: document.getElementById("practiceInput"),
  practiceConfidenceRange: document.getElementById("practiceConfidenceRange"),
  practiceConfidenceLabel: document.getElementById("practiceConfidenceLabel"),
  reasoningInput: document.getElementById("reasoningInput"),
  submitPracticeBtn: document.getElementById("submitPracticeBtn"),
  hintBtn: document.getElementById("hintBtn"),
  nextQuestionBtn: document.getElementById("nextQuestionBtn"),
  hintLadderBox: document.getElementById("hintLadderBox"),
  hintList: document.getElementById("hintList"),
  stepFeedbackBox: document.getElementById("stepFeedbackBox"),
  stepFeedbackList: document.getElementById("stepFeedbackList"),
  feedbackBox: document.getElementById("feedbackBox"),
  semanticScoreValue: document.getElementById("semanticScoreValue"),
  reasoningScoreValue: document.getElementById("reasoningScoreValue"),
  confidenceBandValue: document.getElementById("confidenceBandValue"),
  safetyCheckValue: document.getElementById("safetyCheckValue"),
  debugCard: document.getElementById("debugCard"),
  debugEngineValue: document.getElementById("debugEngineValue"),
  tutorCard: document.getElementById("tutorCard"),
  tutorPromptInput: document.getElementById("tutorPromptInput"),
  askTutorBtn: document.getElementById("askTutorBtn"),
  tutorResponse: document.getElementById("tutorResponse"),
  pathTopic: document.getElementById("pathTopic"),
  pathList: document.getElementById("pathList"),
  progressBar: document.getElementById("progressBar"),
  progressLabel: document.getElementById("progressLabel"),
  profileChips: document.getElementById("profileChips"),
  masteryBars: document.getElementById("masteryBars"),
  reviewQueue: document.getElementById("reviewQueue"),
  reviewNowBtn: document.getElementById("reviewNowBtn"),
  reviewCard: document.getElementById("reviewCard"),
  attemptHistoryCard: document.getElementById("attemptHistoryCard"),
  sessionSummaryCard: document.getElementById("sessionSummaryCard"),
  teacherCard: document.getElementById("teacherCard"),
  attemptHistoryList: document.getElementById("attemptHistoryList"),
  summaryCalibration: document.getElementById("summaryCalibration"),
  summaryStrengthsList: document.getElementById("summaryStrengthsList"),
  summaryMisconceptionsList: document.getElementById("summaryMisconceptionsList"),
  summaryNextActionsList: document.getElementById("summaryNextActionsList"),
  metricAccuracy: document.getElementById("metricAccuracy"),
  metricTime: document.getElementById("metricTime"),
  metricConfidence: document.getElementById("metricConfidence"),
  metricNode: document.getElementById("metricNode"),
  mistakeBars: document.getElementById("mistakeBars"),
  teacherClusters: document.getElementById("teacherClusters")
};

function t(key, vars = {}) {
  const langPack = UI_TEXT[state.language] || UI_TEXT.en;
  let text = langPack[key] ?? UI_TEXT.en[key] ?? key;
  Object.keys(vars).forEach((name) => {
    text = text.replace(`{${name}}`, String(vars[name]));
  });
  return text;
}

function loc(value) {
  if (!value) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  return value[state.language] ?? value.en ?? "";
}

function getStyleLabel(style) {
  return t(STYLE_LABEL_KEYS[style] || STYLE_LABEL_KEYS.step);
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}+\-=±., ]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function currentTopic() {
  return TOPICS[state.topicId];
}

function currentNode() {
  const topic = currentTopic();
  if (!topic) {
    return null;
  }
  return topic.nodes[state.currentNodeIndex] || null;
}

function skillLabel(skillId) {
  const topic = currentTopic();
  if (!topic) {
    return skillId;
  }
  const node = topic.nodes.find((item) => item.id === skillId);
  return node ? loc(node.label) : skillId;
}

function safeJsonParse(raw) {
  try {
    return JSON.parse(raw);
  } catch (_err) {
    return null;
  }
}

function getPersistableSnapshot() {
  return {
    version: 2,
    language: state.language,
    topicId: state.topicId,
    preferredStyle: state.preferredStyle,
    activeStyle: state.activeStyle,
    profile: state.profile,
    pathStatuses: state.pathStatuses,
    currentNodeIndex: state.currentNodeIndex,
    nodeCorrect: state.nodeCorrect,
    nodeWrong: state.nodeWrong,
    nodeStreak: state.nodeStreak,
    mistakes: state.mistakes,
    routeComplete: state.routeComplete,
    currentQuestion: state.currentQuestion,
    hintLadder: state.hintLadder,
    hintIndex: state.hintIndex,
    stepFeedback: state.stepFeedback,
    skillMastery: state.skillMastery,
    reviewQueue: state.reviewQueue,
    events: state.events,
    clusters: state.clusters,
    lastMisconception: state.lastMisconception,
    practiceVisible: state.practiceVisible,
    attemptHistory: state.attemptHistory,
    attemptsByQuestion: state.attemptsByQuestion,
    confidenceLog: state.confidenceLog,
    ui: {
      activeTab: state.ui.activeTab,
      flowStage: state.ui.flowStage
    }
  };
}

function persistSession() {
  const snapshot = getPersistableSnapshot();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (_err) {
    // Ignore storage failures silently.
  }
}

function queuePersist() {
  if (persistTimer) {
    clearTimeout(persistTimer);
  }
  persistTimer = window.setTimeout(() => {
    persistSession();
  }, 120);
}

function loadPersistedSession() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const saved = safeJsonParse(raw);
  if (!saved || saved.version !== 2) {
    return;
  }
  if (saved.language && LANGUAGE_OPTIONS[saved.language]) {
    state.language = saved.language;
  }
  if (typeof saved.topicId === "string" && (saved.topicId === "" || TOPICS[saved.topicId])) {
    state.topicId = saved.topicId;
  }
  if (saved.preferredStyle && STYLE_ORDER.includes(saved.preferredStyle)) {
    state.preferredStyle = saved.preferredStyle;
  }
  if (saved.activeStyle && STYLE_ORDER.includes(saved.activeStyle)) {
    state.activeStyle = saved.activeStyle;
  }
  state.profile = saved.profile || null;
  state.pathStatuses = Array.isArray(saved.pathStatuses) ? saved.pathStatuses : [];
  state.currentNodeIndex = Number.isFinite(saved.currentNodeIndex) ? saved.currentNodeIndex : 0;
  state.nodeCorrect = saved.nodeCorrect || {};
  state.nodeWrong = saved.nodeWrong || {};
  state.nodeStreak = saved.nodeStreak || {};
  state.mistakes = saved.mistakes || {};
  state.routeComplete = Boolean(saved.routeComplete);
  state.currentQuestion = saved.currentQuestion || null;
  state.hintLadder = Array.isArray(saved.hintLadder) ? saved.hintLadder : [];
  state.hintIndex = Number.isFinite(saved.hintIndex) ? saved.hintIndex : 0;
  state.stepFeedback = Array.isArray(saved.stepFeedback) ? saved.stepFeedback : [];
  state.skillMastery = saved.skillMastery || {};
  state.reviewQueue = Array.isArray(saved.reviewQueue) ? saved.reviewQueue : [];
  state.events = Array.isArray(saved.events) ? saved.events : [];
  state.clusters = Array.isArray(saved.clusters) ? saved.clusters : [];
  state.lastMisconception = saved.lastMisconception || null;
  state.practiceVisible = Boolean(saved.practiceVisible);
  state.attemptHistory = Array.isArray(saved.attemptHistory) ? saved.attemptHistory : [];
  state.attemptsByQuestion = saved.attemptsByQuestion || {};
  state.confidenceLog = Array.isArray(saved.confidenceLog) ? saved.confidenceLog : [];
  if (saved.ui && typeof saved.ui === "object") {
    if (saved.ui.activeTab === "learn" || saved.ui.activeTab === "progress") {
      state.ui.activeTab = saved.ui.activeTab;
    }
    if (FLOW_ORDER.includes(saved.ui.flowStage)) {
      state.ui.flowStage = saved.ui.flowStage;
    }
  }
}

function setFeedback(text, tone = "") {
  el.feedbackBox.textContent = text;
  el.feedbackBox.classList.remove("good", "bad");
  if (tone) {
    el.feedbackBox.classList.add(tone);
  }
}

function clearTimer() {
  if (state.diagnostic.timerId) {
    clearInterval(state.diagnostic.timerId);
    state.diagnostic.timerId = null;
  }
}

function refreshConfidenceLabel() {
  el.confidenceLabel.textContent = t("confidenceLabel", { value: el.confidenceRange.value });
}

function refreshPracticeConfidenceLabel() {
  el.practiceConfidenceLabel.textContent = t("practiceConfidenceLabel", { value: el.practiceConfidenceRange.value });
}

function populateLanguageSelect() {
  const previous = state.language;
  el.languageSelect.innerHTML = "";
  Object.entries(LANGUAGE_OPTIONS).forEach(([code, label]) => {
    const opt = document.createElement("option");
    opt.value = code;
    opt.textContent = label;
    el.languageSelect.appendChild(opt);
  });
  el.languageSelect.value = previous;
}

function populateStyleSelect() {
  const previous = state.activeStyle;
  el.styleSelect.innerHTML = "";
  STYLE_ORDER.forEach((style) => {
    const opt = document.createElement("option");
    opt.value = style;
    opt.textContent = getStyleLabel(style);
    el.styleSelect.appendChild(opt);
  });
  el.styleSelect.value = previous;
}

function populateTopicSelect() {
  const previous = state.topicId;
  el.topicSelect.innerHTML = "";
  const defaultOpt = document.createElement("option");
  defaultOpt.value = "";
  defaultOpt.textContent = t("chooseTopic");
  el.topicSelect.appendChild(defaultOpt);

  Object.entries(TOPICS).forEach(([id, topic]) => {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = loc(topic.label);
    el.topicSelect.appendChild(opt);
  });

  if (previous === "") {
    el.topicSelect.value = "";
  } else if (previous && TOPICS[previous]) {
    el.topicSelect.value = previous;
  } else {
    el.topicSelect.value = "quadratics";
  }
  state.topicId = el.topicSelect.value;
}

function setActiveTab(tab, { persist = false } = {}) {
  state.ui.activeTab = tab === "progress" ? "progress" : "learn";
  el.learnTabBtn.classList.toggle("active", state.ui.activeTab === "learn");
  el.progressTabBtn.classList.toggle("active", state.ui.activeTab === "progress");
  el.learnTab.classList.toggle("hidden", state.ui.activeTab !== "learn");
  el.progressTab.classList.toggle("hidden", state.ui.activeTab !== "progress");
  if (persist) {
    queuePersist();
  }
}

function inferFlowStage() {
  if (state.routeComplete) {
    return "summary";
  }
  if (state.practiceVisible) {
    return "practice";
  }
  if (state.profile) {
    return "lesson";
  }
  return "setup";
}

function renderFlowStepper() {
  if (!el.flowStepper) {
    return;
  }
  const activeStage = state.ui.flowStage || inferFlowStage();
  const activeIndex = FLOW_ORDER.indexOf(activeStage);
  const items = el.flowStepper.querySelectorAll("[data-flow-step]");
  items.forEach((item) => {
    const step = item.getAttribute("data-flow-step");
    const idx = FLOW_ORDER.indexOf(step);
    item.classList.remove("done", "active");
    if (idx < activeIndex) {
      item.classList.add("done");
    } else if (idx === activeIndex) {
      item.classList.add("active");
    }
  });
}

function applyFlowStageVisibility() {
  const stage = state.ui.flowStage || inferFlowStage();
  state.ui.flowStage = stage;

  if (el.diagnosticCard) {
    el.diagnosticCard.classList.toggle("stage-hidden", stage !== "setup");
  }
  if (el.lessonCard) {
    el.lessonCard.classList.toggle("stage-hidden", stage !== "lesson" && stage !== "practice");
  }
  if (el.practiceCard) {
    el.practiceCard.classList.toggle("stage-hidden", stage !== "practice");
  }
  if (el.tutorCard) {
    el.tutorCard.classList.toggle("stage-hidden", stage !== "practice");
  }
  if (el.sessionSummaryCard) {
    const canShowSummary = Boolean(state.attemptHistory.length || state.routeComplete);
    el.sessionSummaryCard.classList.toggle("hidden", !canShowSummary);
    el.sessionSummaryCard.classList.toggle("stage-hidden", stage !== "summary" || !canShowSummary);
  }
  renderFlowStepper();
}

function setFlowStage(stage, { persist = false } = {}) {
  state.ui.flowStage = FLOW_ORDER.includes(stage) ? stage : inferFlowStage();
  applyFlowStageVisibility();
  if (persist) {
    queuePersist();
  }
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.getAttribute("data-i18n");
    node.textContent = t(key);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    const key = node.getAttribute("data-i18n-placeholder");
    node.setAttribute("placeholder", t(key));
  });

  populateLanguageSelect();
  populateTopicSelect();
  populateStyleSelect();
  refreshConfidenceLabel();
  refreshPracticeConfidenceLabel();
  renderProfileChips();
  renderPath();
  renderMastery();
  renderReviewQueue();
  renderAttemptHistory();
  renderSessionSummary();
  renderTeacherMetrics();
  renderClusters();
  updateDashboardCardVisibility();
  if (el.debugCard) {
    el.debugCard.classList.toggle("hidden", !state.ui.devMode);
  }
  if (el.debugEngineValue) {
    el.debugEngineValue.textContent = state.backend.engine || "-";
  }
  setActiveTab(state.ui.activeTab);
  applyFlowStageVisibility();
}

function setBackendStatus(online, engine = "-") {
  state.backend.online = Boolean(online);
  state.backend.engine = engine || "-";
  if (el.debugEngineValue) {
    el.debugEngineValue.textContent = state.backend.engine || "-";
  }
  el.backendStatusChip.classList.remove("online", "offline");
  if (online) {
    el.backendStatusChip.classList.add("online");
    el.backendStatusChip.textContent = t("backendOnline");
  } else {
    el.backendStatusChip.classList.add("offline");
    el.backendStatusChip.textContent = t("backendOffline");
  }
  updateActionLocks();
}

function markBackendReachable() {
  const engine = state.backend.engine && state.backend.engine !== "-" ? state.backend.engine : "reachable";
  if (!state.backend.online) {
    setBackendStatus(true, engine);
  }
}

function updateActionLocks() {
  const busyQuestion = state.inFlight.question;
  const busyGrade = state.inFlight.grade;
  const busyTutor = state.inFlight.tutor;
  const busyLesson = state.inFlight.lesson;
  const busyDiagnostic = state.inFlight.diagnostic;
  const anyBusy = busyQuestion || busyGrade || busyTutor || busyLesson || busyDiagnostic;
  const backendReady = state.backend.online;

  el.startDiagnosticBtn.disabled = !state.topicId || anyBusy;
  el.nextDiagnosticBtn.disabled = anyBusy;
  el.startPracticeBtn.disabled = busyQuestion || busyGrade || !state.profile || !backendReady;
  el.submitPracticeBtn.disabled = busyQuestion || busyGrade || !state.practiceVisible || !backendReady;
  el.nextQuestionBtn.disabled = busyQuestion || busyGrade || !state.practiceVisible || !backendReady;
  el.hintBtn.disabled = busyQuestion || busyGrade || !state.hintLadder.length;
  el.explainDifferentlyBtn.disabled = busyLesson || busyQuestion;
  el.askTutorBtn.disabled = busyTutor || !state.practiceVisible || !backendReady;
  el.reviewNowBtn.disabled = busyQuestion || busyGrade || !state.reviewQueue.length;
  el.topicSelect.disabled = busyQuestion || busyGrade;
  el.languageSelect.disabled = busyQuestion || busyGrade;
  el.styleSelect.disabled = busyQuestion || busyGrade;
}

async function apiGet(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    let resp;
    try {
      resp = await fetch(`${API_BASE}${path}`, {
        method: "GET",
        signal: controller.signal
      });
    } catch (err) {
      setBackendStatus(false, "-");
      throw err;
    }
    markBackendReachable();
    const json = await resp.json();
    if (!resp.ok || !json.ok) {
      throw new Error(json.error || `GET ${path} failed`);
    }
    return json;
  } finally {
    clearTimeout(timer);
  }
}

async function apiPost(path, payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);
  try {
    let resp;
    try {
      resp = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload || {}),
        signal: controller.signal
      });
    } catch (err) {
      setBackendStatus(false, "-");
      throw err;
    }
    markBackendReachable();
    const json = await resp.json();
    if (!resp.ok || !json.ok) {
      throw new Error(json.error || `POST ${path} failed`);
    }
    return json;
  } finally {
    clearTimeout(timer);
  }
}

async function checkBackendStatus({ quiet = false } = {}) {
  if (!quiet) {
    el.backendStatusChip.textContent = t("backendChecking");
  }
  try {
    const health = await apiGet("/health");
    setBackendStatus(true, health.engine || "engine");
  } catch (_err) {
    setBackendStatus(false, "-");
  }
}

function hasActiveProgress() {
  return Boolean(
    state.profile ||
      state.events.length ||
      state.practiceVisible ||
      Object.keys(state.skillMastery).length ||
      state.attemptHistory.length
  );
}

function updateDashboardCardVisibility() {
  const hasProfile = Boolean(state.profile);
  const hasAttempts = state.attemptHistory.length > 0;
  const hasTeacherData = state.events.length >= 3;

  el.reviewCard.classList.toggle("hidden", !hasProfile);
  el.attemptHistoryCard.classList.toggle("hidden", !hasAttempts);
  el.teacherCard.classList.toggle("hidden", !hasTeacherData);
  applyFlowStageVisibility();
}

function clearDynamicPracticeFields() {
  el.practiceInput.value = "";
  el.reasoningInput.value = "";
  el.practiceConfidenceRange.value = String(state.practiceConfidence);
  refreshPracticeConfidenceLabel();
}

function resetLearningState() {
  clearTimer();
  state.requestSerial.question += 1;
  state.requestSerial.grade += 1;
  state.requestSerial.lesson += 1;
  state.requestSerial.diagnostic += 1;
  state.inFlight.question = false;
  state.inFlight.grade = false;
  state.inFlight.lesson = false;
  state.inFlight.tutor = false;
  state.inFlight.diagnostic = false;
  state.profile = null;
  state.pathStatuses = [];
  state.currentNodeIndex = 0;
  state.nodeCorrect = {};
  state.nodeWrong = {};
  state.nodeStreak = {};
  state.mistakes = {};
  state.practiceVisible = false;
  state.routeComplete = false;
  state.currentQuestion = null;
  state.hintLadder = [];
  state.hintIndex = 0;
  state.stepFeedback = [];
  state.skillMastery = {};
  state.reviewQueue = [];
  state.events = [];
  state.clusters = [];
  state.lastMisconception = null;
  state.practiceConfidence = 3;
  state.confidenceLog = [];
  state.attemptHistory = [];
  state.attemptsByQuestion = {};
  state.activeStyle = state.preferredStyle;
  state.diagnostic = {
    currentIndex: 0,
    responses: [],
    questionStart: 0,
    timerId: null
  };
  el.profileChips.innerHTML = "";
  el.diagnosticCard.classList.add("hidden");
  el.lessonCard.classList.add("hidden");
  el.practiceCard.classList.add("hidden");
  el.tutorCard.classList.add("hidden");
  el.hintLadderBox.classList.add("hidden");
  el.stepFeedbackBox.classList.add("hidden");
  el.hintList.innerHTML = "";
  el.stepFeedbackList.innerHTML = "";
  el.tutorResponse.textContent = "";
  el.questionMetaChips.innerHTML = "";
  clearDynamicPracticeFields();
  resetScoreFields();
  setFeedback("", "");
  setActiveTab("learn");
  setFlowStage("setup");
  renderPath();
  renderMastery();
  renderReviewQueue();
  renderAttemptHistory();
  renderSessionSummary();
  renderTeacherMetrics();
  renderClusters();
  updateDashboardCardVisibility();
  updateActionLocks();
  queuePersist();
}

function startDiagnostic() {
  if (!state.topicId) {
    return;
  }
  resetLearningState();
  setFlowStage("setup");
  el.diagnosticCard.classList.remove("hidden");
  state.diagnostic.currentIndex = 0;
  state.diagnostic.responses = [];
  renderDiagnosticQuestion();
}

function renderDiagnosticQuestion() {
  const topic = currentTopic();
  if (!topic) {
    return;
  }
  const idx = state.diagnostic.currentIndex;
  const question = topic.diagnostic[idx];
  if (!question) {
    return;
  }

  el.diagProgress.textContent = t("qCounter", {
    current: idx + 1,
    total: topic.diagnostic.length
  });
  el.diagQuestionText.textContent = loc(question.prompt);
  el.diagOptions.innerHTML = "";

  question.options.forEach((opt) => {
    const label = document.createElement("label");
    label.className = "option-item";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "diagnostic-option";
    input.value = opt.id;
    const text = document.createElement("span");
    text.textContent = loc(opt.label);
    label.appendChild(input);
    label.appendChild(text);
    el.diagOptions.appendChild(label);
  });

  el.confidenceRange.value = "3";
  refreshConfidenceLabel();
  el.nextDiagnosticBtn.textContent = idx === topic.diagnostic.length - 1 ? t("finishDiagnostic") : t("nextQuestion");

  state.diagnostic.questionStart = Date.now();
  clearTimer();
  state.diagnostic.timerId = setInterval(() => {
    const elapsed = Math.max(0, (Date.now() - state.diagnostic.questionStart) / 1000);
    el.diagTimer.textContent = `${t("timeLabel")}: ${elapsed.toFixed(1)}s`;
  }, 150);
}

function estimateLevel(correct, avgTime, avgConfidence, total) {
  if (correct <= 1) {
    return "beginner";
  }
  if (correct === total && avgTime < 14 && avgConfidence >= 4) {
    return "advanced";
  }
  return "intermediate";
}

function buildInitialMastery(level, responses) {
  const base = level === "advanced" ? 0.74 : level === "intermediate" ? 0.56 : 0.38;
  const mastery = {
    basics: base,
    factoring: base - 0.03,
    graphing: base - 0.05,
    applications: base - 0.08
  };

  responses.forEach((resp) => {
    const delta = resp.correct ? 0.14 : -0.1;
    mastery[resp.skill] = clamp((mastery[resp.skill] || base) + delta, 0.05, 0.96);
  });

  mastery.applications = clamp((mastery.factoring + mastery.graphing) / 2, 0.05, 0.96);
  return mastery;
}

async function finalizeDiagnostic() {
  if (state.inFlight.diagnostic) {
    return;
  }
  const token = ++state.requestSerial.diagnostic;
  state.inFlight.diagnostic = true;
  updateActionLocks();
  clearTimer();
  const topic = currentTopic();
  const responses = state.diagnostic.responses;
  const total = responses.length;
  const correct = responses.filter((r) => r.correct).length;
  const avgTime = responses.reduce((sum, r) => sum + r.timeSec, 0) / Math.max(total, 1);
  const avgConfidence = responses.reduce((sum, r) => sum + r.confidence, 0) / Math.max(total, 1);

  const timeScore = Math.max(0, 1 - Math.min(avgTime / 35, 1));
  const confidenceScore = avgConfidence / 5;
  const masteryScore = Math.round((correct / Math.max(total, 1)) * 70 + timeScore * 15 + confidenceScore * 15);

  const level = estimateLevel(correct, avgTime, avgConfidence, total);
  const levelToStartNode = { beginner: 0, intermediate: 1, advanced: 2 };
  const startNodeIndex = Math.min(levelToStartNode[level], topic.nodes.length - 1);

  state.profile = { total, correct, avgTime, avgConfidence, level, masteryScore };
  state.skillMastery = buildInitialMastery(level, responses);
  state.currentNodeIndex = startNodeIndex;
  state.routeComplete = false;
  state.pathStatuses = topic.nodes.map((_, idx) => {
    if (idx < startNodeIndex) {
      return "completed";
    }
    if (idx === startNodeIndex) {
      return "unlocked";
    }
    return "locked";
  });

  try {
    if (state.backend.online) {
      try {
        const queuePayload = await apiPost("/api/review-queue", { skill_mastery: state.skillMastery });
        state.reviewQueue = queuePayload.review_queue || [];
      } catch (_err) {
        state.reviewQueue = [];
      }
    }

    if (token !== state.requestSerial.diagnostic) {
      return;
    }

    el.diagnosticCard.classList.add("hidden");
    el.lessonCard.classList.remove("hidden");
    setFlowStage("lesson");
    renderProfileChips();
    renderPath();
    renderMastery();
    renderReviewQueue();
    renderTeacherMetrics();
    renderSessionSummary();
    updateDashboardCardVisibility();
    await renderLesson();
    setFeedback(t("diagnosticComplete"), "good");
    queuePersist();
  } finally {
    if (token === state.requestSerial.diagnostic) {
      state.inFlight.diagnostic = false;
      updateActionLocks();
    }
  }
}

async function submitDiagnosticAnswer() {
  const topic = currentTopic();
  if (!topic) {
    return;
  }

  const selected = document.querySelector("input[name='diagnostic-option']:checked");
  if (!selected) {
    window.alert(t("feedbackSelectOption"));
    return;
  }

  const question = topic.diagnostic[state.diagnostic.currentIndex];
  const timeSec = Math.max(0.2, (Date.now() - state.diagnostic.questionStart) / 1000);
  const confidence = Number(el.confidenceRange.value);
  state.diagnostic.responses.push({
    questionIndex: state.diagnostic.currentIndex,
    skill: question.skill,
    selected: selected.value,
    correct: selected.value === question.correct,
    confidence,
    timeSec
  });

  if (state.diagnostic.currentIndex < topic.diagnostic.length - 1) {
    state.diagnostic.currentIndex += 1;
    renderDiagnosticQuestion();
    return;
  }

  await finalizeDiagnostic();
}

function buildLocalLesson(topic, nodeId) {
  const concept = loc(topic.concepts[nodeId]);
  const frame = loc(STYLE_FRAMES[state.activeStyle]);
  return `${frame}\n\n${concept}`;
}

async function renderLesson() {
  const topic = currentTopic();
  const node = currentNode();
  if (!topic || !node || !state.profile) {
    el.lessonCard.classList.add("hidden");
    return;
  }
  el.lessonCard.classList.remove("hidden");
  el.lessonNodeTitle.textContent = `${t("pathCurrent")}: ${loc(node.label)}`;
  el.lessonBody.textContent = t("loadingLesson");

  const concept = loc(topic.concepts[node.id]);
  const prompt = `${concept}\nMode: ${state.activeStyle}\nTopic: ${loc(topic.label)} (${node.id})`;

  if (!state.backend.online) {
    el.lessonBody.textContent = buildLocalLesson(topic, node.id);
    return;
  }

  const token = ++state.requestSerial.lesson;
  state.inFlight.lesson = true;
  updateActionLocks();
  try {
    const payload = await apiPost("/api/explain-modes", {
      prompt,
      style: state.activeStyle,
      language: state.language
    });
    if (token !== state.requestSerial.lesson) {
      return;
    }
    const explanations = payload.explanations || {};
    const selected = explanations[state.activeStyle] || explanations.step || buildLocalLesson(topic, node.id);
    el.lessonBody.textContent = selected;
  } catch (_err) {
    await checkBackendStatus({ quiet: true });
    if (token !== state.requestSerial.lesson) {
      return;
    }
    el.lessonBody.textContent = buildLocalLesson(topic, node.id);
  } finally {
    if (token === state.requestSerial.lesson) {
      state.inFlight.lesson = false;
      updateActionLocks();
    }
  }
}

async function cycleStyle() {
  const current = STYLE_ORDER.indexOf(state.activeStyle);
  const next = STYLE_ORDER[(current + 1) % STYLE_ORDER.length];
  state.activeStyle = next;
  el.styleSelect.value = next;
  await renderLesson();
  setFeedback(t("styleShifted", { style: getStyleLabel(next) }), "good");
  queuePersist();
}

function chooseDifficulty(skill) {
  const value = Number(state.skillMastery[skill] || 0.45);
  if (value < 0.45) {
    return "easy";
  }
  if (value < 0.75) {
    return "medium";
  }
  return "hard";
}

function resetScoreFields() {
  el.semanticScoreValue.textContent = "-";
  el.reasoningScoreValue.textContent = "-";
  el.confidenceBandValue.textContent = "-";
  el.safetyCheckValue.textContent = "-";
}

function renderQuestionMeta(question) {
  if (!state.ui.devMode || !question) {
    el.questionMetaChips.innerHTML = "";
    return;
  }
  const items = [
    `${t("metaSkill")}: ${question.skill || "-"}`,
    `${t("metaDifficulty")}: ${question.difficulty || "-"}`,
    `${t("metaSource")}: ${question.source || "unknown"}`
  ];
  if (state.backend.engine && state.backend.engine !== "-") {
    items.push(`${t("metaEngine")}: ${state.backend.engine}`);
  }
  el.questionMetaChips.innerHTML = items.map((item) => `<span class="chip">${item}</span>`).join("");
}

function renderPracticeQuestion() {
  if (state.routeComplete) {
    el.practicePrompt.textContent = t("allDone");
    renderQuestionMeta(null);
    return;
  }
  if (!state.currentQuestion) {
    el.practicePrompt.textContent = state.backend.online ? t("loadingQuestion") : t("backendOffline");
    renderQuestionMeta(null);
    return;
  }
  el.practicePrompt.textContent = state.currentQuestion.prompt;
  clearDynamicPracticeFields();
  renderQuestionMeta(state.currentQuestion);
}

function renderHintLadder() {
  if (!state.hintLadder.length) {
    el.hintLadderBox.classList.add("hidden");
    el.hintList.innerHTML = "";
    updateActionLocks();
    return;
  }
  el.hintLadderBox.classList.remove("hidden");
  const visibleHints = state.hintLadder.slice(0, state.hintIndex);
  el.hintList.innerHTML = visibleHints.map((hint) => `<li>${hint}</li>`).join("");
  updateActionLocks();
}

function renderStepFeedback() {
  if (!state.stepFeedback.length) {
    el.stepFeedbackBox.classList.add("hidden");
    el.stepFeedbackList.innerHTML = "";
    return;
  }
  el.stepFeedbackBox.classList.remove("hidden");
  el.stepFeedbackList.innerHTML = state.stepFeedback
    .map((item) => {
      const className = item.status === "ok" ? "step-ok" : "step-missing";
      return `<li class="${className}">${item.label}</li>`;
    })
    .join("");
}

function revealNextHint() {
  if (!state.hintLadder.length) {
    return;
  }
  state.hintIndex = Math.min(state.hintIndex + 1, state.hintLadder.length);
  renderHintLadder();
  queuePersist();
}

async function generateNextQuestion() {
  if (state.routeComplete) {
    return;
  }
  if (state.inFlight.question) {
    return;
  }
  const node = currentNode();
  if (!node) {
    return;
  }

  const token = ++state.requestSerial.question;
  state.inFlight.question = true;
  updateActionLocks();
  const difficulty = chooseDifficulty(node.id);
  el.practicePrompt.textContent = t("loadingQuestion");

  try {
    if (!state.backend.online) {
      state.currentQuestion = null;
      setFeedback(t("backendOffline"), "bad");
      renderPracticeQuestion();
      return;
    }

    try {
      const payload = await apiPost("/api/generate-question", {
        skill: node.id,
        difficulty,
        language: state.language
      });
      if (token !== state.requestSerial.question) {
        return;
      }
      state.currentQuestion = payload.question || null;
      if (state.currentQuestion) {
        state.currentQuestion.difficulty = state.currentQuestion.difficulty || difficulty;
      }
    } catch (_err) {
      await checkBackendStatus({ quiet: true });
      if (token !== state.requestSerial.question) {
        return;
      }
      state.currentQuestion = null;
      setFeedback(t("backendOffline"), "bad");
      renderPracticeQuestion();
      return;
    }

    if (token !== state.requestSerial.question) {
      return;
    }
    state.hintLadder = state.currentQuestion?.hint_ladder || [];
    state.hintIndex = 0;
    state.stepFeedback = [];
    renderHintLadder();
    renderStepFeedback();
    renderPracticeQuestion();
    queuePersist();
  } finally {
    if (token === state.requestSerial.question) {
      state.inFlight.question = false;
      updateActionLocks();
    }
  }
}

function advancePathIfNeeded() {
  const topic = currentTopic();
  const node = currentNode();
  if (!topic || !node) {
    return "";
  }
  if ((state.nodeStreak[node.id] || 0) < MASTERY_STREAK_REQUIRED) {
    return "";
  }

  state.pathStatuses[state.currentNodeIndex] = "completed";
  const nextIndex = state.currentNodeIndex + 1;
  if (nextIndex < topic.nodes.length) {
    state.pathStatuses[nextIndex] = "unlocked";
    state.currentNodeIndex = nextIndex;
    return t("feedbackUnlocked", { node: loc(topic.nodes[nextIndex].label) });
  }
  state.routeComplete = true;
  return t("feedbackFinal");
}

function parseDueTimestamp(dueAt) {
  const time = new Date(dueAt).getTime();
  return Number.isFinite(time) ? time : Number.MAX_SAFE_INTEGER;
}

function getNextReviewTarget() {
  if (!state.reviewQueue.length) {
    return null;
  }
  const queue = [...state.reviewQueue];
  queue.sort((a, b) => {
    const rankDiff = (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9);
    if (rankDiff !== 0) {
      return rankDiff;
    }
    return parseDueTimestamp(a.due_at) - parseDueTimestamp(b.due_at);
  });
  return queue[0] || null;
}

async function reviewNow() {
  if (!state.reviewQueue.length) {
    setFeedback(t("reviewNowNone"), "bad");
    return;
  }
  const target = getNextReviewTarget();
  if (!target) {
    setFeedback(t("reviewNowNone"), "bad");
    return;
  }
  const topic = currentTopic();
  if (!topic) {
    return;
  }
  const idx = topic.nodes.findIndex((node) => node.id === target.skill);
  if (idx < 0) {
    setFeedback(t("reviewNowNone"), "bad");
    return;
  }
  state.currentNodeIndex = idx;
  if (!state.pathStatuses.length) {
    state.pathStatuses = topic.nodes.map(() => "locked");
  }
  if (state.pathStatuses[idx] === "locked") {
    state.pathStatuses[idx] = "unlocked";
  }
  renderPath();
  renderProfileChips();
  await renderLesson();
  if (state.practiceVisible) {
    setFlowStage("practice");
    await generateNextQuestion();
  } else {
    setFlowStage("lesson");
  }
  setActiveTab("learn");
  setFeedback(t("reviewNowDone", { node: loc(topic.nodes[idx].label) }), "good");
  queuePersist();
}

async function refreshTeacherClusters() {
  if (!state.events.length) {
    state.clusters = [];
    renderClusters();
    return;
  }
  if (!state.backend.online) {
    renderClusters();
    return;
  }
  try {
    const payload = await apiPost("/api/teacher-summary", { events: state.events });
    state.clusters = payload.clusters || [];
  } catch (_err) {
    state.clusters = [];
  }
  renderClusters();
}

function renderClusters() {
  if (!state.clusters.length) {
    el.teacherClusters.innerHTML = `<li>${t("noClusters")}</li>`;
    return;
  }
  el.teacherClusters.innerHTML = state.clusters
    .map((cluster) => {
      return `
        <li>
          <strong>${cluster.cluster_id}</strong> (${cluster.count})
          <div class="review-meta">${cluster.prototype}</div>
          <div class="review-meta">${cluster.intervention}</div>
        </li>
      `;
    })
    .join("");
}

function renderReviewQueue() {
  if (!state.reviewQueue.length) {
    el.reviewQueue.innerHTML = `<li>${t("noReviewItems")}</li>`;
    updateActionLocks();
    return;
  }
  el.reviewQueue.innerHTML = state.reviewQueue
    .map((item) => {
      const due = new Date(item.due_at);
      const dueLabel = Number.isNaN(due.getTime()) ? item.due_at : due.toLocaleTimeString();
      return `
        <li>
          <strong>${skillLabel(item.skill)}</strong> (${Math.round(Number(item.mastery || 0) * 100)}%)
          <div class="review-meta">Priority: ${item.priority} | Due: ${dueLabel}</div>
        </li>
      `;
    })
    .join("");
  updateActionLocks();
}

function renderMastery() {
  const topic = currentTopic();
  if (!topic) {
    el.masteryBars.innerHTML = "";
    return;
  }
  const rows = topic.nodes.map((node) => {
    const raw = Number(state.skillMastery[node.id] || 0);
    const pct = Math.round(raw * 100);
    const nodeIndex = topic.nodes.findIndex((item) => item.id === node.id);
    const pathStatus = state.pathStatuses[nodeIndex] || "locked";
    let toneClass = "progress";
    if (!state.profile || pathStatus === "locked") {
      toneClass = "locked";
    } else if (pct >= 85 || pathStatus === "completed") {
      toneClass = "mastered";
    }
    return `
      <div class="mistake-row mastery-row ${toneClass}">
        <span>${loc(node.label)}</span>
        <div class="rail"><div class="fill" style="width:${Math.max(4, pct)}%"></div></div>
        <strong>${pct}%</strong>
      </div>
    `;
  });
  el.masteryBars.innerHTML = rows.join("");
}

function renderProfileChips() {
  if (!state.profile) {
    el.profileChips.innerHTML = "";
    return;
  }
  const node = currentNode();
  const levelKey =
    state.profile.level === "beginner"
      ? "levelBeginner"
      : state.profile.level === "advanced"
        ? "levelAdvanced"
        : "levelIntermediate";

  const chips = [
    t("profileLevel", { level: t(levelKey) }),
    t("profileScore", { score: state.profile.masteryScore }),
    t("profileNode", { node: node ? loc(node.label) : "-" }),
    t("profileLanguage", { language: LANGUAGE_OPTIONS[state.language] }),
    t("profileStreak", { value: MASTERY_STREAK_REQUIRED })
  ];
  el.profileChips.innerHTML = chips.map((chip) => `<span class="chip">${chip}</span>`).join("");
}

function renderPath() {
  const topic = currentTopic();
  if (!topic) {
    el.pathTopic.textContent = t("pickTopicPrompt");
    el.pathList.innerHTML = "";
    el.progressBar.style.width = "0%";
    el.progressLabel.textContent = t("progressFormat", { done: 0, total: 0 });
    return;
  }
  el.pathTopic.textContent = loc(topic.label);

  if (!state.profile) {
    el.pathList.innerHTML = topic.nodes
      .map((node) => `<li class="locked"><span>${loc(node.label)}</span><span class="node-badge">${t("pathLocked")}</span></li>`)
      .join("");
    el.progressBar.style.width = "0%";
    el.progressLabel.textContent = t("progressFormat", { done: 0, total: topic.nodes.length });
    return;
  }

  el.pathList.innerHTML = topic.nodes
    .map((node, idx) => {
      const status = state.pathStatuses[idx] || "locked";
      const badge = status === "completed" ? t("pathDone") : status === "unlocked" ? t("pathUnlocked") : t("pathLocked");
      return `<li class="${status}"><span>${loc(node.label)}</span><span class="node-badge">${badge}</span></li>`;
    })
    .join("");
  const completed = state.pathStatuses.filter((status) => status === "completed").length;
  const pct = (completed / topic.nodes.length) * 100;
  el.progressBar.style.width = `${pct.toFixed(0)}%`;
  el.progressLabel.textContent = t("progressFormat", { done: completed, total: topic.nodes.length });
}

function renderTeacherMetrics() {
  if (!state.profile) {
    el.metricAccuracy.textContent = "0%";
    el.metricTime.textContent = "0s";
    el.metricConfidence.textContent = "0/5";
    el.metricNode.textContent = "-";
    el.mistakeBars.innerHTML = `<p>${t("noMistakes")}</p>`;
    return;
  }

  const accuracy = Math.round((state.profile.correct / Math.max(state.profile.total, 1)) * 100);
  el.metricAccuracy.textContent = `${accuracy}%`;
  el.metricTime.textContent = `${state.profile.avgTime.toFixed(1)}s`;
  el.metricConfidence.textContent = `${state.profile.avgConfidence.toFixed(1)}/5`;
  const node = currentNode();
  el.metricNode.textContent = node ? loc(node.label) : "-";

  const entries = Object.entries(state.mistakes).sort((a, b) => b[1] - a[1]);
  if (!entries.length) {
    el.mistakeBars.innerHTML = `<p>${t("noMistakes")}</p>`;
    return;
  }
  const max = entries[0][1];
  el.mistakeBars.innerHTML = entries
    .slice(0, 5)
    .map(([id, count]) => {
      const width = Math.max(8, (count / max) * 100);
      const label = loc(MISTAKE_LABELS[id]) || id;
      return `
        <div class="mistake-row">
          <span>${label}</span>
          <div class="rail"><div class="fill" style="width:${width}%"></div></div>
          <strong>${count}</strong>
        </div>
      `;
    })
    .join("");
}

function computeCalibrationMae() {
  if (!state.confidenceLog.length) {
    return null;
  }
  const total = state.confidenceLog.reduce((sum, item) => {
    const predicted = Number(item.confidence || 0) / 5;
    const actual = item.correct ? 1 : 0;
    return sum + Math.abs(predicted - actual);
  }, 0);
  return total / state.confidenceLog.length;
}

function calibrationLabel(mae) {
  if (mae <= 0.18) {
    return t("calibrationExcellent");
  }
  if (mae <= 0.3) {
    return t("calibrationGood");
  }
  return t("calibrationNeedsWork");
}

function renderSessionSummary() {
  if (!state.profile && !state.attemptHistory.length) {
    el.summaryCalibration.textContent = t("summaryNoData");
    el.summaryStrengthsList.innerHTML = `<li>${t("summaryNoData")}</li>`;
    el.summaryMisconceptionsList.innerHTML = `<li>${t("summaryNoData")}</li>`;
    el.summaryNextActionsList.innerHTML = `<li>${t("summaryNoData")}</li>`;
    return;
  }

  const masteryEntries = Object.entries(state.skillMastery).sort((a, b) => Number(b[1]) - Number(a[1]));
  const strengths = masteryEntries.slice(0, 2).map(([skill, value]) => `${skillLabel(skill)} (${Math.round(Number(value) * 100)}%)`);
  const misconceptionEntries = Object.entries(state.mistakes).sort((a, b) => b[1] - a[1]);
  const misconceptionItems = misconceptionEntries
    .slice(0, 2)
    .map(([id, count]) => `${loc(MISTAKE_LABELS[id]) || id} (${count})`);

  const lowMastery = [...masteryEntries].sort((a, b) => Number(a[1]) - Number(b[1]))[0];
  const nextActions = [];
  if (lowMastery) {
    nextActions.push(t("sessionNextMastery", { node: skillLabel(lowMastery[0]) }));
  }
  if (misconceptionEntries.length) {
    const top = misconceptionEntries[0][0];
    nextActions.push(t("sessionNextMisconception", { label: loc(MISTAKE_LABELS[top]) || top }));
  }
  nextActions.push(t("sessionNextReview"));

  const mae = computeCalibrationMae();
  if (mae === null) {
    el.summaryCalibration.textContent = t("summaryCalibration", { value: "-" });
  } else {
    el.summaryCalibration.textContent = t("summaryCalibration", {
      value: `${(mae * 100).toFixed(1)}% (${calibrationLabel(mae)})`
    });
  }

  el.summaryStrengthsList.innerHTML = strengths.length
    ? strengths.map((item) => `<li>${item}</li>`).join("")
    : `<li>${t("summaryNoData")}</li>`;

  el.summaryMisconceptionsList.innerHTML = misconceptionItems.length
    ? misconceptionItems.map((item) => `<li>${item}</li>`).join("")
    : `<li>${t("noMistakes")}</li>`;

  el.summaryNextActionsList.innerHTML = nextActions.map((item) => `<li>${item}</li>`).join("");
}

function renderAttemptHistory() {
  if (!state.attemptHistory.length) {
    el.attemptHistoryList.innerHTML = `<li>${t("noAttempts")}</li>`;
    return;
  }
  const recent = [...state.attemptHistory].slice(-8).reverse();
  el.attemptHistoryList.innerHTML = recent
    .map((item) => {
      const stamp = new Date(item.timestamp).toLocaleTimeString();
      const mark = item.correct ? "✓" : "✗";
      const score = `${Math.round(Number(item.score || 0) * 100)}%`;
      return `
        <li>
          <strong>${mark} ${skillLabel(item.skill)}</strong> - ${score}
          <div class="review-meta">${stamp} | ${item.delta || "-"}</div>
          <div class="review-meta">${item.answer}</div>
        </li>
      `;
    })
    .join("");
}

function recordAttempt(question, result, answer, reasoning, confidence) {
  if (!question || !result) {
    return;
  }
  const qid = question.id || `${question.skill}-${normalize(question.prompt || "").slice(0, 40)}`;
  const prev = (state.attemptsByQuestion[qid] || []).slice(-1)[0] || null;
  let delta = "first attempt";
  if (prev) {
    const sameAnswer = normalize(prev.answer) === normalize(answer);
    delta = sameAnswer ? "same answer, revised reasoning" : "updated answer";
  }
  const attempt = {
    questionId: qid,
    timestamp: Date.now(),
    skill: question.skill || currentNode()?.id || "basics",
    answer,
    reasoning,
    confidence,
    correct: Boolean(result.is_correct),
    score: Number(result.score || 0),
    safety: result.safety || { note: "n/a" },
    misconception: result.misconception?.id || "none",
    delta
  };

  if (!state.attemptsByQuestion[qid]) {
    state.attemptsByQuestion[qid] = [];
  }
  state.attemptsByQuestion[qid].push(attempt);
  if (state.attemptsByQuestion[qid].length > 20) {
    state.attemptsByQuestion[qid] = state.attemptsByQuestion[qid].slice(-20);
  }

  state.attemptHistory.push(attempt);
  if (state.attemptHistory.length > 80) {
    state.attemptHistory = state.attemptHistory.slice(-80);
  }
  renderAttemptHistory();
}

async function handleGradeResult(result, answerText, reasoningText, confidenceValue) {
  const question = state.currentQuestion;
  const skill = question?.skill || currentNode()?.id || "basics";

  state.skillMastery = result.skill_mastery || state.skillMastery;
  state.reviewQueue = result.review_queue || state.reviewQueue;
  state.lastMisconception = result.misconception || null;
  state.stepFeedback = result.step_feedback || [];
  if (result.event) {
    state.events.push(result.event);
  } else {
    state.events.push({
      skill,
      prompt: question?.prompt || "",
      answer: answerText,
      misconception: result.misconception?.id || "none",
      correct: Boolean(result.is_correct),
      score: Number(result.score || 0)
    });
  }

  if (result.misconception?.id) {
    state.mistakes[result.misconception.id] = (state.mistakes[result.misconception.id] || 0) + 1;
  }

  if (result.is_correct) {
    state.nodeCorrect[skill] = (state.nodeCorrect[skill] || 0) + 1;
    state.nodeWrong[skill] = 0;
    state.nodeStreak[skill] = (state.nodeStreak[skill] || 0) + 1;
  } else {
    state.nodeWrong[skill] = (state.nodeWrong[skill] || 0) + 1;
    state.nodeStreak[skill] = 0;
  }

  state.confidenceLog.push({
    confidence: confidenceValue,
    correct: Boolean(result.is_correct),
    score: Number(result.score || 0),
    timestamp: Date.now()
  });
  if (state.confidenceLog.length > 120) {
    state.confidenceLog = state.confidenceLog.slice(-120);
  }

  recordAttempt(question, result, answerText, reasoningText, confidenceValue);

  el.semanticScoreValue.textContent = `${Math.round(Number(result.match_score || 0) * 100)}%`;
  el.reasoningScoreValue.textContent = `${Math.round(Number(result.reasoning_score || 0) * 100)}%`;
  el.confidenceBandValue.textContent = result.confidence_band || "-";
  const safety = result.safety || {};
  el.safetyCheckValue.textContent = safety.verified ? "verified" : (safety.note || "n/a");

  state.hintLadder = result.hint_ladder || [];
  state.hintIndex = result.is_correct ? 0 : Math.min(1, state.hintLadder.length);
  renderHintLadder();
  renderStepFeedback();

  let detail = result.feedback || t("feedbackWrongGeneric");
  if (result.misconception?.feedback) {
    detail += ` ${result.misconception.feedback}`;
  }

  if (result.is_correct) {
    const unlockMessage = advancePathIfNeeded();
    renderPath();
    renderProfileChips();
    await renderLesson();
    setFeedback(`${detail}${unlockMessage ? ` ${unlockMessage}` : ""}`, "good");
    if (!state.routeComplete) {
      setFlowStage("practice");
      await generateNextQuestion();
    } else {
      el.practicePrompt.textContent = t("allDone");
      state.currentQuestion = null;
      setFlowStage("summary");
    }
  } else {
    setFlowStage("practice");
    setFeedback(detail, "bad");
  }

  renderMastery();
  renderReviewQueue();
  renderSessionSummary();
  renderTeacherMetrics();
  updateDashboardCardVisibility();
  if (state.backend.online && (state.events.length === 3 || state.events.length % 5 === 0)) {
    void refreshTeacherClusters();
  } else {
    renderClusters();
  }
  queuePersist();
}

async function submitPracticeAnswer() {
  if (state.routeComplete) {
    setFeedback(t("feedbackFinal"), "good");
    return;
  }
  if (!state.currentQuestion) {
    await generateNextQuestion();
    return;
  }
  if (state.inFlight.grade) {
    return;
  }

  const answer = el.practiceInput.value.trim();
  const reasoning = el.reasoningInput.value.trim();
  const confidenceValue = Number(el.practiceConfidenceRange.value || 3);
  if (!answer) {
    setFeedback(t("feedbackNeedAnswer"), "bad");
    return;
  }

  const token = ++state.requestSerial.grade;
  state.inFlight.grade = true;
  updateActionLocks();

  try {
    if (!state.backend.online) {
      setFeedback(t("backendOffline"), "bad");
      return;
    }

    let result = null;
    try {
      const payload = await apiPost("/api/grade-response", {
        answer,
        reasoning,
        confidence: confidenceValue,
        question: state.currentQuestion,
        style: state.activeStyle,
        language: state.language,
        skill: state.currentQuestion.skill,
        student_state: {
          skill_mastery: state.skillMastery
        }
      });
      if (token !== state.requestSerial.grade) {
        return;
      }
      result = payload;
    } catch (_err) {
      await checkBackendStatus({ quiet: true });
      setFeedback(t("backendOffline"), "bad");
      return;
    }

    if (token !== state.requestSerial.grade) {
      return;
    }
    if (result) {
      await handleGradeResult(result, answer, reasoning, confidenceValue);
    }
  } finally {
    if (token === state.requestSerial.grade) {
      state.inFlight.grade = false;
      updateActionLocks();
    }
  }
}

async function explainCurrentQuestion() {
  if (!state.currentQuestion) {
    return;
  }
  await cycleStyle();
  if (!state.backend.online) {
    return;
  }
  try {
    const payload = await apiPost("/api/explain-modes", {
      prompt: state.currentQuestion.prompt,
      style: state.activeStyle,
      language: state.language
    });
    const text = payload.explanations?.[state.activeStyle] || "";
    if (text) {
      setFeedback(text, "good");
    }
  } catch (_err) {
    await checkBackendStatus({ quiet: true });
  }
}

async function askTutor() {
  const studentPrompt = el.tutorPromptInput.value.trim();
  if (!studentPrompt) {
    return;
  }

  const contextPrompt = state.currentQuestion?.prompt || currentNode()?.id || "quadratic equation";
  if (!state.backend.online) {
    el.tutorResponse.textContent = loc(STYLE_FRAMES[state.activeStyle]);
    return;
  }

  state.inFlight.tutor = true;
  updateActionLocks();
  try {
    const payload = await apiPost("/api/tutor-turn", {
      student_prompt: studentPrompt,
      context_prompt: contextPrompt,
      style: state.activeStyle,
      language: state.language,
      misconception: state.lastMisconception
    });
    const hints = (payload.hints || []).join("\n- ");
    el.tutorResponse.textContent = `${payload.message}\n\n- ${hints}\n\n${payload.follow_up_question || ""}`;
  } catch (_err) {
    await checkBackendStatus({ quiet: true });
    el.tutorResponse.textContent = loc(STYLE_FRAMES[state.activeStyle]);
  } finally {
    state.inFlight.tutor = false;
    updateActionLocks();
  }
}

async function startPractice() {
  if (!state.profile) {
    return;
  }
  state.practiceVisible = true;
  setActiveTab("learn");
  setFlowStage("practice");
  el.practiceCard.classList.remove("hidden");
  el.tutorCard.classList.remove("hidden");
  resetScoreFields();
  renderStepFeedback();
  await generateNextQuestion();
  queuePersist();
}

function bindEvents() {
  el.learnTabBtn.addEventListener("click", () => {
    setActiveTab("learn", { persist: true });
  });

  el.progressTabBtn.addEventListener("click", () => {
    setActiveTab("progress", { persist: true });
  });

  el.languageSelect.addEventListener("change", async (event) => {
    const previousLanguage = state.language;
    const nextLanguage = event.target.value;
    const hasDraft = Boolean(el.practiceInput.value.trim() || el.reasoningInput.value.trim());

    if (state.practiceVisible && state.currentQuestion) {
      const confirmText = hasDraft ? t("confirmLanguageDraft") : t("confirmLanguageSwitch");
      if (!window.confirm(confirmText)) {
        state.language = previousLanguage;
        el.languageSelect.value = previousLanguage;
        return;
      }
    }

    state.language = nextLanguage;
    applyTranslations();
    if (state.profile) {
      await renderLesson();
      if (state.practiceVisible && state.currentQuestion) {
        await generateNextQuestion();
      }
    }
    queuePersist();
  });

  el.topicSelect.addEventListener("change", (event) => {
    const nextTopic = event.target.value;
    const previousTopic = state.topicId;
    if (nextTopic !== previousTopic && hasActiveProgress()) {
      if (!window.confirm(t("confirmTopicReset"))) {
        el.topicSelect.value = previousTopic;
        return;
      }
    }

    state.topicId = nextTopic;
    resetLearningState();
    el.startDiagnosticBtn.disabled = !state.topicId;
    renderPath();
    queuePersist();
  });

  el.styleSelect.addEventListener("change", async (event) => {
    state.preferredStyle = event.target.value;
    state.activeStyle = event.target.value;
    if (state.profile) {
      await renderLesson();
      setFeedback(t("styleShifted", { style: getStyleLabel(state.activeStyle) }), "good");
    }
    queuePersist();
  });

  el.startDiagnosticBtn.addEventListener("click", startDiagnostic);
  el.nextDiagnosticBtn.addEventListener("click", submitDiagnosticAnswer);
  el.explainDifferentlyBtn.addEventListener("click", explainCurrentQuestion);
  el.startPracticeBtn.addEventListener("click", startPractice);
  el.submitPracticeBtn.addEventListener("click", submitPracticeAnswer);
  el.hintBtn.addEventListener("click", revealNextHint);
  el.nextQuestionBtn.addEventListener("click", generateNextQuestion);
  el.askTutorBtn.addEventListener("click", askTutor);
  el.reviewNowBtn.addEventListener("click", reviewNow);
  el.confidenceRange.addEventListener("input", refreshConfidenceLabel);
  el.practiceConfidenceRange.addEventListener("input", refreshPracticeConfidenceLabel);
}

function hydrateVisibleCardsFromState() {
  if (state.profile) {
    el.lessonCard.classList.remove("hidden");
    renderLesson();
  }
  if (state.practiceVisible) {
    el.practiceCard.classList.remove("hidden");
    el.tutorCard.classList.remove("hidden");
    renderPracticeQuestion();
    renderHintLadder();
    renderStepFeedback();
  }
  const hydratedStage = inferFlowStage();
  setFlowStage(hydratedStage);
  setActiveTab(state.ui.activeTab);
}

async function init() {
  loadPersistedSession();
  populateLanguageSelect();
  populateTopicSelect();
  populateStyleSelect();
  bindEvents();
  applyTranslations();
  el.startDiagnosticBtn.disabled = !state.topicId;
  renderPath();
  renderMastery();
  renderReviewQueue();
  renderAttemptHistory();
  renderSessionSummary();
  renderTeacherMetrics();
  renderClusters();
  hydrateVisibleCardsFromState();
  updateActionLocks();
  if (IS_FILE_CONTEXT) {
    setFeedback(t("openViaBackendHint"), "bad");
  }
  await checkBackendStatus();

  if (!backendPollTimer) {
    backendPollTimer = window.setInterval(() => {
      checkBackendStatus({ quiet: true });
    }, BACKEND_POLL_INTERVAL_MS);
  }
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      checkBackendStatus({ quiet: true });
    }
  });
}

init();

