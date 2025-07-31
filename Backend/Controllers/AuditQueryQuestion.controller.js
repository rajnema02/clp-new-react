const Model = require('../Models/AuditQueryQuestion.model')
const UserModel = require('../Models/User.model')
const createError = require('http-errors')
const mongoose = require('mongoose')
const ModelName = 'Page'
const { upload } = require('../Helpers/helper_functions')
const sms = require('../Helpers/smsCalls')

module.exports = {
    create: async (req, res, next) => {
        try {
            upload(req, res, async (err) => {
                if (err) {
                    return res.status(501).json({ error: err })
                }
                const data = req.body
                console.log(data);
                // const dataExists = await Model.findOne({ question: data.question, is_inactive: false })
                // if (dataExists) {
                //     throw createError.Conflict(`${ModelName} already exists`)
                // }
                data.created_at = Date.now()
                data.created_by = req.user._id
                const newData = new Model(data)
                const result = await newData.save()

                try {
                    const smsQuerySubmittedRes = sms.querySubmitted(req.user.mobile)
                    const smsQueryReceivedRes = sms.queryReceived(req.user.full_name)
                    console.log("querySubmitted SMS INITIATED+++++++++++");

                } catch (error) {

                }
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
            let query = {}
            query._id = mongoose.Types.ObjectId(id)
            console.log(" req.params", req.params);
            const result = await Model.aggregate([
                // { _id: mongoose.Types.ObjectId(id) },
                {
                    $match: query
                },
                {
                    $lookup: {
                        from: 'auditquescategories',
                        as: 'category',
                        localField: 'question_category',
                        foreignField: '_id'
                    },
                },
                {
                    $unwind: {
                        path: "$category",
                        preserveNullAndEmptyArrays: true
                    },

                },
                {
                    $lookup: {
                        from: 'auditquestions',
                        as: 'ques',
                        localField: 'question_id',
                        foreignField: '_id'
                    },
                },
                {
                    $unwind: {
                        path: "$ques",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        // Include other fields you want from the original collection
                        _id: 1,
                        question: 1,
                        question_category: 1,
                        applicant_query: 1,
                        reply: 1,
                        reply_docs: 1,
                        // Example field from the original collection
                        // Include only the title from the category
                        category: {
                            title: 1
                        },
                        ques: {
                            question: 1
                        }
                    }
                }])

            if (!result) {
                throw createError.NotFound(`No ${ModelName} Found`)
            }
            res.json({ result: result.reverse().pop() })
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
            const { title, disabled, is_inactive, page, limit, sort, question_category, created_by } = req.query
            const _page = page ? parseInt(page) : 1
            const _limit = limit ? parseInt(limit) : 20
            const _skip = (_page - 1) * _limit
            const _sort = sort ? sort : '+title'
            const query = {};
            if (title) {
                query.title = new RegExp(title, 'i')
            }
            if (question_category) {
                query.question_category = mongoose.Types.ObjectId(question_category)
            }
            if (created_by) {
                query.created_by = mongoose.Types.ObjectId(created_by)
            }
            query.disabled = (disabled && disabled == 'true') ? true : false
            query.is_inactive = (is_inactive && is_inactive == 'true') ? true : false
            const result = await Model.aggregate([
                {
                    $match: query
                },
                {
                    $lookup: {
                        from: 'auditquescategories',
                        as: 'category',
                        localField: 'question_category',
                        foreignField: '_id'
                    },
                },
                {
                    $lookup: {
                        from: 'auditquestions',
                        as: 'question',
                        localField: 'question_id',
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
                    $unwind: {
                        path: "$question",
                        preserveNullAndEmptyArrays: true
                    }
                },
                // {
                //     $project: {
                //         // Include other fields you want from the original collection
                //         _id: 1,
                //         question: 1,
                //         priority: 1,
                //         question_category: 1,
                //         priority: 1,
                //         // Example field from the original collection
                //         // Include only the title from the category
                //         category: {
                //             title: 1
                //         }
                //     }
                // },
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

                if(result){
                try {
                    const quesDetail = await Model.findOne({ _id: mongoose.Types.ObjectId(id) })
                    const userDetail = await UserModel.findOne({ _id: mongoose.Types.ObjectId(quesDetail.created_by) })
                    const smsQueryResolvedRes = sms.queryResolved(userDetail.mobile)
                    console.log("querySubmitted SMS INITIATED+++++++++++");

                } catch (error) {
                    console.log(error);

                }
                }
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