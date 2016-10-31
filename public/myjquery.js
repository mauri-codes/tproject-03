var cancelB = $('<p class="cancelB btn btn-danger btn-xs pull-right">Cancelar</p>');
var waitingAnnounce = $("<div class='announce well'> " +
    "<div class='divImage'>" +
    "<img class= 'loading' src='/images/ajax-loader.gif' alt='Be patient...' />" +
    "</div><div class='loadingmessage'>Connectando ... </div></div>");
$(document).ready(function(){
    //alert("Hello! I am an alert box!!");
    var y = 0;

    $(".register").on("click", function(){
        $(".newDev").hide();
        $(".register").hide();
        y = y + 1;
        if(y == 1){
            $('.devall').append(waitingAnnounce);
            $('.dev').append(cancelB);
        }else{
            cancelB.show();
            waitingAnnounce.show();
        }
        setLinkRegister();
    });
    cancelB.on("click", function(){
        removeMessage()
    });
});
function removeMessage(){
    waitingAnnounce.hide();
    cancelB.hide();
    //$(".cancelB").hide();
    $(".register").show();
    $(".newDev").show();
}
function setLinkRegister() {
    $(".loadingmessage").text("Esperando coneccion del dispositivo");
    var namex = $(".hello").attr('id');
    $.ajax({
        type:'POST',
        url: '/setlink',
        data: {
            "name": namex,
            "status": "WaitingF",
            "process": "Register",//register or deleting
            "device": "Scanner-Digital-001",
            "id": parseInt(Random(1,100000))
        },
        success: function (databack) {
            findConnectionR(6, databack.id);
        },
        error: function () {
            alert("error setlink");
        }
    });
}
function Random(min, max) {
    return Math.random() * (max - min) + min;
}
function findConnectionR(n, id) {
    if(n === 0){
        $(".loadingmessage").text("Time elapsed, canceling request");
        setTimeout(removeMessage, 2000);
        return;
    }
    $.ajax({
        type:'POST',
        url: '/getconnection',//this could become a parameter to make it a more general purpose function
        data: {
            "name": "just some random stuff",
            "id": id,
            "process": "Register",//and this too
        },
        success: function (data) {
            if(data.status === "waiting"){
                setTimeout(findConnectionR, 5000, n-1, id);
            }
            if (data.status === "Fingerprint"){
                //alert("hello world");
                RegisterUser();
                //ajaxDelete(nameToDelete);
            }
        },
        error: function () {
            alert("error setlink");
        }
    });
}

function RegisterUser() {
    $.ajax({
        type:'POST',
        url: '/registeruser',
        data: {"process": "Register"},
        success: function () {
            $(".loadingmessage").text("Usuario Registrado exitosamente en la base de datos");
            setTimeout(removeMessage, 2000);
            //sometimes I feel I shouldn't use setTimeout so heavily
        },
        error: function () {
            alert("error delete");
        }
    });
}