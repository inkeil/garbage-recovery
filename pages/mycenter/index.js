//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canvasSize:{_w:0,_h:0},
    tubiaoColor:["#76777a","#a5300f","#318c80","#f2cf61","#2192bc","#b19c7d","#354b5e","#b27d49","#bfbfbf","#d95b5b","#7f5f52","#a6e582","#eeeeee"],
    tubiaoData:[],
    showauth:false,
    showPage:0
  },
  onLoad: function () {
    wx.hideShareMenu();
    let _gUI = app.getSeting(),
        _t = this;
    _gUI.then(res=>{
      app.login(_t,res);
    }).catch(res=>{
      app.$getuserErr(_t);
    });
  },
  onShow:function(ev){
    let _siteInfo = wx.getStorageSync('siteInfo');
    if(_siteInfo&&this.data.showauth){
      this.setData({
        showauth:false
      })
      this.signCall();
    }
    if(this.data.showPage>0){
      this.backPreFunc();
    }
    
    
  },
  signCall:function(){
    let _t = this;
    app.$request("user/profile/userInfo",{},"GET").then(_d=>{
      if(_d.code==1){
        let _user = _d.data.user , _tubiaodata = [];
        _user.level = _d.data.level;
        _user.vote = _d.data.vote;
        _user.vote_arr = [2,2,2,2,2];
        _user.service_count = _d.data.service_count;
        _user.income = _d.data.income;
        _user.employee_status = _d.data.employee_status;
        _user.employee_status_text = "";
        if(_d.data.employee_status==2){
          _user.employee_status_text = "等待审核";
        }else if(_d.data.employee_status==1){
          _user.employee_status_text = "申请成功";
        }
        for(let i=0;i<_user.vote;i++){
          if(i<=_user.vote){
            _user.vote_arr[i] = 1;
          }
        }

        for(let _i=0;_i<_d.data.achievement.length;_i++){
          _tubiaodata[_i] = {
            name:_d.data.achievement[_i].name,
            revenue:_d.data.achievement[_i].profit
          }
        }
        _t.setData({
          user:_d.data.user
        })
        _t.runTubiaoFunc(_tubiaodata);
      }
    }).catch(console.log);
    
    
  },
  runTubiaoFunc:function(_tubiaodata){
    let _win_w = wx.getSystemInfoSync().windowWidth,
        _size = {
          _w:parseInt(_win_w*0.88),
          _h:parseInt(_win_w*0.88*0.56)
        };
    _size._r = parseInt(_size._h*0.42);
    _size._x = parseInt(_size._h/2);
    _size._y = _size._x;
    _size.lineW = parseInt(_size._h*0.08);
    this.setData({
      canvasSize:_size,
      tubiaoData:_tubiaodata
    });
    this.drawTBFunc();
  },
  drawTBFunc:function(){
    let ctx = wx.createCanvasContext('chart'),
        _size = this.data.canvasSize,
        _sA = 0,
        _sum = 0,
        _eA = 1.5,
        _maxlen = this.data.tubiaoData.length>6?this.data.tubiaoData.length:6,
        _jg = this.data.tubiaoData.length>1?(0.2/_maxlen):0,
        _max = 2-_jg*this.data.tubiaoData.length;
    for(let i=0;i<this.data.tubiaoData.length;i++){
      _sum += this.data.tubiaoData[i].revenue;
    }
    for(let i=0;i<this.data.tubiaoData.length;i++){
      let _color = this.data.tubiaoColor[i%13];
      _sA = _eA+_jg;
      _eA = _sA+(this.data.tubiaoData[i].revenue/_sum)*_max;
      this.drawTbFunc(ctx,Math.PI*_sA,Math.PI*_eA,_color);
      this.drawTbTextFunc(ctx,i,_size,_color);
    }
    
    let _sumT = "¥"+_sum.toFixed(2),
        _ftl = (_sumT.length>5?_sumT.length:5),
        fT = parseInt((_size._r*3.3-_size.lineW)/_ftl);
    if(_sum==0){
      this.drawTbFunc(ctx,0,Math.PI*2,"#eeeeee");
      ctx.fillStyle = "#eeeeee";
    }else{
      ctx.fillStyle = "tomato";
    }
    ctx.font= "bold "+fT+"px Arial";
    ctx.textAlign="center";
    ctx.textBaseline="middle";
    ctx.fillText(_sumT,_size._x, _size._y);
    
    ctx.draw();
  },
  drawTbFunc:function(ctx,sa,ea,_color){
    ctx.beginPath();
    let _size = this.data.canvasSize;
    ctx.arc(_size._x, _size._y, _size._r,sa, ea);  // 坐标为90的圆，这里起始角度是0，结束角度是Math.PI*2
    ctx.lineWidth = _size.lineW;
    ctx.strokeStyle = _color;
    ctx.stroke();  // 这里用stroke画一个空心圆，想填充颜色的童鞋可以用fill方法
  },
  drawTbTextFunc:function(ctx,num,_size,_color){
    let _w = parseInt(_size._w*0.07),
        _h = parseInt(_size._h/24),
        _x = parseInt(_size._w*0.63),
        _y = parseInt(Math.floor(num)*(_size._h/13)+_h/2),
        _text = this.data.tubiaoData[num].name+" ¥"+this.data.tubiaoData[num].revenue;
    ctx.beginPath();
    ctx.fillStyle = _color;
    ctx.fillRect(_x,_y,_w,_h);

    ctx.stroke();


    let _fS = parseInt(_h*1.4),
        _fY = _y+_fS/2+parseInt(_size._h*0.01);
    ctx.font= _fS+"px Arial";
    ctx.fillStyle = "#666666";
    ctx.fillText(_text,_x+_w+_fS/2, _fY);
  },
  gotoWdye:function(ev){
    wx.navigateTo({
      url:"wdye/index"
    })
  },
  gotoYgsq:function(ev){
    let _state = ev.currentTarget.dataset.state;
    if(_state==1){
      wx.showToast({
        title: '已申请成功',
        icon: 'none',
        duration: 2000
      })
    }else if(_state==2){
      wx.showToast({
        title: '正在审核中',
        icon: 'none',
        duration: 2000
      })
    }else{
      wx.navigateTo({
        url:"ygsq/index?state="+_state
      })
    }
    
  },
  gotoJqhd:function(ev){
    wx.switchTab({
      url: '/pages/subject/index'
    })
  },
  gotoWddd:function(ev){
    wx.navigateTo({
      url:'wddd/index'
    })
  },
  gotoXtxxPage(ev){
    wx.navigateTo({
      url:"xtxx/index"
    })
  },
  gotoGrsz:function(ev){
    wx.navigateTo({
      url:'grsz/index?user_data='+this.data.user
    })
  },
  backPreFunc:function(){
    if (getCurrentPages().length != 0) {
        //刷新当前页面的数据
        getCurrentPages()[getCurrentPages().length - 1].onLoad();
    }
  }
})
