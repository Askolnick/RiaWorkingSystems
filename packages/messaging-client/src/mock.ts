// Use a simple UUID generator for browser compatibility
const generateId = () => 'msg_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
import type { MessagingApi, Inbox, Conversation, Message } from './types';

const now = () => new Date().toISOString();
const TENANT_ID = 'demo-tenant';

const inboxes: Inbox[] = [
  { id: generateId(), name: 'Support', slug: 'support', tenantId: TENANT_ID },
  { id: generateId(), name: 'Sales', slug: 'sales', tenantId: TENANT_ID },
  { id: generateId(), name: 'Social', slug: 'social', tenantId: TENANT_ID },
];

const conversations: Conversation[] = [
  { 
    id: generateId(), 
    kind:'email', 
    subject:'Invoice question', 
    status:'open', 
    priority:'normal', 
    tags:['billing'], 
    lastAt: now(),
    tenantId: TENANT_ID
  },
  { 
    id: generateId(), 
    kind:'internal', 
    subject:'Sprint Retro', 
    status:'open', 
    priority:'normal', 
    tags:['team'], 
    lastAt: now(),
    tenantId: TENANT_ID
  },
  { 
    id: generateId(), 
    kind:'social', 
    subject:'@customer mention', 
    status:'open', 
    priority:'high', 
    tags:['twitter'], 
    lastAt: now(),
    tenantId: TENANT_ID
  },
];

const messages: Message[] = [
  { 
    id: generateId(), 
    conversationId: conversations[0].id, 
    source:'email', 
    direction:'in', 
    authorAddr:'client@example.com', 
    bodyText:'Can you resend invoice #123?', 
    sentAt: now(),
    tenantId: TENANT_ID
  },
  { 
    id: generateId(), 
    conversationId: conversations[0].id, 
    source:'internal', 
    direction:'out', 
    author:'you', 
    bodyText:'On it — sending now.', 
    sentAt: now(),
    tenantId: TENANT_ID
  },
  { 
    id: generateId(), 
    conversationId: conversations[1].id, 
    source:'slack', 
    direction:'in', 
    author:'alex', 
    bodyText:'Let\'s discuss action items', 
    sentAt: now(),
    tenantId: TENANT_ID
  },
  { 
    id: generateId(), 
    conversationId: conversations[2].id, 
    source:'social', 
    direction:'in', 
    author:'@customer', 
    bodyText:'@riaapp billing portal is great!', 
    sentAt: now(),
    tenantId: TENANT_ID
  },
];

export function createMockMessaging(): MessagingApi {
  return {
    async listInboxes(){ return [...inboxes]; },
    async listConversations(filter){
      let list = [...conversations];
      if(filter?.q){
        const q = filter.q.toLowerCase();
        list = list.filter(c => (c.subject||'').toLowerCase().includes(q) || c.tags.some(t=>t.toLowerCase().includes(q)));
      }
      if(filter?.status) list = list.filter(c=>c.status===filter.status);
      if(filter?.tag) list = list.filter(c=>c.tags.includes(filter.tag!));
      return list.sort((a,b)=> (b.lastAt||'').localeCompare(a.lastAt||''));
    },
    async getConversation(id){
      const convo = conversations.find(c=>c.id===id);
      if(!convo) throw new Error('not found');
      const msgs = messages.filter(m=>m.conversationId===id).sort((a,b)=> (a.sentAt||'').localeCompare(b.sentAt||''));
      return { convo, messages: msgs };
    },
    async postMessage(conversationId, data){
      const msg: Message = { 
        id: generateId(), 
        conversationId, 
        source: data.as==='email'?'email':'internal', 
        direction:'out', 
        author:'you', 
        bodyText:data.bodyText, 
        sentAt: now(),
        tenantId: TENANT_ID
      };
      messages.push(msg);
      const idx = conversations.findIndex(c=>c.id===conversationId);
      if(idx>=0) conversations[idx] = { ...conversations[idx], lastAt: now() };
      return msg;
    },
    async setStatus(id, status){
      const idx = conversations.findIndex(c=>c.id===id);
      if(idx>=0) conversations[idx].status = status;
    },
    async setAssignee(id, userId){
      const idx = conversations.findIndex(c=>c.id===id);
      if(idx>=0) conversations[idx].assigneeId = userId;
    },
    async addTag(id, tag){
      const idx = conversations.findIndex(c=>c.id===id);
      if(idx>=0 && !conversations[idx].tags.includes(tag)) conversations[idx].tags.push(tag);
    },
  }
}