const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId
const logger = require('../../services/logger.service')

module.exports = {
    query,
    getById,
    remove,
    update,
    add
}

async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection('board')
        var boards = await collection.find(criteria).toArray()
        console.log('backend-service ***************************',boards)
        boards = boards.map(board => {
            // board.createdAt = ObjectId(board._id).getTimestamp()
            // Returning fake fresh data
            // board.createdAt = Date.now() - (1000 * 60 * 60 * 24 * 3) // 3 days ago
            return board
        })
        // if (filterBy.sortBy === 'name') {
        //     boards.sort((boardA, boardB) => {
        //         if (boardA.name.toLowerCase() < boardB.name.toLowerCase()) return -1
        //         if (boardA.name.toLowerCase() > boardB.name.toLowerCase()) return 1 
        //         return 0;
        //     })
        // } else if (filterBy.sortBy === 'price') {
        //     boards.sort((boardA, boardB) => boardA.price - boardB.price)
        // }
        return boards
    } catch (err) {
        logger.error('cannot find boards', err)
        throw err
    }
}

async function getById(boardId) {
    try {
        const collection = await dbService.getCollection('board')
        const board = await collection.findOne({ '_id': ObjectId(boardId) })
        return board
    } catch (err) {
        logger.error(`while finding board ${boardId}`, err)
        throw err
    }
}

async function remove(boardId) {
    try {
        const collection = await dbService.getCollection('board')
        await collection.deleteOne({ '_id': ObjectId(boardId) })
    } catch (err) {
        logger.error(`cannot remove board ${boardId}`, err)
        throw err
    }
}

async function update(board) {          
    try {                               
        const boardToSave = {
            ...board,
            _id: ObjectId(board._id)
        }
        
        const collection = await dbService.getCollection('board')
        await collection.updateOne({ _id: boardToSave._id }, { $set: boardToSave } )
        
        const newBoard = await getById(board._id)
        console.log('Masheu verbali ***********************', newBoard);
        return boardToSave;
    } catch (err) {
        logger.error(`cannot update board ${board._id}`, err)
        throw err
    }
}

async function add(board) {
    try {
        const { title, isArchived, isTemplate, labels, activities, createdBy, style, members, groups} = board
        const boardToAdd = {
            title,
            isArchived,
            isTemplate,
            labels,
            activities,
            createdBy, 
            style,
            members,
            groups,
        }
        
        const collection = await dbService.getCollection('board')
        await collection.insertOne(boardToAdd)
        return boardToAdd
    } catch (err) {
        logger.error('cannot insert board', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.name) {
        const nameCriteria = { $regex: filterBy.name, $options: 'i' }
        criteria.$or = [{ name: nameCriteria }]
    }
    return criteria
}