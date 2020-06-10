//importacion de los modelos
const Comentarios = require('../../models/Comentarios');
const Meeti = require('../../models/Meeti');

exports.agregarComentario = async (req, res, next) => {

    const {
        comentario
    } = req.body;

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
exports.eliminarComentario = async (req, res, next) => {
    //tomar el id del comentario
    const {
        comentarioId
    } = req.body;

    //consultar el comentario
    const comentario = await Comentarios.findOne({
        where: {
            id: comentarioId
        }
    })    
    //verificar si existe el comentario
    if(!comentario){
        res.status(404).send('Acción no valida');
        return next();
    }

    //consultar el meeti al que pertenece el comentario
    const meeti = await Meeti.findOne({
        where: {
            id: comentario.meetiId
        }
    })

    //verificar que el que borra sea el creador
    if(comentario.usuarioId === req.user.id || meeti.usuarioId === req.user.id){
        await Comentarios.destroy({
            where: {
                id: comentario.id
            }
        })
        res.status(200).send('Eliminado Correctamente');
        return next();
    }else{
        res.status(403).send('Acción no valida');
        return next();
    }

}