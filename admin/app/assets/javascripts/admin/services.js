jQuery(function() {
    var error, success;

    success = function(data, textStatus, jqXHR) {
        if (data.status === "ok") {
            // window.location.reload();
        } else {
            alert(data.msg);
        }
        return jQuery("#loader").fadeOut();
    };

    error = function(jqXHR, textStatus, errorThrown) {
        alert("Ошибка: " + textStatus + ": " + errorThrown);
        return jQuery("#loader").fadeOut();
    };

    jQuery("#create-service").click(function(){
        jQuery(this).attr("disabled", "disabled");
        bootbox.confirm("Уверены что хотите сохранить новый сервис?", function(answer) {
            if (answer != true) {
                return false;
            }
            jQuery.ajax({
                url: "/services/save",
                type: "post",
                data: {
                    "services": JSON.stringify(editor.get()),
                    "level_to": jQuery("#level_to").val(),
                    "level_from": jQuery("#level_from").val(),
                    "activity_date_from": jQuery("#activity_date_from").val(),
                    "activity_date_to": jQuery("#activity_date_to").val(),
                    "registered_date_from": jQuery("#registered_date_from").val(),
                    "registered_date_to": jQuery("#registered_date_to").val(),
                    "push_message": jQuery("#push_message").val(),
                    "client_type": jQuery("#client_type").val()
                },
                dataType: "json",
                success: success,
                error: error
            });
        });
        return false;
    });
});