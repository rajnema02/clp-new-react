const Model = require('../Models/Department.model')
const createError = require('http-errors')
const mongoose = require('mongoose')
const ModelName = 'Department'
const { upload } = require('../Helpers/helper_functions')

module.exports = {
    create: async (req, res, next) => {
        try {
            upload(req, res, async (err) => {
                if (err) {
                    return res.status(501).json({ error: err })
                }
                const data = req.body
                console.log(data);
                
                const dataExists = await Model.findOne({ name: data.name, is_inactive: false })
                if (dataExists) {
                    throw createError.Conflict(`${ModelName} already exists`)
                }
                data.created_at = Date.now()
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
   
    get: async (req, res, next) => {
        try {
            const { id } = req.params
            if (!id) {
                throw createError.BadRequest('Invalid Parameters')
            }
            const result = await Model.findOne({ _id: mongoose.Types.ObjectId(id) })
            if (!result) {
                throw createError.NotFound(`No ${ModelName} Found`)
            }
            res.json(result)
            return
        } catch (error) {
            next(error)
        }
    },
    getByTitle: async (req, res, next) => {
        try {
            console.log(req.params);
            const { title } = req.params
            console.log(title);
            if (!title) {
                throw createError.BadRequest('Invalid Parameters')
            }
            const result = await Model.findOne({ title: title, is_inactive: false })
            if (!result) {
                throw createError.NotFound(`No ${ModelName} Found`)
            }
            res.json(result)
            return
        } catch (error) {
            next(error)
        }
    },
    getBySlug: async (req, res, next) => {
        try {
            console.log(req.params);
            const { slug } = req.params
            if (!slug) {
                throw createError.BadRequest('Invalid Parameters')
            }
            const result = await Model.findOne({ slug, is_inactive: false })
            if (!result) {
                throw createError.NotFound(`No ${ModelName} Found`)
            }
            res.json(result)
            return
        } catch (error) {
            next(error)
        }
    },
    list: async (req, res, next) => {
        try {
            const { course_type, course_name, is_inactive} = req.query
            // const _page = page ? parseInt(page) : 1, , disabled, is_inactive, page, limit, sort 
            // const _limit = limit ? parseInt(limit) : 20
            // const _skip = (_page - 1) * _limit
            // const _sort = sort ? sort : '+title'
            const query = {};
            if (course_type) {
                query.course_type = new RegExp(course_type, 'i')
            }
            if (course_name) {
                query.course_name = new RegExp(course_name, 'i')
            }
            // query.disabled = (disabled && disabled == 'true') ? true : false
            query.is_inactive = (is_inactive && is_inactive == 'true') ? true : false
            const result = await Model.aggregate([
                {
                    $match: query
                },
                // {
                //     $skip: _skip
                // },
                // {
                //     $limit: _limit
                // }
            ])
            const resultCount = await Model.countDocuments(query)
            // .sort(_sort).skip(_skip).limit(_limit)
            res.json({
                data: result,
                // meta: {
                //     current_page: _page,
                //     from: _skip + 1,
                //     last_page: Math.ceil(resultCount / _limit, 10),
                //     per_page: _limit,
                //     to: _skip + _limit,
                //     total: resultCount
                // }
            })
            return
        } catch (error) {
            next(error)
        }
    },
    count: async (req, res, next) => {
        try {
            const { title, disabled, is_inactive, page, limit, sort } = req.query
            const _page = page ? parseInt(page) : 1
            const _limit = limit ? parseInt(limit) : 20
            const _skip = (_page - 1) * _limit
            const _sort = sort ? sort : '+title'
            const query = {};
            if (title) {
                query.title = new RegExp(title, 'i')
            }
            query.disabled = (disabled && disabled == 'true') ? true : false
            query.is_inactive = (is_inactive && is_inactive == 'true') ? true : false
            const result = await Model.countDocuments(query)
            res.json(result)
            return
        } catch (error) {
            next(error)
        }
    },
    update: async (req, res, next) => {
        try {
            upload(req, res, async (err) => {
                if (err) {
                    return res.status(501).json({ error: err })
                }
                const { id } = req.params
                const data = req.body
                if (!id) {
                    throw createError.BadRequest('Invalid Parameters')
                }
                if (!data) {
                    throw createError.BadRequest('Invalid Parameters')
                }
                data.updated_at = Date.now()
                const result = await Model.updateOne({ _id: mongoose.Types.ObjectId(id) }, { $set: data })
                res.json(result)
                return
            })
        } catch (error) {
            next(error)
        }
    },
    updateByTitle: async (req, res, next) => {
        try {
            const { title } = req.params
            const data = req.body
            if (!title) {
                throw createError.BadRequest('Invalid Parameters')
            }
            if (!title) {
                throw createError.BadRequest('Invalid Parameters')
            }
            data.updated_at = Date.now()
            const result = await Model.updateOne({ title: title, is_inactive: false }, { $set: data })
            res.json(result)
            return
        } catch (error) {
            next(error)
        }
    },
    delete: async (req, res, next) => {
        try {
            const { id } = req.params
            if (!id) {
                throw createError.BadRequest('Invalid Parameters')
            }
            const deleted_at = Date.now()
            const result = await Model.updateOne({ _id: mongoose.Types.ObjectId(id) }, { $set: { is_inactive: true, deleted_at } })
            res.json(result)
            return
        } catch (error) {
            next(error)
        }
    },
    restore: async (req, res, next) => {
        try {
            const { id } = req.params
            if (!id) {
                throw createError.BadRequest('Invalid Parameters')
            }
            const dataToBeDeleted = await Model.findOne({ _id: mongoose.Types.ObjectId(id) }, { name: 1 })
            if (!dataToBeDeleted) {
                throw createError.NotFound(`${ModelName} Not Found`)
            }
            const dataExists = await Model.findOne({ name: dataToBeDeleted.name, is_inactive: false })
            if (dataExists) {
                throw createError.Conflict(`${ModelName} already exists`)
            }
            const restored_at = Date.now()
            const result = await Model.updateOne({ _id: mongoose.Types.ObjectId(id) }, { $set: { is_inactive: false, restored_at } })
            res.json(result)
            return
        } catch (error) {
            next(error)
        }
    }
}