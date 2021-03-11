const express = require("express");

const socket = require("socket.io");
const cors = require("cors");

const app = express();
const http = require("http");
const server = http.createServer(app);
const io = socket(server, {
  cors: {
    origin: "*",
  },
});
const users = {};
const socketToRoom = {};
io.on("connection", (socket) => {
  // conection
  socket.on("uui", (roomID) => {
    if (users[roomID]) {
      // users[roomID].push(socket.id);
      const arr = users[roomID];
      arr.push(socket.id);
      users[roomID] = arr;
      // console.log(users[roomID]);
      socketToRoom[socket.id] = roomID;
      const userInThisRoom = users[roomID].filter((id) => id !== socket.id);

      socket.emit("all user", { userInThisRoom, id: socket.id });
    } else {
      users[roomID] = [socket.id];
    }
  });
  socket.on("id", (id) => {
    const roomID = socketToRoom[socket.id];
    socket.broadcast.emit("global send", id);
  });

  socket.on("sanding signal", (paylod) => {
    io.to(paylod.remoteSocketid).emit("user join", {
      signal: paylod.signal,
      hostId: paylod.selfId,
    });
  });
  socket.on("returning signal", (paylode) => {
    // console.log(paylode.callerID);
    io.to(paylode.callerID).emit("receiving returning signal", {
      userToHost: paylode.signal,
      id: socket.id,
    });
  });

  socket.on("disconnect", () => {
    // console.log(socket.id);
    const roomID = socketToRoom[socket.id];
    socket.broadcast.emit("take leave", { id: socket.id });
    let room = users[roomID];
    if (room) {
      room = room.filter((id) => id !== socket.id);
      users[roomID] = room;
    }
  });
});
//route
app.get("/remote", (res, req) => {
  res.send("data");
});
server.listen(process.env.PORT || 4000, () => {
  console.log("4000 port is ready to start.");
});
