//importaciones
const Grupos = require('../models/Grupos');
const Meeti = require('../models/Meeti');
const {
    body,
    validationResult
} = require('express-validator');


//Formulario para nuevos meeti
exports.formNuevoMeeti = async (req, res) => {

    const grupos = await Grupos.findAll({
        where: {
            usuarioId: req.user.id
        }
    });

    res.render('nuevo-meeti', {
        nombrePagina: 'Crear Nuevo Meeti',
        grupos
    })
}


//inserta nuesvos meeti en la bd
exports.crearMeeti = async (req, res) => {
    //obtener los datos
    const meeti = req.body;

    //asignar el usuario
    meeti.usuarioId = req.user.id;

    //almacena la ubicacion con un point 
    const point = {
        type: 'Point',
        coordinates: [parseFloat(req.body.lat), parseFloat(req.body.lng)]
    };

    meeti.ubicacion = point;

    //el cupo opcional
    if (req.body.cupo === '') {
        meeti.cupo = 0;
    }

    //prueba
    //meeti.grupoId = '6a30af28-f0dc-4edc-a619-fdaafdfad780';

    //almacenar en la base de datos
    try {
        await Meeti.create(meeti);
        req.flash('exito', 'Se ha creado el Meeti correctamente');
        res.redirect('/administracion');
    } catch (error) {
        //extraer los errores
        //console.log(error);
        const erroresSequelize = error.errors.map(err => err.message);
        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-meeti');
    }
}

// sanitiza los meeti
exports.sanitizarMeeti = (req, res, next) => {
    body('titulo').trim().escape();
    body('invitado').trim().escape();
    body('cupo').trim().escape();
    body('fecha').trim().escape();
    body('hora').trim().escape();
    body('direccion').trim().escape();
    body('ciudad').trim().escape();
    body('estado').trim().escape();
    body('pais').trim().escape();
    body('lat').trim().escape();
    body('lng').trim().escape();
    body('grupoId').trim().escape();

    next();
}

//muestra el formulario para editar un meeti
exports.formEditarMeeti = async (req, res, next) => {
    const consultas = [];

    consultas.push(Grupos.findAll({
        where: {
            usuarioId: req.user.id
        }
    }));
    consultas.push(Meeti.findByPk(req.params.id));

    //return un promise
    const [grupos, meeti] = await Promise.all(consultas);

    if (!grupos || !meeti) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    //mostramos la vista
    res.render('editar-meeti', {
        nombrePagina: `Editar Meeti: ${meeti.titulo}`,
        grupos,
        meeti
    })
}

//almacena los cambios en el meeti
exports.editarMeeti = async (req, res, next) => {
    const meeti = await Meeti.findOne({
        where: {
            id: req.params.id,
            usuarioId: req.user.id
        }
    });

    if (!meeti) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    //asignar los valores
    const {
        grupoId,
        titulo,
        invitado,
        fecha,
        hora,
        cupo,
        descripcion,
        direccion,
        cuidad,
        estado,
        pais,
        lat,
        lng
    } = req.body;

    meeti.grupoId = grupoId;
    meeti.titulo = titulo;
    meeti.invitado = invitado;
    meeti.fecha = fecha;
    meeti.hora = hora;
    meeti.cupo = cupo;
    meeti.descripcion = descripcion;
    meeti.direccion = direccion;
    meeti.cuidad = cuidad;
    meeti.estado = estado;
    meeti.pais = pais;

    //asignar el point
    const point = {
        type: 'Point',
        coordinates: [parseFloat(lat), parseFloat(lng)]
    };

    meeti.ubicacion = point;

    //almacenar en la bd
    await meeti.save();
    req.flash('exito', 'Cambios guardados correctamente');
    res.redirect('/administracion');
}

//muestra un formulario para eliminar meetis
exports.formEliminarMeeti = async (req, res, next) => {
    const meeti = await Meeti.findOne({
        where: {
            id: req.params.id,
            usuarioId: req.user.id
        }
    })

    if (!meeti) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    //mostrar la vista 
    res.render('eliminar-meeti', {
        nombrePagina: `Eliminar Meeti:  ${meeti.titulo}`
    })
}

//elimina el meeti de la bd
exports.eliminarMeeti = async (req, res) => {
    await Meeti.destroy({
        where: {
            id: req.params.id
        }
    })

    req.flash('exito', 'Meeti eliminado');
    res.redirect('/administracion');
}