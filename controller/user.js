require("dotenv").config();
const Division = require("../model/Division");
const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const key = process.env.TOKEN_SECRET_KEY;
const cloudinary = require("../util/cloudinary_config");
const fs = require("fs");

const getAllUser = async (req, res, next) => {
  try {
    //TUGAS NOMOR 1
    const users = await User.findAll({
      //query = select id, fullname, nim, angkatan, profilePicture, divisionId from users
      attributes: [
        "id",
        "fullName",
        "nim",
        "angkatan",
        "profilePicture",
        "divisionId",
      ],
      //query = model user di inner joinkan dengan model division
      include: {
        model: Division,
        //model division yang dioutputkan hanya kolom name
        attributes: ["name"],
      },
    });

    res.status(200).json({
      status: "Success",
      message: "Successfully fetch all user data",
      users: users,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const getUserById = async (req, res, next) => {
  try {
    //TUGAS NOMOR 2 cari user berdasarkan userId
    // const { userId } = req.params;
    // const users = await User.findOne({
    //   attributes: [
    //     "id",
    //     "fullName",
    //     "nim",
    //     "angkatan",
    //     "profilePicture",
    //     "divisionId",
    //   ],
    //   //query = model user di inner joinkan dengan model division
    //   include: {
    //     model: Division,
    //     //model division yang dioutputkan hanya kolom name
    //     attributes: ["name"],
    //   },
    //   where: {
    //     id: userId,
    //   },
    // });
    // res.status(200).json({
    //   status: "Success",
    //   message: "Berhasil mendapatkan 1 data",
    //   users: users,
    // });
  } catch (error) {
    console.log(error.message);
  }
};

//handler register
const postUser = async (req, res, next) => {
  try {
    const { fullName, nim, angkatan, email, password, division } = req.body;

    //hashed password user
    const hashedPassword = await bcrypt.hash(password, 5);

    //cari divisi id
    //pakai await untuk menghindari penulisan then
    const user_division = await Division.findOne({
      where: {
        name: division,
      },
    });

    //SELECT * FROM DIVISION WHERE name = division
    if (user_division == undefined) {
      const error = new Error(`division ${division} is not existed!`);
      error.statusCode = 400;
      throw error;
    }

    //insert data ke tabel User
    const currentUser = await User.create({
      //nama field: data
      fullName: fullName,
      //jika nama field == data maka bisa diringkas
      email,
      password: hashedPassword,
      angkatan,
      nim,
      divisionId: user_division.id,
      role: "MEMBER",
    });

    const token = jwt.sign(
      {
        userId: currentUser.id,
        role: currentUser.role,
      },
      key,
      {
        algorithm: "HS256",
        expiresIn: "1h",
      }
    );

    //send response
    res.status(201).json({
      status: "success",
      message: "Register Successfull!",
      token,
    });
  } catch (error) {
    //jika status code belum terdefined maka status = 500;
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const loginHandler = async (req, res, next) => {
  try {
    // ambil data dari req body
    const { email, password } = req.body;
    console.log(email, password);
    const currentUser = await User.findOne({
      where: {
        //namaKolom: data_request_body
        email: email,
      },
    });
    //apabila user tidak ditemukan
    if (currentUser == undefined) {
      const error = new Error("wrong email or password");
      error.statusCode = 400;
      throw error;
    }
    const checkPassword = await bcrypt.compare(password, currentUser.password);

    //apabila password salah / tidak matched
    if (checkPassword === false) {
      const error = new Error("wrong email or password");
      error.statusCode = 400;
      throw error;
    }

    const token = jwt.sign(
      {
        userId: currentUser.id,
        role: currentUser.role,
      },
      key,
      {
        algorithm: "HS256",
        expiresIn: "1h",
      }
    );

    res.status(200).json({
      status: "Success",
      message: "Login Successfull!",
      token,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "errorr",
      message: error.message,
    });
  }
};

const deleteUser = async (req, res, next) => {
  //hanya admin yang bisa ngedelete
  try {
    //step 1 mengambil token
    //mengambil header
    const header = req.headers;

    //mengambil header authnya
    const authorization = header.authorization;
    let token;

    //console.log(authorization); //Bearer token...
    if (authorization !== undefined && authorization.startsWith("Bearer ")) {
      //mengilangkan string "Bearer "
      token = authorization.substring(7);
      //token akan bernilai token
    } else {
      const error = new Error("You need to login");
      error.statusCode = 403;
      throw error;
    }
    //ekstrak payloadnya agar bisa mendapatkan userId dan role
    const decoded = jwt.verify(token, key);

    //decoded mempunyai 2 property yaitu userId dan role
    if (decoded.role !== "ADMIN") {
      const error = new Error("You don't have access!!!");
      error.statusCode = 403; //FORBIDDEN
      throw error;
    }

    //menjalankan operasi hapus
    const { userId } = req.params;

    const targetedUser = await User.destroy({
      where: {
        id: userId,
      },
    });

    if (targetedUser === undefined) {
      const error = new Error(`User with id ${userId} is not existed`);
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      status: "Success",
      message: "Successfully delete user",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

//TODO 1
const getUserByToken = async (req, res, next) => {
  try {
    //tugas lengkapi codingan
    //hanya user yang telah login bisa mengambil data dirinya dengan mengirimkan token

    //step 1 ambil token
    const authorization = req.headers.authorization;
    let token;

    if (authorization !== undefined && authorization.startsWith("Bearer ")) {
      token = authorization.substring(7);
    } else {
      const error = new Error("You need to login");
      error.statusCode = 400;
      throw error;
    }

    //step 2 ekstrak payload menggunakan jwt.verify

    //decoded memiliki decoded.userId dan decoded.role
    const decoded = jwt.verify(token, key);

    //step 3 cari user berdasarkan payload.userId
    const user = await User.findOne({
      attributes: [
        "id",
        "fullName",
        "nim",
        "angkatan",
        "profilePicture",
        "divisionId",
      ],
      include: {
        model: Division,
        attributes: ["name"],
      },
      where: {
        //dengan id = deocded.userId
        id: decoded.userId,
      },
    });

    // jika user tidak ada maka kirim error
    if (user === undefined) {
      const error = new Error(`User is not existed`);
      error.statusCode = 404;
      throw error;
    }

    // jika user ada maka kirim success
    res.status(200).json({
      status: "Success",
      message: "Successfully ambil data",
      user,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

// Edit user account (fullname, angkatan, nim, profilePicture/Image)
const editUserAccount = async (req, res, next) => {
  try {
    // ekstrak tokennya
    const authorization = req.headers.authorization;
    let token;
    if (authorization !== null && authorization.startsWith("Bearer ")) {
      token = authorization.substring(7);
    } else {
      const error = new Error("You need to log in");
      error.statusCode = 403;
      throw error;
    }

    const decoded = jwt.verify(token, key);

    // cari usernya
    const currentUser = await User.findOne({
      where: {
        // dengan id = decoded.userId
        id: decoded.userId,
      },
    });

    if (!currentUser) {
      const error = new Error(`User with id ${decoded.userId} does not exist`);
      error.statusCode = 400;
      throw error;
    }

    // didapat iamge URL
    let imageUrl;

    // proses datanya
    if (req.file) {
      const file = req.file;

      const uploadOption = {
        folder: "Profile_Member/",
        public_id: `user_${currentUser.id}`,
        overwrite: true,
      };
      // Mengirim ke cloudinary
      const uploadFile = await cloudinary.uploader.upload(
        file.path,
        uploadOption
      );
      imageUrl = uploadFile.secure_url;
      // menghapus file yang diupload di dalam dir lokal
      fs.unlinkSync(file.path);
    }

    // ---- TUGASNYA ----
    // image url bakal diupdate kedalam databse user bersangkutan
    // ngambil data dari form-data
    const { fullName, nim, angkatan } = req.body;
    // update ke database
    await User.update(
      { profilePicture: imageUrl, fullName, nim, angkatan },
      { where: { id: decoded.userId } }
    );

    res.status(200).json({
      status: "Succes",
      message: "Data changed successfully",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error,
    });
  }
};

module.exports = {
  getAllUser,
  getUserById,
  postUser,
  deleteUser,
  loginHandler,
  getUserByToken,
  editUserAccount,
  // updateUserByToken,
};
