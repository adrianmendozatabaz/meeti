
//importacion de librerias
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

//importacion de Modelos
const Categorias = require('../models/Categorias');
const Meeti = require('../models/Meeti');
const Grupos = require('../models/Grupos');
const Usuarios = require('../models/Usuarios');

exports.home = async (req, res) => {

    //promise para consultas en el home page
    const consultas = [];
    consultas.push(Categorias.findAll({}));
    consultas.push(Meeti.findAll({
        attributes: ['slug', 'titulo', 'fecha', 'hora'],
        where: {
            fecha: {
                [Op.gte]: moment(new Date()).format('YYYY-MM-DD')
            }
        },
        limit: 3,
        order: [
            ['fecha', 'ASC']
        ],
        include : [
            {
                model: Grupos,
                attributes: ['imagen']
            },
            {
                model: Usuarios,
                attributes: ['nombre', 'imagen']
            }
        ]
    }));

    //extraer y pasar a la vista
    const [categorias, meetis] = await Promise.all(consultas);

    //console.log(meetis);
    

    res.render('home', {
        nombrePagina: 'Inicio',
        categorias,
        meetis,
        moment
    });
}