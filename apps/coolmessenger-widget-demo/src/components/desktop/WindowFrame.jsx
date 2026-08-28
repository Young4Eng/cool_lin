import React, { useState, useRef, useEffect } from 'react';
import { Minus, Square, X } from 'lucide-react';

export default function WindowFrame({
  id,
  title,
  icon,
  isOpen,
  isMinimized,
  isMaximized,
  zIndex,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  children,
  width = 640,
  height = 540,
  minWidth = 360,
  minHeight = 300,
  defaultPosition = { x: 80, y: 40 },
  headerStyle = 'default', // 'default' | 'gentoo' | 'messagebox' | 'widget'
  customHeaderRight = null,
  className = '',
}) {
  // Current on-screen position — starts at defaultPosition, then tracks
  // wherever the user has dragged the window header to. Kept as local
  // state (rather than lifted to App.jsx) so dragging stays smooth and
  // doesn't need every window's position wired through parent state.
  const [position, setPosition] = useState(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleHeaderMouseDown = (e) => {
    if (isMaximized) return;
    if (e.target.closest('button')) return; // don't start a drag from header buttons
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e) => {
      setPosition({
        x: Math.max(0, e.clientX - dragOffset.current.x),
        y: Math.max(0, e.clientY - dragOffset.current.y),
      });
    };
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!isOpen || isMinimized) return null;

  return (
    <div
      id={`window-${id}`}
      onMouseDown={onFocus}
      style={{
        zIndex,
        left: isMaximized ? 0 : position.x,
        top: isMaximized ? 0 : position.y,
        width: isMaximized ? '100vw' : width,
        height: isMaximized ? 'calc(100vh - 48px)' : height,
        minWidth: isMaximized ? '100vw' : minWidth,
        minHeight: isMaximized ? 'calc(100vh - 48px)' : minHeight,
      }}
      className={`fixed flex flex-col bg-white rounded-lg shadow-win-active border border-slate-300 overflow-hidden ${
        isDragging ? '' : 'transition-all duration-100'
      } ${isMaximized ? 'rounded-none border-0' : ''} ${className}`}
    >
      {/* Window Header */}
      <div
        onMouseDown={handleHeaderMouseDown}
        className={`flex items-center justify-between px-3 py-1.5 select-none text-xs border-b ${
          isMaximized ? 'cursor-default' : 'cursor-move'
        } ${
          headerStyle === 'gentoo'
            ? 'bg-white text-slate-700 border-slate-200'
            : headerStyle === 'messagebox'
            ? 'bg-[#3b92cb] text-white border-[#2c78ab]'
            : headerStyle === 'widget'
            ? 'bg-gradient-to-r from-[#1f6fe5] to-[#105888] text-white border-blue-600'
            : 'bg-slate-100 text-slate-700 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2 font-medium tracking-tight truncate">
          {icon && <span className="shrink-0">{icon}</span>}
          <span className="truncate">{title}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {customHeaderRight}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onMinimize && onMinimize(); }}
            className={`p-1 rounded hover:bg-black/10 transition-colors ${
              headerStyle === 'messagebox' || headerStyle === 'widget' ? 'hover:bg-white/20 text-white' : 'text-slate-600'
            }`}
            title="최소화"
          >
            <Minus size={13} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onMaximize && onMaximize(); }}
            className={`p-1 rounded hover:bg-black/10 transition-colors ${
              headerStyle === 'messagebox' || headerStyle === 'widget' ? 'hover:bg-white/20 text-white' : 'text-slate-600'
            }`}
            title={isMaximized ? '이전 크기로' : '최대화'}
          >
            <Square size={11} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClose && onClose(); }}
            className="p-1 rounded hover:bg-red-500 hover:text-white transition-colors"
            title="닫기"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Window Body */}
      <div className="flex-1 flex flex-col min-h-0 bg-white overflow-hidden">
        {children}
      </div>
    </div>
  );
}
