// 창 두 개는 tauri.conf.json 이 선언한다. 여기서는 위젯 창 자리만 잡아 준다.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, PhysicalPosition};

/// 위젯 창을 주 모니터 오른쪽 위에 붙인다.
///
/// tauri.conf.json 에 x·y 를 적어 두면 배율이 다른 PC 에서 화면 밖으로 밀려난다.
/// 실제로 150% 배율 화면에서 `x: 1480` 이 물리 1850px 이 되어 창이 잘렸다.
/// 화면 크기도 배율도 PC마다 다르므로 실행 시점에 계산한다.
fn place_widget(app: &tauri::AppHandle) {
    let Some(win) = app.get_webview_window("widget") else {
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

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            place_widget(app.handle());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("앱을 시작하지 못했습니다");
}
