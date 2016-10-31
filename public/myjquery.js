
$(document).ready(function(){
    //alert("Hello! I am an alert box!!");
    var y = 0;
    var cancelB = $('<p class="cancelB btn btn-danger btn-xs pull-right">Cancelar</p>');
    var waitingAnnounce = $("<div class='announce well'> " +
        "<div class='divImage'>" +
        "<img class= 'loading' src='/images/ajax-loader.gif' alt='Be patient...' />" +
        "</div><div class='loadingmessage'>Esperando una coneccion del dispositivo</div></div>");
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

    });
    cancelB.on("click", function(){
        waitingAnnounce.hide();
        cancelB.hide();
        //$(".cancelB").hide();
        $(".register").show();
        $(".newDev").show();
    });
});