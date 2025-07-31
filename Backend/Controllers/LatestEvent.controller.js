const Model = require('../Models/LatestEvent.model')
const createError = require('http-errors')
const mongoose = require('mongoose')
const LatestEvent = require('../Models/LatestEvent.model')

const { upload } = require('./../Helpers/helper_functions')

module.exports = {
    create: async (req, res, next) => {
        try {
            // upload(req, res, async (err) => {
            //     if (err) {
            //         return res.status(501).json({ error: err })
            //     }

            const data = req.body
            console.log(data);

            // const dataExists = await Model.findOne({ title: data.title, is_inactive: false })
            // if (dataExists) {
            //     throw createError.Conflict(`${ModelName} already exists`)
            // }
            data.created_at = Date.now()
            const newData = new Model(data)
            const result = await newData.save()
            res.json(newData)
            return
            // })
        } catch (error) {
            next(error)
        }
    },



    get: async (req, res, next) => {
        try {
            const events = await LatestEvent.find().sort({ _id: -1 }).limit(5);
            console.log(events);


            if (events && events.length > 0) {
                console.log(">>>>>>>>>>>>>>>>>>>>>>>>", events);
                res.json(events);
            } else {
                res.json({ event: "No events found" });
            }
        } catch (error) {
            next(error);
        }
    },
}