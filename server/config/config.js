
// ===============
// Puerto
// ===============
process.env.PORT = process.env.PORT || 3000;

// ===============
// Entorno
// ===============
process.env.NODE_ENV = process.env.NODE_ENV || 'dev'

// ===============
// Base de datos
// ===============
let urlDB ;
if(process.env.NODE_ENV === 'dev'){
    urlDB = 'mongodb://23.251.147.196:80/cafe'
} else {
    urlDB = 'mongodb+srv://strider:QSVegGGhyWG7FxCp@cluster0.kthht.mongodb.net/cafe'
}
process.env.URLDB = urlDB;



