import React, { useState } from 'react';
import { PenguinIcon } from '../common/Icons';
import confetti from 'canvas-confetti';

export default function DownloadModal({ isOpen, onClose, totalCount = 5029 }) {
  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState('2026-08-26');
  const [folderPath, setFolderPath] = useState('C:\\Users\\USER\\Desktop\\coolmsg_2026');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  if (!isOpen) return null;

  const handleStartDownload = () => {
    setIsDownloading(true);
    setDownloadProgress(10);
    
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDownloading(false);
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 }
          });
          setTimeout(() => {
            alert(`[완료] ${startDate} ~ ${endDate} 기간의 메시지가 백업 파일로 저장되었습니다.\n저장 경로: ${folderPath}`);
            onClose();
          }, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center select-none font-sans">
      <div className="bg-white rounded border border-slate-300 shadow-2xl w-[480px] overflow-hidden animate-scale-up">
        {/* Title Bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-100 border-b border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <PenguinIcon size={16} />
            <span>메시지 다운로드</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-0.5"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 text-xs text-slate-700 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-16 text-slate-600 font-medium">기 간</span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-slate-300 rounded px-2 py-1 bg-white outline-none focus:border-cool-500"
              />
              <span>~</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-slate-300 rounded px-2 py-1 bg-white outline-none focus:border-cool-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-16 text-slate-600 font-medium">저장 폴더</span>
            <div className="flex-1 flex items-center gap-1.5">
              <input
                type="text"
                value={folderPath}
                onChange={(e) => setFolderPath(e.target.value)}
                className="flex-1 border border-slate-300 rounded px-2 py-1 bg-slate-50 outline-none text-[11px]"
              />
              <button
                type="button"
                className="bg-slate-100 border border-slate-300 hover:bg-slate-200 px-2 py-1 rounded text-[11px] shrink-0"
              >
                폴더변경
              </button>
            </div>
          </div>

          <div className="py-4 text-center space-y-1 bg-slate-50 rounded border border-slate-100">
            <p className="font-semibold text-slate-700">해당 기간의 메시지를 다운로드 하시겠습니까?</p>
            <p className="text-red-500 text-[11px] font-medium">
              메시지 양에 따라 다운로드 시간이 길어질 수 있습니다.
            </p>

            {isDownloading && (
              <div className="mt-3 px-6">
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-cool-500 h-full transition-all duration-200"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
                <p className="text-[10.5px] text-slate-500 mt-1">다운로드 진행 중... {downloadProgress}%</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              disabled={isDownloading}
              onClick={handleStartDownload}
              className="bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-800 px-4 py-1.5 rounded font-medium text-xs disabled:opacity-50"
            >
              다운로드
            </button>
            <button
              type="button"
              disabled={isDownloading}
              onClick={onClose}
              className="bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-800 px-4 py-1.5 rounded font-medium text-xs"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
