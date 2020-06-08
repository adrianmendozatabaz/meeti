//inportacion de librerias
const moment = require('moment');
const Sequelize = require('sequelize');

//impotacion de modelos
const Meeti = require('../../models/Meeti');
const Grupos = require('../../models/Grupos');
const Usuarios = require('../../models/Usuarios');


exports.mostrarMeeti = async (req, res) => {
    const meeti = await Meeti.findOne({
        where: {
            slug: req.params.slug
        },
        include: [{
                model: Grupos
            },
            {
                model: Usuarios,
                attributes: ['id', 'nombre', 'imagen']
            }
        ]
    })
    //Si no existe
    if (!meeti) {
        res.redirect('/');
    }

    //pasar la consulta a la pagina
    res.render('mostrar-meeti', {
        nombrePagina: meeti.titulo,
        meeti,
        moment
    })
}


//confirma o cancela la asistencia al meeti
exports.confirmarAsistencia = async (req, res) => {

    const {
        accion
    } = req.body;

    if (accion === 'confirmar') {
        //agregar el usuario 
        Meeti.update({
            'interesado': Sequelize.fn('array_append', Sequelize.col('interesado'), req.user.id)
        }, {
            'where': {
                'slug': req.params.slug
            }
        })
        //mensaje
        res.send('Has confirmado tu asistencia');
    } else {
        //cancelar la asistencia
        Meeti.update({
            'interesado': Sequelize.fn('array_remove', Sequelize.col('interesado'), req.user.id)
        }, {
            'where': {
                'slug': req.params.slug
            }
        })
        //mensaje
        res.send('Has cancelado tu asistencia');
    }
}

//muestra los asistentes de un meeti
exports.mostrarAsistentes = async (req, res) =>{
    const meeti = await Meeti.findOne({
        where: {
            slug: req.params.slug
        },
        attributes: ['interesado']
    })

    const {interesado} = meeti;

    const asistentes = await Usuarios.findAll({
        attributes: ['nombre', 'imagen'],
        where: {
            id: interesado
        }
    })

    //pasar datos a la vista
    res.render('asistentes',{
        nombrePagina: 'Listado de Asistentes',
        asistentes
    })

}