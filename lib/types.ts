export type DataSource = "bayonne" | "pau" | "upload" | null;

export type SiteName = "bayonne" | "pau";

export const SITE_CAPACITY: Record<SiteName, number> = {
  bayonne: 196,
  pau: 840,
};
