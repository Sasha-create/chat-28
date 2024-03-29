import { Component } from "react";
import Message from "../message";
import Send from "../send";

import { socket } from "./socket";

import "./chat.css";

class Chat extends Component {
  socket = socket;
  state = {
    currentUser: "",
    messages: [],
    message: "",
    isLogin: false,
    users: {},
  };
  componentDidMount() {
    this.socket.on("message", (data) => {
      if (this.state.isLogin) {
        this.setState(({ messages }) => {
          const newMessages = [...messages];
          if (newMessages.length > 10) {
            newMessages.shift();
          }
          return {
            messages: [...newMessages, { user: data.user, text: data.message }],
          };
        });
      }
    });
    this.socket.on("users", (data) => {
      this.setState({ users: data });
    });
  }

  changeName = (event) => {
    this.setState({ currentUser: event.target.value });
  };

  inputName = () => {
    const user = this.state.currentUser;
    if (user.trim().length > 0) {
      this.socket.emit("change:name", user);
      this.setState({ isLogin: true });
    }
  };

  sendMessage = (event) => {
    event.preventDefault();
    const { currentUser, message } = this.state;
    if (message.trim().length > 0) {
      this.socket.emit("message", {
        user: currentUser,
        message: message.trim(),
      });
      this.setState({ message: "" });
    }
  };

  changeMessage = (event) => {
    this.setState({ message: event.target.value });
  };

  render() {
    const { message, messages, currentUser, isLogin, users } = this.state;
    if (!isLogin) {
      return (
        <main className="form-signin">
          <h4 className="form-floating mb-3">Please writing your name</h4>
          <div className="form-floating mb-3">
            <input
              className="form-control"
              value={currentUser}
              onChange={this.changeName}
              placeholder="Writing your nickname"
              id="floatingInput"
            />
            <label for="floatingInput">Nickname</label>
          </div>
          <button
            className="w-100 btn btn-lg btn-primary"
            onClick={this.inputName}
          >
            Open chat
          </button>
        </main>
      );
    }

    return (
      <div className="container">
        <div className="row align-items-start">
          <div className="message-list col-md-9">
            <Send
              value={message}
              onChange={this.changeMessage}
              onSend={this.sendMessage}
            />
            <div className="messages">
              {messages.map((item, key) => (
                <Message item={item} currentUser={currentUser} key={key} />
              ))}
            </div>
          </div>
          <ul className="list-group col-md-3">
            {Object.values(users).map((user, i) => (
              <li className="list-group-item" key={i}>
                {user}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

export default Chat;
