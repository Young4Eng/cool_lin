// Initial Data for CoolMessenger GENTOO & School Environment

export const CURRENT_USER = {
  id: 'p-seojun',
  name: '김서준',
  title: '2학년 3반 담임',
  ext: '132',
  room: '2학년교무실,132',
  status: 'online', // 'online' | 'busy' | 'away' | 'offline'
  avatarText: '2-3 (132)',
};

export const SCHOOL_MEMBERS = [
  { id: 'p-seojun', name: '김서준', title: '2학년 3반 담임', ext: '132', room: '2학년교무실', status: 'online', department: '2학년' },
  { id: 'p-dohyun', name: '이도현', title: '교장', ext: '101', room: '교장실', status: 'online', department: '교장' },
  { id: 'p-seoyeon', name: '박서연', title: '교감', ext: '102', room: '교감실', status: 'online', department: '교감' },
  { id: 'p-eunji', name: '최은지', title: '교무부장', ext: '107', room: '교무실', status: 'online', department: '부장' },
  { id: 'p-jihun', name: '한지훈', title: '연구부장', ext: '108', room: '연구실', status: 'offline', department: '부장' },
  { id: 'p-seoa', name: '윤서아', title: '생활교육부장', ext: '112', room: '생활지도실', status: 'offline', department: '부장' },
  { id: 'p-minjae', name: '강민재', title: '인문사회부장', ext: '118', room: '교무실', status: 'offline', department: '부장' },
  { id: 'p-subin', name: '오수빈', title: '융합정보부장', ext: '114', room: '정보실', status: 'pc', department: '부장' },
  { id: 'p-haeun', name: '신하은', title: '학생맞춤지원부장', ext: '117', room: '미술2실,109', status: 'online', department: '부장' },
  { id: 'p-jaehyuk', name: '임재혁', title: '과학환경부장', ext: '115', room: '과학관', status: 'offline', department: '부장' },
  { id: 'p-doyoon', name: '배도윤', title: '체육안전부장', ext: '110', room: '체육관', status: 'online', department: '부장' },
  { id: 'p-chaewon', name: '문채원', title: '진로교육부장', ext: '144', room: '진로상담실', status: 'online', department: '부장' },
  { id: 'p-jiho', name: '서지호', title: '3학년부장', ext: '113', room: '3학년실', status: 'online', department: '부장' },
  { id: 'p-yuna', name: '남유나', title: '2학년부장', ext: '111', room: '2학년실', status: 'offline', department: '부장' },
  { id: 'p-siwoo', name: '홍시우', title: '1학년부장', ext: '116', room: '1학년실', status: 'online', department: '부장' },
  { id: 'p-harin', name: '정하린', title: '연구기획', ext: '168', room: '연구실', status: 'online', department: '기획' },
  { id: 'p-taeyang', name: '유태양', title: '영재', ext: '140', room: '과학관', status: 'pc', department: '기획' },
  { id: 'p-jimin', name: '노지민', title: '과학환경기획', ext: '143', room: '과학관', status: 'offline', department: '기획' },
  { id: 'p-seunga', name: '백승아', title: '1학년기획', ext: '139', room: '1학년실', status: 'online', department: '1학년' },
  { id: 'p-junhyuk', name: '하준혁', title: '스포츠클럽', ext: '183', room: '체육관', status: 'pc', department: '기획' },
  { id: 'p-haeun-plan', name: '신하은', title: '학생맞춤지원기획', ext: '121', room: '본관', status: 'online', department: '기획' },
  
  // 1학년 담임
  { id: 'p-minseok', name: '구민석', title: '1학년 1반 담임', ext: '221', room: '1학년실', status: 'online', department: '1학년' },
  { id: 'p-haneul', name: '민하늘', title: '1학년 2반 담임', ext: '222', room: '1학년실', status: 'offline', department: '1학년' },
  { id: 'p-yerin', name: '손예린', title: '1학년 3반 담임', ext: '223', room: '1학년실', status: 'online', department: '1학년' },
  { id: 'p-dokyung', name: '양도경', title: '1학년 4반 담임', ext: '224', room: '1학년실', status: 'online', department: '1학년' },
  { id: 'p-haeun2', name: '표하은', title: '1학년 5반 담임', ext: '225', room: '1학년실', status: 'offline', department: '1학년' },
  { id: 'p-seunghyun', name: '기승현', title: '1학년 6반 담임', ext: '226', room: '1학년실', status: 'online', department: '1학년' },
  
  // 2학년 담임
  { id: 'p-jia', name: '권지애', title: '2학년 1반 담임', ext: '201', room: '2학년실', status: 'online', department: '2학년' },
  { id: 'p-sehun', name: '안세훈', title: '2학년 2반 담임', ext: '202', room: '2학년실', status: 'online', department: '2학년' },
  { id: 'p-yuna-24', name: '허윤아', title: '2학년 4반 담임', ext: '204', room: '2학년실', status: 'offline', department: '2학년' },
  { id: 'p-taemin', name: '심태민', title: '2학년 5반 담임', ext: '205', room: '2학년실', status: 'online', department: '2학년' },
  { id: 'p-soyul', name: '전소율', title: '2학년 6반 담임', ext: '206', room: '2학년실', status: 'pc', department: '2학년' },

  // 3학년 담임
  { id: 'p-jiwoo', name: '봉지우', title: '3학년 1반 담임', ext: '301', room: '3학년실', status: 'online', department: '3학년' },
  { id: 'p-arin', name: '설아린', title: '3학년 2반 담임', ext: '302', room: '3학년실', status: 'offline', department: '3학년' },
  { id: 'p-junseo', name: '마준서', title: '3학년 3반 담임', ext: '303', room: '3학년실', status: 'online', department: '3학년' },
  { id: 'p-hyewon', name: '나혜원', title: '3학년 4반 담임', ext: '304', room: '3학년실', status: 'online', department: '3학년' },
  { id: 'p-ian', name: '도이안', title: '3학년 5반 담임', ext: '305', room: '3학년실', status: 'pc', department: '3학년' },
  { id: 'p-seojin', name: '라서진', title: '3학년 6반 담임', ext: '306', room: '3학년실', status: 'offline', department: '3학년' },

  // 행정실 & 비교과
  { id: 'p-sungmin', name: '변성민', title: '행정실장', ext: '150', room: '행정실', status: 'online', department: '행정실' },
  { id: 'p-jihye', name: '원지혜', title: '회계', ext: '151', room: '행정실', status: 'online', department: '행정실' },
  { id: 'p-eunjung', name: '길은정', title: '보건', ext: '160', room: '보건실', status: 'online', department: '비교과' },
  { id: 'p-mina', name: '탁민아', title: '상담', ext: '161', room: 'Wee클래스', status: 'offline', department: '비교과' },
  { id: 'p-seungho', name: '위승호', title: '사서', ext: '162', room: '도서관', status: 'pc', department: '비교과' },
  { id: 'p-sohee', name: '편소희', title: '영양', ext: '163', room: '급식실', status: 'online', department: '비교과' },
  { id: 'p-ara', name: '진아라', title: '특수', ext: '170', room: '학습도움실', status: 'online', department: '비교과' },
  { id: 'p-council', name: '한빛중 학생회', title: '학생회', ext: '180', room: '학생회실', status: 'offline', department: '학생회' },
];

export const ORG_STRUCTURE = {
  id: 'school',
  label: '한빛중학교',
  children: [
    { id: 'g-principal', label: '교장', memberIds: ['p-dohyun'] },
    { id: 'g-vp', label: '교감', memberIds: ['p-seoyeon'] },
    {
      id: 'g-heads',
      label: '부장',
      memberIds: [
        'p-eunji', 'p-jihun', 'p-seoa', 'p-minjae', 'p-subin',
        'p-haeun', 'p-jaehyuk', 'p-doyoon', 'p-chaewon', 'p-jiho',
        'p-yuna', 'p-siwoo'
      ]
    },
    {
      id: 'g-plan',
      label: '기획',
      memberIds: [
        'p-yuna', 'p-haeun-plan', 'p-harin', 'p-jiho', 'p-taeyang',
        'p-jimin', 'p-seunga', 'p-subin', 'p-junhyuk'
      ]
    },
    {
      id: 'g-g1',
      label: '1학년',
      memberIds: [
        'p-siwoo', 'p-seunga', 'p-minseok', 'p-haneul',
        'p-yerin', 'p-dokyung', 'p-haeun2', 'p-seunghyun'
      ]
    },
    {
      id: 'g-g2',
      label: '2학년',
      memberIds: [
        'p-yuna', 'p-jia', 'p-sehun', 'p-seojun',
        'p-yuna-24', 'p-taemin', 'p-soyul'
      ]
    },
    {
      id: 'g-g3',
      label: '3학년',
      memberIds: [
        'p-jiho', 'p-jiwoo', 'p-arin', 'p-junseo',
        'p-hyewon', 'p-ian', 'p-seojin'
      ]
    },
    {
      id: 'g-admin',
      label: '행정실',
      memberIds: ['p-sungmin', 'p-jihye']
    },
    {
      id: 'g-support',
      label: '비교과',
      memberIds: ['p-eunjung', 'p-mina', 'p-seungho', 'p-sohee', 'p-ara']
    }
  ]
};

export const INITIAL_MESSAGES = [
  {
    id: 'm-01',
    folder: 'inbox',
    fromId: 'p-eunji',
    toIds: ['p-seojun', 'p-jia', 'p-sehun', 'p-yuna-24', 'p-taemin', 'p-soyul'],
    ccIds: ['p-dohyun', 'p-seoyeon'],
    subject: '수정했습니다~ 조영욱(2학년생활지도1,132)님이 보낸',
    preview: '학급함에 생활기록부 학생주소 행정정보공유 연계시스템 동의서를 넣어두었습니다.',
    bodyHtml: `
      <p>안녕하세요 담임선생님, 교무부 최은지입니다.</p>
      <p>학급함에 <b style="color:#0284c7; background-color:#e0f2fe; padding:2px 4px; border-radius:3px;">생활기록부 학생주소 행정정보공유 연계시스템 동의서</b>를 넣어두었습니다.</p>
      <p>가정통신문을 학생들에게 배부해주시고 뒷면 사전동의서에 서명해서 제출할 수 있도록 안내 부탁드립니다.</p>
      <p>동의서를 제출하지 않는 경우 추후에 주민등록등본과 초본을 제출해야 하는 번거로움이 발생하므로 학생들이 모두 동의서를 제출할 수 있도록 독려 부탁드립니다.</p>
      <p style="margin:12px 0; padding:8px 12px; background:#fef2f2; border-left:4px solid #ef4444; color:#991b1b; font-weight:bold;">
        마감기한: 8월 27일(목) 17:00까지 교무부 제출
      </p>
      <p><b>1. 제출유무 목록표</b> (담임선생님이 아래 첨부파일 출력하셔서 직접 작성하셔서 가장 첫페이지)</p>
      <p><b>2. 행정정보 공동이용 사전동의서</b> (각반 번호순대로 걸어서 1번과 함께 제출)</p>
      <p>1,2 번을 모두 취합하는 대로 교무부 최은지에게 제출 부탁드립니다.<br/>바쁜 학기 초에 협조해 주셔서 감사합니다.</p>
    `,
    dateLabel: '2026/08/26 17:05:09',
    timestamp: '2026-08-26T17:05:09',
    attachments: [
      { name: '(2학기) 2026 행정정보공유 연계 동의서 제출유무 목록표.hwp', size: '35 KB', ext: 'hwp' },
      { name: '2026학년도 2학기 행정정보공유 연계 동의서 가정통신문.hwp', size: '99 KB', ext: 'hwp' }
    ],
    isGroup: true,
    unread: false,
    starred: true,
    aiDetectedEvent: {
      title: '행정정보공유 연계 동의서 취합본 교무부 제출',
      date: '2026-08-27',
      time: '17:00',
      category: '공문마감',
      priority: 'high',
      location: '교무부'
    }
  },
  {
    id: 'm-02',
    folder: 'inbox',
    fromId: 'p-jihun',
    toIds: ['p-seojun'],
    ccIds: [],
    subject: '넵 수정했습니다~! 박정희(2학년문화부장)',
    preview: '선생님 안녕하세요 2학기 방과후학교 수요조사 결과 취합본 전달드립니다.',
    bodyHtml: `
      <p>김서준 선생님 안녕하세요, 연구부 한지훈입니다.</p>
      <p>요청해주신 <b>2학기 2학년 방과후학교 개설 강좌 수요조사 결과</b> 엑셀 파일 첨부하여 드립니다.</p>
      <p>학급 조회 시 학생들에게 방과후 수강신청 기간(8/29~8/31) 사전 공지 부탁드립니다.</p>
      <p style="margin:10px 0; color:#0369a1; font-weight:600;">※ 2학년 3반 신청 희망 인원: 24명 확인 완료</p>
      <p>감사합니다!</p>
    `,
    dateLabel: '2026/08/26 17:03:34',
    timestamp: '2026-08-26T17:03:34',
    attachments: [
      { name: '2026-2학기_2학년_방과후수요조사_취합.xlsx', size: '42 KB', ext: 'xlsx' }
    ],
    isGroup: false,
    unread: false,
    starred: false,
    aiDetectedEvent: {
      title: '방과후학교 수강신청 시작 안내',
      date: '2026-08-29',
      time: '09:00',
      category: '학사일정',
      priority: 'medium',
      location: '나이스/홈페이지'
    }
  },
  {
    id: 'm-03',
    folder: 'inbox',
    fromId: 'p-subin',
    toIds: ['p-seojun'],
    ccIds: [],
    subject: '아 네~ 저는 관계부서 확인 후 다시 연락드리겠습니다.',
    preview: '교실 전자칠판 터치 센서 오작동 건 유지보수 업체 접수 안내',
    bodyHtml: `
      <p>선생님 안녕하세요. 융합정보부 오수빈입니다.</p>
      <p>말씀해주신 2-3반 교실 스마트 전자칠판 우측 터치 튐 현상에 대해 유지보수 업체(에듀텍)에 AS 접수 완료하였습니다.</p>
      <p style="margin:8px 0; padding:6px 10px; background:#f0fdf4; border-left:3px solid #22c55e; color:#15803d;">
        방문 점검 예정: 8월 28일(금) 15:30 방과후
      </p>
      <p>기사님 방문 시 교실 문 개방 및 현상 확인 협조 부탁드립니다.</p>
    `,
    dateLabel: '2026/08/26 16:18:15',
    timestamp: '2026-08-26T16:18:15',
    attachments: [],
    isGroup: false,
    unread: false,
    starred: false,
    aiDetectedEvent: {
      title: '2-3반 전자칠판 유지보수 업체 방문 점검',
      date: '2026-08-28',
      time: '15:30',
      category: '업무',
      priority: 'medium',
      location: '2-3 교실'
    }
  },
  {
    id: 'm-04',
    folder: 'inbox',
    fromId: 'p-sungmin',
    toIds: ['p-seojun', 'p-jia', 'p-sehun'],
    ccIds: [],
    subject: '[특근매식비 관련 공지] 8월 교직원 급식 및 연장근무 식대 신청 안내',
    preview: '8월분 특근매식비 지출품의를 위해 기한 내 신청 바랍니다.',
    bodyHtml: `
      <p>교직원 여러분 안녕하십니까. 행정실 변성민입니다.</p>
      <p>8월 개학 준비 및 야간자율학습 지도 등으로 인한 <b>특근매식비 신청</b>을 받습니다.</p>
      <p style="margin:10px 0; color:#b91c1c; font-weight:bold;">
        신청 마감: 8월 28일(금) 16:00까지 K-에듀파인 품의 연계
      </p>
      <p>영수증 원본은 행정실로 제출해 주시기 바랍니다.</p>
    `,
    dateLabel: '2026/08/26 11:05:20',
    timestamp: '2026-08-26T11:05:20',
    attachments: [
      { name: '특근매식비_신청서식_양식.hwp', size: '28 KB', ext: 'hwp' }
    ],
    isGroup: true,
    unread: false,
    starred: false,
    aiDetectedEvent: {
      title: '8월 특근매식비 신청 마감',
      date: '2026-08-28',
      time: '16:00',
      category: '공문마감',
      priority: 'high',
      location: '행정실'
    }
  },
  {
    id: 'm-05',
    folder: 'inbox',
    fromId: 'p-seoa',
    toIds: ['p-seojun'],
    ccIds: [],
    subject: '※ (선착순!!) 보강 신청 및 8월 4주 생활지도 순번표 배부',
    preview: '2학기 1차 교내 생활지도 및 점심시간 급식지도 순번 배부합니다.',
    bodyHtml: `
      <p>선생님들 수고 많으십니다. 생활교육부 윤서아입니다.</p>
      <p>다음 주부터 적용되는 <b>점심시간 중앙현관 및 복도 생활지도 순번표</b>를 공유합니다.</p>
      <p>김서준 선생님 순번은 <b>9월 1일(화) 3층 복도 지도</b>입니다.</p>
      <p>지도 시간: 12:40 ~ 13:20 (40분간)</p>
    `,
    dateLabel: '2026/08/26 13:00:00',
    timestamp: '2026-08-26T13:00:00',
    attachments: [
      { name: '2026_2학기_생활지도_순번표.pdf', size: '110 KB', ext: 'pdf' }
    ],
    isGroup: false,
    unread: true,
    starred: true,
    aiDetectedEvent: {
      title: '점심시간 3층 복도 생활지도',
      date: '2026-09-01',
      time: '12:40',
      category: '교무',
      priority: 'high',
      location: '3층 복도'
    }
  },
  {
    id: 'm-06',
    folder: 'inbox',
    fromId: 'p-dohyun',
    toIds: ['p-seojun', 'p-dohyun'],
    ccIds: ['p-seoyeon'],
    subject: '2026학년도 2학기 학교운영위원회 안건 심의 및 전체교직원 회의 안내',
    preview: '8월 31일(월) 방과 후 16:00 시청각실에서 전체 교직원 회의를 개최합니다.',
    bodyHtml: `
      <p>교직원 여러분 안녕하십니까. 교장 이도현입니다.</p>
      <p>2학기 주요 교육과정 운영 계획 및 학사일정 점검을 위해 아래와 같이 <b>전체 교직원 회의</b>를 소집합니다.</p>
      <ul>
        <li><b>일시:</b> 2026년 8월 31일(월) 16:00</li>
        <li><b>장소:</b> 1층 시청각실</li>
        <li><b>안건:</b> 2학기 학사운영, 안전교육 점검, 학교축제 추진위원회 구성</li>
      </ul>
      <p>한 분도 빠짐없이 참석해 주시기 바랍니다.</p>
    `,
    dateLabel: '2026/08/25 13:58:54',
    timestamp: '2026-08-25T13:58:54',
    attachments: [
      { name: '2026_2학기_교직원회의_안건지.hwp', size: '54 KB', ext: 'hwp' }
    ],
    isGroup: true,
    unread: true,
    starred: true,
    aiDetectedEvent: {
      title: '2학기 전체 교직원 회의',
      date: '2026-08-31',
      time: '16:00',
      category: '회의',
      priority: 'urgent',
      location: '시청각실'
    }
  }
];

// 자주 쓰는 멘트 (작성창 자동텍스트입력) — 예: 수업자료 전담교사가 매일 같은
// 문구로 자료를 배부할 때 바로 꽂아 넣는 용도. G-ONE의 "AI 대화 초안"과 유사.
export const INITIAL_QUICK_PHRASES = [
  { id: 'qp-01', label: '수업자료 전달', text: '안녕하세요~ 오늘 수업 자료 전달드립니다. 확인 부탁드립니다 :)' },
  { id: 'qp-02', label: '확인 요청', text: '안녕하세요 선생님, 내용 확인 부탁드리며 회신 주시면 감사하겠습니다.' },
  { id: 'qp-03', label: '제출 안내', text: '안녕하세요 선생님, 첨부 서류 확인하시어 기한 내 제출 부탁드립니다. 감사합니다.' },
];

// 여러 명 실시간 채팅(그룹 채팅) 샘플
export const INITIAL_GROUP_CHATS = {
  'g-2hak-damim': {
    id: 'g-2hak-damim',
    name: '2학년 담임 단톡',
    memberIds: ['p-seojun', 'p-jia', 'p-sehun', 'p-yuna-24', 'p-taemin', 'p-soyul'],
    messages: [
      { id: 'gc-1', senderId: 'p-jia', text: '선생님들 내일 2학년 담임 회의 몇 시였죠?', time: '오후 3:20' },
      { id: 'gc-2', senderId: 'p-seojun', text: '내일 4시 2학년실입니다!', time: '오후 3:22', isMe: true },
      { id: 'gc-3', senderId: 'p-sehun', text: '넵 확인했습니다~', time: '오후 3:23' },
    ],
  },
};

export const INITIAL_CHATS = {
  'p-eunji': [
    { id: 'c-1', senderId: 'p-eunji', text: '김서준 선생님, 2학년 3반 동의서 수합 잘 되고 계신가요?', time: '오후 4:40', isMe: false },
    { id: 'c-2', senderId: 'p-seojun', text: '네 부장님! 현재 22명 제출 완료되었고 내일 종례 때 미제출 학생 3명 받아서 바로 교무부로 갖다드리겠습니다.', time: '오후 4:42', isMe: true },
    { id: 'c-3', senderId: 'p-eunji', text: '네 감사합니다! 목록표 상단에 학급 총원 기재 꼭 부탁드립니다~^^', time: '오후 4:45', isMe: false },
  ],
  'p-subin': [
    { id: 'c-4', senderId: 'p-seojun', text: '부장님 2-3반 전자칠판 우측 터치가 가끔 안 먹히는데 확인 가능하실까요?', time: '오후 2:10', isMe: true },
    { id: 'c-5', senderId: 'p-subin', text: '선생님 접수해드렸어요! 내일 방과후 3시 반에 기사님 오시기로 했습니다.', time: '오후 4:18', isMe: false },
  ]
};
