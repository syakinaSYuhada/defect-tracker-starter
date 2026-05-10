const { z } = require('zod');

const numberString = z.coerce.number().int().positive();

const listDefectsQuerySchema = z.object({
  page: numberString.optional(),
  limit: numberString.optional(),
  status_id: numberString.optional(),
  severity_id: numberString.optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional()
});

module.exports = {
  listDefectsQuerySchema
};
