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
  console.log(event.data);
  const messages = JSON.parse(event.data);
  for (let i = 0; i < messages.length; i++) {
    let name, text;
    [name, text] = messages[i]
    chat.innerHTML += `<p><i>${name}</i>: ${text}</p>`;
  }
};

button.addEventListener("click", () => {
  const name = document.querySelector("#name");
  const message = document.querySelector("#message");
  const data = [name.value, message.value];

  // Send composed message to the server
  connection.send(JSON.stringify(data));

  // clear input fields
  name.value = "";
  message.value = "";
});
