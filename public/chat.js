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
  const data = JSON.parse(event.data);
  chat.innerHTML += data.message;
  console.log(data);
};

button.addEventListener("click", () => {
  const name = document.querySelector("#name");
  const message = document.querySelector("#message");
  const data = `<p>${name.value}: ${message.value}</p>`;

  // Send composed message to the server
  connection.send(data);

  // clear input fields
  name.value = "";
  message.value = "";
});
