//importaciones
const Grupos = require('../models/Grupos');
const Meeti = require('../models/Meeti');
const {
    body,
    validationResult
} = require('express-validator');


//Formulario para nuevos meeti
exports.formNuevoMeeti = async (req, res) =>{

    const grupos = await Grupos.findAll({where: {usuarioId : req.user.id}});

    res.render('nuevo-meeti',{
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
    const point = { type: 'Point', coordinates: [ parseFloat(req.body.lat), parseFloat(req.body.lng)]};

    meeti.ubicacion = point;

    //el cupo opcional
    if(req.body.cupo === ''){
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