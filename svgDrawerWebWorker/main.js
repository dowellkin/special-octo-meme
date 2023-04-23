const canvases = document.querySelectorAll(".section__bg");
const svg = document.querySelector("svg");
const pathElement = svg.querySelector("path");
let gap = 30;
let quality = 15;
let imageOffset = 80;
let wavesOffset = 30;
const animationSpeed = 1.5;
const contexts = [];

const tempCanvas = document.querySelector(".temp-canvas");
const myWorker = new Worker("worker.js");

let someData = {
    imageAlpha: 0,
};
let dataPrev = Date.now();

let img = new window.Image();
img.crossOrigin = `Anonymous`;
let imageShadow;

img.src = "./assets/logo-my-biz-15-darker.jpg";

img.onload = function() {
    // const tempCanvas = document.createElement("canvas");
    // tempCanvas.width = img.width;
    // tempCanvas.height = img.height;
    tempCanvas.width = svg.clientWidth;
    tempCanvas.height = svg.clientHeight;
    console.log(svg.clientWidth, svg.clientWidth);

    const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true, alpha: false });
    // const left = (tempCanvas.width - img.width) / 2;
    // const top = (tempCanvas.height - img.height) / 2;
    // tempCtx.drawImage(img, left, top);
    drawImageScaled(img, tempCtx)

    let imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    let data = imgData.data;
    imageShadow = data;

    let part = 0;
    let dt = 0.1;
    function makeImageDarker(alpha = 1) {
        tempCtx.save();
        // tempCtx.fillStyle = "rgba(0, 0, 0, 1)";
        // tempCtx.fillRect(0, 0, canvases[0].width, canvases[0].height);
        tempCtx.canvas.width = tempCtx.canvas.width;
        drawImageScaled(img, tempCtx);
        
        tempCtx.fillStyle = `rgba(0, 0, 0, ${1 - alpha})`;
        tempCtx.fillRect(0, 0, canvases[0].width, canvases[0].height);
        // tempCtx.globalAlpha = alpha;
        // tempCtx.drawImage(img, left, top);
        tempCtx.restore();

        part += 1;
    }

    function update() {
        imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        data = imgData.data;
        imageShadow = data;
    }

    window.makeImageDarker = makeImageDarker;

    function startAnimaton(local_part) {   
        function animateFunction() {
            if(local_part != part) {
                update();
            }

            // contexts.forEach((ctx) => {
            //     draw(ctx, data, dt);
            // });
            draw(null, data, dt);
            // draw(contexts[0], data, dt);
    
            dt += animationSpeed;
    
            //animate stuff
            window.requestAnimationFrame(animateFunction);
        }
        window.requestAnimationFrame(animateFunction);
    }

    // TweenLite.to(someData, .5, { imageAlpha: 1, ease: "power2.out" });
    startAnimaton(part);


    
    (window.onresize = () => {
        canvases.forEach(canvas => {
            canvas.width = innerWidth, canvas.height = innerHeight;
        });
        tempCanvas.width = svg.clientWidth;
        tempCanvas.height = svg.clientHeight;
        drawImageScaled(img, tempCtx);
        imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        data = imgData.data;
        imageShadow = data;

        if(innerWidth < 1024) {
            quality = 10
        }

        if(innerWidth < 850) {
            quality = 5
            gap = 15
            imageOffset = 30
            wavesOffset = 20;
        }
    })();
}

for (let canvasEl of canvases) {
    // canvasEl.width = canvasEl.clientWidth;
    // canvasEl.height = canvasEl.clientHeight;
    // const ctx = canvasEl.getContext("2d", { alpha: false });
    // contexts.push(ctx);

    draw(window.ctx, null, 1);
}

function hideImage(time = 3) {
    TweenLite.to(someData, time, { imageAlpha: 0, ease: "power2.out" });
}

function showImage(time = 3) {
    TweenLite.to(someData, time, { imageAlpha: 1, ease: "power2.out" });
}

document.querySelector(".ctrl-btn--hide").addEventListener('click', () => hideImage());
document.querySelector(".ctrl-btn--show").addEventListener('click', () => showImage());

function draw(ctx, imageData, perlinOffset) {
    // ctx.beginPath();
    // ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // ctx.fillStyle = "#000";
    // ctx.fill();
    // ctx.canvas.width = ctx.canvas.width;

    let local_gap = gap;
    if(local_gap < 1) local_gap = 20;

    myWorker.postMessage({
        gap: local_gap,
        quality,
        clientHeight: svg.clientHeight,
        clientWidth: svg.clientWidth,
        perlinOffset,
    });

    let path = '';
        
    // ctx.beginPath();
    if(false) {
        for (let y = gap; y < svg.clientHeight; y += local_gap) {
            
            const prln = perlin.get(perlinOffset / 200, (y + perlinOffset / 2) / 200);
            let prln_val = map_range(prln, 0, 1, 0, 30);
            // ctx.moveTo(0, y - prln_val);
            path += `M${0} ${y - prln_val.toFixed(4)}`;
            for (let x = 0; x < svg.clientWidth + quality; x += quality) {
                let local_y = y;
                if(imageData) {
                    const pixelStart = (svg.clientWidth * y + x) * 4;
                    const val = imageData[pixelStart];
                    local_y -= map_range(val, 0, 255, 0, 80) * someData.imageAlpha;
                }
                if(perlinOffset) {
                    const prln = perlin.get((x + perlinOffset) / 200, (y + perlinOffset / 2) / 200);
                    let prln_val = map_range(prln, 0, 1, 0, 30);
                    local_y -= prln_val;
                }
                // ctx.lineTo(x, local_y << 0);
                path += `L${x} ${local_y.toFixed(4)}`;

                let dateNow = Date.now();
                if(dateNow >= dataPrev + 70) {
                    console.log(dateNow - dataPrev, x, local_y, perlinOffset, y + perlinOffset / 2);
                }
                dataPrev = dateNow;
            }
            
        }

        pathElement.setAttribute("d", path);
    } else {
        
    }
    // console.log(path);
    // ctx.strokeStyle = "rgba(255, 255, 255, .6)";
    // ctx.stroke();
}

function map_range(value, low1, high1, low2, high2) {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}

function drawImageScaled(img, ctx) {
    const canvas = ctx.canvas ;
    const hRatio = canvas.width  / img.width    ;
    const vRatio =  canvas.height / img.height  ;
    const ratio  = Math.min ( hRatio, vRatio );
    const centerShift_x = ( canvas.width - img.width*ratio ) / 2;
    const centerShift_y = ( canvas.height - img.height*ratio ) / 2;  
    ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.drawImage(img, 0,0, img.width, img.height,
                        centerShift_x,centerShift_y,img.width*ratio, img.height*ratio);  
}


let firstTime = true;
function drawFunc(e) {
    if (firstTime) {
        firstTime = false;
        TweenLite.to(someData, 0.5, { imageAlpha: 1, ease: "power2.out" });
    }
    let path = "";
    for (let y = gap; y < svg.clientHeight; y += gap) {
                
        const prln = e.data[y][0];
        let prln_val = map_range(prln, 0, 1, 0, 30);
        // ctx.moveTo(0, y - prln_val);
        path += `M${0} ${y - prln_val.toFixed(4)}`;
        for (let x = 0; x < svg.clientWidth + quality; x += quality) {
            let local_y = y;
            if(imageShadow) {
                const pixelStart = (svg.clientWidth * y + x) * 4;
                const val = imageShadow[pixelStart];
                local_y -= map_range(val, 0, 255, 0, imageOffset) * someData.imageAlpha;
            }
            if(e.data.perlinOffset) {
                const prln = e.data[y][x];
                let prln_val = map_range(prln, 0, 1, 0, wavesOffset);
                local_y -= prln_val;
            }
            // ctx.lineTo(x, local_y << 0);
            path += `L${x} ${local_y.toFixed(4)}`;

            let dateNow = Date.now();
            // if(dateNow >= dataPrev + 70) {
            //     console.log(dateNow - dataPrev, x, local_y, perlinOffset, y + perlinOffset / 2);
            // }
            dataPrev = dateNow;
        }
        
    }
    

    pathElement.setAttribute('d', path);
}
myWorker.addEventListener("message", drawFunc)