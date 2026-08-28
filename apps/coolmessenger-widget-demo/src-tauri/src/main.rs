// 바탕화면 일정 위젯 셸.
//
// 창은 하나다 — 위젯. 메인 창은 띄우지 않는다.
// 부팅 자동 실행은 기술계획서 7.9 / 8.6 의 규칙을 따른다.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{AppHandle, Manager, PhysicalPosition};
use tauri_plugin_autostart::{ManagerExt, MacosLauncher};

const WIDGET: &str = "widget";

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
        .invoke_handler(tauri::generate_handler![autostart_status, autostart_set])
        .setup(|app| {
            place_widget(app.handle());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("앱을 시작하지 못했습니다");
}
