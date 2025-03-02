
// @desc      Get all bookings
// @route     GET /api/v1/bookings
// @access    Public
exports.getBookings = async (req, res, next) => {
    let query;
    // General users can see only their bookings!
    if (req.user.role !== 'admin') {
        query = Booking.find({ user: req.user.id }).populate({
            path:'dentist',
            select: 'name province tel'
        });
    } else { // If you are an admin, you can see all!
        if(req.params.dentistId){
            console.log(req.params.dentistId);
            query = Booking.find({dentist: req.params.dentistId}).populate({
                path: "dentist",
                select: "name province tel"
            });
        } else {
        query = Booking.find().populate({
            path:'dentist',
            select: 'name province tel'
        });
        }
    }
    
    try {
        const bookings = await query;
        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({
            success: false,
            message: "Cannot find Booking"
        });
    }
};

// @desc       Get single booking
// @route      GET /api/v1/bookings/:id
// @access     Public
exports.getBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id).populate({
            path: 'dentist',
            select: 'name description tel'
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: `No booking with the id of ${req.params.id}`
            });
        }

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot find Booking"
        });
    }
};

const Booking = require('../models/Booking');
const Dentist = require('../models/Dentist');

// @desc       Add booking
// @route      POST /api/v1/dentists/:dentistId/booking
// @access     Private
exports.addBooking = async (req, res, next) => {
    try {
        req.body.dentist = req.params.dentistId;

        const dentist = await Dentist.findById(req.params.dentistId);

        if (!dentist) {
            return res.status(404).json({
                success: false,
                message: `No dentist with the id of ${req.params.dentistId}`
            });
        }

        //add user Id to req.body
        req.body.user=req.user.id;

        //Check for exited booking
        const exitedBookings= await Booking.find({user:req.user.id});

        //If the user is not an admin, they can only create up to 3 Booking
        if(exitedBookings.length >= 3 && req.user.role !== 'admin'){
            return res.status(400).json({success:false,
                message:`the user with ID ${req.user.id} has already made 3 bookings`
            });
        }
        const booking = await Booking.create(req.body);

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot create Booking"
        });
    }
};

// @desc       Update booking
// @route      PUT /api/v1/bookings/:id
// @access     Private
exports.updateBooking = async (req, res, next) => {
    try {
        let booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: `No booking with the id of ${req.params.id}`
            });
        }

        //Make sure user is the book owner
        if(booking.user.toString()!== req.user.id && req.user.role !== 'admin'){
            return res.status(400).json({success:false,
                message:`user ${req.user.id} is not authorized to update this booking`
            });
        }

        booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot update Booking"
        });
    }
};

// @desc       Delete booking
// @route      DELETE /api/v1/bookings/:id
// @access     Private
exports.deleteBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: `No booking with the id of ${req.params.id}`
            });
        }

        //Make sure user is the book owner
        if(booking.user.toString()!== req.user.id && req.user.role !== 'admin'){
            return res.status(400).json({success:false,
                message:`user ${req.user.id} is not authorized to delete this booking`
            });
        }

        await booking.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot delete Booking"
        });
    }
};
