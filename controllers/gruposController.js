//importaciones
const Categorias = require('../models/Categorias');
const Grupos = require('../models/Grupos');
const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');

//subir la imagen
const configuracionMulter = {
    limits: {
        fileSize: 200000
    },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => {
            next(null, __dirname + '/../public/uploads/grupos/')
        },
        filename: (req, file, next) => {
            const extension = file.mimetype.split('/')[1];
            next(null, `${shortid.generate()}.${extension}`)
        }
    }),
    fileFilter(req, file, next) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            //el formato es valido
            next(null, true);
        } else {
            //el formato no es valido
            next(new Error('Formato no valido'), false);
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');

exports.subirImagen = (req, res, next) => {
    upload(req, res, function (error) {
        if (error) {
            if (error instanceof multer.MulterError) {
                if (error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El Archivo es demasiado grande');
                } else {
                    req.flash('error', error.message)
                }
            } else if (error.hasOwnProperty('message')) {
                req.flash('error', error.message);
            }
            res.redirect('back');
            return;
        } else {
            next();
        }
    })
}

//manda al formulario de nuevo grupo
exports.formNuevoGrupo = async (req, res) => {
    const categorias = await Categorias.findAll();

    res.render('nuevo-grupo', {
        nombrePagina: 'Crea un nuevo grupo',
        categorias
    })
}

// almacena los grupos en la bd
exports.crearGrupo = async (req, res) => {
    const grupo = req.body;

    //almacena el usuario autenticado y la categoria id
    grupo.usuarioId = req.user.id;

    //leer la imagen
    if (req.file) {
        grupo.imagen = req.file.filename;
    }

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

//editar grupo
exports.formEditarGrupo = async (req, res) => {
    const grupo = await Grupos.findByPk(req.params.grupoId);
    const categorias = await Categorias.findAll();

    res.render('editar-grupo', {
        nombrePagina: `Editar Grupo: ${grupo.nombre}`,
        grupo,
        categorias
    })

    /* funciona este codigo pero en la bd se llama igual los datos entonces no se sabe cual especificar
    const consultas = [];
    consultas.push(Grupos.findByPk(req.params.grupoId));
    consultas.push(Categorias.findAll());

    //Promise con awai 
    const {grupo, categorias} = await Promise.all(consultas);

    res.render('editar-grupo', {
        nombrePagina: `Editar Grupo: ${grupo.nombre}`,
        grupo,
        categorias
    })
    */
}

//guarda los cambios en la base de datos
exports.editarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({
        where: {
            id: req.params.grupoId,
            usuarioId: req.user.id
        }
    });

    //si no existe ese grupo o el usuario no es
    if (!grupo) {
        req.flash('error', 'Operacion no valida');
        res.redirect('/administracion');
        return next();
    }

    //todo bien leer los valores
    const {
        nombre,
        descripcion,
        categoriaId,
        url
    } = req.body;

    //asignar los valores
    grupo.nombre = nombre;
    grupo.descripcion = descripcion;
    grupo.categoriaId = categoriaId;
    grupo.url = url;

    //guardamos en la bd
    await grupo.save();
    req.flash('exito', 'Cambios almacenados Correctamente');
    res.redirect('/administracion');
}


//editar la imagen del grupo en form
exports.formEditarImagen = async (req, res) => {
    const grupo = await Grupos.findOne({
        where: {
            id: req.params.grupoId,
            usuarioId: req.user.id
        }
    });

    res.render('imagen-grupo', {
        nombrePagina: `Editar Imagen Grupo: ${grupo.nombre}`,
        grupo
    })
}

// modifica la imagen en la bd y elimina la anterior
exports.editarImagen = async (req, res, next) => {
    const grupo = await Grupos.findOne({
        where: {
            id: req.params.grupoId,
            usuarioId: req.user.id
        }
    });

    //el grupo existe y es valido
    if (!grupo) {
        req.flash('error', 'Operacion no válida');
        res.redirect('/iniciar-sesion');
        return next();
    }

    //si hay imagen anterior y nueva borrar la anterior
    if (req.file && grupo.imagen) {
        const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;
        //eliminar archivo con filesystem
        fs.unlink(imagenAnteriorPath, (error) => {
            if (error) {
                console.log(error);
            }
            return;
        })
    }

    //si hay una imagen nueva la guardamos
    if (req.file) {
        grupo.imagen = req.file.filename;
    }

    //guardar en l abd
    await grupo.save();
    req.flash('exito', 'Cambios Almacenados Correctamente');
    res.redirect('/administracion');
}

//form para eliminar grupo
exports.formEliminarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({
        where: {
            id: req.params.grupoId,
            usuarioId: req.user.id
        }
    })

    //si no existe
    if (!grupo) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    //todo bien ejecutar la vista
    res.render('eliminar-grupo', {
        nombrePagina: `Eliminar Grupo: ${grupo.nombre}`
    })
}

//eliminar el grupo e imagen
exports.eliminarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({
        where: {
            id: req.params.grupoId,
            usuarioId: req.user.id
        }
    })

    //si no existe
    if (!grupo) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    //SI HAY UNA IMAGEN ELIMINARLA
    if(grupo.imagen){
        const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;
        //eliminar archivo con filesystem
        fs.unlink(imagenAnteriorPath, (error) => {
            if (error) {
                console.log(error);
            }
            return;
        })
    }

    //ELIMINAR EL GRUPO
    await Grupos.destroy({
        where: {
            id: req.params.grupoId
        }
    })

    //redireccionar la usuario
    req.flash('exito', 'Grupo Eliminado');
    res.redirect('/administracion');
}