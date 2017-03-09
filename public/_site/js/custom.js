
$("document").ready(function() {

  // ==============================
  // Sends email using formspree.io
  // ==============================
  $("#sendEmailSuccessAlert").hide();

  $(".send-email").submit(function(event) {

    event.preventDefault();
    $(this).find("[type=submit]").text('Enviando...').prop("disabled",true);
    var self = this;

    $.ajax({
      type: "POST",
      url: "https://formspree.io/bvodola@gmail.com",
      dataType: 'json',
      data: {
        name: $(this).find("[name=name]").val(),
        email: $(this).find("[name=email]").val(),
        message: $(this).find("[name=message]").val(),
        site: $(this).find("[name=site]").val()
      },
      success: function(){

        // Show Success Alert
        var alertHTML = '<div class="alert alert-success alert-dismissable fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><p>Mensagem Enviada com sucesso!</p></div>';
        $(alertHTML).hide().prependTo(self).fadeIn("slow");

        // Clean Form Fields
        $(self).find("[name=name]").val('');
        $(self).find("[name=email]").val('');
        $(self).find("[name=message]").val('');
        $(self).find("[name=site]").val('');

        // Resets the Submit Button back to its original form
        $(self).find("[type=submit]").text('Enviar Mensagem').prop("disabled",false);
      }
    });

  });

});
