import React, { Component } from "react";
import Joke from "./Joke";
import axios from "axios";
import uuid from "uuid/v4";
import "./JokeList.css";

class JokeList extends Component {
  static defaultProps = {
    numJokesToGet: 10
  };

  constructor(props){
    super(props);
    // we want to use existing jokes if there are any in 
    // localStorage, othervise it should be empty array (parses "[]" string to the empty array)
    // "JSON.parse" parse string and creates objects
    this.state = {
      jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"),
      loading: false
    };

    // to get track of seen and new jokes and to avoid its 
    // repetition, useful tu use Set
    this.seenJokes = new Set(this.state.jokes.map(j => j.text));
    console.log(this.seenJokes);

    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount(){
    if(this.state.jokes.length ===0){
      this.getJokes();
    }
  }

  async getJokes(){
    try {
      let njokes = [];
      while(njokes.length < this.props.numJokesToGet){
        // need to specify "Accept" header to get responce in JSON format
        let response = await axios.get("https://icanhazdadjoke.com/", {headers: {Accept: "application/json"}});
        let newJoke = response.data.joke;
        if(!this.seenJokes.has(newJoke)){
          njokes.push({id: uuid(), text: newJoke, votes: 0});
        } else {
          console.log("Found a duplicate ");
          console.log(newJoke);
        }
        
      }

      this.setState(st => ({
        loading: false,
        jokes: [...st.jokes, ...njokes] //combining two arrays
      }),
        // as a second argument, passing a function that 
        // overwrites localStorage
        // it is called when "this.state.jokes" is updated
        () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
      );

    } catch(e) {
      alert(e);
      this.setState({loading: false})
    }
  }

  handleVote(id, delta){
    this.setState(
      st => ({
        // {...j, votes: j.votes + delta} --> making a new object containing an old j (joke info), but we update the "votes"
        jokes: st.jokes.map( j => 
          j.id === id ? {...j, votes: j.votes + delta} : j
          )
      }),
      // as a second argument, passing a function that 
      // overwrites localStorage
      () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
      );
  }
 

  handleClick(){
    // "this.getJokes()" is passed as a callback fn, to run 
    // after setState finishes
    this.setState({loading: true}, this.getJokes);
  }

  render() {
    if(this.state.loading) {
      return (
        <div className="JokeList-spinner">
          <i className="far fa-8x fa-laugh fa-spin" />
          <h1 className="JokeList-title">Loading...</h1>
        </div>
      )
    }
    // sorting an array
    let jokes = this.state.jokes.sort((a,b) => b.votes - a.votes); // "-" is a comparator
    return(
      <div className="JokeList">
        <div className="JokeList-sidebar">
          <h1 className="JokeList-title"><span>Bad</span> jokes</h1>
          <img src='https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg' />
          <button className="JokeList-getmore" onClick={this.handleClick}>New Jokes</button>
        </div>
        
        <div className="JokeList-jokes">
          {jokes.map(j => (
            <Joke 
              key={j.id} 
              text={j.text} 
              votes={j.votes} 
              upvote={() => this.handleVote(j.id, 1)} downvote={() => this.handleVote(j.id, -1)}/>
          ))}
        </div>
      </div>
    );
  }
}


export default JokeList;
