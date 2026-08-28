// 바탕화면 일정 위젯 셸.
//
// 창은 하나다 — 위젯. 메인 창은 띄우지 않는다.
// 부팅 자동 실행은 기술계획서 7.9 / 8.6 의 규칙을 따른다.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{AppHandle, Manager, PhysicalPosition};
use tauri_plugin_autostart::{MacosLauncher, ManagerExt};

const WIDGET: &str = "widget";

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

/// 이미 떠 있는 위젯을 앞으로 꺼낸다.
///
/// 위젯은 하나만 떠야 한다. 두 개가 겹치면 사용자 눈에는 하나인데 닫아도 아래 것이 남아
/// 「닫히지 않는 창」이 된다 (기술계획서 8.6 라).
fn focus_widget(app: &AppHandle) {
    if let Some(win) = app.get_webview_window(WIDGET) {
        let _ = win.show();
        let _ = win.unminimize();
        let _ = win.set_focus();
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
        .invoke_handler(tauri::generate_handler![
            autostart_status,
            autostart_set,
            set_widget_visible
        ])
        .setup(|app| {
            place_widget(app.handle());
            refresh_autostart_path(app.handle());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("앱을 시작하지 못했습니다");
}
