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
    const otherParticipants = userConnections.filter(
      (user) => user.roomID == roomID
    );
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
      otherParticipants.map((user) => ({
        userID: user.userID,
        connID: user.connectionID,
      }))
    );

    // Emit an "informOthers" event to all other participants
    otherParticipants.forEach((user) => {
      socket.to(user.connectionID).emit("informOthers", {
        otherUser: userID,
        connID: socket.id,
      });
    });
  });

  socket.on("hello", ({ greeting }) => {
    socket.emit("helloback", { greeting: "hello to you to" });
  });
});
