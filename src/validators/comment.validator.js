const { z } = require('zod');

const createCommentSchema = z.object({
  text: z.string().min(1)
});

module.exports = { createCommentSchema };
