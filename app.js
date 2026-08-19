/* ============================================================================
   DailyLog v12 — notebook + flag/xor meta, finglish keys
   Plain ES2017. IndexedDB + optional Apps Script sync. No build step.
   ============================================================================ */

'use strict';

const APP_VERSION = 'v29 · meta';
const SCRIPT_VERSION = 'v7-meta';

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
  'bighar','zajr','dard','fesharshad','karesakht','flowshadid',
  'tamrkzshadid','amighshadid','thinkshadid'
];

const CODES = [
  { cat:'takhsis',  code:'takhkhod',       metric:'dur', from:0, def:{h:0,m:30} },
  { cat:'takhsis',  code:'takhshose',      metric:'dur', from:0, def:{h:0,m:30} },
  { cat:'takhsis',  code:'takhmojaz',      metric:'dur', from:0, def:{h:0,m:40} },
  { cat:'arastegi', code:'arasmotakh',     metric:'dur', from:0, def:{h:0,m:30} },
  { cat:'arastegi', code:'arasmor',        metric:'dur', from:0, def:{h:0,m:25} },
  { cat:'kar',      code:'itpr',           metric:'dur', from:0, def:{h:2,m:40} },
  { cat:'sehat',    code:'drazmayesh',     metric:'dur', from:0, def:{h:2,m:30} },
  { cat:'sobh',     code:'bankhozuri',     metric:'dur', from:0, def:{h:0,m:20} },
  { cat:'sobh',     code:'eslahebadan',    metric:'dur', from:0, def:{h:0,m:20} },
  { cat:'sobh',     code:'analiz',         metric:'dur', from:0, def:{h:0,m:20} },
  { cat:'sobh',     code:'tayinsathzaban', metric:'dur', from:0, def:{h:0,m:20} },
  { cat:'sobh',     code:'ghors',          metric:'dur', from:0, def:{h:0,m:5} },
  { cat:'sobh',     code:'dolar',          metric:'dur', from:0, def:{h:0,m:15} },
  { cat:'sobh',     code:'tala',           metric:'dur', from:0, def:{h:0,m:15} },
  { cat:'sobh',     code:'sarmayegozari',  metric:'dur', from:0, def:{h:0,m:20} },
  { cat:'sobh',     code:'vam',            metric:'dur', from:0, def:{h:0,m:20} },
  { cat:'hafte',    code:'hafte_prereg',   metric:'dur', from:0, def:{h:0,m:40} },
  { cat:'rutin',    code:'rout',           metric:'dur', from:0, def:{h:0,m:40} },

  { cat:'sehat',    code:'ab',             metric:'dur', from:1, def:{h:0,m:20} },
  { cat:'kharid',   code:'kharid',         metric:'dur', from:1, def:{h:0,m:20} },
  { cat:'kar',      code:'assessvisa',     metric:'dur', from:1, def:{h:0,m:30} },
  { cat:'kar',      code:'pardpei',        metric:'dur', from:1, def:{h:0,m:20} },
  { cat:'kar',      code:'bimebargoz',     metric:'dur', from:1, def:{h:0,m:20} },
  { cat:'kar',      code:'peigiri',        metric:'dur', from:1, def:{h:0,m:20} },
  { cat:'kar',      code:'peigirimaj',     metric:'dur', from:1, def:{h:0,m:20} },
  { cat:'kar',      code:'malizar',        metric:'dur', from:1, def:{h:0,m:25} },
  { cat:'kar',      code:'kartakh2',       metric:'dur', from:1, def:{h:0,m:40} },

  { cat:'varzesh',  code:'rah',            metric:'dur', from:2, def:{h:0,m:30} },
  { cat:'varzesh',  code:'do',             metric:'dur', from:2, def:{h:0,m:30} },
  { cat:'varzesh',  code:'azkesh',         metric:'dur', from:2, def:{h:1,m:0} },
  { cat:'ravan',    code:'moshv',          metric:'dur', from:2, def:{h:0,m:45} },
  { cat:'ravan',    code:'kargahravanp',   metric:'dur', from:2, def:{h:1,m:0} },
  { cat:'ravan',    code:'ranpphar2hafte', metric:'dur', from:2, def:{h:0,m:45} },
  { cat:'asar',     code:'divar',          metric:'dur', from:2, def:{h:0,m:25} },
  { cat:'asar',     code:'foroshhozuri',   metric:'dur', from:2, def:{h:0,m:25} },
  { cat:'khane',    code:'otu',            metric:'dur', from:2, def:{h:0,m:20} },
  { cat:'khane',    code:'shosmort',       metric:'dur', from:2, def:{h:0,m:20} },
  { cat:'sehat',    code:'mokamel',        metric:'reps', from:2, def:{r:1,pr:5} },

  { cat:'sabt',     code:'sabt',           metric:'dur', from:3, def:{h:0,m:15} },
  { cat:'sehat',    code:'salad',          metric:'dur', from:3, def:{h:0,m:20}, kind:true },
  { cat:'yadgiri',  code:'reswch',         metric:'dur', from:3, def:{h:1,m:50} },
  { cat:'sehat',    code:'dand',           metric:'reps', from:3, def:{r:3,pr:5} },
  { cat:'afteropen',code:'affplan',        metric:'dur', from:3, def:{h:0,m:20} },
  { cat:'afteropen',code:'affket',         metric:'dur', from:3, def:{h:0,m:15} },
  { cat:'afteropen',code:'afflog',         metric:'dur', from:3, def:{h:0,m:10} }
];

const SESSION_FIELDS = ['uid','createdAt','dateShamsi','part','partId','category','code','metric',
                        'minutes','hm','chunk','tags','reactSec','count','reps','perRep','kind','note'];

const META_ITEMS = [
  { id:'moodToFlow',     label:'moodtoflow',                                        kind:'accumDur' },
  { id:'fastMode',       label:'fastMode',                                          kind:'xor', options:['cleanfast>=19h','open<5h'] },
  { id:'cleanAfterOpen', label:'cleaneatingafteropen',                              kind:'flag' },
  { id:'raatayeghavanineakhlaghietayinshode100', label:'raatayeghavanineakhlaghietayinshode100%', kind:'flag' },
  { id:'adametakhghmoj0', label:'adametakhghmoj0%',                                  kind:'flag' },
  { id:'takhmojmotns',    label:'takhmojmotns',                                      kind:'flag' },
  { id:'mohtmoj100',      label:'mohtmoj100%',                                       kind:'flag' },
  { id:'budandarjayemojaz100', label:'budandarjayemojaz100%',                        kind:'flag' },
  { id:'kharidemojaz100', label:'kharidemojaz100%',                                  kind:'flag' },
  { id:'rayyatepartbandieruz100', label:'rayyatepartbandieruz100%',                  kind:'flag' },
  { id:'afterFastMood',  label:'afterfastmoodtoflow',                               kind:'accumDur' },
  { id:'nchort',         label:'nchort',                                           kind:'flag' },
  { id:'bidDiff',        label:'tafazol',                                          kind:'min15' },
  { id:'opf1',           label:'opf1aft3pm (15g sachetprotein)',                    kind:'opf1' },
  { id:'opf2',           label:'opf2aft6pm',                                        kind:'opf2' },
  { id:'preplan12',      label:'preplaned_ta12',                                    kind:'flag' },
  { id:'ghanoon',        label:'ghanoonfarayeman',                                  kind:'accumDur' },
  { id:'layers',         label:'bighar,zajr,dard,fesharshad,karesakht,flowshadid',  kind:'accumDur' },
  { id:'mintakhir',      label:'mintakhir',                                         kind:'secchips' }
];

const META_FLAG_IDS = META_ITEMS.filter(it => it.kind === 'flag').map(it => it.id);

const META_FIELDS = ['uid','createdAt','dateShamsi',
  'moodToFlowMin','afterFastMoodMin','ghanoonMin','layersMin',
  'fastMode','cleanAfterOpen',
  'raatayeghavanineakhlaghietayinshode100','adametakhghmoj0','takhmojmotns',
  'mohtmoj100','budandarjayemojaz100','kharidemojaz100','rayyatepartbandieruz100',
  'nchort','preplan12',
  'bidDiffMin','opf1','opf2','mintakhir',
  'doneJson','complete'];

const MIN_REACT_SEC = 2;
const OPF1_HOURS = [15,16,17,18,19,20,21,22,23,0,1];
const BID_DIFFS = [0,1,2,3,4,5,8,10,12,15];
const TAKHIR_SECS = [2,3,4,5,8,10,15,20,30,45,60];

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
function makeDurWheel(host, defH, defM) {
  const hh = [];
  for (let i = 0; i <= 24; i++) hh.push(String(i));
  const mm = minuteItems();
  const wh = wheelColumn(hh, Math.min(24, defH || 0), null, { loop: true });
  const wm = wheelColumn(mm, minuteIndex(defM), null, { loop: true });
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
function isComplete(rec) {
  const d = parseDone(rec);
  return META_ITEMS.every(it => d[it.id]);
}

function metaUid(day) {
  return 'meta-' + String(day || '').trim();
}
function fillMetaGaps(keep, extra) {
  if (!keep || !extra) return;
  ['moodToFlowMin','afterFastMoodMin','ghanoonMin','layersMin'].forEach(k => {
    if (!(Number(keep[k]) > 0) && Number(extra[k]) > 0) keep[k] = extra[k];
  });
  ['fastMode','opf1','opf2'].forEach(k => {
    if (!keep[k] && extra[k]) keep[k] = extra[k];
  });
  META_FLAG_IDS.forEach(k => {
    if (!keep[k] && extra[k]) keep[k] = extra[k];
  });
  if (keep.bidDiffMin === '' || keep.bidDiffMin == null) keep.bidDiffMin = extra.bidDiffMin;
  if (keep.mintakhir === '' || keep.mintakhir == null) keep.mintakhir = extra.mintakhir;
  keep.done = Object.assign({}, parseDone(extra), parseDone(keep));
  keep.doneJson = JSON.stringify(keep.done);
  keep.complete = isComplete(keep) ? 1 : 0;
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
    fastMode:'',
    bidDiffMin:'', opf1:'', opf2:'', mintakhir:'',
    done: {}, doneJson: '{}', complete: 0, synced: 0
  };
  META_FLAG_IDS.forEach(k => { rec[k] = 0; });
  return rec;
}

/* ═════════════════════════════ 5. META FORM ════════════════════════════════ */

let mDate = null;
const mW = {};

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
  if (it.kind === 'flag') return rec[it.id] ? 'SET' : 'not set';
  if (it.kind === 'xor') return rec.fastMode || 'not set';
  if (it.kind === 'min15') return rec.bidDiffMin === '' || rec.bidDiffMin == null ? 'not set' : (rec.bidDiffMin + 'm');
  if (it.kind === 'opf1') return rec.opf1 || 'not set';
  if (it.kind === 'opf2') return rec.opf2 || 'not set';
  if (it.kind === 'secchips') return rec.mintakhir === '' || rec.mintakhir == null ? 'not set' : (rec.mintakhir + 's');
  return '';
}

async function paintMetaStatus() {
  const day = mDate ? selectedMetaDay() : '';
  const rec = day ? await metaFor(day) : null;
  const sum = rec ? metaSummary(rec) : '—';
  const sumEl = $('metaSum');
  if (sumEl) sumEl.textContent = 'meta · ' + sum;
  const nbSum = $('nbMetaSum');
  if (nbSum) nbSum.textContent = 'meta · ' + sum;
  META_ITEMS.forEach(it => {
    const tot = $('tot_' + it.id);
    if (tot) tot.textContent = totalLine(it, rec);
    if (it.kind === 'flag' && it._btn) it._btn.classList.toggle('on', !!(rec && rec[it.id]));
    if (it.kind === 'xor') {
      const box = $('mw_' + it.id);
      if (box) box.querySelectorAll('button').forEach(b =>
        b.classList.toggle('on', !!(rec && rec.fastMode === b.textContent)));
    }
    if (it.kind === 'min15') {
      const box = $('mw_' + it.id);
      if (box) box.querySelectorAll('button').forEach(b =>
        b.classList.toggle('on', !!(rec && rec.bidDiffMin !== '' && rec.bidDiffMin != null && String(rec.bidDiffMin) === b.textContent)));
    }
    if (it.kind === 'secchips') {
      const box = $('mw_' + it.id);
      if (box) box.querySelectorAll('button').forEach(b =>
        b.classList.toggle('on', !!(rec && rec.mintakhir !== '' && rec.mintakhir != null && String(rec.mintakhir) === b.textContent)));
    }
  });
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

function buildMeta() {
  let paintT = null;
  mDate = makeDateWheel($('mDate'), () => {
    clearTimeout(paintT);
    paintT = setTimeout(() => paintMetaStatus(), 220);
  });
  const host = $('metaBlocks');
  host.innerHTML = '';
  META_ITEMS.forEach(it => {
    const box = document.createElement('div');
    box.className = 'mblock';
    const needPut = it.kind === 'accumDur' || it.kind === 'opf1' || it.kind === 'opf2';
    box.innerHTML =
      `<h3>${it.label}</h3>` +
      `<p class="hint" id="tot_${it.id}">—</p>` +
      `<div id="mw_${it.id}"></div>` +
      (needPut ? `<button type="button" class="put" data-id="${it.id}">put</button>` : '');
    host.appendChild(box);
    const h = $('mw_' + it.id);
    if (it.kind === 'accumDur') mW[it.id] = makeDurWheel(h, 0, 0);
    if (it.kind === 'opf1') mW.opf1 = makeClockWheel(h, 15, 0, OPF1_HOURS);
    if (it.kind === 'opf2') mW.opf2 = makeClockWheel(h, 18, 0);
    if (it.kind === 'flag') {
      const row = document.createElement('div');
      row.className = 'flagrow';
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = it.label;
      b.addEventListener('click', () => putMetaItem(it.id, 1));
      row.appendChild(b);
      h.appendChild(row);
      it._btn = b;
    }
    if (it.kind === 'xor') {
      const row = document.createElement('div');
      row.className = 'flagrow';
      it.options.forEach(opt => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = opt;
        b.addEventListener('click', () => putMetaItem(it.id, opt));
        row.appendChild(b);
      });
      h.appendChild(row);
    }
    if (it.kind === 'min15') {
      pickBar(h, BID_DIFFS, 0, v => putMetaItem(it.id, v));
    }
    if (it.kind === 'secchips') {
      pickBar(h, TAKHIR_SECS, 2, v => putMetaItem(it.id, v));
    }
    const putBtn = box.querySelector('.put');
    if (putBtn) putBtn.addEventListener('click', () => putMetaItem(it.id));
  });
  paintMetaStatus();
}

async function putMetaItem(id, picked) {
  const it = META_ITEMS.find(x => x.id === id);
  const day = selectedMetaDay();
  let rec = await metaFor(day) || blankMeta(day);
  const done = parseDone(rec);

  if (it.kind === 'accumDur') {
    const add = mW[id].minutes();
    const key = META_STORE[id];
    rec[key] = (Number(rec[key]) || 0) + add;
    mW[id].reset();
    toast(id + ' = ' + fmtChunk(rec[key]));
  }
  if (it.kind === 'opf1') {
    rec.opf1 = mW.opf1.value();
    const hr = Number(rec.opf1.split(':')[0]);
    if (OPF1_HOURS.indexOf(hr) < 0) { toast('opf1 15:00-01:00', true); return; }
    toast('opf1 ' + rec.opf1);
  }
  if (it.kind === 'opf2') {
    rec.opf2 = mW.opf2.value();
    toast('opf2 ' + rec.opf2);
  }
  if (it.kind === 'flag') {
    rec[id] = 1;
    toast(id + ' SET');
  }
  if (it.kind === 'xor') {
    rec.fastMode = picked;
    toast(picked);
  }
  if (it.kind === 'min15') {
    rec.bidDiffMin = Number(picked);
    toast('tafazol ' + rec.bidDiffMin + 'm');
  }
  if (it.kind === 'secchips') {
    rec.mintakhir = Number(picked);
    if (rec.mintakhir < MIN_REACT_SEC) { toast('mintakhir >= 2', true); return; }
    toast('mintakhir ' + rec.mintakhir);
  }

  done[id] = 1;
  rec.done = done;
  rec.doneJson = JSON.stringify(done);
  rec.complete = isComplete(rec) ? 1 : 0;
  rec.synced = 0;
  rec.createdAt = rec.createdAt || new Date().toISOString();
  await put('meta', rec);
  vibrate(25);
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
    `<button type="button" data-p="${p.id}">${p.label}</button>`).join('');
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
    return `<div class="catlab">${cat}</div><div class="alist">` +
      items.map(c => `<button type="button" data-code="${c.code}">${c.code}</button>`).join('') +
      `</div>`;
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
  qh.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    const cur = $('s_tags').value.split(',').map(s => s.trim()).filter(Boolean);
    if (cur.indexOf(b.dataset.t) < 0) cur.push(b.dataset.t);
    $('s_tags').value = cur.join(',');
    b.classList.add('on');
    vibrate(8);
  }));
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
  const day = sDate ? sDate.value() : '';
  const rows = (await getAll('sessions'))
    .filter(r => r.dateShamsi === day)
    .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
  const host = $('nbLog');
  let html = '';
  PARTS.forEach(p => {
    const here = rows.filter(r => Number(r.partId) === p.id || r.part === p.label);
    if (!here.length) return;
    html += '<div class="nbpart"><div class="partline">' + esc(p.label) + '</div>';
    const order = [];
    const bag = {};
    here.forEach(r => {
      if (!bag[r.code]) {
        bag[r.code] = { tags:[], chunks:[], sum:0, count:0 };
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
      const tags = g.tags.length ? '(' + g.tags.join(',') + ')' : '';
      html += '<div class="nbline">' + esc(code + tags + ':' + dur) + '</div>';
    });
    html += '</div>';
  });
  const rec = day ? await metaFor(day) : null;
  const sumEl = $('nbMetaSum');
  if (sumEl) sumEl.textContent = rec ? ('meta · ' + metaSummary(rec)) : 'meta · —';
  host.innerHTML = html || '<div class="empty">خالی</div>';
}

/* ═════════════════════════════ 7. TABS / SAVE ══════════════════════════════ */

let activeTab = 'meta';

function showTab(name) {
  activeTab = name;
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
  if (cfgGet('meta_resync') === 'v18') return;
  const all = await getAll('meta');
  for (const r of all) {
    r.synced = 0;
    await put('meta', r);
  }
  cfgSet('meta_resync', 'v18');
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
           ' · باید: ' + SCRIPT_VERSION + ' · ' + execHint(url))
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
      if (n) bits.push({ id: it.id, text: it.id + '=' + fmtChunk(n) });
    } else if (it.kind === 'flag' && rec[it.id]) {
      bits.push({ id: it.id, text: it.id });
    } else if (it.kind === 'xor' && rec.fastMode) {
      bits.push({ id: it.id, text: rec.fastMode });
    } else if (it.kind === 'min15' && rec.bidDiffMin !== '' && rec.bidDiffMin != null) {
      bits.push({ id: it.id, text: 'tafazol=' + rec.bidDiffMin + 'm' });
    } else if (it.kind === 'opf1' && rec.opf1) {
      bits.push({ id: it.id, text: 'opf1=' + rec.opf1 });
    } else if (it.kind === 'opf2' && rec.opf2) {
      bits.push({ id: it.id, text: 'opf2=' + rec.opf2 });
    } else if (it.kind === 'secchips' && rec.mintakhir !== '' && rec.mintakhir != null) {
      bits.push({ id: it.id, text: 'mintakhir=' + rec.mintakhir + 's' });
    }
  });
  return bits;
}
function metaSummary(rec) {
  const bits = metaBits(rec);
  return bits.map(b => b.text).join(' · ') || '—';
}
function clearMetaField(rec, itemId) {
  const it = META_ITEMS.find(x => x.id === itemId);
  if (!rec || !it) return rec;
  if (it.kind === 'accumDur') rec[META_STORE[it.id]] = 0;
  if (it.kind === 'flag') rec[it.id] = 0;
  if (it.kind === 'xor') rec.fastMode = '';
  if (it.kind === 'min15') rec.bidDiffMin = '';
  if (it.kind === 'opf1') rec.opf1 = '';
  if (it.kind === 'opf2') rec.opf2 = '';
  if (it.kind === 'secchips') rec.mintakhir = '';
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
    `آدرس اپ: <span class="ltr">${location.origin + location.pathname}</span><br/>` +
    `آدرس وب‌اپ شیت: <span class="ltr">${cfgGet('url') || 'خالی'}</span>`;
  const byCat = {};
  let totalMin = 0;
  rows.forEach(r => {
    const mi = Number(r.minutes) || 0;
    totalMin += mi;
    if (!byCat[r.category]) byCat[r.category] = { min:0, n:0 };
    byCat[r.category].min += mi;
    byCat[r.category].n++;
  });
  let html = `<b>${today}</b> — جمع دفتر: <b>${fmtHM(totalMin)}</b> · خط: <b>${rows.length}</b>`;
  const cats = Object.keys(byCat);
  if (cats.length) {
    html += '<div style="margin-top:8px">' +
      cats.map(c => `${c}: <b>${fmtHM(byCat[c].min)}</b>`).join('<br/>') + '</div>';
  }
  const todayMeta = m.find(r => r.dateShamsi === today);
  html += '<div class="ltr" style="margin-top:8px">متا · ' +
    esc(todayMeta ? metaSummary(todayMeta) : '—') + '</div>';
  $('todaySum').innerHTML = html;
  const mixed = [];
  s.forEach(r => mixed.push({
    at: r.createdAt || '',
    date: r.dateShamsi || '',
    kind: 'دفتر',
    what: (r.part ? r.part + ' · ' : '') + (r.code || ''),
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
        return '<span>' + esc(b.text) + x + '</span>';
      }).join('') + '</div>';
    } else if (r.val) {
      body = '<div class="logval">' + esc(r.val) + '</div>';
    }
    return '<div class="logcard">' +
      '<div class="loghead">' +
        '<div class="logmeta"><span class="logkind">' + esc(r.kind) + '</span>' +
        '<span class="logdate">' + esc(r.date) + '</span></div>' +
        '<div class="logactions">' + actions + '</div>' +
      '</div>' +
      (r.what && r.store !== 'meta' ? '<div class="logwhat">' + esc(r.what) + '</div>' : '') +
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

  sDate = makeDateWheel($('sDate'), () => paintNotebook());
  buildParts();
  fillActivityList();
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
  window.addEventListener('pageshow', settleWheels);
  window.addEventListener('resize',  settleWheels);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      sDate.today();
      mDate.today();
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
  showTab('meta');

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
