//importaciones
const passport = require('passport');

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
});

///revisar si el usuario esta autenticado o no
exports.usuarioAutenticado = (req, res, next) =>{
    //si esta auteticado, adelante
    if(req.isAuthenticated()){
        return next();
    }

    //si no esta autenticado 
    return res.redirect('/iniciar-sesion');
}

//cerrar sesión
exports.cerrarSesion = (req, res, next) => {
    req.logout();
    req.flash('exito', 'Cerraste Sesión Correctamente');
    res.redirect('/iniciar-sesion');
    next();
}