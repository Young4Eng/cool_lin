import assert from "node:assert/strict";
import { test } from "node:test";
import { parseIngestPeriod, parseYmd } from "../src/ymd.js";

test("YYYYMMDD 8자리가 아니면 실패하고 추출 기간이 되지 않는다", () => {
  assert.equal(parseYmd("2026-08-28").ok, false);
  assert.equal(parseYmd("2026082").ok, false);
  assert.equal(parseYmd("202608288").ok, false);
  assert.equal(parseYmd("abcd0828").ok, false);
  assert.equal(parseYmd("").ok, false);
  const r = parseYmd("20260828");
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.ymd, "20260828");
});

test("달력에 없는 날짜는 거절한다", () => {
  assert.equal(parseYmd("20240229").ok, true); // 윤년
  assert.equal(parseYmd("20250229").ok, false);
  assert.equal(parseYmd("20261301").ok, false);
  assert.equal(parseYmd("20260001").ok, false);
  assert.equal(parseYmd("20260832").ok, false);
  assert.equal(parseYmd("20260431").ok, false);
});

test("기간이 비면 기본값(어제~오늘)으로 통과한다", () => {
  assert.deepEqual(parseIngestPeriod(undefined), { ok: true });
  assert.deepEqual(parseIngestPeriod({}), { ok: true });
  assert.deepEqual(parseIngestPeriod({ startDate: "", endDate: "" }), { ok: true });
});

test("시작·끝 중 하나만 있으면 추출하지 않는다", () => {
  const r = parseIngestPeriod({ startDate: "20260801", endDate: "" });
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.error, /시작 날짜와 끝 날짜/);
});

test("잘못된 날짜면 추출 기간을 만들지 않는다", () => {
  const r = parseIngestPeriod({ startDate: "2026/08/01", endDate: "20260828" });
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.error, /8자리/);
  const r2 = parseIngestPeriod({ startDate: "20260832", endDate: "20260828" });
  assert.equal(r2.ok, false);
});

test("시작이 끝보다 늦으면 거절한다", () => {
  const r = parseIngestPeriod({ startDate: "20260828", endDate: "20260801" });
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.error, /늦을 수/);
});

test("유효한 시작·끝 YYYYMMDD 를 그대로 돌려준다", () => {
  const r = parseIngestPeriod({ startDate: "20260801", endDate: "20260828" });
  assert.deepEqual(r, { ok: true, start: "20260801", end: "20260828" });
});
