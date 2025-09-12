import React, { createContext, useContext } from "react";
import type { AuthAdapter, DataAdapter, CampaignAdapter, JMAPClient } from "./types";

type Ctx = {
  auth: AuthAdapter;
  data: DataAdapter;
  campaigns: CampaignAdapter;
  jmap: JMAPClient;
};

const EmailCtx = createContext<Ctx | null>(null);

export const EmailProvider: React.FC<React.PropsWithChildren<Ctx>> = ({ children, ...value }) => {
  return <EmailCtx.Provider value={value}>{children}</EmailCtx.Provider>;
};

export const useEmailCtx = () => {
  const ctx = useContext(EmailCtx);
  if (!ctx) throw new Error("EmailProvider missing");
  return ctx;
};
