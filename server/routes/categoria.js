const express = require('express');
const _ = require("underscore");
const Categoria = require("../models/categoria");

const { verificarToken, verificarAdminRole } = require('../middlewares/autenticacion');


const app = express();

// ============================
// Mostrar todas las categorias
// ============================
app.get('/categoria', verificarToken, (req, res) => {
    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categoriasBD) => {
        if (err){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.status(200).json({
            ok: true,
            categorias: categoriasBD
        });
    });
});

// ============================
// Mostrar una categoria por ID
// ============================
app.get('/categoria/:id', verificarToken, (req, res) => {
    // Categoria.findById();
    const id = req.params.id;
    Categoria.findById(id, (err, categoriaDB) => {
        if(err){
            return res.status(400).json({
                ok: false,
                err
            })
        };

        if(!categoriaDB){
            return res.status(400).json({
                ok: false,
                err: {
                    message: "El ID no es correcto"
                }
            })
        };
        
        res.status(200).json({
            ok: true,
            categoria: categoriaDB
        });
    });
});


// ============================
// Crear nueva categoria
// ============================
app.post('/categoria', [verificarToken, verificarAdminRole] ,(req, res) => {
    const body = req.body;
    const categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB){
            return res.status(400).json({
                ok: false,
                err
            });
        }
        
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});


// ============================
// Actualizar categoria
// ============================
app.put('/categoria/:id', [verificarToken, verificarAdminRole] ,(req, res) => {
    
    const id = req.params.id;
    const body = req.body;
    
    const descCategoria = {
        descripcion: body.descripcion
    };

    const options = {
        new: true,
        runValidators: true
    };

    Categoria.findOneAndUpdate(id, descCategoria, options, (err, categoriaDB) => {
        
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.status(200).json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

// ============================
// Actualizar categoria
// ============================
app.delete('/categoria/:id', [verificarToken, verificarAdminRole], (req, res) => {
    // Solo un admiistrador puede borrar categorias
    // Categoria.findByIdAndRemove
    const id = req.params.id;
    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
        
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!categoriaDB){
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Categoria no encontrada el ID no existe"
                }
            });
        }

        res.status(200).json({
            ok: true,
            message: "Categoria borrada"
        });
    });
});

module.exports =  app;