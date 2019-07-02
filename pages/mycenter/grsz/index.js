//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    showEditMobile:false,
    editMobileNumb:"",
    onloadStatus:false
  },
  onLoad: function (ev) {
    wx.hideShareMenu();
    let _t = this;
    app.$request("user/profile/userInfo",{},"GET").then(_d=>{
      // console.log(_d);
      if(_d.code==1){
        let _st = "男";
        if(_d.data.user.sex!=1){
          _st = "女";
        }
        _t.setData({
          user:_d.data.user,
          sex:_st,
          editMobileNumb:_d.data.user.mobile
        })
      }
    }).catch(console.log);
  },
  onShow:function(){
    if(this.data.onloadStatus){
      this.backPreFunc();
    }else{
      this.setData({
        onloadStatus:true
      })
    }
  },
  editSexFun:function(ev){
    let _t = this,
        _arr = ['男', '女'];
    
    wx.showActionSheet({
      itemList: _arr,
      success(res) {
        _t.saveSexMobile(1,_arr[res.tapIndex]);
      }
    })
  },
  changeMobile:function(ev){
    if(ev.detail.value.length==11){
      this.data.editMobileNumb = ev.detail.value;
      
    }
    return;
  },
  gotoEditAddress:function(ev){
    wx.navigateTo({
      url:'../editaddress/index'
    })
  },
  editMobile:function(ev){
    this.setData({
      showEditMobile:true
    })
  },
  saveEditMobile:function(ev){
    let _phone = this.data.editMobileNumb;
    if(_phone==""){
      wx.showToast({
        title: '请输入手机号',
        icon: 'none',
        duration: 2000
      })
    }else if(isNaN(parseInt(_phone))){
      wx.showToast({
        title: '手机号码不正确',
        icon: 'none',
        duration: 2000
      })
    }else{
      this.saveSexMobile(2);
    }
    
  },
  cancelEditMobile:function(ev){
    this.setData({
      showEditMobile:false,
      editMobileNumb:this.data.user.mobile
    })
  },
  saveSexMobile:function(type,con){
    let _sex = this.data.user.sex,
        _mobile = this.data.user.mobile;
    if(type==1){
      if(con=="男"){
        _sex = 1;
      }else{
        _sex = 2;
      }
    }else if(type==2){
      _mobile = this.data.editMobileNumb;
    }
    if(_sex!=this.data.user.sex||_mobile!=this.data.user.mobile){
      app.$request("user/profile/userInfo",{sex:_sex,mobile:_mobile},"POST").then(_d=>{
        if(_d.code==1){
          this.data.user.mobile = _mobile;
          this.data.user.sex = _sex;
          let _con = _sex==1?"男":"女";
          this.setData({
            user:this.data.user,
            showEditMobile:false,
            editMobileNumb:this.data.user.mobile,
            sex:_con
          })
        }
      }).catch(console.log)
    }
  },
  backPreFunc:function(){
    if (getCurrentPages().length != 0) {
        //刷新当前页面的数据
        getCurrentPages()[getCurrentPages().length - 1].onLoad();
    }
  }
})
