const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
	name: { type: String },
	description: { type: String },
	imageUrl: { type: String },
	location: { type: { type: String }, coordinates: [Number] },
	owner: { type: Schema.Types.ObjectId, ref: 'User' },
	reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }]
});

roomSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Room', roomSchema);
