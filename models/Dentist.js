const mongoose = require('mongoose');

const DentistSchema = new mongoose.Schema({
    name:{
        type : String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50,'Name can not be more than 50 characters']
    },
    expirience:{
        type : Number,
        required: [true, 'Please add a year of experience']
    },
    expertise:{
        type : [String],
        required: [true, 'Please add an expertise']
    }
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual populate
DentistSchema.virtual('bookings', {
    ref: 'Booking',
    localField: '_id',
    foreignField: 'Dentist',
    justOne: false
});



module.exports = mongoose.model('Dentist', DentistSchema);
