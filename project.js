var gl;
var points = [];
var colors = [];
var normals = [];
var texCoords=[];

var program;

var modelMatrix, modelMatrixLoc;
var lightingLoc, diffuseProductLoc;

var trballMatrix = mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
var numVertCubeTri, numVertPyraTri, numVertGroundTri, numVertGroundLine;

var lightSrc = [0.3, 3.0, 0.3, 0.0];//광원 위치
var lightSrcLoc;

var image = [];
var texture = [];

//이미지가 안불려져 오는것을 방지하기위해 맨처음에 어떤 사진 넣을지 먼저생성
image[0] = new Image();
image[0].src = "../com_grapic_project_image/picture3.png";

image[1] = new Image();
image[1].src = "../com_grapic_project_image/picture4.png";

image[2] = new Image();
image[2].src = "../com_grapic_project_image/picture5.png";

image[3] = new Image();
image[3].src = "../com_grapic_project_image/picture6.png";

image[4] = new Image();
image[4].src = "../com_grapic_project_image/pictureE.png";

image[5] = new Image();
image[5].src = "../com_grapic_project_image/pictureR.png";

image[6] = new Image();
image[6].src = "../com_grapic_project_image/pictureT.png";

image[7] = new Image();
image[7].src = "../com_grapic_project_image/pictureY.png";

image[8] = new Image();
image[8].src = "../com_grapic_project_image/pictureD.png";

image[9] = new Image();
image[9].src = "../com_grapic_project_image/pictureF.png";

image[10] = new Image();
image[10].src = "../com_grapic_project_image/pictureG.png";

image[11] = new Image();
image[11].src = "../com_grapic_project_image/pictureH.png";

image[12] = new Image();
image[12].src = "../com_grapic_project_image/pictureC.png";

image[13] = new Image();
image[13].src = "../com_grapic_project_image/pictureV.png";

image[14] = new Image();
image[14].src = "../com_grapic_project_image/pictureB.png";

image[15] = new Image();
image[15].src = "../com_grapic_project_image/pictureN.png";


// 어떤 키가 눌렸는지 알려주기 위한 변수 {key+(누를키)}
var key3 = false;
var key4 = false;
var key5 = false;
var key6 = false;

var keyE = false;
var keyR = false;
var keyT = false;
var keyY = false;

var keyD = false;
var keyF = false;
var keyG = false;
var keyH = false;

var keyC = false;
var keyV = false;
var keyB = false;
var keyN = false;

var lightingMode = 1; //lighting mode 를 1로 먼저 초기화,생성

var time = [0, 0, 0, 0, 0, 0, 0, 0]; //setTime에 사용되는 time들을 배열로 선언

var mouseover = false; //마우스가 올라가져있는지 아닌지 구분해주는 변수

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available!");
    }

    generateLaunchPadCube();
    generateGround(3);

    var trball = trackball(canvas.width, canvas.height);
    var mouseDown = false;

    canvas.addEventListener("mousedown", function (event) {
        trball.start(event.clientX, event.clientY);

        mouseDown = true;
    });

    canvas.addEventListener("mouseup", function (event) {
        mouseDown = false;
    });

    canvas.addEventListener("mousemove", function (event) {
        if (mouseDown) {
            trball.end(event.clientX, event.clientY);

            trballMatrix = mat4(trball.rotationMatrix);
        }
    });

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.2, 0.2, 0.2, 1.0);

    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var nBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    var tBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW);

    var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    modelMatrix = mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1);
    modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));

    var viewMatrix = lookAt(vec3(0.3, 4, 0.3), vec3(0.3, 0, 0.2), vec3(0, 1, 0));
    var viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));

    var aspect = canvas.width / canvas.height;
    var projectionMatrix = perspective(90, aspect, 0.1, 1000);

    var projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    const div = document.getElementById('key_code');

    div.addEventListener('mouseover', (event) => {
        gl.uniform1f(gl.getUniformLocation(program, "key_code"), 1.0);
        mouseover = true;
    });

    div.addEventListener('mouseout', (event) => {
        gl.uniform1f(gl.getUniformLocation(program, "key_code"), 0.0);
        mouseover = false;
    });


    //키보드를 누를때
    document.onkeydown = function (event) {
        if (event.key == "3") {
            key3 = true;
        }
        if (event.key == "4") {
            key4 = true;
        }
        if (event.key == "5") {
            key5 = true;
        }
        if (event.key == "6") {
            key6 = true;
        }
        if (event.key == "e") {
            keyE = true;
        }
        if (event.key == "r") {
            keyR = true;
        }
        if (event.key == "t") {
            keyT = true;
        }
        if (event.key == "y") {
            keyY = true;
        }
        if (event.key == "d") {
            keyD = true;
        }
        if (event.key == "f") {
            keyF = true;
        }
        if (event.key == "g") {
            keyG = true;
        }
        if (event.key == "h") {
            keyH = true;
        }
        if (event.key == "c") {
            keyC = true;
        }
        if (event.key == "v") {
            keyV = true;

        }
        if (event.key == "b") {
            keyB = true;

        }
        if (event.key == "n") {
            keyN = true;
        }
        playAudio();
    }
    document.onkeyup = function (event) {
        if (event.key == "3") {
            key3 = false;
        }
        if (event.key == "4") {
            key4 = false;
        }
        if (event.key == "5") {
            key5 = false;
        }
        if (event.key == "6") {
            key6 = false;
        }
        if (event.key == "e") {
            keyE = false;
        }
        if (event.key == "r") {
            keyR = false;
        }
        if (event.key == "t") {
            keyT = false;
        }
        if (event.key == "y") {
            keyY = false;
        }
        if (event.key == "d") {
            keyD = false;
            time[0] = 1;
            setTimeout(function () {
                time[0] = 2;
            }, 200);
            setTimeout(function () {
                time[0] = 3;
            }, 400);
            setTimeout(function () {
                time[0] = 0;
            }, 600);
        }
        if (event.key == "f") {
            keyF = false;
            time[1] = 1;
            setTimeout(function () {
                time[1] = 2;
            }, 200);
            setTimeout(function () {
                time[1] = 3;
            }, 400);
        }
        if (event.key == "g") {
            keyG = false;
            time[2] = 1;
            setTimeout(function () {
                time[2] = 2;
            }, 200);
            setTimeout(function () {
                time[2] = 3;
            }, 400);
        }
        if (event.key == "h") {
            keyH = false;
            time[3] = 1;
            setTimeout(function () {
                time[3] = 2;
            }, 200);
            setTimeout(function () {
                time[3] = 3;
            }, 400);
            setTimeout(function () {
                time[3] = 0;
            }, 600);
        }
        if (event.key == "c") {
            keyC = false;

            time[4] = 1;
            setTimeout(function () {
                time[4] = 2;
            }, 300);
            setTimeout(function () {
                time[4] = 3;
            }, 600);
            setTimeout(function () {
                time[4] = 0;
            }, 900);
        }
        if (event.key == "v") {
            keyV = false;
            time[5] = 1;
            setTimeout(function () {
                time[5] = 2;
            }, 300);
            setTimeout(function () {
                time[5] = 3;
            }, 600);
            setTimeout(function () {
                time[5] = 0;
            }, 900);
        }
        if (event.key == "b") {
            keyB = false;
            time[6] = 1;
            setTimeout(function () {
                time[6] = 2;
            }, 300);
            setTimeout(function () {
                time[6] = 3;
            }, 600);
            setTimeout(function () {
                time[6] = 0;
            }, 900);

        }
        if (event.key == "n") {
            keyN = false;
            time[7] = 1;
            setTimeout(function () {
                time[7] = 2;
            }, 300);
            setTimeout(function () {
                time[7] = 3;
            }, 600);
            setTimeout(function () {
                time[7] = 0;
            }, 900);
        }
    }
    document.getElementById("change").onclick = function () { //LightingMode1,2를 고르고 change 버튼을 누를때
        if (document.getElementById("mode1").checked)
            lightingMode = 1;
        else
            lightingMode = 2;
    }

    setLighting(program);
    setTexture();
    render();
};

function setLighting(program) { //Lighting
    var lightAmbient = [0.0, 0.0, 0.0, 1.0];
    var lightDiffuse = [1.0, 1.0, 1.0, 1.0];
    var lightSpecular = [1.0, 1.0, 1.0, 1.0];

    var matAmbient = [1.0, 1.0, 1.0, 1.0];
    var matDiffuse = [1.0, 1.0, 1.0, 1.0];
    var matSpecular = [1.0, 1.0, 1.0, 1.0];


    var ambientProduct = mult(lightAmbient, matAmbient);
    var diffuseProduct = mult(lightDiffuse, matDiffuse);
    var specularProduct = mult(lightSpecular, matSpecular);


    lightSrcLoc = gl.getUniformLocation(program, "lightSrc");
    gl.uniform4fv(lightSrcLoc, lightSrc);

    gl.uniform3f(gl.getUniformLocation(program, "kAtten"), 0.2, 0.2, 0.2);
    gl.uniform3f(gl.getUniformLocation(program, "spotDir"), 0.0, -1.0, 0.0);
    gl.uniform1f(gl.getUniformLocation(program, "spotExp"), 5.0);

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), ambientProduct);
    diffuseProductLoc = gl.getUniformLocation(program, "diffuseProduct");
    gl.uniform4fv(diffuseProductLoc, diffuseProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), specularProduct);

    gl.uniform1f(gl.getUniformLocation(program, "matShininess"), 10000.0);
    gl.uniform3f(gl.getUniformLocation(program, "eyePos"), 0.3, 3, 0.3);
};

function setTexture() { //texture mapping

    texture[0] = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture[0]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image[0]);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR);


    texture[1] = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture[1]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image[1]);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    texture[2] = gl.createTexture();
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texture[2]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image[2]);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    texture[3] = gl.createTexture();
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, texture[3]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image[3]);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    texture[4] = gl.createTexture();
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, texture[4]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image[4]);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    texture[5] = gl.createTexture();
    gl.activeTexture(gl.TEXTURE5);
    gl.bindTexture(gl.TEXTURE_2D, texture[5]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image[5]);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    texture[6] = gl.createTexture();
    gl.activeTexture(gl.TEXTURE6);
    gl.bindTexture(gl.TEXTURE_2D, texture[6]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image[6]);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    texture[7] = gl.createTexture();
    gl.activeTexture(gl.TEXTURE7);
    gl.bindTexture(gl.TEXTURE_2D, texture[7]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image[7]);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    texture[8] = gl.createTexture();
    gl.activeTexture(gl.TEXTURE8);
    gl.bindTexture(gl.TEXTURE_2D, texture[8]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image[8]);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    
    texture[9] = gl.createTexture();
    gl.activeTexture(gl.TEXTURE9);
    gl.bindTexture(gl.TEXTURE_2D, texture[9]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image[9]);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    texture[10] = gl.createTexture();
    gl.activeTexture(gl.TEXTURE10);
    gl.bindTexture(gl.TEXTURE_2D, texture[10]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image[10]);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    texture[11] = gl.createTexture();
    gl.activeTexture(gl.TEXTURE11);
    gl.bindTexture(gl.TEXTURE_2D, texture[11]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image[11]);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    texture[12] = gl.createTexture();
    gl.activeTexture(gl.TEXTURE12);
    gl.bindTexture(gl.TEXTURE_2D, texture[12]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image[12]);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    texture[13] = gl.createTexture();
    gl.activeTexture(gl.TEXTURE13);
    gl.bindTexture(gl.TEXTURE_2D, texture[13]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image[13]);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    
    texture[14] = gl.createTexture();
    gl.activeTexture(gl.TEXTURE14);
    gl.bindTexture(gl.TEXTURE_2D, texture[14]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image[14]);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    texture[15] = gl.createTexture();
    gl.activeTexture(gl.TEXTURE15);
    gl.bindTexture(gl.TEXTURE_2D, texture[15]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image[15]);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (mouseover) //keyCode 글자에 마우스가 올라갈경우 조건 생성
        gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
    LanchPadCubeColorChange(key3, -1.5, -1.5);
    if (mouseover)
        gl.uniform1i(gl.getUniformLocation(program, "texture"), 1);
    LanchPadCubeColorChange(key4, -0.3, -1.5);
    if (mouseover)
        gl.uniform1i(gl.getUniformLocation(program, "texture"), 2);
    LanchPadCubeColorChange(key5, 0.9, -1.5);
    if (mouseover)
        gl.uniform1i(gl.getUniformLocation(program, "texture"), 3);
    LanchPadCubeColorChange(key6, 2.1, -1.5);
    if (mouseover)
        gl.uniform1i(gl.getUniformLocation(program, "texture"), 4);
    LanchPadCubeColorChange(keyE, -1.5, -0.3);
    if (mouseover)
        gl.uniform1i(gl.getUniformLocation(program, "texture"), 5);
    LanchPadCubeColorChange(keyR, -0.3, -0.3);
    if (mouseover)
        gl.uniform1i(gl.getUniformLocation(program, "texture"), 6);
    LanchPadCubeColorChange(keyT, 0.9, -0.3);
    if (mouseover)
        gl.uniform1i(gl.getUniformLocation(program, "texture"), 7);
    LanchPadCubeColorChange(keyY, 2.1, -0.3);
    if (mouseover)
        gl.uniform1i(gl.getUniformLocation(program, "texture"), 8);
    LanchPadCubeColorChange(keyD, -1.5, 0.9);
    if (mouseover)
        gl.uniform1i(gl.getUniformLocation(program, "texture"), 9);
    LanchPadCubeColorChange(keyF, -0.3, 0.9);
    if (mouseover)
        gl.uniform1i(gl.getUniformLocation(program, "texture"), 10);
    LanchPadCubeColorChange(keyG, 0.9, 0.9);
    if (mouseover)
        gl.uniform1i(gl.getUniformLocation(program, "texture"), 11);
    LanchPadCubeColorChange(keyH, 2.1, 0.9);
    if (mouseover)
        gl.uniform1i(gl.getUniformLocation(program, "texture"), 12);
    LanchPadCubeColorChange(keyC, -1.5, 2.1);
    if (mouseover)
        gl.uniform1i(gl.getUniformLocation(program, "texture"), 13);
    LanchPadCubeColorChange(keyV, -0.3, 2.1);
    if (mouseover)
        gl.uniform1i(gl.getUniformLocation(program, "texture"), 14);
    LanchPadCubeColorChange(keyB, 0.9, 2.1);
    if (mouseover)
        gl.uniform1i(gl.getUniformLocation(program, "texture"), 15);
    LanchPadCubeColorChange(keyN, 2.1, 2.1);

    //런치패드 틀 구성(검은색 틀)
    gl.uniform4f(diffuseProductLoc, 0.0, 0.0, 0.0, 1.0); //런치패드 틀 색상(검정)

    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(trballMatrix));
    gl.drawArrays(gl.TRIANGLES, numVertCubeTri, numVertGroundTri);


    window.requestAnimationFrame(render);//render 다시부르기
}

function playAudio() {
    var audio_key3 = new Audio("key3.wav");
    var audio_key4 = new Audio("key4.wav");
    var audio_key5 = new Audio("key5.wav");
    var audio_key6 = new Audio("key6.wav");

    var audio_keyE = new Audio("keyE.wav");
    var audio_keyR = new Audio("keyR.wav");
    var audio_keyT = new Audio("keyT.wav");
    var audio_keyY = new Audio("keyY.wav");

    var audio_keyD = new Audio("keyD.wav");
    var audio_keyF = new Audio("keyF.wav");
    var audio_keyG = new Audio("keyG.wav");
    var audio_keyH = new Audio("keyH.wav");

    var audio_keyC = new Audio("keyC.wav");
    var audio_keyV = new Audio("keyV.wav");
    var audio_keyB = new Audio("keyB.wav");
    var audio_keyN = new Audio("keyN.wav");//오디오를 넣을 객체 생성

    if (key3)//특정키가 눌릴경우 오디오 재생
        audio_key3.play();
    if (key4)
        audio_key4.play();
    if (key5)
        audio_key5.play();
    if (key6)
        audio_key6.play();

    if (keyE)
        audio_keyE.play();
    if (keyR)
        audio_keyR.play();
    if (keyT)
        audio_keyT.play();
    if (keyY)
        audio_keyY.play();

    if (keyD)
        audio_keyD.play();
    if (keyF)
        audio_keyF.play();
    if (keyG)
        audio_keyG.play();
    if (keyH)
        audio_keyH.play();


    if (keyC)
        audio_keyC.play();
    if (keyV)
        audio_keyV.play();
    if (keyB)
        audio_keyB.play();
    if (keyN)
        audio_keyN.play();

}

function LanchPadCubeColorChange(key, x, z) {//큐브를 여러개 생성할것 이므로 함수로 따로 만들기(여러번 부를거기 때문)
    if (key)
        gl.uniform4f(diffuseProductLoc, 1.0, 1.0, 0.0, 1.0);//런치패드 눌린 색상(노랑색)
    else
        gl.uniform4f(diffuseProductLoc, 0.9, 0.9, 0.9, 1.0);//런치패드 버튼 기본색상(회색)


    modelMatrix = mult(trballMatrix, translate(x, 0, z));
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
    gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);

    if (lightingMode == 2) {
        if (key3) {
            gl.uniform4f(diffuseProductLoc, 1.0, 0.5, 0.0, 1.0);//런치패드 눌린 색상(주황색)
            modelMatrix = mult(trballMatrix, translate(-1.5, 0, -0.3));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);
        }
        if (key4) {
            gl.uniform4f(diffuseProductLoc, 1.0, 0.5, 0.0, 1.0);//런치패드 눌린 색상(주황색)
            modelMatrix = mult(trballMatrix, translate(-0.3, 0, -0.3));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);
        }
        if (key5) {
            gl.uniform4f(diffuseProductLoc, 1.0, 0.5, 0.0, 1.0);//런치패드 눌린 색상(주황색)
            modelMatrix = mult(trballMatrix, translate(0.9, 0, -0.3));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);
        }
        if (key6) {
            gl.uniform4f(diffuseProductLoc, 1.0, 0.5, 0.0, 1.0);//런치패드 눌린 색상(주황색)
            modelMatrix = mult(trballMatrix, translate(2.1, 0, -0.3));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);
        }
        if (keyE) {
            gl.uniform4f(diffuseProductLoc, 1.0, 0.5, 0.0, 1.0);//런치패드 눌린 색상(주황색)
            modelMatrix = mult(trballMatrix, translate(-1.49, 0.1, -1.48));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);

            gl.uniform4f(diffuseProductLoc, 1.0, 0.5, 0.0, 1.0);//런치패드 눌린 색상(주황색)
            modelMatrix = mult(trballMatrix, translate(-1.5, 0, 0.9));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);
        }
        if (keyR) {
            gl.uniform4f(diffuseProductLoc, 1.0, 0.5, 0.0, 1.0);//런치패드 눌린 색상(주황색)
            modelMatrix = mult(trballMatrix, translate(-0.3, 0, -1.5));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);

            gl.uniform4f(diffuseProductLoc, 1.0, 0.5, 0.0, 1.0);//런치패드 눌린 색상(주황색)
            modelMatrix = mult(trballMatrix, translate(-0.3, 0, 0.9));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);
        }
        if (keyT) {
            gl.uniform4f(diffuseProductLoc, 1.0, 0.5, 0.0, 1.0);//런치패드 눌린 색상(주황색)
            modelMatrix = mult(trballMatrix, translate(0.9, 0, -1.5));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);

            gl.uniform4f(diffuseProductLoc, 1.0, 0.5, 0.0, 1.0);//런치패드 눌린 색상(주황색)
            modelMatrix = mult(trballMatrix, translate(0.9, 0, 0.9));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);
        }
        if (keyY) {
            gl.uniform4f(diffuseProductLoc, 1.0, 0.5, 0.0, 1.0);//런치패드 눌린 색상(주황색)
            modelMatrix = mult(trballMatrix, translate(2.1, 0, -1.5));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);

            gl.uniform4f(diffuseProductLoc, 1.0, 0.5, 0.0, 1.0);//런치패드 눌린 색상(주황색)
            modelMatrix = mult(trballMatrix, translate(2.1, 0, 0.9));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);
        }


        if (time[0] == 1) {
            gl.uniform4f(diffuseProductLoc, 1.0, 0.0, 0.3, 1.0);//런치패드 눌린 색상(빨간색)

            modelMatrix = mult(trballMatrix, translate(-1.5, 0, -0.3));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);

            modelMatrix = mult(trballMatrix, translate(-0.3, 0, 0.9));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);

            modelMatrix = mult(trballMatrix, translate(-1.5, 0, 2.1));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);
        }
        if (time[0] == 2) {
            gl.uniform4f(diffuseProductLoc, 1.0, 0.0, 0.3, 1.0);//런치패드 눌린 색상(빨간색)

            modelMatrix = mult(trballMatrix, translate(-1.49, 0.1, -1.48));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);

            modelMatrix = mult(trballMatrix, translate(0.9, 0, 0.9));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);
        }
        if (time[0] == 3) {
            gl.uniform4f(diffuseProductLoc, 1.0, 0.0, 0.3, 1.0);//런치패드 눌린 색상(빨간색)

            modelMatrix = mult(trballMatrix, translate(2.1, 0, 0.9));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);
        }
        if (time[1] == 1) {
            gl.uniform4f(diffuseProductLoc, 1.0, 0.0, 0.3, 1.0);//런치패드 눌린 색상(빨간색)

            modelMatrix = mult(trballMatrix, translate(-1.5, 0, 0.9));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);

            modelMatrix = mult(trballMatrix, translate(-0.3, 0, 2.1));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);

            modelMatrix = mult(trballMatrix, translate(0.9, 0, 0.9));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);

            modelMatrix = mult(trballMatrix, translate(-0.3, 0, -0.3));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);
        }

        if (time[1] == 2) {
            gl.uniform4f(diffuseProductLoc, 1.0, 0.0, 0.3, 1.0);//런치패드 눌린 색상(빨간색색)

            modelMatrix = mult(trballMatrix, translate(2.1, 0, 0.9));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);

            modelMatrix = mult(trballMatrix, translate(-0.3, 0, -1.5));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);
        }

        if (time[2] == 1) {
            gl.uniform4f(diffuseProductLoc, 1.0, 0.0, 0.3, 1.0);//런치패드 눌린 색상(빨간색색)

            modelMatrix = mult(trballMatrix, translate(-0.3, 0, 0.9));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);

            modelMatrix = mult(trballMatrix, translate(0.9, 0, 2.1));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);

            modelMatrix = mult(trballMatrix, translate(2.1, 0, 0.9));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);

            modelMatrix = mult(trballMatrix, translate(0.9, 0, -0.3));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);
        }
        if (time[2] == 2) {
            gl.uniform4f(diffuseProductLoc, 1.0, 0.0, 0.3, 1.0);//런치패드 눌린 색상(빨간색)

            modelMatrix = mult(trballMatrix, translate(-1.5, 0, 0.9));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);

            modelMatrix = mult(trballMatrix, translate(0.9, 0, -1.5));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);
        }
        if (time[3] == 1) {
            gl.uniform4f(diffuseProductLoc, 1.0, 0.0, 0.3, 1.0);//런치패드 눌린 색상(빨간색)

            modelMatrix = mult(trballMatrix, translate(0.9, 0, 0.9));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);

            modelMatrix = mult(trballMatrix, translate(2.1, 0, 2.1));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);

            modelMatrix = mult(trballMatrix, translate(2.1, 0, -0.3));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);

        }
        if (time[3] == 2) {
            gl.uniform4f(diffuseProductLoc, 1.0, 0.0, 0.3, 1.0);//런치패드 눌린 색상(빨간색)

            modelMatrix = mult(trballMatrix, translate(-0.3, 0, 0.9));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);

            modelMatrix = mult(trballMatrix, translate(2.1, 0, -1.5));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);
        }
        if (time[3] == 3) {
            gl.uniform4f(diffuseProductLoc, 1.0, 0.0, 0.3, 1.0);//런치패드 눌린 색상(핑크색)

            modelMatrix = mult(trballMatrix, translate(-1.5, 0, 0.9));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);
        }
        if (time[4] == 1) {
            gl.uniform4f(diffuseProductLoc, 0.0, 1.0, 0.0, 1.0);//런치패드 눌린 색상(녹색)
            modelMatrix = mult(trballMatrix, translate(-1.49, 0.1, -1.48));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);
        }
        if (time[4] == 2) {
            gl.uniform4f(diffuseProductLoc, 0.0, 1.0, 0.0, 1.0);//런치패드 눌린 색상(녹색)
            modelMatrix = mult(trballMatrix, translate(-1.5, 0.0, -0.3));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);
        }
        if (time[4] == 3) {
            gl.uniform4f(diffuseProductLoc, 0.0, 1.0, 0.0, 1.0);//런치패드 눌린 색상(녹색)
            modelMatrix = mult(trballMatrix, translate(-1.5, 0.0, 0.9));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);
        }
        if (time[5] == 1) {
            gl.uniform4f(diffuseProductLoc, 0.0, 1.0, 0.0, 1.0);//런치패드 눌린 색상(녹색)
            modelMatrix = mult(trballMatrix, translate(-0.3, 0.0, 0.9));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);
        }
        if (time[5] == 2) {
            gl.uniform4f(diffuseProductLoc, 0.0, 1.0, 0.0, 1.0);//런치패드 눌린 색상(녹색)
            modelMatrix = mult(trballMatrix, translate(-0.3, 0.0, -0.3));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);
        }
        if (time[5] == 3) {
            gl.uniform4f(diffuseProductLoc, 0.0, 1.0, 0.0, 1.0);//런치패드 눌린 색상(녹색)
            modelMatrix = mult(trballMatrix, translate(-0.3, 0.0, -1.5));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);
        }
        if (time[6] == 1) {
            gl.uniform4f(diffuseProductLoc, 0.0, 1.0, 0.0, 1.0);//런치패드 눌린 색상(녹색)
            modelMatrix = mult(trballMatrix, translate(0.9, 0.0, 0.9));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);
        }
        if (time[6] == 2) {
            gl.uniform4f(diffuseProductLoc, 0.0, 1.0, 0.0, 1.0);//런치패드 눌린 색상(녹색)
            modelMatrix = mult(trballMatrix, translate(0.9, 0.0, -0.3));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);
        }
        if (time[6] == 3) {
            gl.uniform4f(diffuseProductLoc, 0.0, 1.0, 0.0, 1.0);//런치패드 눌린 색상(녹색)
            modelMatrix = mult(trballMatrix, translate(0.9, 0.0, -1.5));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);
        }
        if (time[7] == 3) {
            gl.uniform4f(diffuseProductLoc, 0.0, 1.0, 0.0, 1.0);//런치패드 눌린 색상(녹색)
            modelMatrix = mult(trballMatrix, translate(2.1, 0.0, 0.9));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);
        }
        if (time[7] == 2) {
            gl.uniform4f(diffuseProductLoc, 0.0, 1.0, 0.0, 1.0);//런치패드 눌린 색상(녹색)
            modelMatrix = mult(trballMatrix, translate(2.1, 0.0, -0.3));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);
        }
        if (time[7] == 1) {
            gl.uniform4f(diffuseProductLoc, 0.0, 1.0, 0.0, 1.0);//런치패드 눌린 색상(녹색)
            modelMatrix = mult(trballMatrix, translate(2.1, 0.0, -1.5));
            gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, numVertCubeTri);
        }


    }
}


function generateLaunchPadCube() { //기본 런치패드의 큐브 모양 한개 만들기(나중에 여러개 쓰기위함)
    numVertCubeTri = 0;
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
    quad(6, 5, 1, 2);
}

function quad(a, b, c, d) {
    vertexPos = [ //사각형의 꼭짓점
        vec4(-0.5, -0.5, -0.5, 1.0),
        vec4(0.5, -0.5, -0.5, 1.0),
        vec4(0.5, 0.5, -0.5, 1.0),
        vec4(-0.5, 0.5, -0.5, 1.0),
        vec4(-0.5, -0.5, 0.5, 1.0),
        vec4(0.5, -0.5, 0.5, 1.0),
        vec4(0.5, 0.5, 0.5, 1.0),
        vec4(-0.5, 0.5, 0.5, 1.0)
    ];
    vertexColor = [
        vec4(0.0, 0.0, 0.0, 1.0),   // black
        vec4(1.0, 0.0, 0.0, 1.0),   // red
        vec4(1.0, 1.0, 0.0, 1.0),   // yellow
        vec4(0.0, 1.0, 0.0, 1.0),   // green
        vec4(0.0, 0.0, 1.0, 1.0),   // blue
        vec4(1.0, 0.0, 1.0, 1.0),   // magenta
        vec4(1.0, 1.0, 1.0, 1.0),   // white
        vec4(0.0, 1.0, 1.0, 1.0)    // cyan
    ];

    vertexNormals = [
        vec4(-0.57735, -0.57735, -0.57735, 0.0),
        vec4(0.57735, -0.57735, -0.57735, 0.0),
        vec4(0.57735, 0.57735, -0.57735, 0.0),
        vec4(-0.57735, 0.57735, -0.57735, 0.0),
        vec4(-0.57735, -0.57735, 0.57735, 0.0),
        vec4(0.57735, -0.57735, 0.57735, 0.0),
        vec4(0.57735, 0.57735, 0.57735, 0.0),
        vec4(-0.57735, 0.57735, 0.57735, 0.0)
    ];

    var texCoord = [
        vec2(0, 0),
        vec2(0, 1),
        vec2(1, 1),
        vec2(1, 0)
    ];


    points.push(vertexPos[a]);
    normals.push(vertexNormals[a]);
    colors.push(vertexColor[a]);
    texCoords.push(texCoord[0]);
    numVertCubeTri++;
    points.push(vertexPos[b]);
    normals.push(vertexNormals[b]);
    colors.push(vertexColor[b]);
    texCoords.push(texCoord[1]);
    numVertCubeTri++;
    points.push(vertexPos[c]);
    normals.push(vertexNormals[c]);
    colors.push(vertexColor[c]);
    texCoords.push(texCoord[2]);
    numVertCubeTri++;

    points.push(vertexPos[a]);
    normals.push(vertexNormals[a]);
    colors.push(vertexColor[a]);
    texCoords.push(texCoord[0]);
    numVertCubeTri++;
    points.push(vertexPos[c]);
    normals.push(vertexNormals[c]);
    colors.push(vertexColor[c]);
    texCoords.push(texCoord[2]);
    numVertCubeTri++;
    points.push(vertexPos[d]);
    normals.push(vertexNormals[d]);
    colors.push(vertexColor[d]);
    texCoords.push(texCoord[3]);
    numVertCubeTri++;
}


function generateGround(scale) { //런치패드 틀 만들기
    numVertGroundTri = 0;

    var texCoord = [
        vec2(0, 0),
        vec2(0, 1),
        vec2(1, 1),
        vec2(1, 0)
    ];

    for (var x = -scale; x < scale; x++) {
        for (var z = -scale; z < scale; z++) {

            points.push(vec4(x, 0.0, z, 1.0));
            normals.push(vec4(0.0, 1.0, 0.0, 0.0));
            texCoords.push(texCoord[0]);
            numVertGroundTri++;
            points.push(vec4(x, 0.0, z + 1.5, 1.0));
            normals.push(vec4(0.0, 1.0, 0.0, 0.0));
            texCoords.push(texCoord[1]);
            numVertGroundTri++;
            points.push(vec4(x + 1.5, 0.0, z + 1.5, 1.0));
            normals.push(vec4(0.0, 1.0, 0.0, 0.0));
            texCoords.push(texCoord[2]);
            numVertGroundTri++;

            points.push(vec4(x, 0.0, z, 1.0));
            normals.push(vec4(0.0, 1.0, 0.0, 0.0));
            texCoords.push(texCoord[0]);
            numVertGroundTri++;
            points.push(vec4(x + 1.5, 0.0, z + 1.5, 1.0));
            normals.push(vec4(0.0, 1.0, 0.0, 0.0));
            texCoords.push(texCoord[2]);
            numVertGroundTri++;
            points.push(vec4(x + 1.5, 0.0, z, 1.0));
            normals.push(vec4(0.0, 1.0, 0.0, 0.0));
            texCoords.push(texCoord[3]);
            numVertGroundTri++;
        }
    }
}
