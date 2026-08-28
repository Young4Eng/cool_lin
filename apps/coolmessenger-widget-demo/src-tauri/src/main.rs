// 바탕화면 일정 위젯 셸.
//
// 창은 하나다 — 위젯. 메인 창은 띄우지 않는다.
// 부팅 자동 실행은 기술계획서 7.9 / 8.6 의 규칙을 따른다.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::path::PathBuf;

use tauri::{AppHandle, LogicalSize, Manager, PhysicalPosition};
use tauri_plugin_autostart::{MacosLauncher, ManagerExt};
use tauri_plugin_notification::NotificationExt;
use tauri_plugin_opener::OpenerExt;

const WIDGET: &str = "widget";
/// 「캘린더 크게 보기」 창. 위젯과 별개로 뜬다.
const CALENDAR: &str = "calendar";
/// 캘린더 창 크기. 모니터보다 크면 화면에 맞춰 줄어든다.
const CALENDAR_SIZE: (f64, f64) = (980.0, 720.0);

/// `HKCU\Software\Microsoft\Windows\CurrentVersion\Run` 에 들어가는 이름.
/// autostart 플러그인이 `productName` 으로 쓰므로 tauri.conf.json 과 같아야 한다.
const RUN_NAME: &str = "CoolLin Widget";

/// 위젯 창을 주 모니터 오른쪽 위에 붙인다.
///
/// tauri.conf.json 에 x·y 를 적어 두면 배율이 다른 PC 에서 화면 밖으로 밀려난다.
/// 실제로 150% 배율 화면에서 `x: 1480` 이 물리 1850px 이 되어 창이 잘렸다.
/// 화면 크기도 배율도 PC마다 다르므로 실행 시점에 계산한다.
fn place_widget(app: &AppHandle) {
    let Some(win) = app.get_webview_window(WIDGET) else {
        return;
    };
    let Ok(Some(monitor)) = win.primary_monitor() else {
        return;
    };
    let Ok(size) = win.outer_size() else {
        return;
    };

    let area = monitor.size();
    let origin = monitor.position();
    let margin = (24.0 * monitor.scale_factor()).round() as i32;

    // 오른쪽 위. 창이 화면보다 넓으면 왼쪽 끝에 맞춰 잘리지 않게 한다.
    let x = (origin.x + area.width as i32 - size.width as i32 - margin).max(origin.x);
    let y = origin.y + margin;
    let _ = win.set_position(PhysicalPosition::new(x, y));
}

/// 이미 떠 있는 위젯을 앞으로 꺼낸다. 없으면 다시 만든다.
///
/// 위젯은 하나만 떠야 한다. 두 개가 겹치면 사용자 눈에는 하나인데 닫아도 아래 것이 남아
/// 「닫히지 않는 창」이 된다 (기술계획서 8.6 라).
///
/// 창이 사라졌는데 프로세스만 남아 있을 수도 있다. 그때 그냥 물러나면 바탕화면 아이콘을
/// 눌러도 아무 일이 일어나지 않는다 — 사용자에게는 「프로그램이 죽었다」로 보인다.
/// 그래서 없으면 설정 그대로 새로 띄운다.
fn focus_widget(app: &AppHandle) {
    if let Some(win) = app.get_webview_window(WIDGET) {
        let _ = win.show();
        let _ = win.unminimize();
        let _ = win.set_focus();
        return;
    }

    let config = app
        .config()
        .app
        .windows
        .iter()
        .find(|w| w.label == WIDGET)
        .cloned();
    if let Some(config) = config {
        if let Ok(builder) = tauri::WebviewWindowBuilder::from_config(app, &config) {
            if builder.build().is_ok() {
                place_widget(app);
            }
        }
    }
}

/// 지금 등록돼 있는 자동 실행 명령줄. 등록이 없으면 `None`.
#[cfg(windows)]
fn registered_command() -> Option<String> {
    use winreg::enums::HKEY_CURRENT_USER;
    use winreg::RegKey;

    RegKey::predef(HKEY_CURRENT_USER)
        .open_subkey(r"Software\Microsoft\Windows\CurrentVersion\Run")
        .ok()?
        .get_value::<String, _>(RUN_NAME)
        .ok()
}

#[cfg(not(windows))]
fn registered_command() -> Option<String> {
    None
}

/// 등록된 명령줄이 이 실행 파일을 가리키는가. 따옴표와 대소문자는 무시한다.
fn points_here(command: &str) -> bool {
    let Ok(exe) = std::env::current_exe() else {
        return true; // 알 수 없으면 건드리지 않는다
    };
    let want = exe.to_string_lossy().to_lowercase();
    let got = command.trim().trim_matches('"').to_lowercase();
    got.starts_with(&want)
}

/// 등록된 경로가 낡았으면 지금 실행 파일로 다시 쓴다 (기술계획서 8.6 가).
///
/// **등록이 아예 없으면 아무것도 하지 않는다.** 없다는 것은 사용자가 껐다는 뜻일 수 있고,
/// 첫 실행에서 켜는 일은 화면 쪽(`services/desktopShell.js`)이 맡는다.
///
/// **개발 빌드에서는 갱신하지 않는다.** 무조건 덮어쓰면 설치본으로 등록해 둔 PC 에서 개발
/// 빌드를 한 번 켜는 순간 등록이 `target\debug\...` 를 가리키고, `cargo clean` 한 번에
/// 그 경로가 사라져 그때부터 부팅해도 아무 것도 뜨지 않는다.
fn refresh_autostart_path(app: &AppHandle) {
    if cfg!(debug_assertions) {
        return;
    }
    let Some(command) = registered_command() else {
        return;
    };
    if points_here(&command) {
        return;
    }

    // 낡은 경로다. 지우고 지금 실행 파일로 다시 등록한다.
    let mgr = app.autolaunch();
    let _ = mgr.disable();
    let _ = mgr.enable();
}

/// 「캘린더 크게 보기」 창을 열거나 닫는다.
///
/// **위젯 창은 건드리지 않는다.** 예전에는 위젯 창 자체를 크게 늘려 캘린더를 그렸는데,
/// 그러면 캘린더를 보는 동안 위젯이 사라진다 — 「항상 떠 있는 일정판」이라는 위젯의
/// 존재 이유가 없어진다. 이제 캘린더는 별도 창이고 둘은 나란히 뜬다.
///
/// **누를 때 만들고, 접을 때 없앤다.** 미리 만들어 숨겨 두면 «창이 하나도 없는» 순간이
/// 오지 않아, 위젯을 닫아도 프로그램이 살아 있는다. 그러면 바탕화면 아이콘을 다시 눌러도
/// 「이미 실행 중」으로 판정돼 아무 창도 뜨지 않는다 — 사용자에게는 프로그램이 죽은 걸로
/// 보인다. 웹뷰를 다시 만드는 값은 그 고장에 비하면 아무것도 아니다.
#[tauri::command]
fn set_calendar_open(app: AppHandle, open: bool) {
    let Some(win) = app.get_webview_window(CALENDAR) else {
        return;
    };

    if !open {
        let _ = win.hide();
        // 캘린더만 보고 있다가 접었는데 위젯도 이미 닫혀 있으면, 보이는 창이 하나도 없다.
        exit_if_nothing_visible(&app, None);
        return;
    }

    // 화면에 맞춰 크기를 줄이고 가운데로. 위젯(오른쪽 위)과 겹치지 않는다.
    if let Ok(Some(monitor)) = win.primary_monitor() {
        let area = monitor.size();
        let origin = monitor.position();
        let scale = monitor.scale_factor();
        let max_w = (area.width as f64 / scale) - 40.0;
        let max_h = (area.height as f64 / scale) - 80.0;
        let _ = win.set_size(LogicalSize::new(
            CALENDAR_SIZE.0.min(max_w).max(360.0),
            CALENDAR_SIZE.1.min(max_h).max(420.0),
        ));
        if let Ok(size) = win.outer_size() {
            let x = origin.x + (area.width as i32 - size.width as i32) / 2;
            let y = origin.y + (area.height as i32 - size.height as i32) / 2;
            let _ = win.set_position(PhysicalPosition::new(x.max(origin.x), y.max(origin.y)));
        }
    }

    let _ = win.show();
    let _ = win.unminimize();
    let _ = win.set_focus();
}

/// 보이는 창이 하나도 남지 않았으면 프로그램을 끝낸다.
///
/// 저절로 끝나지 않는다. 캘린더 창은 «닫아도» 없애지 않고 숨기기만 하고(다시 열 때
/// 웹뷰를 새로 만들지 않으려고), 단일 실행 플러그인도 표시용 창을 하나 들고 있기 때문이다.
/// 그대로 두면 위젯을 닫은 뒤 바탕화면 아이콘을 눌러도 「이미 실행 중」으로 판정돼 아무
/// 창도 뜨지 않는다.
///
/// `just_destroyed` 는 방금 없어진 창의 이름이다. 그 창은 아직 목록에 남아 있을 수 있어
/// 세지 않는다.
fn exit_if_nothing_visible(app: &AppHandle, just_destroyed: Option<&str>) {
    let any_visible = app.webview_windows().iter().any(|(label, win)| {
        if Some(label.as_str()) == just_destroyed {
            return false;
        }
        win.is_visible().unwrap_or(false)
    });
    if !any_visible {
        app.exit(0);
    }
}

/// 링크를 기본 브라우저로 연다 (구글 캘린더 등).
///
/// 화면에서 `window.open` 을 쓰면 **설치본에서는 아무 일도 일어나지 않는다.** 위젯이 도는
/// WebView2 는 새 창 요청을 그냥 삼킨다 — 브라우저에서 시험할 때는 멀쩡해 보여서 놓치기
/// 쉽다. 바깥 주소는 운영체제에 넘겨 기본 브라우저가 열게 한다.
///
/// http·https 만 연다. 화면이 넘긴 문자열을 그대로 셸에 주면 `file:` 이나 다른 스킴으로
/// 엉뚱한 프로그램이 실행될 수 있다.
#[tauri::command]
fn open_external(app: AppHandle, url: String) -> Result<(), String> {
    if !(url.starts_with("https://") || url.starts_with("http://")) {
        return Err("http·https 주소만 열 수 있습니다.".into());
    }
    app.opener()
        .open_url(url, None::<&str>)
        .map_err(|e| e.to_string())
}

/// 마감이 다가온 일정을 윈도우 알림으로 띄운다 (화면 오른쪽 아래).
///
/// 앱 안의 토스트가 아니라 **운영체제 알림**이다. 위젯을 최소화해 두었거나 다른 창에
/// 가려져 있어도 보여야 하기 때문이다. 무엇을 언제 띄울지(D-3·D-2·D-1·당일, 한 번만)는
/// 화면 쪽이 정한다 — 여기서는 시키는 대로 띄우기만 한다.
#[tauri::command]
fn notify_deadline(app: AppHandle, title: String, body: String) {
    let _ = app.notification().builder().title(title).body(body).show();
}

/// 쿨메신저에서 가져오는 동안 위젯을 잠깐 비켜 준다.
///
/// 가져오기는 사람이 누르는 것과 같은 방법으로 쿨메신저 창을 조작한다(기술계획서 7.7).
/// 그런데 이 위젯은 «항상 위»이고, 버튼을 누른 직후에는 포그라운드까지 쥐고 있다.
/// 그 상태로는 자동화가 메신저 창을 앞으로 꺼내지 못하고, 화면을 찍으면 메신저 대신
/// 위젯 픽셀이 찍혀 단추를 찾지 못한다.
#[tauri::command]
fn set_widget_visible(app: AppHandle, visible: bool) {
    if let Some(win) = app.get_webview_window(WIDGET) {
        if visible {
            let _ = win.show();
        } else {
            let _ = win.hide();
        }
    }
}

/// 쿨메신저가 바탕화면에 내려놓은 내보내기 파일 하나.
#[derive(serde::Serialize)]
struct ExportFile {
    path: String,
    text: String,
}

fn home_dir() -> Option<PathBuf> {
    std::env::var_os("USERPROFILE")
        .or_else(|| std::env::var_os("HOME"))
        .map(PathBuf::from)
}

fn export_dirs() -> Vec<PathBuf> {
    match home_dir() {
        Some(home) => vec![home.join("Desktop"), home.join("OneDrive").join("Desktop")],
        None => Vec::new(),
    }
}

/// 바탕화면(과 OneDrive 바탕화면)에서 가장 최근 `coolmsg_*.xls` 를 읽는다.
///
/// 이 파일을 읽는 데 서버는 필요 없다. 예전에는 Node 서버에 HTTP 로 물어봤는데,
/// 그러면 교사가 `npm run dev:server` 를 직접 띄워야 위젯이 일정을 보여 준다.
/// 설치해서 쓰는 프로그램이 그럴 수는 없다.
#[tauri::command]
fn read_latest_export() -> Option<ExportFile> {
    let mut newest: Option<(std::time::SystemTime, PathBuf)> = None;

    for dir in export_dirs() {
        let Ok(entries) = std::fs::read_dir(&dir) else {
            continue;
        };
        for entry in entries.flatten() {
            let path = entry.path();
            let name = match path.file_name() {
                Some(n) => n.to_string_lossy().to_lowercase(),
                None => continue,
            };
            if !name.starts_with("coolmsg_") || !name.ends_with(".xls") {
                continue;
            }
            let Ok(modified) = entry.metadata().and_then(|m| m.modified()) else {
                continue;
            };
            if newest.as_ref().map_or(true, |(t, _)| modified > *t) {
                newest = Some((modified, path));
            }
        }
    }

    let (_, path) = newest?;
    // 내보내기는 BOM 붙은 UTF-8 이다. BOM 을 떼지 않으면 XML 파서가 첫 태그를 못 읽는다.
    let text = std::fs::read_to_string(&path).ok()?;
    Some(ExportFile {
        path: path.to_string_lossy().to_string(),
        text: text.trim_start_matches('\u{feff}').to_string(),
    })
}

/// 함께 설치된 파이썬 자동화 폴더.
fn python_dir(app: &AppHandle) -> Option<PathBuf> {
    // 설치본: 앱 리소스 안에 들어 있다.
    if let Ok(res) = app.path().resource_dir() {
        let p = res.join("python");
        if p.join("ingest.py").exists() {
            return Some(p);
        }
    }
    // 개발 중: 실행 파일에서 위로 올라가며 저장소의 server/python 을 찾는다.
    let mut dir = std::env::current_exe().ok()?;
    for _ in 0..7 {
        if !dir.pop() {
            break;
        }
        let p = dir.join("server").join("python");
        if p.join("ingest.py").exists() {
            return Some(p);
        }
    }
    None
}

/// 8자리 숫자인가. 바깥에서 온 값을 그대로 명령줄에 붙이지 않는다.
fn is_ymd(s: &str) -> bool {
    s.len() == 8 && s.bytes().all(|b| b.is_ascii_digit())
}

/// 쿨메신저 창을 조작해 메시지를 새로 내려받는다 (기본은 어제~오늘).
///
/// 파이썬을 여기서 직접 부른다. Node 서버를 거칠 이유가 없다 — 서버가 하던 일은
/// 이 명령을 대신 실행해 주는 것뿐이었다. 마지막 stdout 줄(JSON)을 그대로 돌려준다.
#[tauri::command]
fn run_messenger_download(
    app: AppHandle,
    start: Option<String>,
    end: Option<String>,
) -> Result<String, String> {
    let dir = python_dir(&app).ok_or("파이썬 자동화 폴더를 찾지 못했습니다.")?;

    // ingest.py 는 기간을 argv[2], argv[3] 으로 받는다 (YYYYMMDD). 둘 다 있을 때만 넘긴다.
    let mut args: Vec<String> = vec!["-3".into(), "ingest.py".into(), "ingest".into()];
    if let (Some(s), Some(e)) = (start.as_deref(), end.as_deref()) {
        if is_ymd(s) && is_ymd(e) {
            args.push(s.to_string());
            args.push(e.to_string());
        }
    }

    let output = std::process::Command::new("py")
        .args(&args)
        .current_dir(&dir)
        .env("PYTHONIOENCODING", "utf-8")
        .env("PYTHONUTF8", "1")
        .output()
        .map_err(|e| {
            format!("파이썬을 실행하지 못했습니다: {e}. `py -3` 가 설치돼 있는지 확인해 주세요.")
        })?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    match stdout.lines().filter(|l| !l.trim().is_empty()).last() {
        Some(line) => Ok(line.to_string()),
        None => {
            let err = String::from_utf8_lossy(&output.stderr);
            Err(format!(
                "쿨메신저 조작이 아무 것도 돌려주지 않았습니다. {}",
                err.lines().last().unwrap_or("")
            ))
        }
    }
}

/// 지금 부팅 자동 실행이 켜져 있는가.
#[tauri::command]
fn autostart_status(app: AppHandle) -> bool {
    app.autolaunch().is_enabled().unwrap_or(false)
}

/// 부팅 자동 실행을 켜거나 끈다. 켜져 있는 것을 다시 켜지 않는다 (기술계획서 8.6 가).
#[tauri::command]
fn autostart_set(app: AppHandle, enabled: bool) -> bool {
    let mgr = app.autolaunch();
    let current = mgr.is_enabled().unwrap_or(false);
    if enabled == current {
        return current;
    }
    let _ = if enabled { mgr.enable() } else { mgr.disable() };
    mgr.is_enabled().unwrap_or(false)
}

fn main() {
    tauri::Builder::default()
        // 두 번째 실행은 첫 창을 꺼내 주고 조용히 물러난다 (기술계획서 8.6 라).
        .plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
            focus_widget(app);
        }))
        // HKCU\...\Run 에 사용자별 항목만 만든다 (기술계획서 7.9).
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, None))
        // 마감 알림을 윈도우 알림 센터로 띄운다.
        .plugin(tauri_plugin_notification::init())
        // 바깥 링크(구글 캘린더)를 기본 브라우저로 넘긴다.
        .plugin(tauri_plugin_opener::init())
        // 창이 닫힐 때마다 «보이는 창이 남았는가»를 본다 (exit_if_nothing_visible).
        //
        // 캘린더의 X 는 «없애기»가 아니라 «접기»다. 없애 버리면 다시 열 때 웹뷰를 새로
        // 만들어야 하는데, 명령이 도는 작업 스레드에서 웹뷰를 만들면 속이 하얀 빈 창이
        // 뜬다 (실제로 겪었다). 그래서 숨기기만 한다.
        .on_window_event(|window, event| {
            let app = window.app_handle();
            match event {
                tauri::WindowEvent::CloseRequested { api, .. } if window.label() == CALENDAR => {
                    api.prevent_close();
                    let _ = window.hide();
                    exit_if_nothing_visible(app, None);
                }
                tauri::WindowEvent::Destroyed => {
                    exit_if_nothing_visible(app, Some(window.label()));
                }
                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![
            autostart_status,
            autostart_set,
            set_widget_visible,
            set_calendar_open,
            notify_deadline,
            open_external,
            read_latest_export,
            run_messenger_download
        ])
        .setup(|app| {
            place_widget(app.handle());
            refresh_autostart_path(app.handle());

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("앱을 시작하지 못했습니다");
}
