export interface UserType {
  id: string;
  name: string;
  email: string;
  role: string;
  business_category: string;
  verified_email: boolean;
  company_id?: string;
}