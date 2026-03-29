export type TWork = {
  _id: string;
  _title: string;
  description: { json: { content: any } };
  role: string;
  date: string | null;
  url?: string;
};
