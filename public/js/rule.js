function install() {
  if (typeof Android !== 'undefined') {
      Android.installRule(JSON.stringify(Rulepedia.Util.getBackRule(rule)));
  } else {
      var url = Rulepedia.Util.getShortenedURL(window.location.href);

      $("#qr-code").empty();
      var qrcode = new QRCode("qr-code");
      qrcode.makeCode(url);

      var link = document.createElement("a");
      link.href = url;
      link.innerHTML = url;
      $("#newURL").appendChild(link);
  }
}