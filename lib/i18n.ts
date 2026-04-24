export type Lang = "en" | "ru"

export const t = {
  en: {
    // Main page
    appSubtitle: "Record your thoughts, get great tweets",
    sectionVoice: "1. Your Voice",
    sectionPhotos: "2. Photos (optional)",
    generateBtn: "Generate Posts",
    generating: "Generating...",
    errorNoTranscript: "Please add a voice recording or type your ideas first.",
    errorGeneral: "Something went wrong. Please try again.",

    // VoiceRecorder
    tapToRecord: "Tap to record",
    tapToStop: "Tap to stop",
    transcribing: "Transcribing with Deepgram…",
    transcriptLabel: "Transcript",
    transcriptPlaceholder: "Record your voice or type your ideas here…",
    micDenied: "Microphone access denied. Please allow microphone and try again.",

    // PhotoUpload
    photoDropHint: "Drag & drop or tap to add photos",

    // StyleMemory
    myStyle: "My Style",
    styleHint: "Paste 5–10 of your existing tweets. Claude will match your tone.",
    stylePlaceholder: "Paste your existing tweets here...",
    saveStyle: "Save Style",
    saved: "Saved!",

    // PostCard
    copy: "Copy",
    copied: "Copied!",
    save: "Save",
    overLimit: "Over limit!",

    // Results
    generatedPosts: "Generated Posts",
    copyAll: "Copy all",
    copiedAll: "Copied!",
    tabShort: "Short",
    tabThread: "Thread",
    tabBold: "Bold",
    tabAll: "All",
    allShortLabel: "── SHORT ──",
    allBoldLabel: "── BOLD ──",
    allThreadLabel: "── THREAD ──",

    // Drafts
    drafts: "Drafts",
    noDrafts: "No drafts yet. Generate some posts first!",

    // Queue
    queue: "Queue",
    noQueue: "No posts queued. Save some posts for later!",
    queued: "queued",

    // Nav
    navRecord: "Record",
    navDrafts: "Drafts",
    navQueue: "Queue",

    // Time
    morning: "Morning",
    lunch: "Lunch",
    evening: "Evening",
  },
  ru: {
    // Main page
    appSubtitle: "Запиши мысль — получи крутой пост",
    sectionVoice: "1. Твой голос",
    sectionPhotos: "2. Фото (необязательно)",
    generateBtn: "Сгенерировать посты",
    generating: "Генерирую...",
    errorNoTranscript: "Запиши голос или напиши свои мысли.",
    errorGeneral: "Что-то пошло не так. Попробуй ещё раз.",

    // VoiceRecorder
    tapToRecord: "Нажми чтобы записать",
    tapToStop: "Нажми чтобы остановить",
    transcribing: "Transcribing с Deepgram…",
    transcriptLabel: "Транскрипция",
    transcriptPlaceholder: "Запиши голос или напечатай свои идеи…",
    micDenied: "Нет доступа к микрофону. Разреши доступ и попробуй снова.",

    // PhotoUpload
    photoDropHint: "Перетащи или нажми чтобы добавить фото",

    // StyleMemory
    myStyle: "Мой стиль",
    styleHint: "Вставь 5–10 своих твитов. ИИ подстроится под твой тон.",
    stylePlaceholder: "Вставь свои твиты сюда...",
    saveStyle: "Сохранить стиль",
    saved: "Сохранено!",

    // PostCard
    copy: "Копировать",
    copied: "Скопировано!",
    save: "Сохранить",
    overLimit: "Превышен лимит!",

    // Results
    generatedPosts: "Готовые посты",
    copyAll: "Скопировать всё",
    copiedAll: "Скопировано!",
    tabShort: "Коротко",
    tabThread: "Тред",
    tabBold: "Дерзко",
    tabAll: "Всё",
    allShortLabel: "── КОРОТКО ──",
    allBoldLabel: "── ДЕРЗКО ──",
    allThreadLabel: "── ТРЕД ──",

    // Drafts
    drafts: "Черновики",
    noDrafts: "Черновиков нет. Сначала сгенерируй посты!",

    // Queue
    queue: "Очередь",
    noQueue: "Очередь пуста. Сохрани посты для публикации!",
    queued: "в очереди",

    // Nav
    navRecord: "Запись",
    navDrafts: "Черновики",
    navQueue: "Очередь",

    // Time
    morning: "Утро",
    lunch: "День",
    evening: "Вечер",
  },
} as const

export type Translations = Record<string, string>
