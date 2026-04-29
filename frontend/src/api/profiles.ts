import type { EditableData, LockedData, Paginated, Profile } from "../types/api";
import client from "./client";

export const listProfiles = () =>
  client.get<Paginated<Profile>>("/profiles/").then((r) => r.data);

export const getProfile = (profileId: string) =>
  client.get<Profile>(`/profiles/${profileId}/`).then((r) => r.data);

export const createProfile = (data: {
  profile_id: string;
  locked_data: LockedData;
  editable_data: EditableData;
}) => client.post<Profile>("/profiles/", data).then((r) => r.data);

export const updateProfile = (
  profileId: string,
  data: Partial<{ locked_data: LockedData; editable_data: EditableData }>
) => client.patch<Profile>(`/profiles/${profileId}/`, data).then((r) => r.data);

export const deleteProfile = (profileId: string) =>
  client.delete(`/profiles/${profileId}/`);
