export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type DishType = "main" | "side";
export type MenuType = "today" | "week";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string | null;
          display_name: string | null;
          id: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          display_name?: string | null;
          id: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          display_name?: string | null;
          id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      recipes: {
        Row: {
          created_at: string | null;
          dish_type: DishType;
          cost_rank: "S" | "A" | "B" | "C" | null;
          id: string;
          instructions: string | null;
          name: string;
          servings: number | null;
           time_minutes: number | null;
          source_url: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          dish_type: DishType;
          cost_rank?: "S" | "A" | "B" | "C" | null;
          id?: string;
          instructions?: string | null;
          name: string;
          servings?: number | null;
          time_minutes?: number | null;
          source_url?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          dish_type?: DishType;
          cost_rank?: "S" | "A" | "B" | "C" | null;
          id?: string;
          instructions?: string | null;
          name?: string;
          servings?: number | null;
          time_minutes?: number | null;
          source_url?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recipes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      recipe_ingredients: {
        Row: {
          amount: number | null;
          id: string;
          name: string;
          note: string | null;
          recipe_id: string;
          unit: string | null;
        };
        Insert: {
          amount?: number | null;
          id?: string;
          name: string;
          note?: string | null;
          recipe_id: string;
          unit?: string | null;
        };
        Update: {
          amount?: number | null;
          id?: string;
          name?: string;
          note?: string | null;
          recipe_id?: string;
          unit?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          }
        ];
      };
      menus: {
        Row: {
          created_at: string | null;
          end_date: string;
          id: string;
          menu_type: MenuType;
          start_date: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          end_date: string;
          id?: string;
          menu_type: MenuType;
          start_date: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          end_date?: string;
          id?: string;
          menu_type?: MenuType;
          start_date?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "menus_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      menu_items: {
        Row: {
          id: string;
          menu_id: string;
          recipe_id: string;
          slot: DishType;
          target_date: string;
        };
        Insert: {
          id?: string;
          menu_id: string;
          recipe_id: string;
          slot: DishType;
          target_date: string;
        };
        Update: {
          id?: string;
          menu_id?: string;
          recipe_id?: string;
          slot?: DishType;
          target_date?: string;
        };
        Relationships: [
          {
            foreignKeyName: "menu_items_menu_id_fkey";
            columns: ["menu_id"];
            isOneToOne: false;
            referencedRelation: "menus";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "menu_items_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          }
        ];
      };
      shopping_lists: {
        Row: {
          created_at: string | null;
          id: string;
          source_menu_id: string | null;
          title: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          source_menu_id?: string | null;
          title?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          source_menu_id?: string | null;
          title?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shopping_lists_source_menu_id_fkey";
            columns: ["source_menu_id"];
            isOneToOne: false;
            referencedRelation: "menus";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shopping_lists_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      shopping_list_items: {
        Row: {
          amount: number | null;
          checked: boolean | null;
          id: string;
          name: string;
          shopping_list_id: string;
          unit: string | null;
        };
        Insert: {
          amount?: number | null;
          checked?: boolean | null;
          id?: string;
          name: string;
          shopping_list_id: string;
          unit?: string | null;
        };
        Update: {
          amount?: number | null;
          checked?: boolean | null;
          id?: string;
          name?: string;
          shopping_list_id?: string;
          unit?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "shopping_list_items_shopping_list_id_fkey";
            columns: ["shopping_list_id"];
            isOneToOne: false;
            referencedRelation: "shopping_lists";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
