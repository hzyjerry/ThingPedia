function install() {
  var url = Rulepedia.Util.getShortenedURL(window.location.href);
  if (typeof Android !== 'undefined') {
    Android.installRule(JSON.stringify(Rulepedia.Util.getBackRule(url)));
  } else {
    $("#qr-code").empty();
    var qrcode = new QRCode("qr-code");
    qrcode.makeCode(url);
  }
}