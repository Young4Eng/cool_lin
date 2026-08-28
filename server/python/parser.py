# -*- coding: utf-8 -*-
from __future__ import annotations

import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any

NS = {"ss": "urn:schemas-microsoft-com:office:spreadsheet"}


def parse_xls(path: str | Path) -> dict[str, Any]:
    raw = Path(path).read_bytes()
    if raw.startswith(b"\xef\xbb\xbf"):
        raw = raw[3:]
    text = raw.decode("utf-8")
    root = ET.fromstring(text)
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
