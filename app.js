/* ============================================================================
   DailyLog v12 — notebook + flag/xor meta, finglish keys
   Plain ES2017. IndexedDB + optional Apps Script sync. No build step.
   ============================================================================ */

'use strict';

const APP_VERSION = 'v87 · mojde';
const SCRIPT_VERSION = 'v11-meta';
const APP_FREEZE_FROM = '1405/06/12';
const APP_FREEZE_UNTIL = '1405/09/12';
const NIKA_NAME = 'مژده';

/* ═════════════════════════════ 1. PARTS AND ACTIVITIES ═════════════════════
   Later parts inherit earlier ones. Layers and قانون are daily META, not
   per-session. Parenthetical tags are typed on the line, comma-separated. */

const PARTS = [
  { id: 0, label: 'تا ۱۲',    hint: 'صبح — کارهای این پارت و ارثی‌ها' },
  { id: 1, label: '۱۲ تا ۲',  hint: 'ظهر — ارث از تا ۱۲ به‌علاوهٔ این پارت' },
  { id: 2, label: '۲ تا ۶',   hint: 'بعدازظهر — ارث از دو پارت قبل' },
  { id: 3, label: 'بعد اوپن', hint: 'بعد اوپن‌فست — همهٔ قبلی‌ها هم اینجان' }
];

const TAKH_WHO = [
  { id:'SHOSE', label:'SHOSE' },
  { id:'MAD', label:'MAD' },
  { id:'PED', label:'PED' },
  { id:'BR', label:'BR' },
  { id:'BRZ', label:'BRZ' },
  { id:'DUS', label:'DUS' },
  { id:'RAYIS', label:'RAYIS' }
];
const QUALITY_TAGS = [
  'bigharrshadid','zajrshadid','dardshadid','fesharshadi','karesakht',
  'flowshadid','tamarkozshaid','amighshadid','withthinkshadid'
];
const QUALITY_FA = {
  bigharrshadid: 'بی‌قراری شدید',
  zajrshadid: 'زجر شدید',
  dardshadid: 'درد شدید',
  fesharshadi: 'فشار شدید',
  karesakht: 'کار سخت',
  flowshadid: 'فلوی شدید',
  tamarkozshaid: 'تمرکز شدید',
  amighshadid: 'عمق شدید',
  withthinkshadid: 'با فکر شدید'
};
const qualityFa = t => QUALITY_FA[t] || t;
const itemFa = it => (it && (it.fa || it.label)) || '';

const CODES = [
  { cat:'takhsis',  code:'takhkhod', metric:'dur', from:0, def:{h:0,m:30} },
  { cat:'takhsis',  code:'takhshose', metric:'dur', from:0, def:{h:0,m:30} },
  { cat:'takhsis',  code:'takhmojmotn', metric:'dur', from:0, def:{h:0,m:40} },
  { cat:'arastegi', code:'arasmoratakhshose', metric:'dur', from:0, def:{h:0,m:30} },
  { cat:'arastegi', code:'arasmor', metric:'dur', from:0, def:{h:0,m:25} },
  { cat:'kar',      code:'ITPr', metric:'dur', from:0, def:{h:2,m:40} },
  { cat:'mali',     code:'tala,dolar(for,khari)', metric:'dur', from:0, def:{h:0,m:15} },
  { cat:'mali',     code:'vam,sarmayegozari', metric:'dur', from:0, def:{h:0,m:20} },
  { cat:'sobh',     code:'analyseslahibadan', metric:'dur', from:0, def:{h:0,m:40} },
  { cat:'badan',    code:'drazmayesh,sono,clinici(prepln)', metric:'dur', from:0, def:{h:2,m:30} },
  { cat:'sobh',     code:'bankhozuri', metric:'dur', from:0, def:{h:0,m:20} },
  { cat:'sobh',     code:'tayinsathzaban', metric:'dur', from:0, def:{h:0,m:20} },
  { cat:'sobh',     code:'ghors', metric:'dur', from:0, def:{h:0,m:5} },
  { cat:'rutin',    code:'rout', metric:'dur', from:0, def:{h:0,m:40} },

  { cat:'kharid',   code:'kharidzarur(preplan)', metric:'dur', from:1, def:{h:0,m:20} },
  { cat:'badan',    code:'ab', metric:'dur', from:1, def:{h:0,m:20} },
  { cat:'kar',      code:'assessvisaplnb', metric:'dur', from:1, def:{h:0,m:30} },
  { cat:'edari',    code:'pardakhpei,bimebargoz,malizar', metric:'dur', from:1, def:{h:0,m:25}, stick:true },
  { cat:'edari',    code:'peigirimajazighanoon', metric:'dur', from:1, def:{h:0,m:20}, stick:true },
  { cat:'kar',      code:'kartakh2', metric:'dur', from:1, def:{h:0,m:40} },

  { cat:'hafte',    code:'akharehafte(preregistKelastakh,zaban)', metric:'dur', from:2, def:{h:0,m:40} },
  { cat:'ravan',    code:'moshv,ravanpp,kargahravanp', metric:'dur', from:2, def:{h:0,m:45}, stick:true },
  { cat:'divar',    code:'divar(forushzaruri,didnmelkpreplan)', metric:'dur', from:2, def:{h:0,m:25} },
  { cat:'varzesh',  code:'rah<=25m', metric:'dur', from:2, def:{h:0,m:25} },
  { cat:'varzesh',  code:'do<=40m', metric:'dur', from:2, def:{h:0,m:40} },
  { cat:'varzesh',  code:'azkesh', metric:'dur', from:2, def:{h:1,m:0} },
  { cat:'khane',    code:'otu', metric:'dur', from:2, def:{h:0,m:20} },
  { cat:'khane',    code:'shosmort', metric:'dur', from:2, def:{h:0,m:20} },
  { cat:'badan',    code:'mokamel', metric:'reps', from:2, def:{r:1,pr:5} },

  { cat:'yadgiri',  code:'reswch', metric:'dur', from:2, def:{h:1,m:50} },
  { cat:'aff',      code:'logevent<=10m', metric:'dur', from:2, def:{h:0,m:10}, stick:true },

  { cat:'sabtnam',  code:'sabtnam(tur,kargahravn,kelstakh,zaban,bashgahengh,hamneshin)', metric:'dur', from:3, def:{h:0,m:15} },
  { cat:'aff',      code:'afflog,affplan', metric:'dur', from:3, def:{h:0,m:15}, stick:true },
  { cat:'badan',    code:'salad', metric:'dur', from:3, def:{h:0,m:20}, kind:true },
  { cat:'badan',    code:'ket<=25m(ketabedast)', metric:'dur', from:3, def:{h:0,m:25} },
  { cat:'badan',    code:'dand', metric:'reps', from:3, def:{r:3,pr:5} }
];

const CAT_RENAME = { div: 'divar', sehat: 'badan' };
function catName(c) {
  const k = String(c || '').trim();
  return CAT_RENAME[k] || k || '—';
}

const SESSION_FIELDS = ['uid','createdAt','dateShamsi','part','partId','category','code','metric',
                        'minutes','hm','chunk','tags','who','reactSec','count','reps','perRep','kind','note'];

const META_GROUPS = [
  { id:'bidari', title:'بیداری' },
  { id:'khorak', title:'خوراک' },
  { id:'harf', title:'حرف و جمع' },
  { id:'ghermez', title:'خط قرمز' },
  { id:'rabete', title:'رابطه — ریزترین ردفلگ' },
  { id:'badan', title:'بدن' },
  { id:'ruz', title:'روز و رعایت' },
  { id:'openfa', title:'اوپن‌فست' },
  { id:'layers', title:'لایه و فلو' },
  { id:'sokut', title:'روز سکوت' },
  { id:'laws', title:'قانون مهم' }
];
const META_SLOTS = [
  { id:'all', label:'همه' },
  { id:0, label:'تا ۱۲' },
  { id:1, label:'۱۲ تا ۲' },
  { id:2, label:'۲ تا ۶' },
  { id:3, label:'بعد اوپن' }
];
const isNegItem = it => (Number(it.lockDays) || 0) > 0 || it.wipe;
const negGroup = gid => META_ITEMS.some(it => it.group === gid && isNegItem(it));

const META_ITEMS = [
  /* bidari — tab joda, 1s = 15ruz */
  { id:'bidarshodanharhal', group:'bidari', pane:'bidari', slot:'all', kind:'flag', lockDays:15, wipe:true, silent:true, imp:10,
    fa:'در هر صورت بیدار شو و طبق برنامه پاشو — حتی اگر انگیزه نیست، خسته‌ای، صد روز پروژه داری، یا یک میلیون دلیل دیگر. تو جا نمان، حتی یک ثانیه بیشتر. یک ثانیه دیرتر = حرف نمی‌زنم',
    label:'dir1s · even 1s after alarm · no sit · 15ruz + sokut' },
  { id:'hushiarSobhDel', group:'bidari', pane:'bidari', slot:0, kind:'flag', lockDays:30, wipe:true, silent:true, imp:10,
    fa:'صبح که بیدار شدم، دقیقاً توی دلم چند بار، نه بلند، می‌گویم مژده: هویتت شَم است و اصلاً ناهوشیاری دلیل نمی‌شود؛ باید حتماً خودم را هوشیار کنم، وگرنه سی روز می‌شکند',
    label:'sobh tu del · mojde hushiar · nahushiar != dalil · 30ruz' },
  { id:'khastegiNaKhab', group:'bidari', pane:'bidari', slot:'all', kind:'flag', lockDays:15, wipe:true, silent:true, imp:10,
    fa:'خستگی را با خواب بیشتر درنمی‌کنم — فقط با یک اکتیویتی دیگر؛ خود همان اکتیویتی خستگی را درمی‌آورد',
    label:'khastegi != more sleep · via other activity · 15ruz' },
  { id:'rutin100Out', group:'bidari', pane:'bidari', slot:'all', kind:'flag', lockDays:14, wipe:true, silent:true, imp:10,
    fa:'حتی اگر داروهای روان تمام شده و همه‌چیز از کنترل خارج است، باز هم صددرصد توی روتین می‌مانم',
    label:'even meds out / out-of-order · 100% rutin · 14ruz' },
  { id:'bidGhalt', group:'bidari', pane:'bidari', slot:0, kind:'flag', lockDays:2, wipe:true, imp:9,
    fa:'غلت زدن یا یک دقیقه ماندن در رختخواب بعد از زنگ',
    label:'ghalt/1min after zang · 2ruz' },
  { id:'bidHoliday', group:'bidari', pane:'bidari', slot:0, kind:'flag', lockDays:14, wipe:true, silent:true, imp:8,
    fa:'ساعت بیداری روز تعطیل با روز کاری یکی نبود',
    label:'tatil != weekday wake · 14ruz + sokut' },
  { id:'bidZiadKhab', group:'bidari', pane:'bidari', slot:'all', kind:'flag', lockDays:14, wipe:true, imp:10,
    fa:'خواب بیشتر از سهم، حتی در بدترین حال — جز دو چرت چشم‌باز',
    label:'bishtar khab (hatta marg) joz 2 chort cheshmbaz · 14ruz' },
  { id:'twoHourAras', group:'bidari', pane:'bidari', slot:0, kind:'flag', imp:6,
    fa:'دو ساعت بیدار بودن پیش از تخصیص شُسه',
    label:'2saat bidar ghabl takhshose' },

  /* openfa */
  { id:'openfa1h', group:'openfa', pane:'meta', slot:3, kind:'flag',
    fa:'اوپن دوم زیر سی دقیقه',
    label:'openfa2<=30m' },
  { id:'nchort', group:'openfa', pane:'meta', slot:3, kind:'flag',
    fa:'چرت نزدن',
    label:'nchort' },
  { id:'chizayemojazbadeopfa2', group:'openfa', pane:'meta', slot:3, kind:'flag',
    fa:'فقط خوراک مجاز بعد از اوپن دوم — مرغ، ماهی، گوشت، سبزی — بدون ذرت و سیب‌زمینی',
    label:'mojaz bad open2 (morgh,mahi,gusht,sabzi; no zorat/sibzamini)' },
  { id:'opf1', group:'openfa', pane:'meta', slot:3, kind:'flag', lockDays:5, wipe:true,
    fa:'اوپن اول یا پروتئین پیش از ساعت پانزده نشد',
    label:'openfa1/prot ghabl 15 nashod · 5ruz' },
  { id:'opf2', group:'openfa', pane:'meta', slot:3, kind:'flag', lockDays:14, wipe:true, silent:true,
    fa:'اوپن دوم بعد از ساعت شش نشد — بزرگ',
    label:'openfa2 after 6 nashod · BOZORG · 14ruz' },
  { id:'protGhabl3', group:'openfa', pane:'meta', slot:0, kind:'flag', lockDays:10, wipe:true,
    fa:'پودر پروتئین پیش از ساعت پانزده',
    label:'prot powder ghabl 15:00 · 10ruz (cheat=14)' },
  { id:'cheetProt3', group:'khorak', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true, silent:true,
    fa:'تقلب: پروتئین پیش از ساعت سه',
    label:'cheat: prot ghabl 3 · 14ruz + sokut' },

  /* khorak */
  { id:'noCarb', group:'khorak', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true,
    fa:'نان، برنج، هر کربوهیدرات',
    label:'noon/berenj/carb · 14ruz' },
  { id:'adams', group:'khorak', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true, silent:true,
    fa:'آدامس، حتی بی‌طعم — برای همیشه ممنوع',
    label:'adams hata bitam · abadi mamnoo · 14ruz + sokut' },
  { id:'shirin', group:'khorak', pane:'meta', slot:'all', kind:'flag', lockDays:15, wipe:true, silent:true,
    fa:'شیرین مصنوعی؛ آب و جوشانده و طعم‌دار — جز پروتئین و کلاژن',
    label:'shirin masnu (ab/josh/taam) joz prot+collagen · 15ruz' },
  { id:'cheetShirin', group:'khorak', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true, silent:true,
    fa:'تقلب: شیرین یا آدامس یا آب طعم‌دار',
    label:'cheat: shirin/adams/abtaam · 14ruz + sokut' },
  { id:'chaysaye', group:'khorak', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true,
    fa:'چای سایه — ممنوع',
    label:'chay saye mamnoo · 14ruz' },
  { id:'tokhme', group:'khorak', pane:'meta', slot:'all', kind:'flag', lockDays:5, wipe:true,
    fa:'تخمه، کدو، شیر پروتئین، بار — جز پودر',
    label:'tokhme/kadu/proshir/bar (joz powder) · 5ruz' },
  { id:'asalajil', group:'khorak', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true, silent:true, imp:10,
    fa:'عسل حتی یک گرم هم کنسل — خرما، گردو، میوه، سوهان هم نه',
    label:'asal 1g + khorma/gerdu/mive/sohan · 14ruz' },
  { id:'foodAllBan', group:'khorak', pane:'meta', slot:'all', kind:'flag', lockDays:15, wipe:true, silent:true, imp:10,
    fa:'نه پروتئین‌بار، نه تخمه هندوانه، نه تخمه کدو، نه گردو، نه هیچ میوه، نه تمر هندی، نه لواشک، نه آلوچه، نه قره‌قروت، نه آلبالو، نه گوجه‌سبز، نه توت‌فرنگی، نه آووکادو، نه پروشیر، نه هیچ تخمه، نه هیچ آجیل، نه نوک‌سوزن شیرین مصنوعی، نه آدامس — جز چیزهای تعیین‌شده همه خط قرمز اکید و رابطه سمی',
    label:'all extras mamnoo · toxic · 15ruz' },
  { id:'abmiveAjilAbadi', group:'khorak', pane:'meta', slot:'all', kind:'flag', lockDays:30, wipe:true, silent:true, imp:10,
    fa:'انواع آبمیوه، اسموتی، میوه، آجیل، تخمه، عسل، خرما، انواع قند طبیعی، گردو، کنجد، پروتئین‌بار، کنجدعسلی — برای همیشه ممنوع؛ سی روز می‌شکند',
    label:'abmive/smoothi/mive/ajil/tokhme/asal/khorma/ghand/gerdu/konjed/bar · abadi · 30ruz' },
  { id:'abtaam', group:'khorak', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true, silent:true,
    fa:'آب گازدار طعم‌دار یا جوشانده — حتی روز شکست',
    label:'ab gazdar taam / joshan · hata ruz shekast · 14ruz' },
  { id:'foodToxic', group:'khorak', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true,
    fa:'خوراک سمی با غذای دیگران یا سرک کشیدن',
    label:'toxic ba ghazaye gheyr / resolver peek · 14ruz' },
  { id:'hattaaeradekhordan', group:'khorak', pane:'meta', slot:'all', kind:'flag',
    fa:'قطع دائم — صفر تقلب، حتی به اندازهٔ نوک سوزن',
    label:'cut daem · 0 cheat · 0 nok sozan' },
  { id:'hossUnmojaz', group:'khorak', pane:'meta', slot:'all', kind:'flag',
    fa:'دیدن یا حس دیگران دلیل نیست — قانون سر جایش می‌ماند',
    label:'dide/hoss digaran dalil nist · ghanun mimune' },
  { id:'fastingmode', group:'khorak', pane:'meta', slot:'all', kind:'flag',
    fa:'روزهٔ تمیز — آب، قهوه، چای سبز — روزهٔ کثیف نه',
    label:'fasting (ab,qahve,chaysabz) · dirtyfast nist' },
  { id:'abkhoshmaze2test', group:'khorak', pane:'meta', slot:'all', kind:'flag', lockDays:5, wipe:true,
    fa:'آب خوش‌مزه یا تست دوباره — شکست',
    label:'ab khoshmaze / doptest shekast · 5ruz' },
  { id:'noghahveyebiruni', group:'khorak', pane:'meta', slot:'all', kind:'flag',
    fa:'قهوه یا لیموناد بیرونی نه',
    label:'no qahve/limunad biruni' },

  /* harf / ejtema */
  { id:'nagoofb', group:'harf', pane:'meta', slot:'all', kind:'flag', lockDays:5, wipe:true,
    fa:'نگوزیدن و آروغ نزدن جلوی کسی — در همان دوره',
    label:'nagoozidan F/B (period)' },
  { id:'tozihezafe', group:'harf', pane:'meta', slot:'all', kind:'flag', lockDays:5, wipe:true,
    fa:'توضیح اضافه — اسنپ، انرژی، نیمه آمدم',
    label:'tozih ezafe (snapp/energy/nime amadam) · 5ruz' },
  { id:'darkhastsharm', group:'harf', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true,
    fa:'درخواست با تندی یا شرم یا مخفی‌کاری',
    label:'darkhast ba tondi/sharm/makhfi · 14ruz' },
  { id:'bazkhod', group:'harf', pane:'meta', slot:'all', kind:'flag', lockDays:5, wipe:true,
    fa:'باز کردن خود در گروه یا درمان',
    label:'baz kardan khod (group/darman) · 5ruz' },
  { id:'tondi', group:'harf', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true,
    fa:'تندی، شرم، خجالت — صفر',
    label:'tondi/sharm/khejalat 0 · 14ruz' },
  { id:'ajele', group:'harf', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true,
    fa:'عجله کردن',
    label:'ajele' },
  { id:'moshavere', group:'harf', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true,
    fa:'کمک یا راهنمایی یا مشاوره خواستن — یک کلمه، بعد از تأخیر',
    label:'komak/rahnama/moshavere · 1kalame bad takhir · 14ruz' },
  { id:'tasir', group:'harf', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true,
    fa:'تأثیر گذاشتن یا قانع کردن — حتی در تخصص خودم',
    label:'tasir/qane kardan (hatta takhassos) · 14ruz' },
  { id:'bahs', group:'harf', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true, silent:true,
    fa:'بحث کردن یا قانع کردن',
    label:'bahs/qane · 14ruz + sokut' },
  { id:'tarifkhanom', group:'harf', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true, silent:true,
    fa:'تعریف از خانم یا بالا بردن کسی',
    label:'tarif khanom / bala bordan kasi · 14ruz + sokut' },
  { id:'enteghad', group:'harf', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true, silent:true,
    fa:'ریز انتقاد یا سرزنش — مادر و بقیه',
    label:'riz enteghad/sarzanesh (madar/…) · 14ruz + sokut' },
  { id:'multimedia', group:'harf', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true,
    fa:'چندرسانه‌ای یا ویدئو در گروه',
    label:'multimedia/video group · 14ruz' },
  { id:'khshaki', group:'harf', pane:'meta', slot:'all', kind:'flag', lockDays:5, wipe:true,
    fa:'صحبت با خشکی، میلاد و مانند این‌ها',
    label:'khshaki/milad/… sohbat · 5ruz' },
  { id:'insta', group:'harf', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true,
    fa:'اینستاگرام جز کار و واجب و چت',
    label:'insta joz kar-vajib-chat · 14ruz' },
  { id:'khire', group:'harf', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true,
    fa:'خیره شدن به دور یا بی‌کاری بیش از سه بار بیست دقیقه',
    label:'khire dur / 0kar > 3x20m · 14ruz + part' },
  { id:'khabjam', group:'harf', pane:'meta', slot:'all', kind:'flag', lockDays:5, wipe:true,
    fa:'خوابیدن توی جمع',
    label:'khab tu jam · 5ruz' },
  { id:'gilakDirNago', group:'harf', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true, imp:9,
    fa:'به گیلک و غیره‌ نمی‌شود گفت دیر می‌رسی — به کسی ربطی ندارد؛ خودت را هیچ‌وقت پایین نیاور و ارزش کارت را نگه دار',
    label:'no late-talk to gilak/… · never lower self · 14ruz' },
  { id:'moshaverEzafe', group:'harf', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true, silent:true, imp:9,
    fa:'حتی به مشاور هم چیز اضافه نگو — خط قرمز را می‌شکند',
    label:'no extra to moshaver · 14ruz' },
  { id:'moshaverTedad', group:'harf', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true, silent:true, imp:8,
    fa:'حتی به مشاور تعداد قرار را دقیق نگو و حسادت بقیه را برنینگیز — حتی مشاور',
    label:'no count of dates to moshaver · 14ruz' },
  { id:'snapSalam1', group:'harf', pane:'meta', slot:0, kind:'flag', lockDays:5, wipe:true, imp:7,
    fa:'سوار اسنپ یا تپسی شدم — یک سلام کافی است، دو تا نمی‌خواهد',
    label:'snap/tapsi · 1 salam · 5ruz' },
  { id:'naghseRaghs', group:'badan', pane:'meta', slot:2, kind:'flag', lockDays:5, wipe:true,
    fa:'رقص یا حرکت — جز کنترل و دوش',
    label:'raghs/araghs joz control+dush · 5ruz' },

  /* ghermez */
  { id:'adaDaravardan', group:'ghermez', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true, silent:true, imp:10,
    fa:'ادای کسی را درآوردن ممنوع — خط قرمز',
    label:'adaye kasi darovardan · mamnu · khate ghermez · 14ruz' },
  { id:'yeklayeamdiezafe', group:'ghermez', pane:'meta', slot:'all', kind:'flag', lockDays:30, wipe:true, silent:true, imp:10,
    fa:'حتی اگر روز بشکند — یک لایهٔ عمدی دیگر یعنی یک ماه حرف نمی‌زنم',
    label:'1 laye amdi · hatta ruz shekast · 30ruz sokut' },
  { id:'qanunSabet', group:'ghermez', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true, silent:true, imp:10,
    fa:'هر اتفاق بزرگ یا کوچک، هر مود، هر احساس — هیچ‌چیز عوض نمی‌شود؛ قوانین همان‌اند و برنامه و سبک زندگی را تغییر نمی‌دهم',
    label:'no change for mood/event · qanun sabet · 14ruz' },
  { id:'esteghrakonjkavi', group:'ghermez', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true, silent:true,
    fa:'دروغ، کنجکاوی، استاک، حسادت، تحقیر',
    label:'dorugh/konjkav/stalk/hesadat/tahghir · 14ruz' },
  { id:'mahdoodzehn', group:'ghermez', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true,
    fa:'محدود کردن ذهن — مجرد نیستم و مانند این',
    label:'mahdood zehn (mojarrad nistam/…) · 14ruz' },
  { id:'fararBiq', group:'ghermez', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true, silent:true,
    fa:'فرار از بی‌قراری با آدامس و مانند این — اصل تحمل است',
    label:'farar az biqarari (adams/…) · asl=tahamol · 14ruz + sokut' },
  { id:'mindSlack', group:'ghermez', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true,
    fa:'ذهن شل، تقلب، تغییر قانون — نه',
    label:'zehn: shol/cheat/taghir qanun · NA · 14ruz' },
  { id:'partChange', group:'ghermez', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true,
    fa:'عوض کردن پارت‌بندی — حتی در بدترین حال',
    label:'avaz partbandi (hatta marg/lesh) · 14ruz' },
  { id:'nokarekheir', group:'ghermez', pane:'meta', slot:'all', kind:'flag', lockDays:5, wipe:true,
    fa:'کار خیر حتی ذره',
    label:'kare kheyr (0.00001%) · 5ruz' },
  { id:'notarahomm', group:'ghermez', pane:'meta', slot:'all', kind:'flag', lockDays:5, wipe:true,
    fa:'ترحم',
    label:'tarahom · 5ruz' },

  /* rabete — riztarin redflag */
  { id:'digeRabeteNist', group:'rabete', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true, silent:true,
    fa:'دیگه قرار نیست رابطه‌ای باشد — حتی اگر سخت شود',
    label:'dige rabete nist · hatta sakht · 14ruz' },
  { id:'rabeteOmid', group:'rabete', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true,
    fa:'امید بستن به رابطه',
    label:'omid be rabete · 14ruz' },
  { id:'rabeteTafsir', group:'rabete', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true,
    fa:'تفسیر نگاه یا حرف به‌عنوان علاقه',
    label:'tafsir negah/harf = alaghe · 14ruz' },
  { id:'rabetePaygiri', group:'rabete', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true,
    fa:'پیگیری، انتظار جواب، دوباره دیدن',
    label:'paygiri / entezar javab / dobare didan · 14ruz' },
  { id:'rabeteKhiyal', group:'rabete', pane:'meta', slot:'all', kind:'flag', lockDays:7, wipe:true,
    fa:'خیال رابطه وسط کار و روز',
    label:'khiyal rabete tu kar · 7ruz' },
  { id:'rabeteKhodara', group:'rabete', pane:'meta', slot:'all', kind:'flag', lockDays:7, wipe:true,
    fa:'خودآرایی یا نمایش برای رابطه',
    label:'khodarayi / namayesh baraye rabete · 7ruz' },
  { id:'selfBalaPayin', group:'rabete', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true, imp:8,
    fa:'رابطه سمی حذف — خودم را بالا و پایین نمی‌برم',
    label:'toxic rabete hazf · no self up/down · 14ruz' },
  { id:'rabeteNote2way', group:'rabete', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true, silent:true, imp:10,
    fa:'ریزترین ردفلگ: اگر یادداشتی ببینم که بشود قطع رابطه دوطرفه با طرف، حرف نمی‌زنم — حتی اگر باهاش بروی بیرون',
    label:'note = 2way cut · sokut hatta birun · 14ruz' },

  /* badan */
  { id:'shostsoorat', group:'badan', pane:'meta', slot:3, kind:'flag', lockDays:3, wipe:true,
    fa:'شست‌وشوی صورت شب نشد',
    label:'shost soorat shab NA · 3ruz' },
  { id:'mesvak', group:'badan', pane:'meta', slot:3, kind:'flag', lockDays:3, wipe:true,
    fa:'مسواک شب نشد',
    label:'mesvak shab NA · 3ruz' },

  /* ruz / raayat */
  { id:'takhghmojaz0', group:'ruz', pane:'meta', slot:'all', kind:'flag',
    fa:'تخصیص غیرمجاز صفر یا کمتر',
    label:'takhgh mojaz <=0' },
  { id:'takhmojmotns', group:'ruz', pane:'meta', slot:'all', kind:'flag',
    fa:'تخصیص مجاز متنوع',
    label:'takhmojmotns' },
  { id:'budandarjayemojaz100', group:'ruz', pane:'meta', slot:'all', kind:'flag',
    fa:'جا، خرید، محتوا همه مجاز',
    label:'jay/kharid/mohtava mojaz' },
  { id:'raatayeghavanineakhlaghietayinshode100', group:'ruz', pane:'meta', slot:'all', kind:'flag',
    fa:'صددرصد قوانین تعیین‌شده',
    label:'100% qavanin tayinshode' },
  { id:'riztarintakhmojaz', group:'ruz', pane:'meta', slot:'all', kind:'flag',
    fa:'ریزترین تخصیص مجاز — پرینت قبل از وی‌ان نه',
    label:'riz takhgh mojaz · print qabl WN na' },
  { id:'riztarinpartbandi', group:'ruz', pane:'meta', slot:0, kind:'flag',
    fa:'پارت‌بندی: قبل اوپن دوم فقط کلیدواژه',
    label:'partbandi: qabl open2 faghat keyword' },
  { id:'nocopypasteazaighable12pm', group:'ruz', pane:'meta', slot:0, kind:'flag',
    fa:'کپی از هوش مصنوعی فقط بعد اوپن دوم',
    label:'copyAI faghat BAD open2' },
  { id:'prompt15', group:'ruz', pane:'meta', slot:3, kind:'flag',
    fa:'پرامپت حداکثر پانزده دقیقه',
    label:'prompt<=15m' },
  { id:'copyai15', group:'ruz', pane:'meta', slot:3, kind:'flag',
    fa:'کپی از هوش مصنوعی حداکثر پانزده دقیقه',
    label:'copyai<=15m' },
  { id:'preplan12', group:'ruz', pane:'meta', slot:0, kind:'flag',
    fa:'یک کلمهٔ ضروری به‌علاوه پیش‌برنامه تا ۱۲',
    label:'1kalame zaruri + preplan ta12' },
  { id:'yekkalame12', group:'ruz', pane:'meta', slot:0, kind:'flag',
    fa:'یک کلمهٔ ضروری تا ۱۲ زدم',
    label:'1kalame zaruri ta12 zadam' },
  { id:'snapRoodsar', group:'ruz', pane:'meta', slot:0, kind:'flag', lockDays:5, wipe:true,
    fa:'پایین شهرک یا رودسر قبل اسنپ یا تپسی',
    label:'payin shahrak/rodsar qabl snap/tapsi · 5ruz' },
  { id:'motorSavarNa', group:'ruz', pane:'meta', slot:'all', kind:'flag', lockDays:5, wipe:true, imp:8,
    fa:'دیگر نمی‌شود سوار موتور شد — باید هماهنگ کنم سر تایم برسم و به موتور نکشم',
    label:'no motor · hamahang sare time · 5ruz' },
  { id:'sarsaatresidan', group:'ruz', pane:'meta', slot:'all', kind:'flag',
    fa:'سر ساعت رسیدن',
    label:'sar saat residan' },
  { id:'taghiratchaos', group:'ruz', pane:'meta', slot:'all', kind:'flag',
    fa:'هرج‌ومرج یا تغییر — هنوز صددرصد قانون',
    label:'chaos/taghir · hanuz 100% qanun' },
  { id:'rutinChaos', group:'ruz', pane:'meta', slot:'all', kind:'flag',
    fa:'روتین در به‌هم‌ریختگی حفظ',
    label:'rutin tu be-ham-rikhtegi hefz' },
  { id:'checkkardan', group:'ruz', pane:'meta', slot:'all', kind:'flag', lockDays:5, wipe:true,
    fa:'هی چک کردن — نباش توی فرایند',
    label:'hey check · nabash tu proses · 5ruz' },
  { id:'leshPart', group:'ruz', pane:'meta', slot:'all', kind:'flag', lockDays:5, wipe:true,
    fa:'لش برابر است با عوض کردن پارت',
    label:'lesh = avaz part · 5ruz' },
  { id:'abjayeBiq', group:'ruz', pane:'meta', slot:'all', kind:'flag',
    fa:'هر بی‌قراری می‌رود روی آب به‌عنوان جایگزین',
    label:'har biqarari → AB (jaygozin)' },
  { id:'kharejPartNa', group:'ruz', pane:'meta', slot:'all', kind:'flag', lockDays:14, wipe:true, imp:9,
    fa:'حتی اگر کلی از برنامه و روتین عقب مانده باشم، بیرونِ پارت خودش برنامه‌ریزی یا ثبت‌نام نمی‌کنم — بعد از ۱۲ شهریور این روز مهم است',
    label:'no plan/sabtnam kharej part · 14ruz' },

  /* layers tab */
  { id:'moodToFlow', group:'layers', pane:'layers', slot:'all', kind:'accumDur',
    fa:'حال و احساس به فلو — همهٔ حالت‌ها',
    label:'moodEhsasToFlow · HAME halat (khastegi,goshne,biq,garmi,badmood,fasting)' },
  { id:'afterFastMood', group:'layers', pane:'layers', slot:3, kind:'accumDur',
    fa:'بعد از روزه، حال به فلو',
    label:'afterfast moodToFlow' },
  { id:'layers', group:'layers', pane:'layers', slot:'all', kind:'accumDur',
    fa:'بی‌قراری، زجر، درد، فشار، سخت، فلو، تمرکز، عمیق',
    label:'biq/zajr/dard/feshar/sakht/flow/tamarkoz/amigh' },
  { id:'ghanoon', group:'layers', pane:'layers', slot:'all', kind:'accumDur',
    fa:'قانون فراتر از من',
    label:'ghanoon faraye man' },
  { id:'ghanoonfarayehattayarade', group:'layers', pane:'layers', slot:'all', kind:'accumDur',
    fa:'قانون فراتر حتی از اراده',
    label:'ghanoon faraye hatta erade' },
  { id:'afzayesheshans', group:'layers', pane:'layers', slot:'all', kind:'accumDur',
    fa:'افزایش شانس',
    label:'afzayesh shans' },
  { id:'roozsokutOn', group:'sokut', pane:'sokut', slot:'all', kind:'flag', silent:true, imp:10,
    fa:'امروز روز سکوت است — با هوش مصنوعی حرف نمی‌زنم',
    label:'rooz sokut ON' },
  { id:'sokut', group:'sokut', pane:'sokut', slot:'all', kind:'accumDur', optional:true, imp:10,
    fa:'مدت روز سکوت',
    label:'rooz sokut' },
  { id:'takhirAvg', group:'layers', pane:'layers', slot:'all', kind:'avgSec',
    fa:'تأخیر ورود و خروج کمتر از یک و نیم ثانیه',
    label:'takhir in/out <1.5s' },
  { id:'sessionflowamigh', group:'layers', pane:'layers', slot:'all', kind:'flag',
    fa:'نشست با فلو و عمق — ارزش والا',
    label:'session flow amigh · arzeshe vala' }
];

const META_FLAG_IDS = META_ITEMS.filter(it => it.kind === 'flag').map(it => it.id);
const IMP_BY_ID = {
  bidarshodanharhal:10, hushiarSobhDel:10, khastegiNaKhab:10, rutin100Out:10, bidGhalt:9, bidHoliday:8, bidZiadKhab:10, twoHourAras:6,
  openfa1h:5, nchort:5, chizayemojazbadeopfa2:6, opf1:8, opf2:9, protGhabl3:8, cheetProt3:9,
  noCarb:8, adams:9, shirin:9, cheetShirin:9, chaysaye:8, tokhme:8, asalajil:10, foodAllBan:10, abmiveAjilAbadi:10,
  abtaam:8, foodToxic:8, hattaaeradekhordan:10, hossUnmojaz:6, fastingmode:5, abkhoshmaze2test:7, noghahveyebiruni:6,
  nagoofb:6, tozihezafe:6, darkhastsharm:7, bazkhod:6, tondi:7, ajele:7, moshavere:7, tasir:7, bahs:7,
  tarifkhanom:7, enteghad:7, multimedia:5, khshaki:5, insta:6, khire:6, khabjam:5, naghseRaghs:5,
  gilakDirNago:9, moshaverEzafe:9, moshaverTedad:8, snapSalam1:7,
  adaDaravardan:10, yeklayeamdiezafe:10, qanunSabet:10, esteghrakonjkavi:8, mahdoodzehn:8, fararBiq:8, mindSlack:8, partChange:8,
  nokarekheir:6, notarahomm:6,
  digeRabeteNist:10, rabeteOmid:8, rabeteTafsir:8, rabetePaygiri:8, rabeteKhiyal:7, rabeteKhodara:7,
  selfBalaPayin:8, rabeteNote2way:10,
  shostsoorat:4, mesvak:4,
  takhghmojaz0:6, takhmojmotns:5, budandarjayemojaz100:6, raatayeghavanineakhlaghietayinshode100:8,
  riztarintakhmojaz:6, riztarinpartbandi:6, nocopypasteazaighable12pm:6, prompt15:5, copyai15:5,
  preplan12:6, yekkalame12:6, snapRoodsar:6, motorSavarNa:8, sarsaatresidan:6, taghiratchaos:8, rutinChaos:8,
  checkkardan:6, leshPart:6, abjayeBiq:7, kharejPartNa:9,
  moodToFlow:7, afterFastMood:6, layers:6, ghanoon:8, ghanoonfarayehattayarade:8, afzayesheshans:6,
  roozsokutOn:10, sokut:10, takhirAvg:6, sessionflowamigh:5
};
function itemImp(it) {
  if (!it) return 5;
  if (it.imp != null && it.imp !== '') {
    const n = Number(it.imp);
    if (Number.isFinite(n)) return Math.max(0, Math.min(10, n));
  }
  const n = IMP_BY_ID[it.id];
  return n != null ? n : 5;
}
function sortByImp(a, b) {
  return itemImp(b) - itemImp(a);
}

const FLAG_BUNDLES = {
  noghahveyebiruni: ['noghahveyebiruni', 'nolimunadbiruni'],
  budandarjayemojaz100: ['budandarjayemojaz100', 'kharidemojaz100', 'mohtmoj100']
};

function flagBundleKeys(id) {
  return FLAG_BUNDLES[id] || [id];
}
function applyFlagBundle(rec, id, on) {
  rec[id] = on ? 1 : '';
  flagBundleKeys(id).forEach(k => { if (k !== id) delete rec[k]; });
}
function migrateFlagBundles(rec) {
  const done = parseDone(rec);
  Object.keys(FLAG_BUNDLES).forEach(primary => {
    const keys = FLAG_BUNDLES[primary];
    const any = keys.some(k => rec[k] || done[k]);
    rec[primary] = any ? 1 : '';
    if (any) done[primary] = 1;
    keys.forEach(k => {
      if (k !== primary) {
        delete rec[k];
        delete done[k];
      }
    });
  });
  rec.done = done;
  rec.doneJson = JSON.stringify(done);
}

const META_FIELDS = Array.from(new Set([
  'uid','createdAt','dateShamsi','ruzshekast',
  'bidWake','bidDiffMin','saatbidari5',
  'takhirAvg','takhirN','takhirSum','takhirJson',
  'lawsJson','lawsMin','doneJson','complete','pishroJson','lockAdd',
  'moodToFlowMin','afterFastMoodMin','ghanoonMin','ghanoonFarayeMin','afzayeshShansMin','layersMin','sokut'
].concat(META_ITEMS.filter(it => it.kind === 'flag').map(it => it.id))));

const MIN_REACT_SEC = 2;
const TAKHIR_SECS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 5, 8, 10, 15];
const TAKHIR_OK = 1.5;
const BID_DIFF_OK_MIN = 0;

const META_STORE = {
  moodToFlow: 'moodToFlowMin',
  afterFastMood: 'afterFastMoodMin',
  ghanoon: 'ghanoonMin',
  ghanoonfarayehattayarade: 'ghanoonFarayeMin',
  afzayesheshans: 'afzayeshShansMin',
  layers: 'layersMin',
  sokut: 'sokut'
};

/* ═════════════════════════════ 2. JALALI ═══════════════════════════════════ */

const J_MONTHS = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور',
                  'مهر','آبان','آذر','دی','بهمن','اسفند'];

function jIsLeap(jy) {
  const a = jy - (jy > 0 ? 474 : 473);
  const b = ((a % 2820) + 2820) % 2820 + 474;
  return (((b + 38) * 682) % 2816) < 682;
}
function jMonthLen(jy, jm) {
  if (jm <= 6)  return 31;
  if (jm <= 11) return 30;
  return jIsLeap(jy) ? 30 : 29;
}
function toJalali(gy, gm, gd) {
  const gdm = [0,31,59,90,120,151,181,212,243,273,304,334];
  let jy = (gy <= 1600) ? 0 : 979;
  gy -= (gy <= 1600) ? 621 : 1600;
  const gy2 = (gm > 2) ? gy + 1 : gy;
  let days = 365*gy + Math.floor((gy2+3)/4) - Math.floor((gy2+99)/100)
           + Math.floor((gy2+399)/400) - 80 + gd + gdm[gm-1];
  jy += 33 * Math.floor(days/12053);
  days %= 12053;
  jy += 4 * Math.floor(days/1461);
  days %= 1461;
  if (days > 365) { jy += Math.floor((days-1)/365); days = (days-1) % 365; }
  const jm = (days < 186) ? 1 + Math.floor(days/31) : 7 + Math.floor((days-186)/30);
  const jd = 1 + ((days < 186) ? days % 31 : (days-186) % 30);
  return [jy, jm, jd];
}
function todayJ() {
  const d = new Date();
  return toJalali(d.getFullYear(), d.getMonth()+1, d.getDate());
}

const pad2  = n => String(n).padStart(2, '0');
const fmtJ  = (y, m, d) => y + '/' + pad2(m) + '/' + pad2(d);
const fmtHM = min => { const n = Number(min) || 0; return Math.floor(n/60) + ':' + pad2(n%60); };
const fmtChunk = min => {
  const n = Number(min) || 0;
  if (n >= 60) return Math.floor(n/60) + '.' + pad2(n % 60);
  return n + 'm';
};

/* ═════════════════════════════ 3. WHEELS ═══════════════════════════════════ */

const ITEM_H = 32;
const WHEELS = new Set();

function refreshWheels() { WHEELS.forEach(w => w.apply()); }
function settleWheels() {
  refreshWheels();
  requestAnimationFrame(refreshWheels);
  setTimeout(refreshWheels, 60);
  setTimeout(refreshWheels, 250);
}

function wheelColumn(items, initial, onChange, opts) {
  opts = opts || {};
  const N      = items.length;
  const loop   = !!opts.loop && N > 1;
  const COPIES = loop ? 5 : 1;
  const mid    = loop ? 2 * N : 0;
  const shown = [];
  for (let c = 0; c < COPIES; c++) for (let i = 0; i < N; i++) shown.push(items[i]);

  const col = document.createElement('div');
  col.className = 'wcol';
  const sc = document.createElement('div');
  sc.className = 'sc';
  sc.innerHTML = shown.map(t => `<div class="it">${t}</div>`).join('');
  const band = document.createElement('div');
  band.className = 'band';
  col.appendChild(sc);
  col.appendChild(band);

  const clampLog = i => Math.max(0, Math.min(N - 1, i | 0));
  let idx = mid + clampLog(initial);
  let quiet = false;
  const logical = () => ((idx % N) + N) % N;
  const paint = () => {
    const log = logical();
    sc.querySelectorAll('.it').forEach((n, k) => n.classList.toggle('sel', (k % N) === log));
  };
  const place = target => { sc.scrollTop = target; };
  function recenter() {
    if (!loop) return;
    const next = mid + logical();
    if (next !== idx) { idx = next; place(idx * ITEM_H); }
  }
  let ready = false;
  function apply() {
    if (!col.isConnected || col.offsetParent === null) return;
    if (sc.clientHeight < ITEM_H) return;
    ready = true;
    quiet = true;
    recenter();
    if (Math.abs(sc.scrollTop - idx * ITEM_H) > 2) place(idx * ITEM_H);
    paint();
    setTimeout(() => { quiet = false; }, 80);
  }
  function set(i, smooth) {
    idx = mid + clampLog(i);
    quiet = true;
    if (smooth) sc.scrollTo({ top: idx * ITEM_H, behavior: 'smooth' });
    else place(idx * ITEM_H);
    paint();
    setTimeout(() => { quiet = false; }, smooth ? 280 : 80);
  }
  let t = null;
  sc.addEventListener('scroll', () => {
    if (!ready || quiet || col.offsetParent === null || sc.clientHeight < ITEM_H) return;
    const live = Math.round(sc.scrollTop / ITEM_H);
    if (live >= 0 && live < shown.length) { idx = live; paint(); }
    clearTimeout(t);
    t = setTimeout(() => {
      quiet = true;
      sc.scrollTo({ top: idx * ITEM_H, behavior: 'smooth' });
      setTimeout(() => {
        recenter();
        quiet = false;
        if (onChange) onChange(logical());
      }, 180);
    }, 80);
  }, { passive: true });

  let armed = false;
  function arm(on) {
    armed = !!on;
    col.classList.toggle('armed', armed);
  }
  function nudge(dir) {
    let i = logical() + dir;
    if (loop) i = ((i % N) + N) % N;
    else i = clampLog(i);
    set(i);
    if (onChange) onChange(i);
  }
  sc.addEventListener('wheel', e => {
    e.preventDefault();
    e.stopPropagation();
    if (!armed) {
      window.scrollBy(0, e.deltaY);
      return;
    }
    nudge(e.deltaY > 0 ? 1 : -1);
  }, { passive: false });

  const api = { el: col, get: logical, set, apply, arm, destroy: () => WHEELS.delete(api) };
  col.addEventListener('pointerdown', () => {
    WHEELS.forEach(w => { if (w !== api && w.arm) w.arm(false); });
    arm(true);
  });
  if (!window._wheelDisarm) {
    window._wheelDisarm = true;
    document.addEventListener('pointerdown', e => {
      if (e.target.closest('.wcol')) return;
      WHEELS.forEach(w => { if (w.arm) w.arm(false); });
    }, true);
  }
  WHEELS.add(api);
  return api;
}

function wheelGroup(host, cols, captions, ltr, slim) {
  host.innerHTML = '';
  const row = document.createElement('div');
  row.className = 'wheels' + (ltr ? ' ltr' : '') + (slim ? ' tiny' : '');
  cols.forEach(c => row.appendChild(c.el));
  host.appendChild(row);
  if (captions) {
    const cap = document.createElement('div');
    cap.className = 'wcap' + (ltr ? ' ltr' : '');
    cap.innerHTML = captions.map(c => `<span>${c}</span>`).join('');
    host.appendChild(cap);
  }
  const settle = () => cols.forEach(c => c.apply());
  settle();
  requestAnimationFrame(settle);
  setTimeout(settle, 60);
  setTimeout(settle, 300);
}

function makeDateWheel(host, onChange) {
  const [cy, cm, cd] = todayJ();
  const years = [];
  for (let y = cy - 2; y <= cy + 1; y++) years.push(String(y));
  const dayItems = (y, m) => {
    const a = [];
    for (let i = 1; i <= jMonthLen(y, m); i++) a.push(pad2(i));
    return a;
  };
  let wy, wm, wd;
  const fire = () => { if (onChange) onChange(); };
  function rebuildDays() {
    if (!wd) return;
    const y = Number(years[wy.get()]);
    const m = wm.get() + 1;
    const keep = wd.get();
    const items = dayItems(y, m);
    if (items.length === wd.count) { wd.apply(); return; }
    const nd = wheelColumn(items, Math.min(keep, items.length - 1), fire, { loop: true });
    nd.count = items.length;
    wd.destroy();
    wd.el.replaceWith(nd.el);
    wd = nd;
    requestAnimationFrame(() => nd.apply());
    setTimeout(() => nd.apply(), 60);
  }
  wy = wheelColumn(years, years.indexOf(String(cy)), () => { rebuildDays(); fire(); }, { loop: true });
  wm = wheelColumn(J_MONTHS, cm - 1, () => { rebuildDays(); fire(); }, { loop: true });
  wd = wheelColumn(dayItems(cy, cm), cd - 1, fire, { loop: true });
  wd.count = jMonthLen(cy, cm);
  wheelGroup(host, [wy, wm, wd], ['سال', 'ماه', 'روز']);
  return {
    value: () => fmtJ(Number(years[wy.get()]), wm.get() + 1, wd.get() + 1),
    apply: () => { wy.apply(); wm.apply(); wd.apply(); },
    today: () => {
      const [y, m, d] = todayJ();
      wy.set(years.indexOf(String(y)));
      wm.set(m - 1);
      rebuildDays();
      setTimeout(() => wd.set(d - 1), 30);
    }
  };
}

function minuteItems() {
  const mm = [];
  for (let i = 0; i <= 60; i += 5) mm.push(pad2(i));
  return mm;
}
function minuteIndex(m) {
  const snapped = Math.round((m || 0) / 5) * 5;
  return Math.max(0, Math.min(12, snapped / 5));
}
function makeClockWheel(host, defH, defM, hourList, onChange, slim) {
  const hours = hourList && hourList.length ? hourList : [...Array(24).keys()];
  const hh = hours.map(h => pad2(h));
  const mm = minuteItems();
  const h0 = Math.max(0, hours.indexOf(defH == null ? hours[0] : defH));
  const m0 = minuteIndex(defM);
  const notify = () => { if (onChange) onChange(hh[wh.get()] + ':' + mm[wm.get()]); };
  const wh = wheelColumn(hh, h0, notify, { loop: true });
  const wm = wheelColumn(mm, m0, notify, { loop: true });
  wheelGroup(host, [wh, wm], ['ساعت', 'دقیقه'], true, slim);
  return {
    value: () => hh[wh.get()] + ':' + mm[wm.get()],
    setHM: (h, m) => {
      const hi = hours.indexOf(Number(h));
      wh.set(hi >= 0 ? hi : h0);
      wm.set(minuteIndex(m));
    },
    apply: () => { wh.apply(); wm.apply(); }
  };
}
function makeDurWheel(host, defH, defM, onChange, slim) {
  const hh = [];
  for (let i = 0; i <= 24; i++) hh.push(String(i));
  const mm = minuteItems();
  const notify = () => { if (onChange) onChange(); };
  const wh = wheelColumn(hh, Math.min(24, defH || 0), notify, { loop: true });
  const wm = wheelColumn(mm, minuteIndex(defM), notify, { loop: true });
  wheelGroup(host, [wh, wm], ['ساعت', 'دقیقه'], true, slim);
  return {
    minutes: () => Number(hh[wh.get()]) * 60 + Number(mm[wm.get()]),
    hm: () => fmtHM(Number(hh[wh.get()]) * 60 + Number(mm[wm.get()])),
    setMinutes: m => {
      const n = Math.max(0, Math.min(24 * 60, Number(m) || 0));
      wh.set(Math.floor(n / 60), true);
      wm.set(minuteIndex(n % 60), true);
    },
    reset: () => { wh.set(0); wm.set(0); }
  };
}
function makeMinWheel(host, max, def, step) {
  step = step || 1;
  const mm = [];
  for (let i = 0; i <= max; i += step) mm.push(String(i));
  const start = mm.indexOf(String(def));
  const wm = wheelColumn(mm, start < 0 ? 0 : start, null, { loop: true });
  wheelGroup(host, [wm], ['min'], true, true);
  return { minutes: () => Number(mm[wm.get()]) };
}
function makePctWheel(host, min, def) {
  const items = [];
  for (let i = min; i <= 100; i += 5) items.push(String(i));
  const start = items.indexOf(String(def));
  const w = wheelColumn(items, start < 0 ? 0 : start, null, { loop: false });
  wheelGroup(host, [w], ['درصد'], true);
  return { value: () => Number(items[w.get()]) };
}
function clockToMin(hhmm) {
  const p = String(hhmm || '0:0').split(':');
  return (Number(p[0]) || 0) * 60 + (Number(p[1]) || 0);
}
function bidDiffMin(alarm, wake) {
  let d = clockToMin(wake) - clockToMin(alarm);
  if (d < 0) d += 24 * 60;
  return d;
}

/* ═════════════════════════════ 4. STORAGE ══════════════════════════════════ */

const DB_NAME = 'dailylog', DB_VER = 1;
let _db = null;

function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = ev => {
      const db = ev.target.result;
      if (!db.objectStoreNames.contains('sessions')) db.createObjectStore('sessions', { keyPath:'uid' });
      if (!db.objectStoreNames.contains('meta'))     db.createObjectStore('meta',     { keyPath:'uid' });
      if (!db.objectStoreNames.contains('config'))   db.createObjectStore('config',   { keyPath:'k' });
    };
    req.onsuccess = () => { _db = req.result; resolve(_db); };
    req.onerror   = () => reject(req.error);
  });
}
const store = (n, m) => openDB().then(db => db.transaction(n, m).objectStore(n));
const put = (n, o) => openDB().then(db => new Promise((res, rej) => {
  const tx = db.transaction(n, 'readwrite');
  tx.oncomplete = () => res(o);
  tx.onerror = () => rej(tx.error);
  tx.objectStore(n).put(o);
}));
const delKey = (n, key) => store(n, 'readwrite').then(s => new Promise((res, rej) => {
  const r = s.delete(key); r.onsuccess = () => res(); r.onerror = () => rej(r.error);
}));
const getAll = n => store(n, 'readonly').then(s => new Promise((res, rej) => {
  const r = s.getAll(); r.onsuccess = () => res(r.result || []); r.onerror = () => rej(r.error);
}));
const clearStore = n => store(n, 'readwrite').then(s => new Promise((res, rej) => {
  const r = s.clear(); r.onsuccess = () => res(); r.onerror = () => rej(r.error);
}));
const cfgGet = k => { try { return localStorage.getItem('dl_' + k) || ''; } catch (e) { return ''; } };
const cfgSet = (k, v) => { try { localStorage.setItem('dl_' + k, v); } catch (e) {} };

const RED_LOCK_DAYS = 14;
const redLockFromDay  = () => cfgGet('red_lock_from_day');
const redLockUntilDay = () => cfgGet('red_lock_until_day');
function redLockCovers(day) {
  const from = redLockFromDay(), until = redLockUntilDay();
  if (!from || !until) return false;
  const d = String(day || '');
  return d >= from && d < until;
}
function redLockOpenDay() {
  return redLockCovers(fmtJ.apply(null, todayJ())) ? redLockUntilDay() : '';
}
function armRedLock(day) { armLock(day, RED_LOCK_DAYS); }
function armLock(day, days) {
  const add = Math.max(1, Number(days) || RED_LOCK_DAYS);
  const p = parseJ(day);
  if (!p[0]) return add;
  const today = fmtJ.apply(null, todayJ());
  const from = fmtJ(p[0], p[1], p[2]);
  const curUntil = redLockUntilDay();
  let base;
  if (curUntil && curUntil > today) {
    const u = parseJ(curUntil);
    base = u[0] ? u : p;
  } else {
    base = p;
    cfgSet('red_lock_from_day', from);
  }
  const until = fmtJ.apply(null, addDaysJ(base[0], base[1], base[2], add));
  if (!curUntil || until > curUntil) cfgSet('red_lock_until_day', until);
  if (add >= 14) cfgSet('silent_until', until);
  return add;
}
function silentUntil() { return cfgGet('silent_until'); }
function redLockBlocks(day, opts) {
  if (opts && opts.allowStack) return false;
  const hit = redLockCovers(fmtJ.apply(null, todayJ())) || redLockCovers(day);
  if (!hit) return false;
  toast('قفل · ' + redLockFromDay() + ' تا ' + redLockUntilDay() + ' · +ruz az tick shekast', true);
  vibrate(60);
  return true;
}

const $ = id => document.getElementById(id);
const uid = () => Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
const num = v => (v === '' || v == null || isNaN(Number(v))) ? '' : Number(v);
const vibrate = ms => { if (navigator.vibrate) navigator.vibrate(ms); };

function toast(msg, isErr) {
  const t = $('toast');
  t.textContent = msg;
  t.className = 'show' + (isErr ? ' err' : '');
  clearTimeout(t._h);
  t._h = setTimeout(() => { t.className = ''; }, 2200);
}

function parseDone(rec) {
  if (!rec) return {};
  if (rec.done && typeof rec.done === 'object') return rec.done;
  try { return JSON.parse(rec.doneJson || '{}'); } catch (e) { return {}; }
}
function parseTakhirSamples(rec) {
  if (!rec) return [];
  if (rec.takhirJson != null && rec.takhirJson !== '') {
    try {
      const a = JSON.parse(rec.takhirJson);
      if (Array.isArray(a)) return a.map(x => Number(x)).filter(x => !isNaN(x));
    } catch (e) {}
    return [];
  }
  const n = Number(rec.takhirN) || 0;
  const avg = Number(rec.takhirAvg);
  if (n > 0 && !isNaN(avg)) return Array.from({ length: n }, () => avg);
  return [];
}
function writeTakhirSamples(rec, samples) {
  const a = (samples || []).map(x => Number(x)).filter(x => !isNaN(x));
  rec.takhirJson = JSON.stringify(a);
  rec.takhirN = a.length;
  rec.takhirSum = a.reduce((s, x) => s + x, 0);
  rec.takhirAvg = a.length ? (rec.takhirSum / a.length) : '';
}
function takhirStats(rec, extra) {
  const samples = parseTakhirSamples(rec).concat((extra || []).map(Number).filter(x => !isNaN(x)));
  const n = samples.length;
  const sum = samples.reduce((s, x) => s + x, 0);
  const avg = n ? (sum / n) : '';
  return { samples, n, sum, avg, ok: n ? avg < TAKHIR_OK : false };
}
function takhirIsOk(rec, extra) {
  return takhirStats(rec, extra).ok;
}
function isComplete(rec) {
  const d = parseDone(rec);
  return META_ITEMS.every(it => {
    if (it.optional || isNegItem(it)) return true;
    if (it.kind === 'avgSec') {
      const n = Number(rec && rec.takhirN) || 0;
      return !n || takhirIsOk(rec);
    }
    if (it.kind === 'accumDur') return true;
    return !!d[it.id] || !!(rec && rec[it.id]);
  });
}

function metaUid(day) {
  return 'meta-' + String(day || '').trim();
}
function fillMetaGaps(keep, extra) {
  if (!keep || !extra) return;
  Object.keys(META_STORE).forEach(id => {
    const k = META_STORE[id];
    if (!(Number(keep[k]) > 0) && Number(extra[k]) > 0) keep[k] = extra[k];
  });
  META_FLAG_IDS.forEach(k => {
    if (!keep[k] && extra[k]) keep[k] = extra[k];
  });
  Object.keys(FLAG_BUNDLES).forEach(p => {
    FLAG_BUNDLES[p].forEach(k => {
      if (!keep[k] && extra[k]) keep[k] = extra[k];
    });
  });
  if (!parseTakhirSamples(keep).length && parseTakhirSamples(extra).length) {
    writeTakhirSamples(keep, parseTakhirSamples(extra));
  }
  if ((!keep.lawsJson || keep.lawsJson === '[]') && extra.lawsJson && extra.lawsJson !== '[]') {
    keep.lawsJson = extra.lawsJson;
    keep.lawsMin = extra.lawsMin;
  }
  keep.done = Object.assign({}, parseDone(extra), parseDone(keep));
  keep.doneJson = JSON.stringify(keep.done);
  keep.complete = isComplete(keep) ? 1 : 0;
}
function migrateMeta(rec) {
  if (!rec) return rec;
  if (!rec.openfa1h && rec.fastMode && /open/i.test(String(rec.fastMode))) rec.openfa1h = 1;
  if (!rec.chizayemojazbadeopfa2 && rec.cleanAfterOpen) rec.chizayemojazbadeopfa2 = rec.cleanAfterOpen;
  if (!rec.takhghmojaz0 && rec.adametakhghmoj0) rec.takhghmojaz0 = rec.adametakhghmoj0;
  if (!rec.saatbidari5 && rec.bidDiffMin !== '' && rec.bidDiffMin != null && Number(rec.bidDiffMin) <= 5) {
    rec.saatbidari5 = 1;
  }
  if (rec.opf1 && rec.opf1 !== 1 && rec.opf1 !== 0 && rec.opf1 !== '0' && rec.opf1 !== '1') rec.opf1 = 1;
  if (rec.opf2 && rec.opf2 !== 1 && rec.opf2 !== 0 && rec.opf2 !== '0' && rec.opf2 !== '1') rec.opf2 = 1;
  rec.opf1 = rec.opf1 ? 1 : 0;
  rec.opf2 = rec.opf2 ? 1 : 0;
  if (!(Number(rec.takhirN) > 0) && rec.mintakhir !== '' && rec.mintakhir != null) {
    rec.takhirN = 1;
    rec.takhirSum = Number(rec.mintakhir);
    rec.takhirAvg = Number(rec.mintakhir);
  }
  migrateFlagBundles(rec);
  return rec;
}
async function metaFor(day) {
  const all = await getAll('meta');
  const hits = all.filter(r => r.dateShamsi === day);
  if (!hits.length) return null;
  hits.sort((a, b) => {
    const na = Object.keys(parseDone(a)).length;
    const nb = Object.keys(parseDone(b)).length;
    if (nb !== na) return nb - na;
    return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
  });
  const keep = hits[0];
  const oldUid = keep.uid;
  for (let i = 1; i < hits.length; i++) fillMetaGaps(keep, hits[i]);
  migrateMeta(keep);
  const want = metaUid(day);
  if (oldUid !== want || hits.length > 1) {
    keep.uid = want;
    keep.dateShamsi = day;
    keep.synced = 0;
    await put('meta', keep);
    for (const extra of hits) {
      if (extra.uid && extra.uid !== want) await delKey('meta', extra.uid);
    }
  }
  return keep;
}
function parkComposer(compId, homeId) {
  const comp = $(compId);
  const home = $(homeId);
  if (comp && home && comp.parentNode !== home) home.appendChild(comp);
  if (comp) {
    comp.classList.add('hide');
    comp.classList.remove('docked');
  }
}
function dockComposerUnder(compId, btn) {
  const comp = $(compId);
  if (!comp || !btn) return;
  btn.insertAdjacentElement('afterend', comp);
  comp.classList.remove('hide');
  comp.classList.add('docked');
  requestAnimationFrame(() => {
    const hdr = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hdr')) || 108;
    const dock = document.querySelector('.dock');
    const dockH = dock ? dock.offsetHeight : 88;
    const rect = comp.getBoundingClientRect();
    if (rect.top < hdr + 8 || rect.bottom > window.innerHeight - dockH - 8) {
      const y = window.scrollY + rect.top - hdr - 12;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
    settleWheels();
  });
}
function freezeActive() {
  const [y, m, d] = todayJ();
  return fmtJ(y, m, d) < APP_FREEZE_UNTIL;
}
function paintFreezeBanner() {
  const el = $('freezeBanner');
  if (!el) return;
  const on = freezeActive();
  el.hidden = !on;
  el.classList.toggle('hide', !on);
  el.setAttribute('aria-hidden', on ? 'false' : 'true');
  const nameEl = el.querySelector('b');
  if (nameEl) nameEl.textContent = NIKA_NAME;
  const p = el.querySelector('p');
  if (p) p.textContent = 'از ۱۲ شهریور تا ۱۲ آذر هیچ تغییری در اپ داده نمی‌شود. ۱۲ شهریور روز مهم است.';
  const sp = el.querySelector('span');
  if (sp) sp.textContent = APP_FREEZE_FROM + ' — ' + APP_FREEZE_UNTIL;
  pinHeader();
}
function blankMeta(day) {
  const rec = {
    uid: metaUid(day),
    createdAt: new Date().toISOString(),
    dateShamsi: day,
    moodToFlowMin:0, afterFastMoodMin:0, ghanoonMin:0, ghanoonFarayeMin:0, afzayeshShansMin:0, layersMin:0, sokut:0,
    takhirAvg:'', takhirN:0, takhirSum:0, takhirJson:'[]', lawsJson:'[]', lawsMin:0,
    bidWake:'', bidDiffMin:'',
    done: {}, doneJson: '{}', complete: 0, synced: 0
  };
  META_FLAG_IDS.forEach(k => { rec[k] = ''; });
  rec.ruzshekast = '';
  return rec;
}

/* ═════════════════════════════ 5. META FORM ════════════════════════════════ */

let mDate = null;
const mW = {};
const flagDraft = {};
let takhirPick = null;
let lawDraft = [];
let lastMetaRec = null;
let bidariDraft = false;
let metaSlot = 'all';
let metaPack = 'all';
let metaImpMin = 'all';
const META_IMP_CHIPS = [
  { id:'all', label:'همه درجه' },
  { id:8, label:'۸+' },
  { id:9, label:'۹+' },
  { id:10, label:'فقط ۱۰' }
];
const PISHRO_ROWS = [
  { id:'ITPr', label:'ITPr' },
  { id:'takhshose', label:'takhshose' },
  { id:'moshv', label:'moshv' },
  { id:'arasmor', label:'arasmor' },
  { id:'openfa2', label:'openfa2' }
];
let pishroPart = 0;
let pishroPicked = null;
let pishroDraftItems = [];
let pishroDyn = {};

function flagOn(rec, id) {
  if (Object.prototype.hasOwnProperty.call(flagDraft, id)) return !!flagDraft[id];
  if (rec && rec[id]) return true;
  return flagBundleKeys(id).some(k => !!(rec && rec[k]));
}

function clearFlagDraft() {
  Object.keys(flagDraft).forEach(k => delete flagDraft[k]);
  takhirPick = null;
}

function parseLaws(rec) {
  try {
    const a = JSON.parse((rec && rec.lawsJson) || '[]');
    if (!Array.isArray(a)) return [];
    return a.filter(x => x && String(x.name || '').trim()).map(x => ({
      name: String(x.name).trim(),
      desc: String(x.desc || ''),
      min: Number(x.min) || 0
    }));
  } catch (e) { return []; }
}
function lawsForSummary(rec) {
  return rec ? parseLaws(rec) : [];
}
function lawCatalog() {
  try {
    const a = JSON.parse(cfgGet('law_catalog') || '[]');
    return Array.isArray(a) ? a : [];
  } catch (e) { return []; }
}
function lawCatalogSave(name, desc) {
  const n = String(name || '').trim();
  if (!n) return;
  const cat = lawCatalog().filter(x => x.name !== n);
  cat.unshift({ name: n, desc: String(desc || '').trim() });
  cfgSet('law_catalog', JSON.stringify(cat.slice(0, 40)));
}
function lawCatalogRemove(name) {
  const n = String(name || '').trim();
  cfgSet('law_catalog', JSON.stringify(lawCatalog().filter(x => x.name !== n)));
}
function clearLawForm() {
  if ($('lawName')) $('lawName').value = '';
  if ($('lawDesc')) $('lawDesc').value = '';
  if (mW.lawDur) mW.lawDur.reset();
}
async function loadLawDraft() {
  paintSavedLaws();
  paintLawList();
}

function lawFormRow() {
  const name = (($('lawName') && $('lawName').value) || '').trim();
  if (!name) return null;
  return {
    name,
    desc: (($('lawDesc') && $('lawDesc').value) || '').trim(),
    min: mW.lawDur ? mW.lawDur.minutes() : 0
  };
}
function mergeLawRows(base, extra) {
  const items = base.slice();
  extra.forEach(row => {
    if (!row || !row.name) return;
    const i = items.findIndex(x => x.name === row.name);
    if (i >= 0) items[i] = row;
    else items.push(row);
  });
  return items;
}
async function saveDayLaws(items) {
  const day = selectedMetaDay();
  if (redLockBlocks(day)) return;
  const rec = await metaFor(day) || blankMeta(day);
  rec.lawsJson = JSON.stringify(items);
  rec.lawsMin = items.reduce((s, x) => s + (Number(x.min) || 0), 0);
  rec.done = parseDone(rec);
  rec.doneJson = JSON.stringify(rec.done);
  rec.complete = isComplete(rec) ? 1 : 0;
  rec.synced = 0;
  rec.createdAt = rec.createdAt || new Date().toISOString();
  await put('meta', rec);
  lastMetaRec = rec;
  items.forEach(x => lawCatalogSave(x.name, x.desc));
  await paintMetaStatus();
  updateQueueBadge();
  trySync();
  return rec;
}

function selectedMetaDay() {
  if (!mDate) return '';
  refreshWheels();
  if (mDate.apply) mDate.apply();
  let day = mDate.value();
  const [ty, tm, td] = todayJ();
  const p = String(day).split('/').map(Number);
  if (p[0] === ty - 2 && p[1] === tm && p[2] === td) {
    mDate.today();
    return fmtJ(ty, tm, td);
  }
  return day;
}

function totalLine(it, rec) {
  if (!rec) return '—';
  if (rec.ruzshekast) return 'روز شکست';
  if (it.kind === 'accumDur') return 'امروز: ' + fmtChunk(rec[META_STORE[it.id]] || 0);
  if (it.kind === 'flag') return flagOn(rec, it.id) ? 'ثبت شد' : 'ثبت نشده';
  if (it.kind === 'avgSec') {
    const st = takhirStats(rec);
    let line = st.n
      ? ('avg ' + Number(st.avg).toFixed(2) + 's  n=' + st.n + (st.ok ? '  ok' : '  slow'))
      : 'no samples yet';
    if (takhirPick != null) line += ' · pishnevis ' + takhirPick + 's (bad az put)';
    return line;
  }
  return '';
}

async function paintMetaStatus() {
  const day = mDate ? selectedMetaDay() : '';
  const rec = day ? await metaFor(day) : null;
  lastMetaRec = rec;
  const work = await sessionWork(day);
  const host = $('metaBlocks');
  if (host) host.classList.toggle('shekast', !!(rec && rec.ruzshekast));
  if ($('metaDayChart')) paintDayChart($('metaDayChart'), rec, work);
  if ($('pishroBlocks')) paintPishro(rec);
  META_ITEMS.forEach(it => {
    const tot = $('tot_' + it.id);
    if (tot) tot.textContent = totalLine(it, rec);
    if (it.kind === 'flag' && it._btn) it._btn.classList.toggle('on', flagOn(rec, it.id));
  });
  paintSavedLaws();
  paintLawList();
  paintBidWakeFields(rec);
  const pick = document.querySelector('#mw_takhirAvg .pick');
  if (pick) {
    pick.querySelectorAll('button').forEach(b => {
      b.classList.toggle('on', takhirPick != null && String(b.textContent) === String(takhirPick));
    });
  }
}

let bidPaintDay = '';
function paintBidWakeFields(rec) {
  const hint = $('bidHint');
  if (!hint) return;
  const wake = rec && rec.bidWake ? String(rec.bidWake) : '3:30';
  const diff = rec && rec.bidDiffMin !== '' && rec.bidDiffMin != null ? Number(rec.bidDiffMin) : null;
  hint.textContent = hasBidari(rec)
    ? ('wake ' + wake + (diff != null ? (' · tafavot ' + diff + 'm' + (diff <= BID_DIFF_OK_MIN ? ' ok' : '')) : ''))
    : 'set nashode · charkh pishfarz 3:30, put nashode';
  const day = rec && rec.dateShamsi || '';
  if (day === bidPaintDay) return;
  bidPaintDay = day;
  bidariDraft = false;
  paintBidWakeFields._silent = true;
  try {
    if (mW.bidWake && mW.bidWake.setHM) {
      const p = wake.split(':');
      mW.bidWake.setHM(Number(p[0]) || 3, Number(p[1]) || 30);
    }
    if (mW.bidDiff) {
      if (diff != null) mW.bidDiff.setMinutes(diff);
      else if (mW.bidDiff.reset) mW.bidDiff.reset();
    }
  } finally {
    paintBidWakeFields._silent = false;
  }
}

let sumTimer = null;
function markBidariDraft() {
  if (paintBidWakeFields._silent) return;
  bidariDraft = true;
  scheduleSummary();
}
function scheduleSummary() {
  clearTimeout(sumTimer);
  sumTimer = setTimeout(() => { paintMetaStatus(); }, 180);
}

function pickBar(host, values, selected, onPick) {
  host.innerHTML = '';
  const d = document.createElement('div');
  d.className = 'pick';
  values.forEach(v => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = String(v);
    if (String(v) === String(selected)) b.classList.add('on');
    b.addEventListener('click', () => {
      d.querySelectorAll('button').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      onPick(v);
    });
    d.appendChild(b);
  });
  host.appendChild(d);
}

function groupFlags(gid) {
  return META_ITEMS.filter(it => it.group === gid && it.kind === 'flag');
}

function mountMetaItem(host, it) {
  if (it.kind === 'flag') {
    let row = host.querySelector('.flaggrid');
    if (!row) {
      row = document.createElement('div');
      row.className = 'flaggrid';
      host.appendChild(row);
    }
    const b = document.createElement('button');
    b.type = 'button';
    b.dir = dirOf(itemFa(it));
    b.className = 'mchk imp-' + itemImp(it);
    if (itemImp(it) >= 10) b.classList.add('imp-hero');
    if (it.lockDays) b.classList.add(it.lockDays >= 14 ? 'sev-lock' : 'sev-day');
    b.innerHTML = '<i></i><span>' + itemFa(it) + '</span>' +
      '<em class="impn">' + itemImp(it) + '</em>' +
      (lockBadge(it) ? '<b>' + lockBadge(it) + '</b>' : '');
    b.addEventListener('click', () => {
      if (isNegItem(it)) commitFlag(it);
      else toggleFlagDraft(it.id);
    });
    row.appendChild(b);
    it._btn = b;
    return;
  }
  const box = document.createElement('div');
  box.className = 'mblock imp-' + itemImp(it) + (itemImp(it) >= 10 ? ' imp-hero' : '');
  box.innerHTML =
    `<h3 class="${dirOf(itemFa(it))}">${itemFa(it)}</h3>` +
    `<p class="hint" id="tot_${it.id}">—</p>` +
    `<div id="mw_${it.id}"></div>` +
    `<button type="button" class="rst" data-reset="${it.id}">reset</button>`;
  host.appendChild(box);
  const h = $('mw_' + it.id);
  if (it.kind === 'accumDur') mW[it.id] = makeDurWheel(h, 0, 0, scheduleSummary);
  if (it.kind === 'avgSec') {
    const bar = document.createElement('div');
    h.appendChild(bar);
    pickBar(bar, TAKHIR_SECS, null, v => {
      takhirPick = Number(v);
      scheduleSummary();
      vibrate(8);
    });
  }
  const rst = box.querySelector('[data-reset]');
  if (rst) rst.addEventListener('click', () => resetMetaItem(it.id));
}

function paintSavedLaws() {
  const host = $('lawSaved');
  if (!host) return;
  const items = parseLaws(lastMetaRec);
  if (!items.length) {
    host.innerHTML = '';
    return;
  }
  host.innerHTML = items.map((x, i) =>
    `<div class="lawcard saved">` +
      `<b>${esc(x.name)}</b>` +
      (x.desc ? `<span class="desc">${esc(x.desc)}</span>` : '') +
      `<span class="desc">${fmtChunk(x.min)}</span>` +
      `<button type="button" class="cancel" data-saved-law="${i}">hazf az ruz</button>` +
    `</div>`
  ).join('');
  host.querySelectorAll('[data-saved-law]').forEach(b => {
    b.addEventListener('click', async () => {
      const items = parseLaws(lastMetaRec);
      items.splice(Number(b.dataset.savedLaw), 1);
      await saveDayLaws(items);
      toast('hazf shod');
      vibrate(8);
    });
  });
}

function paintLawList() {
  const host = $('lawList');
  if (!host) return;
  if (!lawDraft.length) {
    host.innerHTML = '';
    return;
  }
  host.innerHTML = lawDraft.map((x, i) =>
    `<div class="lawcard">` +
      `<b>${esc(x.name)}</b>` +
      (x.desc ? `<span class="desc">${esc(x.desc)}</span>` : '') +
      `<span class="desc">${fmtChunk(x.min)}</span>` +
      `<button type="button" class="cancel" data-law="${i}">hazf az pishnevis</button>` +
    `</div>`
  ).join('');
  host.querySelectorAll('[data-law]').forEach(b => {
    b.addEventListener('click', () => {
      lawDraft.splice(Number(b.dataset.law), 1);
      paintLawList();
      vibrate(8);
    });
  });
}

function paintLawCatalog() {
  const host = $('lawCat');
  if (!host) return;
  const cat = lawCatalog();
  if (!cat.length) { host.innerHTML = ''; return; }
  host.innerHTML = cat.map(x =>
    `<span class="lawchip">` +
      `<button type="button" data-n="${esc(x.name)}">${esc(x.name)}</button>` +
      `<button type="button" class="cancel" data-del-cat="${esc(x.name)}">hazf</button>` +
    `</span>`
  ).join('');
  host.querySelectorAll('button[data-n]').forEach(b => {
    b.addEventListener('click', () => {
      const hit = lawCatalog().find(x => x.name === b.dataset.n);
      if (!hit) return;
      $('lawName').value = hit.name;
      $('lawDesc').value = hit.desc || '';
      vibrate(8);
    });
  });
  host.querySelectorAll('[data-del-cat]').forEach(b => {
    b.addEventListener('click', ev => {
      ev.stopPropagation();
      lawCatalogRemove(b.dataset.delCat);
      paintLawCatalog();
      vibrate(8);
      toast('pishnevis hazf');
    });
  });
}

function mountBidWakePanel(wrap) {
  const box = document.createElement('div');
  box.className = 'mblock bidwake';
  box.innerHTML =
    '<h3>saatbidari</h3>' +
    '<p class="hint" id="bidHint">wake 3:30</p>' +
    '<label class="lb ltr">wake time</label>' +
    '<div id="bidWakeW"></div>' +
    '<label class="lb ltr">tafavot (min)</label>' +
    '<div id="bidDiffW"></div>';
  const putBtn = wrap.querySelector('.gput');
  wrap.insertBefore(box, putBtn || null);
  mW.bidWake = makeClockWheel($('bidWakeW'), 3, 30, null, markBidariDraft, true);
  mW.bidDiff = makeDurWheel($('bidDiffW'), 0, 0, markBidariDraft, true);
}

function mountLawsPanel(wrap) {
  const box = document.createElement('div');
  box.className = 'mblock';
  box.innerHTML =
    `<h3>name + saat</h3>` +
    `<div class="chips qchips" id="lawCat"></div>` +
    `<label class="lb">nam</label>` +
    `<input id="lawName" class="ltr" placeholder="masalan: sokut-12"/>` +
    `<label class="lb">tozih</label>` +
    `<textarea id="lawDesc" class="ltr"></textarea>` +
    `<label class="lb">saat</label>` +
    `<div id="lawDur"></div>` +
    `<div class="mall">` +
      `<button type="button" id="lawAdd">add be pishnevis</button>` +
      `<button type="button" id="lawClear">hazf pishnevis</button>` +
    `</div>` +
    `<div class="lawlist" id="lawSaved"></div>` +
    `<div class="lawlist" id="lawList"></div>`;
  wrap.appendChild(box);
  mW.lawDur = makeDurWheel($('lawDur'), 0, 30);
  $('lawAdd').addEventListener('click', () => {
    const row = lawFormRow();
    if (!row) { toast('nam khali ast', true); return; }
    const i = lawDraft.findIndex(x => x.name === row.name);
    if (i >= 0) lawDraft[i] = row;
    else lawDraft.push(row);
    lawCatalogSave(row.name, row.desc);
    paintLawCatalog();
    paintLawList();
    clearLawForm();
    vibrate(8);
    toast(row.name + ' pishnevis');
  });
  $('lawClear').addEventListener('click', () => {
    lawDraft = [];
    clearLawForm();
    paintLawList();
    vibrate(8);
    toast('pishnevis khali');
  });
  paintLawCatalog();
  paintSavedLaws();
  paintLawList();
}

function itemInSlot(it, slot) {
  if (slot === 'all') return true;
  return it.slot === 'all' || it.slot === slot || String(it.slot) === String(slot);
}
function visibleMetaItems(pane) {
  return META_ITEMS.filter(it => {
    if ((it.pane || 'meta') !== pane) return false;
    if (pane === 'meta' && !itemInSlot(it, metaSlot)) return false;
    if (pane === 'meta' && metaPack !== 'all' && it.group !== metaPack) return false;
    if (pane === 'meta' && metaImpMin !== 'all' && itemImp(it) < Number(metaImpMin)) return false;
    return true;
  }).sort(sortByImp);
}
function lockBadge(it) {
  const n = Number(it.lockDays) || 0;
  return n ? ('+' + n) : '';
}
function renderMetaFilters() {
  const slotHost = $('metaSlots');
  const packHost = $('metaPacks');
  const impHost = $('metaImps');
  if (slotHost) {
    slotHost.innerHTML = META_SLOTS.map(s =>
      '<button type="button" data-slot="' + s.id + '" class="' + dirOf(s.label) + (String(s.id) === String(metaSlot) ? ' on' : '') + '">' + s.label + '</button>'
    ).join('');
    slotHost.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      metaSlot = b.dataset.slot === 'all' ? 'all' : Number(b.dataset.slot);
      renderMetaFilters();
      renderMetaList();
    }));
  }
  if (packHost) {
    const packs = [{ id:'all', title:'همه' }].concat(META_GROUPS.filter(g =>
      g.id !== 'bidari' && g.id !== 'layers' && g.id !== 'sokut' && g.id !== 'laws'));
    packHost.innerHTML = packs.map(g =>
      '<button type="button" data-pack="' + g.id + '" class="' + dirOf(g.title) + (g.id === metaPack ? ' on' : '') + '">' + g.title + '</button>'
    ).join('');
    packHost.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      metaPack = b.dataset.pack;
      renderMetaFilters();
      renderMetaList();
    }));
  }
  if (impHost) {
    impHost.innerHTML = META_IMP_CHIPS.map(s =>
      '<button type="button" data-imp="' + s.id + '" class="rtl' + (String(s.id) === String(metaImpMin) ? ' on' : '') + '">' + s.label + '</button>'
    ).join('');
    impHost.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      metaImpMin = b.dataset.imp === 'all' ? 'all' : Number(b.dataset.imp);
      renderMetaFilters();
      renderMetaList();
    }));
  }
}
function renderMetaList() {
  const host = $('metaBlocks');
  if (!host) return;
  host.innerHTML = '';
  host.className = 'mgrids';
  const items = visibleMetaItems('meta');
  const groups = [];
  items.forEach(it => { if (!groups.includes(it.group)) groups.push(it.group); });
  groups.sort((a, b) => {
    const ma = Math.max(0, ...items.filter(it => it.group === a).map(itemImp));
    const mb = Math.max(0, ...items.filter(it => it.group === b).map(itemImp));
    return mb - ma;
  });
  groups.forEach(gid => {
    const wrap = document.createElement('div');
    wrap.className = 'mgrp tone-' + gid + ' span2';
    const g = META_GROUPS.find(x => x.id === gid) || { title: gid };
    wrap.innerHTML = '<div class="gtitle ' + dirOf(g.title) + '">' + g.title + '</div>';
    host.appendChild(wrap);
    items.filter(it => it.group === gid).sort(sortByImp).forEach(it => mountMetaItem(wrap, it));
    const putBtn = document.createElement('button');
    putBtn.type = 'button';
    putBtn.className = 'gput';
    putBtn.textContent = 'ثبت ' + (g.title || gid);
    putBtn.addEventListener('click', () => putGroup(gid));
    wrap.appendChild(putBtn);
  });
  paintMetaStatus();
}
function buildPaneItems(hostId, pane) {
  const host = $(hostId);
  if (!host) return;
  host.innerHTML = '';
  host.className = 'mgrids';
  const wrap = document.createElement('div');
  wrap.className = 'mgrp tone-' + pane + ' span2';
  host.appendChild(wrap);
  META_ITEMS.filter(it => (it.pane || 'meta') === pane).slice().sort(sortByImp).forEach(it => mountMetaItem(wrap, it));
  if (pane === 'bidari') mountBidWakePanel(wrap);
  const putBtn = document.createElement('button');
  putBtn.type = 'button';
  putBtn.className = 'gput';
  putBtn.textContent = 'ثبت ' + pane;
  putBtn.addEventListener('click', () => putPane(pane));
  wrap.appendChild(putBtn);
}
function buildLawsPane() {
  const host = $('lawsBlocks');
  if (!host) return;
  host.innerHTML = '';
  host.className = 'mgrids';
  const wrap = document.createElement('div');
  wrap.className = 'mgrp tone-laws span2';
  wrap.innerHTML = '<div class="gtitle rtl">قانون مهم — جدا و دم‌دست</div>';
  host.appendChild(wrap);
  mountLawsPanel(wrap);
  const putBtn = document.createElement('button');
  putBtn.type = 'button';
  putBtn.className = 'gput';
  putBtn.textContent = 'ثبت قانون';
  putBtn.addEventListener('click', () => putGroup('laws'));
  wrap.appendChild(putBtn);
}
function normalizePishro(data) {
  if (!data || typeof data !== 'object') return { items: [] };
  if (Array.isArray(data.items)) {
    return {
      items: data.items.filter(x => x && x.code).map(x => ({
        code: String(x.code),
        cat: String(x.cat || ''),
        min: Number(x.min) || 0,
        q: Array.isArray(x.q) ? x.q.slice() : []
      }))
    };
  }
  const items = [];
  PISHRO_ROWS.forEach(r => {
    const row = data[r.id];
    if (row && row.on) items.push({ code: r.id, cat: '', min: Number(row.min) || 0, q: row.q || [] });
  });
  Object.keys(data).forEach(k => {
    if (k === 'items' || PISHRO_ROWS.some(r => r.id === k)) return;
    const row = data[k];
    if (row && (row.on || row.min || (row.q && row.q.length))) {
      items.push({ code: k, cat: row.cat || '', min: Number(row.min) || 0, q: row.q || [] });
    }
  });
  return { items };
}
function parkPishroComposer() { parkComposer('pishroComposer', 'pishroComposerHome'); }
function buildPishroParts() {
  const host = $('pishroParts');
  if (!host) return;
  if (!pishroPart && pishroPart !== 0) pishroPart = partFromClock();
  host.innerHTML = PARTS.map(p =>
    `<button type="button" data-p="${p.id}" class="p${p.id} ${dirOf(p.label)}">${p.label}</button>`).join('');
  const paint = () => host.querySelectorAll('button').forEach(b =>
    b.classList.toggle('on', Number(b.dataset.p) === pishroPart));
  host.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    pishroPart = Number(b.dataset.p);
    pishroPicked = null;
    paint();
    fillPishroList();
    vibrate(8);
  }));
  paint();
}
function fillPishroList() {
  parkPishroComposer();
  const host = $('pishroList');
  if (!host) return;
  const allowed = codesForPart(pishroPart);
  const cats = [...new Set(allowed.map(c => c.cat))];
  host.innerHTML = cats.map(cat => {
    const items = allowed.filter(c => c.cat === cat);
    const stick = items.some(c => c.stick);
    return `<div class="catbox cat-${cat}"><div class="catlab">${cat}</div>` +
      `<div class="alist${stick ? ' stick' : ''}">` +
      items.map(c => `<button type="button" data-code="${c.code}">${c.code}</button>`).join('') +
      `</div></div>`;
  }).join('');
  host.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    pishroPicked = CODES.find(c => c.code === b.dataset.code);
    host.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    openPishroComposer();
    vibrate(8);
  }));
}
function openPishroComposer() {
  const c = pishroPicked;
  const comp = $('pishroComposer');
  const btn = document.querySelector('#pishroList button.on');
  if (!c || !comp || !btn) return;
  dockComposerUnder('pishroComposer', btn);
  $('pishroCompTitle').textContent = c.code;
  const host = $('pishroDyn');
  WHEELS.forEach(w => { if (!w.el.isConnected) w.destroy(); });
  host.innerHTML = '';
  pishroDyn = {};
  const def = c.def || {};
  pishroDyn.dur = makeDurWheel(addField(host, 'مدت همین تکه'), def.h || 0, def.m || 0);
  quickChips(host, [5,10,15,20,25,30,40,50,60], m => {
    const h = Math.floor(pishroDyn.dur.minutes() / 60);
    pishroDyn.dur.setMinutes(h * 60 + m);
  });
  const qh = $('pishroQ');
  qh.innerHTML = QUALITY_TAGS.map(t =>
    `<button type="button" data-t="${t}" class="${dirOf(qualityFa(t))}">${qualityFa(t)}</button>`
  ).join('');
  qh.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    b.classList.toggle('on');
    vibrate(8);
  }));
  settleWheels();
}
function addPishroItem() {
  if (!pishroPicked) { toast('اول یک کار را بزن', true); return; }
  const q = Array.from(document.querySelectorAll('#pishroQ button.on')).map(b => b.dataset.t);
  pishroDraftItems.push({
    code: pishroPicked.code,
    cat: pishroPicked.cat,
    min: pishroDyn.dur ? pishroDyn.dur.minutes() : 0,
    q: q
  });
  paintPishroPlan();
  parkPishroComposer();
  pishroPicked = null;
  document.querySelectorAll('#pishroList button.on').forEach(b => b.classList.remove('on'));
  vibrate(12);
  toast('به برنامه اضافه شد');
}
function paintPishroPlan() {
  const host = $('pishroPlan');
  if (!host) return;
  if (!pishroDraftItems.length) {
    host.innerHTML = '<div class="empty">برنامه خالی است — از فهرست بالا بزن</div>';
    return;
  }
  host.innerHTML = pishroDraftItems.map((x, i) =>
    '<div class="pishrow">' +
      '<div class="pishlab">' +
        '<b class="ltr">' + esc(x.code) + '</b>' +
        '<span class="nbdur">' + esc(fmtChunk(x.min)) + '</span>' +
        '<button type="button" class="cancel" data-pdel="' + i + '">حذف</button>' +
      '</div>' +
      (x.q && x.q.length
        ? '<div class="chips qchips">' + x.q.map(t =>
            '<span class="chip ' + dirOf(qualityFa(t)) + '">' + esc(qualityFa(t)) + '</span>'
          ).join('') + '</div>'
        : '') +
    '</div>'
  ).join('');
  host.querySelectorAll('[data-pdel]').forEach(b => b.addEventListener('click', () => {
    pishroDraftItems.splice(Number(b.dataset.pdel), 1);
    paintPishroPlan();
    vibrate(8);
  }));
}
function buildPishro() {
  const host = $('pishroBlocks');
  if (!host) return;
  if (host.dataset.ready) {
    paintPishroPlan();
    return;
  }
  host.dataset.ready = '1';
  pishroPart = partFromClock();
  host.innerHTML =
    '<label class="lb">پارت برنامه</label>' +
    '<div class="parts" id="pishroParts"></div>' +
    '<div id="pishroList"></div>' +
    '<div id="pishroComposerHome">' +
      '<div id="pishroComposer" class="hide">' +
        '<label class="lb ltr" id="pishroCompTitle">—</label>' +
        '<div id="pishroDyn"></div>' +
        '<div class="chips qchips" id="pishroQ"></div>' +
        '<button type="button" class="primary" id="pishroAdd">به برنامه اضافه کن</button>' +
      '</div>' +
    '</div>' +
    '<h3 class="pishplan-title">برنامهٔ امروز</h3>' +
    '<div id="pishroPlan"></div>';
  buildPishroParts();
  fillPishroList();
  const add = $('pishroAdd');
  if (add) add.addEventListener('click', addPishroItem);
  const save = $('pishroSave');
  if (save && !save.dataset.bound) {
    save.dataset.bound = '1';
    save.addEventListener('click', savePishro);
  }
  paintPishroPlan();
}
function readPishroUi() {
  return { items: pishroDraftItems.map(x => ({ code: x.code, cat: x.cat, min: x.min, q: x.q.slice() })) };
}
function paintPishro(rec) {
  let data = {};
  try { data = JSON.parse((rec && rec.pishroJson) || '{}'); } catch (e) { data = {}; }
  pishroDraftItems = normalizePishro(data).items;
  paintPishroPlan();
}
async function savePishro() {
  const day = selectedMetaDay();
  if (!day) return;
  const rec = await metaFor(day) || blankMeta(day);
  rec.pishroJson = JSON.stringify(readPishroUi());
  rec.synced = 0;
  await put('meta', rec);
  lastMetaRec = rec;
  toast('برنامه ذخیره شد');
  trySync();
}
function buildMeta() {
  let paintT = null;
  if ($('mDate') && !mDate) {
    mDate = makeDateWheel($('mDate'), () => {
      clearFlagDraft();
      lawDraft = [];
      bidariDraft = false;
      clearTimeout(paintT);
      paintT = setTimeout(() => {
        loadLawDraft().then(() => {
          paintMetaStatus();
          paintPishro(lastMetaRec);
        });
      }, 220);
    });
  }
  renderMetaFilters();
  renderMetaList();
  buildPaneItems('bidariBlocks', 'bidari');
  buildPaneItems('layerBlocks', 'layers');
  buildPaneItems('sokutBlocks', 'sokut');
  buildLawsPane();
  buildPishro();
  loadLawDraft().then(() => paintMetaStatus());
}

function draftGroupFlags(gid, on) {
  groupFlags(gid).forEach(it => { flagDraft[it.id] = on ? 1 : 0; });
  paintMetaStatus();
  vibrate(8);
}

function toggleFlagDraft(id) {
  flagDraft[id] = flagOn(lastMetaRec, id) ? 0 : 1;
  paintMetaStatus();
  vibrate(8);
}

async function commitFlag(it) {
  const day = selectedMetaDay();
  if (!day) return;
  let rec = await metaFor(day) || blankMeta(day);
  const on = !rec[it.id];
  if (!on) {
    rec[it.id] = '';
    const done = parseDone(rec);
    delete done[it.id];
    rec.done = done;
    rec.doneJson = JSON.stringify(done);
    rec.synced = 0;
    await put('meta', rec);
    lastMetaRec = rec;
    toast('off ' + it.id);
    await paintMetaStatus();
    trySync();
    return;
  }
  const n = Number(it.lockDays) || 0;
  if (!confirm(itemFa(it) + (n ? ('\n+' + n + ' روز به قفل اضافه می‌شود') : '') + (it.wipe ? '\nروز پاک می‌شود' : '') + (it.silent ? '\nسکوت با هوش مصنوعی' : '') + ' ؟')) return;
  rec[it.id] = 1;
  applyFlagBundle(rec, it.id, true);
  const keep = [it.id];
  if (it.wipe) {
    rec.ruzshekast = 1;
    keep.push('ruzshekast');
    await wipeDayKeepFlags(day, rec, keep);
  } else {
    const done = parseDone(rec);
    done[it.id] = 1;
    rec.done = done;
    rec.doneJson = JSON.stringify(done);
    rec.synced = 0;
    rec.complete = isComplete(rec) ? 1 : 0;
    await put('meta', rec);
    lastMetaRec = rec;
  }
  if (n) armLock(day, n);
  if (it.silent) cfgSet('silent_until', redLockUntilDay() || silentUntil());
  vibrate(25);
  toast((n ? ('+' + n + ' → ' + redLockUntilDay()) : 'set') + (it.silent ? ' · sokut' : ''));
  await paintMetaStatus();
  updateLockPill();
  trySync();
}

async function putPane(pane) {
  const gids = Array.from(new Set(META_ITEMS.filter(it => (it.pane || 'meta') === pane).map(it => it.group)));
  for (const gid of gids) await putGroup(gid);
}

async function putGroup(gid) {
  const day = selectedMetaDay();
  if (redLockBlocks(day, { allowStack: negGroup(gid) })) return;
  let rec = await metaFor(day) || blankMeta(day);
  const done = parseDone(rec);
  if (gid === 'laws') {
    const extra = lawDraft.slice();
    const form = lawFormRow();
    if (form) extra.push(form);
    if (!extra.length) { toast('nam khali ast', true); return; }
    const items = mergeLawRows(parseLaws(rec), extra);
    rec.lawsJson = JSON.stringify(items);
    rec.lawsMin = items.reduce((s, x) => s + (Number(x.min) || 0), 0);
    items.forEach(x => lawCatalogSave(x.name, x.desc));
    rec.done = done;
    rec.doneJson = JSON.stringify(done);
    rec.complete = isComplete(rec) ? 1 : 0;
    rec.synced = 0;
    rec.createdAt = rec.createdAt || new Date().toISOString();
    await put('meta', rec);
    lastMetaRec = rec;
    lawDraft = [];
    clearLawForm();
    vibrate(25);
    toast('laws put n=' + items.length);
    await paintMetaStatus();
    await refreshData();
    paintDashboard();
    updateQueueBadge();
    trySync();
    return;
  }
  META_ITEMS.filter(it => it.group === gid).forEach(it => {
    if (it.kind === 'flag') {
      const on = flagOn(rec, it.id);
      rec[it.id] = on ? 1 : '';
      applyFlagBundle(rec, it.id, on);
      if (on) done[it.id] = 1;
      else delete done[it.id];
      delete flagDraft[it.id];
    }
    if (it.kind === 'accumDur') {
      const add = mW[it.id] ? mW[it.id].minutes() : 0;
      const key = META_STORE[it.id];
      if (add > 0) {
        rec[key] = (Number(rec[key]) || 0) + add;
        mW[it.id].reset();
      }
      if (Number(rec[key]) > 0) done[it.id] = 1;
    }
    if (it.kind === 'avgSec') {
      const samples = parseTakhirSamples(rec);
      if (takhirPick != null && !isNaN(Number(takhirPick))) samples.push(Number(takhirPick));
      takhirPick = null;
      writeTakhirSamples(rec, samples);
      if (samples.length && takhirIsOk(rec)) done[it.id] = 1;
      else delete done[it.id];
    }
  });
  if (gid === 'bidari' && mW.bidWake && mW.bidDiff && bidariDraft) {
    rec.bidWake = mW.bidWake.value();
    rec.bidDiffMin = mW.bidDiff.minutes();
    const diff = Number(rec.bidDiffMin) || 0;
    rec.saatbidari5 = diff <= BID_DIFF_OK_MIN ? 1 : '';
    if (diff <= BID_DIFF_OK_MIN) done.saatbidari5 = 1;
    else {
      delete done.saatbidari5;
      rec.bidarshodanharhal = 1;
      done.bidarshodanharhal = 1;
    }
    bidariDraft = false;
  }
  rec.done = done;
  rec.doneJson = JSON.stringify(done);
  rec.complete = isComplete(rec) ? 1 : 0;
  rec.synced = 0;
  rec.createdAt = rec.createdAt || new Date().toISOString();
  let addLock = 0, wipe = false, silent = false;
  groupFlags(gid).forEach(it => {
    if (!rec[it.id] || !isNegItem(it)) return;
    addLock += Number(it.lockDays) || 0;
    if (it.wipe) wipe = true;
    if (it.silent) silent = true;
  });
  if (gid === 'bidari' && Number(rec.bidDiffMin) > 0) {
    addLock += 15;
    wipe = true;
    silent = true;
  }
  const broke = addLock > 0 || wipe;
  if (broke) {
    const keep = groupFlags(gid).map(it => it.id).concat(['ruzshekast']);
    const ask = '+' + addLock + ' ruz jam ru ghofl' + (wipe ? ' · ruz pak' : '') + (silent ? ' · sokut' : '') + ' ?';
    if (!confirm(ask)) return;
    rec.ruzshekast = 1;
    if (wipe) await wipeDayKeepFlags(day, rec, keep);
    else await put('meta', rec);
    if (addLock) armLock(day, addLock);
    if (silent) cfgSet('silent_until', redLockUntilDay() || silentUntil());
    vibrate(25);
    toast('+' + addLock + ' · ta ' + redLockUntilDay());
    await paintMetaStatus();
    await paintNotebook();
    await refreshData();
    updateQueueBadge();
    trySync();
    return;
  }
  if (negGroup(gid)) rec.ruzshekast = '';
  await put('meta', rec);
  vibrate(25);
  toast(gid + ' put');
  await paintMetaStatus();
  updateQueueBadge();
  trySync();
}

async function wipeDayKeepFlags(day, rec, keepIds) {
  const sess = (await getAll('sessions')).filter(r => r.dateShamsi === day);
  for (const r of sess) {
    if (r.synced) queueSessionDelete(r.uid);
    await delKey('sessions', r.uid);
  }
  queueMetaDelete(metaUid(day), day);
  for (const r of (await getAll('meta')).filter(r => r.dateShamsi === day)) {
    if (r.uid && r.uid !== metaUid(day)) queueMetaDelete(r.uid, day);
    await delKey('meta', r.uid);
  }
  const next = blankMeta(day);
  next.done = {};
  keepIds.forEach(id => {
    if (!rec[id]) return;
    next[id] = 1;
    next.done[id] = 1;
  });
  next.doneJson = JSON.stringify(next.done);
  next.complete = 0;
  next.synced = 0;
  next.createdAt = rec.createdAt || next.createdAt;
  await put('meta', next);
  lastMetaRec = next;
}

/* ═════════════════════════════ 6. NOTEBOOK ═════════════════════════════════ */

let sDate = null, dyn = {}, activePart = 0, picked = null;

const codesForPart = p => CODES.filter(c => (c.from || 0) <= p);
const currentCode = () => picked || codesForPart(activePart)[0];

function partFromClock() {
  const h = new Date().getHours();
  if (h < 12) return 0;
  if (h < 14) return 1;
  if (h < 18) return 2;
  return 3;
}

function buildParts() {
  activePart = partFromClock();
  const host = $('sParts');
  host.innerHTML = PARTS.map(p =>
    `<button type="button" data-p="${p.id}" class="p${p.id} ${dirOf(p.label)}">${p.label}</button>`).join('');
  const paint = () => host.querySelectorAll('button').forEach(b =>
    b.classList.toggle('on', Number(b.dataset.p) === activePart));
  host.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    activePart = Number(b.dataset.p);
    paint();
    picked = null;
    fillActivityList();
    vibrate(8);
  }));
  paint();
}

function fillActivityList() {
  parkComposer('nbComposer', 'nbComposerHome');
  const allowed = codesForPart(activePart);
  const cats = [...new Set(allowed.map(c => c.cat))];
  $('nbList').innerHTML = cats.map(cat => {
    const items = allowed.filter(c => c.cat === cat);
    const stick = items.some(c => c.stick);
    return `<div class="catbox cat-${cat}"><div class="catlab">${cat}</div>` +
      `<div class="alist${stick ? ' stick' : ''}">` +
      items.map(c => `<button type="button" data-code="${c.code}">${c.code}</button>`).join('') +
      `</div></div>`;
  }).join('');
  $('nbList').querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    picked = CODES.find(c => c.code === b.dataset.code);
    $('nbList').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    openComposer();
    vibrate(8);
  }));
}

function addField(parent, text) {
  const l = document.createElement('label');
  l.className = 'lb';
  l.textContent = text;
  const box = document.createElement('div');
  parent.appendChild(l);
  parent.appendChild(box);
  return box;
}

function quickChips(parent, values, cb) {
  const d = document.createElement('div');
  d.className = 'chips';
  d.innerHTML = values.map(v => `<button type="button" data-v="${v}">${v}</button>`).join('');
  d.querySelectorAll('button').forEach(b =>
    b.addEventListener('click', () => { cb(Number(b.dataset.v)); vibrate(8); }));
  parent.appendChild(d);
}

function whoOptionsFor(code) {
  if (String(code || '') !== 'takhmojmotn') return [];
  return TAKH_WHO;
}
function paintWhoBox(code) {
  const box = $('whoBox');
  if (!box) return;
  const list = whoOptionsFor(code);
  box.classList.toggle('hide', !list.length);
  if (!list.length) { box.innerHTML = ''; return; }
  box.innerHTML = list.map(w =>
    `<label class="whochk"><input type="checkbox" data-who="${esc(w.id)}"/> ${esc(w.label)}</label>`
  ).join('');
  box.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('change', () => {
      inp.closest('.whochk').classList.toggle('on', inp.checked);
      vibrate(8);
    });
  });
}
function selectedWho() {
  const box = $('whoBox');
  if (!box || box.classList.contains('hide')) return [];
  return [...box.querySelectorAll('input:checked')].map(i => i.dataset.who).filter(Boolean);
}

function openComposer() {
  const c = currentCode();
  const d = c.def || {};
  const btn = document.querySelector('#nbList button.on');
  if (btn) dockComposerUnder('nbComposer', btn);
  else {
    $('nbComposer').classList.remove('hide');
    $('nbComposer').classList.add('docked');
  }
  $('compTitle').textContent = c.code;
  const host = $('dynFields');
  WHEELS.forEach(w => { if (!w.el.isConnected) w.destroy(); });
  host.innerHTML = '';
  dyn = {};

  if (c.metric === 'dur') {
    dyn.dur = makeDurWheel(addField(host, 'مدت این تکه'), d.h || 0, d.m || 0);
    quickChips(host, [5,10,15,20,25,30,40,50,60], m => {
      const h = Math.floor(dyn.dur.minutes() / 60);
      dyn.dur.setMinutes(h * 60 + m);
    });
    quickChips(host, [0,1,2,3,4,5,6], h => {
      const m = dyn.dur.minutes() % 60;
      dyn.dur.setMinutes(h * 60 + m);
    });
  }
  paintWhoBox(c.code);
  if (c.metric === 'sec') {
    const box = addField(host, 'ثانیه — حداقل ' + MIN_REACT_SEC);
    box.innerHTML = `<input id="f_sec" class="ltr" type="number" inputmode="numeric" min="${MIN_REACT_SEC}" value="${d.n || MIN_REACT_SEC}"/>`;
  }
  if (c.metric === 'reps') {
    const box = addField(host, 'تعداد × دقیقهٔ هر بار');
    box.innerHTML = '<div class="grid2">' +
      `<input id="f_reps" class="ltr" type="number" inputmode="numeric" min="1" value="${d.r || 1}"/>` +
      `<input id="f_perrep" class="ltr" type="number" inputmode="numeric" min="1" value="${d.pr || 5}"/>` +
      '</div>';
  }
  if (c.kind) {
    const box = addField(host, 'تهیه یا خوردن');
    box.innerHTML = '<div class="chips">' +
      '<button type="button" id="k_p">تهیه</button><button type="button" id="k_e" class="on">خوردن</button></div>';
    dyn.kind = 'خوردن';
    $('k_p').onclick = () => { dyn.kind = 'تهیه'; $('k_p').classList.add('on'); $('k_e').classList.remove('on'); };
    $('k_e').onclick = () => { dyn.kind = 'خوردن'; $('k_e').classList.add('on'); $('k_p').classList.remove('on'); };
  }
  if (c.metric === 'accum') {
    const box = addField(host, 'count');
    box.innerHTML = `<input id="f_count" class="ltr" type="number" inputmode="numeric" min="1" value="${d.n || 1}"/>`;
  }
  let qh = $('qTags');
  if (!qh) {
    qh = document.createElement('div');
    qh.id = 'qTags';
    qh.className = 'chips qchips';
    $('s_tags').insertAdjacentElement('afterend', qh);
  }
  qh.innerHTML = QUALITY_TAGS.map(t => `<button type="button" data-t="${t}" class="${dirOf(qualityFa(t))}">${qualityFa(t)}</button>`).join('');
  const paintQ = () => {
    const cur = $('s_tags').value.split(',').map(s => s.trim()).filter(Boolean);
    qh.querySelectorAll('button').forEach(b => b.classList.toggle('on', cur.indexOf(b.dataset.t) >= 0));
  };
  qh.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    const cur = $('s_tags').value.split(',').map(s => s.trim()).filter(Boolean);
    const i = cur.indexOf(b.dataset.t);
    if (i >= 0) cur.splice(i, 1);
    else cur.push(b.dataset.t);
    $('s_tags').value = cur.join(',');
    paintQ();
    vibrate(8);
  }));
  paintQ();
  let qdurHost = $('qDurHost');
  if (!qdurHost) {
    qdurHost = document.createElement('div');
    qdurHost.id = 'qDurHost';
    qh.insertAdjacentElement('afterend', qdurHost);
  }
  qdurHost.innerHTML = '';
  dyn.qdur = makeDurWheel(addField(qdurHost, 'مدت همین کیفیت'), 0, 0);
  settleWheels();
}

function collectSession() {
  if (!picked) { toast('اول از فهرست یک کار را بزن', true); return null; }
  const c = picked;
  const rec = {
    uid: uid(),
    createdAt: new Date().toISOString(),
    dateShamsi: sDate.value(),
    part: PARTS[activePart].label,
    partId: activePart,
    category: c.cat,
    code: c.code,
    metric: c.metric,
    minutes:'', hm:'', chunk:'', tags: $('s_tags').value.trim(),
    reactSec:'', count:'', reps:'', perRep:'', kind: dyn.kind || '',
    note: $('s_note').value.trim(),
    synced: 0
  };
  const who = selectedWho();
  if (who.length) {
    rec.who = who.map(w => w === 'showSE' ? 'SHOSE' : w).join(',');
    const marked = who.map(w => 'who:' + (w === 'showSE' ? 'SHOSE' : w));
    rec.tags = marked.concat(rec.tags ? rec.tags.split(',').map(s => s.trim()).filter(Boolean) : []).join(',');
  }
  if (c.metric === 'dur') {
    rec.minutes = dyn.dur.minutes();
    rec.hm = dyn.dur.hm();
    rec.chunk = fmtChunk(rec.minutes);
  }
  if (c.metric === 'sec') {
    rec.reactSec = num($('f_sec').value);
    if (rec.reactSec === '' || rec.reactSec < MIN_REACT_SEC) {
      toast('تأخیر حداقل ' + MIN_REACT_SEC + ' ثانیه', true); return null;
    }
    rec.chunk = rec.reactSec + 's';
  }
  if (c.metric === 'reps') {
    rec.reps = num($('f_reps').value);
    rec.perRep = num($('f_perrep').value);
    if (rec.reps !== '' && rec.perRep !== '') {
      rec.minutes = rec.reps * rec.perRep;
      rec.hm = fmtHM(rec.minutes);
      rec.chunk = fmtChunk(rec.minutes);
    }
  }
  if (c.metric === 'accum') rec.count = num($('f_count').value) || 1;
  if (dyn.qdur) {
    const qm = dyn.qdur.minutes();
    if (qm > 0) {
      const qh = 'q=' + fmtChunk(qm);
      rec.tags = rec.tags ? rec.tags + ',' + qh : qh;
    }
  }
  const filled = [rec.minutes, rec.count, rec.reactSec].some(v => v !== '' && v !== 0);
  if (c.metric === 'accum' && rec.count) return rec;
  if (!filled) { toast('مقدار خالی است', true); return null; }
  return rec;
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function paintNotebook() {
  if (!sDate) return;
  const day = sDate.value();
  const rows = (await getAll('sessions'))
    .filter(r => r.dateShamsi === day)
    .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
  const host = $('nbLog');
  let html = '';
  PARTS.forEach(p => {
    const here = rows.filter(r => Number(r.partId) === p.id || r.part === p.label);
    if (!here.length) return;
    html += '<div class="nbpart p' + p.id + '"><div class="partline ' + dirOf(p.label) + '">' + esc(p.label) + '</div>';
    const order = [];
    const bag = {};
    here.forEach(r => {
      if (!bag[r.code]) {
        const hit = CODES.find(c => c.code === r.code);
        bag[r.code] = { cat: catName(r.category || (hit && hit.cat) || ''), tags:[], chunks:[], sum:0, count:0 };
        order.push(r.code);
      }
      const g = bag[r.code];
      if (r.tags) r.tags.split(',').map(s => s.trim()).filter(Boolean).forEach(t => {
        if (g.tags.indexOf(t) < 0) g.tags.push(t);
      });
      if (r.chunk) g.chunks.push(r.chunk);
      else if (r.minutes) g.chunks.push(fmtChunk(r.minutes));
      else if (r.count) g.chunks.push('+' + r.count);
      g.sum += Number(r.minutes) || 0;
      g.count += Number(r.count) || 0;
    });
    order.forEach(code => {
      const g = bag[code];
      let dur = '';
      if (g.count && !g.sum) dur = '×' + g.count;
      else {
        dur = (g.chunks.length ? g.chunks.join(',') : '0m');
        if (g.chunks.length > 1) dur += ' =' + fmtChunk(g.sum);
      }
      html += '<div class="nbline' + (g.cat ? ' cat-' + g.cat : '') + '">' +
        '<span class="nbcode">' + esc(code) + '</span>' +
        (g.tags.length ? '<span class="nbtags">' + esc(g.tags.join(', ')) + '</span>' : '') +
        '<span class="nbdur">' + esc(dur) + '</span>' +
      '</div>';
    });
    html += '</div>';
  });
  host.innerHTML = html || '<div class="empty">خالی</div>';
}

/* ═════════════════════════════ 7. TABS / SAVE ══════════════════════════════ */

let activeTab = 'pishro';

function pinHeader() {
  const h = document.querySelector('header');
  if (h) document.documentElement.style.setProperty('--hdr', h.offsetHeight + 'px');
}

let sessionReady = false;
function ensureSessionUi() {
  if (sessionReady) return;
  sessionReady = true;
  sDate = makeDateWheel($('sDate'), () => paintNotebook());
  buildParts();
  fillActivityList();
}

const TAB_IDS = ['pishro','bidari','sokut','laws','meta','layers','session','data'];
function showTab(name) {
  if (TAB_IDS.indexOf(name) < 0) name = 'pishro';
  activeTab = name;
  cfgSet('tab', name);
  TAB_IDS.forEach(id => {
    const pane = $('pane' + id.charAt(0).toUpperCase() + id.slice(1));
    if (pane) pane.classList.toggle('hide', id !== name);
    const tab = $('tab' + id.charAt(0).toUpperCase() + id.slice(1));
    if (tab) tab.classList.toggle('active', id === name);
  });
  if ($('dayBar')) $('dayBar').classList.toggle('hide', ['pishro','bidari','sokut','laws','meta','layers'].indexOf(name) < 0);
  $('btnSave').disabled  = (name !== 'session');
  $('btnSave').textContent = 'این خط را بنویس';
  const bar = document.querySelector('.bar');
  if (bar) bar.classList.toggle('hide', name !== 'session');
  document.body.style.paddingBottom = name === 'session' ? '168px' : '108px';
  if (name === 'session') ensureSessionUi();
  requestAnimationFrame(pinHeader);
  settleWheels();
  if (name === 'meta' || name === 'bidari' || name === 'layers' || name === 'pishro' || name === 'sokut' || name === 'laws') {
    paintMetaStatus();
    paintPishro(lastMetaRec);
  }
  if (name === 'session') { paintNotebook(); paintMetaStatus(); }
  if (name === 'data') refreshData();
}

async function doSave() {
  if (activeTab === 'session') {
    const rec = collectSession();
    if (!rec) return;
    if (redLockBlocks(rec.dateShamsi)) return;
    await put('sessions', rec);
    vibrate(25);
    toast('خط نشست · ' + rec.code + ':' + (rec.chunk || rec.count));
    $('s_note').value = '';
    $('s_tags').value = '';
    parkComposer('nbComposer', 'nbComposerHome');
    picked = null;
    document.querySelectorAll('#nbList button.on').forEach(b => b.classList.remove('on'));
    await paintNotebook();
  }
  updateQueueBadge();
  trySync();
}

/* ═════════════════════════════ 8. SYNC ═════════════════════════════════════ */

async function forceMetaResyncOnce() {
  if (cfgGet('meta_resync') === 'v38') return;
  const all = await getAll('meta');
  for (const r of all) {
    r.synced = 0;
    await put('meta', r);
  }
  cfgSet('meta_resync', 'v38');
}

function execHint(url) {
  const u = String(url || '');
  const m = u.match(/\/macros\/s\/([^/]+)/);
  return m ? ('script/' + m[1].slice(0, 12) + '…') : u.slice(0, 40);
}

function paintSyncOut(msg) {
  const el = $('syncOut');
  if (el) el.textContent = msg;
}

async function parseScriptBody(raw) {
  try { return JSON.parse(raw); }
  catch (e) {
    const clip = String(raw || '').replace(/\s+/g, ' ').slice(0, 80);
    throw new Error('پاسخ شیت جیسان نیست · ' + clip);
  }
}

async function probeScript(url, secret) {
  try {
    const res = await fetch(url, { method: 'GET' });
    const raw = await res.text();
    const outp = await parseScriptBody(raw);
    if (outp && (outp.version || outp.alive || outp.ok != null)) return outp;
  } catch (e) {}
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ secret: secret || '', type: 'meta', fields: ['uid'], rows: [] })
  });
  const raw = await res.text();
  return parseScriptBody(raw);
}

async function checkSheet(loud) {
  const url = (cfgGet('url') || ($('cfg_url') && $('cfg_url').value.trim()) || '');
  const secret = (cfgGet('secret') || ($('cfg_secret') && $('cfg_secret').value.trim()) || '');
  if (!url) {
    paintSyncOut('آدرس وب‌اپ خالی است');
    if (loud) toast('آدرس وب‌اپ خالی است', true);
    return false;
  }
  paintSyncOut('در حال پرسیدن شیت…');
  try {
    const outp = await probeScript(url, secret);
    const ver = String(outp.version || '');
    const ok = ver === SCRIPT_VERSION;
    const tab = outp.lookAt || outp.tab || '';
    paintSyncOut(
      ok
        ? ('شیت درست · ' + ver + (tab ? (' · ' + tab) : '') + ' · ' + execHint(url))
        : ('وب‌اپ شیت کهنه است نه گیت‌هاب · آمده: ' + (ver || 'بدون‌نسخه') +
           ' · باید: ' + SCRIPT_VERSION + ' · ' + execHint(url) +
           ' · کد را در ویرایشگر ذخیره کن بعد روی همان استقرار مداد بزن نسخهٔ جدید')
    );
    if (loud) toast(ok ? 'شیت درست است' : 'همین آدرس کهنه است', !ok);
    return ok;
  } catch (e) {
    const msg = String(e.message || e);
    const line = (msg.indexOf('Failed to fetch') >= 0 || msg.indexOf('NetworkError') >= 0)
      ? 'مرورگر وب‌اپ را نخواند. همان لینک /exec را در تب تازه باز کن'
      : msg;
    paintSyncOut(line);
    if (loud) toast('آدرس شیت باز نشد', true);
    return false;
  }
}

function fetchPlain(url, body) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 60000);
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body),
    signal: ctrl.signal
  }).finally(() => clearTimeout(t));
}

async function trySync(loud) {
  const url = cfgGet('url'), secret = cfgGet('secret');
  if (!url) { if (loud) toast('آدرس وب‌اپ خالی است', true); return; }
  if (!navigator.onLine) { if (loud) toast('آفلاین هستی', true); return; }
  if (trySync._busy) {
    if (Date.now() - (trySync._since || 0) > 70000) trySync._busy = false;
    else { if (loud) toast('در حال ارسال'); return; }
  }

  const allM = await getAll('meta');
  for (const r of allM) {
    if (!r.synced && !metaHasPayload(r)) {
      r.synced = 1;
      await put('meta', r);
    }
  }
  const s = (await getAll('sessions')).filter(r => !r.synced);
  const m = (await getAll('meta')).filter(r => !r.synced && metaHasPayload(r));
  const dels = pendingDeletes();
  const metaDels = pendingMetaDeletes();
  if (!s.length && !m.length && !dels.length && !metaDels.uids.length && !metaDels.days.length) {
    if (loud) toast('صف خالی است');
    await refreshData();
    updateQueueBadge();
    return;
  }

  trySync._busy = true;
  trySync._since = Date.now();
  try {
    let info = [];
    if (dels.length) {
      try {
        info.push(await pushDeletes(url, secret, dels));
        cfgSet('del_sessions', '[]');
      } catch (e) {
        info.push({ type: 'del', error: String(e.message || e) });
      }
    }
    if (metaDels.uids.length || metaDels.days.length) {
      try {
        info.push(await pushMetaDeletes(url, secret, metaDels));
        cfgSet('del_meta', '[]');
      } catch (e) {
        info.push({ type: 'mdel', error: String(e.message || e) });
      }
    }
    if (s.length) info.push(await pushBatch(url, secret, 'session', s, SESSION_FIELDS));
    if (m.length) info.push(await pushBatch(url, secret, 'meta',    m, META_FIELDS));
    const line = info.map(x =>
      (x.tab || x.type || '') + ' ' + (x.version || x.error || '') +
      ' +' + (x.inserted || 0) + ' ~' + (x.updated || 0) +
      (x.deleted ? ' -' + x.deleted : '')
    ).join(' · ');
    paintSyncOut(line);
    if (loud) toast('ارسال شد');
  } catch (e) {
    const msg = String(e.message || e);
    const abort = msg.indexOf('abort') >= 0 || msg.indexOf('Abort') >= 0;
    if (abort && !trySync._retried) {
      trySync._retried = true;
      trySync._busy = false;
      paintSyncOut('پاسخ دیر آمد · یک‌بار دیگر می‌فرستم');
      return trySync(loud);
    }
    trySync._retried = false;
    paintSyncOut(abort ? 'شیت نوشت ولی پاسخ دیر آمد. دوباره همگام بزن' : msg);
    if (loud) toast(
      msg.indexOf('old script') >= 0 ? 'همین آدرس کهنه است'
        : (abort ? 'دوباره همگام بزن' : 'ارسال نشد، در صف ماند'),
      true
    );
  } finally {
    trySync._busy = false;
  }
  trySync._retried = false;
  updateQueueBadge();
  await refreshData();
}

async function pushBatch(url, secret, type, rows, fields) {
  const payload = { secret, type, fields, rows: rows.map(r => fields.map(f => r[f] === undefined ? '' : r[f])) };
  const res = await fetchPlain(url, payload);
  const raw = await res.text();
  let outp;
  try { outp = JSON.parse(raw); } catch (e) { throw new Error('پاسخ شیت جیسان نیست'); }
  if (!outp.ok) throw new Error(outp.error || 'server');
  if (String(outp.version || '') !== SCRIPT_VERSION) {
    throw new Error('old script ' + (outp.version || ''));
  }
  const st = (type === 'meta') ? 'meta' : 'sessions';
  for (const r of rows) { r.synced = 1; await put(st, r); }
  return outp;
}

async function pushDeletes(url, secret, uids) {
  const payload = { secret, type: 'sessionDelete', uids };
  const res = await fetchPlain(url, payload);
  const raw = await res.text();
  let outp;
  try { outp = JSON.parse(raw); } catch (e) { throw new Error('پاسخ شیت جیسان نیست'); }
  if (!outp.ok) throw new Error(outp.error || 'server');
  if (String(outp.version || '') !== SCRIPT_VERSION) {
    throw new Error('old script ' + (outp.version || ''));
  }
  outp.type = 'del';
  return outp;
}
async function pushMetaDeletes(url, secret, pack) {
  const payload = { secret, type: 'metaDelete', uids: pack.uids || [], days: pack.days || [] };
  const res = await fetchPlain(url, payload);
  const raw = await res.text();
  let outp;
  try { outp = JSON.parse(raw); } catch (e) { throw new Error('پاسخ شیت جیسان نیست'); }
  if (!outp.ok) throw new Error(outp.error || 'server');
  if (String(outp.version || '') !== SCRIPT_VERSION) {
    throw new Error('old script ' + (outp.version || ''));
  }
  outp.type = 'mdel';
  return outp;
}

async function updateQueueBadge() {
  const s = (await getAll('sessions')).filter(r => !r.synced).length;
  const m = (await getAll('meta')).filter(r => !r.synced).length;
  const md = pendingMetaDeletes();
  const n = s + m + pendingDeletes().length + md.uids.length + md.days.length;
  $('queuePill').textContent = 'صف ' + n;
  $('queuePill').className = 'pill ' + (n ? 'off' : 'on');
  updateLockPill();
}
function redLockUnlock() {
  if (!redLockOpenDay()) return;
  const key = prompt('baraye baz kardan ghofl benevis: BAZKON');
  if (key == null) return;
  if (key.trim().toUpperCase() !== 'BAZKON') { toast('key eshtebah', true); return; }
  cfgSet('red_lock_from_day', '');
  cfgSet('red_lock_until_day', '');
  cfgSet('silent_until', '');
  toast('ghofl baz shod');
  updateLockPill();
  updateQueueBadge();
}
function updateLockPill() {
  const p = $('lockPill');
  if (!p) return;
  const until = redLockOpenDay();
  p.hidden = !until;
  const sil = silentUntil() && until;
  p.textContent = until ? ('قفل تا ' + until + (sil ? ' · sokut' : '') + ' · key') : 'قفل';
}
function updateNetPill() {
  const p = $('netPill');
  p.textContent = navigator.onLine ? 'آنلاین' : 'آفلاین';
  p.className = 'pill ' + (navigator.onLine ? 'on' : 'off');
}

/* ═════════════════════════════ 9. DATA / CSV ═══════════════════════════════ */

function hasBidari(rec) {
  if (!rec) return false;
  if (rec.saatbidari5) return true;
  if (rec.bidDiffMin !== '' && rec.bidDiffMin != null) return true;
  if (rec.bidWake && String(rec.bidWake) !== '') return true;
  return !!parseDone(rec).saatbidari5;
}
function metaHasPayload(rec) {
  if (!rec) return false;
  if (hasBidari(rec)) return true;
  if (Number(rec.takhirN) > 0) return true;
  if (parseLaws(rec).length) return true;
  if (META_ITEMS.some(it => it.kind === 'accumDur' && Number(rec[META_STORE[it.id]]) > 0)) return true;
  if (META_FLAG_IDS.some(id => rec[id])) return true;
  return Object.keys(parseDone(rec)).length > 0;
}
function bidariText(rec) {
  const wake = rec && rec.bidWake ? String(rec.bidWake) : '3:30';
  const diff = rec && rec.bidDiffMin !== '' && rec.bidDiffMin != null ? Number(rec.bidDiffMin) : null;
  return 'saatbidari=' + wake + (diff != null ? (' · ' + diff + 'm') : '');
}
function clearBidari(rec) {
  rec.bidWake = '';
  rec.bidDiffMin = '';
  rec.saatbidari5 = '';
  bidariDraft = false;
  if (mW.bidWake && mW.bidWake.setHM) mW.bidWake.setHM(3, 30);
  if (mW.bidDiff && mW.bidDiff.reset) mW.bidDiff.reset();
  bidPaintDay = '';
}
function metaBits(rec) {
  if (!rec) return [];
  const bits = [];
  if (hasBidari(rec)) bits.push({ id: 'bidari', text: bidariText(rec) });
  META_ITEMS.forEach(it => {
    if (it.id === 'saatbidari5') return;
    if (it.kind === 'accumDur') {
      const n = Number(rec[META_STORE[it.id]]) || 0;
      if (n) bits.push({ id: it.id, text: itemFa(it) + '=' + fmtChunk(n) });
    } else if (it.kind === 'flag' && rec[it.id]) {
      bits.push({ id: it.id, text: itemFa(it) });
    } else if (it.kind === 'avgSec') {
      const st = takhirStats(rec);
      st.samples.forEach((sec, i) => {
        bits.push({
          id: 'takhir-' + i,
          text: 'takhir ' + sec + 's · avg ' + Number(st.avg).toFixed(2) + 's n=' + st.n
        });
      });
    }
  });
  parseLaws(rec).forEach(x => {
    bits.push({ id: 'law:' + x.name, text: x.name + '=' + fmtChunk(x.min) });
  });
  return bits;
}
function metaItemView(rec, it) {
  if (it.kind === 'flag') {
    const draft = Object.prototype.hasOwnProperty.call(flagDraft, it.id);
    const saved = !!(rec && rec[it.id]);
    const on = flagOn(rec, it.id);
    let state = 'miss';
    if (saved) state = 'ok';
    else if (draft && on) state = 'draft';
    return { id: it.id, group: it.group, kind: it.kind, label: itemFa(it), state, val: '', min: 0 };
  }
  if (it.kind === 'accumDur') {
    const n = Number(rec && rec[META_STORE[it.id]]) || 0;
    return {
      id: it.id, group: it.group, kind: it.kind, label: itemFa(it),
      state: n > 0 ? 'ok' : 'miss', val: n > 0 ? fmtChunk(n) : '0m', min: n
    };
  }
  if (it.kind === 'avgSec') {
    const st = takhirStats(rec);
    if (!st.n) {
      return { id: it.id, group: it.group, kind: it.kind, label: itemFa(it), state: 'miss', val: '—', min: 0 };
    }
    return {
      id: it.id, group: it.group, kind: it.kind, label: itemFa(it),
      state: st.ok ? 'ok' : 'miss',
      val: Number(st.avg).toFixed(2) + 's n=' + st.n,
      min: 0
    };
  }
  return { id: it.id, group: it.group, kind: it.kind, label: itemFa(it), state: 'miss', val: '', min: 0 };
}
async function sessionWork(day) {
  const byPart = PARTS.map(p => ({ id: p.id, label: p.label, min: 0, n: 0 }));
  const out = { sessionMin: 0, sessionN: 0, byPart, byCat: [] };
  if (!day) return out;
  const rows = (await getAll('sessions')).filter(r => r.dateShamsi === day);
  const catMap = {};
  rows.forEach(r => {
    const mi = Number(r.minutes) || 0;
    out.sessionMin += mi;
    const pid = Number(r.partId);
    if (byPart[pid]) {
      byPart[pid].min += mi;
      byPart[pid].n++;
    }
    const cat = catName(r.category || '—');
    if (!catMap[cat]) catMap[cat] = { cat, min: 0, n: 0 };
    catMap[cat].min += mi;
    catMap[cat].n++;
  });
  out.sessionN = rows.length;
  out.byCat = Object.keys(catMap).map(k => catMap[k]).sort((a, b) => b.min - a.min);
  return out;
}
function tileTitle(it) {
  if (it.id === 'moodToFlow') return 'moodToFlow';
  if (it.id === 'afterFastMood') return 'afterFastMood';
  if (it.id === 'layers') return 'layers';
  if (it.id === 'ghanoon') return 'ghanoonFarayeman';
  if (it.id === 'ghanoonfarayehattayarade') return 'ghanoonFaraye';
  if (it.id === 'afzayesheshans') return 'afzayeshShans';
  if (it.id === 'sokut') return 'roozsokut';
  if (it.id === 'takhirAvg') return 'takhir';
  return itemFa(it);
}
function svgBars(rows) {
  rows = (rows || []).filter(r => r && r.lab);
  if (!rows.length) return '<p class="muted" style="margin:0">—</p>';
  const HOUR_FULL = 10 * 60;
  const SEC_FULL = 10;
  const maxOf = (pred, floor) => Math.max(floor, ...rows.filter(pred).map(r => Number(r.n) || 0), 0) || floor;
  const maxMin = maxOf(r => r.unit !== 'n' && r.unit !== 's', HOUR_FULL);
  const maxN = maxOf(r => r.unit === 'n', 1);
  const maxS = maxOf(r => r.unit === 's', SEC_FULL);
  return '<div class="hbars">' + rows.map(r => {
    const n = Number(r.n) || 0;
    const den = r.unit === 'n' ? maxN : (r.unit === 's' ? maxS : maxMin);
    const pct = Math.max(0, Math.min(100, Math.round(100 * n / (den || 1))));
    const val = esc(r.val || (r.unit === 'n' ? String(n) : fmtChunk(n)));
    const fill = r.fill || '#3a6288';
    return '<div class="hbar">' +
      '<span class="hbar-lab ' + dirOf(r.lab) + '" title="' + esc(r.lab) + '">' + esc(r.lab) + '</span>' +
      '<span class="hbar-track"><i style="width:' + pct + '%;background:' + fill + '"></i></span>' +
      '<span class="hbar-val">' + val + '</span>' +
      '</div>';
  }).join('') + '</div>';
}
function flagScore(rec, gid) {
  const items = META_ITEMS.filter(it => it.group === gid && it.kind === 'flag');
  const ok = items.filter(it => flagOn(rec, it.id)).length;
  return { ok, n: items.length };
}
function paintDayChart(el, rec, work) {
  if (!el) return;
  work = work || { sessionMin: 0 };
  const laws = parseLaws(rec);
  const lawMin = laws.reduce((s, x) => s + (Number(x.min) || 0), 0);
  const flags = META_ITEMS.filter(it => it.kind === 'flag');
  const flagOk = flags.filter(it => flagOn(rec, it.id)).length;
  const bars = [
    { lab: 'daftar', n: work.sessionMin || 0, fill: '#3a6288' }
  ];
  META_ITEMS.filter(it => it.kind === 'accumDur').forEach(it => {
    bars.push({ lab: tileTitle(it), n: Number(rec && rec[META_STORE[it.id]]) || 0, fill: '#6a4a8a' });
  });
  const avg = rec && Number(rec.takhirN) ? Number(rec.takhirAvg) : 0;
  bars.push({ lab: 'takhir', n: avg || 0, val: rec && Number(rec.takhirN) ? avg.toFixed(2) + 's' : '—', fill: '#7a5a18', unit: 's' });
  bars.push({ lab: 'ghanoonMohem', n: laws.length, val: String(laws.length) + (lawMin ? ' · ' + fmtChunk(lawMin) : ''), fill: '#c9a0ff', unit: 'n' });
  bars.push({ lab: 'flags', n: flagOk, val: flagOk + '/' + flags.length, fill: '#3ecf8e', unit: 'n' });
  META_GROUPS.filter(g => g.id !== 'laws').forEach(g => {
    const s = flagScore(rec, g.id);
    if (!s.n) return;
    bars.push({ lab: g.id, n: s.ok, val: s.ok + '/' + s.n, fill: '#7a5428', unit: 'n' });
  });
  el.innerHTML = svgBars(bars);
}
async function resetMetaItem(id) {
  const day = selectedMetaDay();
  const rec = await metaFor(day) || blankMeta(day);
  takhirPick = null;
  clearMetaField(rec, id);
  if (mW[id] && mW[id].reset) mW[id].reset();
  await put('meta', rec);
  lastMetaRec = rec;
  toast(id + ' reset');
  vibrate(8);
  await paintMetaStatus();
  await refreshData();
  updateQueueBadge();
  trySync();
}
function pendingDeletes() {
  try {
    const a = JSON.parse(cfgGet('del_sessions') || '[]');
    return Array.isArray(a) ? a.map(String).filter(Boolean) : [];
  } catch (e) { return []; }
}
function queueSessionDelete(uid) {
  const a = pendingDeletes();
  if (a.indexOf(uid) < 0) a.push(uid);
  cfgSet('del_sessions', JSON.stringify(a));
}
function pendingMetaDeletes() {
  try {
    const a = JSON.parse(cfgGet('del_meta') || '[]');
    if (!Array.isArray(a)) return { uids: [], days: [] };
    const uids = [];
    const days = [];
    a.forEach(x => {
      if (!x) return;
      if (typeof x === 'string') { uids.push(x); return; }
      if (x.uid) uids.push(String(x.uid));
      if (x.day) days.push(String(x.day));
    });
    return { uids: uids.filter(Boolean), days: days.filter(Boolean) };
  } catch (e) { return { uids: [], days: [] }; }
}
function queueMetaDelete(uid, day) {
  let a;
  try { a = JSON.parse(cfgGet('del_meta') || '[]'); } catch (e) { a = []; }
  if (!Array.isArray(a)) a = [];
  a.push({ uid: String(uid || ''), day: String(day || '') });
  cfgSet('del_meta', JSON.stringify(a));
}
function parseJ(s) {
  const p = String(s || '').split('/');
  return [Number(p[0]) || 0, Number(p[1]) || 0, Number(p[2]) || 0];
}
function addDaysJ(y, m, d, n) {
  d += n;
  let guard = 0;
  while (guard++ < 800) {
    if (d < 1) {
      m -= 1;
      if (m < 1) { m = 12; y -= 1; }
      d += jMonthLen(y, m);
      continue;
    }
    const len = jMonthLen(y, m);
    if (d > len) {
      d -= len;
      m += 1;
      if (m > 12) { m = 1; y += 1; }
      continue;
    }
    break;
  }
  return [y, m, d];
}
function eachJ(from, to) {
  const out = [];
  let [y, m, d] = parseJ(from);
  let guard = 0;
  while (fmtJ(y, m, d) <= to && guard++ < 400) {
    out.push(fmtJ(y, m, d));
    [y, m, d] = addDaysJ(y, m, d, 1);
  }
  return out;
}
function jShort(s) {
  const p = parseJ(s);
  return pad2(p[1]) + '/' + pad2(p[2]);
}
function daysAgoJ(n) {
  const [y, m, d] = todayJ();
  return fmtJ(...addDaysJ(y, m, d, -n));
}
function dashSpan() {
  const [ty, tm, td] = todayJ();
  const to = fmtJ(ty, tm, td);
  if (dashDays === 'fasl') {
    return { from: fmtJ(ty, 5, 31), to: fmtJ(ty, 6, 31), n: null, kind: 'fasl' };
  }
  if (dashDays === 'since531') {
    const from = fmtJ(ty, 5, 31);
    return { from: to >= from ? from : fmtJ(ty - 1, 5, 31), to, n: null, kind: 'since531' };
  }
  const n = Math.max(1, Number(dashDays) || 7);
  return { from: fmtJ(...addDaysJ(ty, tm, td, -(n - 1))), to, n, kind: 'days' };
}
let dashDays = 'since531';
function dashStatRow(lab, val, ltr) {
  return '<span class="statrow">' +
    '<span class="statlab">' + esc(lab) + '</span>' +
    '<b class="statval' + (ltr ? ' ltr' : '') + '">' + val + '</b></span>';
}
async function paintDashboard() {
  const hostS = $('dashStat');
  const hostB = $('dashBars');
  const hostM = $('dashMeta');
  const hostF = $('dashFlags');
  const hostP = $('dashParts');
  const hostC = $('dashCats');
  const hostL = $('dashLaws');
  if (!hostS) return;
  const span = dashSpan();
  const from = span.from, to = span.to;
  const sess = (await getAll('sessions')).filter(r => r.dateShamsi >= from && r.dateShamsi <= to);
  const meta = (await getAll('meta')).filter(r => r.dateShamsi >= from && r.dateShamsi <= to);
  const byDay = {};
  const byPart = PARTS.map(p => ({ lab: p.label, n: 0 }));
  const byCat = {};
  sess.forEach(r => {
    const d = r.dateShamsi;
    if (!byDay[d]) byDay[d] = { daftar: 0, n: 0 };
    byDay[d].daftar += Number(r.minutes) || 0;
    byDay[d].n += 1;
    const pid = Number(r.partId);
    if (byPart[pid]) byPart[pid].n += Number(r.minutes) || 0;
    const cat = catName(r.category || '—');
    if (!byCat[cat]) byCat[cat] = 0;
    byCat[cat] += Number(r.minutes) || 0;
  });
  let daftar = 0;
  Object.keys(byDay).forEach(d => { daftar += byDay[d].daftar; });
  const durSum = {};
  META_ITEMS.filter(it => it.kind === 'accumDur').forEach(it => { durSum[it.id] = 0; });
  const flagItems = META_ITEMS.filter(it => it.kind === 'flag');
  const flagSum = {};
  flagItems.forEach(it => { flagSum[it.id] = 0; });
  let lawN = 0, lawMin = 0, takhirW = 0, takhirN = 0;
  const lawMap = {};
  meta.forEach(r => {
    META_ITEMS.filter(it => it.kind === 'accumDur').forEach(it => {
      durSum[it.id] += Number(r[META_STORE[it.id]]) || 0;
    });
    flagItems.forEach(it => { if (flagOn(r, it.id)) flagSum[it.id]++; });
    const laws = parseLaws(r);
    lawN += laws.length;
    lawMin += laws.reduce((s, x) => s + (Number(x.min) || 0), 0);
    laws.forEach(x => {
      if (!lawMap[x.name]) lawMap[x.name] = { n: 0, min: 0 };
      lawMap[x.name].n += 1;
      lawMap[x.name].min += Number(x.min) || 0;
    });
    const tn = Number(r.takhirN) || 0;
    if (tn) { takhirW += (Number(r.takhirAvg) || 0) * tn; takhirN += tn; }
  });
  const dayN = meta.length || Object.keys(byDay).length || 1;
  const days = eachJ(from, to);
  const rangeLab = span.kind === 'fasl' ? '۵/۳۱–۶/۳۱'
    : span.kind === 'since531' ? 'از ۵/۳۱'
    : (span.n + ' روز');
  hostS.innerHTML =
    dashStatRow('بازه', rangeLab, span.kind === 'days') +
    dashStatRow('از', esc(from), true) +
    dashStatRow('تا', esc(to), true) +
    dashStatRow('محور', esc(jShort(from) + ' → ' + jShort(to)), true) +
    dashStatRow('دفتر', esc(fmtChunk(daftar)), true) +
    dashStatRow('خط', esc(sess.length + ' خط'), false) +
    dashStatRow('قانون', esc(String(lawN)), false) +
    dashStatRow('پرچم', esc(String(flagItems.reduce((s, it) => s + flagSum[it.id], 0))), false);
  hostB.innerHTML = svgBars(days.map(d => ({
    lab: jShort(d),
    n: (byDay[d] && byDay[d].daftar) || 0,
    fill: '#3a6288'
  })));
  const metaBars = META_ITEMS.filter(it => it.kind === 'accumDur').map(it => ({
    lab: tileTitle(it), n: durSum[it.id] || 0, fill: '#6a4a8a'
  }));
  metaBars.push({ lab: 'ghanoonMohem', n: lawN, val: String(lawN) + (lawMin ? ' · ' + fmtChunk(lawMin) : ''), fill: '#c9a0ff', unit: 'n' });
  metaBars.push({ lab: 'takhir', n: takhirN ? takhirW / takhirN : 0, val: takhirN ? (takhirW / takhirN).toFixed(2) + 's' : '—', fill: '#7a5a18', unit: 's' });
  hostM.innerHTML = svgBars(metaBars);
  if (hostF) {
    const fb = flagItems.map(it => ({
      lab: it.id,
      n: flagSum[it.id] || 0,
      val: (flagSum[it.id] || 0) + '/' + dayN,
      fill: '#3ecf8e',
      unit: 'n'
    }));
    META_GROUPS.filter(g => g.id !== 'laws').forEach(g => {
      const items = flagItems.filter(it => it.group === g.id);
      if (!items.length) return;
      const ok = items.reduce((s, it) => s + (flagSum[it.id] || 0), 0);
      fb.unshift({ lab: g.id, n: ok, val: ok + '/' + (items.length * dayN), fill: '#7a5428', unit: 'n' });
    });
    hostF.innerHTML = svgBars(fb);
  }
  if (hostP) {
    hostP.innerHTML = svgBars(byPart.map((p, i) => ({
      lab: p.lab, n: p.n, fill: ['#7a5a18', '#3a6288', '#5a3d78', '#2f6b4e'][i] || '#3a6288'
    })));
  }
  if (hostC) {
    const cats = Object.keys(byCat).sort((a, b) => byCat[b] - byCat[a]);
    hostC.innerHTML = svgBars(cats.map(c => ({ lab: c, n: byCat[c], fill: '#6db3f2' })));
  }
  if (hostL) {
    const names = Object.keys(lawMap);
    hostL.innerHTML = svgBars(names.length
      ? names.map(n => ({
          lab: n, n: lawMap[n].n,
          val: lawMap[n].n + (lawMap[n].min ? ' · ' + fmtChunk(lawMap[n].min) : ''),
          fill: '#c9a0ff', unit: 'n'
        }))
      : [{ lab: 'ghanoonMohem', n: 0, val: '0', fill: '#c9a0ff', unit: 'n' }]);
  }
}

function dirOf(s) {
  return /[\u0600-\u06FF]/.test(String(s || '')) ? 'rtl' : 'ltr';
}
function paintSummary(el, rec, work) {
  if (!el) return;
  el.classList.add('sumdash');
  const views = META_ITEMS.map(it => metaItemView(rec, it));
  const laws = lawsForSummary(rec);
  el.innerHTML =
    '<div class="sumflags">' +
      META_GROUPS.map(g => {
        const items = views.filter(v => v.group === g.id);
        const gok = items.filter(v => v.state === 'ok').length;
        let chips = items.map(v =>
          '<span class="chip ' + dirOf(v.label) + ' ' + v.state + '" dir="' + dirOf(v.label) + '">' + esc(v.label) + (v.val ? ' ' + v.val : '') + '</span>'
        ).join('');
        if (g.id === 'laws') {
          chips = laws.length
            ? laws.map(x => '<span class="chip ' + dirOf(x.name) + ' ok" dir="' + dirOf(x.name) + '">' + esc(x.name) + (x.desc ? ' — ' + esc(x.desc) : '') + ' ' + esc(fmtChunk(x.min)) + '</span>').join('')
            : '<span class="chip miss">0</span>';
        }
        return '<article class="sumcard tone-' + esc(g.id) + '">' +
          '<h4>' + esc(g.title) + ' <span>' + (g.id === 'laws' ? String(laws.length) : (gok + '/' + items.length)) + '</span></h4>' +
          '<div class="flagchips">' + chips + '</div>' +
        '</article>';
      }).join('') +
    '</div>';
}
function metaSummary(rec) {
  const bits = metaBits(rec);
  return bits.map(b => b.text).join(' · ') || '—';
}
function clearMetaField(rec, itemId) {
  const it = META_ITEMS.find(x => x.id === itemId);
  if (!rec) return rec;
  if (itemId === 'bidari' || itemId === 'saatbidari5') {
    clearBidari(rec);
    const done = parseDone(rec);
    delete done.saatbidari5;
    delete done.bidari;
    rec.done = done;
    rec.doneJson = JSON.stringify(done);
    rec.complete = isComplete(rec) ? 1 : 0;
    rec.synced = 0;
    return rec;
  }
  if (/^takhir[-:]/.test(String(itemId))) {
    const ix = Number(String(itemId).replace(/^takhir[-:]/, ''));
    const samples = parseTakhirSamples(rec);
    if (ix >= 0 && ix < samples.length) samples.splice(ix, 1);
    writeTakhirSamples(rec, samples);
    const done = parseDone(rec);
    if (!samples.length) delete done.takhirAvg;
    else if (!takhirIsOk(rec)) delete done.takhirAvg;
    else done.takhirAvg = 1;
    rec.done = done;
    rec.doneJson = JSON.stringify(done);
    rec.complete = isComplete(rec) ? 1 : 0;
    rec.synced = 0;
    return rec;
  }
  if (String(itemId).indexOf('law:') === 0) {
    const name = String(itemId).slice(4);
    const left = parseLaws(rec).filter(x => x.name !== name);
    rec.lawsJson = JSON.stringify(left);
    rec.lawsMin = left.reduce((s, x) => s + (Number(x.min) || 0), 0);
    lawDraft = left.slice();
  } else if (!it) return rec;
  if (it && it.kind === 'accumDur') rec[META_STORE[it.id]] = 0;
  if (it && it.kind === 'flag') applyFlagBundle(rec, it.id, 0);
  if (it && it.kind === 'avgSec') writeTakhirSamples(rec, []);
  const done = parseDone(rec);
  delete done[itemId];
  rec.done = done;
  rec.doneJson = JSON.stringify(done);
  rec.complete = isComplete(rec) ? 1 : 0;
  rec.synced = 0;
  return rec;
}

function tagCell(synced) {
  return `<span class="tag ${synced ? 'sent' : 'pending'}">${synced ? 'ارسال شد' : 'صف'}</span>`;
}

async function refreshData() {
  const s = await getAll('sessions');
  const m = await getAll('meta');
  $('cntS').textContent = s.length;
  $('cntM').textContent = m.length;
  $('cntQ').textContent = s.filter(r => !r.synced).length + m.filter(r => !r.synced).length;
  const [y, mo, d] = todayJ();
  const today = fmtJ(y, mo, d);
  $('verBox').innerHTML =
    `نسخهٔ اپ: <b>${APP_VERSION}</b><br/>` +
    `نسخهٔ شیت باید: <b>${SCRIPT_VERSION}</b><br/>` +
    `امروز به شمسی: <b>${today}</b><br/>` +
    `آدرس اپ: <span class="brk">${location.origin + location.pathname}</span><br/>` +
    `آدرس وب‌اپ شیت: <span class="brk">${cfgGet('url') || 'خالی'}</span>`;
  const mixed = [];
  s.forEach(r => mixed.push({
    at: r.createdAt || '',
    date: r.dateShamsi || '',
    kind: 'دفتر',
    part: r.part || '',
    code: r.code || '',
    val: r.chunk || r.hm || r.count || '',
    who: r.who || '',
    synced: r.synced,
    store: 'sessions',
    uid: r.uid
  }));
  m.forEach(r => mixed.push({
    at: r.createdAt || '',
    date: r.dateShamsi || '',
    kind: 'متا',
    what: 'meta',
    bits: metaBits(r),
    synced: r.synced,
    store: 'meta',
    uid: r.uid
  }));
  mixed.sort((a, b) => String(b.at).localeCompare(String(a.at)));
  const host = $('logList');
  if (!host) return;
  const rows = [];
  mixed.forEach(r => {
    if (r.store === 'sessions') {
      rows.push(r);
      return;
    }
    (r.bits || []).forEach(b => {
      rows.push({
        at: r.at, date: r.date, kind: r.kind, synced: r.synced,
        store: 'meta', uid: r.uid, itemId: b.id, bitText: b.text
      });
    });
  });
  host.innerHTML = rows.slice(0, 80).map(r => {
    const undo = r.store === 'sessions'
      ? '<button type="button" class="cancel" data-store="sessions" data-uid="' + esc(r.uid) + '">برگشت</button>'
      : (r.itemId
        ? '<button type="button" class="undobit" data-meta-item="' + esc(r.itemId) + '" data-uid="' + esc(r.uid) + '">برگشت</button>'
        : '');
    const actions = tagCell(r.synced) + undo;
    let body = '';
    if (r.store === 'meta' && r.bitText) {
      body = '<div class="logline"><span class="logcode">' + esc(r.bitText) + '</span></div>';
    } else if (r.store === 'sessions') {
      body = '<div class="logline">' +
        (r.part ? '<span class="logpart ' + dirOf(r.part) + '">' + esc(r.part) + '</span>' : '') +
        (r.code ? '<span class="logcode">' + esc(r.code) + '</span>' : '') +
        (r.val ? '<span class="logdur">' + esc(r.val) + '</span>' : '') +
        (r.who ? '<span class="logcode">' + esc(r.who) + '</span>' : '') +
      '</div>';
    }
    return '<div class="logcard">' +
      '<div class="loghead">' +
        '<div class="logmeta"><span class="logkind">' + esc(r.kind) + '</span>' +
        '<span class="logdate">' + esc(r.date) + '</span></div>' +
        '<div class="logactions">' + actions + '</div>' +
      '</div>' +
      body +
    '</div>';
  }).join('') || '<div class="empty">خالی</div>';
}

const csvEscape = v => {
  const s = String(v == null ? '' : v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
async function buildCsv(storeName, fields) {
  const rows = await getAll(storeName);
  return '\ufeff' + fields.join(',') + '\n' +
         rows.map(r => fields.map(f => csvEscape(r[f])).join(',')).join('\n');
}
async function exportCsv(storeName, fields, name) {
  const text = await buildCsv(storeName, fields);
  const [y, m, d] = todayJ();
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${name}_${y}-${pad2(m)}-${pad2(d)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast('فایل ساخته شد');
}
async function shareCsv() {
  const text = await buildCsv('sessions', SESSION_FIELDS);
  const [y, m, d] = todayJ();
  const file = new File([text], `sessions_${y}-${pad2(m)}-${pad2(d)}.csv`, { type: 'text/csv' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'DailyLog' }); } catch (e) {}
    return;
  }
  exportCsv('sessions', SESSION_FIELDS, 'sessions');
}

function diagDump() {
  const lines = [];
  document.querySelectorAll('.wcol').forEach((col, i) => {
    const sc  = col.querySelector('.sc');
    const its = col.querySelectorAll('.it');
    let sel = -1;
    its.forEach((n, k) => { if (n.classList.contains('sel')) sel = k; });
    lines.push(`col${i} n=${its.length} top=${sc.scrollTop} sel=${sel} snap=${getComputedStyle(sc).scrollSnapType}`);
  });
  lines.push('sDate.value=' + (sDate ? sDate.value() : 'n/a'));
  lines.push('todayJ=' + todayJ().join('/'));
  const pre = document.createElement('pre');
  pre.id = 'diag';
  pre.textContent = lines.join('\n');
  document.body.insertBefore(pre, document.body.firstChild);
}

async function hardReload() {
  try {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    }
  } catch (e) {}
  location.replace(location.pathname + '?v=' + Date.now());
}

/* ═════════════════════════════ 10. BOOT ════════════════════════════════════ */

async function boot() {
  $('verPill').textContent = APP_VERSION;
  $('verPill').className = 'pill on';
  paintFreezeBanner();
  if ($('lockPill')) $('lockPill').addEventListener('click', redLockUnlock);
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().catch(() => {});
  }

  pinHeader();
  buildMeta();

  $('cfg_url').value    = cfgGet('url');
  $('cfg_secret').value = cfgGet('secret');

  TAB_IDS.forEach(id => {
    const el = $('tab' + id.charAt(0).toUpperCase() + id.slice(1));
    if (el) el.addEventListener('click', () => showTab(id));
  });
  $('btnSave').addEventListener('click',  () => doSave());
  $('btnSaveCfg').addEventListener('click', () => {
    cfgSet('url', $('cfg_url').value.trim());
    cfgSet('secret', $('cfg_secret').value.trim());
    toast('ذخیره شد');
    checkSheet(true);
  });
  $('btnCheckSheet').addEventListener('click', () => {
    cfgSet('url', $('cfg_url').value.trim());
    cfgSet('secret', $('cfg_secret').value.trim());
    checkSheet(true);
  });
  $('btnSyncNow').addEventListener('click', () => trySync(true));
  $('btnCsvS').addEventListener('click', () => exportCsv('sessions', SESSION_FIELDS, 'sessions'));
  $('btnCsvM').addEventListener('click', () => exportCsv('meta', META_FIELDS, 'meta'));
  $('btnShare').addEventListener('click', shareCsv);
  $('btnHardReload').addEventListener('click', hardReload);
  $('logList').addEventListener('click', async ev => {
    const itemBtn = ev.target.closest('[data-meta-item]');
    if (itemBtn) {
      ev.stopPropagation();
      const uid = itemBtn.dataset.uid;
      const itemId = itemBtn.dataset.metaItem;
      if (!itemId) return;
      const all = await getAll('meta');
      const rec = all.find(r => r.uid === uid);
      if (!rec) return;
      clearMetaField(rec, itemId);
      rec.synced = 0;
      await put('meta', rec);
      toast('برگشت خورد');
      await refreshData();
      updateQueueBadge();
      paintMetaStatus();
      paintNotebook();
      trySync();
      return;
    }
    const b = ev.target.closest('button.cancel');
    if (!b) return;
    const store = b.dataset.store;
    const id = b.dataset.uid;
    if (!store || !id) return;
    if (store === 'sessions') {
      const rows = await getAll('sessions');
      const row = rows.find(r => r.uid === id);
      if (row && row.synced) queueSessionDelete(id);
      await delKey(store, id);
    } else if (store === 'meta') {
      const rows = await getAll('meta');
      const row = rows.find(r => r.uid === id);
      const day = (b.dataset.day || (row && row.dateShamsi) || '');
      if (row && row.synced) queueMetaDelete(id, day);
      await delKey(store, id);
    } else {
      await delKey(store, id);
    }
    toast('برگشت خورد');
    await refreshData();
    updateQueueBadge();
    if (store === 'meta') paintMetaStatus();
    else paintNotebook();
    trySync();
  });
  $('btnWipe').addEventListener('click', async () => {
    if (!confirm('همه دادهٔ این دستگاه پاک شود؟')) return;
    await clearStore('sessions');
    await clearStore('meta');
    refreshData();
    paintNotebook();
    paintMetaStatus();
    updateQueueBadge();
    toast('پاک شد');
  });

  window.addEventListener('online',  () => { updateNetPill(); trySync(); });
  window.addEventListener('offline', updateNetPill);
  window.addEventListener('pageshow', () => {
    settleWheels();
    const last = cfgGet('tab');
    if (TAB_IDS.indexOf(last) >= 0) {
      if (last !== activeTab) showTab(last);
    }
  });
  window.addEventListener('resize',  () => { pinHeader(); settleWheels(); });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      if (sDate) sDate.today();
      if (mDate) mDate.today();
      settleWheels();
      paintNotebook();
      paintMetaStatus();
    }
  });

  if (cfgGet('del_unlock') !== 'v58') {
    cfgSet('del_sessions', '[]');
    cfgSet('del_unlock', 'v58');
  }
  trySync._busy = false;
  updateNetPill();
  updateQueueBadge();
  paintNotebook();
  paintMetaStatus();
  await forceMetaResyncOnce();
  checkSheet(false);
  trySync();
  const last = cfgGet('tab');
  showTab(TAB_IDS.indexOf(last) >= 0 ? last : 'pishro');

  if (location.search.indexOf('diag=meta') >= 0) {
    setTimeout(() => showTab('meta'), 1200);
    setTimeout(diagDump, 2600);
  } else if (location.search.indexOf('diag=1') >= 0) {
    setTimeout(() => showTab('session'), 400);
    setTimeout(diagDump, 2000);
  }

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').then(reg => {
      reg.update();
      let reloaded = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloaded) return;
        reloaded = true;
        location.reload();
      });
    }).catch(() => {});
  }
}

boot();
