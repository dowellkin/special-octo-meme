const section = document.querySelector('section');
const width = section.clientWidth;
const height = section.clientHeight;
let app = new PIXI.Application({ width, height });
section.appendChild(app.view);
// let sprite = PIXI.Sprite.from("test.png");
// app.stage.addChild(sprite);

//   let elapsed = 0.0;
//   // Tell our application's ticker to run a new callback every frame, passing
//   // in the amount of time that has passed since the last tick
//   app.ticker.add((delta) => {
//     // Add the time to our total elapsed time
//     elapsed += delta;
//     // Update the sprite's X position based on the cosine of our elapsed time.  We divide
//     // by 50 to slow the animation down a bit...
//     sprite.x = 100.0 + Math.cos(elapsed / 50.0) * 100.0;
//   });

const step = 30;
const quality = 30;
const wavePeriod = 200;
const waveAmplitude = 40;

const lines = new PIXI.Container();
app.stage.addChild(lines);

const texture = PIXI.Texture.from("./test.png");
const buffer = PIXI.Buffer.from(texture);

let myGraph = new PIXI.Graphics();
lines.addChild(myGraph);
drawLines();

function map_range(value, low1, high1, low2, high2) {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}

const ticker = PIXI.Ticker.shared;
ticker.autoStart = false;
ticker.stop();
const animate = (time) => {
  ticker.update(time);
  drawLines(time / 10);
  app.render(myGraph);
  requestAnimationFrame(animate);
};
animate(performance.now());

function drawLines(offset = 0) {
    myGraph.clear();
    
    myGraph.alpha = 0.3;

    myGraph.position.set(0, 0);
    myGraph.lineStyle(1, 0xffffff);
    for (let y = 0; y < app.screen.height + step; y += step) {
        myGraph.moveTo(0, y);
        for (let x = 0; x < app.screen.width + quality; x += quality) {
            let localY = y;
            let prln = perlin.get((x + offset) / wavePeriod, (y + offset) / wavePeriod);
            let prln_val = map_range(prln, 0, 1, 0, waveAmplitude);
            localY -= prln_val;
            myGraph.lineTo(x, localY);
        }
    }
}