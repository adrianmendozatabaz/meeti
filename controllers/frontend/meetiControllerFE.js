//inportacion de librerias
const moment = require('moment');

//impotacion de modelos
const Meeti = require('../../models/Meeti');
const Grupos = require('../../models/Grupos');
const Usuarios = require('../../models/Usuarios');


exports.mostrarMeeti = async (req, res) =>{
    const meeti = await Meeti.findOne({
        where: {
            slug: req.params.slug
        },
        include : [
            {
                model: Grupos
            },
            {
                model: Usuarios,
                attributes: ['id', 'nombre', 'imagen']
            }
        ]
    })
    //Si no existe
    if(!meeti){
        res.redirect('/');
    }

    //pasar la consulta a la pagina
    res.render('mostrar-meeti',{
        nombrePagina: meeti.titulo,
        meeti,
        moment
    })
}
