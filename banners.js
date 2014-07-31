var imgs1 = new Array("banners/banner1.jpg","banners/banner2.png");
var lnks1 = new Array("http://www.youtube.com","http://www.yahoo.com");
var alt1 = new Array("P1", "P2");
var currentAd1 = 0;
var imgCt1 = 2;
function BannerRotate() {
  if (currentAd1 == imgCt1) {
    currentAd1 = 0;
  }
var banner1 = document.getElementById('adBanner1');
var link1 = document.getElementById('adLink1');
  banner1.src=imgs1[currentAd1]
  banner1.alt=alt1[currentAd1]
  document.getElementById('adLink1').href=lnks1[currentAd1]
  currentAd1++;
}
  window.setInterval("BannerRotate()",5000);