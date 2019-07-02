//index.js
//获取应用实例
const app = getApp()
// 引用自定义地址选择
import { selectarea , getAreaText } from '../../../utils/selectArea';

Page({
  data: {
    shState:1,
    ygsq_data:{
      area:[],
      area_text:"",
      name:"",
      phone:"",
      address:"",
      zd_id:null,
      zd_name:"",
      zd_detail:""
    },
    zd_data:[],
    zdarray:[],
    objectZdarray:[],
    zdindex:0
  },
  onLoad: function (ev) {
    let _t = this;
    this.setData({
      shState:ev.state
    })
    let runSiteData = ()=>{
      app.$request("area/lists/site").then(_d=>{
        if(_d.code==1){
          let _zdZhuanhuan = _t.zdZhuanhuan(_d.data.list);
          // console.log(_zdZhuanhuan);
          this.setData({
            zd_data:_d.data.list,
            zdarray:_zdZhuanhuan[0],
            objectZdarray:_zdZhuanhuan[1]
          })
        }
      }).catch(console.log);
    }
    app.$getArea().then(_d=>{
      selectarea(this,app,'lf');
      runSiteData();
    });
    
  },
  onShow:function(){
    // user/employee/employee_reg
  },
  zdZhuanhuan:function(arr){
    let _arr = [],
        o_arr = [];
    for(let i=0;i<arr.length;i++){
      _arr[i] = arr[i].name;
      o_arr[i] = {
        id:arr[i].id,
        name:arr[i].name,
        address:arr[i].address
      };
    }
    return [_arr,o_arr];
  },
  bindSelectZDFunc:function(ev){
    let _index = ev.detail.value,
        ygsq_data = this.data.ygsq_data,
        cur = this.data.objectZdarray[_index];
    ygsq_data.zd_detail = cur.address
    ygsq_data.zd_id = cur.id
    ygsq_data.zd_name = cur.name;
    this.setData({
      zdindex:_index,
      ygsq_data:ygsq_data
    })
  },
  submitAddress:function(ev){
    let s_data = this.data.ygsq_data,
        reg = /^[0-9a-zA-Z]+$/,
        _rqData = {
          username:s_data.name,
          mobile:s_data.phone,
          province_id:s_data.area[0]||null,
          city_id:s_data.area[1]||null,
          area_id:s_data.area[2]||null,
          site_id:s_data.zd_id,
          address:s_data.address,
          address_text:s_data.area_text,
          user_login:s_data.user_login,
          user_pass:s_data.user_pass
        },
        isuserlogin = reg.test(s_data.user_login);
    if(_rqData.username==""){
      this.toastShow("请填写称呼");
    }else if(_rqData.mobile==""){
      this.toastShow("请填写联系电话");
    }else if(!_rqData.province_id||!_rqData.city_id||!_rqData.area_id){
      this.toastShow("请选择所在地区");
    }else if(_rqData.address==""){
      this.toastShow("请填写详细地址");
    }else if(!_rqData.site_id){
      this.toastShow("请选择站点");
    }else if(!_rqData.user_login||_rqData.user_login==""){
      this.toastShow("请填写登录用户名");
    }else if(!isuserlogin){
      this.toastShow("登录用户名必须为字母或数字");
    }else if(!_rqData.user_pass||_rqData.user_pass==""){
      this.toastShow("请填写登录密码");
    }else{
      // console.log(_rqData);return;
      app.$request("user/employee/employee_reg",_rqData).then(_d=>{
        if(_d.code==1){
          this.toastShow(_d.msg,'success');
          setTimeout(()=>{
            wx.switchTab({
              url: '/pages/mycenter/index'
            })
          },1500)
          
        }else{
          this.toastShow(_d.msg);
        }
      }).catch(console.log);
    }
    // user/employee/employee_reg

  },
  addressDetailedBindInput:function(ev){
    // console.log(ev.detail.value);
    let ygsq_data = this.data.ygsq_data;
    ygsq_data.address = ev.detail.value;
    this.setData({
      ygsq_data:ygsq_data
    })
  },
  phoneBindInput:function(ev){
    // console.log(ev.detail.value);
    let ygsq_data = this.data.ygsq_data;
    ygsq_data.phone = parseInt(ev.detail.value);
    if(isNaN(ygsq_data.phone)){
      ygsq_data.phone = "";
    }
    this.setData({
      ygsq_data:ygsq_data
    })
  },
  contactBindInput:function(ev){
    // console.log(ev.detail.value);
    let ygsq_data = this.data.ygsq_data;
    ygsq_data.name = ev.detail.value;
    this.setData({
      ygsq_data:ygsq_data
    })
  },
  userLoginBindInput(ev){
    let ygsq_data = this.data.ygsq_data;
    ygsq_data.user_login = ev.detail.value;
    this.setData({
      ygsq_data:ygsq_data
    })
  },
  userPasswordBindInput(ev){
    let ygsq_data = this.data.ygsq_data;
    ygsq_data.user_pass = ev.detail.value;
    this.setData({
      ygsq_data:ygsq_data
    })
  },
  onRegionChange:function(_arr){
    let _ead = this.data.ygsq_data,
        _allText = "";
    for(let i=0;i<_arr.length;i++){
      _ead.area[i] = _arr[i].id;
      _allText += _arr[i].name;
    }
    _ead.area_text = _allText;
    this.setData({
      ygsq_data:_ead
    })
  },
  toastShow:function(text,_icon){
    wx.showToast({
      title: text,
      icon: _icon||"none",
      duration: 2000
    })
  }
})








