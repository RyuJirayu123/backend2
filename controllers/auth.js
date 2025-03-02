const User = require('../models/User');

//@desc   Register user
//@route  POST /api/v1/auth/register
//@access Public
exports.register = async (req,res,next)=>{
    try{
        const {name,tel,email,password,role}=req.body;
        
        const user=await User.create({
            name,
            tel,
            email,
            role,
            password
            
        });

        //create token
        // const token=user.getSignedJwtToken();
        // res.status(200).json({success:true,token});
        sendTokenResponse(user,200,res);
    } catch(err){
        if (err.code === 11000) {
            console.log(err.stack);
            return res.status(400).json({ 
                success: false, 
                message: "Email นี้ถูกใช้แล้ว" 
            });
            
        }
        console.log(err.stack);
        res.status(500).json({ 
            
            success: false, 
            message: "Server Error" 
        });
    }

}


//@desc     Login user
//@route    POST /api/v1/auth/login
//@access   Public
exports.login= async (req,res,next)=>{
   try{
    const {email , password}=req.body;

    //Validate email $ password
    if(!email || ! password){
        return res.status(400).json({success:false,
            mag:'Please email and password'});
    }

    //check for user
    const user = await User.findOne({email}).select('+password');

    if(!user){
        return res.status(400).json({success:false,
            msg:"Invalid credentials"
        });
    }

    //Check if password matches
    const isMatch = await user.matchPassword(password);

    if(!isMatch){
        return res.status(401).json({success:false,
            msg:'Invalid credentials'
        });
    }

    //create token
    // const token=user.getSignedJwtToken();
    // res.status(200).json({success:true,token});
    console.log(5555);
    sendTokenResponse(user,200,res);
}
catch(err){
return res.status(401).json({success:false,mag:'Cannot convert email or password to string'})
}
}

const sendTokenResponse=(user,statusCode,res)=>{
    //Create token
    const token=user.getSignedJwtToken();
    
    const options = {
        expires:new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE*24*60*60*1000),
        httpOnly: true
    };
   
    if(process.env.NODE_ENV==='production'){
        options.secure=true;
    }
    res.status(statusCode).cookie('token',token,options).json({
        success:true,
        token
    })
}


// At the end of file
// @desc      Get current Logged in user
// @route     POST /api/v1/auth/me
// @access    Private
exports.getMe = async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    });
};
exports.logout=async(req,res,next)=>{
    res.cookie('token','none',{
    expires: new Date(Date.now()+ 10*1000),
    httpOnly:true
    });
    res.status(200).json({
    success:true,
    data:{}
    });
};
