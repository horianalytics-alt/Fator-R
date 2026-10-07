export type TaxRegime = 'mei' | 'simples' | 'lucro_presumido' | 'lucro_real' | 'outro';
export type PaymentStatus = 'em_dia' | 'devedor';
export type TaskStatus = 'pendente' | 'em_andamento' | 'concluida' | 'atrasada';
export type DocStatus = 'aguardando' | 'recebido';
export type HoldStatus = 'retido' | 'liberado';

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          document: string | null;
          phone: string | null;
          email: string | null;
          tax_regime: TaxRegime;
          is_active: boolean;
          payment_status: PaymentStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          document?: string | null;
          phone?: string | null;
          email?: string | null;
          tax_regime?: TaxRegime;
          is_active?: boolean;
          payment_status?: PaymentStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          document?: string | null;
          phone?: string | null;
          email?: string | null;
          tax_regime?: TaxRegime;
          is_active?: boolean;
          payment_status?: PaymentStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      obligation_types: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          default_due_day: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          default_due_day?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          default_due_day?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      client_obligations: {
        Row: {
          id: string;
          user_id: string;
          client_id: string;
          obligation_type_id: string;
          due_day: number;
          is_active: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          client_id: string;
          obligation_type_id: string;
          due_day: number;
          is_active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          client_id?: string;
          obligation_type_id?: string;
          due_day?: number;
          is_active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          client_obligation_id: string;
          client_id: string;
          reference_month: string;
          due_date: string;
          status: TaskStatus;
          completed_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          client_obligation_id: string;
          client_id: string;
          reference_month: string;
          due_date: string;
          status?: TaskStatus;
          completed_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          client_obligation_id?: string;
          client_id?: string;
          reference_month?: string;
          due_date?: string;
          status?: TaskStatus;
          completed_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      pending_docs: {
        Row: {
          id: string;
          user_id: string;
          client_id: string;
          description: string;
          reference_month: string | null;
          status: DocStatus;
          requested_at: string;
          received_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          client_id: string;
          description: string;
          reference_month?: string | null;
          status?: DocStatus;
          requested_at?: string;
          received_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          client_id?: string;
          description?: string;
          reference_month?: string | null;
          status?: DocStatus;
          requested_at?: string;
          received_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      holds: {
        Row: {
          id: string;
          user_id: string;
          client_id: string;
          document_description: string;
          reason: string;
          held_since: string;
          released_at: string | null;
          status: HoldStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          client_id: string;
          document_description: string;
          reason?: string;
          held_since?: string;
          released_at?: string | null;
          status?: HoldStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          client_id?: string;
          document_description?: string;
          reason?: string;
          held_since?: string;
          released_at?: string | null;
          status?: HoldStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      v_tasks_with_status: {
        Row: Database['public']['Tables']['tasks']['Row'] & {
          client_name: string;
          client_document: string | null;
          obligation_name: string;
          computed_status: string;
        };
      };
    };
  };
}

export type Client = Database['public']['Tables']['clients']['Row'];
export type ObligationType = Database['public']['Tables']['obligation_types']['Row'];
export type ClientObligation = Database['public']['Tables']['client_obligations']['Row'];
export type Task = Database['public']['Tables']['tasks']['Row'];
export type PendingDoc = Database['public']['Tables']['pending_docs']['Row'];
export type Hold = Database['public']['Tables']['holds']['Row'];
