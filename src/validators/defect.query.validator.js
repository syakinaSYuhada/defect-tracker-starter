const { z } = require('zod');

const listDefectsQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  status_id: z.string().regex(/^\d+$/).transform(Number).optional(),
  severity_id: z.string().regex(/^\d+$/).transform(Number).optional(),
  product_id: z.string().regex(/^\d+$/).transform(Number).optional(),
  category_id: z.string().regex(/^\d+$/).transform(Number).optional(),
  batch_id: z.string().regex(/^\d+$/).transform(Number).optional(),
  q: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc','desc']).optional()
});

module.exports = { listDefectsQuerySchema };
