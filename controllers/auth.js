const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = (req, res) => {
    console.log(req.body);

    // const name              = req.body.name;
    // const email             = req.body.email;
    // const password          = req.body.password;
    // const passwordConfirm   = req.body.passwordConfirm;

    const {name, email, password, passwordConfirm}  = req.body;

    let emailQuery = "SELECT email FROM `users` WHERE email = '" + email + "'";

    db.query(emailQuery, async (error, results) => {
        if (error) {
            // return res.status(500).send(err);
            console.log(error);
        }
        if (results.length > 0) {
            return res.render('register', {
                message: 'Email is already in use'
            });
        } else if (password !== passwordConfirm) {
            return res.render('register', {
                message: 'Passwords do not match'
            });
        }

        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

        let query = 'INSERT INTO users SET ?'
        let data = {name: name, email:email, password: hashedPassword};
        db.query(query, data, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                console.log(results);
                return res.render('register', {
                    message: 'User registered successfully'
                });
            }
        });
    });
}

exports.login = async (req, res) => {
    try {
        const {email, password} = req.body;
        
        if (!email || !password) {
            return res.status(400).render('login', {
                message: 'Please provide valid credentials'
            });
        }

        db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
            console.log(results);
            if (!results || !(await bcrypt.compare(password, results[0].password))) {
                res.status(401).render('login', {
                    message: 'Email or Password is incorrect'
                });
            } else {
                const id = results[0].id;
                const token = jwt.sign({id}, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                });

                console.log("The token is: " + token);

                const cookieOptions = {
                    expires:new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true
                }

                res.cookie('jwt', token, cookieOptions);
                res.status(200).redirect("/");
            }
        })
    } catch (error) {
        console.log(error);
    }
}