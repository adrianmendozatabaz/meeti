//importacion de los modelos
const Comentarios = require('../../models/Comentarios');

exports.agregarComentario = async (req, res, next) => {

    const {comentario} = req.body;

    //crear comentario en la bd
    await Comentarios.create({
        mensaje: comentario,
        usuarioId: req.user.id,
        meetiId: req.params.id
    });

    //redirreccionar al usuario
    res.redirect('back');    
}

//elimina un comentario de la bd
exports.eliminarComentario = async (req, res, next) =>{
    res.send('se elimino');
}