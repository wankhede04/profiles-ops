import type { EditableData, Paginated, ProfileVersion } from "../types/api";
import client from "./client";

export const tailorResume = (
  profileId: string,
  data: { job_title: string; company: string; jd_text: string }
) =>
  client
    .post<ProfileVersion>(`/profiles/${profileId}/tailor/`, data)
    .then((r) => r.data);

export const listVersions = (profileId: string) =>
  client
    .get<Paginated<ProfileVersion>>(`/profiles/${profileId}/versions/`)
    .then((r) => r.data);

export const getVersion = (profileId: string, versionId: number) =>
  client
    .get<ProfileVersion>(`/profiles/${profileId}/versions/${versionId}/`)
    .then((r) => r.data);

export const finalizeVersion = (
  profileId: string,
  versionId: number,
  finalEditable: EditableData
) =>
  client
    .post<ProfileVersion>(`/profiles/${profileId}/versions/${versionId}/finalize/`, {
      final_editable: finalEditable,
    })
    .then((r) => r.data);

export const exportVersion = async (
  profileId: string,
  versionId: number
): Promise<{ blob: Blob; filename: string; applicationId: string }> => {
  const response = await client.post(
    `/profiles/${profileId}/versions/${versionId}/export/`,
    {},
    { responseType: "blob" }
  );
  const disposition: string = response.headers["content-disposition"] ?? "";
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] ?? `resume_${profileId}.pdf`;
  const applicationId: string = response.headers["x-application-id"] ?? "";
  return { blob: response.data as Blob, filename, applicationId };
};
