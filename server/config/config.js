
// ===============
// Puerto
// ===============
process.env.PORT = process.env.PORT || 3000;

// ===============
// Entorno
// ===============
process.env.NODE_ENV = process.env.NODE_ENV || 'dev'

// ===============
// Vencimiento del Token
// ===============
process.env.CADUCIDAD_TOKEN = '48h';


// ===============
// SEED de autenticacion
// ===============
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';


// ===============
// Base de datos
// ===============
let urlDB ;
if(process.env.NODE_ENV === 'dev'){
    urlDB = 'mongodb://34.69.61.151:80/cafe'
} else {
    urlDB = process.env.MONGO_URI;
}
process.env.URLDB = urlDB;

// ===============
// Google CLient ID
// ===============
process.env.CLIENT_ID = process.env.CLIENT_ID || '375194599580-lf21a6m196nfkvuepsgbec7uke6fil9t.apps.googleusercontent.com'


