export interface BranchType {
  id: string;
  name: string;
  slug: string;
  pic_emails: string;
  pic_phone_numbers: string;

  created_by?: string;
  updated_by?: string;
  deleted_by?: string;
  deleted_at?: string;
  created_at?: string;
  updated_at?: string;
}