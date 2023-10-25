// const express = require("express");
// const app = express();
// const PORT = 8383;

// const server = app.listen(PORT, () => console.log(`Server is live on ${PORT}`));

// const io = require("socket.io")(server, {
//   pingTimeout: 60000,
//   cors: {
//     origin: "*",
//   },
// });

// const userConnections = [];
// io.on("connection", (socket) => {
//   socket.on("userConnected", ({ roomID, userID }) => {
//     // console.log(roomID, userID);
//     if (userID) {
//       userConnections.push({
//         connectionID: socket.id,
//         userID,
//         roomID,
//       });
//     }

//     // console.log(userConnections);

//     // Emit the list of other participants to the newly connected user
//     socket.emit(
//       "otherParticipants",
//       userConnections
//         .filter((user) => user.roomID == roomID)
//         .map((user) => ({
//           userID: user.userID,
//           connID: user.connectionID,
//         }))
//     );
    

//     //maybe emit something everytime another user is conneccted globally
//     // Emit an "informOthers" event to all other participants
//       userConnections
//       .filter((user) => user.roomID == roomID)
//       .forEach((user) => {
//         socket.in(user.connectionID).emit("informOthers", {
//           otherUser: userID,
//           connID: socket.id,
//         });
//       });
//   });
// });


// server.js

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
      origin: "*",
    },
  });

const userConnections = [];

app.use(express.static("public"));

io.on("connection", (socket) => {
  socket.on("userConnected", ({ roomID, userID }) => {
    if (userID) {
      userConnections.push({
        connectionID: socket.id,
        userID,
        roomID,
      });
    }

    socket.join(roomID);

    // Check if the room exists before emitting to it
    const room = io.sockets.adapter.rooms.get(roomID);
    if (room) {
      io.to(roomID).emit("user-connected", userID); // Changed this line
    } else {
      // Handle room not found, for example:
      socket.emit("room-not-found", roomID);
    }

    socket.on("disconnect", () => {
      // Handle user disconnection and room cleanup
      io.to(roomID).emit("user-disconnected", userID); // Changed this line
      userConnections = userConnections.filter((user) => user.connectionID !== socket.id);
    });
  });


  socket.on("offer", (offer, targetUserID) => {
    const targetConnection = userConnections.find((user) => user.userID === targetUserID);
    if (targetConnection) {
      io.to(targetConnection.connectionID).emit("receive-offer", {offer, socketCallerID:`${socket.id}`});
    }
  });

  socket.on("answer", (answer, callerSocketID) => {
    io.to(callerSocketID).emit("receive-answer", answer);
  });

  socket.on("ice-candidate", (candidate, targetUserID) => {
    const targetConnection = userConnections.find((user) => user.userID === targetUserID);
    if (targetConnection) {
      io.to(targetConnection.connectionID).emit("receive-ice-candidate", candidate);
    }
  });
});

server.listen(8383, () => {
  console.log("Server is live on http://localhost:8383");
});
