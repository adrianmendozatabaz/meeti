//importaciones
const Sequelize = require('sequelize');
const db = require('../config/db');
const uuid = require('uuid');
const Categorias = require('./Categorias');
const Usuarios = require('./Usuarios');

//modelo de la base de datos
const Grupos = db.define('grupos', {
    id:{
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: uuid.v4
    },
    nombre: {
        type: Sequelize.TEXT(100),
        allowNull: false,
        validate:{
            notEmpty: {
                msg: 'El grupo debe tener un nombre'
            }
        }
    },
    descripcion: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Coloca una descripción'
            }
        }
    },
    url: Sequelize.TEXT,
    imagen: Sequelize.TEXT
})

Grupos.belongsTo(Categorias);
Grupos.belongsTo(Usuarios);

//exportar
module.exports = Grupos;