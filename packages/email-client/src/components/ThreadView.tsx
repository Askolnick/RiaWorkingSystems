import React, { useMemo, useState } from "react";
import type { MailThread, MailMessage } from "../types";
import { useEmailCtx } from "../EmailContext";
import { sanitizeHtml } from "../lib/sanitize";

export const ThreadView: React.FC<{ thread: MailThread | null; onReply: (m: MailMessage)=>void; }> = ({ thread, onReply }) => {
  const { data } = useEmailCtx();
  const [selectionQuote, setSelectionQuote] = useState<string>("");

  if (!thread) return <div className="p-4 text-sm text-muted-foreground">Select a conversation.</div>;

  const onMouseUp = () => {
    const sel = window.getSelection();
    const text = sel?.toString() || "";
    if (text.length > 0) setSelectionQuote(text.slice(0, 500));
  };

  return (
    <div className="flex flex-col h-full" onMouseUp={onMouseUp}>
      <div className="border-b p-3 flex items-center justify-between">
        <div className="font-semibold">{thread.subject || "(no subject)"}</div>
        <div className="space-x-2">
          <button className="btn btn-sm" onClick={()=> onReply(thread.messages[thread.messages.length-1])}>Reply</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {thread.messages.map(m => (
          <article key={m.id} className="p-4 border-b">
            <header className="mb-2">
              <div className="text-sm"><span className="font-medium">{m.from?.[0]?.name || m.from?.[0]?.email}</span> → {m.to.map(a=>a.email).join(", ")}</div>
              <div className="text-xs text-muted-foreground">{new Date(m.date).toLocaleString()}</div>
            </header>
            <section className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(m.html || (m.text || "").replace(/\n/g,"<br/>")) }} />
            {m.attachments?.length ? (
              <ul className="mt-2 text-xs">
                {m.attachments.map(att => <li key={att.id} className="underline">{att.name} ({Math.round(att.size/1024)} KB)</li>)}
              </ul>
            ) : null}
            <footer className="mt-3 flex gap-2">
              <LinkButton message={m} selectionQuote={selectionQuote} />
              <CreateTaskButton message={m} selectionQuote={selectionQuote} />
              <StartCampaignButton message={m} />
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
};

const LinkButton: React.FC<{ message: MailMessage; selectionQuote?: string }> = ({ message, selectionQuote }) => {
  const { data } = useEmailCtx();
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<{id:string;type:"task"|"project"|"order"|"inventory"}|null>(null);

  const onCreate = async () => {
    if (!target) return;
    await data.createLink({ messageId: message.messageId, type: target.type, refId: target.id, quote: selectionQuote, createdAt: Date.now(), createdBy: "me" });
    setOpen(false);
  };

  return (
    <div className="inline-flex gap-2">
      <button className="btn btn-xs" onClick={()=>setOpen(!open)}>Link…</button>
      {open && (
        <div className="p-2 border rounded bg-background shadow-lg">
          <input className="input input-xs" placeholder="Search people/projects…" onChange={async e=>{/* optionally search */}}/>
          <div className="flex gap-1 mt-2">
            {["task","project","order","inventory"].map(t => (
              <button key={t} className="btn btn-ghost btn-xs" onClick={()=>setTarget({id: "REPLACE_ME", type: t as any})}>{t}</button>
            ))}
          </div>
          <div className="mt-2 text-right"><button className="btn btn-xs" onClick={onCreate}>Create link</button></div>
        </div>
      )}
    </div>
  );
};

const CreateTaskButton: React.FC<{ message: MailMessage; selectionQuote?: string }> = ({ message, selectionQuote }) => {
  const { data } = useEmailCtx();
  const [busy, setBusy] = useState(false);
  const onClick = async () => {
    setBusy(true);
    try { await data.createTaskFromEmail(message, { quote: selectionQuote }); } finally { setBusy(false); }
  };
  return <button className="btn btn-xs" onClick={onClick} disabled={busy}>{busy ? "Creating…" : "Create Task"}</button>;
};

const StartCampaignButton: React.FC<{ message: MailMessage }> = ({ message }) => {
  const { campaigns } = useEmailCtx();
  const [busy, setBusy] = useState(false);
  const onClick = async () => {
    setBusy(true);
    try { await campaigns.startCampaignFromSelection({ name: `From ${message.subject}`, messageHtml: message.html || message.text || "", audienceIds: [] }); }
    finally { setBusy(false); }
  };
  return <button className="btn btn-xs" onClick={onClick} disabled={busy}>{busy ? "Starting…" : "Start Campaign"}</button>;
};
