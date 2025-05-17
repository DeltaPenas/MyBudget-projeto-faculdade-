const jwt = require('jsonwebtoken');

function autenticarToken(req, res, next){
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) return res.status(401).send('Token não fornecido');

    jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
        if (err) return res.status(403).send('Token inválido');
        req.usuarioId = usuario.id;
        next();
    });
}

    module.exports = autenticarToken;

