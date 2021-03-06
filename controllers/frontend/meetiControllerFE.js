//inportacion de librerias
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

//impotacion de modelos
const Meeti = require('../../models/Meeti');
const Grupos = require('../../models/Grupos');
const Usuarios = require('../../models/Usuarios');
const Categorias = require('../../models/Categorias');
const Comentarios = require('../../models/Comentarios');


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

    // Consultar por meeti's cercanos
    const ubicacion = Sequelize.literal(`ST_GeomFromText( 'POINT( ${meeti.ubicacion.coordinates[0]} ${meeti.ubicacion.coordinates[1]} )' )`);

    // ST_DISTANCE_Sphere = Retorna una linea en metros
    const distancia = Sequelize.fn('ST_DistanceSphere', Sequelize.col('ubicacion'), ubicacion);

    // encontrar meeti's cercanos
    const cercanos = await Meeti.findAll({
        order: distancia, // los ordena del mas cercano al lejano
        where: Sequelize.where(distancia, {
            [Op.lte]: 1000
        }), // 2 mil metros o 2km
        limit: 3, // maximo 3
        offset: 1,
        include: [{
                model: Grupos
            },
            {
                model: Usuarios,
                attributes: ['id', 'nombre', 'imagen']
            }
        ]
    })

    // Consultar después de verificar que existe el meeti
    const comentarios = await Comentarios.findAll({
        where: {
            meetiId: meeti.id
        },
        include: [{
            model: Usuarios,
            attributes: ['id', 'nombre', 'imagen']
        }]
    })


    // pasar el resultado hacia la vista
    res.render('mostrar-meeti', {
        nombrePagina: meeti.titulo,
        meeti,
        comentarios,
        cercanos,
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
exports.mostrarAsistentes = async (req, res) => {
    const meeti = await Meeti.findOne({
        where: {
            slug: req.params.slug
        },
        attributes: ['interesado']
    })

    const {
        interesado
    } = meeti;

    const asistentes = await Usuarios.findAll({
        attributes: ['nombre', 'imagen'],
        where: {
            id: interesado
        }
    })

    //pasar datos a la vista
    res.render('asistentes', {
        nombrePagina: 'Listado de Asistentes',
        asistentes
    })
}

//muestra los meetis agrupados por categoria
exports.mostrarCategoria = async (req, res, next) => {
    const categoria = await Categorias.findOne({
        where: {
            slug: req.params.categoria
        },
        attributes: ['id', 'nombre']
    });

    const meetis = await Meeti.findAll({
        order: [
            ['fecha', 'ASC'],
            ['hora', 'ASC']
        ],
        include: [{
                model: Grupos,
                where: {
                    categoriaId: categoria.id
                }
            },
            {
                model: Usuarios
            }
        ]
    });

    res.render('categoria', {
        nombrePagina: `Categoria: ${categoria.nombre}`,
        meetis,
        moment
    })
}