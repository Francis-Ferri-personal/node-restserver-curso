const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const Usuario  = require("../models/usuario");
const app = express();


app.post("/login", (req, res) => {
    
    let body = req.body;
    // Si el correo no existe va a devolver null o undefined el error no es suficiente control

    Usuario.findOne({email: body.email}, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if ( !usuarioDB ){
            return res.status(400).json({
                ok: false,
                err: {
                    message: "(Usuario) o contraseña incorrectos"
                }
            });
        }

        if(!bcrypt.compareSync(body.password, usuarioDB.password)){
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Usuario o (contraseña) incorrectos"
                }
            });
        }

        const token = jwt.sign(
            {usuario: usuarioDB}, 
            process.env.SEED, 
            {expiresIn: process.env.CADUCIDAD_TOKEN}
        ); // Expira en 30 dias

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });

    });
});

// COnfiguraciones de Google
async function verify( token ) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    console.log(payload.name);
    console.log(payload.email);
    console.log(payload.picture);
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
  }


app.post("/google", async (req, res) => {
    let token = req.body.idtoken;
    const googleUser = await verify(token)
        .catch(err => {
            return res.status(403).json({
                ok: false,
                err
            });
        });

    Usuario.findOne({email: googleUser.email}, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };

        if (usuarioDB) {
            if(usuarioDB.google === false ){
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe de usar su autenticación normal'
                    }
                });
            } else {
                const token = jwt.sign(
                    {usuario: usuarioDB}, 
                    process.env.SEED, 
                    {expiresIn: process.env.CADUCIDAD_TOKEN}
                ); // Expira en 30 dias
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
        } else {
            // Si el usuario no existe en nuestra base de datos
            const usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            //
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {

                if(err){
                    return res.status(400).json({
                        ok: false,
                        err: {
                            message: 'Debe de usar su autenticación normal'
                        }
                    });
                };

                const token = jwt.sign(
                    {usuario: usuarioDB}, 
                    process.env.SEED, 
                    {expiresIn: process.env.CADUCIDAD_TOKEN}
                ); // Expira en 30 dias

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            });
        }
    });
});

module.exports = app;