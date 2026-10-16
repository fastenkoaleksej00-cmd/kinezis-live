import type { RegionId } from "@/lib/body/regions";
import type { EvidenceLevel } from "@/lib/breath/types";
import type { LocalizedText } from "@/lib/content/types";

/**
 * Mind & rest content. Wording rules as for breathing: support for well-being, no treatment claims,
 * evidence level shown with the source. German falls back to English.
 */

export interface TimedStep {
  text: LocalizedText;
  /** Seconds for fixed-length sequences; relative weight for meditations stretched to the chosen length */
  seconds: number;
  region?: RegionId;
}

export interface Meditation {
  id: "body-scan" | "breath-awareness";
  title: LocalizedText;
  purpose: LocalizedText;
  durations: number[];
  steps: TimedStep[];
  cautions: LocalizedText[];
  evidence: string;
}

export interface MindEvidence {
  id: string;
  level: EvidenceLevel;
  note: LocalizedText;
  sources: Array<{ citation: string; url: string }>;
}

export const mindEvidence: Record<string, MindEvidence> = {
  mindfulness: {
    id: "mindfulness",
    level: "encouraging",
    note: {
      en: "Structured mindfulness programmes (usually 8 weeks) showed small to moderate improvements in anxiety, low mood and pain in a large review. Short single sessions are less studied; treat them as a calm pause, not a treatment.", de: "Strukturierte Achtsamkeitsprogramme (meist 8 Wochen) zeigten in einer großen Übersichtsarbeit kleine bis mittlere Verbesserungen bei Angst, gedrückter Stimmung und Schmerzen. Kurze einzelne Einheiten sind weniger untersucht; sieh sie als ruhige Pause, nicht als Behandlung.",
      ru: "Структурированные программы осознанности (обычно 8 недель) в крупном обзоре давали малое или умеренное улучшение тревоги, подавленного настроения и боли. Короткие разовые сессии изучены хуже; относитесь к ним как к спокойной паузе, а не лечению.",
      uk: "Структуровані програми усвідомленості (зазвичай 8 тижнів) у великому огляді давали мале або помірне покращення тривоги, пригніченого настрою та болю. Короткі разові сесії вивчені гірше; сприймайте їх як спокійну паузу, а не лікування.",
    },
    sources: [{ citation: "Goyal M. et al. Meditation programs for psychological stress and well-being: a systematic review and meta-analysis. JAMA Intern Med. 2014;174(3):357–368.", url: "https://doi.org/10.1001/jamainternmed.2013.13018" }],
  },
  gratitude: {
    id: "gratitude",
    level: "encouraging",
    note: {
      en: "Gratitude exercises show small, consistent effects on well-being in a meta-analysis; effects against active comparison activities are smaller.", de: "Dankbarkeitsübungen zeigen in einer Metaanalyse kleine, beständige Effekte auf das Wohlbefinden; gegenüber aktiven Vergleichsaktivitäten sind die Effekte kleiner.",
      ru: "Упражнения на благодарность в метаанализе дают небольшой, но устойчивый эффект на самочувствие; по сравнению с другими активными занятиями эффект меньше.",
      uk: "Вправи на вдячність у метааналізі дають невеликий, але стабільний ефект на самопочуття; порівняно з іншими активними заняттями ефект менший.",
    },
    sources: [{ citation: "Davis D.E. et al. Thankful for the little things: a meta-analysis of gratitude interventions. J Couns Psychol. 2016;63(1):20–31.", url: "https://doi.org/10.1037/cou0000107" }],
  },
  breaks: {
    id: "breaks",
    level: "insufficient",
    note: {
      en: "Research on short movement and eye breaks during screen work is limited and mixed. Use the break for comfort and to change position; it is not a treatment for pain or eye conditions.", de: "Die Forschung zu kurzen Bewegungs- und Augenpausen bei Bildschirmarbeit ist begrenzt und uneinheitlich. Nutze die Pause für Wohlgefühl und einen Positionswechsel; sie behandelt keine Schmerzen oder Augenerkrankungen.",
      ru: "Исследования коротких перерывов на движение и отдых глаз при работе за экраном ограничены и противоречивы. Используйте перерыв для комфорта и смены позы; это не лечение боли или болезней глаз.",
      uk: "Дослідження коротких перерв на рух і відпочинок очей під час роботи за екраном обмежені й суперечливі. Використовуйте перерву для комфорту та зміни пози; це не лікування болю чи хвороб очей.",
    },
    sources: [],
  },
  evening: {
    id: "evening",
    level: "insufficient",
    note: {
      en: "A calm, regular wind-down is a common sleep-hygiene recommendation, but evidence for any specific evening routine is limited. Persistent sleep problems need a specialist.", de: "Ein ruhiges, regelmäßiges Herunterfahren ist eine übliche Schlafhygiene-Empfehlung, die Evidenz für eine bestimmte Abendroutine ist aber begrenzt. Anhaltende Schlafprobleme gehören zu einer Fachperson.",
      ru: "Спокойный регулярный ритуал перед сном — частая рекомендация гигиены сна, но доказательства для конкретной вечерней рутины ограничены. Стойкие проблемы со сном требуют специалиста.",
      uk: "Спокійний регулярний ритуал перед сном — поширена рекомендація гігієни сну, але докази для конкретної вечірньої рутини обмежені. Стійкі проблеми зі сном потребують фахівця.",
    },
    sources: [],
  },
};

export const meditations: Meditation[] = [
  {
    id: "body-scan",
    title: { en: "Body scan", de: "Body Scan", ru: "Сканирование тела", uk: "Сканування тіла" },
    purpose: {
      en: "Move attention slowly from the feet to the head and notice each area without changing anything.", de: "Lenke die Aufmerksamkeit langsam von den Füßen zum Kopf und nimm jeden Bereich wahr, ohne etwas zu verändern.",
      ru: "Медленно ведите внимание от стоп к голове и замечайте каждую область, ничего не меняя.",
      uk: "Повільно ведіть увагу від стоп до голови й помічайте кожну ділянку, нічого не змінюючи.",
    },
    durations: [5, 10, 15],
    evidence: "mindfulness",
    cautions: [
      { en: "Sit or lie comfortably. Eyes open or closed, as you prefer.", de: "Setz oder leg dich bequem hin. Augen offen oder geschlossen, wie du magst.", ru: "Сядьте или лягте удобно. Глаза открыты или закрыты, как вам удобнее.", uk: "Сядьте або ляжте зручно. Очі відкриті чи заплющені, як вам зручніше." },
      { en: "If attention to the body brings up strong discomfort or distress, open your eyes and stop. That is fine.", de: "Wenn die Aufmerksamkeit auf den Körper starkes Unbehagen oder Belastung auslöst, öffne die Augen und hör auf. Das ist in Ordnung.", ru: "Если внимание к телу вызывает сильный дискомфорт или тревогу, откройте глаза и остановитесь. Это нормально.", uk: "Якщо увага до тіла викликає сильний дискомфорт чи тривогу, розплющте очі й зупиніться. Це нормально." },
    ],
    steps: [
      { seconds: 2, text: { en: "Settle in. Let the breath move on its own.", de: "Komm an. Lass den Atem von selbst fließen.", ru: "Устройтесь. Пусть дыхание идёт само.", uk: "Влаштуйтеся. Нехай дихання йде саме." } },
      { seconds: 2, region: "feet", text: { en: "Feet and ankles: contact with the floor, warmth, pressure.", de: "Füße und Knöchel: Kontakt zum Boden, Wärme, Druck.", ru: "Стопы и лодыжки: опора, тепло, давление.", uk: "Стопи й щиколотки: опора, тепло, тиск." } },
      { seconds: 1.5, region: "shins", text: { en: "Shins and calves. Just notice.", de: "Schienbeine und Waden. Einfach wahrnehmen.", ru: "Голени и икры. Просто замечайте.", uk: "Гомілки та литки. Просто помічайте." } },
      { seconds: 1.5, region: "knees", text: { en: "Knees: front, sides, back.", de: "Knie: vorn, seitlich, hinten.", ru: "Колени: спереди, по бокам, сзади.", uk: "Коліна: спереду, з боків, ззаду." } },
      { seconds: 1.5, region: "hips", text: { en: "Hips and thighs. Let them be heavy.", de: "Hüften und Oberschenkel. Lass sie schwer werden.", ru: "Тазобедренные суставы и бёдра. Пусть будут тяжёлыми.", uk: "Кульшові суглоби та стегна. Нехай будуть важкими." } },
      { seconds: 1.5, region: "pelvis", text: { en: "Pelvis and the base of the belly.", de: "Becken und unterer Bauch.", ru: "Таз и низ живота.", uk: "Таз і низ живота." } },
      { seconds: 1.5, region: "lowerBack", text: { en: "Lower back. If there is tension, simply register it.", de: "Unterer Rücken. Wenn dort Anspannung ist, nimm sie einfach zur Kenntnis.", ru: "Поясница. Если есть напряжение, просто отметьте его.", uk: "Поперек. Якщо є напруга, просто відзначте її." } },
      { seconds: 2, region: "chest", text: { en: "Chest and ribs rising and falling with the breath.", de: "Brust und Rippen heben und senken sich mit dem Atem.", ru: "Грудная клетка и рёбра поднимаются и опускаются с дыханием.", uk: "Грудна клітка й ребра піднімаються й опускаються з диханням." } },
      { seconds: 1.5, region: "upperBack", text: { en: "Upper back and shoulder blades.", de: "Oberer Rücken und Schulterblätter.", ru: "Верх спины и лопатки.", uk: "Верх спини та лопатки." } },
      { seconds: 1.5, region: "shoulders", text: { en: "Shoulders. Notice if they creep up toward the ears.", de: "Schultern. Bemerke, ob sie zu den Ohren hochwandern.", ru: "Плечи. Заметьте, не поднимаются ли они к ушам.", uk: "Плечі. Помітьте, чи не піднімаються вони до вух." } },
      { seconds: 1.5, region: "elbows", text: { en: "Arms, elbows, forearms.", de: "Arme, Ellbogen, Unterarme.", ru: "Руки, локти, предплечья.", uk: "Руки, лікті, передпліччя." } },
      { seconds: 1.5, region: "wrists", text: { en: "Wrists, palms, fingers.", de: "Handgelenke, Handflächen, Finger.", ru: "Запястья, ладони, пальцы.", uk: "Зап'ястя, долоні, пальці." } },
      { seconds: 1.5, region: "neck", text: { en: "Neck, jaw, face. Let the jaw soften.", de: "Nacken, Kiefer, Gesicht. Lass den Kiefer weich werden.", ru: "Шея, челюсть, лицо. Пусть челюсть расслабится.", uk: "Шия, щелепа, обличчя. Нехай щелепа розслабиться." } },
      { seconds: 2, text: { en: "The whole body at once, breathing. Stay here a moment.", de: "Der ganze Körper auf einmal, atmend. Bleib einen Moment hier.", ru: "Всё тело целиком, дышащее. Побудьте здесь немного.", uk: "Усе тіло разом, що дихає. Побудьте тут трохи." } },
    ],
  },
  {
    id: "breath-awareness",
    title: { en: "Breath awareness", de: "Atem-Achtsamkeit", ru: "Осознанное дыхание", uk: "Усвідомлене дихання" },
    purpose: {
      en: "Rest attention on the natural breath. When the mind wanders, notice it kindly and come back.", de: "Ruhe mit der Aufmerksamkeit auf dem natürlichen Atem. Wenn die Gedanken wandern, bemerke es freundlich und kehre zurück.",
      ru: "Держите внимание на естественном дыхании. Когда мысли уходят, мягко заметьте это и вернитесь.",
      uk: "Тримайте увагу на природному диханні. Коли думки йдуть, м'яко помітьте це й поверніться.",
    },
    durations: [3, 5, 10],
    evidence: "mindfulness",
    cautions: [
      { en: "Do not control the breath. If you feel short of breath or dizzy, stop.", de: "Steuere den Atem nicht. Bei Atemnot oder Schwindel hör auf.", ru: "Не управляйте дыханием. При нехватке воздуха или головокружении остановитесь.", uk: "Не керуйте диханням. Якщо бракує повітря чи паморочиться, зупиніться." },
    ],
    steps: [
      { seconds: 1, text: { en: "Sit upright but relaxed. Hands rest where they are.", de: "Sitz aufrecht, aber entspannt. Die Hände bleiben, wo sie sind.", ru: "Сядьте ровно, но расслабленно. Руки лежат как лежат.", uk: "Сядьте рівно, але розслаблено. Руки лежать як лежать." } },
      { seconds: 2, text: { en: "Find where you feel the breath most clearly: nose, chest or belly.", de: "Finde, wo du den Atem am deutlichsten spürst: Nase, Brust oder Bauch.", ru: "Найдите, где дыхание ощущается яснее всего: нос, грудь или живот.", uk: "Знайдіть, де дихання відчувається найчіткіше: ніс, груди чи живіт." } },
      { seconds: 3, text: { en: "Follow one breath in, one breath out. Then the next.", de: "Folge einem Atemzug ein, einem aus. Dann dem nächsten.", ru: "Проследите один вдох, один выдох. Потом следующий.", uk: "Простежте один вдих, один видих. Потім наступний." } },
      { seconds: 3, text: { en: "The mind will wander. Noticing that is the practice. Come back.", de: "Die Gedanken werden wandern. Das zu bemerken ist die Übung. Komm zurück.", ru: "Мысли будут уходить. Замечать это и есть практика. Возвращайтесь.", uk: "Думки відходитимуть. Помічати це і є практика. Повертайтеся." } },
      { seconds: 3, text: { en: "Let each exhale be a little softer than the last.", de: "Lass jedes Ausatmen ein wenig weicher sein als das vorige.", ru: "Пусть каждый выдох будет чуть мягче предыдущего.", uk: "Нехай кожен видих буде трохи м'якшим за попередній." } },
      { seconds: 1, text: { en: "Widen attention to the whole room. Open the eyes slowly.", de: "Weite die Aufmerksamkeit auf den ganzen Raum. Öffne langsam die Augen.", ru: "Расширьте внимание на всю комнату. Медленно откройте глаза.", uk: "Розширте увагу на всю кімнату. Повільно розплющте очі." } },
    ],
  },
];

export const meditationById = Object.fromEntries(meditations.map((m) => [m.id, m])) as Record<string, Meditation>;

/** Stretch a weighted list to the chosen length in seconds */
export function scaleSteps(steps: TimedStep[], totalSec: number): TimedStep[] {
  const sum = steps.reduce((n, s) => n + s.seconds, 0);
  return steps.map((s) => ({ ...s, seconds: Math.max(10, Math.round((s.seconds / sum) * totalSec)) }));
}

/** About 2.5 minutes at the desk */
export const screenBreak: TimedStep[] = [
  { seconds: 20, region: "neck", text: { en: "Tilt the right ear toward the right shoulder. Breathe.", de: "Neige das rechte Ohr zur rechten Schulter. Atme.", ru: "Наклоните правое ухо к правому плечу. Дышите.", uk: "Нахиліть праве вухо до правого плеча. Дихайте." } },
  { seconds: 20, region: "neck", text: { en: "Now the left side. No pulling, only the weight of the head.", de: "Jetzt die linke Seite. Nicht ziehen, nur das Gewicht des Kopfes.", ru: "Теперь влево. Не тяните, только вес головы.", uk: "Тепер ліворуч. Не тягніть, лише вага голови." } },
  { seconds: 20, region: "shoulders", text: { en: "Roll the shoulders back slowly, five times.", de: "Roll die Schultern langsam nach hinten, fünfmal.", ru: "Медленно вращайте плечи назад, пять раз.", uk: "Повільно обертайте плечі назад, п'ять разів." } },
  { seconds: 15, region: "upperBack", text: { en: "Hands behind the head, open the elbows, lift the chest gently.", de: "Hände hinter den Kopf, Ellbogen öffnen, die Brust sanft heben.", ru: "Руки за голову, разведите локти, мягко раскройте грудь.", uk: "Руки за голову, розведіть лікті, м'яко розкрийте груди." } },
  { seconds: 15, region: "wrists", text: { en: "Circle the wrists, then spread and relax the fingers.", de: "Kreise die Handgelenke, dann spreize und entspanne die Finger.", ru: "Покрутите запястьями, затем разведите и расслабьте пальцы.", uk: "Покрутіть зап'ястями, потім розведіть і розслабте пальці." } },
  { seconds: 20, text: { en: "Look at something at least 6 metres away. Let the eyes rest on it.", de: "Schau auf etwas, das mindestens 6 Meter entfernt ist. Lass die Augen darauf ruhen.", ru: "Посмотрите на предмет не ближе 6 метров. Дайте глазам отдохнуть на нём.", uk: "Подивіться на предмет не ближче 6 метрів. Дайте очам відпочити на ньому." } },
  { seconds: 15, text: { en: "Close the eyes, cup the palms over them without pressing.", de: "Schließ die Augen und leg die Handflächen darüber, ohne zu drücken.", ru: "Закройте глаза, накройте их ладонями, не надавливая.", uk: "Заплющте очі, накрийте їх долонями, не натискаючи." } },
  { seconds: 20, region: "spine", text: { en: "Stand up, reach both arms up, then let them fall. Back to work.", de: "Steh auf, streck beide Arme nach oben und lass sie fallen. Zurück an die Arbeit.", ru: "Встаньте, потянитесь руками вверх и отпустите. Можно возвращаться.", uk: "Встаньте, потягніться руками вгору й відпустіть. Можна повертатися." } },
];

export const screenBreakCautions: LocalizedText[] = [
  { en: "Move within comfort. Skip any step that causes pain, numbness or dizziness.", de: "Beweg dich im angenehmen Bereich. Lass jeden Schritt weg, der Schmerzen, Taubheit oder Schwindel auslöst.", ru: "Двигайтесь в комфортной амплитуде. Пропустите шаг, если он вызывает боль, онемение или головокружение.", uk: "Рухайтеся в комфортній амплітуді. Пропустіть крок, якщо він викликає біль, оніміння чи запаморочення." },
];

/** Gentle floor stretches for the evening ritual, about 3 minutes */
export const eveningStretch: TimedStep[] = [
  { seconds: 40, region: "lowerBack", text: { en: "Lying on the back, hug the knees to the chest. Rock slightly.", de: "Auf dem Rücken liegend die Knie zur Brust umarmen. Leicht schaukeln.", ru: "Лёжа на спине, обнимите колени и подтяните к груди. Слегка покачайтесь.", uk: "Лежачи на спині, обійміть коліна й підтягніть до грудей. Злегка погойдайтеся." } },
  { seconds: 30, region: "spine", text: { en: "Knees to the right, arms wide, look left. Easy twist.", de: "Knie nach rechts, Arme weit, Blick nach links. Leichte Drehung.", ru: "Колени вправо, руки в стороны, взгляд влево. Мягкое скручивание.", uk: "Коліна праворуч, руки в сторони, погляд ліворуч. М'яке скручування." } },
  { seconds: 30, region: "spine", text: { en: "Now knees to the left, look right.", de: "Jetzt Knie nach links, Blick nach rechts.", ru: "Теперь колени влево, взгляд вправо.", uk: "Тепер коліна ліворуч, погляд праворуч." } },
  { seconds: 45, region: "hips", text: { en: "Child's pose or legs resting on a chair. Long exhales.", de: "Kindhaltung oder Beine auf einem Stuhl ablegen. Lange Ausatmungen.", ru: "Поза ребёнка или ноги на стуле. Длинные выдохи.", uk: "Поза дитини або ноги на стільці. Довгі видихи." } },
  { seconds: 30, text: { en: "Lie still. Let the floor hold the whole body.", de: "Lieg still. Lass den Boden den ganzen Körper tragen.", ru: "Полежите неподвижно. Пусть пол держит всё тело.", uk: "Полежте нерухомо. Нехай підлога тримає все тіло." } },
];

export type ChallengeId = "breath7" | "meditate7" | "water7" | "journal7" | "breaks5";
export interface Challenge {
  id: ChallengeId;
  /** Days in the window and days needed to complete */
  window: number;
  target: number;
  habit: "breath" | "meditation" | "water" | "journal" | "screenBreak";
  href: string;
}

export const challenges: Challenge[] = [
  { id: "breath7", window: 7, target: 7, habit: "breath", href: "/breathe" },
  { id: "meditate7", window: 7, target: 5, habit: "meditation", href: "/mind/meditate/breath-awareness" },
  { id: "water7", window: 7, target: 7, habit: "water", href: "/health#water" },
  { id: "journal7", window: 7, target: 7, habit: "journal", href: "/mind/journal" },
  { id: "breaks5", window: 7, target: 5, habit: "screenBreak", href: "/mind/break" },
];
