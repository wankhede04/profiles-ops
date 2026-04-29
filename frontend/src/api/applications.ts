import type { Application, ApplicationStatus, Paginated } from "../types/api";
import client from "./client";

export const listApplications = () =>
  client.get<Paginated<Application>>("/applications/").then((r) => r.data);

export const getApplication = (id: number) =>
  client.get<Application>(`/applications/${id}/`).then((r) => r.data);

export const updateApplicationStatus = (
  id: number,
  data: { status: ApplicationStatus; notes?: string }
) =>
  client
    .patch<Application>(`/applications/${id}/status/`, data)
    .then((r) => r.data);
