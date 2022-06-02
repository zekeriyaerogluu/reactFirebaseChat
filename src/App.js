import React, { useRef, useState } from "react";
import "./App.css";

import firebase from "firebase/compat/app";

import "firebase/compat/firestore";
import "firebase/compat/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

// firebass app config
firebase.initializeApp({
  apiKey           : "#",
  authDomain       : "#",
  projectId        : "#",
  storageBucket    : "#",
  messagingSenderId: "#",
  appId            : "#",
  measurementId    : "#"
});

const auth      = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Mesajlaşma</h1>
        <SignOut />
      </header>

      <section>{user ? <Messages /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>
        Google İle Giriş Yap
      </button>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Çıkış Yap
      </button>
    )
  );
}

function Messages() {
  const dummy       = useRef();
  const messagesRef = firestore.collection("messages");
  const query       = messagesRef.orderBy("createdAt").limit(25);

  const [messages]  = useCollectionData(query, { idField: "id" });

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid } = auth.currentUser;

    await messagesRef.add({
      text     : formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid
    });

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <main>
        {messages && messages.map((msg) => <Message key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value       = {formValue}
          onChange    = {(e) => setFormValue(e.target.value)}
          placeholder = "Mesajınız"
        />

        <button type="submit" disabled={!formValue}>
          >
        </button>
      </form>
    </>
  );
}

function Message(props) {
  const { text, uid } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <>
      <div className={`message ${messageClass}`}>
        <p>{text}</p>
      </div>
    </>
  );
}

export default App;
