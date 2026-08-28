# -*- coding: utf-8 -*-
"""Drive Cool Messenger mock from main window or an already-open inbox."""
from __future__ import annotations

import ctypes
import time
from ctypes import wintypes
from datetime import date, timedelta
from pathlib import Path
from typing import Callable, Optional

import cv2
import numpy as np
from PIL import ImageGrab

user32 = ctypes.windll.user32
kernel32 = ctypes.windll.kernel32

try:
    user32.SetProcessDPIAware()
except Exception:
    pass

HERE = Path(__file__).resolve().parent
ASSETS = HERE / "assets"

SW_RESTORE = 9
SW_SHOW = 5
MOUSEEVENTF_LEFTDOWN = 0x0002
MOUSEEVENTF_LEFTUP = 0x0004
KEYEVENTF_KEYUP = 0x0002
VK_RETURN = 0x0D
VK_TAB = 0x09
VK_CONTROL = 0x11
VK_A = 0x41
VK_HOME = 0x24
VK_DELETE = 0x2E
HWND_TOPMOST = -1
HWND_NOTOPMOST = -2
SWP_NOSIZE = 0x0001
SWP_NOMOVE = 0x0002
SWP_SHOWWINDOW = 0x0040
PROCESS_QUERY_LIMITED = 0x1000

WNDENUMPROC = ctypes.WINFUNCTYPE(ctypes.c_bool, wintypes.HWND, wintypes.LPARAM)


class RECT(ctypes.Structure):
    _fields_ = [("left", ctypes.c_long), ("top", ctypes.c_long),
                ("right", ctypes.c_long), ("bottom", ctypes.c_long)]


def _title(hwnd: int) -> str:
    n = user32.GetWindowTextLengthW(hwnd)
    buf = ctypes.create_unicode_buffer(n + 1)
    user32.GetWindowTextW(hwnd, buf, n + 1)
    return buf.value


def _rect(hwnd: int) -> tuple[int, int, int, int]:
    r = RECT()
    user32.GetWindowRect(hwnd, ctypes.byref(r))
    return r.left, r.top, r.right, r.bottom


def _visible(hwnd: int) -> bool:
    return bool(user32.IsWindowVisible(hwnd))


def _pid(hwnd: int) -> int:
    pid = wintypes.DWORD()
    user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
    return int(pid.value)


def _process_path(pid: int) -> str:
    h = kernel32.OpenProcess(PROCESS_QUERY_LIMITED, False, pid)
    if not h:
        return ""
    try:
        buf = ctypes.create_unicode_buffer(32768)
        size = wintypes.DWORD(32768)
        ok = kernel32.QueryFullProcessImageNameW(h, 0, buf, ctypes.byref(size))
        return buf.value if ok else ""
    finally:
        kernel32.CloseHandle(h)


def _classname(hwnd: int) -> str:
    buf = ctypes.create_unicode_buffer(256)
    user32.GetClassNameW(hwnd, buf, 256)
    return buf.value


def _is_real_school_messenger(path: str) -> bool:
    pth = path.replace("/", "\\").lower()
    return "program files" in pth and "coolmessenger gentoo" in pth


def _is_mock(hwnd: int) -> bool:
    """Find the mock by the live window, not shortcut name or install folder."""
    path = _process_path(_pid(hwnd))
    if not path or _is_real_school_messenger(path):
        return False
    cls = _classname(hwnd)
    title = _title(hwnd)
    exe = Path(path).name.lower()
    title_hit = any(k in title for k in ("CoolMessenger", "GENTOO", "메시지 관리함", "쿨메신저")) or ("메신저" in title and "Chrome" not in title)
    if cls == "Neutralinojs_webview" and (title_hit or exe == "coolmessenger.exe"):
        return True
    if exe == "coolmessenger.exe":
        return True
    return False


def list_windows() -> list[tuple[int, str, tuple[int, int, int, int]]]:
    found: list[tuple[int, str, tuple[int, int, int, int]]] = []

    def cb(hwnd, _lp):
        if not _visible(hwnd):
            return True
        t = _title(hwnd)
        if t:
            found.append((hwnd, t, _rect(hwnd)))
        return True

    user32.EnumWindows(WNDENUMPROC(cb), 0)
    return found


def force_foreground(hwnd: int) -> None:
    """Bring a background/minimized window in front of the browser."""
    user32.ShowWindow(hwnd, SW_SHOW)
    if user32.IsIconic(hwnd):
        user32.ShowWindow(hwnd, SW_RESTORE)
    fg = user32.GetForegroundWindow()
    cur = kernel32.GetCurrentThreadId()
    fg_tid = user32.GetWindowThreadProcessId(fg, None)
    target_tid = user32.GetWindowThreadProcessId(hwnd, None)
    user32.AttachThreadInput(cur, fg_tid, True)
    user32.AttachThreadInput(cur, target_tid, True)
    user32.BringWindowToTop(hwnd)
    user32.SetForegroundWindow(hwnd)
    user32.SetWindowPos(hwnd, HWND_TOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_SHOWWINDOW)
    user32.SetWindowPos(hwnd, HWND_NOTOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_SHOWWINDOW)
    user32.AttachThreadInput(cur, fg_tid, False)
    user32.AttachThreadInput(cur, target_tid, False)
    time.sleep(0.35)


def place(hwnd: int, x: int, y: int, w: int, h: int) -> None:
    user32.ShowWindow(hwnd, SW_RESTORE)
    user32.SetWindowPos(hwnd, HWND_TOPMOST, x, y, w, h, SWP_SHOWWINDOW)
    force_foreground(hwnd)


def screenshot_region(l: int, t: int, r: int, b: int):
    sl, st = max(0, l), max(0, t)
    img = ImageGrab.grab(bbox=(sl, st, r, b))
    return img, sl, st


def load_templates(prefix: str) -> list[np.ndarray]:
    tpls = []
    for p in sorted(ASSETS.glob(f"{prefix}_*.png")):
        im = cv2.imread(str(p), cv2.IMREAD_COLOR)
        if im is not None and im.size:
            tpls.append(im)
    return tpls


def match_icon(bgr: np.ndarray, tpls: list[np.ndarray], top_frac: float = 0.28, prefer_right: bool = True, thresh: float = 0.58, right_frac: float = 0.0):
    h, w = bgr.shape[:2]
    y1 = max(50, int(h * top_frac))
    x0 = int(w * right_frac) if right_frac else 0
    band = bgr[:y1, x0:]
    best = None
    raw_best = -1.0
    for tpl in tpls:
        th, tw = tpl.shape[:2]
        if th >= band.shape[0] or tw >= band.shape[1]:
            continue
        res = cv2.matchTemplate(band, tpl, cv2.TM_CCOEFF_NORMED)
        _, maxv, _, maxl = cv2.minMaxLoc(res)
        cx = x0 + maxl[0] + tw // 2
        cy = maxl[1] + th // 2
        adj = float(maxv)
        if prefer_right:
            adj += 0.02 * (cx / max(w, 1))
        if best is None or adj > best[2]:
            best = (cx, cy, adj)
            raw_best = float(maxv)
    if best and raw_best >= thresh:
        return (best[0], best[1], raw_best)
    return None



def match_in(bgr: np.ndarray, tpls: list[np.ndarray], y0_frac: float, y1_frac: float, x0_frac: float = 0.0, x1_frac: float = 1.0, thresh: float = 0.62):
    h, w = bgr.shape[:2]
    y0, y1 = int(h * y0_frac), int(h * y1_frac)
    x0, x1 = int(w * x0_frac), int(w * x1_frac)
    band = bgr[y0:y1, x0:x1]
    best = None
    for tpl in tpls:
        th, tw = tpl.shape[:2]
        if th >= band.shape[0] or tw >= band.shape[1]:
            continue
        res = cv2.matchTemplate(band, tpl, cv2.TM_CCOEFF_NORMED)
        _, maxv, _, maxl = cv2.minMaxLoc(res)
        if best is None or float(maxv) > best[2]:
            best = (x0 + maxl[0] + tw // 2, y0 + maxl[1] + th // 2, float(maxv))
    if best and best[2] >= thresh:
        return best
    return None


def click(x: int, y: int) -> None:
    user32.SetCursorPos(int(x), int(y))
    time.sleep(0.06)
    user32.mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
    time.sleep(0.05)
    user32.mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)


def tap(vk: int) -> None:
    user32.keybd_event(vk, 0, 0, 0)
    user32.keybd_event(vk, 0, KEYEVENTF_KEYUP, 0)


def type_text(s: str) -> None:
    for ch in s:
        vk = user32.VkKeyScanW(ord(ch))
        if vk == -1:
            continue
        lo = vk & 0xFF
        shift = bool(vk & 0x100)
        if shift:
            user32.keybd_event(0x10, 0, 0, 0)
        user32.keybd_event(lo, 0, 0, 0)
        user32.keybd_event(lo, 0, KEYEVENTF_KEYUP, 0)
        if shift:
            user32.keybd_event(0x10, 0, KEYEVENTF_KEYUP, 0)
        time.sleep(0.02)


def desktop_dir() -> Path:
    return Path.home() / "Desktop"


def newest_xls(since: float) -> Optional[Path]:
    cands = []
    folders = [desktop_dir(), Path.home() / "OneDrive" / "Desktop"]
    for folder in folders:
        if not folder.exists():
            continue
        for p in folder.glob("coolmsg_*.xls"):
            try:
                if p.stat().st_mtime >= since - 1:
                    cands.append(p)
            except OSError:
                pass
    return max(cands, key=lambda p: p.stat().st_mtime) if cands else None


def find_inbox() -> Optional[tuple[int, str, tuple[int, int, int, int]]]:
    for hwnd, title, rc in list_windows():
        if "메시지 관리함" in title and _is_mock(hwnd):
            return hwnd, title, rc
    return None


def find_main() -> Optional[tuple[int, str, tuple[int, int, int, int]]]:
    for hwnd, title, rc in list_windows():
        if not _is_mock(hwnd):
            continue
        if "메시지 관리함" in title:
            continue
        if "CoolMessenger" in title or "쿨메신저" in title or "GENTOO" in title:
            return hwnd, title, rc
    # last resort: any mock window that is not inbox
    for hwnd, title, rc in list_windows():
        if _is_mock(hwnd) and "메시지 관리함" not in title:
            return hwnd, title, rc
    return None


def click_template(hwnd: int, prefix: str, log: Callable[[str], None], label: str, placements=None, top_frac=0.22, thresh=0.58, right_frac=0.0):
    tpls = load_templates(prefix)
    if not tpls:
        raise RuntimeError(f"{label} 템플릿이 없습니다.")
    placements = placements or [
        (60, 40, 1280, 800),
        (20, 20, 1400, 860),
        (-200, 30, 1500, 860),
    ]
    best = None
    for x, y, w, h in placements:
        place(hwnd, x, y, w, h)
        l, t, r, b = _rect(hwnd)
        if r - l < 80 or b - t < 80:
            continue
        img, sl, st = screenshot_region(l, t, r, b)
        bgr = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        m = match_icon(bgr, tpls, top_frac=top_frac, thresh=thresh, right_frac=right_frac)
        log(f"{label} 탐색 {r-l}x{b-t} → " + (f"{m[2]:.2f}" if m else "없음"))
        if m and (best is None or m[2] > best[2]):
            best = (sl + m[0], st + m[1], m[2], hwnd)
        if m and m[2] >= max(0.70, thresh):
            break
    if not best or best[2] < thresh:
        raise RuntimeError(f"{label}을(를) 창 안에서 찾지 못했습니다.")
    force_foreground(hwnd)
    time.sleep(0.15)
    click(best[0], best[1])
    time.sleep(0.55)
    return best


def open_inbox_if_needed(log: Callable[[str], None]) -> tuple[int, str]:
    inbox = find_inbox()
    if inbox:
        hwnd, title, _ = inbox
        log(f"관리함 이미 열림: {title}")
        force_foreground(hwnd)
        return hwnd, title

    main = find_main()
    if not main:
        raise RuntimeError("열려 있는 쿨메신저 창을 찾지 못했습니다. 모의 프로그램을 켠 뒤 다시 눌러 주세요.")
    hwnd, title, _ = main
    log(f"메인 창에서 시작: {title}")
    force_foreground(hwnd)
    click_template(hwnd, "bubble", log, "메시지 관리함 아이콘", top_frac=0.20, thresh=0.52, right_frac=0.45)
    for _ in range(25):
        inbox = find_inbox()
        if inbox:
            ih, it, _ = inbox
            log(f"관리함 열림: {it}")
            force_foreground(ih)
            return ih, it
        time.sleep(0.2)
    raise RuntimeError("메인 창에서 메시지 관리함을 열지 못했습니다.")


def modal_visible(hwnd: int) -> bool:
    """True only if the download dialog is actually on screen (폴더변경)."""
    tpls = load_templates("folderchg")
    if not tpls:
        return False
    l, t, r, b = _rect(hwnd)
    img, _, _ = screenshot_region(l, t, r, b)
    bgr = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    m = match_in(bgr, tpls, 0.15, 0.9, 0.1, 0.95, thresh=0.52)
    return m is not None


def wait_modal(hwnd: int, timeout: float, gone: bool = False) -> bool:
    """다운로드 창이 뜨기를(또는 `gone=True` 면 닫히기를) 기다린다.

    `modal_visible` 은 화면을 캡처해 템플릿을 맞춰 보므로 싸지 않다. 한 바퀴에 한 번만
    부르도록 여기서 묶는다. 돌려주는 값은 «기다리던 상태가 되지 않았는가» 가 아니라
    `gone=False` 면 «떴는가», `gone=True` 면 «아직 안 닫혔는가» 다.
    """
    deadline = time.time() + timeout
    while True:
        visible = modal_visible(hwnd)
        if gone:
            if not visible:
                return False
        elif visible:
            return True
        if time.time() >= deadline:
            return gone
        time.sleep(0.2)


def type_spin(digits: str) -> None:
    tap(VK_HOME)
    time.sleep(0.03)
    for _ in range(len(digits) + 2):
        tap(VK_DELETE)
        time.sleep(0.01)
    type_text(digits)


def type_ymd(d: date) -> None:
    # Mock accepts compact digits only, e.g. 20260827. No hyphens, no field clicks.
    type_text(f"{d.year:04d}{d.month:02d}{d.day:02d}")


def click_download_label(hwnd: int, log: Callable[[str], None]) -> None:
    force_foreground(hwnd)
    l, t, r, b = _rect(hwnd)
    img, sl, st = screenshot_region(l, t, r, b)
    bgr = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    tpls = load_templates("dlbtn")
    m = match_in(bgr, tpls, 0.45, 0.98, 0.20, 0.98, thresh=0.42) if tpls else None
    if not m:
        # footer is [다운로드] [닫기]; click to the left of 닫기
        close_tpls = load_templates("btndlgclose")
        c = match_in(bgr, close_tpls, 0.45, 0.98, 0.20, 0.98, thresh=0.50) if close_tpls else None
        if c:
            m = (c[0] - 80, c[1], c[2])
            log(f"닫기 왼쪽으로 다운로드 클릭 {c[2]:.2f}")
    if not m:
        raise RuntimeError("다운로드 버튼을 창 안에서 찾지 못했습니다.")
    log(f"다운로드 버튼 {m[2]:.2f}")
    click(sl + m[0], st + m[1])
    time.sleep(0.5)


def fill_dates_and_download(hwnd: int, log: Callable[[str], None]) -> None:
    force_foreground(hwnd)
    today = date.today()
    yest = today - timedelta(days=1)
    yest_s = f"{yest.year:04d}{yest.month:02d}{yest.day:02d}"
    l, top, r, btm = _rect(hwnd)
    tpls = load_templates("folderchg")
    img, sl, st = screenshot_region(l, top, r, btm)
    bgr = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    fc = match_in(bgr, tpls, 0.15, 0.9, 0.1, 0.95, thresh=0.52) if tpls else None
    if not fc:
        # 예전에는 여기서 창 비율로 좌표를 찍었다. 그런데 다운로드 창이 실제로는 안 떠
        # 있을 때 엉뚱한 곳을 눌러 놓고 그 위에 날짜를 타이핑해 버렸다. 기간이 조용히
        # 망가진 채로 «성공»한 파일이 나오는 것이 가장 나쁜 결과다 (기술계획서 8.4).
        raise RuntimeError(
            "다운로드 창의 «폴더변경»을 찾지 못해 시작 날짜 칸 위치를 알 수 없습니다. "
            "쿨메신저가 다른 창에 가려져 있지 않은지 확인해 주세요."
        )
    # 폴더변경 왼쪽 위 = 시작 날짜 칸 (달력 아이콘이 아니라 숫자 쪽)
    sx, sy = sl + fc[0] - 280, st + fc[1] - 58
    log(f"시작 날짜 클릭 {sx},{sy}")
    click(int(sx), int(sy))
    time.sleep(0.18)
    tap(VK_HOME)
    time.sleep(0.05)
    type_ymd(yest)
    log(f"시작 날짜 {yest_s} (끝은 오늘 유지)")
    time.sleep(0.2)
    click_download_label(hwnd, log)


def dismiss_saved_box(timeout: float = 3.0) -> bool:
    """저장 확인 창("저장했습니다")을 닫는다. 닫았으면 True.

    이 창은 앱 안의 모달이 아니라 별도 네이티브 창이라 제목으로 찾을 수 있다.
    남겨 두면 다음 실행이 이 창을 상대로 클릭하게 되므로 시작할 때도 한 번 훑는다.
    """
    deadline = time.time() + timeout
    while time.time() < deadline:
        for hwnd, title, _rc in list_windows():
            if title == "메시지 다운로드":
                force_foreground(hwnd)
                tap(VK_RETURN)
                time.sleep(0.2)
                return True
        time.sleep(0.12)
    return False


def run(progress: Callable[[str], None] | None = None) -> dict:
    log = progress or (lambda _s: None)
    started = time.time()

    # 직전 실행이 남긴 저장 확인 창을 먼저 치운다. 남아 있으면 이 창이 앞에 서서
    # 아래 클릭이 전부 엉뚱한 곳으로 간다 — 연속 실행이 실패하던 원인이다.
    if dismiss_saved_box(0.6):
        log("직전 실행의 저장 확인 창을 닫음")

    hwnd, title = open_inbox_if_needed(log)

    # 다운로드 창이 «확인될 때까지» 연다. 확인되지 않은 채로 진행하면 좌표를 찍게 되고,
    # 그러면 기간이 조용히 틀어진 파일이 나온다.
    if wait_modal(hwnd, 0.0):
        log("다운로드 창이 이미 열려 있음")
    else:
        for attempt in range(1, 4):
            click_template(
                hwnd,
                "dl",
                log,
                "다운로드 아이콘",
                placements=[
                    (40, 30, 1600, 900),
                    (-280, 30, 1700, 900),
                    (-520, 30, 1900, 900),
                ],
                top_frac=0.28,
            )
            if wait_modal(hwnd, 3.0):
                log(f"다운로드 창 열림 ({attempt}번째 시도)")
                break
            log(f"다운로드 창이 뜨지 않음 ({attempt}/3)")
        else:
            raise RuntimeError(
                "다운로드 창을 열지 못했습니다. 쿨메신저가 다른 창에 가려져 있지 않은지 "
                "확인한 뒤 다시 눌러 주세요."
            )

    fill_dates_and_download(hwnd, log)
    log("저장 대기")
    dismiss_saved_box()
    deadline = time.time() + 25
    path = None
    while time.time() < deadline:
        path = newest_xls(started)
        if path:
            break
        time.sleep(0.4)
    if not path:
        raise RuntimeError("xls 파일이 만들어지지 않았습니다. 메신저가 앞에 나온 뒤 다운로드가 눌렸는지 확인해 주세요.")
    log(f"저장됨 {path.name}")

    # 다음 실행이 깨끗한 화면에서 시작하도록 다운로드 창이 닫힌 것까지 확인한다.
    if wait_modal(hwnd, 2.0, gone=True):
        log("다운로드 창이 아직 닫히지 않음")

    return {"file": str(path), "started": started}
