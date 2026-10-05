/**
 * Alkimi Austin LPs: lead webhook -> Google Sheets
 *
 * How to set up (5 min):
 * 1. Create a Google Sheet for the leads (e.g. "Alkimi Austin - Leads LPs").
 * 2. In the sheet: Extensions > Apps Script. Paste this whole file and save.
 * 3. Deploy > New deployment > type "Web app".
 *      Execute as: Me
 *      Who has access: Anyone
 *    Click Deploy, authorize, and copy the Web app URL (ends with /exec).
 * 4. Paste that URL in WEBHOOK_URL (build.py) or straight into data-webhook="" on the <form> of
 *    kids/index.html and women/index.html.
 * 5. Test: submit the form on the LP and check the "Leads" tab.
 *
 * Each submission becomes one row. The "status" and "notes" columns are left blank
 * for the Alkimi team to follow up (called, scheduled, showed up, enrolled...).
 */

var SHEET_NAME = 'Leads';
var COLUMNS = [
  'submitted_at', 'lp', 'name', 'email', 'phone', 'child_name', 'child_age', 'experience',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'gclid', 'gbraid', 'wbraid', 'fbclid', 'landing_page', 'referrer',
  'status', 'notes'
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(COLUMNS);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
    }
    var p = (e && e.parameter) || {};
    var row = COLUMNS.map(function (c) {
      var v = p[c] || '';
      // Keep phone numbers and IDs as text (no auto-format, no formula injection)
      return /^[=+\-@]/.test(v) ? "'" + v : v;
    });
    sheet.appendRow(row);
    return ContentService.createTextOutput('ok');
  } finally {
    lock.releaseLock();
  }
}
