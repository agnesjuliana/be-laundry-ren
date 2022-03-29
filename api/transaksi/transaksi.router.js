const express = require("express");
const router = express.Router();
const { controllerGetAll, controllerGetId, controllerAdd, controllerEdit, controllerDelete } = require("./transaksi.controller");
const authorize = require("../auth/authorize");
const { IsAdminKasir, IsAdmin, IsOwner } = require("../auth/role");

// routes
router.get("/", controllerGetAll); //admin 
router.get("/:id_transaksi", authorize, IsAdminKasir, controllerGetId); //admin 
router.post("/", authorize, IsAdminKasir, controllerAdd); // admin kasir
router.put("/", authorize, IsAdminKasir, controllerEdit); //admin kasir
router.delete("/:id_transaksi", authorize, IsAdminKasir, controllerDelete); //admin admin 
module.exports = router;
