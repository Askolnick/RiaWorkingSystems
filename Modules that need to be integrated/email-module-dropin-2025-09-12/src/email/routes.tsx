import React from "react";
import { EmailPage } from "./EmailPage";

export const emailRoutes = [
  { path: "/comms/email", element: <EmailPage />, title: "Email", icon: "Mail" },
  { path: "/comms/email/:threadId", element: <EmailPage />, hidden: true },
];
