
const Model = require('../Models/knowledge.model');
const createError = require('http-errors')
const mongoose = require('mongoose')
// const ModelName = 'knowledge'
const { upload } = require('./../Helpers/helper_functions')

module.exports = {
    create: async (req, res, next) => {
        try {
            const data = req.body
            console.log(data);

            const dataExists = await Model.findOne({ title: data.title, is_inactive: false })
            if (dataExists) {
                throw createError.Conflict(`${ModelName} already exists`)
            }
            data.created_at = Date.now()
            // data.created_by = req.user._id ? req.user._id : 'unauth'
            const newData = new Model(data)
            const result = await newData.save()
            res.json(newData)
            return
        } catch (error) {
            next(error)
        }
    },
}