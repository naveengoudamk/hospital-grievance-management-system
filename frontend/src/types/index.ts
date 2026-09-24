export type Role = 'ROLE_ADMIN' | 'ROLE_COMMITTEE_MEMBER';

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ASSIGNED'
  | 'INVESTIGATION'
  | 'ACTION_TAKEN'
  | 'RESOLVED'
  | 'REJECTED'
  | 'CLOSED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type InvestigationStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export type AuditAction =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'COMPLAINT_SUBMITTED'
  | 'COMPLAINT_ASSIGNED'
  | 'STATUS_CHANGED'
  | 'PRIORITY_CHANGED'
  | 'INVESTIGATION_STARTED'
  | 'INVESTIGATION_UPDATED'
  | 'INVESTIGATION_COMPLETED'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DISABLED'
  | 'USER_ENABLED'
  | 'QR_GENERATED'
  | 'CATEGORY_CREATED'
  | 'CATEGORY_UPDATED'
  | 'LOCATION_CREATED'
  | 'LOCATION_UPDATED'
  | 'DATA_EXPORTED';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  role: Role;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: Role;
  expiresInMs: number;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  severityDefault?: string;
  active: boolean;
  createdAt: string;
}

export interface LocationItem {
  id: number;
  hospitalId: number;
  name: string;
  description?: string;
  floorNumber?: string;
  active: boolean;
  createdAt: string;
}

export interface Attachment {
  id: number;
  complaintId: number;
  originalFileName: string;
  storedFileName: string;
  fileType: string;
  fileSize: number;
  downloadUrl: string;
  uploadedAt: string;
}

export interface Assignment {
  id: number;
  complaintId: number;
  committeeMemberId: number;
  committeeMemberName: string;
  committeeMemberEmail: string;
  assignedById: number;
  assignedByName: string;
  assignedAt: string;
  remarks?: string;
  active: boolean;
}

export interface Investigation {
  id: number;
  complaintId: number;
  investigatorId: number;
  investigatorName: string;
  investigationSummary: string;
  findings?: string;
  actionTaken?: string;
  investigationStatus: InvestigationStatus;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StatusHistory {
  id: number;
  complaintId: number;
  oldStatus?: ComplaintStatus;
  newStatus: ComplaintStatus;
  changedBy: string;
  remarks?: string;
  changedAt: string;
}

export interface AuditLog {
  id: number;
  userId?: number;
  username?: string;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface ComplaintSummary {
  id: number;
  complaintReference: string;
  categoryName: string;
  categoryId?: number;
  locationName: string;
  locationId?: number;
  descriptionSnippet: string;
  isAnonymous: boolean;
  complainantName: string;
  priority: Priority;
  status: ComplaintStatus;
  submittedAt: string;
  incidentDate?: string;
  attachmentCount: number;
  assignedMemberName?: string;
  assignedMemberId?: number;
  investigationStatus?: string;
}

export interface ComplaintDetail {
  id: number;
  complaintReference: string;
  hospitalId: number;
  hospitalName?: string;
  categoryId: number;
  categoryName: string;
  locationId?: number;
  locationName?: string;
  description: string;
  isAnonymous: boolean;
  complainantName?: string;
  complainantPhone?: string;
  complainantEmail?: string;
  preferredContactMethod?: string;
  incidentDate?: string;
  priority: Priority;
  status: ComplaintStatus;
  submittedAt: string;
  updatedAt: string;
  resolvedAt?: string;
  attachments: Attachment[];
  assignments: Assignment[];
  investigations: Investigation[];
  statusHistories: StatusHistory[];
  auditLogs: AuditLog[];
}

export interface TrackingTimelineStep {
  stepKey: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
  timestamp?: string;
}

export interface TrackComplaintResponse {
  complaintReference: string;
  categoryName: string;
  locationName: string;
  currentStatus: ComplaintStatus;
  statusDisplayName: string;
  statusMessage: string;
  submittedAt: string;
  incidentDate?: string;
  resolvedAt?: string;
  attachmentCount: number;
  timeline: TrackingTimelineStep[];
}

export interface PublicComplaintResponse {
  complaintReference: string;
  trackingToken: string;
  status: string;
  categoryName: string;
  locationName: string;
  submittedAt: string;
  message: string;
}

export interface QrConfig {
  id: number;
  name: string;
  publicUrl: string;
  qrCodeBase64: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalComplaints: number;
  newComplaints: number;
  underReview: number;
  assigned: number;
  underInvestigation: number;
  actionTaken: number;
  resolved: number;
  closed: number;
  rejected: number;
  criticalCount: number;
  categoryDistribution: Record<string, number>;
  locationDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
  recentComplaints: ComplaintSummary[];
  criticalComplaints: ComplaintSummary[];
}
