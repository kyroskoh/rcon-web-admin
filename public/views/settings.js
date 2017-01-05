"use strict";
View.register("settings", function (messageData) {
    var downloadFile = (function () {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        return function (data, fileName) {
            var blob = new Blob([data], {type: "octet/stream"}),
                url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(url);
        };
    }());


    var showRawServerLogs = function () {
        Socket.send("view", {
            "view": "settings",
            "action": "logfiles"
        }, function (messageData) {
            var el = $('<div>');
            var files = messageData.files || [];
            files.sort(function (a, b) {
                if (new Date(a.time) > new Date(b.time)) {
                    return -1;
                } else {
                    return 1;
                }
            });
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                el.append(
                    '<div data-id="' + file.file + '">' +
                    '<div class="btn btn-info download btn-sm">' +
                    'Log ' + file.file + ' ' + (file.size / 1024 / 1024).toFixed(3) + 'MB (Last modified: ' + new Date(file.time).toLocaleString() + ')' +
                    '</div>' +
                    '</div>'
                );
            }
            el.on("click", ".btn.download", function () {
                var id = $(this).parent().attr("data-id");
                Socket.send("view", {
                    "view": "settings",
                    "action": "download",
                    "file": id
                }, function (messageData) {
                    downloadFile(messageData.content, id);
                });
            });
            Modal.alert(el);
        });
    };

    var btn = $(".btn.update");
    btn.on("click", function () {
        Modal.confirm(t("settings.confirm"), function (success) {
            if (success) {
                spinner($(".settings"));
                Socket.send("view", {
                    "view": "settings",
                    "action": "update"
                }, function () {
                    $(".settings").find(".spinner").remove();
                    note(t("settings.update.done"), "success");
                });
            }
        });
    });
    btn = $(".btn.download");
    btn.on("click", function () {
        showRawServerLogs();
    });
});