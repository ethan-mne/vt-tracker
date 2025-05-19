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
          email?: string;
          address?: string;
          postal_code?: string;
          note?: string;
          document_url?: string;
          latitude?: number;
          longitude?: number;
          created_by: string;
          created_at: Date;
        };
        Insert: {
          id?: string;
          first_name: string;
          email: string | null;
          address: string | null;
          postal_code: string | null;
          latitude: number | null;
          longitude: number | null;
          note: string | null;
          document_url: string | null;
          last_name: string;
          phone: string;
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string | null;
          address?: string | null;
          postal_code?: string |null;
          latitude?: number | null;
          longitude?: number | null;
          note?: string | null;
          document_url?: string | null;
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