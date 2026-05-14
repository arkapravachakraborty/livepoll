import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'node:http';
import pollRoutes from './routes/polls';
import authRoutes from './routes/auth';

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/', (req, res) => {
    res.send("Hello");
})

app.use('/api/auth', authRoutes);

app.use('/api/polls', pollRoutes);

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});
io.attach(server);

io.on("connection", (socket) => {
    console.log("user connected", socket.id);

    socket.on("join_poll", (pollId) => {
        socket.join(pollId);
        console.log(`Socket ${socket.id} joined poll ${pollId}`);
    });
});

app.set("io", io);


server.listen(PORT, () => {
    console.log(`Server is running on: http://localhost:${PORT}`);
})