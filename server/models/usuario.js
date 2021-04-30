const mongoose = require("mongoose");

const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const rolesValidos = {
    values: ["ADMIN_ROLE", "USER_ROLE"],
    message: "{VALUE} no es un rol válido"
}

const usuarioSchema = new Schema({
    nombre: {
        type: String,
        // El mensaje es por si nio envia el campo, por eso la nomenclatutra de []
        required: [true, 'El nombre es necesario'] 
    },
    email: {
        type: String,
        unique: true,
        required: [true, "El correo es necesario"]
    },
    password: {
        type: String,
        required: [true, "La contraseña es obligatoria"]
    },
    img: {
        type: String,
        required: false // Se puede obviar
    }, // No es obligatoria
    role: {
        type: String,
        default: "USER_ROLE",
        enum: rolesValidos
    }, // default: "USER_ROLE"
    estado: {
        type: Boolean,
        default: true
    }, // Boolean
    google: {
        type: Boolean,
        default: false
    } // Boolean
});

// Para modificar el JSON
// Evitar incluir la contraseña en la respuesta
usuarioSchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;
    return userObject;
};

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser unico'});

module.exports = mongoose.model("Usuario", usuarioSchema);
