const jwt = require('jsonwebtoken');
// =================
// Verificar Token
// =================

const verificarToken = (req, res, next) => {
    // Obtener campo de los headers
    const token = req.get('token');
    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if(err){
            return res.status(401).json({
                ok: false,
                err: "Token no valido"
            });
        }
        req.usuario = decoded.usuario;
        next();
    });
}


// =================
// Verificar Admin rol
// =================
const verificarAdminRole = (req, res, next) => {
    const usuario = req.usuario;
    if(usuario.role === "ADMIN_ROLE"){
        next();
    } else {
        return res.status(401).json({
            ok: false,
            err: "El usuario no es administrador"
        });
    }
    
};

module.exports = { verificarToken, verificarAdminRole };