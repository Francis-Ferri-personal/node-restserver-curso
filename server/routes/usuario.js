const express = require('express');
const bcrypt = require('bcrypt');
const _ = require("underscore");

const Usuario  = require("../models/usuario");
const { verificarToken, verificarAdminRole } = require('../middlewares/autenticacion');

const app = express();

// app.get('/', function (req, res) {
// El segundo argumento es el middleware que se va adisparar cuandos e quiera accesar a esta ruta
app.get('/usuario', verificarToken ,(req, res) => {

    const desde = Number(req.query.desde) || 0;
    const limite = Number(req.query.limite) || 5;
    Usuario.find({}, "nombre email role estado google")
    .where({estado: true})
    .skip(desde)
    .limit(limite)
    .exec((err, usuarios) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        // Usuario.count({google: true}, ((err, conteo) => {
        Usuario.count({estado: true}, ((err, conteo) => {

            res.json({
                ok: true,
                usuarios,
                cuantos: conteo
            });
        }));
    });
});

app.post('/usuario', [verificarToken, verificarAdminRole], (req, res) => {
    const body = req.body;
    const usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        })
    });
});

app.put('/usuario/:id', [verificarToken, verificarAdminRole], (req, res) => {
    const id = req.params.id;
    const campos = ["nombre", "email", "img", "role", "estado"];
    let body = _.pick(req.body, campos) ;

    // Siempre has validaciones 

    const options = {
        new: true,
        runValidators: true
    };

    Usuario.findByIdAndUpdate(id, body, options, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        
        res.json({
            ok: true,
            err,
            usuario: usuarioDB
        });
        
    })
});

app.delete('/usuario/:id', [verificarToken, verificarAdminRole], (req, res) => {
    // En proyectos reales no elimines los registros de las bases de datoss, lo que se hace es cambiar el esstado del registro para que deje de estar disponible. Estos reguistros pueden serviur para auditoira
    let id = req.params.id;
    const cambiaEstado = { estado: false };

    const options = { new: true };
    
    Usuario.findByIdAndUpdate(id, cambiaEstado, options, (err, usuarioBorrado) => {
        if (err){
            return res.status(400).json({
                ok: false,
                err
            });
        };

        if(!usuarioBorrado){
            return res.json({
                ok: false,
                err: {
                    message: "Usuario no encontrado"
                }
            })    
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    })


    /* Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        if(!usuarioBorrado){
            return res.json({
                ok: false,
                err: {
                    message: "Usuario no encontrado"
                }
            })    
        }
        res.json({
            ok: true,
            usuario: usuarioBorrado
        })
    }); */
});

module.exports = app;