const canvases = document.querySelectorAll(".section__bg canvas");
const gap = 30;
const quality = 15;
const animationSpeed = 2;
const contexts = [];


let img = new window.Image();
img.crossOrigin = `Anonymous`;

img.src = "./assets/test.png";

img.onload = function() {
    const tempCanvas = document.createElement("canvas");
    // tempCanvas.width = img.width;
    // tempCanvas.height = img.height;
    tempCanvas.width = canvases[0].width;
    tempCanvas.height = canvases[0].height;

    const tempCtx = tempCanvas.getContext('2d');
    const left = (tempCanvas.width - img.width) / 2;
    const top = (tempCanvas.height - img.height) / 2;
    // tempCtx.drawImage(img, left, top);
    drawImageScaled(img, tempCtx)

    let imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    let data = imgData.data;

    let part = 0;
    let dt = 0.01;
    function makeImageDarker(alpha = 1) {
        tempCtx.fillStyle = "rgba(0, 0, 0, 1)";
        tempCtx.fillRect(0, 0, canvases[0].width, canvases[0].height);
        tempCtx.save();
        tempCtx.globalAlpha = alpha;
        // tempCtx.drawImage(img, left, top);
        drawImageScaled(img, tempCtx);
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
    startAnimaton(part);
}

for (let canvasEl of canvases) {
    canvasEl.width = canvasEl.clientWidth;
    canvasEl.height = canvasEl.clientHeight;
    const ctx = canvasEl.getContext("2d");
    contexts.push(ctx);

    draw(ctx);
}

function draw(ctx, imageData, perlinOffset) {
    ctx.beginPath();
    ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "#000";
    ctx.fill();

    let local_gap = gap;
    if(local_gap < 1) local_gap = 20;

    for (let y = gap; y < ctx.canvas.height; y += local_gap) {
        ctx.beginPath();
        ctx.moveTo(0, y);
            for (let x = 0; x < ctx.canvas.width + quality; x += quality) {
                let local_y = y;
                if(imageData) {
                    const pixelStart = (ctx.canvas.width * y + x) * 4;
                    const val = imageData[pixelStart];
                    local_y -= map_range(val, 0, 255, 0, 80);
                    // console.log(perlinOffset);
                    if(perlinOffset) {
                        const prln = perlin.get((x + perlinOffset) / 200, (y + perlinOffset / 2) / 200);
                        let prln_val = map_range(prln, 0, 1, 0, 30);
                        local_y -= prln_val;
                    }
                }
                ctx.lineTo(x, local_y);
            }
        ctx.strokeStyle = "rgba(255, 255, 255, .6)";
        ctx.stroke();
    }
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