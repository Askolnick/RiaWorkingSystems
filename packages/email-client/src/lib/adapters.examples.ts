import type { AuthAdapter, CampaignAdapter, DataAdapter, MailMessage, MailLink } from "../types";

export const AuthExample: AuthAdapter = {
  async getAuthHeaders() {
    // Example: pull token from your auth state
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};

export const DataExample: DataAdapter = {
  async createTaskFromEmail(msg: MailMessage, init) {
    // Example: call your Tasks API and create a back-link
    console.log("createTaskFromEmail", { msg, init });
    return { taskId: "task_demo" };
  },
  async createLink(link: MailLink) {
    console.log("createLink", link);
  },
  async findLinksForMessage(messageId: string) {
    console.log("findLinksForMessage", messageId);
    return [];
  },
  async searchPeopleOrgs(q: string) {
    return [];
  }
};

export const CampaignListmonkExample: CampaignAdapter = {
  async startCampaignFromSelection(opts) {
    // Call your server proxy → Listmonk API (avoid exposing API keys)
    console.log("Listmonk campaign", opts);
    return { campaignId: "cmp_demo" };
  }
};
