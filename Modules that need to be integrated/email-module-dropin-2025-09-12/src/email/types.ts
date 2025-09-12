export type MailAddress = { name?: string; email: string };
export type MailMessage = {
  id: string;                // JMAP id
  messageId: string;         // RFC 5322 Message-ID
  threadId: string;
  subject: string;
  from: MailAddress[];
  to: MailAddress[];
  cc?: MailAddress[];
  date: string;
  preview?: string;
  html?: string;
  text?: string;
  attachments?: { id: string; name: string; size: number; mime: string }[];
  flags?: { seen?: boolean; flagged?: boolean; encrypted?: boolean; signed?: boolean };
};

export type MailThread = {
  id: string;
  subject: string;
  messages: MailMessage[];
};

export type MailFolder = { id: string; name: string; role?: "inbox"|"sent"|"drafts"|"trash"|"archive" };

export type MailLink = { messageId: string; type: "task"|"project"|"order"|"inventory"; refId: string; quote?: string; createdBy: string; createdAt: number };

export type AuthAdapter = {
  getAuthHeaders: () => Promise<Record<string,string>>;
};

export type DataAdapter = {
  createTaskFromEmail: (msg: MailMessage, init?: { assigneeId?: string; due?: string; quote?: string }) => Promise<{ taskId: string }>;
  createLink: (link: MailLink) => Promise<void>;
  findLinksForMessage: (messageId: string) => Promise<MailLink[]>;
  searchPeopleOrgs: (q: string) => Promise<{ id: string; name: string; type: "person"|"org" }[]>;
};

export type CampaignAdapter = {
  startCampaignFromSelection: (opts: { name: string; messageHtml: string; audienceIds: string[]; utm?: Record<string,string> }) => Promise<{ campaignId: string }>;
};

export type JMAPClient = {
  listMailboxes: () => Promise<MailFolder[]>;
  listThreads: (opts: { mailboxId?: string; search?: string }) => Promise<MailThread[]>;
  getThread: (threadId: string) => Promise<MailThread | null>;
  send: (draft: ComposeDraft) => Promise<{ id: string }>;
};

export type ComposeDraft = {
  to: MailAddress[]; cc?: MailAddress[]; bcc?: MailAddress[];
  subject: string; html?: string; text?: string;
  attachments?: File[];
  encrypt?: boolean; sign?: boolean;
};
