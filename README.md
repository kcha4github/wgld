# wgld 勉強

https://wgld.org/ での3Dについての学習内容を記録していく。


# 進捗
- 「点光源によるライティング」まで。（表示物体の個数を独自に２個から４個に）(2021/01/23)
- 「フォンシェーディング」まで。(2021/01/22)
- 「反射光によるライティング」まで。(2021/01/19)
- 「環境光によるライティング」まで。(2021/01/17)
- 「平行光源によるライティング」まで。(2021/01/14)
- 「立体モデル（トーラス）の描画」まで。(2021/01/14)
- 「カリングと深度テスト」まで。（六角形版を独自に作成）(2021/01/10)
- 「インデックスバッファによる描画」まで。(2021/01/03)
- 「再帰処理と移動・回転・拡大縮小」まで。（独自図形を１つ追加）(2021/01/01)
- 「複数モデルのレンダリング」まで。(2020/12/23)
- 「ポリゴンに色を塗る（頂点色の指定）」まで。(2020/12/20)
- 「ポリゴンのレンダリング」まで。(2020/12/14)
- 「minMatrix.jsと座標変換行列」まで。(2020/12/11)
- 「モデルデータと頂点属性」まで。(2020/12/10)
- 「シェーダのコンパイルとリンク」まで。(2020/12/10)
- 「行列演算とライブラリ」まで。(2020/12/10)
- 「頂点バッファの基礎」まで。(2020/12/02)
- 「シェーダの記述と基礎」まで。(2020/12/02)
- 「コンテキストの初期化」まで。(2020/11/26)
- 「頂点とポリゴン」まで。(2020/11/26)
- 「行列（マトリックス）の基礎知識」まで。(2020/11/25)
- 「レンダリングのための下準備」まで。(2020/11/25)
- 3D描画の基礎知識( https://wgld.org/d/webgl/w003.html )まで。(2020/11/24)

# 用語

## 深度テスト (depth test)
手前にあるもので奥にあるものを覆い隠すための評価（DirectXではZテスト）。

有効化するには
```
gl.enable(gl.DEPTH_TEST);
```
さらに評価方法を指定するために
```
gl.depthFunc(gl.LEQUAL);
```


## カリング (culling)
ポリゴンの「裏」を描画しないこと。通常、反時計周り(CCW: Counter Clockwise)が「表」、時計回りが「裏」。

有効化するには
```
gl.enable(gl.CULL_FACE);
```

## 座標変換

### モデル変換（DirectX系ではワールド変換）
被写体となるモデルがどの位置に存在しているか。

### ビュー変換
実際にカメラがどの位置にあるのか、どこを向いているかを定義。

### プロジェクション変換
三次元空間のどの領域を表示するか。（例：横に幅広く？縦長？）

## 変数についてのメモ

### 頂点シェーダ
- attribute修飾子：頂点ごとの異なる値を受け取る変数（例：position）
- uniform修飾子：全ての頂点に共通の変数（例：mvpMatrix）
- varying修飾子：フラグメントシェーダへの橋渡し用変数
- gl_Position：頂点データを渡す先

### フラグメントシェーダ
- varying修飾子：頂点シェーダからの橋渡し用変数
- gl_FragColor：色情報を渡す先


# 以下テンプレート

https://cpp-learning.com/readme/ ここからいただいたREADME.mdのテンプレート。
進み次第、文章を加えていく予定。

# Requirement

"hoge"を動かすのに必要なライブラリなどを列挙する

* huga 3.5.2
* hogehuga 1.0.2

# Installation

Requirementで列挙したライブラリなどのインストール方法を説明する

```bash
pip install huga_package
```

# Usage

DEMOの実行方法など、"hoge"の基本的な使い方を説明する

```bash
git clone https://github.com/hoge/~
cd examples
python demo.py
```

# Note

注意点などがあれば書く

# Author

作成情報を列挙する

* 作成者
* 所属
* E-mail

# License
ライセンスを明示する

"hoge" is under [MIT license](https://en.wikipedia.org/wiki/MIT_License).

社内向けなら社外秘であることを明示してる

"hoge" is Confidential.