const models = require("../../models/index");
const moment = require('moment');
const transaksi = models.transaksi;
const detail_transaksi = models.detail_transaksi;

const md5 = require("md5");
const jwt = require("jsonwebtoken");
const config = require("../auth/secret.json");
const { request, response } = require("express");

let date = moment()
let batas = moment(date).add('days', 4)

module.exports = {
    // controller GET All
    controllerGetAll: async (req, res) => {
        transaksi
            .findAll({
                include: [{ all: true, nested: true }],
            })

            .then((result) => {
                res.json({
                    success: 1,
                    data: result,
                });
            })
            .catch((error) => {
                res.json({
                    message: error.message,
                });
            });
    },
    // controller GET by ID
    controllerGetId: (req, res) => {
        const param = { id_transaksi: req.params.id_transaksi };
        transaksi
            .findOne({ where: param, include: [{ all: true, nested: true }] })
            .then((result) => {
                res.json({
                    success: 1,
                    data: result,
                });
            })
            .catch((error) => {
                res.json({
                    message: error.message,
                });
            });
    },
    // controller ADD
    controllerAdd: (req, res) => {
        console.log(req.body);
        let tgl_bayar = ""
        if (req.body.dibayar === "dibayar") {
            tgl_bayar = date
        }
        let newTransaksi = {
            id_member: req.body.id_member,
            tgl: date,
            batas_waktu: batas,
            tgl_bayar: tgl_bayar,
            status: req.body.status,
            dibayar: req.body.dibayar,
            id_user: req.body.id_user,
            id_outlet: req.body.id_outlet,
        }

        transaksi.create(newTransaksi)
            .then((result) => {
                console.log("controlerAdd terpanggil .....");
                console.log(result)
                let lastID = result.id_transaksi
                let detail = req.body.detail_transaksi


                for (let i = 0; i < detail.length; i++) {
                    detail[i].id_transaksi = lastID
                }

                detail.forEach(element => {
                    element.id_transaksi = lastID
                });
                console.log(detail)
                // proses insert detail_transaksi
                detail_transaksi
                    .bulkCreate(detail)
                    .then((result) => {
                        res.json({
                            message: `Data transaksi berhasil ditambahkan`,
                        });
                    })
                    .catch((error) => {
                        res.json({
                            message: error.message,
                        });
                    });
            })
            .catch((error) => {
                console.log(error)
                return res.json({
                    message: error.message,
                });
            });
    },
    // controller EDIT
    controllerEdit: (req, res) => {
        const param = { id_transaksi: req.body.id_transaksi };
        const data = {
            id: req.body.id,
            id_member: req.body.id_member,
            status: req.body.status,
            dibayar: req.body.dibayar,
            id_user: req.body.id_user,
            id_outlet: req.body.id_outlet,
        };
        transaksi
            .update(data, { where: param })
            .then((result) => {
                res.json({
                    success: 1,
                    data: result,
                });
            })
            .catch((error) => {
                res.json({
                    message: error.message,
                });
            });
    },
    // controller DELETE
    controllerDelete: async (req, res) => {
        const param = { id_transaksi: req.params.id_transaksi };
        let result = await transaksi.findOne({ where: param })
        transaksi
            .destroy({ where: param })
            .then((result) => {
                res.json({
                    success: 1,
                    data: result,
                    message: "Data Berhasil Dihapus",
                });
            })
            .catch((error) => {
                res.json({
                    message: error.message,
                });
            });
    },
};
