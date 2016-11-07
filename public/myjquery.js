var waitingAnnounce2 = $("<div class='announce well'> " +
    "<div class='divImage'>" +
    "<img class= 'loading' src='/images/ajax-loader.gif' alt='Be patient...' />" +
    "</div><div class='loadingmessage'>Connectando ... </div></div>");
$(document).ready(function(){
    
    $(".delete").on("click", function(){
        var userToDelete = $(this).attr('id');
        $("." + userToDelete).append(waitingAnnounce2);
        setLink("Deleting", userToDelete);
    });
    
    $(".register").on("click", function(){
        $(".newDev").hide();
        $('.devall').append(waitingAnnounce2);
        setLink("Register");
    });

    $(".deletereg").on("click", function () {
        var registerToDelete = $(this).parent().children(":first-child").text();
        $(this).parent().parent().after(waitingAnnounce2);
        setLink("DeleteR", registerToDelete.trim());
    });

    $(".acceptreg").on("click", function () {
        var registerToAccept = $(this).parent().children(":first-child").text();
        $(this).parent().parent().after(waitingAnnounce2);
        setLink("AcceptReg", registerToAccept.trim());
    });
    
});
function setLink() {
    var process = arguments[0];
    var nameToDelete = arguments[1];
    var namex = $(".hello").attr('id');
    $.ajax({
        type:'POST',
        url: '/setlink',
        data: {
            "name": namex, // who makes the request
            "status": "WaitingF",
            "process": process,//Register, Deleting or DeletingR
            "device": "Scanner-Digital-001",
            "id": parseInt(Random(1,100000))
        },
        success: function (databack) {
            $(".loadingmessage").text("Esperando coneccion del dispositivo");
            if(process == "Deleting" || process == "DeleteR" || process == "AcceptReg"){
                findConnection(6, databack.id, process, nameToDelete);
            }else if(process == "Register"){
                findConnection(6, databack.id, process);
            }else{
                alert("Not deleting nor Registering");
            }
        },
        error: function () {
            alert("error setlink");
        }
    });
}
function findConnection() {
    var n = arguments[0];
    var id = arguments[1];
    var process = arguments[2];
    //if(process == "Deleting") // uncommenting this could result in a bug with DeleteR or AcceptReg
        var nameToDelete = arguments[3];
    if(n === 0){
        removeMessage("Tiempo Fuera, Cancelando Solicitud");
        return;
    }
    $.ajax({
        type:'POST',
        url: '/getconnection',//this could become a parameter to make it a more general purpose function
        data: {
            "name": "just some random stuff",
            "id": id,
            "process": process,//and this too
        },
        success: function (data) {
            if(data.status === "waiting"){
                if(process == "Deleting" || process == "DeleteR" || process == "AcceptReg")
                    setTimeout(findConnection, 5000, n-1, id, process, nameToDelete);
                else if(process == "Register")
                    setTimeout(findConnection, 5000, n-1, id, process);
                else
                    alert("findconnection, not deleting nor registering");
            }else
            if (data.status === "Fingerprint"){
                if(process == "Deleting"){
                    DeleteUser(nameToDelete);
                }else if(process === "Register"){
                    RegisterUser();
                }else if(process === "DeleteR"){
                    DeleteRegister(nameToDelete);
                }else if(process === "AcceptReg"){
                    AcceptRegister(nameToDelete);
                }
            } else if(data.status === "IncorrectUser"){
                removeMessage("Identificacion de Huella Digital Fallida");
            }else if(data.status === "no link"){
                alert("no link");
                //if ever needed to do something when no link is found
            }else if(data.status === "notaccepted"){
                removeMessage("Tu huella necesita ser aceptada por un administrador");
            }

        },
        error: function () {
            alert("error findconnection");
        }
    });
}
function removeMessage(message){
    $(".loadingmessage").text(message);
    setTimeout(function () {
        waitingAnnounce2.remove();
    }, 2000);
}
function Random(min, max) {
    return Math.random() * (max - min) + min;
}
function DeleteRegister(nameToDelete) {
    $.ajax({
        type:'POST',
        url: '/deletereg',
        data: {"nameToDelete": nameToDelete},
        success: function () {
            removeMessage("Registro de usuario " + nameToDelete +
                " borrado exitosamente de la base de datos");
            setTimeout(function () {
                $("." + nameToDelete).remove();
            }, 2000);

        },
        error: function () {
            alert("error delete user");
        }
    });
}
function RegisterUser() {
    $.ajax({
        type:'POST',
        url: '/registeruser',
        data: {"process": "Register"},
        success: function () {
            removeMessage("Usuario Registrado exitosamente en la base de datos");
        },
        error: function () {
            alert("error register");
        }
    });
}
function DeleteUser(nameToDelete) {
    $.ajax({
        type:'POST',
        url: '/deleteuser',
        data: {"nameToDelete": nameToDelete},
        success: function () {
            removeMessage("Usuario " + nameToDelete + " borrado exitosamente de la base de datos");
            setTimeout(function () {
                $("." + nameToDelete).parent().remove();
            }, 2000);

        },
        error: function () {
            alert("error delete user");
        }
    });
}

function AcceptRegister(nameToRegister) {
    $.ajax({
        type:'POST',
        url: '/acceptregister',
        data: {"nameToAccept": nameToRegister},
        success: function () {
            removeMessage("Usuario " + nameToRegister + " aceptado");
            setTimeout(function () {
                $("." + nameToRegister).children(":first-child").children(":last-child").remove();
                $("." + nameToRegister).children(":first-child").children(":last-child").remove();
                $("." + nameToRegister).children(":first-child").append('<p class="deletereg btn btn-danger btn-xs pull-right">Eliminar Registro</p>');
            }, 2000);

        },
        error: function () {
            alert("error delete user");
        }
    });
}