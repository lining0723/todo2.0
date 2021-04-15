module.exports = {
  http(url, params) {
    let httpUrl = wx.baseUrl + url
    return new Promise((resolve, reject) => {
      wx.request({
        url: wx.baseUrl + url,
        method: 'post',
        data: params,
        header: {
          'content-type': 'application/json',
          'token': wx.openid || ''
        },
        success: (res) => {
          if (res && res.statusCode == 200 && res.data.code == 200) {
            if (res.data.code === "login_err") {
              wx.openid = ''
              console.log('token过期')
              return
            }
            resolve(res.data);
          } else {
            console.log("错误", res)
            console.log("错误接口地址", httpUrl)
            reject(res);
          }
        },
        fail: (err) => {
          wx.hideLoading()
          wx.showToast({
            title: "网络错误，请检查网络并重试！",
            icon: 'none',
            duration: 1500
          })
          console.log("fail", err)
          console.log("错误接口地址", httpUrl)
          reject(err);
        }
      })
    })
  }

}