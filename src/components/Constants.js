// require('dotenv').config();
//  console.log(process.env);

export const SITE_TITLE = 'Sight byData';
export const SITE_PREFIX = 'iassist_main_';
export const SITE_PREFIX_CLIENT = 'iassist_client_';
export const API_BASE_URL = process.env.REACT_APP_API_URL; //Prod
export const API_WEBSOCKET_URL = "wss://support-dev-api.bydata.com/sight/";
export const API_IASSIST_BASE_URL = "https://support-dev-api.bydata.com/sight/";
// export const LOADING_ICON = 'images/icon-loading.gif';
export const months = ["January", "Febraury", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
 export const jwt_token = `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NzE1MjU4NjEsIm5iZiI6MTY3MTUyNTg2MSwianRpIjoiZDVlOTg5NzEtMjlhZS00ZTExLTllMWUtMDBlNzE0ZjEyZmQ0IiwiZXhwIjoyNTM1NTI1ODYxLCJpZGVudGl0eSI6eyJpZCI6MjI2LCJ1c2VyX25hbWUiOiJ0aGFudmVlckBhc2NlbmRldW0uY29tIiwiY291bnRyeSI6bnVsbCwiZW1haWwiOiJ0aGFudmVlckBhc2NlbmRldW0uY29tIiwiZmlyc3RfbmFtZSI6IlRoYW52ZWVyIiwicGhvbmUiOm51bGwsIm1pZGRsZV9uYW1lIjpudWxsLCJsYXN0X25hbWUiOm51bGwsIm9yZ2FuaXphdGlvbl9pZCI6MSwicGFyZW50X29yZ2FuaXphdGlvbl9pZCI6MCwiYXR0cmlidXRlcyI6W3t9XSwicmV2X3NoYXJlX3BlcmNlbnRfbDIiOjEuMCwicnQiOiIzN1plRGp0RklmeHhlMkpkMW80UFNOTSIsIm9yZ2FuaXphdGlvbiI6IkFzY2VuZGV1bSIsInByaXZpbGVnZXMiOnsic2VsbHNpZGUiOlsiVklFV19JTkRFWCIsIkNVU1RPTV9SRVBPUlRTIiwiU0lHSFRfSE9NRSIsIkFOQUxZU0lTX0hPTUUiLCJESUNUSU9OQVJZIiwiVklFV19QRVJGT1JNQU5DRSIsIlZJRVdfV0VCQU5BTFlUSUNTIiwiVklFV19BRFNFUlZFUiIsIlZJRVdfQURWRVJUSVNFUiIsIlNBVkVfUElWT1RfVklFVyIsIkNIQU5HRV9QQVNTV09SRCIsIlVQREFURV9QUk9GSUxFIiwiQ1JFQVRFX1VTRVIiLCJUUkVORF9NQVNURVJfRURJVE9SIiwiREFUQV9HUklEX0VESVRPUiIsIlZJRVdfRVZFTlRTIiwiVklFV19URUxFTUVUUlkiLCJWSUVXX0NISUxEX09SRyIsIkRBVEFfU1RSRUFNIiwiU0FWRV9QSVZPVF9WSUVXX01ZT1JHIiwiQUNDT1VOVFNfUkVDRUlWQUJMRSIsIkRFTEVURV9VU0VSIiwiTU9ESUZZX1VTRVIiXX0sImNsaWVudHMiOlt7ImlkIjowLCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzkwMDAwIiwibmFtZSI6IkFzY2VuZGV1bSJ9LHsiaWQiOjEsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjOTAwNDUiLCJuYW1lIjoiQ3JhenlHYW1lcyJ9LHsiaWQiOjIsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjOTAxMDgiLCJuYW1lIjoiVHJhY2tlck5ldHdvcmsifSx7ImlkIjozLCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzkwMTg5IiwibmFtZSI6IlVQSSJ9LHsiaWQiOjQsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjOTAyODgiLCJuYW1lIjoiRW11UGFyYWRpc2UifSx7ImlkIjo2LCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzkwNTQwIiwibmFtZSI6IlN0YW5kczQifSx7ImlkIjo3LCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzkwNjkzIiwibmFtZSI6IkdhbWVQcmVzcyJ9LHsiaWQiOjksImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjOTEwNTMiLCJuYW1lIjoiQm9sZGUifSx7ImlkIjoxMCwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2M5MTI2MCIsIm5hbWUiOiJHcmVldGluZ3NJc2xhbmQifSx7ImlkIjoxMSwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2M5MTQ4NSIsIm5hbWUiOiIyNDdHYW1lcyJ9LHsiaWQiOjEyLCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzkxNzI4IiwibmFtZSI6IldlaGNvIn0seyJpZCI6MTMsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjOTE5ODkiLCJuYW1lIjoiS29yZWFib28ifSx7ImlkIjoxOCwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2M5MzU2NCIsIm5hbWUiOiJDZWxlYnNQdWxzZSJ9LHsiaWQiOjIwLCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzk0MzIwIiwibmFtZSI6IkVsZXBoYW50Sm91cm5hbCJ9LHsiaWQiOjIxLCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzk0NzI1IiwibmFtZSI6IkZpc2NhbE5vdGUifSx7ImlkIjoyMiwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2M5NTE0OCIsIm5hbWUiOiJUZW1wdGFsaWEifSx7ImlkIjoyMywiZGlzcGxheV9jbGllbnRfaWQiOiJhc2M5NTU4OSIsIm5hbWUiOiJXZUJsb2cifSx7ImlkIjoyNCwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2M5NjA0OCIsIm5hbWUiOiJUaGVDaGl2ZSJ9LHsiaWQiOjI1LCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzk2NTI1IiwibmFtZSI6Ikt1ZWV6In0seyJpZCI6MjYsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjOTcwMjAiLCJuYW1lIjoiVGhlTGF5b2ZmIn0seyJpZCI6MjcsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjOTc1MzMiLCJuYW1lIjoiVE5NYXJrZXRpbmcifSx7ImlkIjoyOCwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2M5ODA2NCIsIm5hbWUiOiJUaGVTb3VyY2UifSx7ImlkIjozMCwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2M5OTE4MCIsIm5hbWUiOiJRdWl6b255In0seyJpZCI6MzEsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjOTk3NjUiLCJuYW1lIjoiVGhlMTgifSx7ImlkIjozMiwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxMDAzNjgiLCJuYW1lIjoiTGFrZUxpbmsifSx7ImlkIjozNCwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxMDE2MjgiLCJuYW1lIjoiVm9sYXJlTm92ZWxzIn0seyJpZCI6MzUsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjMTAyMjg1IiwibmFtZSI6IlNjb3Jlc0luTGl2ZSJ9LHsiaWQiOjM3LCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzEwMzY1MyIsIm5hbWUiOiJFbnRodXNlZERpZ2l0YWwifSx7ImlkIjozOCwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxMDQzNjQiLCJuYW1lIjoiWW91bmdIb2xseXdvb2QifSx7ImlkIjozOSwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxMDUwOTMiLCJuYW1lIjoiTWFtYXNVbmN1dCJ9LHsiaWQiOjQyLCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzEwNzM4OCIsIm5hbWUiOiJQdWJPY2VhbiJ9LHsiaWQiOjQzLCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzEwODE4OSIsIm5hbWUiOiJTVlRQZXJmb3JtYW5jZSJ9LHsiaWQiOjQ0LCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzEwOTAwOCIsIm5hbWUiOiJUaGVEYWlseURvdCJ9LHsiaWQiOjQ1LCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzEwOTg0NSIsIm5hbWUiOiJFeGNlbEpldCJ9LHsiaWQiOjQ2LCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzExMDcwMCIsIm5hbWUiOiJGbGlja3IifSx7ImlkIjo0OCwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxMTI0NjQiLCJuYW1lIjoiUXppbmdvIn0seyJpZCI6NDksImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjMTEzMzczIiwibmFtZSI6IlZlcnN1cyJ9LHsiaWQiOjUwLCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzExNDMwMCIsIm5hbWUiOiJJbnF1aXJlcm5ldCJ9LHsiaWQiOjUxLCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzExNTI0NSIsIm5hbWUiOiJNZWRpYVBhcnRuZXJzIn0seyJpZCI6NTIsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjMTE2MjA4IiwibmFtZSI6IlF1aXpsZXQifSx7ImlkIjo1NCwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxMTgxODgiLCJuYW1lIjoiRWlnaHRpZXNLaWRzIn0seyJpZCI6NTUsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjMTE5MjA1IiwibmFtZSI6IkxvbGFEaWdpdGFsTWVkaWEifSx7ImlkIjo1NiwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxMjAyNDAiLCJuYW1lIjoiU2Nyb2xsaW4ifSx7ImlkIjo1NywiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxMjEyOTMiLCJuYW1lIjoiTGV0c1J1biJ9LHsiaWQiOjU4LCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzEyMjM2NCIsIm5hbWUiOiJJbWd1ciJ9LHsiaWQiOjU5LCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzEyMzQ1MyIsIm5hbWUiOiJKdW5nbGVDcmVhdGlvbnMifSx7ImlkIjo2MCwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxMjQ1NjAiLCJuYW1lIjoiUGlqcGVyUHVibGlzaGluZyJ9LHsiaWQiOjYxLCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzEyNTY4NSIsIm5hbWUiOiJEYWlseUhlcmFsZCJ9LHsiaWQiOjYyLCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzEyNjgyOCIsIm5hbWUiOiJDb250ZW50SVEifSx7ImlkIjo2MywiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxMjc5ODkiLCJuYW1lIjoiTWVldE1pbmRmdWwifSx7ImlkIjo2NCwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxMjkxNjgiLCJuYW1lIjoiVGVzdCA1In0seyJpZCI6NjUsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjMTMwMzY1IiwibmFtZSI6IkRlbW8ifSx7ImlkIjo2NiwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxMzE1ODAiLCJuYW1lIjoiQ2FsY3VsYXRvclNvdXAifSx7ImlkIjo2NywiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxMzI4MTMiLCJuYW1lIjoiVGhlR3JhZENhZmUifSx7ImlkIjo2OCwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxMzQwNjQiLCJuYW1lIjoiRGVjaWRvIn0seyJpZCI6NjksImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjMTM1MzMzIiwibmFtZSI6IlN0dWR5VG9uaWdodCJ9LHsiaWQiOjcwLCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzEzNjYyMCIsIm5hbWUiOiJHYXRlMkhvbWUifSx7ImlkIjo3MSwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxMzc5MjUiLCJuYW1lIjoiOUdBRyJ9LHsiaWQiOjczLCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzE0MDU4OSIsIm5hbWUiOiJNZWRTdHVkZW50c09ubGluZSJ9LHsiaWQiOjc0LCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzE0MTk0OCIsIm5hbWUiOiJIVE1lZGlhIn0seyJpZCI6NzUsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjMTQzMzI1IiwibmFtZSI6IkZyZWVjb252ZXJ0In0seyJpZCI6NzYsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjMTQ0NzIwIiwibmFtZSI6IlNjaG5hZXBwY2hlbmZ1Y2hzIn0seyJpZCI6NzcsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjMTQ2MTMzIiwibmFtZSI6Ik9CVjIifSx7ImlkIjo3OCwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxNDc1NjQiLCJuYW1lIjoiUGhvdG9DaXJjbGUifSx7ImlkIjo4MCwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxNTA0ODAiLCJuYW1lIjoiT2FyZXgifSx7ImlkIjo4MSwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxNTE5NjUiLCJuYW1lIjoiSmV0cHVuayJ9LHsiaWQiOjgyLCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzE1MzQ2OCIsIm5hbWUiOiJQbHVnc2hhcmUifSx7ImlkIjo4MywiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxNTQ5ODkiLCJuYW1lIjoiVHJhY2t5b3VyRGl2aWRlbmRzIn0seyJpZCI6ODQsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjMTU2NTI4IiwibmFtZSI6IlRlc3RDbGllbnQxIn0seyJpZCI6ODYsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjMTU5NjYwIiwibmFtZSI6IlRlc3RDbGllbnQyIn0seyJpZCI6ODcsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjMTYxMjUzIiwibmFtZSI6IlRlc3RDbGllbnQzIn0seyJpZCI6ODgsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjMTYyODY0IiwibmFtZSI6IlRlc3RDbGllbnQ0In0seyJpZCI6ODksImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjMTY0NDkzIiwibmFtZSI6IlRlc3RDbGllbnQ1In0seyJpZCI6OTAsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjMTY2MTQwIiwibmFtZSI6IlRlc3RDbGllbnQ2In0seyJpZCI6OTEsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjMTY3ODA1IiwibmFtZSI6IlRlc3RDbGllbnQ3In0seyJpZCI6OTIsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjMTY5NDg4IiwibmFtZSI6IlRlc3RDbGllbnQ4In1dLCJsMiI6MS4wLCJsYXN0X2ZldGNoZWRfY2xpZW50IjowfSwiZnJlc2giOmZhbHNlLCJ0eXBlIjoiYWNjZXNzIn0.Vd2FLPVZGDmNjBaXqvDJ96xPs-vgf8Z2Zw5b81T0AdI`;


/**************************
 * COMMON Devices Sizes
 */

 export const DevicesSizes = {
  'mobile': [
    {id: 1, name: 'iPhone 5/SE', size: '320*568', brand: 'apple'},
    {id: 2, name: 'iPhone 6/7/8', size: '375*667', brand: 'apple'},
    {id: 3, name: 'iPhone 6/7/8 Plus', size: '414*736', brand: 'apple'},
    {id: 4, name: 'iPhone X', size: '375*812', brand: 'apple'},
    {id: 4, name: 'iPhone 11/11 Pro Max', size: '414*896', brand: 'apple'},
    {id: 4, name: 'iPhone 11 Pro', size: '375*812', brand: 'apple'},
    {id: 4, name: 'iPhone 12/Pro', size: '390*844', brand: 'apple'},
    {id: 4, name: 'iPhone 12 Pro Max', size: '428*926', brand: 'apple'},
    {id: 4, name: 'iPhone 12/13 mini', size: '375*812', brand: 'apple'},
    {id: 4, name: 'iPhone 13/Pro', size: '390*844', brand: 'apple'},
    {id: 5, name: 'Samsung Galaxy S8+', size: '340*740', brand: 'samsung'},
    {id: 6, name: 'Samsung Galaxy S20 Ultra', size: '412*915', brand: 'samsung'},
  ],
  'tablet': [
    {id: 1, name: 'iPad Air', size: '820*1180', brand: 'apple'},
    {id: 2, name: 'iPad Mini', size: '768*1024', brand: 'apple'},
    {id: 3, name: 'iPad', size: '768*1024', brand: 'apple'},
    {id: 4, name: 'iPad Pro', size: '1024*1366', brand: 'apple'}
  ],
  'monitor':  [
    {id: 1, name: 'Super-eXtended Graphics Array (SXGA)', size: '1280*1024'},
    {id: 2, name: 'High Definition (HD)', size: '1366*768'},
    {id: 3, name: 'High Definition Plus (HD+)', size: '1600*900'},
    {id: 4, name: 'Full High Definition (FHD)', size: '1920*1080'},
    {id: 5, name: 'Wide Ultra Extended Graphics Array (WUXGA)', size: '1920*1200'},
    {id: 6, name: 'Quad High Definition (QHD)', size: '2560*1440'},
    {id: 7, name: 'Wide Quad High Definition (WQHD)', size: '3440*1440'},
    {id: 8, name: '4K or Ultra High Definition (UHD)', size: '3840*2160'},
  ],
  'laptop':  [
    {id: 1, name: 'MacBook Air 13-inch (2017)', size: '1440*900', brand: 'apple'},
    {id: 2, name: 'MacBook Air/Pro 13-inch (M1 chip, 2018/19/20)', size: '1440*900', resolution: '2560*1600', brand: 'apple'},
    {id: 3, name: 'MacBook Pro 14-inch (M1 Pro chip)', size: '1512*982', resolution: '3024*1964', brand: 'apple'},
    {id: 4, name: 'MacBook Pro 16-inch (M1 Pro chip)', size: '1728*1117', resolution: '3456*2234',  brand: 'apple'},
    {id: 5, name: 'Apple iMac 24-inch (M1 chip)', size: '2240*1260', resolution: '4480*2520', brand: 'apple'}
  ],
  'paper': [
    {id: 1, name: 'letter (4:3) - portrait', size: '900*1200' },
    {id: 2, name: 'letter (4:3) - landscape', size: '1200*900' },
    {id: 3, name: 'letter (16:9) - portrait', size: '768*1366' },
    {id: 4, name: 'letter (16:9) - landscape', size: '1366*768' },
  ]
}