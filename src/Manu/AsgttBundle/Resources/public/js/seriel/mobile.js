$(function(){
    if( $(document).width() < 768 ){
        $(".navbar-nav .submenu li").click(function(){$(".navbar-collapse").removeClass("in")});
        $(".navbar-nav > li").click(function(){($(".submenu").css("visibility")=="hidden")?$(".submenu").css("visibility","visible"):$(".submenu").css("visibility","hidden")});
        $(".valid_panier").click(function(){$(".navbar-collapse").removeClass("in");$(document).scrollTop(0)});
        $(".paiement,.satisfait,.service_client,.livraison").css("padding",0);
    }
})