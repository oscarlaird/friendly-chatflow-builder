import { z } from "zod";

// Define the schema for primitive values
export const SerializedPrimitive = z.object({
  orig_type: z.union([
    z.literal("int"),
    z.literal("float"),
    z.literal("str"),
    z.literal("bool"),
    z.literal("none")
  ]),
  value: z.union([
    z.number(),
    z.string(),
    z.boolean(),
    z.null()
  ])
});

// Define the schema for table values
export const SerializedTable = z.object({
  orig_type: z.literal("table"),
  value: z.object({
    items: z.array(z.record(z.string(), z.any())),
    orig_type: z.string() // we don't care about the original python type of the tabular data
  })
});

// Combined SerializedValue type
export const SerializedValue = z.union([
  SerializedPrimitive,
  SerializedTable,
]);

// Define the schema for the entire call return data
export const SerializedCallPayload = z.object({
  data: z.record(z.string(), SerializedValue),
  orig_type: z.string() // we don't care about the original python type of the call return data
});

export type SerializedCallPayload = z.infer<typeof SerializedCallPayload>;
export type SerializedValue = z.infer<typeof SerializedValue>;
export type SerializedPrimitive = z.infer<typeof SerializedPrimitive>;
export type SerializedTable = z.infer<typeof SerializedTable>;