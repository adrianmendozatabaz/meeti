//En este archivo se tiene toda la configuracion del proyecto

//importaciones 
const router = require('./routes');
const express = require('express');
const path = require('path');
const expressLayout = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');

//variables de desarrollo
require('dotenv').config({path: 'variables.env'});

//db configuracion
const db = require('./config/db');
require('./models/Usuarios');
require('./models/Categorias');
require('./models/Grupos');
require('./models/Meeti');
db.sync().then(() => console.log('DB conectada')).catch((error) => console.log(error));

//donde corre la app
const app = express();

//bosy parser para leer formularios
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//habilitar EJS como template engine
app.use(expressLayout);
app.set('view engine', 'ejs');

//Ubicacion Vistas
app.set('views', path.join(__dirname, './views'));

//archivos staticos
app.use(express.static('public'));

//habiliatar cookie parser
app.use(cookieParser());

//crear la sesion
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false
}))

//inicializar passport
app.use(passport.initialize());
app.use(passport.session());

//conect flash para los mensajes de error
app.use(flash());

//middleware propio usuario, flash, fecha actual
app.use((req, res, next) => {
    res.locals.usuario = {...req.user} || null;
    res.locals.mensajes = req.flash();
    const fecha = new Date();
    res.locals.year = fecha.getFullYear();
    next();
});

//routing
app.use('/', router());

//se agrega el puerto donde funciona la app
app.listen(process.env.PORT, () =>{
    console.log('El servidor esta funcionando');
})