const Model = require('../Models/Anpr.model')
// const { createSchema,updateSchema } = require('../Validations/category_validation_schema')
const createError = require('http-errors')
const mongoose = require('mongoose')
const ModelName = 'Anpr'
const { upload, uploadImage, csvDataToObjOutput } = require('./../Helpers/helper_functions')
const fs = require('fs');

module.exports = {
    create: async (req, res, next) => {
        try {
            uploadImage(req, res, async (err) => {
                if (err) {
                    return res.status(501).json({ error: err })
                }
                req.body.userid = req.user._id
                if (req.file) {
                    req.body.input_file = req.file.path
                }
                const data = req.body
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
            const result = await Model.aggregate([
                {
                    $match: { _id: mongoose.Types.ObjectId(id) }
                },
            ])
            if (!result.length) {
                throw createError.NotFound(`No ${ModelName} Found`)
            }
            result[0].result.obj_output = csvDataToObjOutput(result[0]._id);
            let filepath  ='public/stream_data/' + result[0]._id + '.csv';
            if (fs.existsSync(filepath)) {
                result[0].result.fstat = await fs.promises.stat(filepath)
            }
            res.json(result[0])
            return
        } catch (error) {
            next(error)
        }
    },
    runAnpr: async (req, res, next) => {
        try {
            const { id } = req.query
            if (!id) {
                throw createError.BadRequest('Invalid Parameters')
            }
            const result = await Model.aggregate([
                {
                    $match: { _id: mongoose.Types.ObjectId(id) }
                },
            ])
            if (!result.length) {
                throw createError.NotFound(`No ${ModelName} Found`)
            }
            res.json(result[0])
            // Post Processing
            try {
                const child_process = require('child_process')
                let output = '';
                switch (result[0].source) {
                    case 'Video Stream':
                        console.log((`python3 Scripts/anpr/index.py video-stream ${result[0].path}`));
                        output = child_process.execSync(`python3 Scripts/anpr/index.py video-stream ${result[0].path}`);
                        break;

                    case 'Video':
                        console.log((`python3 Scripts/anpr/index.py video ${result[0].input_file}`));
                        output = child_process.execSync(`python3 Scripts/anpr/index.py video ${result[0].input_file}`);
                        break;

                    case 'Image':
                        console.log((`python3 Scripts/anpr/index.py image ${result[0].input_file}`));
                        output = child_process.execSync(`python3 Scripts/anpr/index.py image ${result[0].input_file}`);
                        break;
                }
                output = output.toString().trim();
                if (output) {
                    if (result[0].source == 'Image') {
                        await Model.updateOne({
                            _id: result[0]._id
                        }, {
                            $set: {
                                result: {
                                    success: true,
                                    number: output
                                }
                            }
                        });
                    } else if (result[0].source == 'Video') {
                        await Model.updateOne({
                            _id: result[0]._id
                        }, {
                            $set: {
                                result: {
                                    success: true,
                                    numbers: output.split('\n')
                                }
                            }
                        });
                    }
                } else {
                    await Model.updateOne({
                        _id: result[0]._id
                    }, {
                        $set: {
                            result: {
                                success: false,
                                number: ''
                            }
                        }
                    });
                }
            } catch (error) {
                console.log('python error start');
                console.log(error);
                console.log('python error end');
            }
            return
        } catch (error) {
            next(error)
        }
    },
    objectDetection: async (req, res, next) => {
        try {
            const { id } = req.query
            if (!id) {
                throw createError.BadRequest('Invalid Parameters')
            }
            const result = await Model.aggregate([
                {
                    $match: { _id: mongoose.Types.ObjectId(id) }
                },
            ])
            if (!result.length) {
                throw createError.NotFound(`No ${ModelName} Found`)
            }
            res.json(result[0])
            // Post Processing
            try {
                const child_process = require('child_process')
                let output = '';
                switch (result[0].source) {
                    case 'Video Stream':
                        // console.log((`python3 Scripts/object-detection/index.py video-stream ${result[0].path}`));
                        console.log((`python3 Scripts/object-detection/index.py camera ${result[0].path} ${result[0]._id} ${result[0]._id} ${result[0]._id}`));
                        // output = child_process.execSync(`python3 Scripts/object-detection/index.py video-stream ${result[0].path} ${result[0]._id}`);
                        child_process.exec(`python3 Scripts/object-detection/index.py camera ${result[0].path} ${result[0]._id} ${result[0]._id} ${result[0]._id}`);
                        break;

                    case 'Video':
                        console.log((`python3 Scripts/object-detection/index.py video ${result[0].input_file} ${result[0]._id}`));
                        // output = child_process.execSync(`python3 Scripts/object-detection/index.py video ${result[0].input_file} ${result[0]._id}`);
                        child_process.exec(`python3 Scripts/object-detection/index.py video ${result[0].input_file} ${result[0]._id}`);
                        break;

                    case 'Image':
                        console.log((`python3 Scripts/object-detection/index.py image ${result[0].input_file}`));
                        // output = child_process.execSync(`python3 Scripts/object-detection/index.py image ${result[0].input_file} ${result[0]._id}`);
                        child_process.exec(`python3 Scripts/object-detection/index.py image ${result[0].input_file} ${result[0]._id}`);
                        break;
                }
                output = output.toString().trim();
                if (output) {
                    output = output.split('OUTPUT_STARTS\n')[1];
                    output = output.split('\n');
                    output = output.map(o => { o = o.split("'").join('"'); return JSON.parse(o) })
                    if (result[0].source == 'Image') {
                        await Model.updateOne({
                            _id: result[0]._id
                        }, {
                            $set: {
                                "result.obj_success": true,
                                "result.obj_output": output
                            }
                        });
                    } else if (result[0].source == 'Video') {
                        await Model.updateOne({
                            _id: result[0]._id
                        }, {
                            $set: {
                                "result.obj_success": true,
                                "result.obj_output": output
                            }
                        });
                    }
                } else {
                    await Model.updateOne({
                        _id: result[0]._id
                    }, {
                        $set: {
                            "result.obj_success": false,
                            "result.obj_output": ''
                        }
                    });
                }
            } catch (error) {
                console.log(error)
            }
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
            const { userid, is_inactive, page, limit, sort } = req.query
            const _page = page ? parseInt(page) : 1
            const _limit = limit ? parseInt(limit) : 20
            const _skip = (_page - 1) * _limit
            const query = {};
            query.is_inactive = (is_inactive && is_inactive == 'true') ? true : false
            if (userid) {
                query.userid = mongoose.Types.ObjectId(userid);
            }
            const result = await Model.aggregate([
                {
                    $match: query
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
            for (const result_item of result) {
                if (result_item && result_item.result) {
                    result_item.result.obj_output = csvDataToObjOutput(result_item._id.toString());
                }
            }
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
            const { is_inactive } = req.query
            const query = {};
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
            if (!mongoose.isValidObjectId(id)) {
                throw createError.BadRequest('Invalid ID')
            }
            uploadImage(req, res, async (err) => {
                if (err) {
                    return res.status(501).json({ error: err })
                }
                if (req.file) {
                    req.body.input_file = req.file.path
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
