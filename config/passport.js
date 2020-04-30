const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Usuarios = require('../models/Usuarios');

passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    async (email, password, next) => {
        // se ejecuta al llenar el formulario
        const usuario = await Usuarios.findOne({
            where: {
                email,
                activo : 1
            }
        });
        //revisar si existe el usuario
        if (!usuario) return next(null, false, {
            message: 'Ese usuario no existe'
        });

        //si existe el usuario, hacemos lo siguiente 
        const verificarPassword = usuario.validarPassword(password);
        //si el password es incorrecto
        if (!verificarPassword) return next(null, false, {
            message: 'Password Incorrecto'
        })

        //todo bien
        return next(null, usuario);
    }
))

passport.serializeUser(function(usuario, cb){
    cb(null, usuario);
})

passport.deserializeUser(function(usuario, cb){
    cb(null, usuario);
})

module.exports = passport;