import React, {PureComponent} from 'react'
import {connect} from 'react-redux'
import {Redirect} from 'react-router-dom'
import {getGames, joinGame, updateGame} from '../../actions/games'
import {getUsers} from '../../actions/users'
import {userId} from '../../jwt'
import Button from 'material-ui/Button'
import Paper from 'material-ui/Paper'
import './GameDetails.css'

class GameDetails extends PureComponent {

  componentWillMount() {
    if (this.props.authenticated) {
      if (this.props.game === null) this.props.getGames()
      if (this.props.users === null) this.props.getUsers()
    }
  }

  joinGame = () => this.props.joinGame(this.props.game.id)

  makeMove = (toRow, toCell) => {
    const {game, updateGame} = this.props
//function to flip array so you can analize each row
    function transposeArray(array, arrayLength){
      var newArray = [];
      for(var i = 0; i < array.length; i++){
          newArray.push([]);
      };

      for(var i = 0; i < array.length; i++){
          for(var j = 0; j < arrayLength; j++){
              newArray[j].push(array[i][j]);
          };
      };

      return newArray;
    }
//new constants to find lowest open spot
    const flippedBoard = transposeArray(game.board, game.board.length)
    const numSymbols = flippedBoard[toCell].filter(x => x !== null).length
    const lowest = game.board.length-1-numSymbols

    const board = game.board.map(
      (row, rowIndex) => row.map((cell, cellIndex) => {
        if (rowIndex === lowest && cellIndex === toCell)
        return game.turn
        else return cell
      })
    )
    updateGame(game.id, board)
  }

  renderCel = (rowIndex, cellIndex, symbol, hasTurn) => {
    return (
      <button
        disabled={hasTurn}
        onClick={() => this.makeMove(rowIndex, cellIndex)}
        key={`${rowIndex}-${cellIndex}`}
      >{symbol || '-'}</button>
    )
  }

  renderRow = (cells, rowIndex) => {
    return (<div key={rowIndex}>
      {cells.map((symbol, cellIndex) => this.renderCel(rowIndex, cellIndex,symbol,false))}
    </div>)
  }

  render() {
    const {game, users, authenticated, userId} = this.props

    if (!authenticated) return (
			<Redirect to="/login" />
		)

    if (game === null || users === null) return 'Loading...'
    if (!game) return 'Not found'

    const player = game.players.find(p => p.userId === userId)

    return (<Paper class="outer-paper">
      <h1>Game #{game.id}</h1>

      <p>Status: {game.status}</p>

      {
        game.status === 'started' &&
        player && player.symbol === game.turn &&
        <div>It is your turn!</div>
      }

      {
        game.status === 'pending' &&
        game.players.map(p => p.userId).indexOf(userId) === -1 &&
        <button onClick={this.joinGame}>Join Game</button>
      }

      <hr />

      {game.board.map(this.renderRow)}
    </Paper>)
  }
}

const mapStateToProps = (state, props) => ({
  authenticated: state.currentUser !== null,
  userId: state.currentUser && userId(state.currentUser.jwt),
  game: state.games && state.games[props.match.params.id],
  users: state.users
})

const mapDispatchToProps = {
  getGames, getUsers, joinGame, updateGame
}

export default connect(mapStateToProps, mapDispatchToProps)(GameDetails)
