//importaciones
const Categorias =require('../models/Categorias');
const Grupos =require('../models/Grupos');

//manda al formulario de nuevo grupo
exports.formNuevoGrupo = async (req, res) =>{
    const categorias = await Categorias.findAll();

    res.render('nuevo-grupo', {
        nombrePagina: 'Crea un nuevo grupo',
        categorias
    })
}

// almacena los grupos en la bd
exports.crearGrupo = async (req, res) =>{
    const grupo = req.body;

    //almacena el usuario autenticado y la categoria id
    grupo.usuarioId = req.user.id;

    try {
        await Grupos.create(grupo);
        req.flash('exito', 'Se ha creado el grupo correctamente');
        res.redirect('/administracion');
    } catch (error) {
        //estraer los errores
        const erroresSequelize = error.errors.map(err => err.message);
        
        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-grupo');
    }
    
}