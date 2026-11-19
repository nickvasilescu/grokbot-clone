// Dev-only: `?fixtures` injects sample card/notice/event rows into the open transcript (client-side only)
// so every card state can be checked visually. Buttons hit the real API with fake ids and will show errors.
import type { Row, RowBody } from '@shared/types';
import { useStore } from '../store';

export function injectFixtures() {
  const st = useStore.getState();
  const botId = st.selectedBotId;
  if (!botId) return;
  const gen = st.transcripts[botId]?.generation ?? 0;
  const now = Date.now();
  let seq = 900000;
  const row = (kind: Row['kind'], body: RowBody, ago = 0): Row => ({ botId, generation: gen, seq: ++seq, updatedSeq: seq, kind, body, createdAt: now - ago });
  const rows: Row[] = [
    row('message', { type: 'message', role: 'assistant', text: 'Sure, updating the summary now.' }, 60_000),
    row('message', { type: 'message', role: 'assistant', text: 'Done. The summary now lists all three vendors. Should I send it?' }, 59_000),
    row('card', { type: 'card', card: 'draft', channel: 'message', to: 'Sam Example', approvalId: 'fx_draft', status: 'pending', text: 'Hi Sam, here is the vendor summary from this week.\n\nLet me know if anything looks off.' }, 58_000),
    row('message', { type: 'message', role: 'user', text: 'Looks good, send it.' }, 57_000),
    row('card', { type: 'card', card: 'approval', approvalId: 'fx_appr', title: 'Allow Quinn to send an email?', detail: 'To: sam@example.com\nSubject: Vendor summary', tool: 'GMAIL_SEND_EMAIL', toolkit: 'gmail', args: {}, status: 'pending' }, 56_000),
    row('card', { type: 'card', card: 'approval', approvalId: 'fx_appr2', title: 'Allow Quinn to create a calendar event?', detail: '', tool: 'GOOGLECALENDAR_CREATE_EVENT', toolkit: 'googlecalendar', args: {}, status: 'always' }, 55_000),
    row('card', { type: 'card', card: 'question', question: 'Which report format do you want?', options: ['1. One-page summary', '2. Full table', '3. Both'], status: 'pending' }, 54_000),
    row('card', { type: 'card', card: 'question', question: 'Which inbox should I watch?', options: ['Work', 'Personal'], status: 'answered', answer: 'Work' }, 53_000),
    row('card', { type: 'card', card: 'connect', toolkit: 'slack', toolkitName: 'Slack', logo: 'https://logos.composio.dev/api/slack', reason: 'I need Slack to post the daily digest in #general.', status: 'pending' }, 52_000),
    row('event', { type: 'event', event: 'routine-created', text: 'Routine created: Daily digest · Weekdays at 9:00 AM' }, 51_000),
    row('notice', { type: 'notice', text: "You're at 80% of your weekly usage limit.", tone: 'warn' }, 50_000),
    row('message', { type: 'message', role: 'assistant', text: "I couldn't post it. Here's the text to paste into the channel:\n\n```\nHi team, the vendor summary is ready.\n```\n\n> Tip: the channel only allows posts from members.\n\nInline `code` works too." }, 49_000),
  ];
  st.upsertRows(botId, gen, rows);
}
