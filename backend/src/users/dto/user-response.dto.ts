export class UserResponseDto {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  birth_date: string | null;
  document: string | null;
  document_type: string | null;
  social_network: string | null;
  social_network_type: string | null;
  profile_picture_path: string | null;
  created_at: Date;
  updated_at: Date;

  constructor(user: any) {
    this.id = user.id?.toString() ?? '';
    this.username = user.username ?? '';
    this.first_name = user.first_name ?? '';
    this.last_name = user.last_name ?? '';
    this.email = user.email ?? '';

    const profile = user.profile;
    if (profile?.birth_date) {
      const d = new Date(profile.birth_date);
      this.birth_date = !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : null;
    } else {
      this.birth_date = null;
    }

    this.document = profile?.document ?? null;
    this.document_type = profile?.document_type ?? null;
    this.social_network = profile?.social_network ?? null;
    this.social_network_type = profile?.social_network_type ?? null;
    this.profile_picture_path = profile?.profile_picture_path ?? null;

    this.created_at = user.date_joined ?? new Date();
    this.updated_at = profile?.updated_at ?? new Date();
  }
}
