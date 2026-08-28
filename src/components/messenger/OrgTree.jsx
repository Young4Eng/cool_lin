import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { SCHOOL_MEMBERS, ORG_STRUCTURE } from '../../data/initialData';
import { UserStatusIcon } from '../common/Icons';

export default function OrgTree({
  searchQuery = '',
  selectedMemberIds = [],
  onToggleSelectMember,
  onOpenChat,
  onOpenCompose,
}) {
  // Folders expand state
  const [expandedFolders, setExpandedFolders] = useState({
    school: true,
    'g-principal': false,
    'g-vp': false,
    'g-heads': true,
    'g-plan': false,
    'g-g1': false,
    'g-g2': true,
    'g-g3': false,
    'g-admin': false,
    'g-support': false,
  });

  const memberMap = Object.fromEntries(SCHOOL_MEMBERS.map(m => [m.id, m]));

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  // Filter members if search query is present
  const isSearching = searchQuery.trim().length > 0;
  const filteredMembers = isSearching
    ? SCHOOL_MEMBERS.filter(m =>
        m.name.includes(searchQuery) ||
        m.title.includes(searchQuery) ||
        m.ext.includes(searchQuery) ||
        m.department.includes(searchQuery)
      )
    : null;

  return (
    <div className="flex-1 overflow-y-auto px-2 py-1.5 text-xs select-none bg-white">
      {isSearching ? (
        <div className="space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 px-1 py-0.5 border-b border-slate-200">
            검색 결과 ({filteredMembers.length}명)
          </div>
          {filteredMembers.map(member => (
            <MemberRow
              key={member.id}
              member={member}
              isSelected={selectedMemberIds.includes(member.id)}
              onToggleSelect={() => onToggleSelectMember(member.id)}
              onDoubleClick={() => onOpenChat(member.id)}
              onOpenCompose={() => onOpenCompose([member.id])}
            />
          ))}
          {filteredMembers.length === 0 && (
            <div className="text-center py-6 text-slate-400 text-xs">
              검색된 교직원이 없습니다.
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-0.5">
          {/* Root: 한빛중학교 */}
          <div className="flex items-center gap-1 py-1 px-1 bg-slate-100 rounded font-semibold text-slate-800">
            <button
              type="button"
              onClick={() => toggleFolder('school')}
              className="p-0.5 hover:bg-slate-200 rounded text-slate-600"
            >
              {expandedFolders.school ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            <span className="text-[12px]">{ORG_STRUCTURE.label}</span>
          </div>

          {expandedFolders.school && (
            <div className="pl-3 space-y-0.5">
              {ORG_STRUCTURE.children.map(group => {
                const isExpanded = !!expandedFolders[group.id];
                const groupMembers = (group.memberIds || []).map(id => memberMap[id]).filter(Boolean);

                return (
                  <div key={group.id} className="space-y-0.5">
                    {/* Group Folder */}
                    <div className="flex items-center gap-1 py-0.5 px-1 hover:bg-slate-50 rounded">
                      <button
                        type="button"
                        onClick={() => toggleFolder(group.id)}
                        className="p-0.5 hover:bg-slate-200 rounded text-slate-500"
                      >
                        {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      </button>
                      <input
                        type="checkbox"
                        checked={
                          groupMembers.length > 0 &&
                          groupMembers.every(m => selectedMemberIds.includes(m.id))
                        }
                        onChange={() => {
                          const allSelected = groupMembers.every(m => selectedMemberIds.includes(m.id));
                          groupMembers.forEach(m => {
                            if (allSelected) {
                              onToggleSelectMember(m.id, false);
                            } else {
                              onToggleSelectMember(m.id, true);
                            }
                          });
                        }}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-cool-600 focus:ring-cool-400"
                      />
                      <span
                        onClick={() => toggleFolder(group.id)}
                        className="cursor-pointer text-slate-700 font-medium text-[11.5px]"
                      >
                        {group.label}
                      </span>
                    </div>

                    {/* Member Rows */}
                    {isExpanded && (
                      <div className="pl-4 space-y-0.5">
                        {groupMembers.map(member => (
                          <MemberRow
                            key={member.id}
                            member={member}
                            isSelected={selectedMemberIds.includes(member.id)}
                            onToggleSelect={() => onToggleSelectMember(member.id)}
                            onDoubleClick={() => onOpenChat(member.id)}
                            onOpenCompose={() => onOpenCompose([member.id])}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MemberRow({ member, isSelected, onToggleSelect, onDoubleClick, onOpenCompose }) {
  return (
    <div
      onDoubleClick={onDoubleClick}
      className={`flex items-center gap-1.5 py-0.5 px-1.5 rounded cursor-pointer transition-colors ${
        isSelected ? 'bg-cool-100 text-cool-900 font-medium' : 'hover:bg-slate-100 text-slate-700'
      }`}
      title={`${member.name} (${member.title}, 내선 ${member.ext})\n더블클릭: 1:1 대화창 열기`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={(e) => {
          e.stopPropagation();
          onToggleSelect();
        }}
        className="w-3.5 h-3.5 rounded border-slate-300 text-cool-600 focus:ring-cool-400"
      />
      <UserStatusIcon status={member.status} size={15} />
      <span className="truncate text-[11.5px] flex-1">
        {member.name}({member.title},{member.ext}){member.room && member.room.includes('미술') ? `)${member.room}` : ''}
      </span>
    </div>
  );
}
