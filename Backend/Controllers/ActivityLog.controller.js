const Model = require('../Models/ActivityLog.model')
const createError = require('http-errors')
const mongoose = require('mongoose')
const ModelName = 'activityLog'
const { upload } = require('./../Helpers/helper_functions')

module.exports = {
    create: async (req, res, next) => {
        try {
            upload(req, res, async (err) => {
                if (err) {
                    return res.status(501).json({ error: err })
                }
                const data = req.body
                console.log(data);
                log_time = Date.now();
                const dataExists = await Model.findOne({log_time: log_time},{is_inactive: false })
                if (dataExists) {
                    throw createError.Conflict(`${ModelName} already exists`)
                }
                
                // data.created_by = req.user._id
                const newData = new Model(data)
                const result = await newData.save()
                res.json(newData)
                return
            })
        } catch (error) {
            next(error)
        }
    },
}