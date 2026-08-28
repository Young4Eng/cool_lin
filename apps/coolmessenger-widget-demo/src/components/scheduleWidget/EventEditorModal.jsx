import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Tag } from 'lucide-react';

export default function EventEditorModal({
  isOpen,
  onClose,
  onSave,
  initialDate = '2026-08-28',
}) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState('09:00');
  const [category, setCategory] = useState('학사일정');
  const [priority, setPriority] = useState('medium');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: 'ev-user-' + Date.now(),
      title: title.trim(),
      date,
      time,
      category,
      priority,
      location: location.trim(),
      description: description.trim(),
      fromAi: false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[110] flex items-center justify-center select-none font-sans">
      <div className="bg-white rounded-lg border border-slate-300 shadow-2xl w-[400px] overflow-hidden animate-scale-up text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 py-2 bg-gradient-to-r from-cool-600 to-cool-700 text-white font-bold">
          <div className="flex items-center gap-1.5">
            <Calendar size={15} />
            <span>새 학사/업무 일정 등록</span>
          </div>
          <button type="button" onClick={onClose} className="hover:text-slate-200">
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">일정 제목 *</label>
            <input
              type="text"
              required
              placeholder="예: 2학기 학교운영위원회 안건 심의"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 outline-none focus:border-cool-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-600 font-medium mb-1">일자</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-slate-300 rounded px-2 py-1 bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">시간</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full border border-slate-300 rounded px-2 py-1 bg-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-600 font-medium mb-1">카테고리</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-slate-300 rounded px-2 py-1 bg-white outline-none"
              >
                <option value="학사일정">학사일정</option>
                <option value="공문마감">공문마감</option>
                <option value="회의">회의</option>
                <option value="교무">교무</option>
                <option value="시험">시험</option>
                <option value="업무">기타업무</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">중요도</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border border-slate-300 rounded px-2 py-1 bg-white outline-none"
              >
                <option value="urgent">긴급 (Urgent)</option>
                <option value="high">높음 (High)</option>
                <option value="medium">보통 (Medium)</option>
                <option value="low">낮음 (Low)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">장소</label>
            <input
              type="text"
              placeholder="예: 1층 시청각실, 교무실"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border border-slate-300 rounded px-2 py-1 outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">상세 내용 및 메모</label>
            <textarea
              rows={2}
              placeholder="일정 관련 준비사항 또는 메모"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-slate-300 rounded px-2 py-1 outline-none text-[11px]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              className="bg-cool-600 hover:bg-cool-700 text-white px-4 py-1.5 rounded font-bold"
            >
              일정 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
