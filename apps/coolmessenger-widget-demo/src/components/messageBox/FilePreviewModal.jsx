import React from 'react';
import { FileText, FileSpreadsheet, FileImage, File, Download, X } from 'lucide-react';

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

function iconFor(ext) {
  if (IMAGE_EXTS.includes(ext)) return FileImage;
  if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') return FileSpreadsheet;
  if (ext === 'hwp' || ext === 'pdf' || ext === 'doc' || ext === 'docx') return FileText;
  return File;
}

// Lets a teacher glance at what a file is (type, size, and — for images —
// a rendered preview) without needing to download it first.
// ("첨부파일을 다운받지 않고도 간략히 확인할 수 있는 파일 미리보기 기능")
export default function FilePreviewModal({ isOpen, onClose, file }) {
  if (!isOpen || !file) return null;
  const ext = (file.ext || file.name.split('.').pop() || '').toLowerCase();
  const isImage = IMAGE_EXTS.includes(ext);
  const Icon = iconFor(ext);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[140] flex items-center justify-center select-none font-sans text-xs"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg border border-slate-300 shadow-2xl w-[420px] overflow-hidden animate-scale-up"
      >
        <div className="flex items-center justify-between px-3.5 py-2 bg-slate-800 text-white font-bold">
          <span>파일 미리보기</span>
          <button type="button" onClick={onClose} className="hover:text-slate-300">
            <X size={14} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {isImage ? (
            <div className="h-48 bg-slate-100 border border-dashed border-slate-300 rounded flex flex-col items-center justify-center text-slate-400 gap-1">
              <FileImage size={32} />
              <span className="text-[11px]">이미지 미리보기 (데모)</span>
            </div>
          ) : (
            <div className="h-40 bg-slate-50 border border-slate-200 rounded flex flex-col items-center justify-center text-slate-500 gap-1.5">
              <Icon size={36} className="text-cool-500" />
              <span className="text-[11px] font-semibold uppercase">{ext || 'FILE'} 형식</span>
              <span className="text-[10.5px] text-slate-400">이 형식은 미리보기 렌더링을 지원하지 않아, 파일 정보만 표시합니다.</span>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 rounded p-2.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">파일명</span>
              <span className="font-semibold text-slate-800 truncate max-w-[260px]">{file.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">크기</span>
              <span className="text-slate-700">{file.size || '알 수 없음'}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => alert(`[다운로드 완료] ${file.name} 파일이 저장되었습니다.`)}
            className="w-full flex items-center justify-center gap-1.5 bg-cool-600 hover:bg-cool-700 text-white font-semibold py-2 rounded"
          >
            <Download size={13} /> 다운로드
          </button>
        </div>
      </div>
    </div>
  );
}
