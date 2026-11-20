export type Decision = "like" | "pass";
export interface Profile {
  id: string;
  name: string;
  age: number;
  photo: string;
  bio: string;
  location: string;
  interests: string[];
}
export interface Match {
  profile: Profile;
  matchedAt: string;
}
export interface SwipeResult {
  createdMatch: boolean;
  match: Match | null;
}
