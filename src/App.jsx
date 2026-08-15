import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  ShieldAlert, Dumbbell, Flame, Timer, Wind, ChevronDown, ChevronLeft,
  CheckCircle2, Circle, PlayCircle, PauseCircle, RotateCcw, Film,
  AlertTriangle, Info, Home as HomeIcon, ListChecks, BookOpen, Sparkles,
  X, Clock, Repeat
} from "lucide-react";

/* ============================== DESIGN TOKENS ============================== */
const C = {
  bg: "#0C1614",
  bgSoft: "#0F1D1A",
  surface: "#152522",
  surface2: "#1B302B",
  border: "#24403A",
  accent: "#38C9A1",      // control / stability mint
  accentSoft: "#1F4A40",
  danger: "#E4483C",      // brand red — safety / warnings
  dangerSoft: "#3A1D1B",
  gold: "#E8B94E",        // tempo / breath
  goldSoft: "#3B321B",
  text: "#F2F5F3",
  textMuted: "#8FA8A0",
  textFaint: "#5C726B",
};

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap');`;

/* ============================== PROGRAM DATA ============================== */

const PHASES = [
  { n: 1, title: "تعادل و پایداری", weeks: "۶ هفته" },
  { n: 2, title: "استقامت عضلانی و پایداری", weeks: "۴ هفته" },
  { n: 3, title: "قدرت", weeks: "۴ هفته" },
  { n: 4, title: "هماهنگی پیشرفته", weeks: "۶ هفته" },
  { n: 5, title: "توان انفجاری", weeks: "۴ هفته" },
];

const EQUIPMENT = [
  "دمبل", "کتل‌بل", "جیم‌بال", "بوسوبال", "کش مقاومتی (چند سایز)",
  "بارفیکس / نقطه اتصال بالا", "فوم رول",
];

const NUTRITION = {
  calories: "تقریباً ۳۵۰ تا ۴۰۰ کالری در هر جلسه (در صورت رعایت دقیق تمپو و استراحت)",
  preWorkout: [
    { label: "کربوهیدرات", value: "۰.۵ گرم به‌ازای هر کیلوگرم وزن بدن" },
    { label: "پروتئین", value: "۰.۳ گرم به‌ازای هر کیلوگرم وزن بدن" },
    { label: "چربی", value: "کم تا متوسط؛ حدود ۵ تا ۱۵ گرم" },
  ],
  preWorkoutTiming: "۲ تا ۳ ساعت قبل از تمرین",
  cardio: "علاوه بر برنامه، ۱۵۰ دقیقه ایروبیک سبک در هفته (۳ جلسه ۵۰ دقیقه‌ای) یا ۷۵ دقیقه ایروبیک نسبتاً سنگین (۳ جلسه ۲۵ دقیقه‌ای)",
  foamRolling: "شروع و پایان هر جلسه با فوم رول روی عضلات بیش‌فعال، برای ایمنی و سلامت عضلات",
};

const SAFETY = [
  {
    icon: "shield",
    title: "قانون اصلی: کنترل مهم‌تر از شدته",
    color: C.accent,
    points: [
      "هدف، اجرای کنترل‌شده، بدون درد و باکیفیته — نه صرفاً انجام حرکت",
      "دامنه حرکتی باید کنترل‌شده، بدون درد، بدون قفل‌شدن یا گزگز و بدون جبران حرکتی شدید باشد",
      "هرگز برای افزایش دامنه به بدن فشار نیار",
    ],
  },
  {
    icon: "alert",
    title: "قانون درد",
    color: C.danger,
    points: [
      "فشار عضلانی، خستگی و سوزش خفیف طبیعیه؛ درد تیز، تیرکشنده یا عصبی طبیعی نیست",
      "متوقف کن اگر: درد بیش از ۳ از ۱۰ شد، در حال افزایش بود، به دست/پا منتشر شد، بی‌حسی یا ضعف ایجاد شد، یا کنترل حرکت از بین رفت",
      "قانون ۲۴ ساعته: اگر درد یا التهاب تا ۲۴ ساعت بعد بدتر شد، شدت تمرین زیاد بوده",
    ],
  },
  {
    icon: "back",
    title: "کمر، دیسک و سیاتیک",
    color: C.gold,
    points: [
      "شدت را محافظه‌کارانه انتخاب کن و فقط در دامنه‌ی بدون درد تمرین کن",
      "ممنوع: فلکشن شدید تکراری زیر بار، خم‌شدن انفجاری، چرخش شدید همراه خم‌شدن، ددلیفت/اسکوات سنگین با فرم ضعیف",
      "اولویت: ستون فقرات خنثی، تقویت Core، هیپ هینج صحیح، کاهش دامنه در صورت نیاز",
    ],
  },
  {
    icon: "knee",
    title: "زانو",
    color: C.gold,
    points: [
      "ممنوع: فروپاشی زانو به داخل، فرود بی‌کنترل، افزایش ناگهانی حجم پرش",
      "تمرکز: کنترل زانو روی راستای پنجه، تقویت گلوت و همسترینگ، فرود نرم",
    ],
  },
  {
    icon: "shoulder",
    title: "شانه و گردن",
    color: C.gold,
    points: [
      "ممنوع: پرس/کشش بالای سر همراه درد، شراگ و تنش گردنی بیش‌ازحد",
      "تمرکز: کنترل کتف، دامنه بدون درد، ثبات شانه",
    ],
  },
  {
    icon: "wind",
    title: "تنفس و ریکاوری",
    color: C.accent,
    points: [
      "تنفس ریتمیک و کنترل‌شده؛ حبس نفس طولانی یا زور زدن بدون کنترل فشار شکمی ممنوع",
      "فشار خون بالا، مشکلات قلبی یا سابقه سرگیجه = محافظه‌کارتر تمرین کن",
      "کمبود خواب، استرس شدید یا ریکاوری ضعیف ریسک آسیب رو بالا می‌بره — در این شرایط شدت رو کم کن",
    ],
  },
  {
    icon: "stop",
    title: "توقف فوری در صورت مشاهده",
    color: C.danger,
    points: [
      "درد شدید یا انتشاری، بی‌حسی، ضعف ناگهانی، قفل‌شدن مفصل",
      "سرگیجه، درد قفسه سینه، تنگی نفس غیرعادی",
      "در این موارد تمرین رو قطع کن و به متخصص مراجعه کن",
    ],
  },
];

const PATTERNS = [
  {
    id: "squat", name: "Squat Pattern", nameFa: "الگوی اسکوات",
    avoid: ["زانو به داخل", "قوس پا خوابیده", "پاشنه بلندشده", "کمر گرد", "کمر بیش‌ازحد گود",
      "تنه فرو ریخته", "لگن چرخیده", "پایین رفتن سریع و کنترل‌نشده", "عمق بیشتر از ظرفیت کنترل",
      "اضافه‌کردن وزنه قبل از ثبات تکنیکی"],
  },
  {
    id: "hinge", name: "Hinge Pattern", nameFa: "الگوی هینج",
    avoid: ["کمر گرد", "کمر بیش‌ازحد گود", "حرکت از ستون فقرات به‌جای لگن", "تبدیل هینج به اسکوات",
      "جلو رفتن زیاد زانو", "بالا گرفتن سر", "چرخش لگن", "از دست رفتن تعادل", "پرتاب وزنه",
      "افزایش دامنه بدون کنترل ستون فقرات"],
  },
  {
    id: "push", name: "Push Pattern", nameFa: "الگوی پوش (هل دادن)",
    avoid: ["بالا کشیدن شانه‌ها", "تنش زیاد گردن", "افتادن لگن", "قوس کمر", "باز شدن دنده‌ها",
      "جلو آمدن سر", "باز شدن بیش‌ازحد آرنج", "افتادن شانه", "چرخش تنه در پرس تک‌دست",
      "فشار دادن از کمر به‌جای تنه و شانه پایدار"],
  },
  {
    id: "pull", name: "Pull Pattern", nameFa: "الگوی پول (کشیدن)",
    avoid: ["بالا کشیدن شانه‌ها", "تنش گردن", "جلو آمدن سر", "گرد شدن پشت", "قوس کمر",
      "باز شدن دنده‌ها", "کشیدن با مومنتوم", "چرخش تنه در Row تک‌دست", "رها کردن فاز برگشت",
      "کشیدن بیش‌ازحد آرنج به عقب", "درد جلوی شانه یا بی‌ثباتی شانه"],
  },
];

const WARMUP = {
  totalDuration: "تقریباً ۲۵ دقیقه — قبل از هر ۳ جلسه انجام بشه",
  parts: [
    {
      id: "w1", title: "پارت ۱ — مچ پا، زانو و مفاصل بالایی",
      moves: [
        { name: "موبیلیتی مچ پا رو به دیوار", reps: "۱۰ تکرار هر پا", cues: ["فاصله پا از دیوار به‌اندازه یک پنجه", "با کنترل زانو رو ببر تا دیوار و برگردون، بدون مکث"], video: { file: "Warm-up1", t: "00:00:44" } },
        { name: "نشستن روی دیوار (کم‌عمق) + بلندشدن پنجه", reps: "۱۰ تکرار", cues: ["عمق کم، چون پا هنوز گرم نیست", "پنجه رو بکش بالا"], video: { file: "Warm-up1", t: "00:01:48" } },
        { name: "نشستن دو زانو (کشش جلوی ران)", reps: "چند نفس عمیق", cues: ["با عضلات جلوی پا کنترل کن، نه با فیله کمر"], video: { file: "Warm-up1", t: "00:02:39" } },
        { name: "لانج متناوب سبک", reps: "هر طرف چند بار", cues: ["پای عقب دوباره برمی‌گرده", "اگه فشار داره، ورژن کوتاه‌تر (بالا-پایین جزئی)"], video: { file: "Warm-up1", t: "00:03:16" } },
        { name: "ایروبیک سبک (Zone 2)", reps: "۲–۳ دقیقه", cues: ["تردمیل/طناب/مارش/موزیک — هرچی داری", "باید بتونی حرف بزنی بدون نفس‌نفس زدن"], video: { file: "Warm-up1", t: "00:04:10" } },
        { name: "گردن: چپ و راست", reps: "چند تکرار", cues: ["انگار می‌خوای نقطه‌کور پشت شونه‌تو ببینی", "بدون مکس"], video: { file: "Warm-up1", t: "00:06:39" } },
        { name: "گردن: بالا و پایین (چانه)", reps: "چند تکرار", cues: ["فقط چونه میاد، گردن خم نمی‌شه", "با کنترل، بدون حرکت شلاقی"], video: { file: "Warm-up1", t: "00:07:14" } },
        { name: "گردن: نیم‌دایره جلو و عقب", reps: "چند تکرار هرکدام", cues: ["در تمام مسیر نقطه‌کور رو دنبال کن"], video: { file: "Warm-up1", t: "00:07:34" } },
        { name: "شونه: دایره بازو رو به جلو", reps: "چند تکرار", cues: ["کتف از پشت همراه دست بالا بیاد", "بالا: کف دست به هم؛ پایین: کف دست به پا"], video: { file: "Warm-up1", t: "00:08:44" } },
        { name: "شونه: دایره بازو معکوس", reps: "چند تکرار", cues: ["دایره معمولی، نه خیلی بزرگ", "دست از راستای بدن جلو نیاد"], video: { file: "Warm-up1", t: "00:09:41" } },
        { name: "شونه با کش: چرخش کنترل‌شده", reps: "چند تکرار", cues: ["آروم برو، تا هرجا درد گرفت همونجا نگه دار", "فقط عقب و جلو، بدون مکس"], video: { file: "Warm-up1", t: "00:09:52" } },
        { name: "کش: کشش کمر جلو و عقب", reps: "چند تکرار", cues: ["دم کمر رو جلو و عقب بکش", "قلنج شنیدنش اشکالی نداره"], video: { file: "Warm-up1", t: "00:10:16" } },
      ],
    },
    {
      id: "w2", title: "پارت ۲ — شونه، ستون فقرات و لگن",
      moves: [
        { name: "کش: چرخش بازو محوری", reps: "هر طرف", cues: ["فقط دست تو محور حرکت کنه، آرنج صاف", "کار قدرتی نیست، فقط موبیلیتی"], video: { file: "Warm-up2", t: "00:00:00" } },
        { name: "کش پشت بدن: کشش متناوب بالا/پایین", reps: "چند تکرار", cues: ["فاصله رو تنظیم کن تا کشش کامل حس بشه"], video: { file: "Warm-up2", t: "00:00:24" } },
        { name: "کش پشت: باز کردن با چرخش", reps: "چند تکرار", cues: ["دست‌ها لازم نیست ۹۰ درجه به هم برسن", "موازی هم می‌مونن پشت بدن"], video: { file: "Warm-up2", t: "00:00:53" } },
        { name: "کش نشسته: کشش سه‌ضلعی", reps: "هر ضلع", cues: ["دو ضلع روبه‌رو رو بکش، بعد هر سه ضلع رو باز کن"], video: { file: "Warm-up2", t: "00:01:54" } },
        { name: "وال‌ساید (Wall Slide)", reps: "چند تکرار", cues: ["کمر، سر و لگن به دیوار چسبیده", "گودی کمر رو با سفت‌کردن Core پر کن، شونه از دیوار جدا نشه"], video: { file: "Warm-up2", t: "00:02:25" } },
        { name: "کشش عضلات دنده‌ای/کتف با دیوار", reps: "چند تکرار (+ اختیاری با کش)", cues: ["ساعد در تمام مسیر روی دیوار بمونه", "برای عضلات تثبیت‌کننده کتف از بغل"], video: { file: "Warm-up2", t: "00:03:18" } },
        { name: "چرخش ملایم بالاتنه", reps: "چند تکرار", cues: ["نه خیلی شدید، فقط یه چرخش ملایم"], video: { file: "Warm-up2", t: "00:04:28" } },
        { name: "مهره وسط (نشسته)", reps: "۱۰–۱۵ تکرار", cues: ["شونه‌ها ثابت، کتف بیفته، گودی کمر ایجاد کن"], video: { file: "Warm-up2", t: "00:04:55" } },
        { name: "Open Book (چرخش ستون فقرات میانی)", reps: "هر طرف (+ اختیاری با کش)", cues: ["چرخش از مهره‌های وسط (۶ تا ۱۷/۱۸)، نه از پایین", "نگاهت کف دستتو دنبال کنه", "برای دیسک کمر مضر نیست اگه درست انجام بشه"], video: { file: "Warm-up2", t: "00:05:50" } },
        { name: "نسخه نشسته با تمرکز شونه", reps: "هر طرف (+ اختیاری با کش)", cues: ["لگن سمت دیوار بچسبه به دیوار", "نگاهت دستتو دنبال کنه"], video: { file: "Warm-up2", t: "00:07:46" } },
        { name: "لگن: فلکشن، اکستنشن، ابداکشن، ادداکشن، چرخش خارجی ۴۵°", reps: "۵ تکرار هرجهت، هر پا", cues: ["اگه لازم داری برای تعادل، دستتو بذار جایی"], video: { file: "Warm-up2", t: "00:09:00" } },
      ],
    },
    {
      id: "w3", title: "پارت ۳ — ترکیبی، شنا، پل باسن و آماده‌سازی پلایومتریک",
      moves: [
        { name: "ترکیب چندجهته لگن روی زمین", reps: "۵ تکرار هر طرف", cues: ["جلو، عقب و چرخش رو با هم در یک مسیر انجام بده"], video: { file: "Warm-up3", t: "00:00:07" } },
        { name: "همون حرکت با فوم رول / دیوار (ساپورت)", reps: "۵ تکرار هر طرف", cues: ["اگه فوم رول نداری، نسخه نشسته رو بیشتر کار کن"], video: { file: "Warm-up3", t: "00:01:02" } },
        { name: "چرخش لگن ایستاده (پنجه رو‌به‌رو)", reps: "چند تکرار", cues: ["بالاتنه ثابت بمونه، فقط لگن/مچ/زانو بچرخه", "زانوها ۹۰ درجه می‌چرخه"], video: { file: "Warm-up3", t: "00:01:50" } },
        { name: "نشسته ۹۰/۹۰ چرخش لگن", reps: "چند تکرار", cues: ["وزنتو خیلی عقب نندازی، چالش روی لگن حفظ بشه"], video: { file: "Warm-up3", t: "00:02:32" } },
        { name: "مچ دست: چرخش و وزن‌اندازی ملایم", reps: "چند تکرار", cues: ["وزن رو کامل روی مچ نندازی، خیلی نرم باش"], video: { file: "Warm-up3", t: "00:03:14" } },
        { name: "شنا زانو زده", reps: "چند تکرار", cues: ["دایموند یا باز — دست تو زاویه باشه که شونه درد نگیره"], video: { file: "Warm-up3", t: "00:04:32" } },
        { name: "کش: پشت بازو (فعال‌سازی)", reps: "هر طرف", cues: ["بازو چسبیده به گوش، انگار پشت‌بازو می‌زنی"], video: { file: "Warm-up3", t: "00:05:11" } },
        { name: "پل باسن", reps: "چند تکرار", cues: ["گودی کمر رو بالا نیار، احساس کن پشت پا هم منقبض می‌شه"], video: { file: "Warm-up3", t: "00:05:53" } },
        { name: "اسکوات اورهد (دامنه محدود تا ۹۰°)", reps: "چند تکرار", cues: ["بازو از گوش جدا نشه", "بدن جلو نیاد، گودی کمر زیاد نشه"], video: { file: "Warm-up3", t: "00:06:53" } },
        { name: "هیپ هینج تمرینی (با چوب/دیوار/فوم‌رول)", reps: "چند تکرار", cues: ["خم‌شدن از کمر بدون قوس کردن کمر"], video: { file: "Warm-up3", t: "00:07:28" } },
        { name: "⭐ فرود نرم دو پا (Pogo Prep)", reps: "چند تکرار", plyoFoundation: true, cues: ["پا فقط به زمین ضربه بزنه، خیلی نرم", "برای شدت بیشتر: دست از بدنت رد بشه"], video: { file: "Warm-up3", t: "00:08:48" } },
        { name: "⭐ پگو جامپ", reps: "تا خستگی خفیف ساق", plyoFoundation: true, cues: ["پنجه بالا، با پاشنه زمین نخور", "بیومکانیک کار می‌کنه، نه زحمت تو"], video: { file: "Warm-up3", t: "00:09:49" } },
        { name: "⭐ لانج جهشی سبک (تمرکز روی فرود)", reps: "چند تکرار هر پا", plyoFoundation: true, cues: ["روی فرود تمرکز کن نه روی پرش", "زمان تماس با زمین زیر نیم‌ثانیه"], video: { file: "Warm-up3", t: "00:10:54" } },
      ],
    },
  ],
};

const SESSION_NOTES = {
  rest: "۶۰ تا ۹۰ ثانیه بین ست‌ها",
  intensity: "۵۰ تا ۶۰٪ رکورد — طوری که بدونی تا آخر ست می‌تونی ادامه بدی",
  tempo: "۴ ثانیه فاز پایین (دم) → ۲ ثانیه مکث → فاز بالا (بازدم)",
  dropLevel: "اگه وسط ست خسته شدی، از نسخه پیشرفته به متوسط یا مبتدی افت کن ولی ست رو کامل کن",
};

const MOVEMENTS = {
  m1: {
    name: "استپ بالا و پایین تک پا", pattern: "squat",
    equipment: ["صندلی (سطح صاف)"],
    cues: [
      "زانو در راستای انگشت دوم و سوم پا (نه به سمت شست، نه به سمت انگشت کوچیک)",
      "سه‌نقطه تماس کف پا حفظ بشه (Tripod Foot): پاشنه، پشت شست، پشت انگشت کوچیک",
      "پایین رفتن با کنترل کامل تا نوک پنجه؛ جایی که کنترل از دست رفت، ادامه نده",
    ],
    variantEasy: "با یک توپ کنار دیوار: زانوی پای بالا رو پشت زانوی پای ستون بذار و پایین بیا",
    video: { file: "Day1-Set1", t: "00:00:00" },
  },
  m2: {
    name: "ددلیفت رومانی تک‌دمبل", pattern: "hinge",
    equipment: ["دمبل", "چوب/دسته جارو (برای تمرین فرم)"],
    cues: [
      "سینه و لگن هم‌راستا و هم‌زمان حرکت کنن (نه اول سینه، بعد لگن)",
      "چوب پشت بدن باید ۳ نقطه رو لمس کنه: سر، شونه، باسن — در تمام مسیر جدا نشه",
      "پایین رفتن فقط تا بین ساق و بالای مچ کافیه، نیازی به رسیدن به زمین نیست",
    ],
    variantEasy: "بدون وزنه یا با هر دو دست، یک پا جلو — حتماً این نسخه رو حتی در سطح پیشرفته هم اول تمرین کن",
    variantAdvanced: "دمبل در دست مخالفِ پای جلو",
    note: "مناسب افراد دارای دیسک کمر یا سیاتیک هم هست، به‌شرط رعایت دقیق تکنیک",
    video: { file: "Day1-Set2", t: "00:00:00" },
  },
  m3a: {
    name: "پرس سینه روی جیم‌بال (تک‌دست)", pattern: "push",
    equipment: ["دمبل", "جیم‌بال"],
    cues: [
      "آرنج کمی به سمت جلو، نه دقیقاً در خط شونه (کاهش فشار جلوی شونه)",
      "گردن روی توپ ساپورت بشه، رو هوا نگه‌داشته نشه",
      "پاها به اندازه عرض شونه باز باشه",
    ],
    variantEasy: "به پشت روی زمین دراز بکش و همون حرکت رو انجام بده",
    video: { file: "Day1-Set3", t: "00:00:55" },
  },
  m3b: {
    name: "روئینگ گوریلا (تک‌دست)", pattern: "pull",
    equipment: ["دمبل", "بالشت/توپ برای ساپورت دست دیگر"],
    cues: [
      "باسن پایین‌تر از سینه نگه داشته بشه (پوزیشن گوریلا)",
      "دم سینه بکش، تنه در حین کشیدن نچرخه",
      "لگن رو پایین نگه داشتن = گودی کمر پر می‌شه، نه گود می‌شه",
    ],
    variantEasy: "چهار دست و پای معمولی، بدون نگه‌داشتن لگن پایین (پایداری کمتر لازم)",
    video: { file: "Day1-Set3", t: "00:03:13" },
  },
  m4a: {
    name: "فلای سینه با کش، تک‌دست، نیم‌زانو روی بوسوبال", pattern: "push",
    optional: true,
    equipment: ["کش", "بوسوبال (یا زمین/بالش)"],
    cues: [
      "بند در ارتفاع تقریبی شونه بسته بشه",
      "همزمان یک کار ضد چرخش هم انجام می‌شه — در برابر چرخش کش مقاومت کن",
      "پاهای بازتر روی بوسوبال = چالش تعادل بیشتر",
    ],
    video: { file: "Day1-Set4", t: "00:00:00" },
  },
  m4b: {
    name: "فلای سرشونه با کش، تک‌دست، نیم‌زانو روی بوسوبال", pattern: "pull",
    equipment: ["کش", "بوسوبال"],
    cues: [
      "فقط تا جایی عقب بکش که کشش طناب حفظ بشه (کامل جلو نبر)",
      "کامل بکش عقب بدون اینکه تنه بچرخه — حرکت ضد چرخشی",
    ],
    video: { file: "Day1-Set4", t: "00:01:25" },
  },
  m5: {
    name: "پشت بازو با کش، تک‌دست، نیم‌زانو (چکشی کنار گوش)", pattern: "push",
    equipment: ["کش"],
    cues: [
      "آرنج رو با دست مخالف ثابت نگه دار — فقط آرنج حرکت کنه",
      "دست رو تا دم گوش بیار بالا، در ارتفاع شونه یا کمی بالاتر",
      "فاصله از تکیه‌گاه کش رو طوری تنظیم کن که کشش متناسب باشه",
    ],
    video: { file: "Day1-Set5", t: "00:00:00" },
  },
  m6: {
    name: "Anti-Extension ایزومتریک با کش، نیم‌زانو (کور)", pattern: "core",
    equipment: ["کش"],
    cues: [
      "کش می‌کشدت به سمت باز شدن — تو در برابرش مقاومت می‌کنی (ضد باز شدن)",
      "برای چالش بیشتر می‌تونی فاصله رو از تکیه‌گاه بازتر کنی",
      "این پایه‌ی Anti-extension / Anti-flexion / Anti-rotation برای تقویت Core و بافت‌های پیوندیه",
    ],
    safetyNote: "اگر مشکل کمر داری: فشار خیلی سبک، فقط تا حدی که عضلات تحتانی ستون فقرات فعال بشن، بدون چالش زیاد",
    video: { file: "Day1-Set6", t: "00:00:00" },
  },
};

const progress = {
  default: (week) => {
    if (week <= 2) return { sets: 2, reps: 12, mode: "reps" };
    if (week <= 5) return { sets: 3, reps: 12, mode: "reps" };
    return { sets: 2, reps: 8, mode: "reps" };
  },
  m5: (week) => {
    if (week <= 2) return { sets: 2, reps: 15, mode: "reps" };
    if (week <= 5) return { sets: 3, reps: 15, mode: "reps" };
    return { sets: 2, reps: 10, mode: "reps" };
  },
  m6: () => ({ sets: 3, duration: 35, mode: "duration" }),
};

const LEVELS = {
  beginner: { label: "مبتدی", slots: [1, 3, 5] },
  intermediate: { label: "متوسط", slots: [1, 2, 3, 5] },
  advanced: { label: "پیشرفته", slots: [1, 2, 3, 4, 5, 6] },
};

const DAY1_SLOTS = [
  { slot: 1, type: "single", ids: ["m1"], prog: "default" },
  { slot: 2, type: "single", ids: ["m2"], prog: "default" },
  { slot: 3, type: "alt", ids: ["m3a", "m3b"], prog: "default" },
  { slot: 4, type: "alt", ids: ["m4a", "m4b"], prog: "default" },
  { slot: 5, type: "single", ids: ["m5"], prog: "m5" },
  { slot: 6, type: "single", ids: ["m6"], prog: "m6" },
];

const COOLDOWN = {
  duration: "حدود ۱۰ دقیقه — کشش عضلات درگیر یا گرفته",
  moves: [
    {
      name: "کشش کودک / ستون فقرات (روی زمین)",
      hold: "۳۰ تا ۶۰ ثانیه",
      cues: [
        "لگن و دست‌ها رو از هم دور کن، دنبالچه کشیده بشه عقب و دست کشیده بشه جلو",
        "لگن رو بالا نگه ندار، بذار کاملاً پایین بیفته",
        "تمرکز روی ریلکس‌شدن عضلات پایین کمر که تحت فشار زیادی بودن",
      ],
      video: { file: "Cool_down", t: "00:00:57" },
    },
  ],
  note: "بعد از هر جلسه که کمر تحت فشار بوده، وقت بذار تا Lower Back به حالت اولیه برگرده — طبیعیه که کشش بیشتری از قبل تمرین حس کنی.",
};

/* ============================== VIDEO LINKS ============================== */
// وقتی ویدیوها روی یوتیوب (Private) آپلود شدن، فقط همین‌جا video-id هر فایل رو پر کن.
// مثال: "Warm-up1": "dQw4w9WgXcQ"  (فقط همون کد بعد از v= تو لینک یوتیوب، بدون بقیه‌ی آدرس)
const VIDEO_IDS = {
  "Warm-up1": "CIhEdYm8Ju4",
  "Warm-up2": "4M9s65jYTjM",
  "Warm-up3": "_lZcXpfmRqg",
  "Day1-Set1": "zMr2eQtuwNc",
  "Day1-Set2": "gvcwPWaX5yc",
  "Day1-Set3": "cnD72ZQy0LQ",
  "Day1-Set4": "4C-pWOSJ_SI",
  "Day1-Set5": "VNe3HDtABL8",
  "Day1-Set6": "Ex8qH38niaU",
  "Cool_down": "K7ODd6-Guig",
  "Introduction": "fisvjhsDQQQ",
  "Nokat-Sabet": "DnU-rvLx5eI",
};

function timeToSeconds(t) {
  // "00:01:48" -> ثانیه
  if (!t) return 0;
  const parts = t.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return Number(t) || 0;
}

/* ============================== HELPERS ============================== */

function fmtTime(totalSec) {
  const m = Math.floor(totalSec / 60).toString().padStart(2, "0");
  const s = Math.floor(totalSec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function patternMeta(id) {
  return PATTERNS.find((p) => p.id === id);
}

/* ============================== TIMER WIDGET ============================== */

function TimerPanel({ mode, onClose, defaultRest, tempo, holdSeconds }) {
  const [kind, setKind] = useState(mode || "rest"); // 'rest' | 'tempo' | 'hold'
  const [running, setRunning] = useState(false);

  // rest / hold countdown
  const [remaining, setRemaining] = useState(kind === "hold" ? holdSeconds : defaultRest);
  // tempo cycle
  const phases = [
    { key: "down", label: "پایین با کنترل — دم", sec: tempo.down, color: C.accent },
    { key: "hold", label: "مکث", sec: tempo.hold, color: C.gold },
    { key: "up", label: "بالا — بازدم", sec: tempo.up, color: C.danger },
  ];
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [phaseRemaining, setPhaseRemaining] = useState(phases[0].sec);
  const [cycles, setCycles] = useState(0);

  const intervalRef = useRef(null);

  useEffect(() => {
    // reset when switching kind
    setRunning(false);
    if (kind === "rest") setRemaining(defaultRest);
    if (kind === "hold") setRemaining(holdSeconds);
    if (kind === "tempo") {
      setPhaseIdx(0);
      setPhaseRemaining(phases[0].sec);
      setCycles(0);
    }
    // eslint-disable-next-line
  }, [kind]);

  useEffect(() => {
    if (!running) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      if (kind === "rest" || kind === "hold") {
        setRemaining((r) => {
          if (r <= 1) {
            setRunning(false);
            return 0;
          }
          return r - 1;
        });
      } else if (kind === "tempo") {
        setPhaseRemaining((r) => {
          if (r <= 1) {
            setPhaseIdx((idx) => {
              const nextIdx = (idx + 1) % phases.length;
              if (nextIdx === 0) setCycles((c) => c + 1);
              setPhaseRemaining(phases[nextIdx].sec);
              return nextIdx;
            });
            return phases[(phaseIdx + 1) % phases.length].sec;
          }
          return r - 1;
        });
      }
    }, 1000);
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line
  }, [running, kind, phaseIdx]);

  const reset = () => {
    setRunning(false);
    if (kind === "rest") setRemaining(defaultRest);
    if (kind === "hold") setRemaining(holdSeconds);
    if (kind === "tempo") {
      setPhaseIdx(0);
      setPhaseRemaining(phases[0].sec);
      setCycles(0);
    }
  };

  const currentPhase = phases[phaseIdx];
  const scale = kind === "tempo"
    ? currentPhase.key === "down"
      ? 0.55 + 0.45 * (1 - phaseRemaining / currentPhase.sec)
      : currentPhase.key === "up"
      ? 1 - 0.45 * (1 - phaseRemaining / currentPhase.sec)
      : 1
    : 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(6,12,10,0.72)", backdropFilter: "blur(2px)" }}
      onClick={onClose}
    >
      <div
        className="w-full sm:w-[420px] rounded-t-3xl sm:rounded-3xl p-5 pb-8"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            {kind !== "hold" && (
              <button
                onClick={() => setKind("rest")}
                className="px-3 py-1.5 rounded-full text-xs font-medium"
                style={{
                  background: kind === "rest" ? C.accent : "transparent",
                  color: kind === "rest" ? "#06110D" : C.textMuted,
                  border: `1px solid ${kind === "rest" ? C.accent : C.border}`,
                }}
              >
                تایمر استراحت
              </button>
            )}
            {kind !== "hold" && (
              <button
                onClick={() => setKind("tempo")}
                className="px-3 py-1.5 rounded-full text-xs font-medium"
                style={{
                  background: kind === "tempo" ? C.gold : "transparent",
                  color: kind === "tempo" ? "#241C05" : C.textMuted,
                  border: `1px solid ${kind === "tempo" ? C.gold : C.border}`,
                }}
              >
                تمپوی حرکت
              </button>
            )}
            {kind === "hold" && (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: C.dangerSoft, color: C.danger }}>
                نگه‌داشتن ایزومتریک
              </span>
            )}
          </div>
          <button onClick={onClose} style={{ color: C.textMuted }}>
            <X size={20} />
          </button>
        </div>

        {(kind === "rest" || kind === "hold") && (
          <div className="flex flex-col items-center py-6">
            <div
              className="w-44 h-44 rounded-full flex items-center justify-center mb-6"
              style={{ border: `3px solid ${kind === "hold" ? C.danger : C.accent}`, background: C.surface2 }}
            >
              <span className="text-5xl font-bold tabular-nums" style={{ color: C.text, fontVariantNumeric: "tabular-nums" }}>
                {fmtTime(remaining)}
              </span>
            </div>
            <p className="text-sm mb-6" style={{ color: C.textMuted }}>
              {kind === "hold" ? "نگه‌دار — با کنترل نفس بکش" : "استراحت کن، نفس عمیق بکش"}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setRunning((r) => !r)}
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: kind === "hold" ? C.danger : C.accent, color: "#06110D" }}
              >
                {running ? <PauseCircle size={28} /> : <PlayCircle size={28} />}
              </button>
              <button
                onClick={reset}
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: C.surface2, color: C.textMuted, border: `1px solid ${C.border}` }}
              >
                <RotateCcw size={22} />
              </button>
            </div>
          </div>
        )}

        {kind === "tempo" && (
          <div className="flex flex-col items-center py-4">
            <div
              className="rounded-full flex items-center justify-center mb-5 transition-transform duration-1000 ease-linear"
              style={{
                width: 176, height: 176,
                background: `radial-gradient(circle at 50% 40%, ${currentPhase.color}33, ${C.surface2})`,
                border: `3px solid ${currentPhase.color}`,
                transform: `scale(${scale})`,
              }}
            >
              <div className="text-center">
                <div className="text-4xl font-bold" style={{ color: C.text }}>{phaseRemaining}</div>
                <div className="text-xs mt-1" style={{ color: currentPhase.color }}>{currentPhase.label}</div>
              </div>
            </div>
            <div className="flex gap-1.5 mb-4">
              {phases.map((p, i) => (
                <div key={p.key} className="h-1.5 rounded-full" style={{
                  width: 34,
                  background: i === phaseIdx ? p.color : C.border,
                }} />
              ))}
            </div>
            <p className="text-xs mb-5" style={{ color: C.textFaint }}>
              چرخه‌های کامل: {cycles}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setRunning((r) => !r)}
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: C.gold, color: "#241C05" }}
              >
                {running ? <PauseCircle size={28} /> : <PlayCircle size={28} />}
              </button>
              <button
                onClick={reset}
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: C.surface2, color: C.textMuted, border: `1px solid ${C.border}` }}
              >
                <RotateCcw size={22} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================== SMALL UI PIECES ============================== */

function VideoBadge({ video }) {
  const [open, setOpen] = useState(false);
  const [player, setPlayer] = useState(false);
  if (!video) return null;

  const videoId = VIDEO_IDS[video.file];
  const hasLink = !!videoId;
  const startSec = timeToSeconds(video.t);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => (hasLink ? setPlayer(true) : setOpen((o) => !o))}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs"
        style={{
          background: hasLink ? C.accentSoft : C.surface2,
          color: hasLink ? C.accent : C.textMuted,
          border: `1px solid ${hasLink ? C.accent + "55" : C.border}`,
        }}
      >
        {hasLink ? <PlayCircle size={12} /> : <Film size={12} />} {video.file} · {video.t}
      </button>

      {!hasLink && open && (
        <div
          className="absolute z-20 mt-1 right-0 w-56 p-2 rounded-lg text-xs"
          style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.textMuted }}
        >
          مرجع ویدیوی این حرکت. لینک مستقیم بعداً که ویدیوها هاست بشن اضافه می‌شه.
        </div>
      )}

      {hasLink && player && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(6,12,10,0.85)" }}
          onClick={() => setPlayer(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl overflow-hidden"
            style={{ background: C.surface, border: `1px solid ${C.border}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3">
              <span className="text-xs" style={{ color: C.textMuted }}>{video.file} · شروع از {video.t}</span>
              <button onClick={() => setPlayer(false)} style={{ color: C.textMuted }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ aspectRatio: "16/9", background: "#000" }}>
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}?start=${startSec}&autoplay=1&rel=0`}
                title={video.file}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionHeader({ icon, title, sub, color }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}22`, color }}>
        {icon}
      </div>
      <div>
        <h2 className="text-base font-bold" style={{ color: C.text }}>{title}</h2>
        {sub && <p className="text-xs" style={{ color: C.textFaint }}>{sub}</p>}
      </div>
    </div>
  );
}

/* ============================== TABS ============================== */

function HomeTab({ profile }) {
  const w = profile?.weightKg || 0;
  const macros = [
    { label: "کربوهیدرات", value: w ? `${Math.round(w * 0.5)} گرم` : NUTRITION.preWorkout[0].value },
    { label: "پروتئین", value: w ? `${Math.round(w * 0.3)} گرم` : NUTRITION.preWorkout[1].value },
    { label: "چربی", value: NUTRITION.preWorkout[2].value },
  ];
  return (
    <div className="space-y-6 pb-24">
      <div
        className="rounded-2xl p-5"
        style={{ background: `linear-gradient(135deg, ${C.accentSoft}, ${C.surface})`, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} style={{ color: C.accent }} />
          <span className="text-xs font-medium" style={{ color: C.accent }}>دوره ۲۴ هفته‌ای آمادگی جسمانی</span>
        </div>
        <h1 className="text-xl font-extrabold mb-1" style={{ color: C.text }}>Fit Fusion</h1>
        <p className="text-sm leading-6 mb-3" style={{ color: C.textMuted }}>
          تمرین در منزل، تمرکز روی کنترل، عملکرد و اعتماد به‌نفس حرکتی — نه فقط ترازو و آینه.
        </p>
        <VideoBadge video={{ file: "Introduction", t: "00:00:00" }} />
      </div>

      <div>
        <SectionHeader icon={<ListChecks size={18} />} title="۵ فاز دوره" color={C.accent} />
        <div className="space-y-2">
          {PHASES.map((p) => (
            <div key={p.n} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{ background: p.n === 1 ? C.accent : C.surface2, color: p.n === 1 ? "#06110D" : C.textMuted }}>
                {p.n}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: C.text }}>{p.title}</p>
              </div>
              <span className="text-xs" style={{ color: C.textFaint }}>{p.weeks}</span>
            </div>
          ))}
        </div>
        <p className="text-xs mt-2" style={{ color: C.textFaint }}>الان روی فاز ۱ / روز ۱ کار می‌کنیم.</p>
      </div>

      <div>
        <SectionHeader icon={<Dumbbell size={18} />} title="وسایل مورد نیاز دوره" color={C.gold} />
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT.map((e) => (
            <span key={e} className="px-3 py-1.5 rounded-full text-xs" style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.textMuted }}>
              {e}
            </span>
          ))}
        </div>
      </div>

      <div>
        <SectionHeader icon={<Flame size={18} />} title="تغذیه و کاردیوی مکمل" color={C.danger} />
        <div className="rounded-xl p-4 space-y-3" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <p className="text-sm" style={{ color: C.textMuted }}>{NUTRITION.calories}</p>
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: C.text }}>تغذیه قبل تمرین ({NUTRITION.preWorkoutTiming}):</p>
            <div className="grid grid-cols-3 gap-2">
              {macros.map((n) => (
                <div key={n.label} className="text-center p-2 rounded-lg" style={{ background: C.surface2 }}>
                  <p className="text-[11px]" style={{ color: C.textFaint }}>{n.label}</p>
                  <p className="text-xs mt-1 font-medium" style={{ color: C.text }}>{n.value}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs leading-5" style={{ color: C.textMuted }}>🏃 {NUTRITION.cardio}</p>
          <p className="text-xs leading-5" style={{ color: C.textMuted }}>🧻 {NUTRITION.foamRolling}</p>
        </div>
      </div>
    </div>
  );
}

function SafetyTab() {
  const iconFor = (k) => ({
    shield: <ShieldAlert size={16} />, alert: <AlertTriangle size={16} />, back: <Info size={16} />,
    knee: <Info size={16} />, shoulder: <Info size={16} />, wind: <Wind size={16} />, stop: <AlertTriangle size={16} />,
  }[k] || <Info size={16} />);

  return (
    <div className="space-y-4 pb-24">
      <div className="rounded-xl p-4" style={{ background: C.dangerSoft, border: `1px solid ${C.danger}44` }}>
        <p className="text-xs leading-6" style={{ color: C.text }}>
          مسئولیت اجرای صحیح حرکات و رعایت اصول ایمنی بر عهده‌ی خود شماست. در صورت درد، آسیب، بیماری، جراحی یا مصرف دارو، قبل از شروع با پزشک مشورت کنید.
        </p>
      </div>
      {SAFETY.map((s) => (
        <div key={s.title} className="rounded-xl p-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-2 mb-3">
            <span style={{ color: s.color }}>{iconFor(s.icon)}</span>
            <h3 className="text-sm font-bold" style={{ color: C.text }}>{s.title}</h3>
          </div>
          <ul className="space-y-1.5">
            {s.points.map((pt, i) => (
              <li key={i} className="text-xs leading-6 flex gap-2" style={{ color: C.textMuted }}>
                <span style={{ color: s.color }}>·</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function PatternsTab() {
  const [openId, setOpenId] = useState("squat");
  return (
    <div className="space-y-3 pb-24">
      <p className="text-xs mb-2 leading-6" style={{ color: C.textFaint }}>
        اکثر تمرینات و تکنیک‌های ورزشی به این الگوهای حرکتی پایه تفکیک می‌شن. نبایدهای زیر برای همه‌ی حرکاتی که با این الگو کار می‌کنن صدق می‌کنه.
      </p>
      {PATTERNS.map((p) => (
        <div key={p.id} className="rounded-xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <button
            onClick={() => setOpenId(openId === p.id ? null : p.id)}
            className="w-full flex items-center justify-between p-4"
          >
            <div className="text-right">
              <p className="text-sm font-bold" style={{ color: C.text }}>{p.nameFa}</p>
              <p className="text-[11px]" style={{ color: C.textFaint }}>{p.name}</p>
            </div>
            <ChevronDown size={18} style={{ color: C.textMuted, transform: openId === p.id ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
          </button>
          {openId === p.id && (
            <div className="px-4 pb-4">
              <p className="text-xs font-medium mb-2" style={{ color: C.danger }}>در این حرکات نباید دیده بشه:</p>
              <div className="flex flex-wrap gap-1.5">
                {p.avoid.map((a) => (
                  <span key={a} className="px-2.5 py-1 rounded-lg text-[11px]" style={{ background: C.dangerSoft, color: "#F0B4AE" }}>
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MoveCard({ title, reps, cues, equipment, variantEasy, variantAdvanced, note, safetyNote, video, patternId, plyoFoundation, optional, onOpenTimer, done, onToggleDone }) {
  const pattern = patternId ? patternMeta(patternId) : null;
  return (
    <div className="rounded-xl p-4 mb-3" style={{ background: C.surface, border: `1px solid ${done ? C.accent : C.border}` }}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <button onClick={onToggleDone} className="mt-0.5 shrink-0">
          {done ? <CheckCircle2 size={20} style={{ color: C.accent }} /> : <Circle size={20} style={{ color: C.textFaint }} />}
        </button>
        <div className="flex-1">
          <div className="flex items-center flex-wrap gap-1.5 mb-1">
            <h4 className="text-sm font-bold" style={{ color: C.text }}>{title}</h4>
            {optional && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: C.goldSoft, color: C.gold }}>اختیاری</span>}
            {plyoFoundation && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: C.dangerSoft, color: C.danger }}>⭐ پایه فاز ۴/۵</span>}
            {pattern && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: C.accentSoft, color: C.accent }}>{pattern.nameFa}</span>}
          </div>
          {reps && <p className="text-xs font-medium mb-2" style={{ color: C.gold }}>{reps}</p>}
          {equipment && equipment.length > 0 && (
            <p className="text-[11px] mb-2" style={{ color: C.textFaint }}>وسایل: {equipment.join("، ")}</p>
          )}
        </div>
      </div>
      {cues && (
        <ul className="space-y-1 mb-2 mr-7">
          {cues.map((c, i) => (
            <li key={i} className="text-xs leading-6 flex gap-2" style={{ color: C.textMuted }}>
              <span style={{ color: C.accent }}>·</span><span>{c}</span>
            </li>
          ))}
        </ul>
      )}
      {variantEasy && <p className="text-[11px] mr-7 mb-1" style={{ color: C.textFaint }}>🟢 نسخه ساده‌تر: {variantEasy}</p>}
      {variantAdvanced && <p className="text-[11px] mr-7 mb-1" style={{ color: C.textFaint }}>🔴 نسخه پیشرفته: {variantAdvanced}</p>}
      {note && <p className="text-[11px] mr-7 mb-1" style={{ color: C.textMuted }}>ℹ️ {note}</p>}
      {safetyNote && <p className="text-[11px] mr-7 mb-1" style={{ color: C.danger }}>⚠️ {safetyNote}</p>}
      <div className="flex items-center gap-2 mr-7 mt-2">
        <VideoBadge video={video} />
        {onOpenTimer && (
          <button
            onClick={onOpenTimer}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs"
            style={{ background: C.accentSoft, color: C.accent }}
          >
            <Timer size={12} /> تایمر
          </button>
        )}
      </div>
    </div>
  );
}

function WarmupTab({ openTimer }) {
  return (
    <div className="space-y-5 pb-24">
      <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: C.surface2, border: `1px solid ${C.border}` }}>
        <Clock size={16} style={{ color: C.gold }} />
        <p className="text-xs" style={{ color: C.textMuted }}>{WARMUP.totalDuration}</p>
      </div>
      {WARMUP.parts.map((part) => (
        <div key={part.id}>
          <h3 className="text-sm font-bold mb-3" style={{ color: C.text }}>{part.title}</h3>
          {part.moves.map((m, i) => (
            <MoveCard
              key={i}
              title={m.name}
              reps={m.reps}
              cues={m.cues}
              video={m.video}
              plyoFoundation={m.plyoFoundation}
              onOpenTimer={() => openTimer({ mode: "rest", defaultRest: 30 })}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function MainWorkoutTab({ level, setLevel, week, setWeek, openTimer, done, toggleDone }) {
  const activeSlots = LEVELS[level].slots;

  return (
    <div className="space-y-5 pb-24">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {Object.entries(LEVELS).map(([key, v]) => (
          <button
            key={key}
            onClick={() => setLevel(key)}
            className="px-4 py-2 rounded-full text-xs font-medium shrink-0"
            style={{
              background: level === key ? C.accent : C.surface,
              color: level === key ? "#06110D" : C.textMuted,
              border: `1px solid ${level === key ? C.accent : C.border}`,
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs shrink-0" style={{ color: C.textFaint }}>هفته:</span>
        <div className="flex gap-1.5 overflow-x-auto">
          {[1, 2, 3, 4, 5, 6].map((w) => (
            <button
              key={w}
              onClick={() => setWeek(w)}
              className="w-8 h-8 rounded-lg text-xs font-medium shrink-0"
              style={{
                background: week === w ? C.gold : C.surface,
                color: week === w ? "#241C05" : C.textMuted,
                border: `1px solid ${week === w ? C.gold : C.border}`,
              }}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl p-3 space-y-2" style={{ background: C.surface2, border: `1px solid ${C.border}` }}>
        <p className="text-[11px]" style={{ color: C.textMuted }}>⏱ استراحت: {SESSION_NOTES.rest}</p>
        <p className="text-[11px]" style={{ color: C.textMuted }}>🔥 شدت: {SESSION_NOTES.intensity}</p>
        <p className="text-[11px]" style={{ color: C.textMuted }}>🎵 تمپو: {SESSION_NOTES.tempo}</p>
        <VideoBadge video={{ file: "Nokat-Sabet", t: "00:00:00" }} />
      </div>

      {DAY1_SLOTS.filter((s) => activeSlots.includes(s.slot)).map((s) => {
        const prog = progress[s.prog](week);
        const progLabel = prog.mode === "reps" ? `${prog.sets} ست × ${prog.reps} تکرار` : `${prog.sets} ست × ${prog.duration} ثانیه نگه‌داشتن`;
        return (
          <div key={s.slot}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: C.accent, color: "#06110D" }}>
                {s.slot}
              </span>
              <span className="text-xs" style={{ color: C.textFaint }}>{s.type === "alt" ? "آلترنیتینگ ست (دو حرکت، پشت‌سرهم)" : "حرکت منفرد"}</span>
            </div>
            {s.ids.map((id) => {
              const m = MOVEMENTS[id];
              const key = `${id}-${week}`;
              return (
                <MoveCard
                  key={id}
                  title={m.name}
                  reps={progLabel}
                  cues={m.cues}
                  equipment={m.equipment}
                  variantEasy={m.variantEasy}
                  variantAdvanced={m.variantAdvanced}
                  note={m.note}
                  safetyNote={m.safetyNote}
                  video={m.video}
                  patternId={m.pattern}
                  optional={m.optional}
                  done={!!done[key]}
                  onToggleDone={() => toggleDone(key)}
                  onOpenTimer={() =>
                    openTimer(
                      prog.mode === "duration"
                        ? { mode: "hold", holdSeconds: prog.duration }
                        : { mode: "rest", defaultRest: 90 }
                    )
                  }
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function CooldownTab({ openTimer }) {
  return (
    <div className="space-y-4 pb-24">
      <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: C.surface2, border: `1px solid ${C.border}` }}>
        <Clock size={16} style={{ color: C.gold }} />
        <p className="text-xs" style={{ color: C.textMuted }}>{COOLDOWN.duration}</p>
      </div>
      {COOLDOWN.moves.map((m, i) => (
        <MoveCard
          key={i}
          title={m.name}
          reps={`نگه‌داشتن: ${m.hold}`}
          cues={m.cues}
          video={m.video}
          onOpenTimer={() => openTimer({ mode: "hold", holdSeconds: 45 })}
        />
      ))}
      <p className="text-xs leading-6 p-3 rounded-xl" style={{ color: C.textMuted, background: C.surface, border: `1px solid ${C.border}` }}>
        💡 {COOLDOWN.note}
      </p>
    </div>
  );
}

function Onboarding({ onComplete }) {
  const [gender, setGender] = useState("male");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const canSubmit = height && weight && Number(height) > 0 && Number(weight) > 0;

  return (
    <div dir="rtl" lang="fa" className="min-h-screen flex items-center justify-center p-5"
      style={{ background: C.bg, fontFamily: "'Vazirmatn', Tahoma, sans-serif" }}>
      <style>{FONT_IMPORT}</style>
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Dumbbell size={32} style={{ color: C.accent, margin: "0 auto 12px" }} />
          <h1 className="text-xl font-extrabold mb-1" style={{ color: C.text }}>خوش اومدی به Fit Fusion</h1>
          <p className="text-sm" style={{ color: C.textMuted }}>برای محاسبه‌ی دقیق تغذیه، این چند مورد رو پر کن</p>
        </div>

        <div className="rounded-2xl p-5 space-y-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <div>
            <p className="text-xs mb-2" style={{ color: C.textMuted }}>جنسیت</p>
            <div className="flex gap-2">
              {[{ v: "male", l: "مرد" }, { v: "female", l: "زن" }].map((g) => (
                <button key={g.v} onClick={() => setGender(g.v)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{
                    background: gender === g.v ? C.accent : C.surface2,
                    color: gender === g.v ? "#06110D" : C.textMuted,
                    border: `1px solid ${gender === g.v ? C.accent : C.border}`,
                  }}>
                  {g.l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs mb-2" style={{ color: C.textMuted }}>قد (سانتی‌متر)</p>
            <input type="number" value={height} onChange={(e) => setHeight(e.target.value)}
              placeholder="مثلاً ۱۷۵"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }} />
          </div>

          <div>
            <p className="text-xs mb-2" style={{ color: C.textMuted }}>وزن (کیلوگرم)</p>
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)}
              placeholder="مثلاً ۷۸"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }} />
          </div>

          <button
            disabled={!canSubmit}
            onClick={() => onComplete({ gender, heightCm: Number(height), weightKg: Number(weight) })}
            className="w-full py-3 rounded-xl text-sm font-bold"
            style={{
              background: canSubmit ? C.accent : C.surface2,
              color: canSubmit ? "#06110D" : C.textFaint,
              opacity: canSubmit ? 1 : 0.6,
            }}>
            شروع کن
          </button>
          <p className="text-[11px] text-center" style={{ color: C.textFaint }}>
            این اطلاعات فقط برای محاسبه‌ی درشت‌مغذی‌های تغذیه استفاده می‌شه.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================== APP ROOT ============================== */

export default function App() {
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("home");
  const [level, setLevel] = useState("intermediate");
  const [week, setWeek] = useState(1);
  const [timerConf, setTimerConf] = useState(null);
  const [done, setDone] = useState({});

  const openTimer = (conf) => setTimerConf(conf);
  const closeTimer = () => setTimerConf(null);
  const toggleDone = (key) => setDone((d) => ({ ...d, [key]: !d[key] }));

  const tabs = [
    { id: "home", label: "خانه", icon: <HomeIcon size={18} /> },
    { id: "safety", label: "ایمنی", icon: <ShieldAlert size={18} /> },
    { id: "patterns", label: "الگوها", icon: <BookOpen size={18} /> },
    { id: "warmup", label: "گرم‌کردن", icon: <Flame size={18} /> },
    { id: "main", label: "تمرین", icon: <Dumbbell size={18} /> },
    { id: "cooldown", label: "سرد‌کردن", icon: <Wind size={18} /> },
  ];

  if (!profile) {
    return <Onboarding onComplete={setProfile} />;
  }

  return (
    <div dir="rtl" lang="fa" style={{ background: C.bg, minHeight: "100%", fontFamily: "'Vazirmatn', Tahoma, sans-serif" }}>
      <style>{FONT_IMPORT}</style>

      <div className="max-w-md mx-auto px-4 pt-5">
        <header className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[11px]" style={{ color: C.textFaint }}>فاز ۱ · روز ۱</p>
            <h1 className="text-lg font-extrabold" style={{ color: C.text }}>Fit Fusion</h1>
          </div>
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: C.accentSoft }}>
            <Dumbbell size={18} style={{ color: C.accent }} />
          </div>
        </header>

        <main>
          {tab === "home" && <HomeTab profile={profile} />}
          {tab === "safety" && <SafetyTab />}
          {tab === "patterns" && <PatternsTab />}
          {tab === "warmup" && <WarmupTab openTimer={openTimer} />}
          {tab === "main" && (
            <MainWorkoutTab
              level={level} setLevel={setLevel}
              week={week} setWeek={setWeek}
              openTimer={openTimer}
              done={done} toggleDone={toggleDone}
            />
          )}
          {tab === "cooldown" && <CooldownTab openTimer={openTimer} />}
        </main>
      </div>

      <nav
        className="fixed bottom-0 left-0 right-0 max-w-md mx-auto"
        style={{ background: C.surface, borderTop: `1px solid ${C.border}` }}
      >
        <div className="flex justify-between px-1 py-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl"
              style={{ color: tab === t.id ? C.accent : C.textFaint }}
            >
              {t.icon}
              <span className="text-[10px]">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {timerConf && (
        <TimerPanel
          mode={timerConf.mode}
          defaultRest={timerConf.defaultRest || 90}
          holdSeconds={timerConf.holdSeconds || 35}
          tempo={{ down: 4, hold: 2, up: 1 }}
          onClose={closeTimer}
        />
      )}
    </div>
  );
}
