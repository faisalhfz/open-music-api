const Joi = require('joi');

const PlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const SongIdPayloadSchema = Joi.object({
  songId: Joi.string().max(50).required(),
});

module.exports = { PlaylistPayloadSchema, SongIdPayloadSchema };
