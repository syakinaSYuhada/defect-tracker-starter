const { z } = require('zod');

const createReportSchema = z.object({
  export_type: z.string().min(1),
  date_from: z.string().optional(),
  date_to: z.string().optional()
});

module.exports = { createReportSchema };
