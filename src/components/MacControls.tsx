import React, { useState } from 'react';
import { Edit2, Check } from 'lucide-react';

interface MacControlsProps {
  title: string;
  onTitleChange?: (newTitle: string) => void;
  textColor?: string;
  isEditable?: boolean;
}

export const MacControls: React.FC<MacControlsProps> = ({
  title,
  onTitleChange,
  textColor = '#a1a1aa',
  isEditable = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);

  const handleBlur = () => {
    setIsEditing(false);
    if (onTitleChange && currentTitle.trim() !== '') {
      onTitleChange(currentTitle.trim());
    } else {
      setCurrentTitle(title);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setCurrentTitle(title);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 select-none border-b border-white/[0.08] relative">
      {/* macOS Traffic Light Buttons */}
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/40 shadow-sm" />
        <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/40 shadow-sm" />
        <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/40 shadow-sm" />
      </div>

      {/* Center File Title */}
      <div className="flex-1 flex justify-center items-center px-4">
        {isEditing && isEditable ? (
          <div className="flex items-center space-x-1.5">
            <input
              type="text"
              value={currentTitle}
              onChange={(e) => setCurrentTitle(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              autoFocus
              className="bg-black/40 text-xs px-2 py-0.5 rounded border border-white/20 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
            />
            <button
              onClick={handleBlur}
              className="text-zinc-400 hover:text-white p-0.5 rounded"
              title="Save title"
            >
              <Check className="w-3 h-3 text-emerald-400" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => isEditable && setIsEditing(true)}
            className={`group flex items-center space-x-1.5 text-xs font-mono font-medium truncate max-w-[280px] sm:max-w-md ${
              isEditable ? 'cursor-pointer hover:opacity-100 opacity-80' : 'opacity-80'
            }`}
            style={{ color: textColor }}
            title={isEditable ? 'Click to edit filename' : undefined}
          >
            <span className="truncate">{title || 'Untitled'}</span>
            {isEditable && (
              <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-60 transition-opacity" />
            )}
          </div>
        )}
      </div>

      {/* Balanced right spacing placeholder */}
      <div className="w-[52px]" />
    </div>
  );
};
