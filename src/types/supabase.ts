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
          first_name: string;
          last_name: string;
          phone: string;
          email: string | null;
          address: string | null;
          postal_code: string | null;
          note: string | null;
          document_url: string | null;
          latitude: number | null;
          longitude: number | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          phone: string;
          email: string | null;
          address: string | null;
          postal_code: string | null;
          note: string | null;
          document_url: string | null;
          latitude: number | null;
          longitude: number | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          phone?: string;
          email?: string | null;
          address?: string | null;
          postal_code?: string | null;
          note?: string | null;
          document_url?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          created_by?: string;
          created_at?: string;
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