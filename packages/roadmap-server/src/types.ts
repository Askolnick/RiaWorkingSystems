export type RoadmapStatus = 'open' | 'in-progress' | 'completed' | 'cancelled'

export interface RoadmapItem {
  id: string
  tenantId: string
  projectId?: string
  slug: string
  title: string
  description?: string
  status: RoadmapStatus
  public: boolean
  createdBy?: string
  createdAt: string
  updatedAt: string
  comments?: RoadmapComment[]
  _count?: {
    comments: number
  }
}

export interface RoadmapComment {
  id: string
  tenantId: string
  roadmapItemId: string
  authorId?: string
  body: string
  createdAt: string
  updatedAt: string
  author?: {
    id: string
    displayName: string
    avatarUrl?: string
  }
}

export interface CreateRoadmapItemData {
  projectId?: string
  slug: string
  title: string
  description?: string
  status?: RoadmapStatus
  public?: boolean
}

export interface UpdateRoadmapItemData {
  slug?: string
  title?: string
  description?: string
  status?: RoadmapStatus
  public?: boolean
}

export interface CreateRoadmapCommentData {
  roadmapItemId: string
  body: string
}

export interface RoadmapItemWithComments extends RoadmapItem {
  comments: RoadmapComment[]
}