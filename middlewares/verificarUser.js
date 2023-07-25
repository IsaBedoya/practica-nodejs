module.exports = (req, res, next) => {
    if (req.isAuthenticated()) { // Si se ha autentificado
        return next(); // Permite ejecutar la siguiente acción
    }
    res.redirect("/auth/login"); // En caso contrario, redirecciona al login
}