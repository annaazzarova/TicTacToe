$( document ).ready(function() {
    mdc.autoInit();
    mdc.registerInputFocusHandler;


    $(".new-game").click(function () {
        var form = $(document.forms['new-game-form']);
        $.ajax({
            url: "/games/new",
            method: "POST",
            data: form.serialize(),
            success: function (data) {
                var gameToken = data['gameToken'];
                window.location.href = "/games/" + gameToken;
            }
        });
        return false;
    });

    $(document.forms['login-form']).on('submit', function () {
        var form = $(this);
        $('.error', form).html('');
        $.ajax({
            url: "/login",
            method: "POST",
            data: form.serialize(),
            statusCode: {
                200: function () {
                    form.html("Вы вошли в сайт").addClass('alert-success');
                    window.location.href = "/games";
                },
                403: function (jqXHR) {
                    var error = JSON.parse(jqXHR.responseText);
                    $('.error', form).html(error.message);
                }
            }
        });
        return false;
    });
});

function doStep(column, row, gameToken) {
    console.log(column, row);
    $.ajax({
        url: "/games/do_step",
        method: "POST",
        cache: false,
        data: {
            row: row,
            column: column,
            gameToken: gameToken
        },
        success: function (data) {
            //$("#game_field").html(JSON.stringify(data.field));
        }
    });
    return false;
}

function join(username, gameToken) {
    $.ajax({
        url: "/games/join",
        method: "POST",
        cache: false,
        data: {
            username: username,
            gameToken: gameToken
        },
        success: function (data) {
            $("#join").hide();
        }
    });
    return false;
}