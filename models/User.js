const mongoose = require('mongoose')
const { Schema } = mongoose
const bcrypt = require('bcryptjs') // Se va a utilizar para encriptar la contraseña

const userSchema = new Schema({
    userName: {
        type: String,
        lowercase: true,
        required: true,
    },
    userEmail: {
        type: String,
        lowercase: true,
        required: true,
        unique: true,
        index: {unique: true}
    },
    userPassword: {
        type: String,
        required: true,
    },
    tokenConfirm: { // se usa para que al registrarse el usuario reciba un email para confirmar su correo
        type: String,
        default: null
    },
    confirm: {
        type: Boolean,
        default: false,
    },
    userImagen: {
        type: String,
        default: null,
    },
});

userSchema.pre("save", async function(next) { // Metodo de bcrypt para encriptar contraseña. Usa function para acceder al this
    const user = this; // El user es este objeto
    if (!user.isModified("userPassword")) return next(); // Solo hasea la contraseña si ha sido modificada o es nueva
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.userPassword, salt);
        user.userPassword = hash; // Se guarda el hash en la contraseña
        next(); // Continua con la operación si todo salio bien
    } catch (error) {
        throw new Error("Error al codificar la contraseña");
    }
});

userSchema.methods.comparePassword = async function(candidatePassword) { // Compara las contraseñas
    return await bcrypt.compare(candidatePassword, this.userPassword);
};

module.exports = mongoose.model('User', userSchema)