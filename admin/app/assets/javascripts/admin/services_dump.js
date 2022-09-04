jQuery(document).ready(function(){

    var error, success;

    var prepare_error_text = function(err_obj) {
        var is_first = true;
        var body  = '<li>';

        if (err_obj.service_name) {
            body += 'Service ' + err_obj.service_name + '. ';
            is_first = false;
        }

        if (err_obj.service_id) {
            body += 'ID: ' + err_obj.service_id + '. ';
            is_first = false;
        }

        if (err_obj.service_data) {
            if (!is_first) body += '<br>';
            is_first = false;
            body += 'Service data: '

            if (typeof(err_obj.service_data) == 'object') {
                body += JSON.stringify(err_obj.service_data) + '. ';
            } else{
                body += err_obj.service_data + '. ';
            }
        }

        if (err_obj.error) {
            if (!is_first) body += '<br>';
            is_first = false;
            body += 'Error data: ';

            if (typeof(err_obj.error) == 'object') {
                body += JSON.stringify(err_obj.error);
            } else{
                body += err_obj.error;
            }
        }

        body += '</li>';

        return body;
    };

    success = function(data, textStatus, jqXHR) {
        var message = '';
        var i;

        message += '<h3>Result</h3>';
        if (data.status === 'ok') {
            message += 'Data saved success.<br/>';
        } else {
            message += 'Data was <b style="color: red">NOT</b> save. See errors below.<br/>';
        }

        if (data.warns && data.warns.length) {
            message += '<h3>Warnings</h3>';
            message += '<ul>';
            for (i = 0; i < data.warns.length; i++) {
                message += prepare_error_text(data.warns[i]);
            }
            message += '</ul>';
        }

        if (data.errors && data.errors.length) {
            message += '<h3>Errors</h3>';
            message += '<ul>';
            for (i = 0; i < data.errors.length; i++) {
                message += prepare_error_text(data.errors[i]);
            }
            message += '</ul>';
        }

        // Показываем информацию.
        // Если сохранение прошло успешно, то перегружаем страницу.
        bootbox.alert(message, function() {
            if (data.status === "ok") {
                window.location.reload();
            }
        });

        return jQuery("#loader").fadeOut();
    };

    error = function(jqXHR, textStatus, errorThrown) {
        alert("Ошибка: " + textStatus + ": " + errorThrown);
        return jQuery("#loader").fadeOut();
    };

    jQuery("#set-services-dump").click(function(){
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

    jQuery("#save-services-dump").click(function(){
        bootbox.confirm("Уверены что хотите перезаписать дамп пользователя?", function(answer) {
            if (answer != true) {
                return false;
            }
            jQuery("#loader").fadeIn();
            jQuery.ajax({
                url: "/services/save_dump",
                type: "post",
                data: {
                    "state": JSON.stringify(editor.get())
                },
                dataType: "json",
                success: success,
                error: error
            });
        });
    });

    jQuery("#services-help").click(function() {
        var message = $('#services_info').html();
        bootbox.alert(message, function() {});
    });
});