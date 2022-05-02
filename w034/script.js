// WebGL クォータニオンと球面線形補間

// サンプルとはonloadのアタッチ方法を変える
window.addEventListener('load', (event) => {
    // canvasエレメントを取得
    var c = document.getElementById('canvas');
    c.width = 500;
    c.height = 300;

    // input rangeエレメント
    var eRange = document.getElementById('range');

    // webglコンテキストを取得
    var gl = c.getContext('webgl') || c.getContext('experimental-webgl');

    // 頂点シェーダとフラグメントシェーダの生成
    var v_shader = create_shader('vs');
    var f_shader = create_shader('fs');

    // プログラムオブジェクトの生成とリンク
    var prg = create_program(v_shader, f_shader);

    // attributeLocationを配列に取得
    var attLocation = new Array();
    attLocation[0] = gl.getAttribLocation(prg, 'position');
    attLocation[1] = gl.getAttribLocation(prg, 'normal');
    attLocation[2] = gl.getAttribLocation(prg, 'color');

    // attributeの要素数を配列に格納
    var attStride = new Array();
    attStride[0] = 3;
    attStride[1] = 3;
    attStride[2] = 4;

    // トーラスデータ
    var torusData = torus(64, 64, 0.5, 1.5, [0.5, 0.5, 0.5, 1.0]);
    var tPosition = create_vbo(torusData.p);
    var tNormal   = create_vbo(torusData.n);
    var tColor    = create_vbo(torusData.c);
    var tVBOList  = [tPosition, tNormal, tColor];
    var tIndex    = create_ibo(torusData.i);
    set_attribute(tVBOList, attLocation, attStride);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tIndex);

    // uniformLocationを配列に取得
    var uniLocation = new Array();
    uniLocation[0] = gl.getUniformLocation(prg, 'mvpMatrix');
    uniLocation[1] = gl.getUniformLocation(prg, 'mMatrix');
    uniLocation[2] = gl.getUniformLocation(prg, 'invMatrix');
    uniLocation[3] = gl.getUniformLocation(prg, 'lightPosition');
    uniLocation[4] = gl.getUniformLocation(prg, 'eyeDirection');
    uniLocation[5] = gl.getUniformLocation(prg, 'ambientColor');

    // 各種行列の生成と初期化
    var m = new matIV();
    var mMatrix   = m.identity(m.create());
    var vMatrix   = m.identity(m.create());
    var pMatrix   = m.identity(m.create());
    var tmpMatrix = m.identity(m.create());
    var mvpMatrix = m.identity(m.create());
    var invMatrix = m.identity(m.create());
    var qMatrix   = m.identity(m.create());

    // 各種クォータニオンの生成と初期化
    var q = new qtnIV();
    var aQuaternion = q.identity(q.create());
    var bQuaternion = q.identity(q.create());
    var sQuaternion = q.identity(q.create());

    // 点光源のいち
    var lightPosition = [15.0, 10.0, 15.0];

    // 環境光の色
    var ambientColor = [0.1, 0.1, 0.1, 1.0];

    // カメラの座標
    var camPosition = [0.0, 0.0, 20.0];

    // カメラの上方向を表すベクトル
    var camUpDirection = [0.0, 1.0, 0.0];

    // ビュー✕プロジェクション座標変換行列
    m.lookAt(camPosition, [0, 0, 0], camUpDirection, vMatrix);
    m.perspective(45, c.width / c.height, 0.1, 100, pMatrix);
    m.multiply(pMatrix, vMatrix, tmpMatrix);

    // カウンタの宣言
    var count = 0;

    // カリングと深度テストを有効にする
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);

    // 恒常ループ
    (function(){
        // canvasを初期化
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        // カウンタをインクリメントしてラジアンを算出
        count = ++count % 360;
        var rad = count * Math.PI / 180;

        // 経過時間係数を算出
        var time = eRange.value / 100;

        // 回転クォータニオンの生成
        q.rotate(rad, [1.0, 0.0, 0.0], aQuaternion);
        q.rotate(rad, [0.0, 1.0, 0.0], bQuaternion);
        q.slerp(aQuaternion, bQuaternion, time, sQuaternion);

        // モデルのレンダリング
        ambientColor = [0.5, 0.0, 0.0, 1.0];
        draw(aQuaternion);
        ambientColor = [0.0, 0.5, 0.0, 1.0];
        draw(bQuaternion);
        ambientColor = [0.0, 0.0, 0.5, 1.0];
        draw(sQuaternion);

        function draw(qtn)
        {
            q.toMatIV(qtn, qMatrix);
            m.identity(mMatrix);
            m.multiply(mMatrix, qMatrix, mMatrix);
            m.translate(mMatrix, [0.0, 0.0, -5.0], mMatrix);
            m.multiply(tmpMatrix, mMatrix, mvpMatrix);
            m.inverse(mMatrix, invMatrix);

            // uniform変数の登録と描画
            gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
            gl.uniformMatrix4fv(uniLocation[1], false, mMatrix);
            gl.uniformMatrix4fv(uniLocation[2], false, invMatrix);
            gl.uniform3fv(uniLocation[3], lightPosition);
            gl.uniform3fv(uniLocation[4], camPosition);
            gl.uniform4fv(uniLocation[5], ambientColor);
            // インデックスを用いた描画命令
            gl.drawElements(gl.TRIANGLES, torusData.i.length, gl.UNSIGNED_SHORT, 0);
        }
       
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

    // IBOを生成する関数
    function create_ibo(data){
        // バッファオブジェクトの生成
        var ibo = gl.createBuffer();

        // バッファをバインドする
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

        // バッファにデータをセット
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);

        // バッファのバインドを無効化
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        // 生成したIBOを返して終了
        return ibo;
    }
});
