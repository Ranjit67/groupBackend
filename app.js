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
  //conection
  socket.on("uui", (roomID) => {
    if (users[roomID]?.length) {
      // users[roomID].push(socket.id);
      const arr = users[roomID];
      arr.push(socket.id);
      users[roomID] = arr;
    } else {
      users[roomID] = [socket.id];
    }
    socketToRoom[socket.id] = roomID;
    const userInThisRoom = users[roomID].filter((id) => id !== socket.id);
    socket.emit("all user", userInThisRoom);
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
    io.emit("dis", "one user is disconnected.");
  });
});
//route
app.get("/remote", (res, req) => {
  res.send("data");
});
server.listen(process.env.PORT || 4000, () => {
  console.log("4000 port is ready to start.");
});
