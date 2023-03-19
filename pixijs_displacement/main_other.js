const section = document.querySelector('section');
const width = section.clientWidth;
const height = section.clientHeight;
let app = new PIXI.Application({ width, height });
section.appendChild(app.view);

const step = 30;
let loaded = false;

const lines = new PIXI.Container();
app.stage.addChild(lines);

let myGraph = new PIXI.Graphics();
lines.addChild(myGraph);
myGraph.alpha = 0.5;

myGraph.position.set(0, 0);
myGraph.lineStyle(1, 0xffffff);
for (let y = 0; y < app.screen.height + step; y += step) {
  myGraph.moveTo(0, y);
  myGraph.lineTo(app.screen.width, y);
}

const displacementSprite = PIXI.Sprite.from(
  // "./displacement_map_repeat.jpg"
  "./map2_1.png"
);
displacementSprite.scale.x = 3;
displacementSprite.scale.y = 3;
// Make sure the sprite is wrapping.
displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
const displacementFilter = new PIXI.DisplacementFilter(
  displacementSprite
);
displacementFilter.padding = 10;

displacementSprite.position = myGraph.position;

displacementFilter.scale.x = 0;
displacementFilter.scale.y = 60;

app.stage.addChild(displacementSprite);

const displacementSpriteTest = PIXI.Sprite.from(
  "./test_1.png"
);
displacementSpriteTest.anchor.set(0.5)

// Make sure the sprite is wrapping.
// displacementSpriteTest.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
const displacementFilterTest = new PIXI.DisplacementFilter(
  displacementSpriteTest
);
displacementFilterTest.padding = 10;

displacementSpriteTest.position = myGraph.position;

// displacementFilterTest.scale.x = 100;
displacementFilterTest.scale.y = 100;

app.stage.addChild(displacementSpriteTest);
displacementSpriteTest.x = width / 2;
displacementSpriteTest.y = height / 2;

myGraph.filters = [displacementFilter, displacementFilterTest];

app.ticker.add(() => {
  // Offset the sprite position to make vFilterCoord update to larger value. Repeat wrapping makes sure there's still pixels on the coordinates.
  displacementSprite.x++;
  displacementSprite.y += .4;

  if(loaded && displacementFilterTest.scale.y > 0) {
    displacementFilterTest.scale.y -= 0.4;
  }

  app.render(displacementSpriteTest);
  // Reset x to 0 when it's over width to keep values from going to very huge numbers.
  if (displacementSprite.x > displacementSprite.width) {
    displacementSprite.x = 0;
  }
});

document.querySelector(".init-onload").addEventListener('click', makeLoaded);

function makeLoaded(e) {
  loaded = true;
  e.target.remove();
}