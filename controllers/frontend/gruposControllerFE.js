//impotacion de modelos
const Grupos = require('../../models/Grupos');
const Meeti = require('../../models/Meeti');

//importacion de librerias
const moment = require('moment');

//mostrar grupos en el home page
exports.mostrarGrupo = async (req, res, next) =>{
    const consultas = [];

    consultas.push( Grupos.findOne({
        where: {
            id: req.params.id
        }
    }));
    consultas.push( Meeti.findAll({
        where: {
            grupoId: req.params.id
        },
        order: [
            ['fecha', 'ASC']
        ]
    }));

    const [grupo, meetis] = await Promise.all(consultas);

    //si no hay grupos
    if(!grupo){
        res.redirect('/');
        return next();
    }

    //mostrar la vista
    res.render('mostrar-grupo', {
        nombrePagina: `Información Grupo: ${grupo.nombre}`,
        grupo,
        meetis,
        moment
    })
}