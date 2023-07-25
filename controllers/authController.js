const User = require("../models/User")
const { validationResult } = require("express-validator");
const {nanoid} = require('nanoid')
const nodemailer = require("nodemailer");
require("dotenv").config();

const registerForm = (req, res) => {
    res.render('signup');
}

const registerUser = async(req,res) =>{
    
    const errors = validationResult(req); // Controla los errores que vengan de la configuración de express validator
    if(!errors.isEmpty()){
        req.flash("mensajes", errors.array()); // Envia los errores como mensaje
        return res.redirect("/auth/signup");
    }

    const {userName, userEmail, userPassword} = req.body
    try {
        let user = await User.findOne({userEmail}) // validacion de que el usuario a registrar no exista ya
        if(user) throw new Error('Ya existe el usuario') // si se encuentra otro usuario con mismo email, manda error. Manda al catch
        user = new User({userName, userEmail, userPassword, tokenConfirm: nanoid()}) // si no, se crea el usuario
        await user.save() // se guarda el user en la base de datos

        const transport = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: process.env.USER_EMAIL,
                pass: process.env.PASS_EMAIL
            }
        });

        await transport.sendMail({ // Envía el email
            from: '"Fred Foo 👻" <foo@example.com>',
            to: user.userEmail,
            subject: "verifique su cuenta de correo",
            html: `<a href="${process.env.PATH_HEROKU || 'http://localhost:5000'}/auth/confirmar/${user.tokenConfirm}">verifica tu cuenta aquí</a>`,
        });

        req.flash('mensajes',[{msg:'Revisa tu correo electronico y valida la cuenta'}])
        return res.redirect('/auth/login')
    } catch (error) {
        req.flash('mensajes', [{msg: error.message}])
        return res.redirect('/auth/signup')
    }
}

const confirmar = async(req,res) =>{
    const {token} = req.params

    try {
        const user = await User.findOne({ tokenConfirm: token });
        if (!user) throw new Error("no se pudo confirmar cuenta");
        user.tokenConfirm = null;
        user.confirm = true;
        await user.save();
        req.flash('mensajes',[{msg:'Cuenta verificada. Puedes iniciar sesión'}])
        return res.redirect('/auth/login')
    } catch (error) {
        req.flash('mensajes', [{msg: error.message}])
        return res.redirect('/auth/login')
    }
}

const loginForm = (req,res) => {
    res.render("login");
}

const loginUser = async(req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("mensajes", errors.array());
        return res.redirect("/auth/login");
    }
    
    const {userEmail, userPassword} = req.body;
    try {
        const user = await User.findOne({ userEmail });
        if (!user) throw new Error("No existe el usuario");
        if (!user.confirm) throw new Error("Usuario no confirmado");
        if (!(await user.comparePassword(userPassword))) {
            throw new Error("Contraseña incorrecta");
        }
        req.login(user, function(err) { // Crea la sesión de usuario a través de Passport.
            if (err) {
                throw new Error("Error de passport");
            }
            return res.redirect("/");
        });
    } catch (error) {
        req.flash('mensajes', [{msg: error.message}])
        return res.redirect('/auth/login')
    }
}

const cerrarSesion = (req, res, next) => {
    req.logout((err) => { // Metodo de passport para cerrar sesión
        if (err) { return next(err); }
        res.redirect('/');
      });
}

module.exports= {
    loginForm,
    registerForm,
    registerUser,
    confirmar,
    loginUser,
    cerrarSesion
}