jQuery(document).ready(function(){

    var error, success;

    success = function(data, textStatus, jqXHR) {
        if (data.status === "ok") {
            window.location.reload();
        } else {
            alert(data.msg);
        }
        return jQuery("#loader").fadeOut();
    };

    error = function(jqXHR, textStatus, errorThrown) {
        alert("Ошибка: " + textStatus + ": " + errorThrown);
        return jQuery("#loader").fadeOut();
    };

    jQuery("#show-editor-help").click(function(){
        jQuery("#editor-help").toggle();
        return false;
    })

    jQuery("#show_backup").click(function(){
        jQuery("#backup_list").toggle();
        return false;
    })

    jQuery(".restore_backup").click(function(){
        var data = jQuery(this).data();
        var id = data.id;
        if (!id) {
            alert('Error! ID backup not found')
            return false;
        }

         bootbox.confirm("Уверены что хотите перезаписать дамп пользователя?", function(answer) {
            if (answer != true) {
                return false;
            }
            jQuery.ajax({
                url: "/dump/load_backup",
                type: "post",
                data: {
                    "id": id,
                },
                dataType: "json",
                success: success,
                error: error
            });
        });

        return false;
    })

    jQuery("#set-dump").click(function() {
        bootbox.dialog('<textarea id="dump_data" style="width: 510px; height: 150px" placeholder="Paste dump here..."></textarea>',
            [{
                'label': 'Cancel'
            },
            {
                'label': 'Set',
                'class': 'btn-primary',
                'callback': function() {
                    var dump = $('#dump_data').val();

                    try {
                        dump = jQuery.parseJSON(dump);
                    } catch(err) {
                        alert("Can't parse JSON. " + err);
                        return;
                    }
                    editor = new jsoneditor.JSONEditor(container, options, dump);
                }
            }]);
        // END bootbox.dialog
    });

    jQuery("#save-dump").click(function(){
        bootbox.confirm("Уверены что хотите перезаписать дамп пользователя?", function(answer) {
            if (answer != true) {
                return false;
            }
            jQuery("#loader").fadeIn();
            jQuery.ajax({
                url: "/game/save-state",
                type: "post",
                data: {
                    "state": JSON.stringify(editor.get()),
                    "simple": getParameterByName('simple') ? 1 : 0,
                    "group": getParameterByName('group') ? 1 : 0
                },
                dataType: "json",
                success: function(data){
                    if (data.status === "ok") {
                        window.location.reload();
                    } else {
                        if (/Backup/.test(data.msg)){
                            jQuery("#loader").fadeOut();
                            return save_dump_without_backup();
                        } else {
                            alert(data.msg)
                        }
                    }
                    return jQuery("#loader").fadeOut();
                },
                error: error,
            });
        });
    });

    var save_dump_without_backup = function() {
        bootbox.confirm("Не получилось создать бэкап. Сохранить дамп без бэкапа?", function(answer) {
            if (answer != true) {
                return false;
            }
            jQuery("#loader").fadeIn();
            jQuery.ajax({
                url: "/game/save-state",
                type: "post",
                data: {
                    "state": JSON.stringify(editor.get()),
                    "simple": getParameterByName('simple') ? 1 : 0,
                    "group": getParameterByName('group') ? 1 : 0,
                    "without_backup": true
                },
                dataType: "json",
                success: success,
                error: error
            });
        });
    }


      var clone_without_backup = function(current_form) {
        bootbox.confirm("Не получилось создать бэкап. Сохранить дамп без бэкапа?", function(answer) {
            if (answer != true) {
                return false;
            }
            jQuery("#loader").fadeIn();
            jQuery.ajax({
               url: "/dump/apply",
                type: "post",
                data: $(current_form).serialize() + '&without_backup=true',
                dataType: "json",
                success: success,
                error: error
            });
        });
    }

    jQuery("#clone-dump.btn").click(function() {
        window.location = "/dump/clone";
    });

    jQuery("form#clone-dump").submit(function(){
        var current_form = this;

        bootbox.confirm("Уверены что хотите перезаписать дамп пользователя?", function(answer) {
            if (answer != true) {
                return false;
            }
            jQuery("#loader").fadeIn();
            jQuery.ajax({
                url: "/dump/apply",
                type: "post",
                data: $(current_form).serialize(),
                dataType: "json",
                success: function(data){
                    if (data.status === "ok") {
                        window.location.reload();
                    } else {
                        if (/Backup/.test(data.msg)) {
                            jQuery("#loader").fadeOut();
                            return clone_without_backup(current_form);
                        } else {
                            alert(data.msg);
                        }
                    }
                    return jQuery("#loader").fadeOut();
                },
                error: error,
            });
        });
        return false;
    })

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
});
