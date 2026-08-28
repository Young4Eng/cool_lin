import assert from 'node:assert/strict';
import { test } from 'node:test';
import { redactSheets, redactMessageFields } from '../src/services/piiRedact.js';

// 여기 쓰는 이름·번호는 전부 지어낸 값이다 (PRD 17장). 실제 쪽지는 쓰지 않는다.

test('이름 칸은 토큰이 되고, 본문에 나온 같은 이름도 함께 가려진다', () => {
  const { sheets, piiTokens } = redactSheets({
    받은메시지: [
      {
        보낸사람: '한지우(교무부장,107)(한지우)',
        받는사람: '',
        제목: '한지우 선생님 안내',
        내용: '한지우 선생님께 제출해 주세요.',
        '날짜/시간': '2026/08/28 09:10:00',
      },
    ],
  });
  const row = sheets['받은메시지'][0];
  assert.match(row['보낸사람'], /^PERSON_\d+$/);
  assert.ok(!row['제목'].includes('한지우'), '제목에 이름이 남았다');
  assert.ok(!row['내용'].includes('한지우'), '본문에 이름이 남았다');
  assert.ok(piiTokens.includes('PERSON_1'));
});

test('다른 행의 이름도 본문에서 가려진다', () => {
  const { sheets } = redactSheets({
    받은메시지: [
      { 보낸사람: '나윤서', 제목: '', 내용: '박도현 선생님이 정리합니다.', 받는사람: '' },
      { 보낸사람: '박도현', 제목: '', 내용: '', 받는사람: '' },
    ],
  });
  assert.ok(!sheets['받은메시지'][0]['내용'].includes('박도현'));
});

test('전화·이메일·주민번호·학번을 가린다', () => {
  const { sheets } = redactSheets({
    쪽지: [
      {
        보낸사람: '',
        받는사람: '',
        제목: '',
        내용: '연락처 010-1234-5678, 메일 abc@school.kr, 학번 20301, 주민 010203-1234567',
        첨부파일: '',
      },
    ],
  });
  const body = sheets['쪽지'][0]['내용'];
  assert.ok(!body.includes('010-1234-5678'), '전화가 남았다');
  assert.ok(!body.includes('abc@school.kr'), '이메일이 남았다');
  assert.ok(!body.includes('010203-1234567'), '주민번호가 남았다');
  assert.ok(!body.includes('20301'), '학번이 남았다');
});

test('날짜는 전화번호로 오인하지 않는다', () => {
  const { sheets } = redactSheets({
    쪽지: [{ 보낸사람: '', 받는사람: '', 제목: '', 내용: '2026년 08월 28일 15:20 강당', 첨부파일: '' }],
  });
  assert.ok(sheets['쪽지'][0]['내용'].includes('2026년 08월 28일'));
});

test('같은 사람에게는 늘 같은 토큰을 준다', () => {
  const { sheets } = redactSheets({
    쪽지: [
      { 보낸사람: '서은우', 받는사람: '', 제목: '', 내용: '', 첨부파일: '' },
      { 보낸사람: '서은우', 받는사람: '', 제목: '', 내용: '', 첨부파일: '' },
    ],
  });
  assert.equal(sheets['쪽지'][0]['보낸사람'], sheets['쪽지'][1]['보낸사람']);
});

test('토큰 목록만 돌려주고 원문은 돌려주지 않는다', () => {
  const { piiTokens } = redactSheets({
    쪽지: [{ 보낸사람: '임하늘', 받는사람: '', 제목: '', 내용: '', 첨부파일: '' }],
  });
  assert.ok(piiTokens.every((t) => /^[A-Z]+_\d+$/.test(t)), `토큰이 아닌 값이 있다: ${piiTokens}`);
  assert.ok(!piiTokens.includes('임하늘'));
});

test('redactMessageFields 는 쪽지 한 통에도 같은 규칙을 태운다', () => {
  const out = redactMessageFields({
    subject: '정하윤 선생님 안내',
    body: '정하윤 선생님께 010-9876-5432 로 연락 주세요.',
    counterpart: '정하윤(교무부장,107)',
  });
  assert.ok(!out.subject.includes('정하윤'));
  assert.ok(!out.body.includes('정하윤'));
  assert.ok(!out.body.includes('010-9876-5432'));
  assert.match(out.counterpart, /^PERSON_\d+$/);
});

test('빈 시트에도 터지지 않는다', () => {
  assert.deepEqual(redactSheets({}), { sheets: {}, piiTokens: [] });
  assert.deepEqual(redactSheets(undefined), { sheets: {}, piiTokens: [] });
});
