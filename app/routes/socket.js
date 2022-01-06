/*eslint-disable */
var job = require('./jobs');
var socket_id = null;
var usersConnected = {};
var connectedUsers = [];

const removeDublicateConnections = (frd_id) => {
    for (let i = 0; i < connectedUsers.length; i++) {
        if (connectedUsers[i].u_id == frd_id) {
            connectedUsers.splice(i, 1)
        }
    }
}

const getFrdsSocketId = (frd_id) => {
    let frd_socket_id = null
    for (let i = 0; i < connectedUsers.length; i++) {
        if (connectedUsers[i].u_id == frd_id) {
            console.log(connectedUsers[i].socket_id, "resp.socket_idresp.socket_idresp.socket_idresp.socket_idresp.socket_id")
            frd_socket_id = connectedUsers[i].socket_id;
            break;
        }
    }
    return frd_socket_id
}

exports.socketInitialize = function (httpServer) {
    console.log("INNN");
    // var socketIO = require('socket.io').listen(httpServer);
    var socketIO = require('socket.io')(httpServer, { wsEngine: "eiows" });

    socketIO.set('browser client minification', true);  // send minified client
    socketIO.set('browser client etag', true);
    socketIO.set('Content-Encoding', 'gzip');
    socketIO.set('Accept-Encoding', 'gzip, deflate');

    setInterval(() => {
        console.log(connectedUsers.length, "connectedUsers List from socket server...")
    }, 5000)

    socketIO.on('connection', function (socket) {
        socket.compress(true);

        console.log("connection found !!!!")
        console.log("socket id ", socket.id);
        socket_id = socket.id;

        console.log("Connected users ", usersConnected);

        /*
        * Authenticate user just after socket connection
        * params required session_id
        * */

        socket.on('establish_socket_connection', function (data) {
            console.log(data, "fgfgjhf")
            if (!!data.socket_id && !!data.u_id) {
                console.log("on connection establish.....")
                // remove dublicate connections with socket if exist.......
                removeDublicateConnections(data.u_id)
                // add new connection
                connectedUsers.unshift(data);
                console.log(connectedUsers, "connectedUsers.,.....")
            }
        })

        socket.on('destroy_socket_connection', function (data) {
            console.log(data.socket_id, "dfh")
            if (!!data.socket_id) {
                console.log("on connection destroy.....")
                connectedUsers.forEach((resp, index) => {
                    if (resp.socket_id == data.socket_id) {
                        connectedUsers.splice(index, 1)
                    }
                })
                console.log(connectedUsers, "connectedUsers.,.....")
            }
        })

        socket.on('authenticate_pools', function (data) {
            console.log("authenticate ", data);
            //var data=JSON.parse(data);
            //console.log(data.user2_id);
            var sql = "SELECT * FROM users WHERE id = ? LIMIT 1";
            connection.query(sql, [data.user_id], function (error, user) {
                if (error) {
                    console.log("Unauthorized err ", error);
                    socketIO.to(data.socket_id).emit("unauthorized", "You are not authorized to connect");
                    socket.conn.close();
                } 
                else if (user && user.length > 0) {
                    console.log(user, "user... as sdghfsdh fsdjfbhasdvfadbsvfvdasjf sdfh sfhkds fsdjf sdf")
                        var msg_id = user[0].id;
                        job.updateIgnoreMessage(msg_id, data.reciever_id, function (err, resp) {
                            if (err) {
                                console.log("updateIgnoreMessage error..")
                            }
                            else {
                                if (resp.success) {
                                    console.log(msg_id, data.reciever_id, "klklklklklklklklklklklklklklklklklklklklklklklklklklklklklklklklklklklklklklklklklklklklklklklklklklkl")
                                    job.getMessage(msg_id, data.reciever_id, 1, function (err, message_data) {
                                        //console.log('message data',message_data);
                                        socketIO.to(data.socket_id).emit("getMessage", message_data)

                                        job.readAllMessages(data.reciever_id, msg_id, function (err, resp) {
                                            if (err) {
                                                console.log(err, "error set read = 1 in << readAllMessages >>")
                                            }
                                            else {
                                                console.log("readAllMessages success...")

                                                console.log("authorizedauthorizedauthorizedauthorizedauthorizedauthorizedauthorized!!!")
                                                socketIO.to(data.socket_id).emit("authorized", "You are authorized and connected");
                                                const is_read = 1;
                                                job.updateReadStatusMessages(data.reciever_id, msg_id, is_read, function (err, is_success) {
                                                    if (err) {
                                                        console.log("updateReadStatusMessages error..")
                                                    }
                                                    else {
                                                        console.log("updateReadStatusMessages success..")
                                                    }
                                                })
                                            }
                                        })
                                    })
                                }

                            }
                        })
                        // socketIO.to(socket_id).emit("authorized", "You are authorized and connected");
                    
                }
                else {
                    console.log(user, "Unauthorized");
                    socketIO.to(data.socket_id).emit("unauthorized", "You are not authorized to connect");
                    // socket.conn.close();
                }
            });
        });

        socket.on('send_message', function (data) {
            var sql_data = `SELECT * FROM users WHERE id=?`;
            connection.query(sql_data, [data.sender_id], function (error, appdetail) {
                //console.log(appdetail);
                if (appdetail && appdetail.length > 0) {
                    //console.log('android');
                    job.sendMessage(data, function (err, getData) {
                        console.log('message val');
                        // if (socket.broadcast.emit("message_data")) {
                        console.log(getData, "getData............")
                        if (!!getData) {
                            console.log("send message now...");
                            console.log('emit data');
                            socket.emit("message_data", getData) // myself 
                            const frd_socket_id = getFrdsSocketId(data.reciever_id);
                            console.log(frd_socket_id, data.reciever_id, "data.reciever_id, frd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_id")
                            if (!!frd_socket_id) {
                                console.log(frd_socket_id, "test socket id.........")
                                socketIO.to(frd_socket_id).emit("message_data", getData); // my frd
                            }
                            // if (getData.obj.is_acknowledge) {
                            //     const is_voice = false
                            //     job.sendNotification(data, is_voice, function (err, send_notification) {
                            //         if (send_notification.success) {
                            //             console.log("push notification success..")
                            //         }
                            //         else {
                            //             console.log("push notification error... or frd is online")
                            //         }
                            //     })
                            // }
                        }
                        else {
                            console.log("cannot send first let other person respond .....!!!")
                        }
                        // }
                        // else {
                        //     console.log('emit not data');
                        // }
                    });
                }
            })
        })

        socket.on('typing', function (data) {
            if (data.frds_acknowledged == 1) {
                // socketIO.emit('typing', data);
                const frd_socket_id = getFrdsSocketId(data.reciever_id);
                console.log(frd_socket_id, data.reciever_id, "data.reciever_id, frd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_id")
                if (!!frd_socket_id) {
                    console.log(frd_socket_id, "test socket id.........")
                    socketIO.to(frd_socket_id).emit('typing', data); // my frd
                }
            }
        });

        socket.on('get_my_frds_last_message', function (data) {
            socketIO.emit('get_my_frds_last_message', data);
            const frd_socket_id = getFrdsSocketId(data.frd_id);
            if (!!frd_socket_id) {
                socketIO.to(frd_socket_id).emit('get_my_frds_last_message', data); // my frd
            }
        });


        socket.on('is_user_active', function (data) {
            job.updateUserActiveStatus(data.user_id, data.is_online, function (err, result) {
                if (err) {
                    console.log("cannot update the user active/inactive status...")
                }
                else {
                    console.log("updated the user active/inactive status...")
                    socketIO.emit('is_user_active', data);
                }
            })
        });


        socket.on('check_frds_are_acknowledged', function (data) {
            // job.checkFrdsAreAcknowledged(data.sender_id, data.reciever_id, function (err, result) {
            //     if (err) {
            //         console.log("check_frds_are_acknowledged... error")
            //     }
            //     else {
            //         console.log("check_frds_are_acknowledged... success")
                    socket.emit("check_frds_are_acknowledged", { frds_acknowledged: true, sender_id: data.sender_id });
            //     }
            // })
        });

        socket.on('chat_list_last_message', function (data) {
            job.chat_list_last_message(data.login_id, data.chat_list, data.future_calls, function (err, result) {
                if (err) {
                    console.log("chat_list_last_message... error")
                }
                else {
                    console.log("chat_list_last_message... success")
                    socketIO.emit("chat_list_last_message", result);
                }
            })
        });

        socket.on('realtime_active_users', function (data) {
            job.getRealTimeUsersList(function (err, list) {
                if (err) {
                    socketIO.emit("realtime_active_users", { list: [], user_id: data.user_id });
                } else {
                    socketIO.emit("realtime_active_users", { list, user_id: data.user_id });
                }
            })
        });

        socket.on('UserSendMessage', function (data) {
            job.getOrderData(data, function (err, result) {
                socketIO.to(socket_id).emit('order_data', result);
            });
        });

        socket.on('disconnect', function (data) {
            // console.log("disconnect socket", data);
            // usersConnected = {};
            // socket.conn.close();
            console.log(data, "data attained on sockect disconnect.....")
            // connectedUsers.forEach((sockets, index) => {
            //     if ()
            // })
            console.log("connection lost !!!!")
            console.log(connectedUsers, "connectedUsers.,.....")
        });

        socket.on('disconnect_user', function (data) {
            usersConnected = {};
            console.log("disconnect_user", data);
            socket.conn.close();
        });

        socket.on('error', function (err) {
            console.log("Socket error ", err);
        });

        // --------------- pools (read-unread) --------------------------- //

        socket.on('get_unread_frd_messages', function (data) {
            const toMe = data.toMe;
            job.getUnreadFrdMessages(data.user_id, data.check_user, function (err, unreads) {
                if (err) {
                    console.log("err get_unread_frd_messages", err)
                }
                else {
                    console.log("success get_unread_frd_messagessssssssssssssssssssssssssssssssssssssssssssssssss", unreads, "future calls..")
                    if (toMe) {
                        console.log("tometometometometometometometometome")
                        socket.emit('get_unread_frd_messages', unreads);
                    }
                    else {
                        const frd_socket_id = getFrdsSocketId(data.check_user);
                        console.log(frd_socket_id, data.check_user, "data.reciever_id, frd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_id")
                        if (!!frd_socket_id) {
                            console.log(frd_socket_id, "test socket id.........")
                            socketIO.to(frd_socket_id).emit('get_unread_frd_messages', unreads); // my frd
                        }
                    }
                    // socketIO.emit('get_unread_frd_messages', unreads);
                }
            });
            // socketIO.emit('get_unread_frd_messages', { user_id: data.user_id, check_user: data.check_user, unreadMessagesList: [], frdsOnlineStatus: [] });
        });

        socket.on('ping_frd_my_unread_message', function (data) {
            const toMe = data.toMe;
            job.getUnreadFrdCount(data.user_id, function (err, unreads) {
                if (err) {
                    console.log("err ping_frd_my_unread_message", err)
                }
                else {
                    console.log("success get_unread_frd_count", "future calls..")
                    // socketIO.emit('ping_frd_my_unread_message', unreads);
                    if (toMe) {
                        socket.emit('ping_frd_my_unread_message', unreads);
                    }
                    else {
                        const frd_socket_id = getFrdsSocketId(data.user_id);
                        console.log(frd_socket_id, data.user_id, "data.reciever_id, frd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_id")
                        if (!!frd_socket_id) {
                            console.log(frd_socket_id, "test socket id.........")
                            socketIO.to(frd_socket_id).emit('ping_frd_my_unread_message', unreads); // my frd
                        }
                    }
                }
            });
        });

        socket.on('message_read_unread_status', function (data) {
            job.updateReadStatusMessages(data.receiver_id, data.sender_id, 0, function (err, getData) {
                if (err) {
                    console.log("error message_read_unread_status", err)
                }
                else {
                    console.log("success message_read_unread_status")

                    // socketIO.to(socket_id).emit('message_data',  getData)
                }

            })
        });

        socket.on('send_my_message_status', function (data) {
            var result = job.sendMyMessageStatus(data)
            console.log("check_receiver_message_status my:", result)

            socket.emit('check_receiver_message_status', result) // myself 
            const frd_socket_id = getFrdsSocketId(data.reciever_id);
            console.log(frd_socket_id, data.reciever_id, "data.reciever_id, frd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_id")
            if (!!frd_socket_id) {
                console.log(frd_socket_id, "test socket id.........")
                socketIO.to(frd_socket_id).emit('check_receiver_message_status', result); // my frd
            }
        });

        socket.on('check_receiver_message_status', function (data) {
            job.checkReceiverMessageStatus(data, function (err, result) {
                if (err) {
                    console.log("err check_receiver_message_status", err)
                }
                else {
                    console.log("check_receiver_message_status ISt:", result)
                    // socketIO.emit('check_receiver_message_status', result);
                    socket.emit('check_receiver_message_status', result) // myself 
                    const frd_socket_id = getFrdsSocketId(data.reciever_id);
                    console.log(frd_socket_id, data.reciever_id, "data.reciever_id, frd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_id")
                    if (!!frd_socket_id) {
                        console.log(frd_socket_id, "test socket id.........")
                        socketIO.to(frd_socket_id).emit('check_receiver_message_status', result); // my frd
                    }
                }
            });
        });


        socket.on('send_my_frd_i_am_on_another_chat', function (data) {

                var sender_id = data.sender_id;
                var reciever_id = data.reciever_id;

                let messageStatus = {
                    friend_id: reciever_id,
                    online: { read: false, unread: true, reciever_id: sender_id },
                    offline: false
                }
            
                    const frd_socket_id = getFrdsSocketId(data.reciever_id);
                   if (!!frd_socket_id) {
                        socketIO.to(frd_socket_id).emit('send_my_frd_i_am_on_another_chat', messageStatus); // my frd
                    }
                })
        
       

        socket.on('get_messages_pagination', function (data) {
            job.getMessage(data.sender_id, data.reciever_id, data.page, function (err, message_data) {

                if (!err) {
                    socket.emit("get_messages_pagination", message_data)
                    console.log('emit data------ get messages pagination..', message_data);
                }
                else {
                    console.log('data not emit get messages pagination...');
                }
            });
        });

        socket.on('ping_me_and_frd_to_get_message_on_delete', function (data) {
            // socketIO.emit('ping_me_and_frd_to_get_message_on_delete', data) 


            socket.emit('ping_me_and_frd_to_get_message_on_delete', data) // myself 
            const frd_socket_id = getFrdsSocketId(data.reciever_id);
            console.log(frd_socket_id, data.reciever_id, "data.reciever_id, frd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_idfrd_socket_id")
            if (!!frd_socket_id) {
                console.log(frd_socket_id, "test socket id.........")
                socketIO.to(frd_socket_id).emit('ping_me_and_frd_to_get_message_on_delete', data); // my frd
            }

        });

        socket.on('is_frd_active_in_one_to_one_chat', function (data) {
            job.checkFrdActiveInOneToOneChat(data.frd_id, function (err, resp) {
                if (!err) {
                    console.log("is_frd_active_in_one_to_one_chat success!!!!!")
                    socketIO.emit('is_user_active', resp)
                }
                else {
                    console.log("is_frd_active_in_one_to_one_chat error!!!!!")
                }
            });
        });

        socket.on('get_online_users_in_mosh', function (data) {
            job.getOnlineUsersInMosh(function (err, resp) {
                if (!err) {
                    resp.socket_id = data.socket_id;
                    console.log("get_online_users_in_mosh success!!!!!")
                    const frd_socket_id = resp.socket_id;
                    socketIO.to(frd_socket_id).emit('get_online_users_in_mosh', resp); // my frd
                }
                else {
                    console.log("get_online_users_in_mosh error!!!!!")
                }
            });
        });

        socket.on('ping_frd_you_are_devil', function (data) {
            const frd_socket_id = getFrdsSocketId(data.reciever_id)
            if (!!frd_socket_id) {
                socketIO.to(frd_socket_id).emit('ping_frd_you_are_devil', data); // my frd
            }
        });
    });
}
