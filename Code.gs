/**
 * DailyLog — Google Apps Script Web App
 * Paste this in  script.google.com  →  Deploy → New deployment → Web app
 *   Execute as        : Me
 *   Who has access    : Anyone
 * Copy the /exec URL into the app's settings tab.
 *
 * It is idempotent: re-sending the same uid never duplicates a row,
 * so the offline queue can retry safely.
 */

var SHEET_ID = '16esUqbemVzdVpTlRnmmsvHPs5cvmz_64RiSe5rYNoT8';   // from the sheet URL, between /d/ and /edit
var SECRET   = 'mmkdjdhdhssk9876dyhjsloskjhsh98ydgbnsjkdx';  // must match the app's settings

var TAB = { session: 'Sessions', meta: 'DailyMeta' };

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);

    if (body.secret !== SECRET) {
      return out({ ok: false, error: 'auth' });
    }

    var tabName = TAB[body.type];
    if (!tabName) return out({ ok: false, error: 'bad type' });

    var fields = body.fields || [];
    var rows   = body.rows   || [];
    if (!fields.length) return out({ ok: false, error: 'no fields' });

    var lock = LockService.getScriptLock();
    lock.waitLock(20000);                 // two phones syncing at once must not interleave
    try {
      var sh = getSheet(tabName, fields);
      var seen = existingUids(sh);
      var fresh = rows.filter(function (r) { return seen.indexOf(String(r[0])) === -1; });

      if (fresh.length) {
        sh.getRange(sh.getLastRow() + 1, 1, fresh.length, fields.length).setValues(fresh);
      }
      return out({ ok: true, inserted: fresh.length, skipped: rows.length - fresh.length });
    } finally {
      lock.releaseLock();
    }

  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}

function doGet() {
  return out({ ok: true, alive: true });
}

function getSheet(name, fields) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
  }
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, fields.length).setValues([fields]);
    sh.setFrozenRows(1);
  }
  return sh;
}

/** uid is always column A. */
function existingUids(sh) {
  var last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, 1).getValues().map(function (r) { return String(r[0]); });
}

function out(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
