const User = require('../models/users')

const authAdmin = async (req, res, next) =>{
    try {
        // Get user information by id
        const user = await User.findOne({
            _id: req.user.sub
        })
        console.log("user in authAdmin: ", user)
        if(user.role === 0)
            return res.status(400).json({msg: "Admin resources access denied"})

        next()
        
    } catch (err) {
        return res.status(500).json({ms: err.message})
    }
}

module.exports = authAdmin