const connection = new WebSocket("ws://3d-connect-4.glitch.me:80");
const button = document.querySelector("#send");

connection.onopen = (event) => {
    console.log("WebSocket is open now.");
};

connection.onclose = (event) => {
    console.log("WebSocket is closed now.");
};

connection.onerror = (event) => {
    console.error("WebSocket error observed:", event);
};

const chat = document.querySelector("#chat");
connection.onmessage = (event) => {
  const messages = JSON.parse(event.data);
  for (let i = 0; i < messages.length; i++) {
    chat.innerHTML += messages[i];
  }
};

button.addEventListener("click", () => {
  const name = document.querySelector("#name");
  const message = document.querySelector("#message");
  const data = [name.value, message.value];

  // Send composed message to the server
  connection.send(data);

  // clear input fields
  name.value = "";
  message.value = "";
});
