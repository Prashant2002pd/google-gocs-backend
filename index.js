const { Socket, Server } = require("socket.io");
const express = require("express");
const { createServer } = require("node:http");
const mongoose = require("mongoose");
const Document = require("./models/index");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

mongoose
  .connect(process.env.DB)
  .then(() => {
    console.log("database connected");
  })
  .catch((error) => {
    console.log(error);
  });

const app = express();
app.use(cors());
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "*",
      "http://localhost:5173",
      "https://main--starlit-caramel-e57551.netlify.app/",
    ],
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("get-document", async (documentID) => {
    const document = await get_data(documentID);
    socket.join(documentID);
    socket.emit("load-document", document.data);
    socket.on("send-changes", (delta) => {
      console.log("changes saved");

      socket.broadcast.to(documentID).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data) => {
      await Document.findOneAndUpdate({ id: documentID }, { data });
    });
  });
  socket.on("disconect", () => {
    console.log("user disconect");
  });
});

async function get_data(id) {
  if (id == null) return;
  const document = await Document.findOne({ id });
  if (document) return document;
  return await Document.create({ id, data: "" });
}

server.listen(process.env.PORT || 3000, () => {
  console.log("====================================");
  console.log("server is running");
  console.log("====================================");
});
