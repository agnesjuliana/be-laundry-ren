const models = require("../../models/index");
const paket = models.paket;
const md5 = require("md5");
const jwt = require("jsonwebtoken");
const config = require("../auth/secret.json");

const multer = require("multer"); //multer digunakan untuk membaca data request dari form-data
const path = require("path"); //path untuk menage alamat direktori file
const fs = require("fs"); // fs atau fole stream digunakan untuk manage file

//---------------------------------------------------------------------------------------------
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./image/paket");
    },
    filename: (req, file, cb) => {
        cb(null, "image-" + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

module.exports = {
    // controller GET All
    controllerGetAll: (req, res) => {
        paket
            .findAll()
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
        const param = { id_paket: req.params.id_paket };
        paket
            .findOne({ where: param })
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
        upload.single("image")(req, res, () => {
            const data = {
                jenis: req.body.jenis,
                harga: req.body.harga,
                image: req.file.path,
            };
            paket.create(data).then((result) => {
                res.json({
                    message: "Data berhasil ditambahkan",
                    success: 1,
                    data: result,
                });
            });
        });
    },
    // controller EDIT
    controllerEdit: (req, res) => {
        upload.single("image")(req, res, () => {
            const param = { id_paket: req.body.id_paket };
            const data = {
                id: req.body.id,
                jenis: req.body.jenis,
                harga: req.body.harga,
            };
            if (req.file) {
                // set new filename
                data.image = req.file.path
            }
            paket
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
        });
    },
    // controller DELETE
    controllerDelete: async (req, res) => {
        const param = { id_paket: req.params.id_paket };
        let result = await paket.findOne({where: param})
        const oldFileName = result.image
            
        // delete old file
        const dir = path.join(__dirname,"../image/paket",oldFileName)
        fs.unlink(dir, err => console.log(err))

        paket
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
