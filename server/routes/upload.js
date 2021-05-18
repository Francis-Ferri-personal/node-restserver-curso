const express = require("express");
const fileUpload = require("express-fileupload");
const app = express();
const fs = require("fs");
const path = require("path");

const Usuario = require("../models/usuario");

const Producto = require("../models/producto");

// defauly options
// Este middleware lo que hace es que todo lo que e llega lo transforma en un objeto llamado files
app.use(fileUpload());

app.put("/upload/:tipo/:id", (req, res) => {
	const tipo = req.params.tipo;
	const id = req.params.id;

	if (!req.files) {
		return res.status(400).json({
			ok: false,
			err: {
				message: "No se ha seleccionado ningun archivo"
			}
		});
	}

	// Validar tipo
	const tiposValidos = ["productos", "usuarios"];
	if (tiposValidos.indexOf(tipo) < 0) {
		return res.status(400).json({
			ok: false,
			err: {
				message: "Los tipos permitidos son: " + tiposValidos.join(", ")
			}
		});
	}
	const archivo = req.files.archivo;

	// Extensiones permtitidas
	const extensionesValidas = ["png", "jpg", "gif", "jpeg"];
	const nombreCortado = archivo.name.split(".");
	const extension = nombreCortado[nombreCortado.length - 1];

	if (extensionesValidas.indexOf(extension) < 0) {
		return res.status(400).json({
			ok: false,
			err: {
				message:
					"Las extensiones permitidas son: " + extensionesValidas.join(", "),
				ext: extension
			}
		});
	}

	// Cambiar nombre al archivo
	// SE utiliza la fecha para que se creee un archivo distinto y no se sobreescriba el mismo y que la cache del navegador no piense que ya tiene el archivo
	// 512653217-2653.jpg
	const nombreArchivo = `${id}-${new Date().getMilliseconds()}-.${extension}`;

	// uploadPath = __dirname + "/uploads/" + archivo.name;
	uploadPath = `uploads/${tipo}/${nombreArchivo}`;

	// Use the mv() method to place the file somewhere on your server
	archivo.mv(uploadPath, (err) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				err
			});
		}

		// Aqui, imagen cargada
		switch (tipo) {
			case "usuarios":
				imagenUsuario(id, res, nombreArchivo);
				break;
			case "productos":
				imagenProducto(id, res, nombreArchivo);
				break;
			default:
				break;
		}
	});
});

const imagenUsuario = (id, res, nombreArchivo) => {
	Usuario.findById(id, (err, usuarioDB) => {
		if (err) {
			borrarArchivo(nombreArchivo, "usuarios");

			return res.status(500).json({
				ok: false,
				err
			});
		}

		if (!usuarioDB) {
			borrarArchivo(nombreArchivo, "usuarios");

			return res.status(400).json({
				ok: false,
				err: {
					message: "Usuario no existe"
				}
			});
		}

		borrarArchivo(usuarioDB.img, "usuarios");

		usuarioDB.img = nombreArchivo;

		usuarioDB.save((err, usuarioGuardado) => {
			res.json({
				ok: true,
				usuario: usuarioGuardado,
				img: nombreArchivo
			});
		});
	});
};

const imagenProducto = (id, res, nombreArchivo) => {
	Producto.findById(id, (err, productoDB) => {
		if (err) {
			borrarArchivo(nombreArchivo, "productos");
			return res.status(500).json({
				ok: false,
				err
			});
		}

		if (!productoDB) {
			borrarArchivo(nombreArchivo, "productos");
			return res.status(400).json({
				ok: false,
				err: {
					message: "Producto no existe"
				}
			});
		}

		borrarArchivo(productoDB.img, "productos");
		productoDB.img = nombreArchivo;

		productoDB.save((err, productoGuardado) => {
			res.json({
				ok: true,
				producto: productoGuardado,
				img: nombreArchivo
			});
		});
	});
};

const borrarArchivo = (nombreImagen, tipo) => {
	let pathImagen = path.resolve(
		__dirname,
		`../../uploads/${tipo}/${nombreImagen}`
	);

	// Borrar la anterior imagen del usuario si se pone una nueva
	if (fs.existsSync(pathImagen)) {
		fs.unlinkSync(pathImagen);
	}
};

module.exports = app;
