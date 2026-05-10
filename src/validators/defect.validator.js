const { z } = require('zod');

const createDefectSchema = z.object({
  product_id: z.number().int().positive().optional(),
  defect_type_id: z.number().int().positive().optional(),
  category_id: z.number().int().positive().optional(),
  severity_id: z.number().int().positive().optional(),
  production_line_id: z.number().int().positive().optional(),
  batch_number: z.string().min(1).max(100).optional(),
  title: z.string().min(3).max(255).optional(),
  description: z.string().min(5),
  quantity_affected: z.number().int().min(0).optional(),
  reported_source: z.string().optional(),
  defect_location: z.string().optional(),
  occurrence_count: z.number().int().min(1).optional().default(1),
  status_id: z.number().int().positive().optional(),
  status: z.string().optional(),
  reported_at: z.string().optional()
});

const updateDefectSchema = createDefectSchema.partial();

module.exports = { createDefectSchema, updateDefectSchema };
