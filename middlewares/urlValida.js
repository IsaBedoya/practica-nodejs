const { URL } = require("url"); // Modulo nativo de node

const urlValidar = (req, res, next)=>{ // next se usa para cuando la url es valida. Indica a la aplicación que al ser valida siga con la siguiente ejecución ()
    try {
        const { origin } = req.body; // Se lee el origin de la url
        const urlFrontend = new URL(origin); // Ese origin va a ser una nueva instancia de Url
        if (urlFrontend.origin !== "null") { // Si es distinto a null
            if (urlFrontend.protocol === "http:" || urlFrontend.protocol === "https:"){ // Y si el protoco es http o https
                return next(); // Devuelve next (permite que se ejecute agregar url)
            }
            throw new Error("Debe contener https:// o http://");
        }
        throw new Error("URL no válida 😲"); // Si el origin es vacio devuelve un error
    } catch (e) {
        if (e.message === "Invalid URL") {
            req.flash("mensajes", [{ msg: "URL no válida" }]);
        } else {
            req.flash("mensajes", [{ msg: e.message }]);
        }
        return res.redirect("/");
    }
}

module.exports = urlValidar;