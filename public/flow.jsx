// cardMemberList.jsx 

onClickBoardMember = (member, isChecked) => {
    let members = this.props.card.members
    let card = { ...this.props.card }
    if (!isChecked) {
        members.push(member)
        card.addedMember = member
        this.props.saveActivity(card, 'ADD_MEMBER')
    } else {
        members = members.filter(cardMember => cardMember._id !== member._id)
        card.removedMember = member
        this.props.saveActivity(card, 'REMOVE_MEMBER')
    }
    this.props.onUpdateCardProps('members', members)
}



// cardDetails.jsx

onUpdateCardProps = (key, value) => {
    const { card } = this.state
    card[key] = value
    this.setState({ card })
    this.props.saveCard(card, card.currGroup.groupId, this.props.board)
  }



// board.action.js

export function saveCard(card, groupId, currBoard) {
    return async dispatch => {
        try {
            const board = await boardService.saveCard(card, groupId, currBoard)
            dispatch({ type: 'SET_BOARD', board })
        } catch (err) {
            console.log(`BoardActions: err in ${card.id ? 'update card' : 'add card'}${err}`)
        }
    }
}



// board.service.js

async function saveCard(card, groupId, board) {
    if (card.id) {
        const groupIdx = board.groups.findIndex(group => group.id === groupId)
        board.groups[groupIdx].cards.map(currCard => {
            return (currCard.id === card.id) ? card : currCard
        })
        const updatedBoard = await httpService.put(`board/${board._id}`, board)
        return Promise.resolve(_deepCloneBoard(updatedBoard))
    } else {
        const groupIdx = board.groups.findIndex(group => group.id === groupId)
        card.currGroup = { groupId: board.groups[groupIdx].id, createdAt: new Date() }
        card.id = utilService.makeId()
        card.members = []
        card.labels = []
        card.attachments = []
        card.members = []
        card.checklist = []
        board.groups[groupIdx].cards.push(card)
        const updatedBoard = await httpService.put(`board/${board._id}`, board)
        return Promise.resolve(_deepCloneBoard(updatedBoard))
    }
}

function _deepCloneBoard(board) {
    return JSON.parse(JSON.stringify(board))
}



// board.reducr.js

const initialState = {
    board: null,
    boards:[]
}

export function boardReducer(state = initialState, action) {
    switch (action.type) {
        case 'SET_BOARDS':
            return { ...state, boards: action.boards }
        case 'ADD_BOARD':
            return { ...state, board: action.board, boards: [...state.boards, action.board] }
        case 'SET_BOARD':
            return { ...state, board: action.board, boards: [...state.boards] }
        case 'ADD_GROUP':
            return { ...state, board: action.board }
        default:
            return state
    }
}