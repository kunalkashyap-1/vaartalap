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

const userConnections = [];
io.on("connection", (socket) => {
  socket.on("userConnected", ({ roomID, userID }) => {
    // console.log(roomID, userID);

    if (userID) {
      userConnections.push({
        connectionID: socket.id,
        userID,
        roomID,
      });
    }
    // Emit the list of other participants to the newly connected user
    socket.emit(
      "otherParticipants",
      userConnections
        .filter((user) => user.roomID == roomID)
        .map((user) => ({
          userID: user.userID,
          connID: user.connectionID,
        }))
    );

    //maybe emit something everytime another user is conneccted globally 
    // Emit an "informOthers" event to all other participants
    userConnections
      .filter((user) => user.roomID == roomID)
      .forEach((user) => {
        socket.to(user.connectionID).emit("informOthers", {
          otherUser: userID,
          connID: socket.id,
        });
      });
  });
});
