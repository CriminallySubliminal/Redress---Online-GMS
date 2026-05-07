// User & Authentication Types

export interface Role {
  id: number;
  name: 'student' | 'staff' | 'admin';
}

export interface UserRole {
  id: number;
  role: number;
  role_name: string;
}

export interface Profile {
  full_name: string;
  age: number | null;
  gender: string;
  department: string;
}

export interface StudentProfile {
  grievances_submitted: number;
  grievances_addressed: number;
  satisfaction_score: number;
}

export interface StaffProfile {
  is_assigned: boolean;
}

export interface PrivacySettings {
  profile_visibility: 'public' | 'private' | 'staff_only';
}

export interface User {
  id: string; // UUID
  email: string;
  username: string;
  is_private: boolean;
  institutional_id: string;
  is_verified: boolean;
  roles: UserRole[];
  profile: Profile;
  student_profile: StudentProfile | null;
  staff_profile: StaffProfile | null;
  privacy_settings: PrivacySettings;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

// Grievance Types

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Attachment {
  id: number;
  grievance: string; // UUID
  file: string; // URL
  uploaded_by: string; // UUID
  created_at: string;
}

export interface GrievanceStatusHistory {
  id: number;
  grievance: string; // UUID
  changed_by: string | null; // UUID
  old_status: string | null;
  new_status: string;
  note: string;
  timestamp: string;
}

export interface Grievance {
  id: string; // UUID
  title: string;
  description: string;
  created_by_info: { 
    id: string | null; 
    email?: string; 
    name?: string;
    full_name?: string;
    department?: string;
    institutional_id?: string;
  };
  is_anonymous: boolean;
  is_public: boolean;
  status: 'open' | 'in_progress' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_staff: string | null; // UUID
  assigned_staff_info?: { id: string; name: string; department: string; } | null;
  category: number | null;
  category_name: string;
  location?: string;
  due_date: string | null;
  attachments: Attachment[];
  status_history: GrievanceStatusHistory[];
  comments: Comment[];
  created_at: string;
  updated_at: string;
}

// Interaction Types

export interface GrievanceInteraction {
  id: number;
  user: string; // UUID
  grievance: string; // UUID
  type: 'upvote' | 'downvote';
  created_at: string;
}

export interface Comment {
  id: number;
  grievance: string; // UUID
  user: string; // UUID
  created_by_info: { id: string | null; name?: string; email?: string; is_staff?: boolean; };
  content: string;
  is_anonymous: boolean;
  created_at: string;
}

// Notification Types

export interface Notification {
  id: number;
  recipient: string; // UUID
  type: string;
  reference_id: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}
