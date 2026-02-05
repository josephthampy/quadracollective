const express = require('express');

const initRoute = (app) =>{
    // Only keep post and admin routes for personal portfolio
    app.use(require("./postRouter"))
    app.use("/admin", require("./adminRouter"))
}

module.exports = initRoute;