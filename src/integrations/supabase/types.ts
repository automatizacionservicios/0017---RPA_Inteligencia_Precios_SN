// Tipos utilitarios generados para trabajar con Supabase (Postgres)
// Añadimos comentarios en español para entender cada línea y propósito.

export type Json =
  | string // Cadena JSON
  | number // Número JSON
  | boolean // Booleano JSON
  | null // Nulo JSON
  | { [key: string]: Json | undefined } // Objeto JSON (values anidados); `undefined` se permite para tipos parciales
  | Json[] // Arreglo de valores JSON

export type Database = {
  // Permite instanciar createClient con las opciones correctas automáticamente
  // en lugar de createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5" // Versión de PostgREST esperada por el cliente
  }
  public: {
    // Esquema "public" de la base de datos; aquí se listan tablas, vistas, etc.
    Tables: {
      [_ in never]: never // No hay tablas definidas tipadas en este archivo
    }
    Views: {
      [_ in never]: never // No hay vistas definidas tipadas
    }
    Functions: {
      [_ in never]: never // No hay funciones RPC definidas tipadas
    }
    Enums: {
      [_ in never]: never // No hay enumeraciones definidas tipadas
    }
    CompositeTypes: {
      [_ in never]: never // No hay tipos compuestos definidos tipados
    }
  }
}

// Elimina la metadata interna para exponer sólo lo relevante al consumidor
type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

// Alias al esquema por defecto ("public") dentro de la base de datos
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

// Obtiene el tipo de fila (Row) de una tabla o vista del esquema por defecto o del esquema indicado
export type Tables<
  // Puede ser el nombre de una tabla/vista del esquema por defecto o un objeto con `schema`
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  // Si se especifica `schema`, este segundo genérico es el nombre de la tabla/vista dentro de ese esquema
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals // Rama cuando se pasa `{ schema: ... }`
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R // Extrae el tipo `Row` de la tabla/vista
    }
    ? R // Devuelve `Row`
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"]) // Rama cuando se pasa el nombre directo del recurso en el esquema por defecto
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R // Extrae el `Row`
      }
      ? R
      : never
    : never

// Obtiene el payload válido para `insert` en una tabla del esquema por defecto o del indicado
export type TablesInsert<
  // Nombre de tabla del esquema por defecto o `schema` explícito
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  // Cuando hay `schema`, el segundo genérico es el nombre de la tabla de ese esquema
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals // Rama con `schema`
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I // Extrae el tipo `Insert`
    }
    ? I // Devuelve `Insert`
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] // Rama esquema por defecto
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

// Obtiene el payload válido para `update` en una tabla del esquema por defecto o del indicado
export type TablesUpdate<
  // Nombre de tabla del esquema por defecto o `schema` explícito
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  // Cuando hay `schema`, el segundo genérico es el nombre de la tabla de ese esquema
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals // Rama con `schema`
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U // Extrae el tipo `Update`
    }
    ? U // Devuelve `Update`
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] // Rama esquema por defecto
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

// Devuelve el tipo de un enum por nombre, en el esquema por defecto o uno explícito
export type Enums<
  // Nombre del enum del esquema por defecto o `schema` explícito
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  // Si hay `schema`, este parámetro es el nombre del enum dentro de ese esquema
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals // Rama con `schema`
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] // Rama esquema por defecto
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

// Devuelve el tipo de un composite type (tipo compuesto) por nombre
export type CompositeTypes<
  // Nombre del tipo compuesto del esquema por defecto o `schema` explícito
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  // Si hay `schema`, este parámetro es el nombre del tipo compuesto dentro de ese esquema
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals // Rama con `schema`
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] // Rama esquema por defecto
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

// Constantes auxiliares; aquí podríamos exponer enums generados
export const Constants = {
  public: {
    Enums: {}, // No hay enums definidos en este dump de tipos
  },
} as const // `as const` para literalidad total y lectura de tipos precisa
