export type UserRole = 'ADMIN' | 'PROJECT_LEAD' | 'EMPLOYEE'

export type TaskStatus = 'BACKLOG' | 'PLANNING' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  position?: string
  avatar?: string
  theme?: string
  createdAt: string
  updatedAt?: string
}

export interface ProjectMember {
  id?: string
  userId: string
  projectId: string
  role: string
  user?: User
}

export interface Project {
  id: string
  name: string
  description?: string
  status: ProjectStatus
  leadId: string
  lead?: User
  startDate?: string
  endDate?: string
  members?: ProjectMember[]
  _count?: {
    tasks: number
  }
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  identifier?: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  projectId: string
  project?: { id: string; name: string }
  creatorId: string
  creator?: User
  assigneeId?: string
  assignee?: User
  deadline?: string
  tags?: string | null
  attachments?: string | null
  _count?: {
    comments: number
  }
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  text: string
  taskId: string
  authorId: string
  author?: User
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string
  type: string
  message: string
  read: boolean
  userId: string
  taskId?: string
  projectId?: string
  createdAt: string
}
