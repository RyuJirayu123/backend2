const Dentist = require('../models/Dentist.js');
const Booking = require('../models/Booking.js');

// @desc    Get all dentists
// @route   GET /api/v1/dentists
// @access  Public
// @desc    Get all dentists
// @route   GET /api/v1/dentists
// @access  Public
exports.getDentists = async (req, res, next) => {
    try {
      let query;
  
      const reqQuery = { ...req.query };
      const removeFields = ['select', 'sort', 'page', 'limit'];
      removeFields.forEach(param => delete reqQuery[param]);
  
      let queryStr = JSON.stringify(reqQuery);
      queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  
      // Finding resource with populated bookings
      query = Dentist.find(JSON.parse(queryStr)).populate({
        path: 'bookings',
        select: 'date patientName dentist',
        options: { strictPopulate: false }  // ป้องกัน ObjectId หาย
      });
  
      // Select Fields
      if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
      }
  
      // Sort
      if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
      } else {
        query = query.sort('-createdAt');
      }
  
      // Pagination
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 25;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const total = await Dentist.countDocuments();
  
      query = query.skip(startIndex).limit(limit);
  
      // Execute query and log results
      const dentists = await query;
      console.log(`Total dentists found: ${dentists.length}`);
      console.log(JSON.stringify(dentists, null, 2));
  
      const pagination = {};
      if (endIndex < total) {
        pagination.next = { page: page + 1, limit };
      }
      if (startIndex > 0) {
        pagination.prev = { page: page - 1, limit };
      }
  
      res.status(200).json({
        success: true,
        count: dentists.length,
        pagination,
        data: dentists
      });
    } catch (err) {
      console.error(err);
      res.status(400).json({ success: false, error: err.message });
    }
  };
  


// @desc    Get single dentist
// @route   GET /api/v1/dentists/:id
// @access  Public
exports.getDentist = async (req, res, next) => {
    try {
        const dentist = await Dentist.findById(req.params.id);

        if (!dentist) {
            return res.status(400).json({ success: false, message: "Dentist not found" });
        }

        res.status(200).json({
            success: true,
            data: dentist
        });
    } catch (err) {
        res.status(400).json({successs:false});
    }
};

// @desc    Create new dentist
// @route   POST /api/v1/dentists
// @access  Private
exports.createDentist = async (req, res, next) => {
   
        const dentist = await Dentist.create(req.body);
        res.status(201).json({
            success: true,
            data: dentist
        });
};

// @desc    Update dentist
// @route   PUT /api/v1/dentists/:id
// @access  Private
exports.updateDentist = async (req, res, next) => {
    try {
        const dentist = await Dentist.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!dentist) {
            return res.status(400).json({ success: false, message: "Dentist not found" });
        }

        res.status(200).json({
            success: true,
            data: dentist
        });
    } catch (err) {
        res.status(400).json({success:false});
    }
};

// @desc    Delete dentist
// @route   DELETE /api/v1/dentists/:id
// @access  Private
exports.deleteDentist = async (req, res, next) => {
    try {
        const dentist = await Dentist.findById(req.params.id);

        if (!dentist) {
            return res.status(400).json({ success: false, message: `Dentist with id of ${req.params.id} not found` });
        }

        await Booking.deleteMany({ dentist: req.params.id });
        await Dentist.deleteOne({ _id: req.params.id });

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(400).json({success:false});
    }
};
