//app.js
import { $login , $gUI } from 'utils/login';
App({
  onLaunch: function () {
    this.$getArea().then(console.log);
  },
  $getArea:function(){
    let _t = this;
    const _getArr = _d => {
      let _arr = [];
      for(let _k in _d){
        _arr.push({
          id:_d[_k].area_id,
          name:_d[_k].area_name
        });
      }
      return _arr;
    }
    return new Promise( (resolve,reject) => {
      let _area = wx.getStorageSync('areaData');
      if(_area){
        resolve(_area);
      }else{
        this.$request("area/lists/tree",{},"GET").then(_d => {
          if(_d.code==1){
            let lfs = [],
                _l = _d.data.list["217"],
                __l = _l.children["316"].children;
              lfs[0] = [{
                id:_l.area_id,
                name:_l.area_name
              }];
              lfs[1] = {
                217:[{
                  id:_l.children["316"].area_id,
                  name:_l.children["316"].area_name
                }]
              };
              lfs[2] = {
                316:_getArr(__l)
              };
              let _all = [
                _getArr(_d.data.list),{},{}
              ];
              for(let _key in _d.data.list){
                let _shi = _d.data.list[_key].children;
                if(_shi){
                  _all[1][_key] = _getArr(_shi);
                  for(let _ak in _shi){
                    let _area = _shi[_ak].children;
                    if(_area){
                      _all[2][_ak] = _getArr(_area);
                    }
                  }
                }
              }
              let _areaData = {lf:lfs,all:_all}
              wx.setStorageSync('areaData',_areaData);
              resolve(_areaData);
          }else{
            wx.removeStorageSync('areaData');
            reject('error');
          }
        }).catch(()=>{
          wx.removeStorageSync('areaData');
          reject('error');
        });
      }
    } );
  },
  $getUserInfo:function(resolve,reject){
    let _siteInfo = wx.getStorageSync('siteInfo'),
        __times = new Date().getTime();
    if(_siteInfo&&__times<_siteInfo._times){
      resolve("no_login");
    }else{
      wx.removeStorageSync('siteInfo');
      // 获取用户信息
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
            wx.getUserInfo({
              success: res => {
                // 可以将 res 发送给后台解码出 unionId
                this.globalData.userInfo = res
                // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                // 所以此处加入 callback 以防止这种情况
                resolve(res);
              },
              fail:res => {
                reject(res);
              }
            })
          }else{
            reject('err');
          }
        }
      })
    }
  },
  getSeting:function(){
    let that = this;
    return new Promise(that.$getUserInfo);
  },
  $getuserErr:function(_t){
    this.globalData.userInfo = null;
    _t.setData({
      userInfo: null,
      showauth: true,
      showPage:1
    })
    $gUI(_t);
  },
  login:function(_t,res){
    _t.setData({
      showPage:1
    })
    if(res=="no_login"){
      this.globalData.userInfo = wx.getStorageSync('siteInfo').wxuserinfo;
      _t.setData({
        userInfo: wx.getStorageSync('siteInfo').wxuserinfo,
        showauth: false
      });
      _t.signCall&&_t.signCall();
      return;
    }
    $login(_t);
  },
  $request:function(_url,_data,method){
    let _t = this,
        _method = method||"POST";
    return new Promise((_res,_rej)=>{
      let _siteInfo = wx.getStorageSync('siteInfo');
      if(!_siteInfo&&method=="POST"){
        _rej({code:10001,msg:"登录失败，请重新登录"});
        return;
      }
      let _header = {
            'XX-Api-Version':1.0,
            'XX-Token':_siteInfo.token,
            'XX-Device-Type':'wxapp'
          };
      wx.request({
        url:_t.baseURL+_url,
        data: _data||'',
        method:_method,
        header:_header,
        success(res) {
          let _data = res.data;
          _res(_data);
        },
        fail(res){
          _rej(res);
        }
      })
    })
  },
  globalData: {
    userInfo: null,
    orderDetail:null
  },
  baseURL:"http://www.code7z.com/"
})