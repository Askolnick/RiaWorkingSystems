import React from "react";
import type { MailThread } from "../types";

export const MessageList: React.FC<{ threads: MailThread[]; onOpen: (t: MailThread) => void; }> = ({ threads, onOpen }) => {
  if (!threads.length) return <div className="p-4 text-sm text-muted-foreground">No conversations.</div>;
  return (
    <ul className="divide-y">
      {threads.map(t => {
        const last = t.messages.at(-1);
        return (
          <li key={t.id} className="p-3 hover:bg-muted cursor-pointer" onClick={()=>onOpen(t)}>
            <div className="flex items-center justify-between">
              <div className="font-medium truncate">{t.subject || "(no subject)"}</div>
              <div className="text-xs text-muted-foreground">{last?.date && new Date(last.date).toLocaleString()}</div>
            </div>
            <div className="text-xs text-muted-foreground truncate">{last?.preview || last?.text?.slice(0,140)}</div>
          </li>
        );
      })}
    </ul>
  );
};
