const Model = require('../Models/TeamDetails')
const createError = require('http-errors')
const mongoose = require('mongoose')
const ModelName = 'TeamDetails'
const { upload } = require('../Helpers/helper_functions')

module.exports = {
    create : async (req, res, next) => {
    try {
        upload(req, res, async (err) => {
            if (err) {
                return res.status(501).json({ error: err });
            }

            // Extract data from the request body
            const data = req.body;
            console.log(data);

            // Check if the entry with the same name already exists and is not inactive
            const dataExists = await TeamDetails.findOne({ name: data.name, is_inactive: false });
            if (dataExists) {
                throw createError.Conflict('Team member already exists');
            }

            // If no errors, proceed with the new data
            data.created_at = Date.now();
            data.created_by = req.user._id; // Assume the logged-in user is accessible via `req.user._id`

            // Create a new TeamDetails document
            const newData = new TeamDetails(data);

            // Save the new document to the database
            const result = await newData.save();

            // Return the newly created data as a response
            res.json(result);
        });
    } catch (error) {
        next(error); // Pass the error to the error handling middleware
    }
    }
}