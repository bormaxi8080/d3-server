jQuery(function() {
    var error, init_name, name, others_states, parse_state, states, success;

    success = function(data, textStatus, jqXHR) {
        if (data.status === "ok") {
            window.location.reload();
        } else {
            alert(data.error);
        }
        return jQuery("#loader").fadeOut();
    };
    error = function(jqXHR, textStatus, errorThrown) {
        alert("Ошибка: " + textStatus + ": " + errorThrown);
        return jQuery("#loader").fadeOut();
    };

    jQuery("#drop-dump").submit(function(){
        var currentForm = this;
        bootbox.confirm("Уверены что хотите сбросить состояние?", function(result) {
            if (result) {
                $.ajax({
                    url: '/game/reset-state',
                    method: 'post',
                    data: $(currentForm).serialize(),
                    dataType: "json",
                    success: function(data){
                    if (data.status === "ok") {
                        window.location.reload();
                    } else {
                        if (/Backup/.test(data.msg)){
                            jQuery("#loader").fadeOut();
                            return reset_without_backup(currentForm);
                        } else {
                            alert(data.msg);
                        }
                    }},
                    error: error
                })
            }
        });
        return false;
    })

     var reset_without_backup = function(form) {
        bootbox.confirm("Не получилось создать бэкап. Сбросить без бэкапа?", function(answer) {
            if (answer != true) {
                return false;
            }
            jQuery.ajax({
                url: '/game/reset-state',
                method: 'post',
                data: $(form).serialize() + '&without_backup=true',
                dataType: "json",
                success: success,
                error: error
            });
        });
    }

    jQuery("#get_dumps").click(function() {
        jQuery("#loader").fadeIn();
        return request = jQuery.ajax({
            url: "/dump/get.json",
            type: "post",
            data: {
                "to_social_id": 1111,
                "shard_id": "shard_0",
                "limit": 1
            },
            dataType: "json",
            success: success,
            error: error
        });
    });
});