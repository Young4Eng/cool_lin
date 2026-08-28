# -*- coding: utf-8 -*-
from __future__ import annotations

import json
import sys
import traceback
from pathlib import Path

HERE = Path(__file__).resolve().parent
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
                        ensure_ascii=False,
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
                    ensure_ascii=False,
                )
            )
            return

        from automator import run
        from parser import parse_xls

        result = run(progress)
        parsed = parse_xls(result["file"])
        print(json.dumps({"ok": True, "steps": steps, **result, **parsed}, ensure_ascii=False))
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
                ensure_ascii=False,
            )
        )
        raise SystemExit(1)


if __name__ == "__main__":
    main()
