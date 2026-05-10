const { z } = require('zod');

const listDefectsQuerySchema = z.object({
  page: z.union([z.string().regex(/^\d+$/).transform(Number), z.number().int()]).optional(),
  limit: z.union([z.string().regex(/^\d+$/).transform(Number), z.number().int()]).optional(),
  status_id: z.union([z.string().regex(/^\d+$/).transform(Number), z.number().int()]).optional(),
  severity_id: z.union([z.string().regex(/^\d+$/).transform(Number), z.number().int()]).optional(),
  product_id: z.union([z.string().regex(/^\d+$/).transform(Number), z.number().int()]).optional(),
  category_id: z.union([z.string().regex(/^\d+$/).transform(Number), z.number().int()]).optional(),
  batch_id: z.union([z.string().regex(/^\d+$/).transform(Number), z.number().int()]).optional(),
  q: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc','desc']).optional()
});

module.exports = { listDefectsQuerySchema };
