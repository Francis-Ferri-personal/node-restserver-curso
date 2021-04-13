require("./config/config");

const express = require('express');

const app = express();

const  bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json
app.use(bodyParser.json());

// app.get('/', function (req, res) {
app.get('/usuario', (req, res) => {
  res.json('get Usuario')
});

app.post('/usuario', (req, res) => {
    const body = req.body;
    if (!body.nombre){
        res.status(400).json(
            {
                ok: false,
                mensaje: "El nombre es necesario"
            }
        );
    } else {
        res.json({persona: body});
        // res.json({...body});
    }
});

app.put('/usuario/:id', (req, res) => {
    const id = req.params.id;
    res.json({id});
});

app.delete('/usuario', (req, res) => {
    // En proyectos reales no elimines los registros de las bases de datoss, lo que se hace es cambiar el esstado del registro para que deje de estar disponible. Estos reguistros pueden serviur para auditoira
    res.json("delete Usuario");
})
 
app.listen(process.env.PORT, () => console.log(`Escuchando puerto: ${process.env.PORT}`));