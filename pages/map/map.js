// map.js
//引入支持库
var map_lib = require("../../libs/amap-wx.js")
var lib_obj = new map_lib.AMapWX({ key: "4bcc0662072376eaa7a8ef9bcf16cf32" });
//系统信息
var screenWidth = wx.getSystemInfoSync().windowWidth;
var screenHeight = wx.getSystemInfoSync().windowHeight;
//图片信息
var icon_path = "/images/icon1.png"; //定位icon
var iconWidth = 36;
var iconHeight = iconWidth;

var search_path = "/images/search.png";  //搜索icon
var searchWidth = 36;
var searchHeight = searchWidth;

var seek_path = "/images/seek.png";   //地图中心icon
var seekWidth = 36;
var seekHeight = seekWidth;
var seek_switch = true;
var target_path = "/images/seek.png";  //搜索目标icon

var park_path = "/images/parking.png"; //停车场icon
var park_Width = "64";
var park_Height = park_Width;
var park2_path = "/images/parking2.png"; //停车场2icon
var park2_Width = "64";
var park2_Height = park_Width;
//地图信息
var map_obj = wx.createMapContext("m_map"); //map对象
var current_position = { //地图中心位置信息
  longitude: "113.26460666137694",
  latitude: "23.127012092237667"
};
var markers = []; //标记集合
var polyline = []; //路线绘制起始点
var points = []; //路线中途点

var init_info = {
  /**
   * 页面的初始数据
   */
  data: {
    current_position: current_position,
    controls: [{
      id: 0, //定位组件
      position: { left: 0, top: screenHeight - iconWidth * 2, width: iconWidth, height: iconHeight },
      iconPath: icon_path,
      clickable: true
    }, {
      id: 1, //搜索组件
      position: { left: iconWidth * 1 + 5, top: screenHeight - iconWidth * 2, width: searchWidth, height: searchWidth },
      iconPath: search_path,
      clickable: true
    }, {
      id: 2, //测试路线组件
      position: { left: (iconWidth + 5) * 2, top: screenHeight - iconWidth * 2, width: searchWidth, height: searchWidth },
      iconPath: search_path,
      clickable: true
    }, {
      id: 3, //测试请求组件
      position: { left: (iconWidth + 5) * 3, top: screenHeight - iconWidth * 2, width: searchWidth, height: searchWidth },
      iconPath: search_path,
      clickable: true
    }, {
      id: 4, //中心组件
      position: { left: (screenWidth - seekWidth) / 2, top: (screenHeight - seekHeight * 2) / 2, width: seekWidth, height: seekHeight },
      iconPath: seek_path,
      clickable: false
    }],
    markers: markers,
    polyline: polyline
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    wx.showLoading({
      title: '正在定位当前位置...',
    })
    wx.getLocation({
      type: "gcj02",
      success: function (res) {
        that.move_get_position();
        wx.hideLoading();
      },
      fail: function () {
        wx.hideLoading();
        wx.showToast({
          title: '当前位置信息获取失败！',
          image: "/images/warning.png"
        });
        that.move_get_position();
      }
    })

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * Map组件点击事件
   */
  controltap: function (e) {
    var that = this;
    if (e.controlId == 0) {
      //触发定位事件
      this.move_get_position();
      // this.switch_seek();
    } else if (e.controlId == 1) {
      //触发搜索事件
      wx.chooseLocation({
        success: function (res) {
          current_position.longitude = res.longitude;
          current_position.latitude = res.latitude;
          //移动到目标点
          that.setData({
            current_position: {
              longitude: res.longitude,
              latitude: res.latitude
            }
          });
          console.log(res)
        },
      })
    } else if (e.controlId == 2) {
      //触发路线规划事件
      var current = current_position;   //兼容bindtap和moveToLocation冒泡问题，当出起点现、终点都在一个点上，而且该点处于定位点时，就是这里的问题
      map_obj.moveToLocation();
      setTimeout(function () {  //解决动画效果问题,如果部分手机出现终点、起点都在一个点上，而且该点处于目标点时，就是这里的问题
        map_obj.getCenterLocation({
          success: function (res) {
            var origin = res.longitude + "," + res.latitude;
            var destination = current.longitude + "," + current.latitude;
            that.draw_map(origin, destination);
          }
        })
      }, 1000)
    } else if (e.controlId == 3) {
      //触发网络请求事件
      that.parkings();
    }

  },
  /**
   * 移动地图事件处理
   */
  map_change: function (e) {
    if (e.type == "end") {
      map_obj.getCenterLocation({
        success: function (res) {
          //地图中心的经度
          console.log(res.longitude)
          //地图中心的维度
          console.log(res.latitude)
          current_position.longitude = res.longitude
          current_position.latitude = res.latitude
          wx.showToast({
            title: '移动了地图',
          })
        }
      });
    }
  },
  /**
   * 移动并获取当前位置信息函数
   * 
   */
  move_get_position: function () {
    map_obj.getCenterLocation({
      success: function (res) {
        map_obj.moveToLocation();
        //获取当前位置的经度
        current_position.longitude = res.longitude;
        //获取当前位置的维度
        current_position.latitude = res.latitude;
      }
    });
  },
  /**
   * 开关地图中心指针函数
   */
  switch_seek: function () {
    if (seek_switch) {
      this.setData({
        //controls...
      });
    } else {
      this.setData({
        //controls...
      });
    }
    //改变标示
    seek_switch = !seek_switch
  },
  /**
   * 反编码位置信息
   */
  showAddr: function () {
    //调用高德地图API获取反编码信息
    lib_obj.getRegeo({
      location: current_position.longitude + "," + current_position.latitude,
      success: function (res) {
        console.log(res);
      }
    });
  },
  /**
   * 根据目标数据地址绘制路线
   * @param origin 当前位置的经纬度信息字符串 格式："经度,维度"
   * @param destination 目标位置的经纬度信息字符串 格式："经度,维度"
   */
  draw_map: function (origin, destination) {
    var that = this;
    lib_obj.getDrivingRoute({
      origin: origin,
      destination: destination,
      success: function (data) {
        //返回数据处理
        points = [];
        if (data.paths && data.paths[0] && data.paths[0].steps) {
          var steps = data.paths[0].steps;
          for (var i = 0; i < steps.length; i++) {
            var poLen = steps[i].polyline.split(';');
            for (var j = 0; j < poLen.length; j++) {
              points.push({
                longitude: parseFloat(poLen[j].split(',')[0]),
                latitude: parseFloat(poLen[j].split(',')[1])
              })
            }
          }
        }

        //标志起点、终点
        that.draw_spot(this.origin, this.destination);
        //渲染路线
        that.setData({
          polyline: [{
            points: points,
            color: "#0091ff",
            width: 6
          }],
          markers: markers
        });
        points = polyline = markers = null;
        that.switch_seek();
        console.log(data);
      }
    });
  },
  /**
   * 绘制路线规划中的起点、终点
   * @param target 起点坐标信息字符串 格式："经度,维度"
   * @param target 终点坐标信息字符串 格式："经度,维度"
   */
  draw_spot: function (start, target) {
    var location = start.split(",");
    var target_info = target.split(",");
    markers = [{
      //标注起点
      id: -1,
      longitude: location[0],
      latitude: location[1],
      iconPath: "/images/start.png",
      width: 60,
      height: 78
    }, {
      //标注终点
      id: -1,
      longitude: target_info[0],
      latitude: target_info[1],
      iconPath: "/images/end.png",
      width: 60,
      height: 78
    }]
    //将路线显示在范围内
    this.map_scale(points)

  },
  /**
   * 根据当前位置信息请求周边停车场信息（普通停车场、含有共享车位停车场）
   */
  parkings: function () {
    var that = this;
    wx.request({
      dataType: "json",
      url: 'https://tiancaisq.com/index.php?local=' + current_position.longitude + "," + current_position.latitude,
      success: function (res) {
        console.log(res);
        var map_list = [];
        //只有普通车位的停车场
        for (var i = 0; i < res.data.ordinary.length; i++) {
          map_list.push({
            id: res.data.ordinary[i].id,
            latitude: res.data.ordinary[i].latitude,
            longitude: res.data.ordinary[i].longitude,
            iconPath: park_path
          });
        }
        //含有共享车位的停车场
        for (var i = 0; i < res.data.share.length; i++) {
          map_list.push({
            id: res.data.share[i].id,
            latitude: res.data.share[i].latitude,
            longitude: res.data.share[i].longitude,
            iconPath: park2_path
          });
        }
        //更新停车场位置
        markers = map_list
        that.setData({
          markers: markers
        })
        //缩放地图
        that.map_scale();
      }
    })
  },
  /**
   * 根据标记点缩放地图
   *  @param list 可有可无，标示需要标注的点集合[{latitude,longitude},..]
   */
  map_scale: function (list) {
    map_obj.includePoints({
      padding: [50, 50, 50, 50],
      points: list ? list : markers
    });
  },
  markertap: function (e) {
    if (e.markerId != -1) {
      wx.showToast({
        title: '点击了ID：' + e.markerId + "停车场",
      })
    }
  }
}
Page(init_info)
