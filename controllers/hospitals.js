const Hospital = require('../models/Hospital');
const Appointment = require('../models/Appointment.js');

// @desc    Get all hospitals
// @route   GET /api/v1/hospitals
// @access  Public
// @desc    Get all hospitals
// @route   GET /api/v1/hospitals
// @access  Public
exports.getHospitals = async (req, res, next) => {
    try {
      let query;
  
      const reqQuery = { ...req.query };
      const removeFields = ['select', 'sort', 'page', 'limit'];
      removeFields.forEach(param => delete reqQuery[param]);
  
      let queryStr = JSON.stringify(reqQuery);
      queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  
      // Finding resource with populated appointments
      query = Hospital.find(JSON.parse(queryStr)).populate({
        path: 'appointments',
        select: 'date patientName hospital',
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
      const total = await Hospital.countDocuments();
  
      query = query.skip(startIndex).limit(limit);
  
      // Execute query and log results
      const hospitals = await query;
      console.log(`Total hospitals found: ${hospitals.length}`);
      console.log(JSON.stringify(hospitals, null, 2));
  
      const pagination = {};
      if (endIndex < total) {
        pagination.next = { page: page + 1, limit };
      }
      if (startIndex > 0) {
        pagination.prev = { page: page - 1, limit };
      }
  
      res.status(200).json({
        success: true,
        count: hospitals.length,
        pagination,
        data: hospitals
      });
    } catch (err) {
      console.error(err);
      res.status(400).json({ success: false, error: err.message });
    }
  };
  


// @desc    Get single hospital
// @route   GET /api/v1/hospitals/:id
// @access  Public
exports.getHospital = async (req, res, next) => {
    try {
        const hospital = await Hospital.findById(req.params.id);

        if (!hospital) {
            return res.status(400).json({ success: false, message: "Hospital not found" });
        }

        res.status(200).json({
            success: true,
            data: hospital
        });
    } catch (err) {
        res.status(400).json({successs:false});
    }
};

// @desc    Create new hospital
// @route   POST /api/v1/hospitals
// @access  Private
exports.createHospital = async (req, res, next) => {
   
        const hospital = await Hospital.create(req.body);
        res.status(201).json({
            success: true,
            data: hospital
        });
};

// @desc    Update hospital
// @route   PUT /api/v1/hospitals/:id
// @access  Private
exports.updateHospital = async (req, res, next) => {
    try {
        const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!hospital) {
            return res.status(400).json({ success: false, message: "Hospital not found" });
        }

        res.status(200).json({
            success: true,
            data: hospital
        });
    } catch (err) {
        res.status(400).json({success:false});
    }
};

// @desc    Delete hospital
// @route   DELETE /api/v1/hospitals/:id
// @access  Private
exports.deleteHospital = async (req, res, next) => {
    try {
        const hospital = await Hospital.findById(req.params.id);

        if (!hospital) {
            return res.status(400).json({ success: false, message: `Hospital with id of ${req.params.id} not found` });
        }

        await Appointment.deleteMany({ hospital: req.params.id });
        await Hospital.deleteOne({ _id: req.params.id });

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(400).json({success:false});
    }
};
