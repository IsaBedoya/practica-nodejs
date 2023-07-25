// Conexion DB
require("dotenv").config(); // Variables de entorno
const mongoose = require('mongoose');

const clientDB = mongoose
    .connect(process.env.URI)
    .then((m)=>{
        console.log('DB Conectada 😎');
        return m.connection.getClient(); // Trae al cliente que se está conectando
    })
    .catch((err)=>{console.log('Falló la conexión con la DB ' + err)})

    module.exports = clientDB;