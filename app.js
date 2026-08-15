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
const APP_VERSION = 'v5 · wheels';

/* ═════════════════════════════ 1. ACTIVITY TABLE ═════════════════════════════
   Every activity declares how it is measured, so the form can show only the
   input that activity actually needs.

     metric 'dur'   → duration wheel (hours + minutes)   fills minutes + hm
     metric 'clock' → time-of-day wheel                  fills startClock
     metric 'sec'   → seconds number                     fills reactSec
     metric 'count' → plain count                        fills count
     metric 'reps'  → N times x M minutes                fills reps, perRep, minutes

     eff  : true → also ask for effort units (your own 30 / 50 scale)
     qual : true → also ask quality 1..5

   def : where every wheel and box opens before you touch it. Typing should
         only ever be a correction, never data entry from zero.
           h, m  → duration wheel
           ch, cm→ clock wheel
           eff   → effort box
           q     → quality 1..5
           n     → count / seconds box
           r, pr → reps x minutes
   ========================================================================== */

const CODES = [
  { cat:'کار و آی‌تی',    code:'itpr',        label:'ITpr',                  metric:'dur',   eff:true, qual:true, def:{h:2,m:40,eff:40,q:3} },
  { cat:'کار و آی‌تی',    code:'azkesh',      label:'azkesh',                metric:'dur',   eff:true,            def:{h:1,m:0, eff:20} },
  { cat:'کار و آی‌تی',    code:'do',          label:'Do',                    metric:'dur',                        def:{h:0,m:30} },
  { cat:'کار و آی‌تی',    code:'sumtakhmoj',  label:'sumtakhmojmotn',        metric:'dur',                        def:{h:0,m:20} },

  { cat:'تخصیص و تمرکز', code:'takhkho',     label:'Takhkho',               metric:'dur',   eff:true,            def:{h:0,m:30, eff:30} },
  { cat:'تخصیص و تمرکز', code:'takhshose',   label:'Takhshose',             metric:'dur',   eff:true,            def:{h:0,m:40, eff:30} },
  { cat:'تخصیص و تمرکز', code:'arasmotakh',  label:'arasmotakhshose',       metric:'dur',                        def:{h:0,m:30} },
  { cat:'تخصیص و تمرکز', code:'arasmor',     label:'arasmor',               metric:'dur',                        def:{h:0,m:25} },
  { cat:'تخصیص و تمرکز', code:'rout',        label:'rout',                  metric:'dur',                        def:{h:0,m:40} },
  { cat:'تخصیص و تمرکز', code:'mintakhir',   label:'تأخیر واکنش (ثانیه)',    metric:'sec',                        def:{n:2} },
  { cat:'تخصیص و تمرکز', code:'checkin',     label:'چک‌این (تعداد)',         metric:'count',                      def:{n:3} },

  { cat:'بدن و سلامت',   code:'openfast',    label:'openfast (ساعت دقیق)',   metric:'clock',                      def:{ch:15,cm:0} },
  { cat:'بدن و سلامت',   code:'ab',          label:'ab',                    metric:'dur',                        def:{h:0,m:20} },
  { cat:'بدن و سلامت',   code:'dand',        label:'dand (تکرار × دقیقه)',   metric:'reps',                       def:{r:3,pr:2} },
  { cat:'بدن و سلامت',   code:'drazmayesh',  label:'dr / azmayesh',         metric:'dur',                        def:{h:2,m:30} },
  { cat:'بدن و سلامت',   code:'salad',       label:'salad',                 metric:'dur',                        def:{h:0,m:20} },
  { cat:'بدن و سلامت',   code:'ghorsqat',    label:'ghors / qat (تعداد)',    metric:'count',                      def:{n:1} },
  { cat:'بدن و سلامت',   code:'shosmort',    label:'ShosMort',              metric:'dur',                        def:{h:0,m:20} },

  { cat:'خانه و شخصی',   code:'otu',         label:'Otu',                   metric:'dur',                        def:{h:0,m:20} },
  { cat:'خانه و شخصی',   code:'moshv',       label:'Moshv',                 metric:'dur',                        def:{h:0,m:20} },
  { cat:'خانه و شخصی',   code:'ket',         label:'Ket',                   metric:'dur',                        def:{h:0,m:15} },
  { cat:'خانه و شخصی',   code:'sabtturkela', label:'Sabtturkela',           metric:'dur',                        def:{h:0,m:15} },

  { cat:'مالی و اداری',  code:'bargozbime',  label:'bime / mali / kharid',  metric:'dur',                        def:{h:0,m:25} },
  { cat:'مالی و اداری',  code:'banki',       label:'banki / sarmayegozari', metric:'dur',                        def:{h:0,m:45} },

  { cat:'یادگیری',       code:'reswch',      label:'reswch',                metric:'dur',   eff:true, qual:true, def:{h:1,m:50,eff:30,q:3} }
];

/* id, label, polarity. polarity 'neg' means "نه" is the good answer and
   therefore the green one. */
const META_BOOLS = [
  ['nap',           'چرت داشتم',                        'neg'],
  ['planTomorrow',  'برنامه فردا ایجاد شده',             'pos'],
  ['ruleFollowed',  'قانون فرای من رعایت شد',            'pos'],
  ['noSugar',       'هیچ قند و کرب و شیرین‌کننده نخوردم', 'pos'],
  ['sachetProtein', 'ساشه پروتئین بعد از ساعت ۳',        'pos'],
];

/* Column order in the sheet. Keep uid first: the script matches on it. */
const SESSION_FIELDS = ['uid','createdAt','dateShamsi','category','code','metric',
                        'minutes','hm','effort','quality','reactSec','count',
                        'reps','perRep','startClock','note'];

const META_FIELDS = ['uid','createdAt','dateShamsi','bid','checkin1h',
                     'moodToFlowMin','moodToFlowHM','bigharariMin','bigharariHM',
                     'bandShadidMin','bandShadidHM','openfastMin','openfastHM',
                     ...META_BOOLS.map(b => b[0]), 'note'];

const DEFAULT_BID_H = 3;      // ساعت پیش‌فرض بیداری
const DEFAULT_BID_M = 30;

/* Opening values for the daily meta wheels: [hours, minutes] */
const META_DEF = {
  mood:    [5, 10],
  bigh:    [3, 15],
  band:    [4, 0],
  opfa:    [4, 0],
  checkin: 3
};

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

function wheelColumn(items, initial, onChange) {
  const col = document.createElement('div');
  col.className = 'wcol';

  const sc = document.createElement('div');
  sc.className = 'sc';
  sc.innerHTML = items.map(t => `<div class="it">${t}</div>`).join('');

  const band = document.createElement('div');
  band.className = 'band';

  col.appendChild(sc);
  col.appendChild(band);

  let idx   = Math.max(0, Math.min(items.length - 1, initial | 0));
  let quiet = false;   // true while we are the ones moving the wheel

  const paint = i => sc.querySelectorAll('.it').forEach((n, k) => n.classList.toggle('sel', k === i));

  /* Mandatory snapping re-snaps the container on every layout pass, and it
     does that after our assignment, so the scrollTop we just wrote gets
     thrown away and the wheel opens on item zero. Switching snapping off for
     the assignment and back on straight after makes the position stick. */
  function place(target) {
    const prev = sc.style.scrollSnapType;
    sc.style.scrollSnapType = 'none';
    sc.scrollTop = target;
    void sc.offsetHeight;                                  // force the reflow
    sc.style.scrollSnapType = prev || '';
  }

  /** Puts the column back where it belongs. Cheap, safe to call often. */
  function apply() {
    if (!col.isConnected || col.offsetParent === null) return;
    quiet = true;
    if (Math.abs(sc.scrollTop - idx * ITEM_H) > 2) place(idx * ITEM_H);
    paint(idx);
    setTimeout(() => { quiet = false; }, 80);
  }

  function set(i, smooth) {
    idx = Math.max(0, Math.min(items.length - 1, i | 0));
    quiet = true;
    if (smooth) sc.scrollTo({ top: idx * ITEM_H, behavior: 'smooth' });
    else        place(idx * ITEM_H);
    paint(idx);
    setTimeout(() => { quiet = false; }, smooth ? 400 : 80);
  }

  let t = null;
  sc.addEventListener('scroll', () => {
    if (quiet) return;                                     // our own move, not the finger
    if (col.offsetParent === null) return;                 // ghost scroll while hidden
    const live = Math.round(sc.scrollTop / ITEM_H);
    if (live !== idx && live >= 0 && live < items.length) { idx = live; paint(idx); }
    clearTimeout(t);
    t = setTimeout(() => {
      sc.scrollTo({ top: idx * ITEM_H, behavior: 'smooth' });
      if (onChange) onChange(idx);
    }, 110);
  }, { passive: true });

  const api = { el: col, get: () => idx, set, apply,
                destroy: () => WHEELS.delete(api) };
  WHEELS.add(api);
  return api;
}

function wheelGroup(host, cols, captions) {
  host.innerHTML = '';
  const row = document.createElement('div');
  row.className = 'wheels';
  cols.forEach(c => row.appendChild(c.el));
  host.appendChild(row);
  if (captions) {
    const cap = document.createElement('div');
    cap.className = 'wcap';
    cap.innerHTML = captions.map(c => `<span>${c}</span>`).join('');
    host.appendChild(cap);
  }
  /* Three passes on purpose. The first frame is often before the fonts and
     the final layout settle, and on iOS the snap engine gets one more say
     after that. Re-applying is idempotent, so this is free insurance. */
  const settle = () => cols.forEach(c => c.apply());
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
    const nd = wheelColumn(items, Math.min(keep, items.length - 1));
    nd.count = items.length;
    wd.destroy();
    wd.el.replaceWith(nd.el);
    wd = nd;
    requestAnimationFrame(() => nd.apply());
    setTimeout(() => nd.apply(), 60);
  }

  wy = wheelColumn(years, years.indexOf(String(cy)), rebuildDays);
  wm = wheelColumn(J_MONTHS, cm - 1, rebuildDays);
  wd = wheelColumn(dayItems(cy, cm), cd - 1);
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

/* --- time of day: hour / minute in steps of 5 --- */
function makeClockWheel(host, defH, defM) {
  const hh = [], mm = [];
  for (let i = 0; i < 24; i++) hh.push(pad2(i));
  for (let i = 0; i < 60; i += 5) mm.push(pad2(i));
  const wh = wheelColumn(hh, defH || 0);
  const wm = wheelColumn(mm, Math.round((defM || 0) / 5));
  wheelGroup(host, [wh, wm], ['ساعت', 'دقیقه']);
  return { value: () => hh[wh.get()] + ':' + mm[wm.get()] };
}

/* --- duration: hours / minutes in steps of 5, returned as total minutes --- */
function makeDurWheel(host, defH, defM) {
  const hh = [], mm = [];
  for (let i = 0; i <= 14; i++) hh.push(String(i));
  for (let i = 0; i < 60; i += 5) mm.push(pad2(i));
  const wh = wheelColumn(hh, defH || 0);
  const wm = wheelColumn(mm, Math.round((defM || 0) / 5));
  wheelGroup(host, [wh, wm], ['ساعت', 'دقیقه']);
  return {
    minutes: () => wh.get() * 60 + wm.get() * 5,
    hm: () => hh[wh.get()] + ':' + mm[wm.get()],
    setMinutes: m => { wh.set(Math.floor(m / 60), true); wm.set(Math.round((m % 60) / 5), true); },
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

let sDate = null, dyn = {};

const currentCode = () => CODES.find(c => c.code === $('s_code').value) || CODES[0];

function buildCodeSelects() {
  const cats = [...new Set(CODES.map(c => c.cat))];
  $('s_cat').innerHTML = '<option value="">همه</option>' + cats.map(c => `<option>${c}</option>`).join('');

  function fill() {
    const chosen = $('s_cat').value;
    const list = chosen ? [chosen] : cats;
    $('s_code').innerHTML = list.map(cat =>
      `<optgroup label="${cat}">` +
      CODES.filter(x => x.cat === cat).map(x => `<option value="${x.code}">${x.label}</option>`).join('') +
      `</optgroup>`).join('');
    buildDynamic();
  }
  $('s_cat').addEventListener('change', fill);
  $('s_code').addEventListener('change', buildDynamic);
  fill();
}

/** Throws away the old inputs and builds only the ones this activity needs. */
function buildDynamic() {
  const c = currentCode();
  const d = c.def || {};
  const host  = $('dynFields');
  const extra = $('extraFields');

  /* wheels inside the replaced markup must leave the registry */
  WHEELS.forEach(w => { if (!w.el.isConnected) w.destroy(); });

  host.innerHTML  = '';
  extra.innerHTML = '';
  dyn = {};

  const add = (parent, text) => {
    const l = document.createElement('label');
    l.className = 'lb';
    l.textContent = text;
    const box = document.createElement('div');
    parent.appendChild(l);
    parent.appendChild(box);
    return box;
  };

  if (c.metric === 'dur') {
    dyn.dur = makeDurWheel(add(host, 'مدت'), d.h || 0, d.m || 0);
    quickChips(host, [10,15,20,25,30,40,45,60,90], m => dyn.dur.setMinutes(m));
  }

  if (c.metric === 'clock') {
    dyn.clock = makeClockWheel(add(host, 'ساعت دقیق'), d.ch || 0, d.cm || 0);
  }

  if (c.metric === 'count') {
    const box = add(host, 'تعداد');
    box.innerHTML = `<input id="f_count" class="ltr" type="number" inputmode="numeric" min="0" value="${d.n || ''}"/>`;
    quickChips(box, [1,2,3,4,5,6,8,10], v => { $('f_count').value = v; });
  }

  if (c.metric === 'sec') {
    const box = add(host, 'ثانیه');
    box.innerHTML = `<input id="f_sec" class="ltr" type="number" inputmode="numeric" min="0" value="${d.n || ''}"/>`;
    quickChips(box, [1,2,3,5,10,20,30,60], v => { $('f_sec').value = v; });
  }

  if (c.metric === 'reps') {
    const box = add(host, 'تعداد × دقیقهٔ هر بار');
    box.innerHTML =
      '<div class="grid2">' +
      `<input id="f_reps"   class="ltr" type="number" inputmode="numeric" min="0" value="${d.r  || ''}"/>` +
      `<input id="f_perrep" class="ltr" type="number" inputmode="numeric" min="0" value="${d.pr || ''}"/>` +
      '</div>';
  }

  if (c.eff) {
    const box = add(host, 'تلاش (واحد خودت، نه ساعت)');
    box.innerHTML = `<input id="f_eff" class="ltr" type="number" inputmode="numeric" min="0" value="${d.eff || ''}"/>`;
    quickChips(box, [10,15,20,25,30,40,50], v => { $('f_eff').value = v; });
  }

  if (c.qual) {
    const box = add(host, 'کیفیت');
    box.innerHTML = '<div class="stars">' +
      [1,2,3,4,5].map(n => `<button type="button" data-q="${n}">${n}</button>`).join('') + '</div>';
    box.querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => {
      box.querySelectorAll('[data-q]').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      dyn.quality = Number(b.dataset.q);
      vibrate(8);
    }));
    if (d.q) {
      dyn.quality = d.q;
      const pre = box.querySelector(`[data-q="${d.q}"]`);
      if (pre) pre.classList.add('on');
    }
  }

  /* one optional extra, only a duration. no stray clock any more. */
  if (c.metric !== 'dur') {
    dyn.durExtra = makeDurWheel(add(extra, 'مدت (اختیاری)'));
  }
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
    category: c.cat,
    code: c.code,
    metric: c.metric,
    minutes:'', hm:'', effort:'', quality:'', reactSec:'',
    count:'', reps:'', perRep:'', startClock:'',
    note: $('s_note').value.trim(),
    synced: 0
  };

  if (c.metric === 'dur')   { rec.minutes = dyn.dur.minutes(); rec.hm = dyn.dur.hm(); }
  if (c.metric === 'clock') { rec.startClock = dyn.clock.value(); }
  if (c.metric === 'count') { rec.count    = num($('f_count').value); }
  if (c.metric === 'sec')   { rec.reactSec = num($('f_sec').value); }
  if (c.metric === 'reps') {
    rec.reps   = num($('f_reps').value);
    rec.perRep = num($('f_perrep').value);
    if (rec.reps !== '' && rec.perRep !== '') {
      rec.minutes = rec.reps * rec.perRep;
      rec.hm = fmtHM(rec.minutes);
    }
  }
  if (c.eff)  rec.effort  = num(($('f_eff') || {}).value);
  if (c.qual) rec.quality = dyn.quality || '';

  if (dyn.durExtra) {
    const m = dyn.durExtra.minutes();
    if (m > 0 && rec.minutes === '') { rec.minutes = m; rec.hm = dyn.durExtra.hm(); }
  }

  const filled = [rec.minutes, rec.count, rec.reactSec, rec.startClock].some(v => v !== '' && v !== 0);
  if (!filled) { toast('مقدار خالی است', true); return null; }
  return rec;
}

/* ═════════════════════════════ 7. META FORM ═════════════════════════════════ */

let mDate = null, mBid = null, mMood = null, mBigh = null, mBand = null, mOpfa = null;

function buildMeta() {
  mDate = makeDateWheel($('mDate'));
  mBid  = makeClockWheel($('mBid'), DEFAULT_BID_H, DEFAULT_BID_M);
  mMood = makeDurWheel($('mMood'), META_DEF.mood[0], META_DEF.mood[1]);
  mBigh = makeDurWheel($('mBigh'), META_DEF.bigh[0], META_DEF.bigh[1]);
  mBand = makeDurWheel($('mBand'), META_DEF.band[0], META_DEF.band[1]);
  mOpfa = makeDurWheel($('mOpfa'), META_DEF.opfa[0], META_DEF.opfa[1]);
  if (!$('m_checkin').value) $('m_checkin').value = META_DEF.checkin;

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

function radioVal(name) {
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? Number(el.value) : '';
}

function collectMeta() {
  const o = {
    uid: uid(),
    createdAt: new Date().toISOString(),
    dateShamsi: mDate.value(),
    bid: mBid.value(),
    checkin1h: num($('m_checkin').value),
    moodToFlowMin: mMood.minutes(), moodToFlowHM: mMood.hm(),
    bigharariMin:  mBigh.minutes(), bigharariHM:  mBigh.hm(),
    bandShadidMin: mBand.minutes(), bandShadidHM: mBand.hm(),
    openfastMin:   mOpfa.minutes(), openfastHM:   mOpfa.hm(),
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
  requestAnimationFrame(refreshWheels);          // panes that were hidden lost their scroll
  if (name === 'data') refreshData();
}

async function doSave(again) {
  if (activeTab === 'session') {
    const rec = collectSession();
    if (!rec) return;
    await put('sessions', rec);
    vibrate(25);
    toast('ثبت شد · ' + (rec.hm || rec.startClock || rec.count || rec.reactSec));
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
  let totalMin = 0, totalEff = 0;
  rows.forEach(r => {
    const mi = Number(r.minutes) || 0, ef = Number(r.effort) || 0;
    totalMin += mi; totalEff += ef;
    if (!byCat[r.category]) byCat[r.category] = { min:0, eff:0, n:0 };
    byCat[r.category].min += mi;
    byCat[r.category].eff += ef;
    byCat[r.category].n++;
  });

  let html = `<b>${today}</b> — جمع کل: <b>${fmtHM(totalMin)}</b> (${totalMin} دقیقه) · تلاش: <b>${totalEff}</b> · نوبت: <b>${rows.length}</b>`;
  const cats = Object.keys(byCat);
  if (cats.length) {
    html += '<div style="margin-top:8px">' +
      cats.map(c => `${c}: <b>${fmtHM(byCat[c].min)}</b> · تلاش ${byCat[c].eff} · ${byCat[c].n} نوبت`).join('<br/>') +
      '</div>';
  }
  $('todaySum').innerHTML = html;

  document.querySelector('#tblRecent tbody').innerHTML = s.slice(-20).reverse().map(r => `
    <tr>
      <td class="ltr">${r.dateShamsi}</td>
      <td>${(CODES.find(c => c.code === r.code) || {}).label || r.code}</td>
      <td class="ltr">${r.hm || r.startClock || r.count || (r.reactSec !== '' ? r.reactSec + 's' : '')}</td>
      <td class="ltr">${r.effort}</td>
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
  window.addEventListener('pageshow', () => requestAnimationFrame(refreshWheels));
  window.addEventListener('resize',  () => requestAnimationFrame(refreshWheels));
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      requestAnimationFrame(refreshWheels);
      sDate.today();                              // a new day should open on the new day
    }
  });

  updateNetPill();
  updateQueueBadge();
  trySync();

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
