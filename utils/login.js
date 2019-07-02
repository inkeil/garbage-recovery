//获取应用实例
const rLogin = (data,_t,_res,_rej) => {
  let app = getApp(),
      _url = app.baseURL+'/wxapp/public/login',
      _siteInfo = wx.getStorageSync('siteInfo');
      // console.log(data);
      // if(_res){
      //   _res('success')
      // }

      let __times = new Date().getTime();
      if(_siteInfo&&__times<_siteInfo._times){
        _t.signCall&&_t.signCall();
        return;
      }
      const _data = {
        code:data.code,
        encrypted_data:data.user.encryptedData,
        iv:data.user.iv,
        raw_data:data.user.rawData,
        signature:data.user.signature
      }
      // 发起网络请求
      wx.request({
        url:_url,
        data: _data,
        method:'POST',
        success(res) {
          let _data = res.data;
          if(_data.code==1){
            _data.data._times = new Date().getTime() + 86400000;
            _data.data.wxuserinfo = data.user.userInfo;
            wx.setStorageSync('siteInfo', _data.data);
          }else{
            wx.removeStorageSync('siteInfo');
          }
          _t.signCall&&setTimeout(_t.signCall,200);
        }
      })
}
// 授权成功
const authSuccess = (_ev,_t,res,ret) => {
  let app = getApp();
  // console.log(_ev);
  _t.setData({
    userInfo: _ev.userInfo,
    showauth: false
  })
  rLogin({
    user:app.globalData.userInfo,
    code:app.globalData.$code
  },_t, res, ret);
}
// 授权失败
const authErr = (_t,ret) => {
  let app = getApp();
  app.globalData.userInfo = null;
  _t.setData({
    userInfo: null,
    showauth: true
  })
  wx.removeStorageSync('siteInfo');
  if(ret){
    ret("登录失败！没有授权");
  }
}
// 授权后登录
const _login = _t => {
  let app = getApp();
  wx.login({
    success(res){
      const _code = res.code;
      if(_code){
        app.globalData.$code = _code;
        authSuccess(app.globalData.userInfo,_t);
      }else{
        authErr(_t);
      }
    }
  })
}

const $gUI = (_t) => {
  let app = getApp();
  _t.getUserInfo = ev => {
    if(ev.detail.userInfo){
      app.globalData.userInfo = ev.detail;
      _login(_t);
    }else{
      authErr(_t);
    }
  };
}




module.exports = {
  $login:_login,
  $gUI:$gUI
}
