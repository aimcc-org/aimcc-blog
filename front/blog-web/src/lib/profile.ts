import mockProfile from "@/data/profile.mock.json";
import type { PersonalProfile } from "@/types/profile";

// Replace this loader with /api/about when the profile API is connected.
export async function getPersonalProfile(): Promise<PersonalProfile> {
  return mockProfile;
}
