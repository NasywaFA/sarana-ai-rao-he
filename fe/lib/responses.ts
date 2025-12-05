export interface CommonResponse<T = any> {
  isSuccess: boolean;
  data: T | null;
  message: string;
}