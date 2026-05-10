const { z } = require('zod');

const createActionSchema = z.object({
  defect_id: z.number().int().positive(),
  assigned_to: z.number().int().positive().nullable().optional(),
  description: z.string().min(3),
  due_date: z.string().optional(),
  status: z.string().optional()
});

const updateActionSchema = createActionSchema.partial();

module.exports = { createActionSchema, updateActionSchema };
