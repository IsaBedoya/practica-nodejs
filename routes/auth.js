// AUTH = Autenticación

const express = require('express');
const { body } = require("express-validator");
const { loginForm, registerForm, registerUser, confirmar, loginUser, cerrarSesion } = require('../controllers/authController');
const router = express.Router(); // Se crea el router

router.get('/signup', registerForm);
router.post('/signup', [ // Configuración express validator
    body("userName", "Ingrese un nombre válido") // Si el userNmae esta mal envia ese mensaje
        .trim() // Sca los primeros y ultimos caracteres en blanco
        .notEmpty() // No puede venir vacio
        .escape(), // Solo acepta caracteres, si el user manda codigo se toma como string
    body("userEmail", "Ingrese un email válido")
        .trim()
        .isEmail() // Valida que tenga un formato de email
        .normalizeEmail(),
    body("userPassword", "Ingrese contraseña con 6 o más carácteres")
        .trim()
        .isLength({ min: 6 }) // Minimo de 6 caracteres
        .escape()
        .custom((value, { req }) => { // verifica que ambas contraseñas sean iguales
            if (value !== req.body.userRePassword) {
                throw new Error("Las contraseñas no coinciden");
            } else {
                return value; // En caso contrario (ambas son iguales) sigue con el mismo value
            }
        }),
], registerUser);
router.get("/confirmar/:token", confirmar)
router.get('/login', loginForm);
router.post('/login', [
    body("userEmail", "Ingrese un email válido")
        .trim()
        .isEmail()
        .normalizeEmail(),
    body("userPassword", "La contraseña no cumple el formato")
        .trim()
        .isLength({ min: 6 })
        .escape(),
], loginUser);

router.get("/logout", cerrarSesion)

module.exports = router; // Exporta el router