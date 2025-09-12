export type EmailMessage = {
  id: string; threadId?: string; subject?: string; from: string; to: string[]; cc?: string[]; date: string; text: string; html?: string;
};
export type SocialMessage = { id: string; platform: 'x'|'instagram'|'facebook'|'linkedin'; handle: string; date: string; text: string; inReplyToId?: string; };
export type SlackMessage  = { id: string; channel: string; user: string; date: string; text: string; threadTs?: string; };

export interface Connector<T> {
  name: string;
  listSince(sinceISO: string): Promise<T[]>;
}

export interface Connectors {
  email: Connector<EmailMessage>;
  slack: Connector<SlackMessage>;
  social: Connector<SocialMessage>;
}
