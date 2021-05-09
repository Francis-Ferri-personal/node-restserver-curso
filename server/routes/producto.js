const express = require('express');
const _ = require("underscore");

const { verificarToken } = require('../middlewares/autenticacion');

const Producto = require('../models/producto');

const app = express();


// ========================
// Obtener productos
// ========================
app.get("/producto", verificarToken, (req, res) => {
    // Trae todos los productos
    // populate: usuario, categoria
    // paginado

    const desde = Number(req.query.desde) || 0;
    const limite = Number(req.query.limite) || 5;

    Producto
        .find({disponible: true})
        .skip(desde)
        .limit(limite)
        .populate("usuario", "nombre email")
        .populate("categoria", "descripcion")
    .exec((err, productosDB) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.status(200).json({
            ok: true,
            productos: productosDB
        });
    });
});

// ========================
// Obtener producto por ID
// ========================
app.get('/producto/:id', verificarToken, (req, res) => {
    // populate: usuario, categoria
    const id = req.params.id;
    Producto
        .findById(id)
        .populate("usuario", "nombre email")
        .populate("categoria", "descripcion")
    .exec((err, productoDB) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!productoDB){
            return res.status(400).json({
                ok: false,
                err: {
                    message: "El ID no es correcto"
                }
            })
        };

        res.status(200).json({
            ok: true,
            producto: productoDB
        });
    });
});


// ========================
// Buscar productos
// ========================
app.get('/producto/buscar/:termino', verificarToken, (req, res) => {
    // Esto deberias hacerlo mejor con query
    const termino = req.params.termino;
    // Transforma en una expresion regular
    let regex = new RegExp(termino, 'i');
    
    Producto.find({nombre: regex})
        .populate("categoria", "descripcion")
    .exec((err, productosDB) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
        res.status(201).json({
            ok: true,
            pdoducto: productosDB
        });
    })
})

// ========================
// Crear un nuevo producto
// ========================
app.post('/producto', verificarToken, (req, res) => {
    // grabar el usuario
    // grabar una categoria del listado
    const campos = ["nombre", "precioUni", "descripcion", "disponible", "categoria", "usuario"];
    const body = _.pick(req.body, campos) ;

    const producto = new Producto(body);
    producto.save((err, productoDB)=> {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
        res.status(201).json({
            ok: true,
            pdoducto: productoDB
        });
    })
    
});


// ========================
// Actualizar un producto
// ========================
app.put('/producto/:id', verificarToken, (req, res) => {
    // grabar el usuario
    // grabar una categoria del listado

    // LA FORMA COMENTADA ESTA MEJOR
    const id = req.params.id;
    const body = req.body;
    
    Producto.findById(id, (err , productoDB) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!productoDB){
            return res.status(500).json({
                ok: false,
                err : {
                    message: "El ID no existe"
                }
            });
        }

        productoDB.nombre = body.nombre || productoDB.nombre;
        productoDB.precioUni = body.precioUni || productoDB.precioUni;
        productoDB.descripcion = body.descripcion || productoDB.descripcion;
        productoDB.disponible = body.disponible || productoDB.disponible;
        productoDB.categoria = body.categoria || productoDB.categoria;
        productoDB.usuario = body.usuario || productoDB.usuario;

        productoDB.save((err, productoGuardado) => {
            if(err){
                return res.status(500).json({
                    ok: false,
                    err
                });
            };
            res.status(200).json({
                ok: true,
                pdoducto: productoGuardado
            });
        });
    });

    /* 
    const campos = ["nombre", "precioUni", "descripcion", "disponible", "categoria"]; 
    const body = _.pick(req.body, campos);

    const options = {
        new: true,
        runValidators: true
    };

    Producto.findByIdAndUpdate(id, body, options, (err, productoDB) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.status(200).json({
            ok: true,
            producto: productoDB
        });
    }); */
});


// ========================
// Borrar un producto
// ========================
app.delete('/producto/:id', verificarToken, (req, res) => {
    // cambiar estado a no disponible

    // LA FORMA COMENTADA ESTA MEJOR
    const id = req.params.id;
    const body = req.body;
    
    Producto.findById(id, (err , productoDB) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!productoDB){
            return res.status(500).json({
                ok: false,
                err : {
                    message: "El ID no existe"
                }
            });
        }
        productoDB.disponible = false;

        productoDB.save((err, productoBorrado) => {
            if(err){
                return res.status(500).json({
                    ok: false,
                    err
                });
            };
            res.status(200).json({
                ok: true,
                pdoducto: productoBorrado
            });
        });
    });

    /* const id = req.params.id;
    const cambiaEstado = { disponible: false };

    const options = { new: true };
    
    Producto.findByIdAndUpdate(id, cambiaEstado, options, (err, productoDB) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB){

            return res.status(400).json({
                ok: false,
                err: {
                    message: "Producto no encontrado"
                }
            });
        }

        res.status(200).json({
            ok: true,
            producto: productoDB
        });
    }) */
});



module.exports = app;