const express = require("express");

const fs = require("fs");
const path = require("path");

const { verificarTokenImg } = require("../middlewares/autenticacion");

const app = express();

app.get("/imagen/:tipo/:img", verificarTokenImg, (req, res) => {
	const tipo = req.params.tipo;
	const img = req.params.img;

	const pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);

	if (fs.existsSync(pathImagen)) {
		res.sendFile(pathImagen);
	} else {
		const noImagePath = path.resolve(__dirname, "../Assets/no-image.jpg");
		res.sendFile(noImagePath);
	}
});

module.exports = app;
