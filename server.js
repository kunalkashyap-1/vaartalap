const express = require("express");
const app = express();
const PORT = 8383;

const server = app.listen(PORT, () => console.log(`Server is live on ${PORT}`));

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  socket.on("connected",({roomID, userID})=>{
    console.log(roomID, userID);
  })
});
