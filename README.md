# wgld 勉強

https://wgld.org/ での3Dについての学習内容を記録していく。


# 進捗
- 「行列演算とライブラリ」まで。(2020/12/10)
- 「頂点バッファの基礎」まで。(2020/12/02)
- 「シェーダの記述と基礎」まで。(2020/12/02)
- 「コンテキストの初期化」まで。(2020/11/26)
- 「頂点とポリゴン」まで。(2020/11/26)
- 「行列（マトリックス）の基礎知識」まで。(2020/11/25)
- 「レンダリングのための下準備」まで。(2020/11/25)
- 3D描画の基礎知識( https://wgld.org/d/webgl/w003.html )まで。(2020/11/24)

# 用語

## 座標変換

### モデル変換（DirectX系ではワールド変換）
被写体となるモデルがどの位置に存在しているか。

### ビュー変換
実際にカメラがどの位置にあるのか、どこを向いているかを定義。

### プロジェション変換
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


# DEMO

"hoge"の魅力が直感的に伝えわるデモ動画や図解を載せる

# Features

"hoge"のセールスポイントや差別化などを説明する

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