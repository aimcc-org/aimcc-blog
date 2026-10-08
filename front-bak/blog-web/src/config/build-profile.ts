import { profiles } from '../../profiles.config.mjs';
import type { ProfileName, SiteProfile } from '@/types/profile';

const name = import.meta.env.SITE_PROFILE as ProfileName;
const selected = profiles[name];

if (!selected) {
  throw new Error(`No profile config found for "${name}".`);
}

export const currentProfile = selected as SiteProfile;
export const currentProfileName = name;
