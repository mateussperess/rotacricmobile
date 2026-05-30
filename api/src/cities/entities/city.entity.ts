export class City {
  id!: string;
  name!: string;
  about!: string | null;
  lat!: number;
  lng!: number;
  zoom!: number;
  banner_image!: string | null;
  visible!: boolean;
  active!: boolean;
  created_at!: Date;
  updated_at!: Date;
  deleted_at!: Date | null;
}
