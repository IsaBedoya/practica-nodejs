// HOME = Pagina privada a la que tienen acceso los autentificados

const express = require('express')
const { leerUrls, agregarUrl, eliminarUrl, editarUrlForm, editarUrl, redireccion } = require('../controllers/homeController')
const urlValidar = require('../middlewares/urlValida')
const verificarUser = require('../middlewares/verificarUser')
const { formPerfil, cambiarFotoPerfil } = require('../controllers/perfilController')
const router = express.Router() // Se crea el router

router.get('/', verificarUser, leerUrls);
router.post('/', verificarUser, urlValidar, agregarUrl);
router.get("/eliminar/:id", verificarUser, eliminarUrl); // Con el :id se lee de forma dinamica el id de la url
router.get('/editar/:id', verificarUser, editarUrlForm);
router.post('/editar/:id', verificarUser, urlValidar, editarUrl);
router.get('/perfil', verificarUser, formPerfil);
router.post('/perfil', verificarUser, cambiarFotoPerfil);
router.get('/:shortURL', redireccion);

module.exports = router