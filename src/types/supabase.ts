export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      contacts: {
        Row: {
          id: string;
          name: string;
          phone: string;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          created_at?: string;
          created_by?: string;
        };
      };
      user_credits: {
        Row: {
          id: string;
          user_id: string;
          credits: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          credits: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          credits?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Contact = Database['public']['Tables']['contacts']['Row'];
export type NewContact = Database['public']['Tables']['contacts']['Insert'];
export type UserCredits = Database['public']['Tables']['user_credits']['Row'];