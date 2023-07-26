const express = require('express')
const session = require("express-session");
const flash = require("connect-flash");
const passport = require('passport') // Autenticación simple y discreta para Node.js
const mongoSanitize = require("express-mongo-sanitize"); // Desinfecta los datos proporcionados por el usuario para evitar la inyección del operador MongoDB.
const cors = require("cors"); // Permite que se puedan solicitar recursos restringidos en una página web desde un dominio diferente del dominio que sirvió el primer recurso.
const { create } = require("express-handlebars");
const csrf = require('csurf'); // Evita el ataque de falsificación de solicitudes entre sitios
const User = require('./models/User');
const MongoStore = require("connect-mongo");

// Conexion db
require('dotenv').config();
const clientDB = require("./database/db");

const app = express();

const csrfProtection = csrf({
    cookie: false,
  });

const corsOptions = {
    credentials: true,
    origin: process.env.PATH_PUBLIC || '*',
    methods: ['GET', 'POST'] // Metodos aceptados
};
app.use(cors(corsOptions));

app.set("trust proxy", 1);
app.use(session({ // Traemos el middelware session
    secret: process.env.SECRET_SESSION,
    resave: false,
    saveUninitialized: false,
    name: 'secret-name-2.0',
    store: MongoStore.create({
        clientPromise: clientDB,
        dbName: process.env.DB_NAME,
    }),
    cookie: {
        secure: process.env.MODO === 'production', // Secure true indica que todas las solicitudes se hagan a traves de https
        maxAge: 30 * 24 * 60 * 60 * 1000 // La sesión va a durar 30 días
    },
}))

app.use(flash()); // Trea el middleware flash

app.use(passport.initialize()) // Inicializa passport
app.use(passport.session()) // Crea una sesion

passport.serializeUser((user, done) => done(null, {id: user._id, userName: user.userName})) // Se guardará en req.user
passport.deserializeUser(async(user,done) => {
    const userDB = await User.findById(user.id).exec()
    return done(null, { id: userDB._id, userName: userDB.userName }); // Se guardará en req.user
})

const hbs = create({
    extname: ".hbs", // Indica que la extensión no va a ser .handlebars sino hbs
    partialsDir: ["views/components"] // Permite trabajar con parciales (separar pedacitos de html y llevarlos a otros html)
});

app.engine(".hbs", hbs.engine); // Motor de plantilla
app.set("view engine", ".hbs"); // Estensión = .hbs
app.set("views", "./views"); // Estará dentro de la carpeta views

app.use(express.static(__dirname + "/public")) // Selecciona la carpeta public para mostrar (front-end)
app.use(express.urlencoded({extended: true})) // Para que funcione el req.body
app.use(csrf());
app.use(mongoSanitize());
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    res.locals.mensajes = req.flash('mensajes')
    next();
});

app.use(csrfProtection);

app.use('/', require('./routes/home'))
app.use('/auth', require('./routes/auth'))

const PORT = process.env.PORT || 5000
/* si ejecuta node index.js, Node usará 5000
Si ejecuta PORT=4444 node index.js, Node usará process.env.PORT = 4444 en este ejemplo*/
app.listen(PORT,()=> console.log('Funcionando 👀 ' + PORT))