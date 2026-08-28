# -*- coding: utf-8 -*-
from __future__ import annotations

import json
import sys
import traceback
from pathlib import Path

HERE = Path(__file__).resolve().parent
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass
sys.path.insert(0, str(HERE))


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
