import type { Practice } from "./types";

const stop = {
  en: "Stop if you feel dizzy, short of breath, pain or any worsening. Breathe normally and rest.", de: "Hör auf, wenn dir schwindelig wird, du kurzatmig bist, Schmerzen hast oder sich etwas verschlechtert. Atme normal und ruh dich aus.",
  ru: "Остановись при головокружении, нехватке воздуха, боли или ухудшении самочувствия. Дыши обычно и отдохни.",
  uk: "Зупинися при запамороченні, нестачі повітря, болю або погіршенні самопочуття. Дихай звичайно й відпочинь.",
};
const noForce = {
  en: "No forced deep breaths and no breath holds. Comfort over depth.", de: "Keine erzwungenen tiefen Atemzüge und kein Luftanhalten. Wohlgefühl vor Tiefe.",
  ru: "Без усиленных глубоких вдохов и без задержек. Комфорт важнее глубины.",
  uk: "Без форсованих глибоких вдихів і без затримок. Комфорт важливіший за глибину.",
};

/** Gentle, hold-free patterns for a broad audience. Seconds per phase. */
export const practices: Practice[] = [
  {
    id: "diaphragm-basics",
    category: "basics",
    goals: ["learn"],
    title: { en: "Diaphragmatic basics", de: "Grundlagen der Zwerchfellatmung", ru: "Основы диафрагмального дыхания", uk: "Основи діафрагмального дихання" },
    purpose: { en: "Feel the belly and lower ribs move with the breath.", de: "Spüre, wie sich Bauch und untere Rippen mit dem Atem bewegen.", ru: "Почувствовать, как живот и нижние рёбра движутся с дыханием.", uk: "Відчути, як живіт і нижні ребра рухаються з диханням." },
    description: { en: "The starting point for everything else: a quiet breath where the lower ribs widen and the belly rises gently on the inhale, and everything softens on the exhale. The chest and shoulders stay calm.", de: "Der Ausgangspunkt für alles Weitere: ein ruhiger Atem, bei dem sich die unteren Rippen weiten und der Bauch beim Einatmen sanft hebt und beim Ausatmen alles weich wird. Brust und Schultern bleiben ruhig.", ru: "Отправная точка для всего остального: спокойный вдох, на котором нижние рёбра расширяются, а живот мягко поднимается, и выдох, на котором всё расслабляется. Грудь и плечи остаются спокойными.", uk: "Відправна точка для всього іншого: спокійний вдих, на якому нижні ребра розширюються, а живіт м’яко піднімається, і видих, на якому все розслабляється. Груди та плечі залишаються спокійними." },
    steps: [
      { en: "Lie on your back with knees bent, or sit upright. One hand on the belly, one on the lower ribs.", de: "Leg dich mit angewinkelten Knien auf den Rücken oder setz dich aufrecht hin. Eine Hand auf den Bauch, eine auf die unteren Rippen.", ru: "Ляг на спину с согнутыми коленями или сядь ровно. Одна ладонь на животе, другая на нижних рёбрах.", uk: "Ляж на спину із зігнутими колінами або сядь рівно. Одна долоня на животі, друга на нижніх ребрах." },
      { en: "Inhale through the nose for about 4 seconds; feel the hands move outward.", de: "Atme etwa 4 Sekunden durch die Nase ein; spüre, wie sich die Hände nach außen bewegen.", ru: "Вдох носом около 4 секунд; почувствуй, как ладони расходятся наружу.", uk: "Вдих носом близько 4 секунд; відчуй, як долоні розходяться назовні." },
      { en: "Exhale slowly for about 6 seconds, letting the ribs and belly fall by themselves.", de: "Atme etwa 6 Sekunden langsam aus und lass Rippen und Bauch von selbst sinken.", ru: "Медленный выдох около 6 секунд, рёбра и живот опускаются сами.", uk: "Повільний видих близько 6 секунд, ребра і живіт опускаються самі." },
      { en: "Keep shoulders and jaw soft. If the chest rises first, make the breath smaller.", de: "Schultern und Kiefer bleiben weich. Wenn sich zuerst die Brust hebt, atme kleiner.", ru: "Плечи и челюсть мягкие. Если первой поднимается грудь, сделай вдох меньше.", uk: "Плечі та щелепа м’які. Якщо першими піднімаються груди, зроби вдих меншим." },
    ],
    cautions: [noForce, stop],
    pattern: [{ kind: "inhale", seconds: 4 }, { kind: "exhale", seconds: 6 }],
    durations: [1, 3, 5],
    level: "beginner",
    evidence: "slow-breathing-stress",
  },
  {
    id: "calm",
    category: "calm",
    goals: ["relax"],
    title: { en: "Calm pace", de: "Ruhiges Tempo", ru: "Спокойный темп", uk: "Спокійний темп" },
    purpose: { en: "Lower tension after a demanding day.", de: "Anspannung nach einem fordernden Tag senken.", ru: "Снизить напряжение после насыщенного дня.", uk: "Знизити напруження після насиченого дня." },
    description: { en: "About six breaths a minute with an easy, slightly longer exhale. This is the pace most studied for calming effects; it should feel effortless.", de: "Etwa sechs Atemzüge pro Minute mit einem leichten, etwas längeren Ausatmen. Dieses Tempo ist für beruhigende Effekte am besten untersucht; es sollte mühelos sein.", ru: "Около шести вдохов в минуту с лёгким, чуть удлинённым выдохом. Этот темп изучен лучше всего для успокаивающего эффекта; он должен ощущаться без усилия.", uk: "Близько шести вдихів на хвилину з легким, трохи довшим видихом. Цей темп найкраще вивчений для заспокійливого ефекту; він має відчуватися без зусиль." },
    steps: [
      { en: "Sit or lie comfortably, eyes soft or closed.", de: "Setz oder leg dich bequem hin, Blick weich oder Augen geschlossen.", ru: "Сядь или ляг удобно, взгляд мягкий или глаза закрыты.", uk: "Сядь або ляж зручно, погляд м’який або очі заплющені." },
      { en: "Inhale through the nose for 4–5 seconds, exhale for 5–6.", de: "Atme 4–5 Sekunden durch die Nase ein und 5–6 Sekunden aus.", ru: "Вдох носом 4–5 секунд, выдох 5–6.", uk: "Вдих носом 4–5 секунд, видих 5–6." },
      { en: "Follow the circle; let the breath be quiet, not deep.", de: "Folge dem Kreis; der Atem darf leise sein, nicht tief.", ru: "Следуй за кругом; дыхание тихое, а не глубокое.", uk: "Слідуй за колом; дихання тихе, а не глибоке." },
    ],
    cautions: [noForce, stop],
    pattern: [{ kind: "inhale", seconds: 4.5 }, { kind: "exhale", seconds: 5.5 }],
    durations: [1, 3, 5],
    level: "beginner",
    evidence: "slow-breathing-stress",
  },
  {
    id: "sleep",
    category: "calm",
    goals: ["sleep", "relax"],
    title: { en: "Before sleep", de: "Vor dem Schlafen", ru: "Перед сном", uk: "Перед сном" },
    purpose: { en: "A calm transition to rest with a longer exhale.", de: "Ein ruhiger Übergang zur Ruhe mit längerem Ausatmen.", ru: "Спокойный переход ко сну с удлинённым выдохом.", uk: "Спокійний перехід до сну з подовженим видихом." },
    description: { en: "Lying down, with the exhale almost twice as long as the inhale and a short natural pause before the next breath. No holds that create effort.", de: "Im Liegen, das Ausatmen fast doppelt so lang wie das Einatmen, dazu eine kurze natürliche Pause vor dem nächsten Atemzug. Kein Anhalten, das Anstrengung erzeugt.", ru: "Лёжа, выдох почти вдвое длиннее вдоха и короткая естественная пауза перед следующим вдохом. Без задержек, требующих усилия.", uk: "Лежачи, видих майже вдвічі довший за вдих і коротка природна пауза перед наступним вдихом. Без затримок, що потребують зусиль." },
    steps: [
      { en: "Lie on your back or side, lights low.", de: "Leg dich auf den Rücken oder die Seite, das Licht gedimmt.", ru: "Ляг на спину или на бок, приглуши свет.", uk: "Ляж на спину або на бік, приглуши світло." },
      { en: "Inhale 4 seconds, exhale 7 seconds, rest 1 second.", de: "Einatmen 4 Sekunden, ausatmen 7 Sekunden, 1 Sekunde Pause.", ru: "Вдох 4 секунды, выдох 7 секунд, пауза 1 секунда.", uk: "Вдих 4 секунди, видих 7 секунд, пауза 1 секунда." },
      { en: "If 7 feels long, shorten it. The pause is a release, not a hold.", de: "Wenn 7 lang wirkt, kürze ab. Die Pause ist ein Loslassen, kein Anhalten.", ru: "Если 7 секунд долго, укороти. Пауза это отпускание, а не задержка.", uk: "Якщо 7 секунд довго, скороти. Пауза це відпускання, а не затримка." },
    ],
    cautions: [noForce, stop],
    pattern: [{ kind: "inhale", seconds: 4 }, { kind: "exhale", seconds: 7 }, { kind: "rest", seconds: 1 }],
    durations: [3, 5],
    level: "beginner",
    evidence: "sleep",
  },
  {
    id: "recovery",
    category: "recovery",
    goals: ["recover"],
    title: { en: "After a session", de: "Nach dem Training", ru: "После занятия", uk: "Після заняття" },
    purpose: { en: "Return to an easy breathing rhythm after effort.", de: "Nach Anstrengung zu einem leichten Atemrhythmus zurückfinden.", ru: "Вернуться к спокойному ритму дыхания после нагрузки.", uk: "Повернутися до спокійного ритму дихання після навантаження." },
    description: { en: "Sitting or lying down, the breath settles step by step: first just noticing it, then lengthening the exhale. Used for comfort and a calm finish; faster recovery of heart rhythm is not proven.", de: "Im Sitzen oder Liegen beruhigt sich der Atem Schritt für Schritt: erst nur wahrnehmen, dann das Ausatmen verlängern. Dient dem Wohlgefühl und einem ruhigen Abschluss; eine schnellere Erholung des Herzrhythmus ist nicht belegt.", ru: "Сидя или лёжа дыхание успокаивается постепенно: сначала просто наблюдение, потом удлинение выдоха. Используется для комфорта и спокойного завершения; ускорение восстановления пульса не доказано.", uk: "Сидячи або лежачи дихання заспокоюється поступово: спочатку просто спостереження, потім подовження видиху. Використовується для комфорту та спокійного завершення; прискорення відновлення пульсу не доведене." },
    steps: [
      { en: "Sit with the back supported or lie down, legs relaxed.", de: "Setz dich mit gestütztem Rücken oder leg dich hin, die Beine entspannt.", ru: "Сядь с опорой для спины или ляг, ноги расслаблены.", uk: "Сядь з опорою для спини або ляж, ноги розслаблені." },
      { en: "For the first breaths just watch the air come and go.", de: "Beobachte bei den ersten Atemzügen nur, wie die Luft kommt und geht.", ru: "Первые вдохи просто наблюдай, как воздух приходит и уходит.", uk: "Перші вдихи просто спостерігай, як повітря приходить і йде." },
      { en: "Then settle into 4 seconds in, 6 seconds out until the body feels quiet.", de: "Finde dann in 4 Sekunden ein, 6 Sekunden aus, bis sich der Körper ruhig anfühlt.", ru: "Затем перейди к 4 секундам вдоха и 6 выдоха, пока тело не успокоится.", uk: "Потім перейди до 4 секунд вдиху та 6 видиху, доки тіло не заспокоїться." },
    ],
    cautions: [noForce, stop],
    pattern: [{ kind: "inhale", seconds: 4 }, { kind: "exhale", seconds: 6 }],
    durations: [1, 3, 5],
    level: "beginner",
    evidence: "post-exercise",
  },
  {
    id: "ribs-mobility",
    category: "mobility",
    goals: ["coordinate", "learn"],
    title: { en: "Ribs and upper back", de: "Rippen und oberer Rücken", ru: "Рёбра и грудной отдел", uk: "Ребра та грудний відділ" },
    purpose: { en: "Gentle mobility of the rib cage with the breath.", de: "Sanfte Mobilität des Brustkorbs mit dem Atem.", ru: "Мягкая подвижность грудной клетки вместе с дыханием.", uk: "М’яка рухливість грудної клітки разом із диханням." },
    description: { en: "Seated, the inhale opens the chest and lifts the breastbone slightly; the exhale lets the upper back round softly. Movement stays small and painless; this is awareness, not a stretch to the limit.", de: "Im Sitzen öffnet das Einatmen die Brust und hebt das Brustbein leicht; beim Ausatmen rundet sich der obere Rücken sanft. Die Bewegung bleibt klein und schmerzfrei; es geht um Wahrnehmung, nicht um Dehnung bis an die Grenze.", ru: "Сидя, на вдохе грудь раскрывается и грудина чуть поднимается; на выдохе верх спины мягко округляется. Движение маленькое и безболезненное; это осознание, а не растяжка до предела.", uk: "Сидячи, на вдиху груди розкриваються і грудина трохи піднімається; на видиху верх спини м’яко округлюється. Рух малий і безболісний; це усвідомлення, а не розтяжка до межі." },
    steps: [
      { en: "Sit on the front of a chair, feet flat, hands on the thighs.", de: "Setz dich vorn auf einen Stuhl, Füße flach, Hände auf den Oberschenkeln.", ru: "Сядь на край стула, стопы на полу, ладони на бёдрах.", uk: "Сядь на край стільця, стопи на підлозі, долоні на стегнах." },
      { en: "Inhale 4 seconds: open the chest, let the lower ribs widen to the sides.", de: "Einatmen 4 Sekunden: Brust öffnen, die unteren Rippen seitlich weiten.", ru: "Вдох 4 секунды: раскрой грудь, дай нижним рёбрам разойтись в стороны.", uk: "Вдих 4 секунди: розкрий груди, дай нижнім ребрам розійтися в боки." },
      { en: "Exhale 6 seconds: soften, let the upper back round a little.", de: "Ausatmen 6 Sekunden: weich werden, den oberen Rücken leicht runden.", ru: "Выдох 6 секунд: расслабься, пусть верх спины чуть округлится.", uk: "Видих 6 секунд: розслабся, нехай верх спини трохи округлиться." },
    ],
    cautions: [{ en: "Keep the range small; no pain in the back, neck or ribs.", de: "Bleib im kleinen Bewegungsumfang; keine Schmerzen in Rücken, Nacken oder Rippen.", ru: "Амплитуда маленькая; без боли в спине, шее или рёбрах.", uk: "Амплітуда мала; без болю в спині, шиї чи ребрах." }, stop],
    pattern: [{ kind: "inhale", seconds: 4 }, { kind: "exhale", seconds: 6 }],
    durations: [1, 3, 5],
    level: "beginner",
    cue: { en: "Inhale: open · Exhale: round", de: "Einatmen: öffnen · Ausatmen: runden", ru: "Вдох: раскрыть · Выдох: округлить", uk: "Вдих: розкрити · Видих: округлити" },
    evidence: "breathing-low-back",
  },
  {
    id: "spine-wave",
    category: "mobility",
    goals: ["coordinate"],
    title: { en: "Breath with the spine", de: "Atem mit der Wirbelsäule", ru: "Дыхание с позвоночником", uk: "Дихання з хребтом" },
    purpose: { en: "Coordinate breathing with a gentle spine movement.", de: "Den Atem mit einer sanften Bewegung der Wirbelsäule verbinden.", ru: "Согласовать дыхание с мягким движением позвоночника.", uk: "Узгодити дихання з м’яким рухом хребта." },
    description: { en: "On all fours: the inhale lets the belly drop and the breastbone lift a little; the exhale rounds the back from the tailbone up. One breath, one wave. Can be a warm-up or an addition to a back programme from your specialist.", de: "Im Vierfüßlerstand: Beim Einatmen sinkt der Bauch und das Brustbein hebt sich etwas; beim Ausatmen rundet sich der Rücken vom Steißbein aufwärts. Ein Atemzug, eine Welle. Geeignet zum Aufwärmen oder als Ergänzung zu einem Rückenprogramm deiner Fachperson.", ru: "На четвереньках: на вдохе живот опускается, грудина чуть поднимается; на выдохе спина округляется от копчика вверх. Один вдох, одна волна. Подходит как разминка или дополнение к программе для спины от вашего специалиста.", uk: "На чотирьох: на вдиху живіт опускається, грудина трохи піднімається; на видиху спина округлюється від куприка вгору. Один вдих, одна хвиля. Підходить як розминка або доповнення до програми для спини від вашого фахівця." },
    steps: [
      { en: "Hands under shoulders, knees under hips, neck long.", de: "Hände unter den Schultern, Knie unter den Hüften, Nacken lang.", ru: "Ладони под плечами, колени под тазом, шея длинная.", uk: "Долоні під плечима, коліна під тазом, шия довга." },
      { en: "Inhale 4 seconds: belly down, chest forward, gaze slightly up.", de: "Einatmen 4 Sekunden: Bauch nach unten, Brust nach vorn, Blick leicht nach oben.", ru: "Вдох 4 секунды: живот вниз, грудь вперёд, взгляд чуть вверх.", uk: "Вдих 4 секунди: живіт униз, груди вперед, погляд трохи вгору." },
      { en: "Exhale 6 seconds: round the back, tuck the tailbone, soften the head.", de: "Ausatmen 6 Sekunden: Rücken runden, Steißbein einrollen, Kopf locker.", ru: "Выдох 6 секунд: округли спину, подверни копчик, опусти голову.", uk: "Видих 6 секунд: округли спину, підверни куприк, опусти голову." },
    ],
    cautions: [{ en: "Small, pain-free range. With wrist or knee problems do it seated.", de: "Kleiner, schmerzfreier Bewegungsumfang. Bei Handgelenk- oder Knieproblemen im Sitzen üben.", ru: "Маленькая безболезненная амплитуда. При проблемах с запястьями или коленями делай сидя.", uk: "Мала безболісна амплітуда. При проблемах із зап’ястями чи колінами роби сидячи." }, stop],
    pattern: [{ kind: "inhale", seconds: 4 }, { kind: "exhale", seconds: 6 }],
    durations: [1, 3, 5],
    level: "beginner",
    cue: { en: "Inhale: belly down · Exhale: round up", de: "Einatmen: Bauch nach unten · Ausatmen: rund nach oben", ru: "Вдох: живот вниз · Выдох: округлить", uk: "Вдих: живіт униз · Видих: округлити" },
    evidence: "breathing-low-back",
  },
  {
    id: "reflux",
    category: "digestive",
    goals: ["reflux", "learn"],
    title: { en: "Diaphragm training (reflux studies)", de: "Zwerchfelltraining (Reflux-Studien)", ru: "Тренировка диафрагмы (исследования при рефлюксе)", uk: "Тренування діафрагми (дослідження при рефлюксі)" },
    purpose: { en: "The abdominal breathing pattern used in reflux trials, as an addition to your doctor's care.", de: "Das Bauchatmungsmuster aus Reflux-Studien, als Ergänzung zur ärztlichen Behandlung.", ru: "Брюшное дыхание из исследований при рефлюксе, как дополнение к лечению у врача.", uk: "Черевне дихання з досліджень при рефлюксі, як доповнення до лікування у лікаря." },
    description: { en: "The crural part of the diaphragm wraps the lower oesophagus and helps keep stomach contents down. Small trials trained slow abdominal breathing daily for weeks and saw less acid exposure and fewer symptoms. This practice follows that pattern; the studied dose was about 30 minutes a day, so a short session here is a start, not the full protocol.", de: "Der Zwerchfellschenkel umschließt die untere Speiseröhre und hilft, Mageninhalt unten zu halten. Kleine Studien trainierten über Wochen täglich langsame Bauchatmung und sahen weniger Säurekontakt und weniger Beschwerden. Diese Praxis folgt diesem Muster; die untersuchte Dosis lag bei etwa 30 Minuten täglich, eine kurze Einheit hier ist also ein Anfang, nicht das ganze Protokoll.", ru: "Ножки диафрагмы охватывают нижнюю часть пищевода и помогают удерживать содержимое желудка. Небольшие исследования тренировали медленное брюшное дыхание ежедневно неделями и видели меньше кислотной экспозиции и симптомов. Эта практика повторяет тот паттерн; изученная доза около 30 минут в день, так что короткая сессия здесь это начало, а не полный протокол.", uk: "Ніжки діафрагми охоплюють нижню частину стравоходу і допомагають утримувати вміст шлунка. Невеликі дослідження тренували повільне черевне дихання щодня тижнями й бачили менше кислотної експозиції та симптомів. Ця практика повторює той патерн; вивчена доза близько 30 хвилин на день, тож коротка сесія тут це початок, а не повний протокол." },
    steps: [
      { en: "Lie on your back, knees bent, hand on the upper belly just under the ribs.", de: "Leg dich mit angewinkelten Knien auf den Rücken, eine Hand auf den Oberbauch direkt unter den Rippen.", ru: "Ляг на спину, колени согнуты, ладонь на верхней части живота под рёбрами.", uk: "Ляж на спину, коліна зігнуті, долоня на верхній частині живота під ребрами." },
      { en: "Inhale through the nose 4 seconds so the hand rises; chest stays still.", de: "Atme 4 Sekunden durch die Nase ein, sodass sich die Hand hebt; die Brust bleibt ruhig.", ru: "Вдох носом 4 секунды, чтобы ладонь поднялась; грудь неподвижна.", uk: "Вдих носом 4 секунди, щоб долоня піднялася; груди нерухомі." },
      { en: "Exhale through slightly pursed lips 6 seconds, belly lowers without pushing.", de: "Atme 6 Sekunden durch leicht gespitzte Lippen aus, der Bauch senkt sich ohne Drücken.", ru: "Выдох через слегка сжатые губы 6 секунд, живот опускается без натуживания.", uk: "Видих через злегка стиснуті губи 6 секунд, живіт опускається без натужування." },
      { en: "Best not right after a large meal. Practise daily; the studies ran for 4 weeks.", de: "Am besten nicht direkt nach einer großen Mahlzeit. Täglich üben; die Studien liefen 4 Wochen.", ru: "Лучше не сразу после обильной еды. Практикуй ежедневно; исследования длились 4 недели.", uk: "Краще не одразу після рясної їжі. Практикуй щодня; дослідження тривали 4 тижні." },
    ],
    cautions: [
      { en: "This does not treat GERD, gastritis, ulcers or hiatal hernia and does not replace diagnosis or medication. Keep taking what your doctor prescribed.", de: "Das behandelt keine Refluxkrankheit, Gastritis, Geschwüre oder Hiatushernie und ersetzt weder Diagnose noch Medikamente. Nimm weiter, was deine Ärztin verschrieben hat.", ru: "Это не лечит ГЭРБ, гастрит, язву или грыжу пищеводного отверстия и не заменяет диагностику и лекарства. Продолжай принимать назначенное врачом.", uk: "Це не лікує ГЕРХ, гастрит, виразку чи грижу стравохідного отвору і не замінює діагностику та ліки. Продовжуй приймати призначене лікарем." },
      { en: "Chest pain, trouble swallowing, vomiting, weight loss or black stools need medical assessment, not breathing.", de: "Brustschmerzen, Schluckbeschwerden, Erbrechen, Gewichtsverlust oder schwarzer Stuhl gehören ärztlich abgeklärt, nicht weggeatmet.", ru: "Боль в груди, трудности глотания, рвота, потеря веса или чёрный стул требуют медицинской оценки, а не дыхания.", uk: "Біль у грудях, труднощі ковтання, блювання, втрата ваги чи чорний стілець потребують медичної оцінки, а не дихання." },
      noForce,
    ],
    pattern: [{ kind: "inhale", seconds: 4 }, { kind: "exhale", seconds: 6 }],
    durations: [3, 5, 10],
    level: "beginner",
    evidence: "diaphragm-reflux",
  },
  {
    id: "pelvic-awareness",
    category: "basics",
    goals: ["learn", "coordinate"],
    title: { en: "Breath and pelvic floor awareness", de: "Atem und Beckenboden wahrnehmen", ru: "Дыхание и осознание тазового дна", uk: "Дихання та усвідомлення тазового дна" },
    purpose: { en: "Notice how the pelvic floor follows the diaphragm.", de: "Spüren, wie der Beckenboden dem Zwerchfell folgt.", ru: "Заметить, как тазовое дно следует за диафрагмой.", uk: "Помітити, як тазове дно слідує за діафрагмою." },
    description: { en: "On MRI the diaphragm and pelvic floor descend together on the inhale and rise on the exhale. This practice is only about noticing that; it is not treatment for incontinence, prolapse or pain, which need a pelvic health specialist.", de: "Im MRT senken sich Zwerchfell und Beckenboden beim Einatmen gemeinsam und heben sich beim Ausatmen. In dieser Praxis geht es nur um das Wahrnehmen; sie ist keine Behandlung von Inkontinenz, Senkung oder Schmerzen, dafür braucht es eine Fachperson für Beckengesundheit.", ru: "На МРТ диафрагма и тазовое дно опускаются вместе на вдохе и поднимаются на выдохе. Эта практика только про наблюдение; это не лечение недержания, пролапса или боли, для них нужен специалист по тазовому здоровью.", uk: "На МРТ діафрагма і тазове дно опускаються разом на вдиху й піднімаються на видиху. Ця практика лише про спостереження; це не лікування нетримання, пролапсу чи болю, для них потрібен фахівець із тазового здоров’я." },
    steps: [
      { en: "Lie on your back, knees bent, one hand low on the belly.", de: "Leg dich mit angewinkelten Knien auf den Rücken, eine Hand tief auf den Bauch.", ru: "Ляг на спину, колени согнуты, ладонь внизу живота.", uk: "Ляж на спину, коліна зігнуті, долоня внизу живота." },
      { en: "Inhale 4 seconds and sense a gentle widening low in the belly and between the sit bones.", de: "Atme 4 Sekunden ein und spüre eine sanfte Weitung tief im Bauch und zwischen den Sitzbeinhöckern.", ru: "Вдох 4 секунды и почувствуй мягкое расширение внизу живота и между седалищными костями.", uk: "Вдих 4 секунди і відчуй м’яке розширення внизу живота і між сідничними кістками." },
      { en: "Exhale 6 seconds and feel it gently return. No squeezing, no bearing down.", de: "Atme 6 Sekunden aus und spüre, wie sie sanft zurückgeht. Nicht anspannen, nicht pressen.", ru: "Выдох 6 секунд и почувствуй, как всё мягко возвращается. Без сжатия и натуживания.", uk: "Видих 6 секунд і відчуй, як усе м’яко повертається. Без стискання і натужування." },
    ],
    cautions: [{ en: "During pregnancy, after birth or with pelvic symptoms, do this only after talking to your specialist.", de: "In der Schwangerschaft, nach der Geburt oder bei Beckenbeschwerden nur nach Rücksprache mit deiner Fachperson.", ru: "Во время беременности, после родов или при тазовых симптомах делай это только после разговора со специалистом.", uk: "Під час вагітності, після пологів або при тазових симптомах роби це лише після розмови з фахівцем." }, stop],
    pattern: [{ kind: "inhale", seconds: 4 }, { kind: "exhale", seconds: 6 }],
    durations: [1, 3, 5],
    level: "beginner",
    evidence: "pelvic-floor",
  },
];

export const practiceById = Object.fromEntries(practices.map((p) => [p.id, p])) as Record<string, Practice>;

export function listPractices(filter?: { goal?: string; category?: string }): Practice[] {
  return practices.filter((p) => (!filter?.goal || p.goals.includes(filter.goal as Practice["goals"][number])) && (!filter?.category || p.category === filter.category));
}

export function cycleSeconds(p: Practice): number {
  return p.pattern.reduce((n, ph) => n + ph.seconds, 0);
}

/** Body-map regions that have a fitting breathing practice */
export const practiceByRegion: Partial<Record<string, string>> = {
  chest: "ribs-mobility",
  upperBack: "ribs-mobility",
  spine: "spine-wave",
  lowerBack: "spine-wave",
  pelvis: "pelvic-awareness",
};
