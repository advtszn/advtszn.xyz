import { basehub as createBasehub } from "basehub";

const token = import.meta.env.DEV ? import.meta.env.BASEHUB_TOKEN : process.env.BASEHUB_TOKEN;

if (!token) {
  throw new Error("BASEHUB_TOKEN is not set");
}

export const basehub = createBasehub({
  token,
});
