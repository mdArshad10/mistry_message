import { z } from "zod";

export const AcceptingMessageSchema = z.object({
  acceptMessage:z.boolean(),
});
