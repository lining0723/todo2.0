//app.js
import util from 'utils/util.js'
import http from './api/index' // 引入api接口管理文件
App({
  onLaunch: function () {
    wx.http = http //接口请求文件
    //wx.baseUrl = 'http://localhost:7001/api/' //本地;
    wx.baseUrl = 'https://www.ilnweb.cn/api/' //服务器;
    wx.formatTime = util.formatTime

    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        let custom = wx.getMenuButtonBoundingClientRect();
        this.globalData.Custom = custom;
        this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
        wx.isIpx = false
        if (/iphone\sx/i.test(e.model) || (/iphone/i.test(e.model) && /unknown/.test(e.model)) || /iphone\s1[1,2]/i.test(e.model)) {
          wx.isIpx = true
        }
      }
    })
    //获取openid
    //this.getOpenid()
    wx.getOpenid = this.getOpenid
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
    this.checkUpdateVersion()
  },
  getOpenid(callback) {
    let openid = wx.getStorageSync("openid");
    if (!openid) {
      // 登录
      wx.login({
        success: res => {
          wx.http.login({
            code: res.code
          }).then((res) => {
            wx.setStorageSync("openid", res.data.openid)
            wx.openid = res.data.openid
            callback()
          })
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
        }
      })
    } else {
      wx.openid = openid
      callback()
    }

  },
  /**
   * 检测当前的小程序
   * 是否是最新版本，是否需要下载、更新
   */
  checkUpdateVersion() {
    //判断微信版本是否 兼容小程序更新机制API的使用
    if (wx.canIUse('getUpdateManager')) {
      //创建 UpdateManager 实例
      const updateManager = wx.getUpdateManager();
      //检测版本更新
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          //监听小程序有版本更新事件
          updateManager.onUpdateReady(function () {
            //TODO 新的版本已经下载好，调用 applyUpdate 应用新版本并重启 （ 此处进行了自动更新操作）
            updateManager.applyUpdate();
          })
          updateManager.onUpdateFailed(function () {
            // 新版本下载失败
            wx.showModal({
              title: '已经有新版本喽~',
              content: '请您删除当前小程序，到微信 “发现-小程序” 页，重新搜索打开哦~',
            })
          })
        }
      })
    } else {
      //TODO 此时微信版本太低（一般而言版本都是支持的）
      wx.showModal({
        title: '溫馨提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },
  globalData: {
    userInfo: null
  }
})