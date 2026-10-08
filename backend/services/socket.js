var socketIo = require('socket.io');

var io = null;

var SocketService = {
  init: function(server) {
    io = socketIo(server, {
      cors: {
        origin: function (origin, callback) {
          if (!origin) return callback(null, true);
          if (
            origin.startsWith('http://localhost:') || 
            origin.endsWith('.ngrok-free.app') || 
            origin.endsWith('.ngrok.io')
          ) {
            return callback(null, true);
          }
          // Fallback
          return callback(null, true);
        },
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    var jwt = require('jsonwebtoken');

    io.on('connection', function(socket) {
      // Join admin room if valid admin token is provided
      var token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (token) {
        jwt.verify(token, (process.env.JWT_SECRET || 'supersecret_isp_dashboard_jwt_key_2026!'), function(err, decoded) {
          if (!err && decoded && decoded.id) {
            socket.join('admin');
          }
        });
      }
    });

    return io;
  },

  getIO: function() {
    if (!io) {
      throw new Error('Socket.io has not been initialized!');
    }
    return io;
  },

  broadcast: function(event, data) {
    if (io) {
      io.to('admin').emit(event, data);
    }
  }
};

module.exports = SocketService;
