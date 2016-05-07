import Quadtree from 'immutable-quadtrees';
import { Map as map } from 'immutable';

function boundary(x, y, width, height) {
  return map({ x, y, width, height });
}

function moving(direction, velocity) {
  const rad = direction * Math.PI/180;

  const dx = velocity * Math.cos(rad);
  const dy = velocity * Math.sin(rad);

  return map({ dx, dy });
}

function asteroid(x, y, w, h, d, v) {
  return boundary(x, y, w, h).merge(moving(d, v)).merge({ color: '#8B4513' });
}

function item(x, y, w, h, color){
  return boundary(x, y, w, h).merge({ color });
}

function move(item, bound) {
  let dx = item.get('dx');
  let dy = item.get('dy');

  if (
    item.get('x') + dx <= bound.get('x') + item.get('width') ||
    item.get('x') + dx >= bound.get('x') + bound.get('width') - item.get('width')
  ) {
    dx = -1 * dx;
  }

  if (
    item.get('y') + dy <= bound.get('y') + item.get('height') ||
    item.get('y') + dy >= bound.get('y') + bound.get('height') - item.get('height')
  ) {
    dy = -1 * dy;
  }

  return item
    .update('x', (x) => x + dx)
    .update('y', (y) => y + dy)
    .set('dx', dx)
    .set('dy', dy);
}

function generateBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function range(n) {
  return Array.apply(null, { length: n }).map(Number.call, Number);
}

function generateMap(quadtree, items) {
  const temp = Quadtree.clear(quadtree);

  return Quadtree.batchInsert(temp, items);
}

function viewport(p, w, h) {
  return boundary(
    p.get('x') - Math.floor(w / 2),
    p.get('y') - Math.floor(h / 2),
    w,
    h
  );
}

function shootAsteroid(asteroids, cannon) {
  if(asteroids.length > 30){
    return asteroids;
  }

  const direction = generateBetween(0, 359);
  const velocity = generateBetween(2, 5);
  const size = generateBetween(Math.ceil(cannon.get('width') / 2), cannon.get('width'));
  return asteroids.concat(asteroid(cannon.get('x'), cannon.get('y'), size, size, direction, velocity));
}

function drawMap(context, items, width, height) {
  context.fillStyle = '#000000';
  context.fillRect(0, 0, width, height);

  items.map((item) => {
    context.beginPath();
    context.arc(item.get('x'), item.get('y'), item.get('width'), 0, Math.PI*2);
    context.fillStyle = item.get('color');
    context.fill();
    context.closePath();
  });
}

function draw(){
  const items = [cannon].concat(asteroids);
  drawMap(context, items, width, height);
  requestAnimationFrame(draw);
}

const width = 600;
const height = 600;
const tileSize = 16;
const field = boundary(0, 0, width, height);

const cannon = item((width - tileSize) / 2, (height - tileSize) / 2, tileSize, tileSize, '#778899');

let quadtree = Quadtree.create(field);

const stage = viewport(cannon, width, height);

const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

let asteroids = shootAsteroid([], cannon);

setInterval(() => {
  asteroids = shootAsteroid(asteroids, cannon);


}, 2000);

setInterval(() => {
  asteroids = asteroids.map((item) => move(item, field, quadtree));

  quadtree = Quadtree.clear(quadtree);
  quadtree = Quadtree.batchInsert(quadtree, [cannon].concat(asteroids));

  asteroids = asteroids.map((a) => {
    if (Quadtree.search(quadtree, a).count() > 1) {
      console.log('collision detected');
      return a
        .set('color', '#FF0000');
    }

    return a
      .set('color', '#8B4513');
  });
}, 100);

requestAnimationFrame(draw);
