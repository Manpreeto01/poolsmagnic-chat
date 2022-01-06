const async = require('async');
const constants = require('./../constants');
var moment = require('moment');

exports.readAllMessages = function (from_id, to_id, callback) {
    async.waterfall([
        function (cb) {
            var sql = 'UPDATE `messages` SET `message_is_read`=1, `message_is_sent`=0, `message_is_not_seen`=0  WHERE `user_from_id`=? AND `user_to_id`=? AND `message_is_read`=0 ';
            connection.query(sql, [from_id, to_id], (error, user) => {
                if (error) {
                    cb({
                        message: constants.ERROR_IN_EXECUTION_MSG,
                        status: constants.ERROR_IN_EXECUTION_FLAG,
                        response_data: {}
                    });

                } else {

                    cb(null, true);
                }
            });
        }
    ], function (error, result) {
        //console.log(result);
        return callback(error, result);
    });
}

exports.getMessage = function (data, user2_id, page, callback) {
    var limit = 12;
    async.waterfall([
        function (cb) {
            var getSelectedMessages = ' AND (' + '`delete_permanent`=0' + " OR " + '(`delete_permanent`=1 AND `delete_permanent_user`=' + user2_id + ')' + ')';
            var sql = 'SELECT COUNT(*) AS message_counts FROM `messages` WHERE (`user_from_id`=' + data + ' AND `user_to_id`=' + user2_id + getSelectedMessages + ') OR (`user_from_id`=' + user2_id + ' AND `user_to_id`=' + data + getSelectedMessages + ')' + ' AND ((`ignore_user_from_id` = 0 AND `ignore_user_to_id` = 1) || (`ignore_user_from_id` = 1 AND `ignore_user_to_id` = 0) || (`ignore_user_from_id` = 0 AND `ignore_user_to_id` = 0))';
            connection.query(sql, (error, fetch_data) => {
                if (error) {
                    cb({
                        message: constants.ERROR_IN_EXECUTION_MSG,
                        status: constants.ERROR_IN_EXECUTION_FLAG,
                        response_data: {}
                    });

                } else {
                    const counts = fetch_data[0].message_counts;
                    console.log(counts, "counts.......................................")
                    const offset = (counts - (page * limit)).toString().match("-") ? 0 : counts - (page * limit);
                    var sql = 'SELECT * FROM `messages` WHERE (`user_from_id`=' + data + ' AND `user_to_id`=' + user2_id + getSelectedMessages + ') OR (`user_from_id`=' + user2_id + ' AND `user_to_id`=' + data + getSelectedMessages + ')' + ' AND ((`ignore_user_from_id` = 0 AND `ignore_user_to_id` = 1) || (`ignore_user_from_id` = 1 AND `ignore_user_to_id` = 0) || (`ignore_user_from_id` = 0 AND `ignore_user_to_id` = 0)) ORDER BY id LIMIT ' + offset + ' ,' + limit;
                    connection.query(sql, (error, user) => {
                        if (error) {
                            cb({
                                message: constants.ERROR_IN_EXECUTION_MSG,
                                status: constants.ERROR_IN_EXECUTION_FLAG,
                                response_data: {}
                            });

                        } else {
                            console.log(offset, " --------------- offset ---------------------------", user, " ----------- fetched data -----------")
                            cb(null, { message_list: user, user_id: data });
                        }
                    });
                }
            });
        }
    ], function (error, result) {
        //console.log(result);
        return callback(error, result);
    });
}

exports.updateUserActiveStatus = function (user_id, is_online, callback) {
    async.waterfall([
        function (cb) {
            var sql = 'UPDATE `users` SET `online_status`=? WHERE `id`=?'; 
            
            connection.query(sql, [is_online, user_id], (error, user) => {
                if (error) {
                    cb({
                        message: constants.ERROR_IN_EXECUTION_MSG,
                        status: constants.ERROR_IN_EXECUTION_FLAG,
                        response_data: {}
                    });

                } else {

                    cb(null, true);
                }
            });
        }
    ], function (error, result) {
        //console.log(result);
        return callback(error, result);
    });
}

exports.checkFrdActiveInOneToOneChat = function (user_id, callback) {
    async.waterfall([
        function (cb) {
            var sql = 'SELECT online_status from users WHERE id=?';
            connection.query(sql, [user_id], (error, user) => {
                if (error) {
                    cb({
                        message: constants.ERROR_IN_EXECUTION_MSG,
                        status: constants.ERROR_IN_EXECUTION_FLAG,
                        response_data: {}
                    });

                } else {
                    cb(null, { user_id, is_online: user[0].online_status });
                }
            });
        }
    ], function (error, result) {
        //console.log(result);
        return callback(error, result);
    });
}


exports.getOnlineUsersInMosh = function (callback) {
    async.waterfall([
        function (cb) {
            var sql = 'SELECT COUNT(*) AS count FROM users WHERE online_status = 1';
            connection.query(sql, (error, online) => {
                if (error) {
                    cb({
                        message: constants.ERROR_IN_EXECUTION_MSG,
                        status: constants.ERROR_IN_EXECUTION_FLAG,
                        response_data: {}
                    });

                } else {
                    const online_counts = online[0].count;
                    console.log(online_counts, "online_counts.....kjsdhgjdgjsdg")
                    cb(null, { online: online_counts });
                }
            });
        }
    ], function (error, result) {
        //console.log(result);
        return callback(error, result);
    });
}

// exports.checkTheBlockStatus = function (sender_id, reciever_id, callback) {
//     async.waterfall([
//         function (cb) {
//             var sql = 'SELECT COUNT(*) AS count FROM blocked_users WHERE user_id = ? AND blocked_user_id = ? AND status = 1';
//             connection.query(sql, [sender_id, reciever_id], (error, blocked_list) => {
//                 if (error) {
//                     cb({
//                         message: constants.ERROR_IN_EXECUTION_MSG,
//                         status: constants.ERROR_IN_EXECUTION_FLAG,
//                         response_data: {}
//                     });

//                 } else {
//                     const blocked_counts = blocked_list[0].count;
//                     cb(null, { sender_id, reciever_id, is_blocked: blocked_counts > 0 ? true : false });
//                 }
//             });
//         }
//     ], function (error, result) {
//         //console.log(result);
//         return callback(error, result);
//     });
// }

exports.deleteMessage = function (message_id, user_id, receiver_id, callback) {
    async.waterfall([
        function (cb) {
            // var sql = 'UPDATE `messages` SET `delete`=?, `delete_message_user`=? WHERE `message_id`=?';
            // connection.query(sql, [1, user_id, message_id], (error, user) => {
            var sql = 'DELETE FROM `messages` WHERE `message_id`=?'
            connection.query(sql, [message_id], (error, user) => {
                if (error) {
                    cb({
                        message: constants.ERROR_IN_EXECUTION_MSG,
                        status: constants.ERROR_IN_EXECUTION_FLAG,
                        response_data: {}
                    });

                } else {

                    cb(null, { message_id, user_id, receiver_id });
                }
            });
        }
    ], function (error, result) {
        //console.log(result);
        return callback(error, result);
    });
}

exports.chat_list_last_message = async function (login_id, chat_list, future_calls, callback) {
    console.log(login_id, chat_list, future_calls, "heeeeeeeeeeeeeeeeeeeeeeeeeeeee")
    var new_chat_list = chat_list;
    async.waterfall([
        function (cb) {
            if (new_chat_list.length === 0) {
                cb(null, { login_id, chat_list: new_chat_list, future_calls })
            }
            else {

                new_chat_list.forEach(async function (frdElm, i) {

                    var getSelectedMessages = ' AND (' + '`delete_permanent`=0' + " OR " + '(`delete_permanent`=1 AND `delete_permanent_user`=' + frdElm.user_id + ')' + ')';
                    var sql = 'SELECT * FROM `messages` WHERE (`user_from_id`=' + login_id + ' AND `user_to_id`=' + frdElm.user_id + getSelectedMessages + ') OR (`user_from_id`=' + frdElm.user_id + ' AND `user_to_id`=' + login_id + getSelectedMessages + ')';
                    await connection.query(sql, (error, messages) => {
                        if (error) {
                            cb({
                                message: constants.ERROR_IN_EXECUTION_MSG,
                                status: constants.ERROR_IN_EXECUTION_FLAG,
                                response_data: {}
                            });

                        } else {
                            new_chat_list[i].last_message = messages.length > 0 ? (messages[messages.length - 1].delete == 0 ? messages[messages.length - 1].message : (messages[messages.length - 1].delete_message_user == login_id ? "You deleted this message." : "This message was deleted.")) : "";
                            new_chat_list[i].voice = !new_chat_list[i].last_message && messages.length > 0 ? true : false;
                            new_chat_list[i].created_at = messages.length > 0 ? messages[messages.length - 1].created_at : "";
                            new_chat_list[i].delete = messages.length > 0 ? messages[messages.length - 1].delete : 0;
                            if (new_chat_list.length - 1 == i) {
                                console.log(new_chat_list, "new_chat_list........")
                                cb(null, { login_id, chat_list: new_chat_list, future_calls })
                            }
                        }
                    });
                })
            }
        }
    ], function (error, result) {
        //console.log(result);
        return callback(error, result);
    });
}

exports.getUnreadFrdMessages = async function (user_id, check_user, callback) {
    var unreadMessagesList = [], unreadMessagesListLast = [], frdsActiveStatus = [];
    async.waterfall([
        function (cb) {
            var sql = 'SELECT * from `friend_lists` WHERE `user_id` = ? OR `to_id` = ?' ;
            connection.query(sql, [user_id, user_id], (error, frds) => {
                if (error) {
                    cb({
                        message: constants.ERROR_IN_EXECUTION_MSG,
                        status: constants.ERROR_IN_EXECUTION_FLAG,
                        response_data: {}
                    });

                } else {
                    frdsActiveStatus = frds;
                    if (frdsActiveStatus.length === 0) {
                        cb(null, { user_id, check_user, unreadMessagesList: [], frdsOnlineStatus: [] })
                    }

                    for (let i in frds) { // make logic to get frds
                        frds[i].user_id = (frds[i].user_id == user_id ? frds[i].to_id : frds[i].user_id)
                    }
                    
                    var sql = 'SELECT * from users WHERE id=?'
                    frdsActiveStatus.forEach(async function (frd, index) {
                        await connection.query(sql, [frd.user_id], (error, unread) => {
                            if (error) {
                                // ERROR WHILE FETCHING ONLINE FRD STATUS...
                            } else {
                                frdsActiveStatus[index].online = !!unread[0] ? (unread[0].online_status ? true : false) : false;
                                if (frdsActiveStatus.length - 1 == index) {
                                    // get counts of unread messages from each frd to 'chat_user_id'
                                    var sql = 'SELECT COUNT(*) AS unreadCount FROM messages WHERE user_from_id = ? AND user_to_id = ? AND message_is_read = 0'

                                    frds.forEach(async function (frdElm, i) {
                                        await connection.query(sql, [frdElm.user_id, user_id], (error, unread) => {
                                            if (error) {
                                                // console.log(frdElm.user_id, user_id, "unreadcounts.... failure...")
                                            } else {
                                                const counts = unread[0].unreadCount;
                                                if (counts > 0) {
                                                    unreadMessagesList.push({ "friend_id": frdElm.user_id, "counts": counts })
                                                }
                                                // console.log(frdElm.user_id, user_id, "unreadcounts....", unread[0].unreadCount)
                                                if (frds.length - 1 == i) {
                                                    // console.log("bye byee.. khatammm")
                                                    if (unreadMessagesList.length === 0) {
                                                        cb(null, { user_id, check_user, unreadMessagesList: [], frdsOnlineStatus: frdsActiveStatus })
                                                    }

                                                    const unreadMessagesListLIndex = unreadMessagesList.length - 1
                                                    var sql = 'SELECT * FROM messages WHERE user_from_id = ? AND user_to_id = ? AND message_is_read = 0 ORDER BY id DESC LIMIT 1'
                                                    // console.log(unreadMessagesList, "unreadMessagesList..")
                                                    unreadMessagesList.forEach(async function (frdElmNew, index) {
                                                        // console.log("hiiii")
                                                        await connection.query(sql, [frdElmNew.friend_id, user_id], (error, unread) => {
                                                            if (error) {
                                                                // console.log(frdElmNew.friend_id, user_id, "unreadcounts.... failure...")
                                                            } else {
                                                                // console.log(unread, "unread..")
                                                                console.log(unread, "unread", unreadMessagesList, "---", frdElmNew.friend_id, user_id)
                                                                if (unread.length != 0) {
                                                                    // unreadMessagesList[index].last_message = unread[0].message;
                                                                    // unreadMessagesList[index].message_at = new Date(unread[0].created_at).getTime();
                                                                    // unreadMessagesList[index].created_at = unread[0].created_at
                                                                    unreadMessagesList[index].last_message = unread[0].delete == 0 ? unread[0].message : (unread[0].delete_message_user == user_id ? "You deleted this message." : "This message was deleted.");
                                                                    unreadMessagesList[index].voice = !unreadMessagesList[index].last_message ? true : false;
                                                                    unreadMessagesList[index].created_at = unread[0].created_at;
                                                                    unreadMessagesList[index].delete = unread[0].delete;
                                                                    unreadMessagesList[index].message_at = new Date(unread[0].created_at).getTime();
                                                                }
                                                                else {
                                                                    unreadMessagesList.splice(index, 1)
                                                                }
                                                                // console.log(unreadMessagesList.length - 1, index, "check...")
                                                                if (unreadMessagesListLIndex == index) {
                                                                    // console.log("tatat ttatat", unreadMessagesList)
                                                                    if (unreadMessagesList.length === 0) {
                                                                        cb(null, { user_id, check_user, unreadMessagesList: [], frdsOnlineStatus: frdsActiveStatus })
                                                                    }


                                                                    unreadMessagesList = unreadMessagesList.sort(function (a, b) {
                                                                        return b.message_at - a.message_at;
                                                                    });
                                                                    unreadMessagesListLast = unreadMessagesList;
                                                                    var sql = 'SELECT * from users WHERE id=?'
                                                                    unreadMessagesList.forEach(async function (frdElm, indexNew) {
                                                                        await connection.query(sql, [frdElm.friend_id], (error, unread) => {
                                                                            if (error) {

                                                                            } else {
                                                                                if (!!unreadMessagesList[indexNew]) {
                                                                                    unreadMessagesList[indexNew].online = !!unread[0].is_online ? true : false;
                                                                                    if (unread[0].profile_enabled == 2) {
                                                                                        // unreadMessagesList.splice(indexNew, 1) 
                                                                                        unreadMessagesList[indexNew].profile_disabled = true;
                                                                                    }
                                                                                    else {
                                                                                        unreadMessagesList[indexNew].profile_disabled = false;
                                                                                        unreadMessagesList[indexNew].name = unread[0].first_name;
                                                                                        unreadMessagesList[indexNew].profile_image = "https://moshmatch.com/apprich/public/uploads/profile/" + unread[0].photo;
                                                                                        unreadMessagesList[indexNew].user_id = frdElm.friend_id;
                                                                                    }
                                                                                }

                                                                                if ((unreadMessagesListLast.length - 1 == indexNew) || (unreadMessagesListLast.length - 1 == -1)) {

                                                                                    // remove block frds logic...
                                                                                    if (unreadMessagesList.length === 0) {
                                                                                        cb(null, { user_id, check_user, unreadMessagesList: [], frdsOnlineStatus: frdsActiveStatus })
                                                                                    }
                                                                                    // unreadMessagesListLast = unreadMessagesList;
                                                                                    // var sql = 'SELECT * FROM blocked_users WHERE user_id = ? AND blocked_user_id = ? AND status = 1';
                                                                                    // unreadMessagesList.forEach(async function (frdElm, indexLatest) {
                                                                                    //     await connection.query(sql, [frdElm.friend_id, user_id], (error, blocked_list) => {
                                                                                    //         if (error) {
                                                                                    //             // console.log(frdElmNew.friend_id, user_id, "unreadcounts.... failure...")
                                                                                    //         } else {
                                                                                    //             if (!!unreadMessagesList[indexLatest]) {
                                                                                    //                 if (blocked_list.length > 0) {
                                                                                    //                     // unreadMessagesList.splice(indexLatest, 1)
                                                                                    //                     unreadMessagesList[indexLatest].to_is_blocked = true;
                                                                                    //                 }
                                                                                    //                 else {
                                                                                    //                     unreadMessagesList[indexLatest].to_is_blocked = false;
                                                                                    //                 }
                                                                                    //             }
                                                                                    //             console.log(unreadMessagesListLast.length - 1, indexLatest, "happy...")
                                                                                    //             if ((unreadMessagesListLast.length - 1 == indexLatest) || (unreadMessagesListLast.length - 1 == -1)) {
                                                                                    //                 console.log(unreadMessagesList, "unreadMessagesList....");
                                                                                    cb(null, { user_id, check_user, unreadMessagesList, frdsOnlineStatus: frdsActiveStatus })
                                                                                    //             }
                                                                                    //         }
                                                                                    //     })
                                                                                    // })
                                                                                }
                                                                            }
                                                                        })
                                                                    })
                                                                }
                                                            }
                                                        })
                                                    })
                                                }
                                            }
                                        })
                                    })
                                }
                            }
                        })
                    })
                }
            })
        }
    ], function (error, result) {
        //console.log(result);
        return callback(error, result);
    });
}

exports.getUnreadFrdCount = async function (user_id, callback) {
    var unreadMessagesList = [], unreadMessagesListLast = [];
    async.waterfall([
        function (cb) {
            var sql = 'SELECT * from `friend_lists` WHERE `user_id` = ? OR `to_id` = ?' ;
            connection.query(sql, [user_id, user_id], (error, frds) => {

                if (error) {
                    cb({
                        message: constants.ERROR_IN_EXECUTION_MSG,
                        status: constants.ERROR_IN_EXECUTION_FLAG,
                        response_data: {}
                    });

                } else {
                    if (frds.length === 0) {
                        cb(null, { user_id, counts: 0 })
                    }

                    for (let i in frds) { // make logic to get frds
                        frds[i].user_id = (frds[i].user_id == user_id ? frds[i].to_id : frds[i].user_id)
                    }

                    var sql = 'SELECT COUNT(*) AS unreadCount FROM messages WHERE user_from_id = ? AND user_to_id = ? AND message_is_read = 0'

                    frds.forEach(async function (frdElm, i) {
                        await connection.query(sql, [frdElm.user_id, user_id], (error, unread) => {
                            if (error) {
                                // console.log(frdElm.user_id, user_id, "unreadcounts.... failure...")
                            } else {
                                const counts = unread[0].unreadCount;
                                if (counts > 0) {
                                    unreadMessagesList.push({ "friend_id": frdElm.user_id, "counts": counts })
                                }
                                // console.log(frdElm.user_id, user_id, "unreadcounts....", unread[0].unreadCount)
                                if (frds.length - 1 == i) {
                                    // console.log("bye byee.. khatammm")
                                    if (unreadMessagesList.length === 0) {
                                        cb(null, { user_id, counts: 0 })
                                    }

                                    const unreadMessagesListLIndex = unreadMessagesList.length - 1
                                    var sql = 'SELECT * FROM messages WHERE user_from_id = ? AND user_to_id = ? AND message_is_read = 0 ORDER BY id DESC LIMIT 1'
                                    // console.log(unreadMessagesList, "unreadMessagesList..")
                                    unreadMessagesList.forEach(async function (frdElmNew, index) {
                                        // console.log("hiiii")
                                        await connection.query(sql, [frdElmNew.friend_id, user_id], (error, unread) => {
                                            if (error) {
                                                // console.log(frdElmNew.friend_id, user_id, "unreadcounts.... failure...")
                                            } else {
                                                // console.log(unread, "unread..")
                                                console.log(unread, "unread", unreadMessagesList, "---", frdElmNew.friend_id, user_id)
                                                if (unread.length != 0) {
                                                    // unreadMessagesList[index].last_message = unread[0].message;
                                                    // unreadMessagesList[index].message_at = new Date(unread[0].created_at).getTime();
                                                    // unreadMessagesList[index].created_at = unread[0].created_at
                                                    unreadMessagesList[index].last_message = unread[0].delete == 0 ? unread[0].message : (unread[0].delete_message_user == user_id ? "You deleted this message." : "This message was deleted.");
                                                    unreadMessagesList[index].voice = !unreadMessagesList[index].last_message ? true : false;
                                                    unreadMessagesList[index].created_at = unread[0].created_at;
                                                    unreadMessagesList[index].delete = unread[0].delete;
                                                    unreadMessagesList[index].message_at = new Date(unread[0].created_at).getTime();
                                                }
                                                else {
                                                    unreadMessagesList.splice(index, 1)
                                                }
                                                // console.log(unreadMessagesList.length - 1, index, "check...")
                                                if (unreadMessagesListLIndex == index) {
                                                    // console.log("tatat ttatat", unreadMessagesList)
                                                    if (unreadMessagesList.length === 0) {
                                                        cb(null, { user_id, counts: 0 })
                                                    }


                                                    unreadMessagesList = unreadMessagesList.sort(function (a, b) {
                                                        return b.message_at - a.message_at;
                                                    });
                                                    unreadMessagesListLast = unreadMessagesList;
                                                    var sql = 'SELECT * from users WHERE id=?'
                                                    unreadMessagesList.forEach(async function (frdElm, indexNew) {
                                                        await connection.query(sql, [frdElm.friend_id], (error, unread) => {
                                                            if (error) {

                                                            } else {
                                                                if (!!unreadMessagesList[indexNew]) {
                                                                    unreadMessagesList[indexNew].online = !!unread[0].is_online ? true : false;
                                                                    if (unread[0].profile_enabled == 2) {
                                                                        unreadMessagesList.splice(indexNew, 1)
                                                                        // unreadMessagesList[indexNew].profile_disabled = true;
                                                                    }
                                                                    else {
                                                                        unreadMessagesList[indexNew].profile_disabled = false;
                                                                        unreadMessagesList[indexNew].name = unread[0].first_name;
                                                                        unreadMessagesList[indexNew].profile_image = "https://moshmatch.com/apprich/public/uploads/profile/" + unread[0].photo;
                                                                        unreadMessagesList[indexNew].user_id = frdElm.friend_id;
                                                                    }
                                                                }

                                                                if ((unreadMessagesListLast.length - 1 == indexNew) || (unreadMessagesListLast.length - 1 == -1)) {

                                                                    // remove block frds logic...
                                                                    if (unreadMessagesList.length === 0) {
                                                                        cb(null, { user_id, counts: 0 })
                                                                    }
                                                                    // unreadMessagesListLast = unreadMessagesList;
                                                                    // var sql = 'SELECT * FROM blocked_users WHERE user_id = ? AND blocked_user_id = ? AND status = 1';
                                                                    // unreadMessagesList.forEach(async function (frdElm, indexLatest) {
                                                                    //     await connection.query(sql, [frdElm.friend_id, user_id], (error, blocked_list) => {
                                                                    //         if (error) {
                                                                    //             // console.log(frdElmNew.friend_id, user_id, "unreadcounts.... failure...")
                                                                    //         } else {
                                                                    //             if (!!unreadMessagesList[indexLatest]) {
                                                                    //                 if (blocked_list.length > 0) {
                                                                    //                     unreadMessagesList.splice(indexLatest, 1)
                                                                    //                     //unreadMessagesList[indexLatest].to_is_blocked = true;
                                                                    //                 }
                                                                    //                 else {
                                                                    //                     unreadMessagesList[indexLatest].to_is_blocked = false;
                                                                    //                 }
                                                                    //             }
                                                                    //             console.log(unreadMessagesListLast.length - 1, indexLatest, "happy...")
                                                                    //             if ((unreadMessagesListLast.length - 1 == indexLatest) || (unreadMessagesListLast.length - 1 == -1)) {
                                                                    //                 console.log(unreadMessagesList, "unreadMessagesList....");
                                                                    cb(null, { user_id, counts: unreadMessagesList.length })
                                                                    //             }
                                                                    //         }
                                                                    //     })
                                                                    // })
                                                                }
                                                            }
                                                        })
                                                    })
                                                }
                                            }
                                        })
                                    })
                                }
                            }
                        })
                    })
                }
            })
        }

    ], function (error, result) {
        //console.log(result);
        return callback(error, result);
    });
}



exports.deleteSenderChat = function (sender_id, receiver_id) {
    var sql = 'UPDATE `messages` SET `delete_permanent`=?, `delete_permanent_user`=? WHERE (`user_from_id`=' + sender_id + ' AND `user_to_id`=' + receiver_id + ' AND `delete_permanent`=0' + ') OR (`user_from_id`=' + receiver_id + ' AND `user_to_id`=' + sender_id + ' AND `delete_permanent`=0' + ')';
    connection.query(sql, [1, sender_id], (error, user) => {
        if (error) {
            cb({
                message: constants.ERROR_IN_EXECUTION_MSG,
                status: constants.ERROR_IN_EXECUTION_FLAG,
                response_data: {}
            });

        } else {
            console.log("deleteSenderChat called... success")
        }
    });
}

exports.deleteChatPermanent = function (sender_id, receiver_id) {
    var sql = 'DELETE FROM `messages` WHERE (`user_from_id`=' + sender_id + ' AND `user_to_id`=' + receiver_id + ' AND `delete_permanent`=1' + ' AND `delete_permanent_user`=' + receiver_id + ') OR (`user_from_id`=' + receiver_id + ' AND `user_to_id`=' + sender_id + ' AND `delete_permanent`=1' + ' AND `delete_permanent_user`=' + receiver_id + ')';
    connection.query(sql, (error, user) => {
        if (error) {
            cb({
                message: constants.ERROR_IN_EXECUTION_MSG,
                status: constants.ERROR_IN_EXECUTION_FLAG,
                response_data: {}
            });

        } else {
            console.log("deleteChatPermanent called... success")
        }
    });
}

exports.getRealTimeUsersList = function (callback) {
    async.waterfall([
        function (cb) {
            var sql = 'SELECT id from `users` WHERE `online_status` = 1';
            connection.query(sql, (error, users) => {
                if (error) {
                    cb({
                        message: constants.ERROR_IN_EXECUTION_MSG,
                        status: constants.ERROR_IN_EXECUTION_FLAG,
                        response_data: {}
                    });
                } else {
                    cb(null, users);
                }
            });
        }
    ], function (error, result) {
        //console.log(result);
        return callback(error, result);
    });
}


exports.sendMessage = function (data, callback) {
    var is_fake = data.is_fake;
    var reciever_id = data.reciever_id;
    var frds_acknowledged = data.frds_acknowledged;
    var message = data.message;
    var datetime = moment.utc().format('YYYY-MM-DD HH:mm:ss');

    var sender_id = data.sender_id;
    var messageStatus = data.messageStatus;
    var message_id = data.message_id;
    var read_status = !!messageStatus.online.read ? 1 : 0;
    var message_sent = !!messageStatus.offline ? 1 : 0;
    var message_not_seen = !!messageStatus.online.unread ? 1 : 0

    var ignore_user_from_id = data.ignore_user_from_id
    var ignore_user_to_id = data.ignore_user_to_id

    var dateTime_msg = data.created_at;

    // online: { read: false, unread: false},
    // offline: false 

    var frds_acknowledged, checkIfUserSend;
    async.waterfall([
        function (cb) {
            // checkIfUserSendMessage(sender_id, reciever_id, is_fake, frds_acknowledged, function (err, message_data) {
            //     if (err) {
            //         cb(null);
            //     }
            //     else {

                    let message_data = { message_list: [], emitMessage: true, frds_acknowledged: true }
                    console.log(message_data, "message_data..")
                    checkIfUserSend = message_data.emitMessage;
                    if (checkIfUserSend) {
                        frds_acknowledged = !!message_data.frds_acknowledged ? 1 : 0;
                        var sql = "INSERT INTO `messages` (`message_id`,`user_from_id`,`user_to_id`,`message`,`created_at`,`updated_at`, `message_is_read`, `message_is_sent`, `message_is_not_seen`, `ignore_user_from_id`, `ignore_user_to_id`) VALUES(?,?,?,?,?,?,?,?,?,?,?)";
                        var query = connection.query(sql, [message_id, sender_id, reciever_id, message, dateTime_msg, datetime, read_status, message_sent, message_not_seen, ignore_user_from_id, ignore_user_to_id], (error, user) => {
                            if (error) {
                                console.log(error);
                                cb({
                                    message: constants.ERROR_IN_EXECUTION_MSG,
                                    status: constants.ERROR_IN_EXECUTION_FLAG,
                                    response_data: {}
                                });
                            }
                            else {
                                cb(null, { success: true });
                            }
                        })
                    }
                    else {
                        cb(null, { success: true });
                    }
                // }
            // })
        },
        function (success, cb) {
            //console.log(user)
            var obj = {};
            if (checkIfUserSend) {
                obj['status'] = 200;
                obj['audio'] = null;
                obj['message'] = message;
                obj['user_from_id'] = sender_id;
                obj['user_to_id'] = reciever_id;
                obj['message_id'] = message_id;
                obj['delete'] = 0;
                obj['delete_message_user'] = null;
                obj['created_at'] = dateTime_msg;
                obj['updated_at'] = datetime;
                obj['is_acknowledge'] = checkIfUserSend;
                obj['frds_acknowledged'] = frds_acknowledged;
                obj['message_is_read'] = read_status;
                obj['message_is_sent'] = message_sent;
                obj['message_is_not_seen'] = message_not_seen;
                obj['ignore_user_from_id'] = ignore_user_from_id;
                obj['ignore_user_to_id'] = ignore_user_to_id;
                cb(null, { obj });
            }
            else {
                obj['user_from_id'] = sender_id;
                obj['user_to_id'] = reciever_id;
                obj['is_acknowledge'] = false;
                obj['frds_acknowledged'] = frds_acknowledged;
                cb(null, { obj });
            }
        }
    ], function (error, result) {
        return callback(error, result);
    });
}

exports.sendVoiceToSql = function (data, callback) {
    var is_fake = data.is_fake;
    var reciever_id = data.reciever_id;
    var session_id = data.sessionId;
    var datetime = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    var frds_acknowledged = data.frds_acknowledged;

    var sender_id = data.sender_id;
    var messageStatus = data.messageStatus;
    var message_id = data.message_id;

    var read_status = !!messageStatus.online.read ? 1 : 0;
    var message_sent = !!messageStatus.offline ? 1 : 0;
    var message_not_seen = !!messageStatus.online.unread ? 1 : 0

    var ignore_user_from_id = data.ignore_user_from_id
    var ignore_user_to_id = data.ignore_user_to_id

    var checkIfUserSend, frds_acknowledged, dateTime_msg = data.created_at;

    async.waterfall([
        function (cb) {
            // checkIfUserSendMessage(sender_id, reciever_id, is_fake, frds_acknowledged, function (err, message_data) {
            //     if (err) {
            //         cb(null);
            //     } else {
                let message_data = { message_list: [], emitMessage: true, frds_acknowledged: true }
                    checkIfUserSend = message_data.emitMessage;
                    if (checkIfUserSend) {
                        frds_acknowledged = !!message_data.frds_acknowledged ? 1 : 0;
                        var sql = 'INSERT INTO `messages` (`message_id`,`user_from_id`,`user_to_id`,`message`, `media`, `audio`, `created_at`,`updated_at`, `message_is_read`, `message_is_sent`, `message_is_not_seen`, `ignore_user_from_id`, `ignore_user_to_id`) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)'
                        var query = connection.query(sql, [message_id, sender_id, reciever_id, "", "", data.blob, dateTime_msg, datetime, read_status, message_sent, message_not_seen, ignore_user_from_id, ignore_user_to_id], (error, user) => {
                            if (error) {
                                console.log(error);
                                cb({
                                    message: constants.ERROR_IN_EXECUTION_MSG,
                                    status: constants.ERROR_IN_EXECUTION_FLAG,
                                    response_data: {}
                                });

                            } else {
                                cb(null, { success: true });
                            }
                        })
                    }
                    else {
                        cb(null, { success: true });
                    }
            //     }
            // })
        },
        function (success, cb) {
            //console.log(user)
            var obj = {};
            if (checkIfUserSend) {
                obj['status'] = 200;
                obj['audio'] = data.blob;
                obj['message'] = null;
                obj['user_from_id'] = sender_id;
                obj['user_to_id'] = reciever_id;
                obj['message_id'] = message_id;
                obj['delete'] = 0;
                obj['delete_message_user'] = null;
                obj['created_at'] = dateTime_msg;
                obj['updated_at'] = datetime;
                obj['is_acknowledge'] = checkIfUserSend;
                obj['frds_acknowledged'] = frds_acknowledged;
                obj['message_is_read'] = read_status;
                obj['message_is_sent'] = message_sent;
                obj['message_is_not_seen'] = message_not_seen;
                obj['ignore_user_from_id'] = ignore_user_from_id;
                obj['ignore_user_to_id'] = ignore_user_to_id;
                cb(null, { obj });
            }
            else {
                obj['user_from_id'] = sender_id;
                obj['user_to_id'] = reciever_id;
                obj['is_acknowledge'] = false;
                obj['frds_acknowledged'] = frds_acknowledged;
                cb(null, { obj });
            }
        }
    ], function (error, result) {
        return callback(error, result);
    })
}

exports.updateReadStatusMessages = function (sender_id, reciever_id, is_read, callback) {
    console.log("in there...... bro......")
    async.waterfall([
        function (cb) {
            var sql = `select * from messages_read_unread where user_from_id = ? and user_to_id = ?`;
            connection.query(sql, [sender_id, reciever_id], (error, users) => {
                if (error) {
                    cb({
                        message: constants.ERROR_IN_EXECUTION_MSG,
                        status: constants.ERROR_IN_EXECUTION_FLAG,
                        response_data: {}
                    });

                } else {

                    cb(null, users);
                }
            });
        },
        function (users, cb) {
            if (users.length === 0) {
                var sql = "insert messages_read_unread VALUES(null,?,?,?)";
                var query = connection.query(sql, [sender_id, reciever_id, is_read], (error, user) => {
                    if (error) {
                        console.log(error);
                        cb({
                            message: constants.ERROR_IN_EXECUTION_MSG,
                            status: constants.ERROR_IN_EXECUTION_FLAG,
                            response_data: {}
                        });

                    } else {
                        cb(null, true)
                    }
                })
            } else {
                var sql = "update messages_read_unread set `read` = ? where `user_from_id` = ? and `user_to_id` = ?";
                var query = connection.query(sql, [is_read, sender_id, reciever_id], (error, user) => {
                    if (error) {
                        console.log(error);
                        cb({
                            message: constants.ERROR_IN_EXECUTION_MSG,
                            status: constants.ERROR_IN_EXECUTION_FLAG,
                            response_data: {}
                        });

                    }
                    else {
                        cb(null, true)
                    }
                })
            }
        }
    ], function (error, result) {
        return callback(error, result);
    });
}

exports.updateIgnoreMessage = function (sender_id, reciever_id, callback) {
    async.waterfall([
        function (cb) {
            var sql = 'UPDATE `messages` SET `ignore_user_from_id`=0 WHERE `user_from_id`=' + sender_id + ' AND `user_to_id`=' + reciever_id + ' AND `ignore_user_from_id`=1';
            connection.query(sql, (error, users) => {
                if (error) {
                    cb({
                        message: constants.ERROR_IN_EXECUTION_MSG,
                        status: constants.ERROR_IN_EXECUTION_FLAG,
                        response_data: {}
                    });

                } else {

                    cb(null, { success: true });
                }
            });
        },
        function (status, cb) {
            var sql = 'UPDATE `messages` SET `ignore_user_to_id`=0 WHERE `user_from_id`=' + reciever_id + ' AND `user_to_id`=' + sender_id + ' AND `ignore_user_to_id`=1';
            var query = connection.query(sql, (error, user) => {
                if (error) {
                    console.log(error);
                    cb({
                        message: constants.ERROR_IN_EXECUTION_MSG,
                        status: constants.ERROR_IN_EXECUTION_FLAG,
                        response_data: {}
                    });

                } else {
                    cb(null, { success: true })
                }
            })
        }
    ], function (error, result) {
        return callback(error, result);
    });
}

exports.sendMyMessageStatus = function (data) {
    var sender_id = data.sender_id;
    var reciever_id = !!data.reciever_id ? data.reciever_id : null;

    console.log(data, "nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn")
    let messageStatus = {
        friend_id: sender_id,
        online: { read: !!reciever_id ? true : false, unread: !reciever_id ? true : false, reciever_id: reciever_id },
        offline: !reciever_id ? true : false
    }
    return messageStatus
}

exports.checkReceiverMessageStatus = function (data, callback) {
    console.log(data, "nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn")
    var sender_id = data.sender_id;
    var reciever_id = data.reciever_id;
    var session_id = data.sessionId;

    console.log(session_id, "llllllllllllllllllllllllllllllllllllllllllllllllllllllllll")
    let messageStatus = {
        friend_id: reciever_id,
        online: { read: false, unread: false, reciever_id: "" },
        offline: false
    }
    async.waterfall([
        function (cb) {
            var sql = `SELECT * FROM users WHERE id = ?`;
            connection.query(sql, [reciever_id], (error, user) => {
                if (error) {
                    cb({
                        message: constants.ERROR_IN_EXECUTION_MSG,
                        status: constants.ERROR_IN_EXECUTION_FLAG,
                        response_data: {}

                    });
                } else {
                    cb(null, user);
                }
            });
        },
        function (user, cb) {
            const is_frd_online = !!user[0] ? user[0].online_status : 0;
            if (is_frd_online) {
                var sql = "SELECT * from `messages_read_unread` WHERE `user_from_id` = ? AND `user_to_id` = ?";
                connection.query(sql, [sender_id, reciever_id], (error, details) => {
                    if (error) {
                        cb({
                            message: constants.ERROR_IN_EXECUTION_MSG,
                            status: constants.ERROR_IN_EXECUTION_FLAG,
                            response_data: {}
                        });
                    } else {
                        if (details.length > 0) {
                            // read
                            console.log("read.....")
                            messageStatus.online.read = !!details[0].read ? true : false
                            messageStatus.online.unread = !!details[0].read ? false : true
                            messageStatus.offline = false;

                            if (!!details[0].read) {
                                messageStatus.online.reciever_id = sender_id;
                            }
                        }
                        else {
                            // double tick
                            console.log("double tick.....")
                            messageStatus.online.read = false
                            messageStatus.online.unread = true
                            messageStatus.offline = false;
                        }
                        cb(null, messageStatus);
                    }
                });
            }
            else {
                // single tick
                messageStatus.online.read = false
                messageStatus.online.unread = false
                messageStatus.offline = true;
                cb(null, messageStatus);
            }
        }
    ], function (error, result) {
        return callback(error, result);
    })
}


