import React, { useEffect, useState } from "react";
import type { ComposeDraft, MailMessage } from "../types";
import { useEmailCtx } from "../EmailContext";

export const Composer: React.FC<{ open: boolean; onOpenChange: (v:boolean)=>void; replyTo?: MailMessage | null; }> = ({ open, onOpenChange, replyTo }) => {
  const { jmap } = useEmailCtx();
  const [draft, setDraft] = useState<ComposeDraft>({ to: [], subject: "" });
  useEffect(()=>{
    if (replyTo) {
      setDraft({
        to: replyTo.from,
        subject: replyTo.subject?.startsWith("Re:") ? replyTo.subject : `Re: ${replyTo.subject}`,
        html: `<br/><blockquote>${replyTo.html || replyTo.text}</blockquote>`
      });
    }
  }, [replyTo]);
  if (!open) return null;
  const send = async () => {
    await jmap.send(draft);
    onOpenChange(false);
  };
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-background rounded-xl shadow-xl w-[800px] max-w-[95vw] max-h-[90vh] overflow-hidden border">
        <header className="p-3 border-b flex items-center justify-between">
          <div className="font-medium">New Message</div>
          <button className="btn btn-ghost btn-sm" onClick={()=>onOpenChange(false)}>Close</button>
        </header>
        <div className="p-3 space-y-2">
          <input className="w-full input" placeholder="To" value={draft.to.map(a=>a.email).join(", ")} onChange={e=>setDraft({...draft, to: e.target.value.split(",").map(x=>({email:x.trim()}))})}/>
          <input className="w-full input" placeholder="Subject" value={draft.subject} onChange={e=>setDraft({...draft, subject: e.target.value})}/>
          <textarea className="w-full textarea h-72" placeholder="Message…" value={draft.html} onChange={e=>setDraft({...draft, html: e.target.value})}/>
          <div className="flex justify-between">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" onChange={e=>setDraft({...draft, encrypt: e.target.checked})}/> Encrypt</label>
            <div className="space-x-2">
              <button className="btn btn-ghost btn-sm" onClick={()=>onOpenChange(false)}>Discard</button>
              <button className="btn btn-sm" onClick={send}>Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
