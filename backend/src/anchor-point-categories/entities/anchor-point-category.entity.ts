export class AnchorPointCategory {
  id!: string;
  name!: string;
  icon_name!: string;
  icon_image!: string | null; // era String? no schema
  active!: boolean;
  created_at!: Date;
  updated_at!: Date;
  deleted_at!: Date | null; // faltava esse campo
}
