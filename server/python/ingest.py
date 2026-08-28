# -*- coding: utf-8 -*-
from __future__ import annotations

import json
import re
import sys
import traceback
from pathlib import Path

HERE = Path(__file__).resolve().parent
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass
sys.path.insert(0, str(HERE))


def rows_outside(sheets: dict, start_s: str, end_s: str) -> list[str]:
    """요청한 기간 밖에 있는 행의 날짜를 모은다. 날짜를 못 읽는 행은 세지 않는다."""
    bad: list[str] = []
    for name, rows in (sheets or {}).items():
        if not isinstance(rows, list):
            continue
        for row in rows:
            raw = str(row.get("날짜/시간", "")).strip()
            m = re.match(r"(\d{4})[/-](\d{2})[/-](\d{2})", raw)
            if not m:
                continue
            ymd = f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
            if ymd < start_s or ymd > end_s:
                bad.append(f"{name} {ymd}")
    return bad


def main() -> None:
    cmd = sys.argv[1] if len(sys.argv) > 1 else "ingest"
    steps: list[str] = []

    def progress(msg: str) -> None:
        steps.append(msg)

    try:
        if cmd == "latest":
            from automator import newest_xls
            from parser import parse_xls

            path = newest_xls(0)
            if not path:
                print(
                    json.dumps(
                        {
                            "ok": False,
                            "error": "바탕화면에서 coolmsg_*.xls 를 찾지 못했습니다.",
                            "steps": steps,
                        },
                        ensure_ascii=True,
                    )
                )
                raise SystemExit(1)
            parsed = parse_xls(path)
            print(
                json.dumps(
                    {
                        "ok": True,
                        "file": str(path),
                        "steps": [f"최근 파일 {path.name}"],
                        **parsed,
                    },
                    ensure_ascii=True,
                )
            )
            return

        from automator import parse_ymd_arg, run
        from parser import parse_xls

        start_s = sys.argv[2] if len(sys.argv) > 2 else ""
        end_s = sys.argv[3] if len(sys.argv) > 3 else ""
        start_d = parse_ymd_arg(start_s)
        end_d = parse_ymd_arg(end_s)
        if (start_d is None) != (end_d is None):
            raise ValueError("시작 날짜와 끝 날짜를 모두 8자리(YYYYMMDD)로 입력해 주세요.")
        if start_d is not None and end_d is not None and start_d > end_d:
            raise ValueError("시작 날짜가 끝 날짜보다 늦을 수 없습니다.")
        result = run(progress, start=start_d, end=end_d)
        parsed = parse_xls(result["file"])

        # 내려받은 표의 날짜가 정말 요청한 기간 안인가.
        #
        # 날짜 칸에 값이 잘못 들어가도 메신저는 «성공»한 파일을 내놓는다. 그 파일을
        # 그대로 믿으면 엉뚱한 기간의 쪽지가 오늘 일로 둔갑한다. 화면을 눈으로 확인할
        # 수 없는 자리이므로, 결과물을 거꾸로 본다.
        outside = rows_outside(parsed.get("sheets", {}), result["start"], result["end"])
        if outside:
            raise RuntimeError(
                f"내려받은 쪽지의 날짜가 요청한 기간({result['start']}~{result['end']})을 "
                f"벗어났습니다: {', '.join(outside[:3])}. 기간 칸이 제대로 입력되지 "
                "않았을 수 있으니 다시 눌러 주세요."
            )
        print(json.dumps({"ok": True, "steps": steps, **result, **parsed}, ensure_ascii=True))
    except SystemExit:
        raise
    except Exception as e:
        print(
            json.dumps(
                {
                    "ok": False,
                    "error": str(e),
                    "steps": steps,
                    "trace": traceback.format_exc(),
                },
                ensure_ascii=True,
            )
        )
        raise SystemExit(1)


if __name__ == "__main__":
    main()
