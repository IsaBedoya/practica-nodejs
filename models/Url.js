const mongoose = require('mongoose')
const { Schema } = mongoose

// Esquema para añadir una url a la db
const urlSchema = new Schema({
    origin: {
        type: String,
        unique: true,
        required: true,
    },
    shortURL: {
        type: String,
        unique: true,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
});

const Url = mongoose.model('Url', urlSchema) // Se crea la colección Url con el esquema creado
module.exports = Url