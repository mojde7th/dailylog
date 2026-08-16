/* ============================================================================
   DailyLog — offline-first day logger
   ----------------------------------------------------------------------------
   Language : plain JavaScript (ES2017). No framework, no build step, no npm.
   Storage  : IndexedDB for records, localStorage for settings.
   Sync     : optional HTTP POST to a Google Apps Script Web App.
   Runs from : a folder, a local http server, or GitHub Pages. Same code.
   ============================================================================ */

'use strict';

/* Bump this whenever you change anything. It is printed in the header, so a
   glance tells you whether the browser is running the new build or a stale
   cached one. */
const APP_VERSION = 'v7 · parts';

/* ═════════════════════════════ 1. ACTIVITY TABLE ═════════════════════════════
   Every activity declares how it is measured and from which day-part it first
   becomes legal. A later part always inherits everything from earlier parts.

     metric 'dur'   → duration wheel                     minutes + hm
     metric 'sec'   → seconds, floor of 2                reactSec
     metric 'reps'  → N times × M minutes                reps, perRep, minutes
     metric 'accum' → +N on today's running total        count
     metric 'tick'  → one occurrence                     count = 1

     from : 0 تا ۱۲   1 دوازده تا دو   2 دو تا شش   3 شش به بعد
     kind : optional تهیه / خوردن radio (pills)
   ========================================================================== */

const PARTS = [
  { id: 0, label: 'تا ۱۲',    hint: 'صبح تا ظهر' },
  { id: 1, label: '۱۲ تا ۲',  hint: 'ظهر' },
  { id: 2, label: '۲ تا ۶',   hint: 'بعدازظهر' },
  { id: 3, label: '۶ به بعد', hint: 'بعد از اوپن‌فست' }
];

const CODES = [
  { cat:'کار و آی‌تی',     code:'itpr',         label:'آی‌تی حرفه‌ای',              metric:'dur',   from:0, def:{h:2,m:40} },

  { cat:'تخصیص',          code:'takhkhod',     label:'تخصیص خودم',                metric:'dur',   from:0, def:{h:0,m:30} },
  { cat:'تخصیص',          code:'takhshose',    label:'تخصیص مجاز',                metric:'dur',   from:0, def:{h:0,m:40} },

  { cat:'آراستگی',        code:'arasmotakh',   label:'آراستگی شویسی',             metric:'dur',   from:0, def:{h:0,m:30} },
  { cat:'آراستگی',        code:'arasmor',      label:'آراستگی خودم',              metric:'dur',   from:0, def:{h:0,m:25} },

  { cat:'ورزش',           code:'azkesh',       label:'ازکش / باشگاه',             metric:'dur',   from:2, def:{h:1,m:0} },
  { cat:'ورزش',           code:'do',           label:'دو',                        metric:'dur',   from:2, def:{h:0,m:30} },

  { cat:'روتین',          code:'rout',         label:'روتین پرت',                 metric:'dur',   from:0, def:{h:0,m:40} },

  { cat:'واکنش',          code:'mintakhir',    label:'تأخیر واکنش',               metric:'sec',   from:0, def:{n:2} },
  { cat:'واکنش',          code:'checkin',      label:'چک‌این روز',                metric:'accum', from:0, def:{n:1} },
  { cat:'واکنش',          code:'ghanoon',      label:'قانون فرای من',             metric:'tick',  from:0 },

  { cat:'سلامت',          code:'ab',           label:'آب (مدت نوشیدن)',           metric:'dur',   from:0, def:{h:0,m:20} },
  { cat:'سلامت',          code:'dand1',        label:'دندان ۱ مسواک',             metric:'reps',  from:3, def:{r:1,pr:5} },
  { cat:'سلامت',          code:'dand2',        label:'دندان ۲ نخ',                metric:'reps',  from:3, def:{r:1,pr:5} },
  { cat:'سلامت',          code:'dand3',        label:'دندان ۳ دهان‌شویه',          metric:'reps',  from:3, def:{r:1,pr:5} },
  { cat:'سلامت',          code:'drazmayesh',   label:'دکتر / آزمایش',             metric:'dur',   from:0, def:{h:2,m:30} },
  { cat:'سلامت',          code:'ghors_sonti',  label:'قرص سنتی',                  metric:'reps',  from:0, def:{r:1,pr:5}, kind:true },
  { cat:'سلامت',          code:'ghors_kaj',    label:'قرص کاج',                   metric:'reps',  from:0, def:{r:1,pr:5}, kind:true },
  { cat:'سلامت',          code:'qat',          label:'قطره',                      metric:'reps',  from:3, def:{r:1,pr:5} },
  { cat:'سلامت',          code:'ker',          label:'کرم',                       metric:'reps',  from:3, def:{r:1,pr:5} },

  { cat:'خانه',           code:'shosmort',     label:'شست مرتب',                  metric:'dur',   from:1, def:{h:0,m:20} },
  { cat:'خانه',           code:'otu',          label:'اتو',                       metric:'dur',   from:0, def:{h:0,m:20} },

  { cat:'یادگیری',        code:'ket',          label:'کتاب',                      metric:'dur',   from:3, def:{h:0,m:15} },
  { cat:'یادگیری',        code:'reswch',       label:'پژوهش',                     metric:'dur',   from:3, def:{h:1,m:50} },

  { cat:'مالی و ضروری',   code:'zaruri',       label:'ضروری صبح',                 metric:'dur',   from:0, def:{h:0,m:20} },
  { cat:'مالی و ضروری',   code:'banki',        label:'بانکی / سرمایه‌گذاری',       metric:'dur',   from:0, def:{h:0,m:45} },
  { cat:'مالی و ضروری',   code:'bargozbime',   label:'بیمه / پیگیری / خرید',      metric:'dur',   from:1, def:{h:0,m:25} },

  { cat:'ارتباط',         code:'sabtturkela',  label:'ثبت‌نام تور و کلاس',         metric:'dur',   from:3, def:{h:0,m:15} },
  { cat:'ارتباط',         code:'moshv',        label:'مشاوره / کارگاه روان',      metric:'dur',   from:2, def:{h:0,m:20} }
];

/* Layers clocked on every session, not once a day. Zero means "skip". */
const LAYERS = [
  ['mood',  'مود تا فلو',   5, 10],
  ['bigh',  'بی‌قراری',      0,  0],
  ['tabav', 'تاب‌آوری',      0,  0],
  ['fesh',  'فشار شدید',     0,  0],
  ['dard',  'درد شدید',      0,  0],
  ['zajr',  'زجر شدید',      0,  0]
];

/* polarity 'neg' → "نه" is the good (green) answer. */
const META_BOOLS = [
  ['nap',            'چرت داشتم',                              'neg'],
  ['planTomorrow',   'برنامه فردا ایجاد شده',                   'pos'],
  ['sachetProtein',  'ساشه پروتئین بعد از ساعت ۳',              'pos'],
  ['noSugar',        'هیچ قند و کرب و شیرین‌کننده نخوردم',       'pos'],
  ['afterOpfaClean', 'بعد از اوپن‌فست چیز اشتباهی نخوردم',       'pos']
];

const SESSION_FIELDS = ['uid','createdAt','dateShamsi','part','category','code','metric',
                        'minutes','hm','reactSec','count','reps','perRep','kind',
                        'moodMin','moodHM','bighMin','bighHM','tabavMin','tabavHM',
                        'feshMin','feshHM','dardMin','dardHM','zajrMin','zajrHM','note'];

const META_FIELDS = ['uid','createdAt','dateShamsi','bid',
                     'openfastMin','openfastHM',
                     ...META_BOOLS.map(b => b[0]), 'note'];

const DEFAULT_BID_H = 3;
const DEFAULT_BID_M = 30;
const MIN_REACT_SEC = 2;

/* ═════════════════════════════ 2. JALALI CALENDAR ═══════════════════════════ */

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

/* ═════════════════════════════ 3. WHEEL PICKER ══════════════════════════════
   A wheel is a scrollable column with CSS scroll snapping. Reading it is just
   scrollTop / itemHeight.

   The one trap: a column inside display:none has no layout, so the browser
   throws its scrollTop away. Every wheel therefore registers itself here and
   re-applies its position whenever its pane becomes visible again. Without
   this the date wheel silently reads back as the first item, which is how you
   ended up with 1403/01/01 rows.
   ========================================================================== */

const ITEM_H = 40;
const WHEELS = new Set();

function refreshWheels() {
  WHEELS.forEach(w => w.apply());
}

/* A pane that was display:none has no layout, so a wheel inside it refuses to
   position itself and stays on its first item. Waiting for one animation
   frame after revealing the pane is not enough, because that frame can be
   skipped entirely when the page is in the background. Run once immediately,
   then again as layout settles. */
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
  for (let c = 0; c < COPIES; c++) {
    for (let i = 0; i < N; i++) shown.push(items[i]);
  }

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
  let idx   = mid + clampLog(initial);
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
    if (next !== idx) {
      idx = next;
      place(idx * ITEM_H);
    }
  }

  function apply() {
    if (!col.isConnected || col.offsetParent === null) return;
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
    else        place(idx * ITEM_H);
    paint();
    setTimeout(() => { quiet = false; }, smooth ? 280 : 80);
  }

  let t = null;
  sc.addEventListener('scroll', () => {
    if (quiet) return;
    if (col.offsetParent === null) return;
    const live = Math.round(sc.scrollTop / ITEM_H);
    if (live >= 0 && live < shown.length) {
      idx = live;
      paint();
    }
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

  const api = { el: col, get: logical, set, apply,
                destroy: () => WHEELS.delete(api) };
  WHEELS.add(api);
  return api;
}

function wheelGroup(host, cols, captions, ltr) {
  host.innerHTML = '';
  const row = document.createElement('div');
  row.className = 'wheels' + (ltr ? ' ltr' : '');
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

/* --- Shamsi date: year / month / day, always opening on today --- */
function makeDateWheel(host) {
  const [cy, cm, cd] = todayJ();
  const years = [];
  for (let y = cy - 2; y <= cy + 1; y++) years.push(String(y));

  const dayItems = (y, m) => {
    const a = [];
    for (let i = 1; i <= jMonthLen(y, m); i++) a.push(pad2(i));
    return a;
  };

  let wy, wm, wd;

  function rebuildDays() {
    if (!wd) return;
    const y = Number(years[wy.get()]);
    const m = wm.get() + 1;
    const keep = wd.get();
    const items = dayItems(y, m);
    if (items.length === wd.count) { wd.apply(); return; }
    const nd = wheelColumn(items, Math.min(keep, items.length - 1), null, { loop: true });
    nd.count = items.length;
    wd.destroy();
    wd.el.replaceWith(nd.el);
    wd = nd;
    requestAnimationFrame(() => nd.apply());
    setTimeout(() => nd.apply(), 60);
  }

  wy = wheelColumn(years, years.indexOf(String(cy)), rebuildDays);
  wm = wheelColumn(J_MONTHS, cm - 1, rebuildDays, { loop: true });
  wd = wheelColumn(dayItems(cy, cm), cd - 1, null, { loop: true });
  wd.count = jMonthLen(cy, cm);

  wheelGroup(host, [wy, wm, wd], ['سال', 'ماه', 'روز']);

  return {
    value: () => fmtJ(Number(years[wy.get()]), wm.get() + 1, wd.get() + 1),
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

/* Hour on the LEFT, minute on the RIGHT. Minutes go 00 … 60 and the column
   loops, so scrolling up from 00 lands on 60 instead of dying at the top. */
function makeClockWheel(host, defH, defM) {
  const hh = [];
  for (let i = 0; i < 24; i++) hh.push(pad2(i));
  const mm = minuteItems();
  const wh = wheelColumn(hh, defH || 0, null, { loop: true });
  const wm = wheelColumn(mm, minuteIndex(defM), null, { loop: true });
  wheelGroup(host, [wh, wm], ['ساعت', 'دقیقه'], true);
  return { value: () => hh[wh.get()] + ':' + mm[wm.get()] };
}

function makeDurWheel(host, defH, defM) {
  const hh = [];
  for (let i = 0; i <= 14; i++) hh.push(String(i));
  const mm = minuteItems();
  const wh = wheelColumn(hh, defH || 0, null, { loop: true });
  const wm = wheelColumn(mm, minuteIndex(defM), null, { loop: true });
  wheelGroup(host, [wh, wm], ['ساعت', 'دقیقه'], true);
  return {
    minutes: () => wh.get() * 60 + Number(mm[wm.get()]),
    hm: () => {
      const total = wh.get() * 60 + Number(mm[wm.get()]);
      return Math.floor(total / 60) + ':' + pad2(total % 60);
    },
    setMinutes: m => {
      const n = Number(m) || 0;
      wh.set(Math.floor(n / 60), true);
      wm.set(minuteIndex(n % 60), true);
    },
    reset: () => { wh.set(0); wm.set(0); }
  };
}

/* ═════════════════════════════ 4. STORAGE ═══════════════════════════════════ */

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

const getAll = n => store(n, 'readonly').then(s => new Promise((res, rej) => {
  const r = s.getAll(); r.onsuccess = () => res(r.result || []); r.onerror = () => rej(r.error);
}));

const clearStore = n => store(n, 'readwrite').then(s => new Promise((res, rej) => {
  const r = s.clear(); r.onsuccess = () => res(); r.onerror = () => rej(r.error);
}));

/* Settings live in localStorage, which iOS keeps for an installed home-screen
   app and which survives even if IndexedDB is evicted. That is why the URL and
   the key stopped sticking on the phone. */
const cfgGet = k => { try { return localStorage.getItem('dl_' + k) || ''; } catch (e) { return ''; } };
const cfgSet = (k, v) => { try { localStorage.setItem('dl_' + k, v); } catch (e) {} };

/* ═════════════════════════════ 5. SMALL HELPERS ═════════════════════════════ */

const $ = id => document.getElementById(id);
const uid = () => Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
const num = v => (v === '' || v == null || isNaN(Number(v))) ? '' : Number(v);
const vibrate = ms => { if (navigator.vibrate) navigator.vibrate(ms); };

function toast(msg, isErr) {
  const t = $('toast');
  t.textContent = msg;
  t.className = 'show' + (isErr ? ' err' : '');
  clearTimeout(t._h);
  t._h = setTimeout(() => { t.className = ''; }, 2100);
}

/* ═════════════════════════════ 6. SESSION FORM ══════════════════════════════ */

let sDate = null, dyn = {}, layers = {}, activePart = 0;

const currentCode = () => CODES.find(c => c.code === $('s_code').value) || codesForPart(activePart)[0];
const codesForPart = p => CODES.filter(c => (c.from || 0) <= p);

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
    fillCodes();
    vibrate(8);
  }));
  paint();
}

function fillCodes() {
  const list = codesForPart(activePart);
  const cats = [...new Set(list.map(c => c.cat))];
  const keep = $('s_code').value;
  $('s_code').innerHTML = cats.map(cat =>
    `<optgroup label="${cat}">` +
    list.filter(x => x.cat === cat).map(x => `<option value="${x.code}">${x.label}</option>`).join('') +
    `</optgroup>`).join('');
  if (keep && list.some(c => c.code === keep)) $('s_code').value = keep;
  buildDynamic();
}

function buildCodeSelects() {
  buildParts();
  $('s_code').addEventListener('change', buildDynamic);
  fillCodes();
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

/** Throws away the old inputs and builds only the ones this activity needs. */
function buildDynamic() {
  const c = currentCode();
  const d = c.def || {};
  const host = $('dynFields');

  WHEELS.forEach(w => { if (!w.el.isConnected) w.destroy(); });

  host.innerHTML = '';
  dyn = {};

  if (c.metric === 'dur') {
    dyn.dur = makeDurWheel(addField(host, 'مدت'), d.h || 0, d.m || 0);
    quickChips(host, [10,15,20,25,30,40,45,60,90], m => dyn.dur.setMinutes(m));
  }

  if (c.metric === 'sec') {
    const box = addField(host, 'ثانیه — حداقل ' + MIN_REACT_SEC);
    box.innerHTML = `<input id="f_sec" class="ltr" type="number" inputmode="numeric" min="${MIN_REACT_SEC}" value="${d.n || MIN_REACT_SEC}"/>`;
    quickChips(box, [2,3,5,10,20,30,60], v => { $('f_sec').value = v; });
  }

  if (c.metric === 'reps') {
    const box = addField(host, 'تعداد × دقیقهٔ هر بار');
    box.innerHTML =
      '<div class="grid2">' +
      `<input id="f_reps"   class="ltr" type="number" inputmode="numeric" min="1" value="${d.r  || 1}"/>` +
      `<input id="f_perrep" class="ltr" type="number" inputmode="numeric" min="1" value="${d.pr || 5}"/>` +
      '</div>';
  }

  if (c.kind) {
    const box = addField(host, 'تهیه یا خوردن');
    box.innerHTML =
      '<div class="seg">' +
      '<input type="radio" name="f_kind" id="f_kind_p" value="تهیه"/><label for="f_kind_p">تهیه</label>' +
      '<input type="radio" name="f_kind" id="f_kind_e" value="خوردن" checked/><label for="f_kind_e">خوردن</label>' +
      '</div>';
  }

  if (c.metric === 'accum') {
    const box = addField(host, 'چند تا به جمع امروز اضافه شود');
    box.innerHTML =
      `<div class="accum"><span>امروز تا الان: <b id="accumNow">…</b></span>` +
      `<button type="button" class="plus" id="btnPlus">+۱</button></div>` +
      `<input id="f_count" class="ltr" type="number" inputmode="numeric" min="1" value="${d.n || 1}"/>`;
    $('btnPlus').addEventListener('click', () => {
      $('f_count').value = (Number($('f_count').value) || 0) + 1;
      vibrate(8);
    });
    quickChips(box, [1,2,3,5,8,10], v => { $('f_count').value = v; });
    paintAccum(c.code);
  }

  if (c.metric === 'tick') {
    const box = addField(host, 'یک بار انجام شد');
    box.innerHTML = `<div class="accum"><span>امروز تا الان: <b id="accumNow">…</b></span><span>ذخیره = یک بار</span></div>`;
    paintAccum(c.code);
  }
}

async function paintAccum(code) {
  const el = $('accumNow');
  if (!el) return;
  const n = await todaySum(code);
  el.textContent = n;
  dyn.accumNow = n;
}

async function todaySum(code) {
  const rows = await getAll('sessions');
  const day = sDate ? sDate.value() : '';
  return rows.filter(r => r.dateShamsi === day && r.code === code)
             .reduce((a, r) => a + (Number(r.count) || 1), 0);
}

function buildLayers() {
  const host = $('sLayers');
  host.innerHTML = '';
  layers = {};
  LAYERS.forEach(([id, label, h, m]) => {
    const cell = document.createElement('div');
    cell.className = 'cell';
    host.appendChild(cell);
    layers[id] = makeDurWheel(addField(cell, label), h, m);
  });
}

function quickChips(parent, values, cb) {
  const d = document.createElement('div');
  d.className = 'chips';
  d.innerHTML = values.map(v => `<button type="button" data-v="${v}">${v}</button>`).join('');
  d.querySelectorAll('button').forEach(b =>
    b.addEventListener('click', () => { cb(Number(b.dataset.v)); vibrate(8); }));
  parent.appendChild(d);
}

function collectSession() {
  const c = currentCode();
  const rec = {
    uid: uid(),
    createdAt: new Date().toISOString(),
    dateShamsi: sDate.value(),
    part: PARTS[activePart].label,
    category: c.cat,
    code: c.code,
    metric: c.metric,
    minutes:'', hm:'', reactSec:'', count:'', reps:'', perRep:'', kind:'',
    moodMin:'', moodHM:'', bighMin:'', bighHM:'', tabavMin:'', tabavHM:'',
    feshMin:'', feshHM:'', dardMin:'', dardHM:'', zajrMin:'', zajrHM:'',
    note: $('s_note').value.trim(),
    synced: 0
  };

  if (c.metric === 'dur') {
    rec.minutes = dyn.dur.minutes();
    rec.hm = dyn.dur.hm();
  }
  if (c.metric === 'sec') {
    rec.reactSec = num($('f_sec').value);
    if (rec.reactSec === '' || rec.reactSec < MIN_REACT_SEC) {
      toast('تأخیر واکنش حداقل ' + MIN_REACT_SEC + ' ثانیه', true);
      return null;
    }
  }
  if (c.metric === 'reps') {
    rec.reps   = num($('f_reps').value);
    rec.perRep = num($('f_perrep').value);
    if (rec.reps !== '' && rec.perRep !== '') {
      rec.minutes = rec.reps * rec.perRep;
      rec.hm = fmtHM(rec.minutes);
    }
  }
  if (c.metric === 'accum') {
    rec.count = num($('f_count').value) || 1;
  }
  if (c.metric === 'tick') {
    rec.count = 1;
  }
  if (c.kind) rec.kind = radioText('f_kind') || 'خوردن';

  LAYERS.forEach(([id]) => {
    const w = layers[id];
    if (!w) return;
    const m = w.minutes();
    if (m > 0) {
      rec[id + 'Min'] = m;
      rec[id + 'HM']  = w.hm();
    }
  });

  const filled = [rec.minutes, rec.count, rec.reactSec].some(v => v !== '' && v !== 0);
  if (!filled) { toast('مقدار خالی است', true); return null; }
  return rec;
}

/* ═════════════════════════════ 7. META FORM ═════════════════════════════════ */

let mDate = null, mBid = null, mOpfa = null;

function buildMeta() {
  mDate = makeDateWheel($('mDate'));
  mBid  = makeClockWheel($('mBid'), DEFAULT_BID_H, DEFAULT_BID_M);
  mOpfa = makeDurWheel($('mOpfa'), 4, 0);

  /* Each question is pre-answered with its good outcome, so a normal day
     needs no taps at all and you only touch the exceptions. */
  $('metaBools').innerHTML = META_BOOLS.map(([id, label, pol]) => {
    const neg    = pol === 'neg';
    const yesCls = neg ? ' class="no"' : '';
    const noCls  = neg ? '' : ' class="no"';
    const yesChk = neg ? '' : ' checked';
    const noChk  = neg ? ' checked' : '';
    return `
    <label class="lb">${label}</label>
    <div class="seg">
      <input type="radio" name="mb_${id}" id="mb_${id}_y" value="1"${yesCls}${yesChk}/><label for="mb_${id}_y">آره</label>
      <input type="radio" name="mb_${id}" id="mb_${id}_n" value="0"${noCls}${noChk}/><label for="mb_${id}_n">نه</label>
    </div>`;
  }).join('');
}

function radioEl(name) {
  return document.querySelector(`input[name="${name}"]:checked`);
}
function radioVal(name) {
  const el = radioEl(name);
  return el ? Number(el.value) : '';
}
function radioText(name) {
  const el = radioEl(name);
  return el ? el.value : '';
}

function collectMeta() {
  const o = {
    uid: uid(),
    createdAt: new Date().toISOString(),
    dateShamsi: mDate.value(),
    bid: mBid.value(),
    openfastMin: mOpfa.minutes(), openfastHM: mOpfa.hm(),
    note: $('m_note').value.trim(),
    synced: 0
  };
  META_BOOLS.forEach(([id]) => { o[id] = radioVal('mb_' + id); });
  return o;
}

/* ═════════════════════════════ 8. TABS AND SAVE ═════════════════════════════ */

let activeTab = 'session';

function showTab(name) {
  activeTab = name;
  $('paneSession').classList.toggle('hide', name !== 'session');
  $('paneMeta').classList.toggle('hide',    name !== 'meta');
  $('paneData').classList.toggle('hide',    name !== 'data');
  $('tabSession').classList.toggle('active', name === 'session');
  $('tabMeta').classList.toggle('active',    name === 'meta');
  $('tabData').classList.toggle('active',    name === 'data');
  $('btnSave').disabled  = (name === 'data');
  $('btnAgain').disabled = (name !== 'session');
  settleWheels();                                // panes that were hidden lost their scroll
  if (name === 'data') refreshData();
}

async function doSave(again) {
  if (activeTab === 'session') {
    const rec = collectSession();
    if (!rec) return;
    await put('sessions', rec);
    vibrate(25);
    const extra = rec.metric === 'accum' || rec.metric === 'tick'
      ? ' · جمع امروز ' + ((dyn.accumNow || 0) + (Number(rec.count) || 1))
      : '';
    toast('ثبت شد · ' + (rec.hm || rec.count || rec.reactSec) + extra);
    $('s_note').value = '';
    buildDynamic();
  } else if (activeTab === 'meta') {
    await put('meta', collectMeta());
    vibrate(25);
    toast('متای روز ثبت شد');
  }
  updateQueueBadge();
  trySync();
}

/* ═════════════════════════════ 9. SYNC ══════════════════════════════════════ */

async function trySync(loud) {
  const url = cfgGet('url'), secret = cfgGet('secret');
  if (!url) { if (loud) toast('آدرس وب‌اپ خالی است', true); return; }
  if (!navigator.onLine) { if (loud) toast('آفلاین هستی', true); return; }

  const s = (await getAll('sessions')).filter(r => !r.synced);
  const m = (await getAll('meta')).filter(r => !r.synced);
  if (!s.length && !m.length) { if (loud) toast('چیزی برای ارسال نیست'); return; }

  try {
    if (s.length) await pushBatch(url, secret, 'session', s, SESSION_FIELDS);
    if (m.length) await pushBatch(url, secret, 'meta',    m, META_FIELDS);
    toast('همگام شد');
  } catch (e) {
    toast('ارسال نشد، در صف ماند', true);
  }
  updateQueueBadge();
  if (activeTab === 'data') refreshData();
}

async function pushBatch(url, secret, type, rows, fields) {
  const payload = { secret, type, fields, rows: rows.map(r => fields.map(f => r[f] === undefined ? '' : r[f])) };
  /* text/plain keeps this a "simple request", so the browser skips the CORS
     preflight that Apps Script is unable to answer. */
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  });
  const outp = await res.json();
  if (!outp.ok) throw new Error(outp.error || 'server');
  const st = (type === 'meta') ? 'meta' : 'sessions';
  for (const r of rows) { r.synced = 1; await put(st, r); }
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

/* ═════════════════════════════ 10. DATA PANE ════════════════════════════════ */

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
    `امروز به شمسی: <b>${today}</b><br/>` +
    `آدرس فعلی: <span class="ltr">${location.origin + location.pathname}</span>`;

  const byCat = {};
  let totalMin = 0;
  let checkins = 0, rules = 0;
  rows.forEach(r => {
    const mi = Number(r.minutes) || 0;
    totalMin += mi;
    if (r.code === 'checkin') checkins += Number(r.count) || 1;
    if (r.code === 'ghanoon') rules += Number(r.count) || 1;
    if (!byCat[r.category]) byCat[r.category] = { min:0, n:0 };
    byCat[r.category].min += mi;
    byCat[r.category].n++;
  });

  let html = `<b>${today}</b> — جمع: <b>${fmtHM(totalMin)}</b> · نوبت: <b>${rows.length}</b>` +
             ` · چک‌این: <b>${checkins}</b> · قانون: <b>${rules}</b>`;
  const cats = Object.keys(byCat);
  if (cats.length) {
    html += '<div style="margin-top:8px">' +
      cats.map(c => `${c}: <b>${fmtHM(byCat[c].min)}</b> · ${byCat[c].n} نوبت`).join('<br/>') +
      '</div>';
  }
  $('todaySum').innerHTML = html;

  document.querySelector('#tblRecent tbody').innerHTML = s.slice(-20).reverse().map(r => `
    <tr>
      <td class="ltr">${r.dateShamsi}</td>
      <td>${r.part || ''}</td>
      <td>${(CODES.find(c => c.code === r.code) || {}).label || r.code}</td>
      <td class="ltr">${r.hm || r.count || (r.reactSec !== '' ? r.reactSec + 's' : '')}</td>
      <td><span class="tag ${r.synced ? 'sent' : 'pending'}">${r.synced ? 'رفت' : 'صف'}</span></td>
    </tr>`).join('');
}

/* ═════════════════════════════ 11. CSV EXPORT ═══════════════════════════════ */

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

/* ═════════════════════════════ 12. VERSION / CACHE ══════════════════════════ */

/* Append ?diag=1 (or ?diag=meta) to dump every wheel's geometry into the page.
   Worth keeping: wheel positioning depends on layout timing, and reading the
   real numbers is the only way to tell a wrong default apart from a wheel
   that never got the chance to position itself. */
function diagDump() {
  const lines = [];
  document.querySelectorAll('.wcol').forEach((col, i) => {
    const sc  = col.querySelector('.sc');
    const its = col.querySelectorAll('.it');
    let sel = -1;
    its.forEach((n, k) => { if (n.classList.contains('sel')) sel = k; });
    lines.push(
      `col${i} n=${its.length} top=${sc.scrollTop} scrollH=${sc.scrollHeight} ` +
      `clientH=${sc.clientHeight} itH=${its[0] ? its[0].offsetHeight : '?'} ` +
      `sel=${sel} offParent=${col.offsetParent ? 'yes' : 'NULL'} ` +
      `snap=${getComputedStyle(sc).scrollSnapType}`
    );
  });
  lines.push('sDate.value=' + (sDate ? sDate.value() : 'n/a'));
  lines.push('dyn.dur='     + (dyn.dur ? dyn.dur.hm() : 'n/a'));
  lines.push('todayJ='      + todayJ().join('/'));
  const pre = document.createElement('pre');
  pre.id = 'diag';
  pre.textContent = lines.join('\n');
  document.body.insertBefore(pre, document.body.firstChild);
}

/** Nukes every cache and the service worker, then reloads from the network. */
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

/* ═════════════════════════════ 13. BOOT ═════════════════════════════════════ */

async function boot() {
  $('verPill').textContent = APP_VERSION;
  $('verPill').className = 'pill on';

  /* Ask the browser not to evict our data. On iOS this is what keeps the
     settings and the log alive between visits. */
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().catch(() => {});
  }

  sDate = makeDateWheel($('sDate'));
  buildCodeSelects();
  buildLayers();
  buildMeta();

  $('cfg_url').value    = cfgGet('url');
  $('cfg_secret').value = cfgGet('secret');

  $('tabSession').addEventListener('click', () => showTab('session'));
  $('tabMeta').addEventListener('click',    () => showTab('meta'));
  $('tabData').addEventListener('click',    () => showTab('data'));

  $('btnSave').addEventListener('click',  () => doSave(false));
  $('btnAgain').addEventListener('click', () => doSave(true));

  $('btnSaveCfg').addEventListener('click', () => {
    cfgSet('url', $('cfg_url').value.trim());
    cfgSet('secret', $('cfg_secret').value.trim());
    toast('ذخیره شد و دیگر پرسیده نمی‌شود');
  });
  $('btnSyncNow').addEventListener('click', () => trySync(true));
  $('btnCsvS').addEventListener('click', () => exportCsv('sessions', SESSION_FIELDS, 'sessions'));
  $('btnCsvM').addEventListener('click', () => exportCsv('meta', META_FIELDS, 'meta'));
  $('btnShare').addEventListener('click', shareCsv);
  $('btnHardReload').addEventListener('click', hardReload);
  $('btnWipe').addEventListener('click', async () => {
    if (!confirm('همه دادهٔ این دستگاه پاک شود؟')) return;
    await clearStore('sessions');
    await clearStore('meta');
    refreshData();
    updateQueueBadge();
    toast('پاک شد');
  });

  window.addEventListener('online',  () => { updateNetPill(); trySync(); });
  window.addEventListener('offline', updateNetPill);
  window.addEventListener('pageshow', settleWheels);
  window.addEventListener('resize',  settleWheels);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      sDate.today();                              // a new day should open on the new day
      settleWheels();
    }
  });

  updateNetPill();
  updateQueueBadge();
  trySync();

  if (location.search.indexOf('diag=meta') >= 0) {
    setTimeout(() => showTab('meta'), 1200);
    setTimeout(diagDump, 2600);
  } else if (location.search.indexOf('diag=1') >= 0) {
    setTimeout(diagDump, 2000);
  }

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').then(reg => {
      reg.update();
      /* When a newer worker takes over, reload once so the page is running
         the same build as the worker that is serving it. */
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
