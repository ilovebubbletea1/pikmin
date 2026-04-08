export const translations = {
  zh: {
    subtitle: "上傳截圖、自動擷取座標、收藏明信片",
    no_coord: "無法從圖片中辨識出座標，請確認這是一張正確的手機截圖。",
    dupe_coord: "此坐標已存在",
    scan_error: "辨識過程發生錯誤",
    scan_progress: "掃描座標中 (需時數秒)...",
    drag_drop_text: "點擊或拖曳長截圖至此處",
    drag_drop_subtext: "自動辨識座標並載入明信片",
    modal_title: "裁切明信片範圍",
    btn_cancel: "取消",
    btn_confirm: "確認裁切",
    crop_error: "裁切圖片失敗",
    feed_title: "已保存的明信片",
    btn_copy: "複製座標",
    btn_copied: "已複製",
    btn_mark_completed: "標記為已完成",
    confirm_mark_completed: "確定要標記為已完成嗎？",
    btn_completed: "已完成",
    filter_all: "全部",
    empty_state: "歡迎！點擊下方的「+」開始新增明信片吧"
  },
  en: {
    subtitle: "Upload screenshot, auto-extract coordinates, collect postcards",
    no_coord: "Cannot identify coordinates from the image. Please make sure it's a valid screenshot.",
    dupe_coord: "This coordinate already exists",
    scan_error: "Error occurred during scanning",
    scan_progress: "Scanning coordinates (takes a few seconds)...",
    drag_drop_text: "Click or drag your long screenshot here",
    drag_drop_subtext: "Auto-detect coordinates and load postcard",
    modal_title: "Crop Postcard Range",
    btn_cancel: "Cancel",
    btn_confirm: "Confirm Crop",
    crop_error: "Failed to crop image",
    feed_title: "Saved Postcards",
    btn_copy: "Copy Coord",
    btn_copied: "Copied",
    btn_mark_completed: "Mark Completed",
    confirm_mark_completed: "Are you sure you want to mark this as completed?",
    btn_completed: "Completed",
    filter_all: "All",
    empty_state: "Welcome! Click the '+' below to quickly add your postcard"
  },
  ko: {
    subtitle: "스크린샷 업로드, 좌표 자동 추출, 엽서 수집",
    no_coord: "이미지에서 좌표를 인식할 수 없습니다. 올바른 스크린샷인지 확인해주세요.",
    dupe_coord: "이 좌표는 이미 존재합니다",
    scan_error: "스캔 중 오류가 발생했습니다",
    scan_progress: "좌표 스캔 중 (몇 초 소요됨)...",
    drag_drop_text: "여기를 클릭하거나 긴 스크린샷을 드래그하세요",
    drag_drop_subtext: "좌표를 자동 감지하고 엽서를 불러옵니다",
    modal_title: "엽서 범위 자르기",
    btn_cancel: "취소",
    btn_confirm: "자르기 확인",
    crop_error: "이미지 자르기 실패",
    feed_title: "저장된 엽서",
    btn_copy: "좌표 복사",
    btn_copied: "복사됨",
    btn_mark_completed: "완료로 표시",
    confirm_mark_completed: "완료로 표시하시겠습니까?",
    btn_completed: "완료됨",
    filter_all: "전체",
    empty_state: "환영합니다! 아래의 '+' 버튼을 눌러 첫 엽서를 추가해보세요"
  }
};

export function getLang() {
  const lang = navigator.language || navigator.userLanguage || "en";
  if (lang.startsWith('zh')) return 'zh';
  if (lang.startsWith('ko')) return 'ko';
  return 'en';
}

export function t(key) {
  const lang = getLang();
  return translations[lang][key] || translations['en'][key] || key;
}
