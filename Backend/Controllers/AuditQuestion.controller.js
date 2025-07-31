const Model = require('../Models/AuditQuestion.model')
const createError = require('http-errors')
const mongoose = require('mongoose')
const ModelName = 'Page'
const { upload } = require('../Helpers/helper_functions')
const path = require("path");
const XLSX = require("xlsx");
const csv = require('csv-parser');
var fs = require("fs")
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
                res.json(newData)
                return
            })
        } catch (error) {
            next(error)
        }
    },
    uploadBulkQuestion: async (req, res, next) => {
        try {


            const body = req.body;

            console.log("uploadBulkQuestion>>>>", body);
            const filePath = body.quesFile;

            const results = [];
            
            // Function to clean and standardize keys
            const cleanKey = (key) => key.replace(/['"]+/g, '').trim();
            
            console.log('Reading Excel file')
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => {
                    // Clean and standardize keys to avoid issues with case sensitivity
                    const cleanedData = {};
                    for (const [key, value] of Object.entries(data)) {
                        cleanedData[cleanKey(key.toLowerCase())] = value;
                    }

                    // Map the data fields with fallback options
                    cleanedData.question = cleanedData.question || cleanedData['question'];
                    cleanedData.risk = cleanedData.risk || cleanedData['risk'];
                    cleanedData.suggestion = cleanedData.suggestion || cleanedData['suggestion'];
                    cleanedData.is_inactive = false;
                    cleanedData.question_category = body.question_category;
                    cleanedData.questionType = body.questionType;

                    // Push the cleaned and processed data to the results array
                    results.push(cleanedData);
                })
                .on('end', () => {
                    // console.log("Reading", results);
                    // Further processing of the results array (e.g., saving to database) can be done here
                    results.forEach(async elem => {
                        // console.log("question:>>>",
                        //     elem
                        // );
                        
                        const newData = new Model(elem)
                        const result = await newData.save()
                        console.log("A question saved successfully!!");
                        
                    })
                });
            // Read the Excel file

            // const workbook = XLSX.readFile(filePath);

            // // Extract the first worksheet from the workbook
            // const worksheet = workbook.Sheets[workbook.Sheets[0]];

            // // Convert the worksheet data to JSON format
            // const jsonData = XLSX.utils.sheet_to_json(worksheet).map(o => {
            //     o.is_inactive = false;
            //     o.question_category = body.question_category;
            //     o.questionType = body.questionType;
            //     return o
            // });

            // console.log("Questions>>>>>>>", jsonData);
           

            res.status(200).json({ message: "Questions imported successfully." });

            // Model.insertMany(results).then(() => {
            //     res.status(200).json({ message: "Questions imported successfully." });
            // });
        } catch (error) {
            next(error);
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
            const { title, disabled, is_inactive, page, limit, sort, question_category } = req.query
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
                    $unwind: {
                        path: "$category",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        // Include other fields you want from the original collection
                        _id: 1,
                        question: 1,
                        priority: 1,
                        question_category: 1,
                        priority: 1,
                        questionType:1,
                        // Example field from the original collection
                        // Include only the title from the category
                        category: {
                            title: 1
                        }
                    }
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