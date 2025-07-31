const Model = require('../Models/Category.model')
// const { createSchema,updateSchema } = require('../Validations/category_validation_schema')
const createError = require('http-errors')
const mongoose = require('mongoose')
const ModelName = 'Category'
const { upload, uploadImage } = require('./../Helpers/helper_functions')

module.exports = {
    create: async (req, res, next) => {
        try {
            uploadImage(req, res, async (err) => {
                if (err) {
                    return res.status(501).json({ error: err })
                }
                // const data = await createSchema.validateAsync(req.body)
                if (!req.body.topCategory) {
                    delete req.body.topCategory;
                } else {
                    req.body.userid = req.user._id
                }
                if (req.file) {
                    req.body.image = req.file.path
                }
                const data = req.body
                // const data = await createSchema.validateAsync(req.body)
                // const data = req.body
                // const dataExists = await Model.findOne({name: data.name, is_inactive: false})
                // if (dataExists) {
                //     throw createError.Conflict(`${ModelName} already exists`)
                // }
                data.created_at = Date.now()
                data.created_by = req.user._id
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
            // const result = await Model.findOne({_id: mongoose.Types.ObjectId(id)})
            const result = await Model.aggregate([
                {
                    $match: { _id: mongoose.Types.ObjectId(id) }
                },
                {
                    $graphLookup:
                    {
                        "from": "categories",
                        "startWith": "$topCategory",
                        "connectFromField": "topCategory",
                        "connectToField": "_id",
                        "as": "ancestors"
                    }
                },
                {
                    $lookup: {
                        from: 'categories',
                        as: 'category',
                        localField: 'topCategory',
                        foreignField: '_id'
                    },
                },
                {
                    $unwind: {
                        path: "$category",
                        preserveNullAndEmptyArrays: true
                    }
                },
            ])
            if (!result.length) {
                throw createError.NotFound(`No ${ModelName} Found`)
            }
            res.json(result[0])
            return
        } catch (error) {
            next(error)
        }
    },
    graph: async (req, res, next) => {
        try {
            const result = await Model.aggregate([
                {
                    $match: { is_inactive: false }
                },
                {
                    $graphLookup:
                    {
                        "from": "categories",
                        "startWith": "$topCategory",
                        "connectFromField": "topCategory",
                        "connectToField": "_id",
                        "as": "ancestors"
                    }
                },
                // {
                //     $lookup: {
                //         from: 'categories',
                //         as: 'category',
                //         localField: 'topCategory',
                //         foreignField: '_id'
                //     },
                // },
                // {
                //     $unwind: {
                //         path: "$category",
                //         preserveNullAndEmptyArrays: true
                //     }
                // },
            ])
            if (!result.length) {
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
            const { name, topCategory, userid, disabled, is_inactive, page, limit, sort } = req.query
            const _page = page ? parseInt(page) : 1
            const _limit = limit ? parseInt(limit) : 20
            const _skip = (_page - 1) * _limit
            const _sort = sort ? sort : '+name'
            const query = {};
            if (name) {
                query.name = new RegExp(name, 'i')
            }
            // query.disabled = (disabled && disabled == 'true') ? true : false
            query.is_inactive = (is_inactive && is_inactive == 'true') ? true : false
            if (topCategory) {
                if (topCategory !== 'child') {
                    if (topCategory !== 'all') {
                        query.topCategory = mongoose.Types.ObjectId(topCategory)
                        if (req.user.role != 'super-admin' && req.user.role != 'admin' ) {
                            query.userid = mongoose.Types.ObjectId(req.user._id);
                        }
                    }
                } else {
                    query.topCategory = {
                        $exists: true
                    }
                }
            }
            else {
                query.topCategory = {
                    $exists: false
                }
            }
            if (userid) {
                query.userid = mongoose.Types.ObjectId(userid);
            }
            const result = await Model.aggregate([
                {
                    $match: query
                },
                {
                    $graphLookup:
                    {
                        "from": "categories",
                        "startWith": "$topCategory",
                        "connectFromField": "topCategory",
                        "connectToField": "_id",
                        "as": "ancestors"
                    }
                },
                {
                    $lookup: {
                        from: 'categories',
                        as: 'category',
                        localField: 'topCategory',
                        foreignField: '_id'
                    },
                },
                {
                    $unwind: {
                        path: "$category",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        as: 'user',
                        localField: 'userid',
                        foreignField: '_id'
                    },
                },
                {
                    $unwind: {
                        path: "$user",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'categories',
                        as: 'sub_categories',
                        localField: '_id',
                        foreignField: 'topCategory'
                    },
                },
                {
                    $addFields: {
                        sub_categories: { $size: '$sub_categories' }
                    }
                },
                // {
                //     $unwind: {
                //         path: "$sub_category",
                //         preserveNullAndEmptyArrays: true
                //     }
                // },
                {
                    $sort: { _id: -1 }
                },
                {
                    $skip: _skip
                },
                {
                    $limit: _limit
                }
            ])
            const resultCount = await Model.countDocuments(query)
            // .sort(_sort).skip(_skip).limit(_limit)
            res.json({
                data: result,
                meta: {
                    current_page: _page,
                    from: _skip + 1,
                    last_page: Math.ceil(resultCount / _limit, 10),
                    per_page: _limit,
                    to: _skip + _limit,
                    total: resultCount
                }
            })
            return
        } catch (error) {
            next(error)
        }
    },
    count: async (req, res, next) => {
        try {
            const { name, topCategory, disabled, is_inactive } = req.query
            const query = {};
            if (name) {
                query.name = new RegExp(name, 'i')
            }
            if (topCategory) {
                query.topCategory = mongoose.Types.ObjectId(topCategory)
            }
            // query.disabled = (disabled && disabled == 'true') ? true : false
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
            const { id } = req.params
            // const data = await updateSchema.validateAsync(req.body)
            if (!mongoose.isValidObjectId(id)) {
                throw createError.BadRequest('Invalid ID')
            }
            uploadImage(req, res, async (err) => {
                if (err) {
                    return res.status(501).json({ error: err })
                }
                // const data = await createSchema.validateAsync(req.body)
                if (!req.body.topCategory) {
                    delete req.body.topCategory;
                } else {
                    req.body.userid = req.user._id
                }
                if (req.body.commission) {
                    if (typeof (req.body.commission) == 'string') {
                        req.body.commission = JSON.parse(req.body.commission);
                    }
                }
                if (req.body.base_properties) {
                    if (typeof (req.body.base_properties) == 'string') {
                        req.body.base_properties = JSON.parse(req.body.base_properties);
                    }
                }
                if (req.body.attributes) {
                    if (typeof (req.body.attributes) == 'string') {
                        req.body.attributes = JSON.parse(req.body.attributes);
                    }
                }
                if (req.file) {
                    req.body.image = req.file.path
                }
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