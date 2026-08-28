# -*- coding: utf-8 -*-
from __future__ import annotations

import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any

NS = {"ss": "urn:schemas-microsoft-com:office:spreadsheet"}


# 쿨메신저가 .xls 로 내보낸 파일은 확장자가 같아도 내부 형식이 두 가지다.
# 이 파서는 SpreadsheetML(XML)만 읽는다. 구형 OLE2(진짜 xls)는 읽지 못한다.
OLE2_SIGNATURE = b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"


def parse_xls(path: str | Path) -> dict[str, Any]:
    """화면 미리보기용 표를 만든다.

    일정 추출은 여기서 하지 않는다. 그건 packages/schedule-engine 이 맡는다
    (두 형식을 모두 읽고 ss:Index 도 존중한다).

    읽지 못하는 형식이면 예외를 던지지 않고 빈 표와 이유를 돌려준다.
    미리보기가 안 된다고 「내려받기 실패」가 되면 안 되기 때문이다.
    """
    raw = Path(path).read_bytes()
    if raw.startswith(OLE2_SIGNATURE):
        return {
            "path": str(path),
            "sheets": {},
            "previewNote": "구형 엑셀(OLE2) 형식이라 미리보기 표를 만들지 못했습니다. 일정 추출은 정상 동작합니다.",
        }
    if raw.startswith(b"\xef\xbb\xbf"):
        raw = raw[3:]
    try:
        text = raw.decode("utf-8")
        root = ET.fromstring(text)
    except (UnicodeDecodeError, ET.ParseError) as e:
        return {
            "path": str(path),
            "sheets": {},
            "previewNote": f"미리보기 표를 만들지 못했습니다: {e}. 일정 추출은 정상 동작합니다.",
        }
    sheets: dict[str, list[dict[str, str]]] = {}
    for ws in root.findall("ss:Worksheet", NS):
        name = ws.attrib.get("{urn:schemas-microsoft-com:office:spreadsheet}Name") or ws.attrib.get("Name") or "Sheet"
        table = ws.find("ss:Table", NS)
        rows_out: list[dict[str, str]] = []
        headers: list[str] = []
        if table is None:
            sheets[name] = rows_out
            continue
        for i, row in enumerate(table.findall("ss:Row", NS)):
            cells = []
            for cell in row.findall("ss:Cell", NS):
                data = cell.find("ss:Data", NS)
                cells.append("" if data is None or data.text is None else data.text)
            if i == 0:
                headers = cells or ["열"]
                continue
            item = {}
            for j, h in enumerate(headers):
                item[h] = cells[j] if j < len(cells) else ""
            rows_out.append(item)
        sheets[name] = rows_out
    return {"path": str(path), "sheets": sheets}
