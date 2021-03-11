function onPageLoad() {
  $.ajax({
    type: 'POST',
    url: '/api/Tool/FrontUrl',
    data: { },
    error: function(xhr, ajaxOptions, thrownError) { console.log("failure"); },
    success: function(response){
      response = JSON.parse(response);
      $("#UrlHtml").html(`<a href="${response.AppFrontUrl}">Lien vers l'application</a>`);
    }
  });
}