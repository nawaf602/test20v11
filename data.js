const LANGUAGES = {
  ar: 'العربية',
  en: 'English',
  tr: 'Türkçe',
  ur: 'اردو',
  fa: 'فارسی',
  id: 'Indonesia',
  fr: 'Français',
  bn: 'বাংলা'
};

const NODES = {
  gate_100: { label: 'بوابة 100', floor: 0, x: 110, y: 95, type: 'gate', aliases: ['باب 100', 'بوابة 100', 'gate 100'] },
  gate_114: { label: 'بوابة 114', floor: 0, x: 110, y: 180, type: 'gate', aliases: ['باب 114', 'بوابة 114', 'gate 114'] },
  king_fahd_gate: { label: 'باب الملك فهد', floor: 0, x: 110, y: 265, type: 'gate', aliases: ['باب الملك فهد', 'king fahd'] },
  umrah_gate: { label: 'باب العمرة', floor: 0, x: 110, y: 345, type: 'gate', aliases: ['باب العمرة', 'umrah gate'] },
  expansion_corridor: { label: 'ممر التوسعة', floor: 0, x: 260, y: 180, type: 'corridor', aliases: ['التوسعة', 'ممر التوسعة'] },
  elevator_a: { label: 'مجموعة مصاعد أ', floor: 0, x: 385, y: 180, type: 'elevator', accessible: true, aliases: ['مصعد', 'المصعد', 'elevator'] },
  mataf_ground: { label: 'المطاف - الدور الأرضي', floor: 0, x: 545, y: 250, type: 'destination', aliases: ['المطاف الأرضي', 'المطاف', 'tawaf', 'mataf'] },
  mataf_2: { label: 'المطاف - الدور الثاني', floor: 2, x: 585, y: 120, type: 'destination', aliases: ['مطاف الدور الثاني', 'المطاف الدور الثاني', 'second floor mataf', 'ikinci kat tavaf'] },
  safa: { label: 'الصفا', floor: 0, x: 520, y: 335, type: 'destination', aliases: ['الصفا', 'safa'] },
  marwa: { label: 'المروة', floor: 0, x: 675, y: 335, type: 'destination', aliases: ['المروة', 'marwa'] },
  toilets: { label: 'دورات المياه', floor: 0, x: 300, y: 345, type: 'facility', aliases: ['دورات المياه', 'حمام', 'toilet', 'washroom'] },
  first_aid: { label: 'الإسعاف', floor: 0, x: 430, y: 345, type: 'facility', aliases: ['الإسعاف', 'medical', 'first aid'] }
};

const EDGES = [
  { from: 'gate_100', to: 'expansion_corridor', distance: 90, kind: 'walk', accessible: true },
  { from: 'gate_114', to: 'expansion_corridor', distance: 60, kind: 'walk', accessible: true },
  { from: 'king_fahd_gate', to: 'expansion_corridor', distance: 80, kind: 'walk', accessible: true },
  { from: 'umrah_gate', to: 'king_fahd_gate', distance: 70, kind: 'walk', accessible: true },
  { from: 'expansion_corridor', to: 'elevator_a', distance: 35, kind: 'walk', accessible: true },
  { from: 'elevator_a', to: 'mataf_2', distance: 0, kind: 'elevator', accessible: true, floorChange: 2 },
  { from: 'expansion_corridor', to: 'mataf_ground', distance: 120, kind: 'walk', accessible: true },
  { from: 'mataf_ground', to: 'safa', distance: 95, kind: 'walk', accessible: true },
  { from: 'safa', to: 'marwa', distance: 400, kind: 'walk', accessible: true },
  { from: 'expansion_corridor', to: 'toilets', distance: 75, kind: 'walk', accessible: true },
  { from: 'toilets', to: 'first_aid', distance: 70, kind: 'walk', accessible: true },
  { from: 'first_aid', to: 'safa', distance: 85, kind: 'walk', accessible: true }
];

const TRANSLATIONS = {
  ar: {
    walk_to: 'اتجه إلى {destination}',
    elevator: 'استخدم المصعد إلى الطابق {floor}',
    arrive: 'لقد وصلت إلى وجهتك. نسأل الله لكم القبول.',
    meters: '{distance} متر تقريباً',
    route: 'المسافة التقريبية: {distance} متر. عدد الخطوات: {count}.'
  },
  en: {
    walk_to: 'Walk toward {destination}',
    elevator: 'Take the elevator to floor {floor}',
    arrive: 'You have arrived at your destination.',
    meters: 'about {distance} meters',
    route: 'Approximate distance: {distance} meters. Steps: {count}.'
  },
  tr: {
    walk_to: '{destination} yönüne doğru ilerleyin',
    elevator: 'Asansörü {floor}. kata kullanın',
    arrive: 'Varış noktanıza ulaştınız.',
    meters: 'yaklaşık {distance} metre',
    route: 'Tahmini mesafe: {distance} metre. Adım sayısı: {count}.'
  },
  ur: {
    walk_to: '{destination} کی طرف جائیں',
    elevator: 'لفٹ سے {floor} منزل پر جائیں',
    arrive: 'آپ اپنی منزل پر پہنچ گئے ہیں۔',
    meters: 'تقریباً {distance} میٹر',
    route: 'تقریبی فاصلہ: {distance} میٹر۔ مراحل: {count}۔'
  },
  fa: {
    walk_to: 'به سمت {destination} حرکت کنید',
    elevator: 'با آسانسور به طبقهٔ {floor} بروید',
    arrive: 'به مقصد خود رسیده‌اید.',
    meters: 'حدود {distance} متر',
    route: 'مسافت تقریبی: {distance} متر. تعداد مراحل: {count}.'
  },
  id: {
    walk_to: 'Berjalan menuju {destination}',
    elevator: 'Naik lift ke lantai {floor}',
    arrive: 'Anda telah sampai di tujuan.',
    meters: 'sekitar {distance} meter',
    route: 'Jarak perkiraan: {distance} meter. Langkah: {count}.'
  },
  fr: {
    walk_to: 'Marchez vers {destination}',
    elevator: 'Prenez l’ascenseur jusqu’au {floor}e étage',
    arrive: 'Vous êtes arrivé à destination.',
    meters: 'environ {distance} mètres',
    route: 'Distance approximative : {distance} mètres. Étapes : {count}.'
  },
  bn: {
    walk_to: '{destination} এর দিকে যান',
    elevator: '{floor} তলায় যাওয়ার জন্য লিফট ব্যবহার করুন',
    arrive: 'আপনি আপনার গন্তব্যে পৌঁছে গেছেন।',
    meters: 'প্রায় {distance} মিটার',
    route: 'আনুমানিক দূরত্ব: {distance} মিটার। ধাপ: {count}।'
  }
};

window.HARAM_DATA = { LANGUAGES, NODES, EDGES, TRANSLATIONS };
