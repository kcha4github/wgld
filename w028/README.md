# テクスチャの品質設定

テクスチャパラメータの設定メソッド例
`gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);`
バインドされているテクスチャのみ適用される。
[texParameterX](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter)

# 注意書き

オリジン間リソース共有(CORS)により、canvasからローカルの画像データへのアクセスはできない。

## 対応

ローカルのWebサーバを使用する。
