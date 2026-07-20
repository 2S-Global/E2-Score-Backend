import { z } from "zod";

const customValidation = z.object({
  number: z.number(),
  field_id: z.number(),
});

const checker = {
  number: 10,
  field_id: "44454444",
};

const result = customValidation.safeParse(checker);

console.log(result.error);