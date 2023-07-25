const Url = require('../models/Url')
const { nanoid } = require('nanoid')

const leerUrls = async(req,res)=> {
    try{
        const urls = await Url.find({user: req.user.id}).lean() // Trae objetos de tipo mongoose, por eso se usa lean, para que se convierta a objeto js
        return res.render('home', {urls}) // renderiza home urilizando la plantilla main
    } catch(e){
        req.flash("mensajes", [{ msg: e.message }]);
        return res.redirect("/");
    }
}

const agregarUrl = async(req,res)=>{ // Funcion para agregar url
    const {origin} = req.body // Guarda el name=origin del input

    try{
        const url = new Url({origin, shortURL: nanoid(8), user: req.user.id}) // Crea una nueva url con el contenido indicado
        await url.save() // Espera a que se guarde la url
        req.flash("mensajes", [{ msg: "Se agregó url correctamente" }]);
        return res.redirect("/"); // Redirecciona a la pagina de home para acceder a las urls
    } catch(e){ // En caso de errores
        req.flash("mensajes", [{ msg: e.message }]);
        return res.redirect("/");
    }
}

const eliminarUrl = async(req,res)=>{
    const {id} = req.params
    try {
        const url = await Url.findById(id).lean();
        if (!url.user.equals(req.user.id)) { // Si el usuario que quiere eliminar la URL es diferente al que la creó
            throw new Error("No puedes eliminar una URL que no es de tu propiedad"); // Muestra un error
        }
        await url.remove();
        req.flash("mensajes", [{ msg: "Se eliminó la url correctamente" }]);
        return res.redirect("/");

    } catch (e) {
        req.flash("mensajes", [{ msg: e.message }]);
        return res.redirect("/");
    }
}

const editarUrlForm = async(req, res)=>{
    const { id } = req.params;
    try {
        const url = await Url.findById(id).lean(); // lean para que se convierta a objeto js
        if (!url.user.equals(req.user.id)) { // Si el usuario que quiere eliminar la URL es diferente al que la creó
            throw new Error("No puedes editar una URL que no es de tu propiedad");
        }
        res.render("home", { url }); // Se renderiza home, pero envia la url
    } catch (e) {
        req.flash("mensajes", [{ msg: e.message }]);
        return res.redirect("/");
    }
}

const editarUrl = async(req, res)=>{
    const { id } = req.params;
    const { origin } = req.body;
    try {
        const url = await Url.findById(id);
        if (!url.user.equals(req.user.id)) {
            throw new Error("No puedes editar una URL que no es de tu propiedad");
        }
        await url.updateOne({ origin });
        req.flash("mensajes", [{ msg: "Se editó la url correctamente" }]);
        res.redirect("/");
    } catch (e) {
        req.flash("mensajes", [{ msg: e.message }]);
        return res.redirect("/");
    }
}

const redireccion = async(req, res)=>{
    const { shortURL } = req.params;
    try {
        const url = await Url.findOne({ shortURL });
        res.redirect(url.origin);
    } catch (e) {
        req.flash("mensajes", [{msg: 'No existe la URL'}]);
        return res.redirect("/");
    }
}

module.exports = {
    leerUrls,
    agregarUrl,
    eliminarUrl,
    editarUrlForm,
    editarUrl,
    redireccion
}