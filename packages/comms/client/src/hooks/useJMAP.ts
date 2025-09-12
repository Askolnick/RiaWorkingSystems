import { useMemo } from "react";
import type { JMAPClient, MailFolder, MailThread } from "../types";

// Minimal placeholder JMAP client using fetch. Replace with a proper SDK or enhance.
export function useJMAP(endpoint: string, authHeaders: ()=>Promise<Record<string,string>>): JMAPClient {
  async function req(path: string, body?: any) {
    const h = await authHeaders();
    const r = await fetch(endpoint + path, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...h },
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include"
    });
    if (!r.ok) throw new Error(`JMAP error ${r.status}`);
    return r.json();
  }

  return {
    async listMailboxes(): Promise<MailFolder[]> {
      // Placeholder: implement per your server's JMAP endpoints
      return [{ id: "inbox", name: "Inbox", role: "inbox" }, { id: "sent", name: "Sent", role: "sent" }];
    },
    async listThreads(_opts): Promise<MailThread[]> {
      // Placeholder: return mock data
      return [{
        id: "t_demo",
        subject: "Welcome to the email module",
        messages: [{
          id: "m1", messageId: "<demo@local>", threadId: "t_demo",
          subject: "Welcome to the email module",
          from: [{ email: "noreply@example.com", name: "System" }],
          to: [{ email: "you@example.com" }],
          date: new Date().toISOString(),
          html: "<p>This is a demo message. Connect JMAP to load real data.</p>"
        }]
      }];
    },
    async getThread(threadId) {
      const threads = await this.listThreads({});
      return threads.find(t=>t.id===threadId) || threads[0];
    },
    async send(draft) {
      // POST to JMAP send; return message id
      await new Promise(r=>setTimeout(r, 500));
      return { id: "sent_demo" };
    }
  };
}
