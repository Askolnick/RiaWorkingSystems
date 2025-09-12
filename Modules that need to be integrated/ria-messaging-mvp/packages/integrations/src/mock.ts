import type { Connectors, EmailMessage, SlackMessage, SocialMessage } from './types';

const now = () => new Date().toISOString();

export const mockConnectors: Connectors = {
  email: {
    name: 'mock-email',
    async listSince(since: string): Promise<EmailMessage[]> {
      return [{
        id: 'eml_1', subject: 'Invoice question', from: 'client@example.com', to: ['support@ria.app'], date: now(),
        text: 'Hi — can you resend invoice #123?', html: '<p>Hi — can you resend invoice #123?</p>'
      }];
    }
  },
  slack: {
    name: 'mock-slack',
    async listSince(since: string): Promise<SlackMessage[]> {
      return [{ id: 'slk_1', channel: 'general', user: 'alex', date: now(), text: 'Standup in 5', threadTs: undefined }];
    }
  },
  social: {
    name: 'mock-social',
    async listSince(since: string): Promise<SocialMessage[]> {
      return [{ id: 'soc_1', platform: 'x', handle: '@customer', date: now(), text: '@riaapp billing portal is 👍', inReplyToId: undefined }];
    }
  }
};
