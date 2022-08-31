const express = require('express');
const router = express.Router();
const db = require('./dbConnection');
const { signupValidation, loginValidation } = require('./validation');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./model/User');
const Unit = require('./model/Unit');

router.post('/register', signupValidation, (req, res, next) => {
    let response = {
        status: 409
    }

    User.findOne({
        where: {
            email: req.body.email
        }
    })
    .then((ifExists) => {
        if(ifExists){
            throw 'This user is already in use!'
        }

        return bcrypt.hash(req.body.password, 10);
    })
    .then((hashedPassword) => {
        if(!hashedPassword){
            response.status = 500
            throw 'Problem creating user'
        }

        return User.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
    })
    .then((userCreated) => {
        if(!userCreated){
            response.status = 400
            throw "Unable to create user"
        }

        response.status = 200;
        response.body = {
            msg: 'The user has been registerd with us!',
        }
    })
    .catch((e) => {
        response.body = {
            msg: e
        }
    })
    .finally(() => {
        return res.status(response.status).send(response.body)
    })

    // db.query(
    //     `SELECT * FROM users WHERE LOWER(email) = LOWER(${db.escape(
    //         req.body.email
    //     )});`,
    //     (err, result) => {
    //         if (result.length) {
    //             return res.status(409).send({
    //                 msg: 'This user is already in use!'
    //             });
    //         } else {
    //             // username is available
    //             bcrypt.hash(req.body.password, 10, (err, hash) => {
    //                 if (err) {
    //                     return res.status(500).send({
    //                         msg: err
    //                     });
    //                 } else {
    //                     // has hashed pw => add to database
    //                     db.query(
    //                         `INSERT INTO users (name, email, password) VALUES ('${req.body.name}', ${db.escape(
    //                             req.body.email
    //                         )}, ${db.escape(hash)})`,
    //                         (err, result) => {
    //                             if (err) {
    //                                 return res.status(400).send({
    //                                     msg: err
    //                                 });
    //                             }
    //                             return res.status(201).send({
    //                                 msg: 'The user has been registerd with us!'
    //                             });
    //                         }
    //                     );
    //                 }
    //             });
    //         }
    //     }
    // );
});

router.post('/login', loginValidation, (req, res, next) => {
    let response = {
        status: 401
    }, userObj = {};

    User.findOne({
        where: {
            email: req.body.email
        }
    })
    .then((userExists) => {
        if(!userExists){
            throw 'Email is incorrect!';
        }

        userObj = userExists;
        return bcrypt.compare(req.body.password, userExists['password']);
    })
    .then((becryptedResult) => {
        if(!becryptedResult){
            throw 'Email or password is incorrect!';
        }

        const token = jwt.sign({ id: userObj.id }, 'the-super-strong-secrect', { expiresIn: '1h' });
        response.status = 200;
        response.body = {
            msg: 'Logged in!',
            token,
            user: JSON.stringify(userObj)
        }
    })
    .catch((e) => {
        response.body = {
            msg: e
        }
    })
    .finally(() => {
        return res.status(response.status).send(response.body)
    })

    // db.query(
    //     `SELECT * FROM users WHERE email = ${db.escape(req.body.email)};`,
    //     (err, result) => {
    //         // user does not exists
    //         if (err) {
    //             return res.status(400).send({
    //                 msg: err
    //             });
    //         }
    //         if (!result.length) {
    //             return res.status(401).send({
    //                 msg: 'Email is incorrect!'
    //             });
    //         }
    //         // check password
    //         bcrypt.compare(
    //             req.body.password,
    //             result[0]['password'],
    //             (bErr, bResult) => {
    //                 // wrong password
    //                 if (bErr) {
    //                     return res.status(401).send({
    //                         msg: 'Email or password is incorrect!'
    //                     });
    //                 }
    //                 if (bResult) {
    //                     const token = jwt.sign({ id: result[0].id }, 'the-super-strong-secrect', { expiresIn: '1h' });
    //                     // db.query(
    //                     //     `UPDATE users SET last_login = now() WHERE id = '${result[0].id}'`
    //                     // );
    //                     return res.status(200).send({
    //                         msg: 'Logged in!',
    //                         token,
    //                         user: result[0]
    //                     });
    //                 }
    //                 return res.status(401).send({
    //                     msg: 'Username or password is incorrect!'
    //                 });
    //             }
    //         );
    //     }
    // );
});

router.post('/get-user', signupValidation, (req, res, next) => {
    if (
        !req.headers.authorization ||
        !req.headers.authorization.startsWith('Bearer') ||
        !req.headers.authorization.split(' ')[1]
    ) {
        return res.status(422).json({
            message: "Please provide the token",
        });
    }
    const theToken = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(theToken, 'the-super-strong-secrect');

    User.findOne({
        where: {
            id: decoded.id
        },
        include: {
            model: Unit,
            attributes: ['id', 'unitName']
        },
        attributes: ['id', 'name', 'email']
    }).then((userResult) => {
        return res.send({ error: false, data: userResult, message: 'Fetch Successfully.' });
    }).catch((e) => {
        console.log("Error: ", e);
    })

    // db.query('SELECT * FROM users where id=?', decoded.id, function (error, results, fields) {
    //     if (error) throw error;
    //     return res.send({ error: false, data: results[0], message: 'Fetch Successfully.' });
    // });
});

module.exports = router;