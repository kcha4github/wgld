// WebGL 点光源

onload = function(){
    // canvasエレメントを取得
    var c = document.getElementById('canvas');
    c.width = 500;
    c.height = 300;

    // webglコンテキストを取得
    var gl = c.getContext('webgl') || c.getContext('experimental-webgl');

    // 頂点シェーダとフラグメントシェーダの生成
    var v_shader = create_shader('vs');
    var f_shader = create_shader('fs');

    // プログラムオブジェクトの生成とリンク
    var prg = create_program(v_shader, f_shader);

    // attributeLocationを配列で取得
    var attLocation = new Array();
    attLocation[0] = gl.getAttribLocation(prg, 'position');
    attLocation[1] = gl.getAttribLocation(prg, 'normal');
    attLocation[2] = gl.getAttribLocation(prg, 'color');

    // attributeの要素数
    var attStride = new Array();
    attStride[0] = 3;
    attStride[1] = 3;
    attStride[2] = 4;

    // トーラスの頂点データからVBOを生成し配列に格納
    var torusData1 = torus(64, 64, 0.5, 1.5, [0.75, 0.25, 0.25, 1.0]);
    var tPosition1 = create_vbo(torusData1.p);
    var tNormal1   = create_vbo(torusData1.n);
    var tColor1    = create_vbo(torusData1.c);
    var tVBOList1  = [tPosition1, tNormal1, tColor1];
    // 頂点のインデックスを格納する配列からIBOを生成
    var tIndex1 = create_ibo(torusData1.i);

    // トーラス2の頂点データからVBOを生成し配列に格納
    var torusData2 = torus(64, 64, 0.5, 1.5, [0.25, 0.75, 0.75, 1.0]);
    var tPosition2 = create_vbo(torusData2.p);
    var tNormal2   = create_vbo(torusData2.n);
    var tColor2    = create_vbo(torusData2.c);
    var tVBOList2  = [tPosition2, tNormal2, tColor2];
    // 頂点のインデックスを格納する配列からIBOを生成
    var tIndex2 = create_ibo(torusData2.i);

    // 球体の頂点データからVBOを生成し配列に格納
    var sphereData1 = sphere(64, 64, 2.0, [0.25, 0.25, 0.75, 1.0]);
    var sPosition1 = create_vbo(sphereData1.p);
    var sNormal1   = create_vbo(sphereData1.n);
    var sColor1    = create_vbo(sphereData1.c);
    var sVBOList1  = [sPosition1, sNormal1, sColor1];
    // 球体用IBOの生成
    var sIndex1 = create_ibo(sphereData1.i);

    // 球体2の頂点データからVBOを生成し配列に格納
    var sphereData2 = sphere(64, 64, 2.0, [0.75, 0.75, 0.25, 1.0]);
    var sPosition2 = create_vbo(sphereData2.p);
    var sNormal2   = create_vbo(sphereData2.n);
    var sColor2    = create_vbo(sphereData2.c);
    var sVBOList2  = [sPosition2, sNormal2, sColor2];
    // 球体用IBOの生成
    var sIndex2 = create_ibo(sphereData2.i);

    // uniformLocationを配列に取得
    var uniLocation = new Array();
    uniLocation[0] = gl.getUniformLocation(prg, 'mvpMatrix');
    uniLocation[1] = gl.getUniformLocation(prg, 'mMatrix');
    uniLocation[2] = gl.getUniformLocation(prg, 'invMatrix');
    uniLocation[3] = gl.getUniformLocation(prg, 'lightPosition');
    uniLocation[4] = gl.getUniformLocation(prg, 'eyeDirection');
    uniLocation[5] = gl.getUniformLocation(prg, 'ambientColor');

    // minMatrix.jsを用いた行列関連処理
    // matIVオブジェクトを生成
    var m = new matIV();

    // 各種行列の生成と初期化
    var mMatrix = m.identity(m.create());
    var vMatrix = m.identity(m.create());
    var pMatrix = m.identity(m.create());
    var tmpMatrix = m.identity(m.create());
    var mvpMatrix = m.identity(m.create());
    var invMatrix = m.identity(m.create());

    // 点光源の位置
    var lightPosition = [0.0, 0.0, 0.0];

    // 環境光の色
    var ambientColor = [0.1, 0.1, 0.1, 1.0];

    // 視点ベクトル
    var eyeDirection = [0.0, 0.0, 20.0];

    // ビュー座標変換行列
    m.lookAt(eyeDirection, [0, 0, 0], [0, 1, 0], vMatrix);
    // プロジェクション座標変換行列
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
        // canvas初期化色の設定
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // canvasを初期化する際の深度を設定する
        gl.clearDepth(1.0);
        // canvasを初期化
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        // カウンタをインクリメントする
        count++;

        // カウンタを元にラジアンを算出
        var rad = (count % 360) * Math.PI / 180;
        var tx = Math.cos(rad) * 3.5;
        var ty = Math.sin(rad) * 3.5;
        var tz = Math.sin(rad) * 3.5;
        var rad2 = ((count + 90) % 360) * Math.PI / 180;
        var tx2 = Math.cos(rad2) * 3.5;
        var ty2 = Math.sin(rad2) * 3.5;
        var tz2 = Math.sin(rad2) * 3.5;

        // トーラスのVBOとIBOをセット
        set_attribute(tVBOList1, attLocation, attStride);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tIndex1);

        // モデル座標変換行列の生成
        m.identity(mMatrix);
        m.translate(mMatrix, [tx, -ty, -tz], mMatrix);
        m.rotate(mMatrix, -rad, [0, 1, 1], mMatrix);
        m.multiply(tmpMatrix, mMatrix, mvpMatrix);
        m.inverse(mMatrix, invMatrix);

        // uniform変数の登録と描画
        gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
        gl.uniformMatrix4fv(uniLocation[1], false, mMatrix);
        gl.uniformMatrix4fv(uniLocation[2], false, invMatrix);
        gl.uniform3fv(uniLocation[3], lightPosition);
        gl.uniform3fv(uniLocation[4], eyeDirection);
        gl.uniform4fv(uniLocation[5], ambientColor);
        // インデックスを用いた描画命令
        gl.drawElements(gl.TRIANGLES, torusData1.i.length, gl.UNSIGNED_SHORT, 0);


        // トーラス2のVBOとIBOをセット
        set_attribute(tVBOList2, attLocation, attStride);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tIndex2);

        // モデル座標変換行列の生成
        m.identity(mMatrix);
        m.translate(mMatrix, [-tx, ty, -tz], mMatrix);
        m.rotate(mMatrix, -rad, [0, 1, 1], mMatrix);
        m.multiply(tmpMatrix, mMatrix, mvpMatrix);
        m.inverse(mMatrix, invMatrix);

        // uniform変数の登録と描画
        gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
        gl.uniformMatrix4fv(uniLocation[1], false, mMatrix);
        gl.uniformMatrix4fv(uniLocation[2], false, invMatrix);
        // 以下の３行は前述のトーラスで変数を登録しているので不要
        //gl.uniform3fv(uniLocation[3], lightPosition);
        //gl.uniform3fv(uniLocation[4], eyeDirection);
        //gl.uniform4fv(uniLocation[5], ambientColor);
        // インデックスを用いた描画命令
        gl.drawElements(gl.TRIANGLES, torusData2.i.length, gl.UNSIGNED_SHORT, 0);


        // 球体のVBOとIBOをセット
        set_attribute(sVBOList1, attLocation, attStride);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sIndex1);

        // モデル座標変換行列の生成
        m.identity(mMatrix);
        m.translate(mMatrix, [tx2, -ty2, -tz2], mMatrix);
        m.multiply(tmpMatrix, mMatrix, mvpMatrix);
        m.inverse(mMatrix, invMatrix);

        // uniform変数の登録と描画
        gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
        gl.uniformMatrix4fv(uniLocation[1], false, mMatrix);
        gl.uniformMatrix4fv(uniLocation[2], false, invMatrix);
        // 以下の３行は前述のトーラスで変数を登録しているので不要
        //gl.uniform3fv(uniLocation[3], lightPosition);
        //gl.uniform3fv(uniLocation[4], eyeDirection);
        //gl.uniform4fv(uniLocation[5], ambientColor);
        // インデックスを用いた描画命令
        gl.drawElements(gl.TRIANGLES, sphereData1.i.length, gl.UNSIGNED_SHORT, 0);

        // 球体2のVBOとIBOをセット
        set_attribute(sVBOList2, attLocation, attStride);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sIndex2);

        // モデル座標変換行列の生成
        m.identity(mMatrix);
        m.translate(mMatrix, [-tx2, ty2, -tz2], mMatrix);
        m.multiply(tmpMatrix, mMatrix, mvpMatrix);
        m.inverse(mMatrix, invMatrix);

        // uniform変数の登録と描画
        gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
        gl.uniformMatrix4fv(uniLocation[1], false, mMatrix);
        gl.uniformMatrix4fv(uniLocation[2], false, invMatrix);
        // 以下の３行は前述のトーラスで変数を登録しているので不要
        //gl.uniform3fv(uniLocation[3], lightPosition);
        //gl.uniform3fv(uniLocation[4], eyeDirection);
        //gl.uniform4fv(uniLocation[5], ambientColor);
        // インデックスを用いた描画命令
        gl.drawElements(gl.TRIANGLES, sphereData2.i.length, gl.UNSIGNED_SHORT, 0);
        
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

    // トーラスモデルデータ生成関数（返却値に法線ベクトルを含むよう変更）
    // @return: {p, n, c, i}
    //  p: 座標配列 [x0,y0,z0,x1,...]
    //  n: 法線ベクトル配列 [nx0,ny0,nz0,nx1,...]
    //  c: 色配列 [r0,g0,b0,a0,r0,...]
    //  i: 座標インデックス配列
    // @param row: 断面円の頂点数
    // @param column: トーラス円の分割数（頂点数は分割数＋１となる）
    // @param irad: 断面円の半径
    // @param orad: 原点からパイプ中心への距離（トーラス全体の半径）
    // @param color: 色(RGBA)
    function torus(row, column, irad, orad, color){
        var pos = new Array();
        var nor = new Array();
        var col = new Array();
        var idx = new Array();

        // 断面円の一点を指定し、トーラス状に配置していく
        // 展開された長方形状のポリゴンはrow方向:断面の円周、column方向:トーラスの円周となる
        // 展開されたポリゴンの格子は縦横ともに+1であることに注意
        for(var rIdx = 0; rIdx <= row; rIdx++){
            // 断面円のx,yを算出(xはトーラスの径として利用されるのでrr表記)
            // radian算出
            var r = Math.PI * 2 / row * rIdx;
            // 断面円x方向
            var rr = Math.cos(r);
            // 断面円y方向
            var ry = Math.sin(r);

            // 座標点のトーラス状配置が内側ループ
            // 引数指定は分割数なので格子状の点の数は+1であることに注意
            for(var cIdx = 0; cIdx <= column; cIdx++){
                // トーラスのradianを算出
                var tr = Math.PI * 2 / column * cIdx;
                // トーラスでのx位置（断面円のx + トーラス半径) * Cos()
                var tx = (irad * rr + orad) * Math.cos(tr);
                // トーラスでのy位置
                var ty = irad * ry;
                // トーラスでのz位置（断面円のx + トーラス半径) * Sin()
                var tz = (irad * rr + orad) * Math.sin(tr);
                // トーラスのxyz位置の法線のx,z成分はrrをcosとsinに分解する
                var rx = rr * Math.cos(tr);
                var rz = rr * Math.sin(tr);
                // カラー指定の有無
                if(color){
                    // カラー指定
                    var tc = color;
                }else{
                    // hsvカラーを取得
                    tc = hsva(360 / column * cIdx, 1, 1, 1);
                }
                // 座標を配列に格納
                pos.push(tx, ty, tz);
                // 法線ベクトルを配列に格納
                nor.push(rx, ry, rz);
                // 色情報を配列に格納
                col.push(tc[0], tc[1], tc[2], tc[3]);
            }
        }

        // インデックス配列を生成するため、トーラスを展開したポリゴンの
        // 格子上の点を拾っていく
        for(rIdx = 0; rIdx < row; rIdx++){
            for(cIdx = 0; cIdx < column; cIdx++){
                // 展開されたポリゴンの座標点の数は縦横ともに+1であることに注意

                // 長方形ではなく平行四辺形状にインデックスを格納していく
                // 起点インデックス
                r = (column + 1) * rIdx + cIdx;
                // 起点、右下、右の順にインデックスを格納（反時計回り）
                idx.push(r, r + column + 1, r + 1);
                // 起点の右下、起点の右下の右、起点の右の順
                idx.push(r + column + 1, r + column + 2, r + 1);
            }
        }
        return {p:pos, n:nor, c:col, i:idx};
    }


    function sphere(row, column, rad, color){
        var pos = new Array();
        var nor = new Array();
        var col = new Array();
        var idx = new Array();
        for(var rIdx = 0; rIdx <= row; rIdx++){
            // radian算出
            var r = Math.PI * 2 / row * rIdx;
            var rr = Math.cos(r);
            var ry = Math.sin(r);
            // 引数指定は分割数なので格子状の点の数は+1であることに注意
            for(var cIdx = 0; cIdx <= column; cIdx++){
                // radianを算出
                var tr = Math.PI * 2 / column * cIdx;
                // 円でのx位置:半円のx * Cos()
                var tx = rad * rr * Math.cos(tr);
                // 円でのy位置
                var ty = rad * ry;
                // 円でのz位置：半円のx * Sin()
                var tz = rad * rr * Math.sin(tr);
                // xyz位置の法線のx,z成分はrrをcosとsinに分解する
                var rx = rr * Math.cos(tr);
                var rz = rr * Math.sin(tr);
                // カラー指定の有無
                if(color){
                    // カラー指定
                    var tc = color;
                }else{
                    // hsvカラーを取得
                    tc = hsva(360 / row * rIdx, 1, 1, 1);
                }
                // 座標を配列に格納
                pos.push(tx, ty, tz);
                // 法線ベクトルを配列に格納
                nor.push(rx, ry, rz);
                // 色情報を配列に格納
                col.push(tc[0], tc[1], tc[2], tc[3]);
            }
        }

        // インデックス配列を生成するため、円を展開したポリゴンの
        // 格子上の点を拾っていく
        for(rIdx = 0; rIdx < row; rIdx++){
            for(cIdx = 0; cIdx < column; cIdx++){
                // 展開されたポリゴンの座標点の数は縦横ともに+1であることに注意

                // 長方形ではなく平行四辺形状にインデックスを格納していく
                // 起点インデックス
                r = (column + 1) * rIdx + cIdx;
                // 起点、右下、右の順にインデックスを格納（反時計回り）
                idx.push(r, r + column + 1, r + 1);
                // 起点の右下、起点の右下の右、起点の右の順
                idx.push(r + column + 1, r + column + 2, r + 1);
            }
        }
        return {p:pos, n:nor, c:col, i:idx};

    }

    // HSVカラー取得用関数
    function hsva(h, s, v, a){
        if(s > 1 || v > 1 || a > 1){ return; }
        var th = h % 360;
        var i = Math.floor(th / 60);
        var f = th / 60 - i;
        var m = v * (1 - s);
        var n = v * (1 - s * f);
        var k = v * (1 - s * (1 - f));
        var color = new Array();
        if(!s > 0 && !s < 0){
            color.push(v, v, v, a);
        }else{
            var r = new Array(v, n, m, m, k, v);
            var g = new Array(k, v, v, n, m, m);
            var b = new Array(m, m, k, v, v, n);
            color.push(r[i], g[i], b[i], a);
        }
        return color;
    }
};
