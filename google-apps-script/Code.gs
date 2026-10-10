/**
 * La Methode — quiz email collector.
 * Paste into Extensions → Apps Script of the target Google Sheet, then deploy
 * as a Web app (Execute as: Me, Who has access: Anyone).
 * Setup guide: google-apps-script/README.md
 *
 * @OnlyCurrentDoc  — only asks for access to the Sheet this script belongs to.
 */

const SHEET_NAME = "Responses";

/** Run once from the editor (Run ▶ authorize) to grant permissions before deploying. */
function authorize() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error("Script chưa gắn với Google Sheet nào. Hãy mở Sheet → Tiện ích mở rộng → Apps Script và dán code vào đó.");
  }
  const secret = PropertiesService.getScriptProperties().getProperty("SECRET");
  Logger.log("Sheet: " + ss.getName() + " | SECRET đã đặt: " + (secret ? "có" : "CHƯA"));
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const body = JSON.parse(e.postData.contents);
    const expected = PropertiesService.getScriptProperties().getProperty("SECRET");
    if (!expected || body.secret !== expected) {
      return json({ ok: false, error: "unauthorized" });
    }
    if (!Array.isArray(body.row) || !Array.isArray(body.headers)) {
      return json({ ok: false, error: "bad_request" });
    }

    lock.waitLock(10000); // serialize concurrent submissions
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return json({ ok: false, error: "script_not_bound_to_sheet" });
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(body.headers);
      sheet.getRange(1, 1, 1, body.headers.length).setFontWeight("bold").setBackground("#f8e3d9");
      sheet.setFrozenRows(1);
    }
    sheet.appendRow(body.row);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
