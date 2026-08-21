/* ============================================================================
   DailyLog v12 — notebook + flag/xor meta, finglish keys
   Plain ES2017. IndexedDB + optional Apps Script sync. No build step.
   ============================================================================ */

'use strict';

const APP_VERSION = 'v47 · meta';
const SCRIPT_VERSION = 'v10-meta';

/* ═════════════════════════════ 1. PARTS AND ACTIVITIES ═════════════════════
   Later parts inherit earlier ones. Layers and قانون are daily META, not
   per-session. Parenthetical tags are typed on the line, comma-separated. */

const PARTS = [
  { id: 0, label: 'تا ۱۲',    hint: 'صبح — کارهای این پارت و ارثی‌ها' },
  { id: 1, label: '۱۲ تا ۲',  hint: 'ظهر — ارث از تا ۱۲ به‌علاوهٔ این پارت' },
  { id: 2, label: '۲ تا ۶',   hint: 'بعدازظهر — ارث از دو پارت قبل' },
  { id: 3, label: 'بعد اوپن', hint: 'بعد اوپن‌فست — همهٔ قبلی‌ها هم اینجان' }
];

const QUALITY_TAGS = [
  'bigharrshadid','zajrshadid','dardshadid','fesharshadi','karesakht',
  'flowshadid','tamarkozshaid','amighshadid','withthinkshadid'
];

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

  { cat:'sabtnam',  code:'sabtnam(tur,kargahravn,kelstakh,zaban,bashgahengh,hamneshin)', metric:'dur', from:3, def:{h:0,m:15} },
  { cat:'aff',      code:'afflog,affplan,affevenlog', metric:'dur', from:3, def:{h:0,m:15}, stick:true },
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
                        'minutes','hm','chunk','tags','reactSec','count','reps','perRep','kind','note'];

const META_GROUPS = [
  { id:'openfa', title:'openfa' },
  { id:'raayat', title:'raayat / mojaz / no' },
  { id:'andaze', title:'andaze / ghanoon', hr:true },
  { id:'laws',   title:'ghanoon mohem' }
];

const META_ITEMS = [
  { id:'moodToFlow', group:'openfa', kind:'accumDur',
    label:'moodtoflowbeforeopenfa2' },
  { id:'openfa1h', group:'openfa', kind:'flag',
    label:'openfa2<=30m' },
  { id:'nchort', group:'openfa', kind:'flag',
    label:'nchort' },
  { id:'saatbidari5', group:'openfa', kind:'flag',
    label:'saatbidaritafazollbasaattayinshode<=5m' },
  { id:'twoHourAras', group:'openfa', kind:'flag',
    label:'2saatarasmortakhshoseghableSnapeshose' },
  { id:'opf1', group:'openfa', kind:'flag',
    label:'openfa1after15(15g sachetprot)' },
  { id:'chizayemojazbadeopfa2', group:'openfa', kind:'flag',
    label:'chizayemojazbadeopfa2(morgh,mahi,gusht,sabzijatemojat,seifijatmoja(joz zorat,sibzamini))' },
  { id:'opf2', group:'openfa', kind:'flag',
    label:'openfa2after18' },
  { id:'afterFastMood', group:'openfa', kind:'accumDur',
    label:'afterfastmoodtoflow' },

  { id:'takhghmojaz0', group:'raayat', kind:'flag',
    label:'takhghmojaz<=0' },
  { id:'takhmojmotns', group:'raayat', kind:'flag',
    label:'takhmojmotns' },
  { id:'budandarjayemojaz100', group:'raayat', kind:'flag',
    label:'budandarjayemojaz,kharidemojaz,mohtavayemojaz' },
  { id:'raatayeghavanineakhlaghietayinshode100', group:'raayat', kind:'flag',
    label:'raatayeghavanineakhlaghietayinshode100%' },
  { id:'rayyatepartbandieruz100', group:'raayat', kind:'flag',
    label:'rayyatepartbandieruz100%' },
  { id:'noCarb', group:'raayat', kind:'flag',
    label:'no(noon,berenj,carb,tanagholat,ghandetabiyi,adams,mive,ajil)' },
  { id:'noghahveyebiruni', group:'raayat', kind:'flag',
    label:'noghahveyebiruni,nolimunadbiruni' },
  { id:'nocopypasteazaighable12pm', group:'raayat', kind:'flag',
    label:'nocopypasteazaighable12pm' },
  { id:'preplan12', group:'raayat', kind:'flag',
    label:'preplaned_ta12' },

  { id:'ghanoon', group:'andaze', kind:'accumDur',
    label:'ghanoonfarayeman' },
  { id:'layers', group:'andaze', kind:'accumDur',
    label:'bigharrshadid,zajrshadid,dardshadid,fesharshadi,karesakht,flowshadid,tamarkozshaid,amighshadid,withthinkshadid' },
  { id:'takhirAvg', group:'andaze', kind:'avgSec',
    label:'takhirinputoutput3thout<=1.5s' }
];

const META_FLAG_IDS = META_ITEMS.filter(it => it.kind === 'flag').map(it => it.id);

const FLAG_BUNDLES = {
  noghahveyebiruni: ['noghahveyebiruni', 'nolimunadbiruni'],
  budandarjayemojaz100: ['budandarjayemojaz100', 'kharidemojaz100', 'mohtmoj100']
};

function flagBundleKeys(id) {
  return FLAG_BUNDLES[id] || [id];
}
function applyFlagBundle(rec, id, on) {
  rec[id] = on ? 1 : 0;
  flagBundleKeys(id).forEach(k => { if (k !== id) delete rec[k]; });
}
function migrateFlagBundles(rec) {
  const done = parseDone(rec);
  Object.keys(FLAG_BUNDLES).forEach(primary => {
    const keys = FLAG_BUNDLES[primary];
    const any = keys.some(k => rec[k] || done[k]);
    rec[primary] = any ? 1 : 0;
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

const META_FIELDS = ['uid','createdAt','dateShamsi',
  'moodToFlowMin','afterFastMoodMin','ghanoonMin','layersMin',
  'openfa1h','nchort','saatbidari5','twoHourAras',
  'opf1','chizayemojazbadeopfa2','opf2',
  'takhghmojaz0','takhmojmotns',
  'budandarjayemojaz100',
  'raatayeghavanineakhlaghietayinshode100','rayyatepartbandieruz100',
  'noCarb','noghahveyebiruni',
  'nocopypasteazaighable12pm','preplan12',
  'takhirAvg','takhirN','takhirSum','lawsJson','lawsMin',
  'doneJson','complete'];

const MIN_REACT_SEC = 2;
const TAKHIR_SECS = [1, 1.5, 2, 3, 4, 5, 8, 10, 15];
const TAKHIR_OK = 1.5;

const META_STORE = {
  moodToFlow: 'moodToFlowMin',
  afterFastMood: 'afterFastMoodMin',
  ghanoon: 'ghanoonMin',
  layers: 'layersMin'
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

const ITEM_H = 40;
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
  row.className = 'wheels' + (ltr ? ' ltr' : '') + (slim ? ' slim' : '');
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
function makeClockWheel(host, defH, defM, hourList, onChange) {
  const hours = hourList && hourList.length ? hourList : [...Array(24).keys()];
  const hh = hours.map(h => pad2(h));
  const mm = minuteItems();
  const h0 = Math.max(0, hours.indexOf(defH == null ? hours[0] : defH));
  const notify = () => { if (onChange) onChange(hh[wh.get()] + ':' + mm[wm.get()]); };
  const wh = wheelColumn(hh, h0, notify, { loop: true });
  const wm = wheelColumn(mm, minuteIndex(defM), notify, { loop: true });
  wheelGroup(host, [wh, wm], ['ساعت', 'دقیقه'], true);
  return { value: () => hh[wh.get()] + ':' + mm[wm.get()] };
}
function makeDurWheel(host, defH, defM, onChange) {
  const hh = [];
  for (let i = 0; i <= 24; i++) hh.push(String(i));
  const mm = minuteItems();
  const notify = () => { if (onChange) onChange(); };
  const wh = wheelColumn(hh, Math.min(24, defH || 0), notify, { loop: true });
  const wm = wheelColumn(mm, minuteIndex(defM), notify, { loop: true });
  wheelGroup(host, [wh, wm], ['ساعت', 'دقیقه'], true);
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
const put = (n, o) => store(n, 'readwrite').then(s => new Promise((res, rej) => {
  const r = s.put(o); r.onsuccess = () => res(o); r.onerror = () => rej(r.error);
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
function takhirIsOk(rec, extra) {
  extra = extra || [];
  const n = Number(rec && rec.takhirN) || 0;
  if (!n && !extra.length) return true;
  let sum = Number(rec && rec.takhirSum) || 0;
  extra.forEach(s => { sum += Number(s) || 0; });
  const avg = (n + extra.length) ? (sum / (n + extra.length)) : 0;
  return avg <= TAKHIR_OK;
}
function isComplete(rec) {
  const d = parseDone(rec);
  return META_ITEMS.every(it => {
    if (it.kind === 'avgSec') return takhirIsOk(rec);
    return !!d[it.id];
  });
}

function metaUid(day) {
  return 'meta-' + String(day || '').trim();
}
function fillMetaGaps(keep, extra) {
  if (!keep || !extra) return;
  ['moodToFlowMin','afterFastMoodMin','ghanoonMin','layersMin'].forEach(k => {
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
  if (!(Number(keep.takhirN) > 0) && Number(extra.takhirN) > 0) {
    keep.takhirN = extra.takhirN;
    keep.takhirSum = extra.takhirSum;
    keep.takhirAvg = extra.takhirAvg;
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
function blankMeta(day) {
  const rec = {
    uid: metaUid(day),
    createdAt: new Date().toISOString(),
    dateShamsi: day,
    moodToFlowMin:0, afterFastMoodMin:0, ghanoonMin:0, layersMin:0,
    takhirAvg:'', takhirN:0, takhirSum:0, lawsJson:'[]', lawsMin:0,
    done: {}, doneJson: '{}', complete: 0, synced: 0
  };
  META_FLAG_IDS.forEach(k => { rec[k] = 0; });
  return rec;
}

/* ═════════════════════════════ 5. META FORM ════════════════════════════════ */

let mDate = null;
const mW = {};
const flagDraft = {};
const takhirDraft = [];
let lawDraft = [];
let lastMetaRec = null;

function flagOn(rec, id) {
  if (Object.prototype.hasOwnProperty.call(flagDraft, id)) return !!flagDraft[id];
  if (rec && rec[id]) return true;
  return flagBundleKeys(id).some(k => !!(rec && rec[k]));
}

function clearFlagDraft() {
  Object.keys(flagDraft).forEach(k => delete flagDraft[k]);
  takhirDraft.length = 0;
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
  const saved = rec ? parseLaws(rec) : [];
  const day = rec ? rec.dateShamsi : (mDate ? selectedMetaDay() : '');
  if (mDate && day && day === selectedMetaDay()) return lawDraft.slice();
  if (mDate && !rec) return lawDraft.slice();
  return saved;
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
async function loadLawDraft() {
  const rec = await metaFor(selectedMetaDay());
  lawDraft = parseLaws(rec).map(x => ({
    name: String(x.name || ''),
    desc: String(x.desc || ''),
    min: Number(x.min) || 0
  }));
  paintLawList();
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
  if (it.kind === 'accumDur') return 'today: ' + fmtChunk(rec[META_STORE[it.id]] || 0);
  if (it.kind === 'flag') return flagOn(rec, it.id) ? 'SET' : 'not set';
  if (it.kind === 'avgSec') {
    const n = Number(rec.takhirN) || 0;
    const pending = takhirDraft.length;
    if (!n && !pending) return 'ok <=1.5s';
    const avg = n ? (Number(rec.takhirAvg) || 0) : 0;
    let line = n ? ('avg ' + avg.toFixed(2) + 's  n=' + n + (takhirIsOk(rec, takhirDraft) ? '  flag=1' : '  flag=0')) : 'no avg yet';
    if (pending) line += '  draft+' + pending;
    return line;
  }
  return '';
}

async function paintMetaStatus() {
  const day = mDate ? selectedMetaDay() : '';
  const rec = day ? await metaFor(day) : null;
  lastMetaRec = rec;
  const work = await sessionWork(day);
  paintSummary($('metaSum'), rec, work);
  paintSummary($('nbMetaSum'), rec, work);
  META_ITEMS.forEach(it => {
    const tot = $('tot_' + it.id);
    if (tot) tot.textContent = totalLine(it, rec);
    if (it.kind === 'flag' && it._btn) it._btn.classList.toggle('on', flagOn(rec, it.id));
  });
  paintLawList();
}

let sumTimer = null;
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
    b.textContent = it.label;
    b.addEventListener('click', () => toggleFlagDraft(it.id));
    row.appendChild(b);
    it._btn = b;
    return;
  }
  const box = document.createElement('div');
  box.className = 'mblock';
  box.innerHTML =
    `<h3>${it.label}</h3>` +
    `<p class="hint" id="tot_${it.id}">—</p>` +
    `<div id="mw_${it.id}"></div>`;
  host.appendChild(box);
  const h = $('mw_' + it.id);
  if (it.kind === 'accumDur') mW[it.id] = makeDurWheel(h, 0, 0, scheduleSummary);
  if (it.kind === 'avgSec') {
    const hint = document.createElement('p');
    hint.className = 'hint';
    hint.textContent = 'sample ha montazer put paye daste mimanand';
    h.appendChild(hint);
    const bar = document.createElement('div');
    h.appendChild(bar);
    pickBar(bar, TAKHIR_SECS, null, v => {
      takhirDraft.push(Number(v));
      scheduleSummary();
      vibrate(8);
    });
  }
}

function paintLawList() {
  const host = $('lawList');
  if (!host) return;
  if (!lawDraft.length) {
    host.innerHTML = '<p class="hint">henuz ghanooni baraye in ruz nist</p>';
    return;
  }
  host.innerHTML = lawDraft.map((x, i) =>
    `<div class="lawcard">` +
      `<b>${esc(x.name)}</b>` +
      (x.desc ? `<span class="desc">${esc(x.desc)}</span>` : '') +
      `<span class="desc">${fmtChunk(x.min)}</span>` +
      `<button type="button" class="cancel" data-law="${i}">hazf</button>` +
    `</div>`
  ).join('');
  host.querySelectorAll('[data-law]').forEach(b => {
    b.addEventListener('click', () => {
      lawDraft.splice(Number(b.dataset.law), 1);
      paintLawList();
      scheduleSummary();
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
    `<button type="button" data-n="${esc(x.name)}">${esc(x.name)}</button>`
  ).join('');
  host.querySelectorAll('button').forEach(b => {
    b.addEventListener('click', () => {
      const hit = lawCatalog().find(x => x.name === b.dataset.n);
      if (!hit) return;
      $('lawName').value = hit.name;
      $('lawDesc').value = hit.desc || '';
      vibrate(8);
    });
  });
}

function mountLawsPanel(wrap) {
  const box = document.createElement('div');
  box.className = 'mblock';
  box.innerHTML =
    `<h3>name + saat — tozih ekhtiari</h3>` +
    `<p class="hint">tozih lazeme nist. nam kafist. ta put, dar kart pishnevis shomaresh mishavad.</p>` +
    `<div class="chips qchips" id="lawCat"></div>` +
    `<label class="lb">nam</label>` +
    `<input id="lawName" class="ltr" placeholder="masalan: sokut-12"/>` +
    `<label class="lb">tozih — ekhtiari</label>` +
    `<textarea id="lawDesc" class="ltr" placeholder="in ghanoon chist"></textarea>` +
    `<label class="lb">saat</label>` +
    `<div id="lawDur"></div>` +
    `<button type="button" class="put" id="lawAdd">add be pishnevis</button>` +
    `<div class="lawlist" id="lawList"></div>`;
  wrap.appendChild(box);
  mW.lawDur = makeDurWheel($('lawDur'), 0, 30);
  $('lawAdd').addEventListener('click', () => {
    const name = ($('lawName').value || '').trim();
    if (!name) { toast('nam khali ast', true); return; }
    const desc = ($('lawDesc').value || '').trim();
    const min = mW.lawDur ? mW.lawDur.minutes() : 0;
    const i = lawDraft.findIndex(x => x.name === name);
    const row = { name, desc, min };
    if (i >= 0) lawDraft[i] = row;
    else lawDraft.push(row);
    lawCatalogSave(name, desc);
    paintLawCatalog();
    paintLawList();
    $('lawName').value = '';
    $('lawDesc').value = '';
    if (mW.lawDur) mW.lawDur.reset();
    vibrate(8);
    toast(name + ' draft');
    scheduleSummary();
  });
  paintLawCatalog();
  paintLawList();
}

function buildMeta() {
  let paintT = null;
  mDate = makeDateWheel($('mDate'), () => {
    clearFlagDraft();
    clearTimeout(paintT);
    paintT = setTimeout(() => {
      loadLawDraft().then(() => paintMetaStatus());
    }, 220);
  });
  const host = $('metaBlocks');
  host.innerHTML = '';
  host.className = 'mgrids';
  META_GROUPS.forEach(g => {
    const wrap = document.createElement('div');
    wrap.className = 'mgrp tone-' + g.id + ((g.id === 'andaze' || g.id === 'laws') ? ' span2' : '');
    const flags = groupFlags(g.id);
    wrap.innerHTML =
      `<div class="gtitle">${g.title}</div>` +
      (flags.length
        ? `<div class="mall">` +
          `<button type="button" data-all="1">select all</button>` +
          `<button type="button" data-all="0">unselect all</button>` +
          `</div>`
        : '');
    host.appendChild(wrap);
    wrap.querySelectorAll('.mall button').forEach(b => {
      b.addEventListener('click', () => draftGroupFlags(g.id, b.dataset.all === '1'));
    });
    if (g.id === 'laws') mountLawsPanel(wrap);
    else META_ITEMS.filter(it => it.group === g.id).forEach(it => mountMetaItem(wrap, it));
    const putBtn = document.createElement('button');
    putBtn.type = 'button';
    putBtn.className = 'gput';
    putBtn.textContent = 'put ' + g.title;
    putBtn.addEventListener('click', () => putGroup(g.id));
    wrap.appendChild(putBtn);
  });
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

async function putGroup(gid) {
  const day = selectedMetaDay();
  let rec = await metaFor(day) || blankMeta(day);
  const done = parseDone(rec);
  if (gid === 'laws') {
    rec.lawsJson = JSON.stringify(lawDraft);
    rec.lawsMin = lawDraft.reduce((s, x) => s + (Number(x.min) || 0), 0);
    lawDraft.forEach(x => lawCatalogSave(x.name, x.desc));
    rec.done = done;
    rec.doneJson = JSON.stringify(done);
    rec.complete = isComplete(rec) ? 1 : 0;
    rec.synced = 0;
    rec.createdAt = rec.createdAt || new Date().toISOString();
    await put('meta', rec);
    vibrate(25);
    toast('laws put n=' + lawDraft.length);
    await paintMetaStatus();
    updateQueueBadge();
    trySync();
    return;
  }
  META_ITEMS.filter(it => it.group === gid).forEach(it => {
    if (it.kind === 'flag') {
      const on = flagOn(rec, it.id);
      rec[it.id] = on ? 1 : 0;
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
      takhirDraft.forEach(sample => {
        rec.takhirN = (Number(rec.takhirN) || 0) + 1;
        rec.takhirSum = (Number(rec.takhirSum) || 0) + Number(sample);
      });
      takhirDraft.length = 0;
      if (Number(rec.takhirN) > 0) {
        rec.takhirAvg = rec.takhirSum / rec.takhirN;
      }
      if (takhirIsOk(rec)) done[it.id] = 1;
      else delete done[it.id];
    }
  });
  rec.done = done;
  rec.doneJson = JSON.stringify(done);
  rec.complete = isComplete(rec) ? 1 : 0;
  rec.synced = 0;
  rec.createdAt = rec.createdAt || new Date().toISOString();
  await put('meta', rec);
  vibrate(25);
  toast(gid + ' put');
  await paintMetaStatus();
  updateQueueBadge();
  trySync();
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
    `<button type="button" data-p="${p.id}" class="p${p.id}">${p.label}</button>`).join('');
  const paint = () => host.querySelectorAll('button').forEach(b =>
    b.classList.toggle('on', Number(b.dataset.p) === activePart));
  host.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    activePart = Number(b.dataset.p);
    paint();
    picked = null;
    fillActivityList();
    $('nbComposer').classList.add('hide');
    $('partHint').textContent = PARTS[activePart].hint;
    vibrate(8);
  }));
  paint();
  $('partHint').textContent = PARTS[activePart].hint;
}

function fillActivityList() {
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

function openComposer() {
  const c = currentCode();
  const d = c.def || {};
  $('nbComposer').classList.remove('hide');
  $('compTitle').textContent = c.code;
  $('compHint').textContent = 'tags ba virgul. quality chips zir.';
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
  qh.innerHTML = QUALITY_TAGS.map(t => `<button type="button" data-t="${t}">${t}</button>`).join('');
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
    html += '<div class="nbpart p' + p.id + '"><div class="partline">' + esc(p.label) + '</div>';
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
  const rec = day ? await metaFor(day) : null;
  paintSummary($('nbMetaSum'), rec, await sessionWork(day));
  host.innerHTML = html || '<div class="empty">خالی</div>';
}

/* ═════════════════════════════ 7. TABS / SAVE ══════════════════════════════ */

let activeTab = 'session';

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

function showTab(name) {
  if (name !== 'session' && name !== 'meta' && name !== 'data') name = 'session';
  activeTab = name;
  cfgSet('tab', name);
  $('paneSession').classList.toggle('hide', name !== 'session');
  $('paneMeta').classList.toggle('hide',    name !== 'meta');
  $('paneData').classList.toggle('hide',    name !== 'data');
  $('tabSession').classList.toggle('active', name === 'session');
  $('tabMeta').classList.toggle('active',    name === 'meta');
  $('tabData').classList.toggle('active',    name === 'data');
  $('btnSave').disabled  = (name !== 'session');
  $('btnSave').textContent = 'این خط را بنویس';
  const bar = document.querySelector('.bar');
  if (bar) bar.classList.toggle('hide', name !== 'session');
  document.body.style.paddingBottom = name === 'session' ? '100px' : '24px';
  if (name === 'session') ensureSessionUi();
  requestAnimationFrame(pinHeader);
  settleWheels();
  if (name === 'meta') paintMetaStatus();
  if (name === 'session') { paintNotebook(); paintMetaStatus(); }
  if (name === 'data') refreshData();
}

async function doSave() {
  if (activeTab === 'session') {
    const rec = collectSession();
    if (!rec) return;
    await put('sessions', rec);
    vibrate(25);
    toast('خط نشست · ' + rec.code + ':' + (rec.chunk || rec.count));
    $('s_note').value = '';
    $('s_tags').value = '';
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

async function trySync(loud) {
  const url = cfgGet('url'), secret = cfgGet('secret');
  if (!url) { if (loud) toast('آدرس وب‌اپ خالی است', true); return; }
  if (!navigator.onLine) { if (loud) toast('آفلاین هستی', true); return; }
  if (trySync._busy) { if (loud) toast('در حال ارسال'); return; }

  const s = (await getAll('sessions')).filter(r => !r.synced);
  const m = (await getAll('meta')).filter(r => !r.synced);
  if (!s.length && !m.length) {
    if (loud) toast('صف خالی است');
    return;
  }

  trySync._busy = true;
  try {
    let info = [];
    if (s.length) info.push(await pushBatch(url, secret, 'session', s, SESSION_FIELDS));
    if (m.length) info.push(await pushBatch(url, secret, 'meta',    m, META_FIELDS));
    const line = info.map(x =>
      (x.tab || '') + ' ' + (x.version || '') +
      ' +' + (x.inserted || 0) + ' ~' + (x.updated || 0)
    ).join(' · ');
    paintSyncOut(line);
    if (loud) toast('شیت به‌روز شد');
  } catch (e) {
    const msg = String(e.message || e);
    paintSyncOut(msg);
    if (loud) toast(msg.indexOf('old script') >= 0 ? 'همین آدرس کهنه است' : 'ارسال نشد، در صف ماند', true);
  } finally {
    trySync._busy = false;
  }
  updateQueueBadge();
  if (activeTab === 'data') refreshData();
}

async function pushBatch(url, secret, type, rows, fields) {
  const payload = { secret, type, fields, rows: rows.map(r => fields.map(f => r[f] === undefined ? '' : r[f])) };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  });
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

async function updateQueueBadge() {
  const s = (await getAll('sessions')).filter(r => !r.synced).length;
  const m = (await getAll('meta')).filter(r => !r.synced).length;
  const n = s + m;
  $('queuePill').textContent = 'صف ' + n;
  $('queuePill').className = 'pill ' + (n ? 'off' : 'on');
}
function updateNetPill() {
  const p = $('netPill');
  p.textContent = navigator.onLine ? 'آنلاین' : 'آفلاین';
  p.className = 'pill ' + (navigator.onLine ? 'on' : 'off');
}

/* ═════════════════════════════ 9. DATA / CSV ═══════════════════════════════ */

function metaBits(rec) {
  if (!rec) return [];
  const bits = [];
  META_ITEMS.forEach(it => {
    if (it.kind === 'accumDur') {
      const n = Number(rec[META_STORE[it.id]]) || 0;
      if (n) bits.push({ id: it.id, text: it.label + '=' + fmtChunk(n) });
    } else if (it.kind === 'flag' && rec[it.id]) {
      bits.push({ id: it.id, text: it.label });
    } else if (it.kind === 'avgSec' && Number(rec.takhirN) > 0) {
      const avg = Number(rec.takhirAvg) || 0;
      bits.push({ id: it.id, text: 'takhirAvg=' + avg.toFixed(2) + 's' + (takhirIsOk(rec) ? '' : ' flag0') });
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
    return { id: it.id, group: it.group, kind: it.kind, label: it.label, state, val: '', min: 0 };
  }
  if (it.kind === 'accumDur') {
    const n = Number(rec && rec[META_STORE[it.id]]) || 0;
    return {
      id: it.id, group: it.group, kind: it.kind, label: it.label,
      state: n > 0 ? 'ok' : 'miss', val: n > 0 ? fmtChunk(n) : '0m', min: n
    };
  }
  if (it.kind === 'avgSec') {
    const n = Number(rec && rec.takhirN) || 0;
    const pending = takhirDraft.length;
    const ok = takhirIsOk(rec, takhirDraft);
    if (!n && !pending) {
      return { id: it.id, group: it.group, kind: it.kind, label: it.label, state: 'ok', val: '<=1.5s', min: 0 };
    }
    let sum = Number(rec && rec.takhirSum) || 0;
    takhirDraft.forEach(s => { sum += Number(s) || 0; });
    const avg = (n + pending) ? (sum / (n + pending)) : 0;
    return {
      id: it.id, group: it.group, kind: it.kind, label: it.label,
      state: ok ? 'ok' : 'miss',
      val: avg.toFixed(2) + 's n=' + (n + pending),
      min: 0
    };
  }
  return { id: it.id, group: it.group, kind: it.kind, label: it.label, state: 'miss', val: '', min: 0 };
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
function sumTile(title, value, note, tone, off) {
  return '<div class="sumtile ' + tone + (off ? ' off' : '') + '">' +
    '<span>' + esc(title) + '</span>' +
    '<b>' + esc(value) + '</b>' +
    (note ? '<small>' + esc(note) + '</small>' : '') +
  '</div>';
}
function paintSummary(el, rec, work) {
  if (!el) return;
  el.classList.add('sumdash');
  work = work || { sessionMin: 0, sessionN: 0, byPart: PARTS.map(p => ({ id: p.id, label: p.label, min: 0, n: 0 })), byCat: [] };
  const views = META_ITEMS.map(it => metaItemView(rec, it));
  const laws = lawsForSummary(rec);
  const durs = views.filter(v => v.kind === 'accumDur');
  const lawMin = laws.reduce((s, x) => s + (Number(x.min) || 0), 0);
  const okN = views.filter(v => v.state === 'ok').length;
  const pct = views.length ? Math.round(100 * okN / views.length) : 0;
  const parts = (work.byPart || PARTS.map(p => ({ id: p.id, label: p.label, min: 0, n: 0 })));
  el.innerHTML =
    '<div class="sumhero work">' +
      sumTile('دفتر', fmtChunk(work.sessionMin || 0), (work.sessionN || 0) + ' خط · ' + pct + '% متا', 'tone-nb', !(work.sessionMin)) +
      parts.map(p => sumTile(p.label, fmtChunk(p.min), p.n + ' خط', 'p' + p.id, !p.min)).join('') +
    '</div>' +
    '<div class="sumhero durs">' +
      durs.map(v => sumTile(v.id === 'layers' ? 'layers' : v.label, v.val, v.min ? '' : 'خالی', 'tone-' + v.group, !v.min)).join('') +
      sumTile('ghanoon mohem', String(laws.length), fmtChunk(lawMin), 'tone-laws', !laws.length) +
      (function () {
        const avg = views.find(v => v.kind === 'avgSec');
        return avg ? sumTile('takhir', avg.val, avg.state === 'ok' ? 'ok' : '>1.5s', 'tone-andaze', avg.state !== 'ok') : '';
      }()) +
    '</div>' +
    ((work.byCat && work.byCat.length)
      ? ('<div class="sumhero cats">' +
          work.byCat.map(c => sumTile(c.cat, fmtChunk(c.min), c.n + ' خط', 'cat-' + c.cat, !c.min)).join('') +
        '</div>')
      : '') +
    '<div class="sumflags">' +
      META_GROUPS.map(g => {
        const items = views.filter(v => v.group === g.id);
        const gok = items.filter(v => v.state === 'ok').length;
        let chips = items.map(v =>
          '<span class="chip ' + v.state + '">' + esc(v.label) + (v.val ? ' ' + v.val : '') + '</span>'
        ).join('');
        if (g.id === 'laws') {
          chips = laws.length
            ? laws.map(x => '<span class="chip ok">' + esc(x.name) + (x.desc ? ' — ' + esc(x.desc) : '') + ' ' + esc(fmtChunk(x.min)) + '</span>').join('')
            : '<span class="chip miss">nist</span>';
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
  if (String(itemId).indexOf('law:') === 0) {
    const name = String(itemId).slice(4);
    const left = parseLaws(rec).filter(x => x.name !== name);
    rec.lawsJson = JSON.stringify(left);
    rec.lawsMin = left.reduce((s, x) => s + (Number(x.min) || 0), 0);
    lawDraft = left.slice();
  } else if (!it) return rec;
  if (it && it.kind === 'accumDur') rec[META_STORE[it.id]] = 0;
  if (it && it.kind === 'flag') applyFlagBundle(rec, it.id, 0);
  if (it && it.kind === 'avgSec') { rec.takhirAvg = ''; rec.takhirN = 0; rec.takhirSum = 0; }
  const done = parseDone(rec);
  delete done[itemId];
  rec.done = done;
  rec.doneJson = JSON.stringify(done);
  rec.complete = isComplete(rec) ? 1 : 0;
  rec.synced = 0;
  return rec;
}

function tagCell(synced) {
  return `<span class="tag ${synced ? 'sent' : 'pending'}">${synced ? 'رفت' : 'صف'}</span>`;
}

async function refreshData() {
  const s = await getAll('sessions');
  const m = await getAll('meta');
  $('cntS').textContent = s.length;
  $('cntM').textContent = m.length;
  $('cntQ').textContent = s.filter(r => !r.synced).length + m.filter(r => !r.synced).length;
  const [y, mo, d] = todayJ();
  const today = fmtJ(y, mo, d);
  const rows = s.filter(r => r.dateShamsi === today);
  $('verBox').innerHTML =
    `نسخهٔ اپ: <b>${APP_VERSION}</b><br/>` +
    `نسخهٔ شیت باید: <b>${SCRIPT_VERSION}</b><br/>` +
    `امروز به شمسی: <b>${today}</b><br/>` +
    `آدرس اپ: <span class="brk">${location.origin + location.pathname}</span><br/>` +
    `آدرس وب‌اپ شیت: <span class="brk">${cfgGet('url') || 'خالی'}</span>`;
  const byCat = {};
  let totalMin = 0;
  rows.forEach(r => {
    const mi = Number(r.minutes) || 0;
    totalMin += mi;
    if (!byCat[catName(r.category)]) byCat[catName(r.category)] = { min:0, n:0 };
    byCat[catName(r.category)].min += mi;
    byCat[catName(r.category)].n++;
  });
  let html = `<b>${today}</b> — جمع دفتر: <b>${fmtHM(totalMin)}</b> · خط: <b>${rows.length}</b>`;
  const cats = Object.keys(byCat);
  if (cats.length) {
    html += '<div class="catlines">' +
      cats.map(c => esc(c) + ': <b>' + esc(fmtHM(byCat[c].min)) + '</b>').join('<br/>') + '</div>';
  }
  const todayMeta = m.find(r => r.dateShamsi === today);
  const hold = document.createElement('div');
  paintSummary(hold, todayMeta || null, await sessionWork(today));
  html += hold.innerHTML;
  $('todaySum').innerHTML = html;
  const mixed = [];
  s.forEach(r => mixed.push({
    at: r.createdAt || '',
    date: r.dateShamsi || '',
    kind: 'دفتر',
    part: r.part || '',
    code: r.code || '',
    val: r.chunk || r.hm || r.count || '',
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
  host.innerHTML = mixed.slice(0, 30).map(r => {
    const actions = tagCell(r.synced) + (r.store === 'sessions' && !r.synced && r.uid
      ? '<button type="button" class="cancel" data-store="sessions" data-uid="' + esc(r.uid) + '">لغو</button>'
      : '');
    let body = '';
    if (r.store === 'meta' && r.bits && r.bits.length) {
      body = '<div class="logchips">' + r.bits.map(b => {
        const x = !r.synced
          ? '<button type="button" class="cancel" data-meta-item="' + esc(b.id) + '" data-uid="' + esc(r.uid) + '">لغو</button>'
          : '';
        return '<span class="logchip">' + esc(b.text) + x + '</span>';
      }).join('') + '</div>';
    } else if (r.store === 'sessions') {
      body = '<div class="logline">' +
        (r.part ? '<span class="logpart">' + esc(r.part) + '</span>' : '') +
        (r.code ? '<span class="logcode">' + esc(r.code) + '</span>' : '') +
        (r.val ? '<span class="logdur">' + esc(r.val) + '</span>' : '') +
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
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().catch(() => {});
  }

  pinHeader();
  buildMeta();

  $('cfg_url').value    = cfgGet('url');
  $('cfg_secret').value = cfgGet('secret');

  $('tabSession').addEventListener('click', () => showTab('session'));
  $('tabMeta').addEventListener('click',    () => showTab('meta'));
  $('tabData').addEventListener('click',    () => showTab('data'));
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
      const uid = itemBtn.dataset.uid;
      const itemId = itemBtn.dataset.metaItem;
      const all = await getAll('meta');
      const rec = all.find(r => r.uid === uid);
      if (!rec) return;
      clearMetaField(rec, itemId);
      if (!metaBits(rec).length) await delKey('meta', rec.uid);
      else await put('meta', rec);
      toast('از متا حذف شد');
      await refreshData();
      updateQueueBadge();
      paintMetaStatus();
      paintNotebook();
      return;
    }
    const b = ev.target.closest('button.cancel');
    if (!b) return;
    const store = b.dataset.store;
    const id = b.dataset.uid;
    if (!store || !id) return;
    await delKey(store, id);
    toast('از صف حذف شد');
    await refreshData();
    updateQueueBadge();
    if (store === 'meta') paintMetaStatus();
    else paintNotebook();
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
    if (last === 'session' || last === 'data' || last === 'meta') {
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

  updateNetPill();
  updateQueueBadge();
  paintNotebook();
  paintMetaStatus();
  await forceMetaResyncOnce();
  checkSheet(false);
  trySync();
  const last = cfgGet('tab');
  showTab(last === 'session' || last === 'data' || last === 'meta' ? last : 'session');

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
