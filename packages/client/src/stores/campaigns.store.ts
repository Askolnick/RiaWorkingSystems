import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'social' | 'print';
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate: string;
  endDate?: string;
  targetAudience: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface CampaignTemplate {
  id: string;
  name: string;
  type: Campaign['type'];
  description: string;
  content: string;
  tags: string[];
}

interface CampaignAnalytics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalBudget: number;
  totalSpent: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  averageCTR: number;
  averageConversionRate: number;
}

interface CampaignsStore {
  // Campaigns
  campaigns: Campaign[];
  currentCampaign: Campaign | null;
  campaignsLoading: boolean;
  campaignsError: string | null;
  
  // Templates
  templates: CampaignTemplate[];
  templatesLoading: boolean;
  
  // Analytics
  analytics: CampaignAnalytics;
  analyticsLoading: boolean;
  
  // Filters
  filters: {
    status?: Campaign['status'];
    type?: Campaign['type'];
    search: string;
  };
  
  // Actions
  fetchCampaigns: () => Promise<void>;
  fetchCampaign: (id: string) => Promise<void>;
  createCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Campaign>;
  updateCampaign: (id: string, updates: Partial<Campaign>) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  duplicateCampaign: (id: string) => Promise<Campaign>;
  
  // Campaign control
  startCampaign: (id: string) => Promise<void>;
  pauseCampaign: (id: string) => Promise<void>;
  stopCampaign: (id: string) => Promise<void>;
  
  // Templates
  fetchTemplates: () => Promise<void>;
  createTemplate: (template: Omit<CampaignTemplate, 'id'>) => Promise<CampaignTemplate>;
  
  // Analytics
  fetchAnalytics: () => Promise<void>;
  
  // Filters
  setFilter: (key: keyof CampaignsStore['filters'], value: any) => void;
  clearFilters: () => void;
}

// Mock data generators
const generateMockCampaigns = (): Campaign[] => [
  {
    id: '1',
    name: 'Spring Investment Newsletter',
    type: 'email',
    status: 'active',
    startDate: '2024-03-01',
    endDate: '2024-03-31',
    targetAudience: 'High Net Worth Clients',
    budget: 5000,
    spent: 1250,
    impressions: 15000,
    clicks: 450,
    conversions: 23,
    description: 'Monthly newsletter highlighting spring investment opportunities',
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-03-10T00:00:00Z'
  },
  {
    id: '2',
    name: 'Social Media Brand Awareness',
    type: 'social',
    status: 'active',
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    targetAudience: 'All Prospects',
    budget: 10000,
    spent: 3500,
    impressions: 45000,
    clicks: 1200,
    conversions: 65,
    description: 'Brand awareness campaign across social media platforms',
    createdAt: '2023-12-15T00:00:00Z',
    updatedAt: '2024-03-05T00:00:00Z'
  },
  {
    id: '3',
    name: 'Q1 Client Retention',
    type: 'email',
    status: 'completed',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    targetAudience: 'Existing Clients',
    budget: 3000,
    spent: 2850,
    impressions: 8500,
    clicks: 340,
    conversions: 28,
    description: 'Client retention campaign for Q1',
    createdAt: '2023-12-01T00:00:00Z',
    updatedAt: '2024-03-31T00:00:00Z'
  }
];

const generateMockTemplates = (): CampaignTemplate[] => [
  {
    id: '1',
    name: 'Newsletter Template',
    type: 'email',
    description: 'Monthly newsletter template',
    content: 'Dear {{client_name}}, This month\'s investment insights...',
    tags: ['newsletter', 'email', 'monthly']
  },
  {
    id: '2',
    name: 'Social Media Post',
    type: 'social',
    description: 'Standard social media post template',
    content: 'Did you know? {{insight}} Learn more: {{link}}',
    tags: ['social', 'awareness', 'insights']
  }
];

const generateMockAnalytics = (): CampaignAnalytics => ({
  totalCampaigns: 8,
  activeCampaigns: 3,
  totalBudget: 25000,
  totalSpent: 12500,
  totalImpressions: 125000,
  totalClicks: 3500,
  totalConversions: 180,
  averageCTR: 2.8,
  averageConversionRate: 5.1
});

export const useCampaignsStore = create<CampaignsStore>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      campaigns: [],
      currentCampaign: null,
      campaignsLoading: false,
      campaignsError: null,
      
      templates: [],
      templatesLoading: false,
      
      analytics: generateMockAnalytics(),
      analyticsLoading: false,
      
      filters: {
        search: '',
      },
      
      // Actions
      fetchCampaigns: async () => {
        set(state => {
          state.campaignsLoading = true;
          state.campaignsError = null;
        });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          set(state => {
            state.campaigns = generateMockCampaigns();
            state.campaignsLoading = false;
          });
        } catch (error) {
          set(state => {
            state.campaignsError = error instanceof Error ? error.message : 'Failed to fetch campaigns';
            state.campaignsLoading = false;
          });
        }
      },
      
      fetchCampaign: async (id: string) => {
        try {
          const campaigns = generateMockCampaigns();
          const campaign = campaigns.find(c => c.id === id);
          if (!campaign) throw new Error('Campaign not found');
          
          set(state => {
            state.currentCampaign = campaign;
          });
        } catch (error) {
          throw error;
        }
      },
      
      createCampaign: async (campaignData) => {
        const newCampaign: Campaign = {
          ...campaignData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        set(state => {
          state.campaigns.unshift(newCampaign);
        });
        
        return newCampaign;
      },
      
      updateCampaign: async (id: string, updates: Partial<Campaign>) => {
        set(state => {
          const index = state.campaigns.findIndex(c => c.id === id);
          if (index !== -1) {
            state.campaigns[index] = {
              ...state.campaigns[index],
              ...updates,
              updatedAt: new Date().toISOString()
            };
          }
          if (state.currentCampaign?.id === id) {
            state.currentCampaign = {
              ...state.currentCampaign,
              ...updates,
              updatedAt: new Date().toISOString()
            };
          }
        });
      },
      
      deleteCampaign: async (id: string) => {
        set(state => {
          state.campaigns = state.campaigns.filter(c => c.id !== id);
          if (state.currentCampaign?.id === id) {
            state.currentCampaign = null;
          }
        });
      },
      
      duplicateCampaign: async (id: string) => {
        const campaign = get().campaigns.find(c => c.id === id);
        if (!campaign) throw new Error('Campaign not found');
        
        const duplicate: Campaign = {
          ...campaign,
          id: Date.now().toString(),
          name: `${campaign.name} (Copy)`,
          status: 'draft',
          spent: 0,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        set(state => {
          state.campaigns.unshift(duplicate);
        });
        
        return duplicate;
      },
      
      startCampaign: async (id: string) => {
        await get().updateCampaign(id, { status: 'active' });
      },
      
      pauseCampaign: async (id: string) => {
        await get().updateCampaign(id, { status: 'paused' });
      },
      
      stopCampaign: async (id: string) => {
        await get().updateCampaign(id, { status: 'completed', endDate: new Date().toISOString().split('T')[0] });
      },
      
      fetchTemplates: async () => {
        set(state => { state.templatesLoading = true; });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 300));
          set(state => {
            state.templates = generateMockTemplates();
            state.templatesLoading = false;
          });
        } catch (error) {
          set(state => { state.templatesLoading = false; });
        }
      },
      
      createTemplate: async (templateData) => {
        const newTemplate: CampaignTemplate = {
          ...templateData,
          id: Date.now().toString()
        };
        
        set(state => {
          state.templates.push(newTemplate);
        });
        
        return newTemplate;
      },
      
      fetchAnalytics: async () => {
        set(state => { state.analyticsLoading = true; });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 400));
          set(state => {
            state.analytics = generateMockAnalytics();
            state.analyticsLoading = false;
          });
        } catch (error) {
          set(state => { state.analyticsLoading = false; });
        }
      },
      
      setFilter: (key, value) => {
        set(state => {
          state.filters[key] = value;
        });
      },
      
      clearFilters: () => {
        set(state => {
          state.filters = { search: '' };
        });
      },
    }))
  )
);