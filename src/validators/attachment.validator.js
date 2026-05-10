const { z } = require('zod');

// Attachments are multipart/form-data; validate fields only
const createAttachmentSchema = z.object({
  defect_id: z.number().int().positive().optional(),
  action_id: z.number().int().positive().optional(),
  attachment_type: z.string().optional()
});

module.exports = { createAttachmentSchema };
