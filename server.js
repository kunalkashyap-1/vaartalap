const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const morgan = require("morgan");

const app = express();
app.use(morgan("tiny"));
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log(`Socket Connected: ${socket.id}`);

  socket.on("room:join", (data) => handleRoomJoin(socket, data));
  socket.on("user:call", ({ to, offer }) => handleUserCall(socket, to, offer));
  socket.on("call:accepted", ({ to, ans }) =>
    handleCallAccepted(socket, to, ans)
  );
  socket.on("peer:nego:needed", ({ to, offer }) =>
    handlePeerNegoNeeded(socket, to, offer)
  );
  socket.on("peer:nego:done", ({ to, ans }) =>
    handlePeerNegoDone(socket, to, ans)
  );
  socket.on("message", ({ roomID, from, message }) => {
    // console.log(roomID, from, message);
    handleMessage(roomID, from, message);
  });

  socket.on("disconnect", () => handleDisconnect(socket));
});

function handleRoomJoin(socket, data) {
  try {
    const { email, room } = data;

    if (!email || !room) {
      throw new Error("Invalid data for room join");
    }

    emailToSocketIdMap.set(email, socket.id);
    socketidToEmailMap.set(socket.id, email);

    socket.join(room);
    io.to(room).emit("user:joined", { email, id: socket.id });
    io.to(socket.id).emit("room:join", data);
    console.log(`User ${email} joined room ${room}`);
  } catch (error) {
    console.error(`Error in handleRoomJoin: ${error.message}`);
  }
}

function handleUserCall(socket, to, offer) {
  try {
    if (!to || !offer) {
      throw new Error("Invalid data for user call");
    }

    io.to(to).emit("incomming:call", { from: socket.id, offer });
  } catch (error) {
    console.error(`Error in handleUserCall: ${error.message}`);
  }
}

function handleCallAccepted(socket, to, ans) {
  try {
    if (!to || !ans) {
      throw new Error("Invalid data for call accepted");
    }

    io.to(to).emit("call:accepted", { from: socket.id, ans });
  } catch (error) {
    console.error(`Error in handleCallAccepted: ${error.message}`);
  }
}

function handlePeerNegoNeeded(socket, to, offer) {
  try {
    if (!to || !offer) {
      throw new Error("Invalid data for peer negotiation needed");
    }

    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  } catch (error) {
    console.error(`Error in handlePeerNegoNeeded: ${error.message}`);
  }
}

function handlePeerNegoDone(socket, to, ans) {
  try {
    if (!to || !ans) {
      throw new Error("Invalid data for peer negotiation done");
    }

    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  } catch (error) {
    console.error(`Error in handlePeerNegoDone: ${error.message}`);
  }
}

function handleMessage(room, from, message) {
  try {
    io.to(room).emit("message", { from, message });
    console.log(`Message sent to room ${room}: ${message}`);
  } catch (error) {
    console.error(`Error in handleMessage: ${error.message}`);
  }
}

function handleDisconnect(socket) {
  try {
    const email = socketidToEmailMap.get(socket.id);

    if (email) {
      emailToSocketIdMap.delete(email);
      socketidToEmailMap.delete(socket.id);
      console.log(`Socket Disconnected: ${socket.id}`);
    }
  } catch (error) {
    console.error(`Error in handleDisconnect: ${error.message}`);
  }
}

const PORT = process.env.PORT || 8383;

server.listen(PORT, () => {
  console.log(`Server is live on port ${PORT}`);
});
