export class AnchorPoint {
  id!: string;
  name!: string;
  lat!: number;
  lng!: number;
  business_hours!: string | null;
  phone!: string | null;
  image!: string | null;
  active!: boolean;
  category_id!: string | null;
  created_at!: Date;
  updated_at!: Date;
  deleted_at!: Date | null;
}
