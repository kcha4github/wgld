// WebGL クォータニオンとビルボード

// canvasとクォータニオンをグローバルで扱う
var c;
var q = new qtnIV();
var qt = q.identity(q.create());

// マウス移動イベントに登録する処理
function mouseMove(e){
    var cw = c.width;   // キャンバス幅
    var ch = c.height;  // キャンバス高さ
    var wh = 1 / Math.sqrt(cw * cw + ch * ch);

    var x = e.clientX - c.offsetLeft - cw * 0.5;
    var y = e.clientY - c.offsetTop - ch * 0.5;
    var sq = Math.sqrt(x * x + y * y);
    var r = sq * 2.0 * Math.PI * wh;
    if(sq != 1){
        sq = 1 / sq;
        x *= sq;
        y *= sq;
    }
    q.rotate(r, [y, x, 0.0], qt);
}


// サンプルとはonloadのアタッチ方法を変える
window.addEventListener('load', (event) => {
    // canvasエレメントを取得
    c = document.getElementById('canvas');
    c.width = 500;
    c.height = 300;

    // エレメントへの参照を取得
    var eLines     = document.getElementById('lines');
    var eLineStrip = document.getElementById('line_strip');
    var eLineLoop  = document.getElementById('line_loop');
    var ePointSize = document.getElementById('point_size');

    // canvasのマウス移動イベントに処理を登録
    c.addEventListener('mousemove', mouseMove, true);

    // webglコンテキストを取得
    var gl = c.getContext('webgl') || c.getContext('experimental-webgl');

    // 点の最大ピクセル数をコンソールに出力
    var pointSizeRange = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE);
    console.log('pointSizeRange:' + pointSizeRange[0] + ' to ' + pointSizeRange[1]);

    // 頂点シェーダとフラグメントシェーダの生成
    var v_shader = create_shader('vs');
    var f_shader = create_shader('fs');

    // プログラムオブジェクトの生成とリンク
    var prg = create_program(v_shader, f_shader);

    // attributeLocationを配列で取得
    var attLocation = [
        gl.getAttribLocation(prg, 'position'),
        gl.getAttribLocation(prg, 'color')
    ];

    // attributeの要素数
    var attStride = [3, 4];

    // 点のVBO生成
    var pointSphere = sphere(16, 16, 2.0);
    var pointPosVBO = create_vbo(pointSphere.p);
    var pointColorVBO = create_vbo(pointSphere.c);
    var pointVBOList = [pointPosVBO, pointColorVBO];


    // 線の頂点の位置
    var position = [
        -1.0, -1.0,  0.0,
         1.0, -1.0,  0.0,
         1.0,  1.0,  0.0,
        -1.0,  1.0,  0.0
    ];

    // 線の頂点色
    var color = [
        1.0, 1.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0
    ];


    // 線のVBO生成
    var linePosVBO = create_vbo(position);
    var lineColorVBO = create_vbo(color);
    var lineVBOList = [linePosVBO, lineColorVBO];

    // uniformLocationを配列に取得
    var uniLocation = [
        gl.getUniformLocation(prg, 'mvpMatrix'),
        gl.getUniformLocation(prg, 'pointSize')
    ];

    // 各種行列の生成と初期化
    var m = new matIV();
    var mMatrix   = m.identity(m.create());
    var vMatrix   = m.identity(m.create());
    var pMatrix   = m.identity(m.create());
    var tmpMatrix = m.identity(m.create());
    var mvpMatrix = m.identity(m.create());
    var qMatrix   = m.identity(m.create());

    // 各種フラグを有効化する
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);


    // カウンタ
    var count = 0;

    // 恒常ループ
    (function(){
        // canvas初期化色の設定
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // canvasを初期化する際の深度を設定する
        gl.clearDepth(1.0);
        // canvasを初期化
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        // カウンタからラジアンを算出
        count = (count + 1) % 360;
        var rad = count * Math.PI / 180;

        // クォータニオンを行列に適用
        var qMatrix = m.identity(m.create());
        q.toMatIV(qt, qMatrix);

        // カメラの座標位置
        var camPosition = [0.0, 5.0, 10.0];
        // ビュー座標変換行列
        m.lookAt(camPosition, [0, 0, 0], [0, 1, 0], vMatrix);
        // ビュー座標変換行列にクォータニオンの回転を適用
        m.multiply(vMatrix, qMatrix, vMatrix);
        // ビュー✕プロジェクション座標変換行列
        m.perspective(45, c.width / c.height, 0.1, 100, pMatrix);
        m.multiply(pMatrix, vMatrix, tmpMatrix);


        // 点のサイズをエレメントから取得
        var pointSize = ePointSize.value / 10;

        // 点を描画
        set_attribute(pointVBOList, attLocation, attStride);
        m.identity(mMatrix);
        m.rotate(mMatrix, rad, [0, 1, 0], mMatrix);
        m.multiply(tmpMatrix, mMatrix, mvpMatrix);
        gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
        gl.uniform1f(uniLocation[1], pointSize);
        gl.drawArrays(gl.POINTS, 0, pointSphere.p.length / 3);

        // 線のプリミティブタイプを判別
        var lineOption = 0;
        if(eLines.checked) { lineOption = gl.LINES; }
        else if(eLineStrip.checked) { lineOption = gl.LINE_STRIP; }
        else if(eLineLoop.checked) { lineOption = gl.LINE_LOOP; }

        // 線を描画
        set_attribute(lineVBOList, attLocation, attStride);
        m.identity(mMatrix);
        m.rotate(mMatrix, Math.PI / 2, [1, 0, 0], mMatrix);
        m.scale(mMatrix, [3.0, 3.0, 1.0], mMatrix);
        m.multiply(tmpMatrix, mMatrix, mvpMatrix);
        gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
        gl.drawArrays(lineOption, 0, position.length / 3);
       
        // コンテキストの再描画
        gl.flush();

        // ループのために再帰呼び出し
        setTimeout(arguments.callee, 1000 / 30);
    })();

    // シェーダを生成する関数
    function create_shader(id){
        // シェーダを格納する変数
        var shader;

        // HTMLからscriptタグへの参照を取得
        var scriptElement = document.getElementById(id);

        // scriptタグが存在しない場合は抜ける
        if(!scriptElement){ return; }

        // scriptタグのtype属性をチェック
        switch(scriptElement.type){
            // 頂点シェーダの場合
            case 'x-shader/x-vertex':
                shader = gl.createShader(gl.VERTEX_SHADER);
                break;
            // フラグメントシェーダの場合
            case 'x-shader/x-fragment':
                shader = gl.createShader(gl.FRAGMENT_SHADER);
                break;
            default:
                return;
        }

        // 生成されたシェーダにソースを割り当てる
        gl.shaderSource(shader, scriptElement.text);

        // シェーダをコンパイルする
        gl.compileShader(shader);

        // シェーダが正しくコンパイルされたかチェック
        if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
            // 成功していたらシェーダを返して終了
            return shader;
        }else{
            // 失敗していたらエラーログをアラートする
            alert(gl.getShaderInfoLog(shader));
        }
    }

    // プログラムオブジェクトを生成しシェーダをリンクする関数
    function create_program(vs, fs){
        // プログラムオブジェクトの生成
        var program = gl.createProgram();

        // プログラムオブジェクトにシェーダを割り当てる
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);

        // シェーダをリンク
        gl.linkProgram(program);

        // シェーダのリンクが正しく行われたかチェック
        if(gl.getProgramParameter(program, gl.LINK_STATUS)){
            // 成功していたらプログラムオブジェクトを有効にする
            gl.useProgram(program);

            // プログラムオブジェクトを返して終了
            return program;
        }else{
            // 失敗していたらエラーログをアラートする
            alert(gl.getProgramInfoLog(program));
        }
    }

    // VBOを生成する関数
    function create_vbo(data){
        // バッファオブジェクトの生成
        var vbo = gl.createBuffer();

        // バッファをバインドする
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

        // バッファにデータをセット
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

        // バッファのバインドを無効化
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // 生成したVBOを返して終了
        return vbo;
    }

    // VBOをバインドし登録する関数
    function set_attribute(vbo, attL, attS){
        // 引数として受け取った配列を処理する
        for(var i in vbo){
            // バッファをバインドする
            gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);

            // attributeLocationを有効にする
            gl.enableVertexAttribArray(attL[i]);

            // attributeLocationを通知し登録する
            gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
        }
    }
});
