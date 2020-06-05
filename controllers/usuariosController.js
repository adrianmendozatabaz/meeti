//importaciones
const Usuarios = require('../models/Usuarios');
const {
    body,
    validationResult
} = require('express-validator');
const enviarEmail = require('../handlers/email');

//formulario de crear cuenta
exports.formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crear Cuenta'
    });
}

//para crear una nueva cuneta
exports.crearNuevaCuenta = async (req, res) => {
    //leer los datos del formulario
    const usuario = req.body;

    //validaciones extras
    const rules = [
        body('nombre', 'El nombre no puede ir vacio').notEmpty(),
        body('confirmar', 'El password confirmado no puede ir vacio').notEmpty(),
        body('confirmar', 'El password debe ser igual').equals(req.body.password)
    ];

    //errores en express
    await Promise.all(rules.map(validation => validation.run(req)));
    const erroresExpress = validationResult(req);

    try {
        //insertar en la db
        await Usuarios.create(usuario);

        //generar url de confirmacion
        const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`;

        //enviar email de confirmacion
        await enviarEmail.enviarEmail({
            usuario,
            url,
            subject: 'Confirma tu cuenta en Meeti',
            archivo: 'confirmar-cuenta'
        })

        //flash messages y redireccionar 
        req.flash('exito', 'Te hemos enviado un E-mail, confirma tu cuenta');
        res.redirect('/iniciar-sesion');
    } catch (error) {

        //errores sequelize
        let erroresSequelize = [];
        if (error.name === "SequelizeUniqueConstraintError") {
            erroresSequelize.push("Ese email ya existe");
        } else {
            erroresSequelize = error.errors.map(err => err.message);
        }
        
        //extraer unicamente el msg de express
        const errExp = erroresExpress.array().map(err => err.msg);

        //unir los errores 
        const listaErrores = [...erroresSequelize, ...errExp];

        //console.log(erroresSequelize);
        req.flash('error', listaErrores);
        res.redirect('/crear-cuenta');
    }
}

//confirmar cuenta
exports.confirmarCuenta = async (req, res, next) =>{
    //verificar que el usuario existe
    const usuario = await Usuarios.findOne({where: {email: req.params.correo}});

    //si no existe, redireccionar
    if(!usuario){
        req.flash('error', 'No existe esa cuenta');
        res.redirect('/crear-cuenta');
        return next();
    }
    //confirmar y redireccionar
    usuario.activo = 1;
    await usuario.save();
    req.flash('exito', 'La cuenta se ha confirmado, ya puedes iniciar sesión');
    res.redirect('/iniciar-sesion');
}

//Formulario para iniciar sesión
exports.formIniciarSesion = (req, res) => {
    res.render('iniciar-sesion', {
        nombrePagina: 'Iniciar Sesión'
    });
}


//Muestra el formulario para editar perfil
exports.formEditarPerfil = async (req, res) =>{
    const usuario = await Usuarios.findByPk(req.user.id);

    res.render('editar-perfil', {
        nombrePagina: `Editar Perfil`,
        usuario
    })
}

//almacena en la bd los cambios al perfil
exports.editarPerfil = async (req, res) =>{
    const usuario = await Usuarios.findByPk(req.user.id);

    body('nombre').trim().escape();
    body('email').trim().escape();

    //leer datos del form
    const {nombre, descripcion, email} = req.body;

    //asignar los valores
    usuario.nombre = nombre;
    usuario.descripcion = descripcion;
    usuario.email = email;

    //almacenar en la bd
    await usuario.save();
    req.flash('exito', 'Cambios Guardados Correctamente');
    res.redirect('/administracion');
}

//form para cambiar el password
exports.formCambiarPassword = (req, res) =>{
    res.render('cambiar-password',{
        nombrePagina: 'Cambiar Password'
    })
}