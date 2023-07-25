const {formidable} = require('formidable');
const Jimp = require('jimp')
const path = require('path'); // Interpreta las rutas
const fs = require('fs');
const User = require('../models/User');
// const Jimp = require("jimp");

const formPerfil = async(req, res) => {
    try {
        const user = await User.findById(req.user.id);
        return res.render('perfil', { user: req.user, imagen: user.userImagen });
    } catch (error) {
        req.flash("mensajes", [{ msg: 'Error al leer el usuario' }]);
        return res.redirect('/perfil');
    }
}

const cambiarFotoPerfil = (req, res) => {
    const form = formidable({}); // Crea una nueva instancia de formidable.
    form.maxFileSize = 5 * 1024 * 1024; // Indica que el tamaño maximo de imagen aceptado es de 5MB

    form.parse(req, async (err, fields, files) => { // Para tener una referencia de la imagen en la base de datos

        if (err) { // En caso de error de formidable
            req.flash("mensajes", [{ msg: "Falló formidable" }]);
            return res.redirect("/perfil");
        }

        const file = files.myFile[0]; // Accede al archivo

        try {
            if(file.originalFilename === ""){ // En caso de no enviar ningún archivo
                throw new Error('No se seleccionó ninguna imagen')
            }

            const imageTypes = ['image/jpeg', 'image/png', 'image/webp']; // Formatos
            
            if(!imageTypes.includes(file.mimetype)){ // En caso de que el formato del archivo no sea el indicado
                throw new Error('Por favor agrega una imagen con formato .jpg o png')
            }

            if(file.size > 5 * 1024 * 1024){ // En caso de que sea mayor a 5MB
                throw new Error('La imagen debe ser de máximo 5MB')
            }

            const extension = file.mimetype.split('/')[1]; // Accede al formato (png,jpg,jpeg,etc). image[0]/png[1]
            const dirFile = path.join(__dirname, `../public/assets/img/Perfiles/${req.user.id}.${extension}`); // Nueva ruta del archivo
            
            fs.copyFileSync(file.filepath, dirFile); // Copia el archivo en la nueva ruta
            fs.unlinkSync(file.filepath, e => console.log(e)) // Elimina el archivo de la ruta original

            const image = await Jimp.read(dirFile); // Lee la ruta de la img
            image.resize(200, 200).quality(90).writeAsync(dirFile); // Redimensiona, cambia la calidad y guarda nuevamente la img en las ruta

            const user = await User.findById(req.user.id);
            user.userImagen = `${req.user.id}.${extension}`; // Sube la imagen
            await user.save(); // Guarda los cambios

            req.flash("mensajes", [{ msg: "Ya se subió la imagen" }]);
            
        } catch (error) {
            req.flash("mensajes", [{ msg: error.message }]);
        } finally {
            return res.redirect('/perfil');
        }
    });
};

module.exports = {
    formPerfil,
    cambiarFotoPerfil
}