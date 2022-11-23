// WebGL フレームバッファ

// サンプルとはonloadのアタッチ方法を変える
window.addEventListener('load', (event) => {
    // canvasエレメントを取得
    c = document.getElementById('canvas');
    c.width = 512;
    c.height = 512;

    // webglコンテキストを取得
    var gl = c.getContext('webgl') || c.getContext('experimental-webgl');

    // 頂点シェーダとフラグメントシェーダの生成
    var v_shader = create_shader('vs');
    var f_shader = create_shader('fs');

    // プログラムオブジェクトの生成とリンク
    var prg = create_program(v_shader, f_shader);

    // attributeLocationを配列で取得
    var attLocation = [
        gl.getAttribLocation(prg, 'position'),
        gl.getAttribLocation(prg, 'normal'),
        gl.getAttribLocation(prg, 'color'),
        gl.getAttribLocation(prg, 'textureCoord')
    ];

    // attributeの要素数を配列に格納
    var attStride = [3, 3, 4, 2];

    // キューブモデル
    var cubeData      = cube(2.0, [1.0, 1.0, 1.0, 1.0]);
    var cPosition     = create_vbo(cubeData.p);
    var cNormal       = create_vbo(cubeData.n);
    var cColor        = create_vbo(cubeData.c);
    var cTextureCoord = create_vbo(cubeData.t);
    var cVBOList      = [cPosition, cNormal, cColor, cTextureCoord];
    var cIndex        = create_ibo(cubeData.i);

    // 球体データ
    var earthData     = sphere(64, 64, 1.0, [1.0, 1.0, 1.0, 1.0]);
    var ePosition     = create_vbo(earthData.p);
    var eNormal       = create_vbo(earthData.n);
    var eColor        = create_vbo(earthData.c);
    var eTextureCoord = create_vbo(earthData.t);
    var eVBOList      = [ePosition, eNormal, eColor, eTextureCoord];
    var eIndex        = create_ibo(earthData.i);

    // uniformLocationを配列に取得
    var uniLocation = [
        gl.getUniformLocation(prg, 'mMatrix'),
        gl.getUniformLocation(prg, 'mvpMatrix'),
        gl.getUniformLocation(prg, 'invMatrix'),
        gl.getUniformLocation(prg, 'lightDirection'),
        gl.getUniformLocation(prg, 'useLight'),
        gl.getUniformLocation(prg, 'texture')
    ];

    // 各種行列の生成と初期化
    var m = new matIV();
    var mMatrix   = m.identity(m.create());
    var vMatrix   = m.identity(m.create());
    var pMatrix   = m.identity(m.create());
    var tmpMatrix = m.identity(m.create());
    var mvpMatrix = m.identity(m.create());
    var invMatrix = m.identity(m.create());

    // 深度テストを有効化する
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    // テクスチャ用変数の宣言と生成
    var texture0 = null;
    var texture1 = null;
    create_texture('texture0.png', 0);
    create_texture('texture1.png', 1);
    gl.activeTexture(gl.TEXTURE0);

    // フレームバッファオブジェクトの取得
    var fBufferWidth = 512;
    var fBufferHeight = 512;
    var fBuffer = create_framebuffer(fBufferWidth, fBufferHeight);

    // カウンタ
    var count = 0;

    // 恒常ループ
    (function(){
        // カウンタのインクリメントとラジアンの算出
        //count = (count + 1) % 360;
        count++;
        var rad  = (count % 360) * Math.PI / 180;
        var rad2 = (count % 720) * Math.PI / 360;
        count %= 720;

        // フレームバッファをバインド
        gl.bindFramebuffer(gl.FRAMEBUFFER, fBuffer.f);

        // フレームバッファを初期化
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // 地球用のVBOとIBOをセット
        set_attribute(eVBOList, attLocation, attStride);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, eIndex);

        // ライト関連
        var lightDirection = [-1.0, 2.0, 1.0];

        // ビュー✕プロジェクション座標変換行列
        m.lookAt([0.0, 0.0, 5.0], [0, 0, 0], [0, 1, 0], vMatrix);
        m.perspective(45, fBufferWidth / fBufferHeight, 0.1, 100, pMatrix);
        m.multiply(pMatrix, vMatrix, tmpMatrix);

        // 背景用球体をフレームバッファにレンダリング
        gl.bindTexture(gl.TEXTURE_2D, texture1);
        m.identity(mMatrix);
        m.scale(mMatrix, [50.0, 50.0, 50.0], mMatrix);
        m.multiply(tmpMatrix, mMatrix, mvpMatrix);
        m.inverse(mMatrix, invMatrix);
        gl.uniformMatrix4fv(uniLocation[0], false, mMatrix);
        gl.uniformMatrix4fv(uniLocation[1], false, mvpMatrix);
        gl.uniformMatrix4fv(uniLocation[2], false, invMatrix);
        gl.uniform3fv(uniLocation[3], lightDirection);
        gl.uniform1i(uniLocation[4], false);
        gl.uniform1i(uniLocation[5], 0);
        gl.drawElements(gl.TRIANGLES, earthData.i.length, gl.UNSIGNED_SHORT, 0);

        // 地球本体をフレームバッファにレンダリング
        gl.bindTexture(gl.TEXTURE_2D, texture0);
        m.identity(mMatrix);
        m.rotate(mMatrix, rad, [0, 1, 0], mMatrix);
        m.multiply(tmpMatrix, mMatrix, mvpMatrix);
        m.inverse(mMatrix, invMatrix);
        gl.uniformMatrix4fv(uniLocation[0], false, mMatrix);
        gl.uniformMatrix4fv(uniLocation[1], false, mvpMatrix);
        gl.uniformMatrix4fv(uniLocation[2], false, invMatrix);
        gl.uniform1i(uniLocation[4], true);
        gl.drawElements(gl.TRIANGLES, earthData.i.length, gl.UNSIGNED_SHORT, 0);
        
        // フレームバッファのバインドを解除
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // canvas初期化色の設定
        gl.clearColor(0.0, 0.6, 0.6, 1.0);
        // canvasを初期化する際の深度を設定する
        gl.clearDepth(1.0);
        // canvasを初期化
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        // キューブのVBOとIBOをセット
        set_attribute(cVBOList, attLocation, attStride);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cIndex);

        // フレームバッファに描き込んだ内容をテクスチャとして適用
        gl.bindTexture(gl.TEXTURE_2D, fBuffer.t);

        // ライト関連
        lightDirection = [-1.0, 0.0, 0.0];

        // ビュー✕プロジェクション座標変換行列
        // ビュー座標変換行列
        m.lookAt([0.0, 0.0, 5.0], [0, 0, 0], [0, 1, 0], vMatrix);
        m.perspective(45, c.width / c.height, 0.1, 100, pMatrix);
        m.multiply(pMatrix, vMatrix, tmpMatrix);

        // キューブをレンダリング
        m.identity(mMatrix);
        m.rotate(mMatrix, rad2, [1, 1, 0], mMatrix);
        m.multiply(tmpMatrix, mMatrix, mvpMatrix);
        m.inverse(mMatrix, invMatrix);
        gl.uniformMatrix4fv(uniLocation[0], false, mMatrix);
        gl.uniformMatrix4fv(uniLocation[1], false, mvpMatrix);
        gl.uniformMatrix4fv(uniLocation[2], false, invMatrix);
        gl.drawElements(gl.TRIANGLES, cubeData.i.length, gl.UNSIGNED_SHORT, 0);

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

    // テクスチャを生成する関数
    function create_texture(source, number){
        // イメージオブジェクトの生成
        var img = new Image();

        // データのオンロードをトリガーにする
        // サンプルとはonloadのアタッチ方法を変える
        img.addEventListener('load', (event) => {
//      img.onload = function(){
            // テクスチャオブジェクトの生成
            var tex = gl.createTexture();

            // テクスチャをバインドする
            gl.bindTexture(gl.TEXTURE_2D, tex);

            // テクスチャへイメージを適用
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

            // ミップマップを生成
            gl.generateMipmap(gl.TEXTURE_2D);

            // テクスチャパラメータの設定
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

            switch(number){
                case 0:
                    texture0 = tex;
                    break;
                case 1:
                    texture1 = tex;
                    break;
                default:
                    break;
            }

            // テクスチャのバインドを無効化
            gl.bindTexture(gl.TEXTURE_2D, null);
        //};
        });

        // イメージオブジェクトのソースを指定
        img.src = source;
    }

    // フレームバッファをオブジェクトとして生成する関数
    function create_framebuffer(width, height)
    {
        // フレームバッファの生成
        var frameBuffer = gl.createFramebuffer();
        // フレームバッファをWebGLにバインド
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

        // 深度バッファ用レンダーバッファの生成
        var depthRenderBuffer = gl.createRenderbuffer();
        // レンダーバッファをWebGLにバインド
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer);

        // レンダーバッファを深度バッファとして設定
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

        // フレームバッファにレンダーバッファを関連付ける
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderBuffer);

        // フレームバッファ用テクスチャの生成
        var fTexture = gl.createTexture();
        // テクスチャのバインド
        gl.bindTexture(gl.TEXTURE_2D, fTexture);
        // フレームバッファ用のテクスチャにカラー用のメモリ領域を確保
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        // テクスチャパラメータ
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        // フレームバッファにテクスチャを関連付ける
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fTexture, 0);

        // 各種オブジェクトのバインドを解除
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // オブジェクトを返して終了
        return {f:frameBuffer, d:depthRenderBuffer, t:fTexture};
    }
});
