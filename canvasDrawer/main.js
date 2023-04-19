const canvases = document.querySelectorAll(".section__bg canvas:not(.temp-canvas)");
const gap = 30;
let quality = 15;
const animationSpeed = 1.5;
const contexts = [];

let someData = {
    imageAlpha: 0,
};
let dataPrev = Date.now();

let img = new window.Image();
img.crossOrigin = `Anonymous`;

img.src = "./assets/logo-my-biz-15-darker.jpg";

img.onload = function() {
    const tempCanvas = document.createElement("canvas");
    // const tempCanvas = document.querySelector(".temp-canvas");
    // tempCanvas.width = img.width;
    // tempCanvas.height = img.height;
    tempCanvas.width = canvases[0].width;
    tempCanvas.height = canvases[0].height;

    const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true, alpha: false });
    const left = (tempCanvas.width - img.width) / 2;
    const top = (tempCanvas.height - img.height) / 2;
    // tempCtx.drawImage(img, left, top);
    drawImageScaled(img, tempCtx)

    let imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    let data = imgData.data;

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
    }

    window.makeImageDarker = makeImageDarker;

    function startAnimaton(local_part) {    
        function animateFunction() {
            if(local_part != part) {
                update();
            }

            contexts.forEach((ctx) => {
                draw(ctx, data, dt);
            });
            // draw(contexts[0], data, dt);
    
            dt += animationSpeed;
    
            //animate stuff
            window.requestAnimationFrame(animateFunction);
        }
        window.requestAnimationFrame(animateFunction);
    }

    TweenLite.to(someData, .5, { imageAlpha: 1, ease: "power2.out" });
    startAnimaton(part);


    
    (window.onresize = () => {
        canvases.forEach(canvas => {
            canvas.width = innerWidth, canvas.height = innerHeight;
        });
        tempCanvas.width = innerWidth, tempCanvas.height = innerHeight;
        drawImageScaled(img, tempCtx);
        imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        data = imgData.data;

        if(innerWidth < 1024) {
            quality = 10
        }

        if(innerWidth < 850) {
            quality = 5
        }
    })();
}

for (let canvasEl of canvases) {
    canvasEl.width = canvasEl.clientWidth;
    canvasEl.height = canvasEl.clientHeight;
    const ctx = canvasEl.getContext("2d", { alpha: false });
    contexts.push(ctx);

    draw(ctx, null, 1);
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
    ctx.beginPath();
    // ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // ctx.fillStyle = "#000";
    // ctx.fill();
    ctx.canvas.width = ctx.canvas.width;

    let local_gap = gap;
    if(local_gap < 1) local_gap = 20;
        
    ctx.beginPath();
    for (let y = gap; y < ctx.canvas.height; y += local_gap) {
        
        const prln = perlin.get(perlinOffset / 200, (y + perlinOffset / 2) / 200);
        let prln_val = map_range(prln, 0, 1, 0, 30);
        ctx.moveTo(0, y - prln_val);
            for (let x = 0; x < ctx.canvas.width + quality; x += quality) {
                let local_y = y;
                if(imageData) {
                    const pixelStart = (ctx.canvas.width * y + x) * 4;
                    const val = imageData[pixelStart];
                    local_y -= map_range(val, 0, 255, 0, 80) * someData.imageAlpha;
                }
                if(perlinOffset) {
                    const prln = perlin.get((x + perlinOffset) / 200, (y + perlinOffset / 2) / 200);
                    let prln_val = map_range(prln, 0, 1, 0, 30);
                    local_y -= prln_val;
                }
                ctx.lineTo(x, local_y << 0);

                let dateNow = Date.now();
                if(dateNow >= dataPrev + 70) {
                    console.log(dateNow - dataPrev, x, local_y, perlinOffset);
                }
                dataPrev = dateNow;
            }
        
    }
    ctx.strokeStyle = "rgba(255, 255, 255, .6)";
    ctx.stroke();
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