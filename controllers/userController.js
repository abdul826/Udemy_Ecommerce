const User = require("../models/UserModel");
const {hashPassword} = require('../utils/hashPassword');

const getUsers = async(req,res,next)=>{
    try {
        const users = await User.find({}).select("-password");     // WTH of '-' sign we remove the field. Here password is remove at the time of fetch data
        return res.json(users);
    } catch (error) {
        next(error);
}

}

const registerUser = async(req,res,next)=>{
    try {
        const {name,lastName,email,password} = req.body;  // take the value from user side

        // Check value is assign or blank
        if(!(name && lastName && email && password)){
            return res.status(400).send("All inputs are require");
        }

        // Check User Exists
        const userExists = await User.findOne({email});
        if(userExists){
            return res.status(400).send({error: "User already exist"})
        }else{
            const hashedPassword = hashPassword(password);
            // New User
            const user = await User.create({
                name,
                lastName,
                email : email.toLowerCase(), 
                password:hashedPassword
            });

            res.status(201).send(user);
        }

    } catch (error) {
        next(error);
    }
}

module.exports = {getUsers,registerUser}
