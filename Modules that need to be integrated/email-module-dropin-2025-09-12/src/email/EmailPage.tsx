import React, { useEffect, useMemo, useState } from "react";
import { useEmailCtx } from "./EmailContext";
import { MessageList } from "./components/MessageList";
import { ThreadView } from "./components/ThreadView";
import { Composer } from "./components/Composer";
import type { MailFolder, MailThread, MailMessage } from "./types";

export const EmailPage: React.FC = () => {
  const { jmap } = useEmailCtx();
  const [folders, setFolders] = useState<MailFolder[]>([]);
  const [threads, setThreads] = useState<MailThread[]>([]);
  const [activeThread, setActiveThread] = useState<MailThread | null>(null);
  const [search, setSearch] = useState("");
  const [activeFolder, setActiveFolder] = useState<string|undefined>(undefined);
  const [composeOpen, setComposeOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<MailMessage | null>(null);

  useEffect(() => { jmap.listMailboxes().then(setFolders); }, [jmap]);
  useEffect(() => { jmap.listThreads({ mailboxId: activeFolder, search }).then(setThreads); }, [jmap, activeFolder, search]);

  return (
    <div className="grid grid-cols-12 h-full gap-0">
      <aside className="col-span-2 border-r p-2 overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold">Mailboxes</h2>
          <button className="btn btn-sm" onClick={() => setComposeOpen(true)}>Compose</button>
        </div>
        <ul className="space-y-1">
          {folders.map(f => (
            <li key={f.id}>
              <button className={`w-full text-left px-2 py-1 rounded hover:bg-muted ${activeFolder===f.id?"bg-muted":""}`} onClick={()=>setActiveFolder(f.id)}>
                {f.name}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-3">
          <input className="w-full input input-sm" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
      </aside>

      <main className="col-span-5 border-r overflow-y-auto">
        <MessageList threads={threads} onOpen={async (t)=>{ setActiveThread(null); const full = await jmap.getThread(t.id); setActiveThread(full || t); }}/>
      </main>

      <section className="col-span-5 overflow-y-auto">
        <ThreadView thread={activeThread} onReply={(msg)=>{ setReplyTo(msg); setComposeOpen(true); }}/>
      </section>

      <Composer open={composeOpen} onOpenChange={setComposeOpen} replyTo={replyTo} />
    </div>
  );
};
