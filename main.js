/*
 *  Dungegon generator
 *  palette: https://coolors.co/aaabbc-8b8982-373f47-6c91c2-c3c9e9
 */

var canvas, ctx;
var map = [];
var map_points = [];
var start_pos = { x: 15, y: 15 };
var finish_pos = null;

const point_size = 20;

var draw_point = (x, y) => {
  ctx.fillStyle = "#8b8982";
  ctx.fillRect(point_size * x, point_size * y, point_size, point_size);
};

var draw_map_element = (map_element, x, y) => {
  switch (map_element) {
    case "door":
      ctx.fillStyle = "#aaabbc";
      break;
    case "start":
      ctx.fillStyle = "#09bc8a";
      break;
    case "finish":
      ctx.fillStyle = "#650000";
      break;
    case "item":
      ctx.fillStyle = "#fafaff";
      break;
    case "enemy":
      ctx.fillStyle = "#ff36ab";
      break;
  }
  ctx.fillRect(
    point_size * x + 3,
    point_size * y + 3,
    point_size - 6,
    point_size - 6
  );
};

var distance = (pos1, pos2) => {
  let v = {
    x: Math.abs(pos2.x - pos1.x),
    y: Math.abs(pos2.y - pos1.y),
  };
  return Math.sqrt(v.x * v.x + v.y + v.y);
};

function next_step(pos, dir) {
  switch (dir) {
    case 3:
      return { x: pos.x - 1, y: pos.y };
    case 2:
      return { x: pos.x, y: pos.y + 1 };
    case 1:
      return { x: pos.x + 1, y: pos.y };
    default:
    case 0:
      return { x: pos.x, y: pos.y - 1 };
  }
}

function next_step_valid(next_pos) {
  let boundaries_check =
    next_pos.x > 0 && next_pos.x < 30 && next_pos.y > 0 && next_pos.y < 30;

  let map_check = false;
  if (boundaries_check) {
    map_check = map[next_pos.y][next_pos.x] == false;
  }
  return boundaries_check && map_check;
}

function random_walk_branch(start_pos, steps) {
  let pos = start_pos;
  let next_pos = null;
  for (let step = 0; step < steps; step++) {
    let retries = 10;
    do {
      let dir = Math.round(Math.random() * 3);
      next_pos = next_step(pos, dir);
      retries--;
    } while (!next_step_valid(next_pos) && retries > 0);
    if (retries > 0) {
      pos = next_pos;
      map[pos.y][pos.x] = true;
      map_points.push(pos);
      draw_point(pos.x, pos.y);
    }
  }
}

function random_walk() {
  draw_point(start_pos.x, start_pos.y);
  draw_map_element("start", start_pos.x, start_pos.y);
  map[start_pos.y][start_pos.x] = true;

  random_walk_branch(start_pos, 100);

  finish_pos = map_points.pop();
  draw_map_element("finish", finish_pos.x, finish_pos.y);

  if (Math.random() > 0.7) {
    const brances = Math.round(Math.random() * 30);
    const branch_length = Math.round(Math.random() * 30);
    for (let index = 0; index < brances; index++) {
      var branch_start_pos =
        map_points[Math.round(Math.random() * (map_points.length - 1))];
      random_walk_branch(branch_start_pos, branch_length);
    }
  }

  place_enemies(10);
  place_items_in_the_ends();
  place_items(5);
}

function place_items_in_the_ends() {
  for (let y = 1; y < 29; y++) {
    for (let x = 1; x < 29; x++) {
      if (
        map[y][x] &&
        !map[y - 1][x] &&
        !map[y + 1][x] &&
        !map[y][x - 1] &&
        map[y][x + 1] &&
        x != start_pos.x &&
        y != start_pos.y &&
        x != finish_pos.x &&
        y != finish_pos.y
      ) {
        draw_map_element("item", x, y);
      }
      if (
        map[y][x] &&
        !map[y - 1][x] &&
        !map[y + 1][x] &&
        map[y][x - 1] &&
        !map[y][x + 1] &&
        x != start_pos.x &&
        y != start_pos.y &&
        x != finish_pos.x &&
        y != finish_pos.y
      ) {
        draw_map_element("item", x, y);
      }
      if (
        map[y][x] &&
        !map[y - 1][x] &&
        map[y + 1][x] &&
        !map[y][x - 1] &&
        !map[y][x + 1] &&
        x != start_pos.x &&
        y != start_pos.y &&
        x != finish_pos.x &&
        y != finish_pos.y
      ) {
        draw_map_element("item", x, y);
      }
      if (
        map[y][x] &&
        map[y - 1][x] &&
        !map[y + 1][x] &&
        !map[y][x - 1] &&
        !map[y][x + 1] &&
        x != start_pos.x &&
        y != start_pos.y &&
        x != finish_pos.x &&
        y != finish_pos.y
      ) {
        draw_map_element("item", x, y);
      }
    }
  }
}

function place_enemies(number) {
  for (let index = 0; index < number; index++) {
    let retries = 10;
    do {
      var enemy_pos =
        map_points[Math.round(Math.random() * (map_points.length - 1))];
      retries--;
    } while (distance(start_pos, enemy_pos) < 5 && retries > 0);

    if (retries > 0) draw_map_element("enemy", enemy_pos.x, enemy_pos.y);
  }
}

function place_items(number) {
  for (let index = 0; index < number; index++) {
    var item_pos =
      map_points[Math.round(Math.random() * (map_points.length - 1))];
    draw_map_element("item", item_pos.x, item_pos.y);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  canvas = document.getElementById("canvas");
  canvas.width = 800;
  canvas.height = 600;

  ctx = canvas.getContext("2d");
  ctx.fillStyle = "#373f47";
  ctx.fillRect(0, 0, 800, 600);

  for (let y = 0; y < 30; y++) {
    map[y] = [];
    for (let x = 0; x < 30; x++) {
      map[y][x] = false;
    }
  }
  random_walk();
});
