const models = require("../../models/index");
const user = models.user;
const md5 = require("md5");
const jwt = require("jsonwebtoken");
const config = require("../auth/secret.json");

const multer = require("multer"); //multer digunakan untuk membaca data request dari form-data
const path = require("path"); //path untuk menage alamat direktori file
const fs = require("fs"); // fs atau fole stream digunakan untuk manage file

//---------------------------------------------------------------------------------------------
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./image/user");
    },
    filename: (req, file, cb) => {
        cb(null, "image-" + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

module.exports = {
    // controller GET All
    controllerGetAll: (req, res) => {
        user
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
        const param = { id_user: req.params.id_user };
        user
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
            console.log(req.body);
            const data = {
                nama: req.body.nama,
                username: req.body.username,
                email: req.body.email,
                password: md5(req.body.password),
                role: req.body.role,
                image: req.file.path,
            };
            user.create(data).then((result) => {
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
            const param = { id_user: req.body.id_user };
            const data = {
                id: req.body.id,
                nama: req.body.nama,
                username: req.body.username,
                email: req.body.email,
                password: md5(req.body.password),
                role: req.body.role,
            };
            if (req.file) {
                // set new filename
                data.image = req.file.path
            }
            user
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
        const param = { id_user: req.params.id_user };
        let result = await user.findOne({where: param})
        const oldFileName = result.image
            
        // delete old file
        const dir = path.join(__dirname,"../image/user",oldFileName)
        fs.unlink(dir, err => console.log(err))

        user
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
    //controller AUTH
    controllerAuth: async (req, res) => {
        const data = {
            username: req.body.username,
            password: md5(req.body.password),
        };
        let result = await user.findOne({ where: data });
        if (result) {
            // generate token
            let token = jwt.sign({ sub: result.id, role: result.role }, config.secret);
            res.json({
                logged: true,
                data: result,
                token: token,
            });
        } else {
            console.log(req.body)
            res.json({
                logged: false,
                message: "Username or password is incorrect",
                data: req.body,
            });
        }
    },
};
