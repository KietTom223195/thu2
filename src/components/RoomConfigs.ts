export interface RoomFurniture {
  type:   string;
  col:    number;
  row:    number;
  width:  number;
  height: number;
  image:  string;
  scale?:  number;
}

export interface RoomConfig {
  map:         number[][];
  spawnX:      number;
  spawnY:      number;
  puzzleX:     number;
  puzzleY:     number;
  puzzleName:  string;
  furniture:   RoomFurniture[];
  floorUrl:    string;
  wallUrl:     string;
  exitX:       number;
  exitY:       number;
  exitOnTop:   boolean;
}

export const ROOM_CONFIGS: Record<number, RoomConfig> = {
  "1": {
    "exitOnTop": true,
    "exitX": 7,
    "exitY": 0,
    "spawnX": 7,
    "spawnY": 8,
    "puzzleX": 5,
    "puzzleY": 2,
    "puzzleName": "Bánh xe Caesar",
    "floorUrl": "/assets/floors/wood_floor.png",
    "wallUrl": "/assets/floors/floor_4.png",
    "map": [
      [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        3,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
      ]
    ],
    "furniture": [
      {
        "type": "DOUBLE_BOOKSHELF",
        "col": 1,
        "row": 1,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/DOUBLE_BOOKSHELF/DOUBLE_BOOKSHELF.png"
      },
      {
        "type": "DOUBLE_BOOKSHELF",
        "col": 1,
        "row": 3,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/DOUBLE_BOOKSHELF/DOUBLE_BOOKSHELF.png"
      },
      {
        "type": "WOODEN_BENCH",
        "col": 1,
        "row": 6,
        "width": 2,
        "height": 1,
        "image": "/assets/furniture/WOODEN_BENCH/WOODEN_BENCH.png"
      },
      {
        "type": "POT",
        "col": 1,
        "row": 7,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/POT/POT.png"
      },
      {
        "type": "DOUBLE_BOOKSHELF",
        "col": 13,
        "row": 1,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/DOUBLE_BOOKSHELF/DOUBLE_BOOKSHELF.png"
      },
      {
        "type": "DOUBLE_BOOKSHELF",
        "col": 13,
        "row": 3,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/DOUBLE_BOOKSHELF/DOUBLE_BOOKSHELF.png"
      },
      {
        "type": "WOODEN_BENCH",
        "col": 13,
        "row": 6,
        "width": 2,
        "height": 1,
        "image": "/assets/furniture/WOODEN_BENCH/WOODEN_BENCH.png"
      },
      {
        "type": "POT",
        "col": 14,
        "row": 7,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/POT/POT.png"
      },
      {
        "type": "PC",
        "col": 4,
        "row": 5,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/PC/PC_FRONT_ON_1.png",
        "scale": 0.95
      },
      {
        "type": "BIN",
        "col": 1,
        "row": 5,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/BIN/BIN.png"
      },
      {
        "type": "PC",
        "col": 10,
        "row": 5,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/PC/PC_FRONT_ON_1.png"
      },
      {
        "type": "BIN",
        "col": 12,
        "row": 6,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/BIN/BIN.png"
      },
      {
        "type": "CLOCK",
        "col": 3,
        "row": 1,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/CLOCK/CLOCK.png"
      },
      {
        "type": "CLOCK",
        "col": 12,
        "row": 1,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/CLOCK/CLOCK.png"
      },
      {
        "type": "HANGING_PLANT",
        "col": 4,
        "row": 1,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/HANGING_PLANT/HANGING_PLANT.png"
      },
      {
        "type": "HANGING_PLANT",
        "col": 11,
        "row": 1,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/HANGING_PLANT/HANGING_PLANT.png"
      },
      {
        "type": "BOOKSHELF",
        "col": 5,
        "row": 1,
        "width": 2,
        "height": 1,
        "image": "/assets/furniture/BOOKSHELF/BOOKSHELF.png"
      },
      {
        "type": "BOOKSHELF",
        "col": 9,
        "row": 1,
        "width": 2,
        "height": 1,
        "image": "/assets/furniture/BOOKSHELF/BOOKSHELF.png"
      },
      {
        "type": "POT",
        "col": 4,
        "row": 1,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/POT/POT.png"
      },
      {
        "type": "POT",
        "col": 11,
        "row": 1,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/POT/POT.png"
      },
      {
        "type": "DOUBLE_BOOKSHELF",
        "col": 3,
        "row": 3,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/DOUBLE_BOOKSHELF/DOUBLE_BOOKSHELF.png"
      }
    ]
  },
  "2": {
    "exitOnTop": false,
    "exitX": 7,
    "exitY": 9,
    "spawnX": 7,
    "spawnY": 2,
    "puzzleX": 5,
    "puzzleY": 7,
    "puzzleName": "Mã khoá Vigenère",
    "floorUrl": "/assets/floors/wood_floor.png",
    "wallUrl": "/assets/floors/floor_4.png",
    "map": [
      [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        3,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
      ]
    ],
    "furniture": [
      {
        "type": "DOUBLE_BOOKSHELF",
        "col": 1,
        "row": 1,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/DOUBLE_BOOKSHELF/DOUBLE_BOOKSHELF.png"
      },
      {
        "type": "DOUBLE_BOOKSHELF",
        "col": 1,
        "row": 4,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/DOUBLE_BOOKSHELF/DOUBLE_BOOKSHELF.png"
      },
      {
        "type": "DOUBLE_BOOKSHELF",
        "col": 1,
        "row": 7,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/DOUBLE_BOOKSHELF/DOUBLE_BOOKSHELF.png"
      },
      {
        "type": "WOODEN_BENCH",
        "col": 1,
        "row": 3,
        "width": 2,
        "height": 1,
        "image": "/assets/furniture/WOODEN_BENCH/WOODEN_BENCH.png"
      },
      {
        "type": "DOUBLE_BOOKSHELF",
        "col": 13,
        "row": 1,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/DOUBLE_BOOKSHELF/DOUBLE_BOOKSHELF.png"
      },
      {
        "type": "DOUBLE_BOOKSHELF",
        "col": 13,
        "row": 4,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/DOUBLE_BOOKSHELF/DOUBLE_BOOKSHELF.png"
      },
      {
        "type": "DOUBLE_BOOKSHELF",
        "col": 13,
        "row": 7,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/DOUBLE_BOOKSHELF/DOUBLE_BOOKSHELF.png"
      },
      {
        "type": "WOODEN_BENCH",
        "col": 13,
        "row": 3,
        "width": 2,
        "height": 1,
        "image": "/assets/furniture/WOODEN_BENCH/WOODEN_BENCH.png"
      },
      {
        "type": "DESK",
        "col": 4,
        "row": 2,
        "width": 2,
        "height": 1,
        "image": "/assets/furniture/DESK/DESK_FRONT.png"
      },
      {
        "type": "CHAIR",
        "col": 4,
        "row": 3,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/WOODEN_CHAIR/WOODEN_CHAIR_BACK.png"
      },
      {
        "type": "SMALL_TABLE",
        "col": 3,
        "row": 2,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/SMALL_TABLE/SMALL_TABLE_FRONT.png"
      },
      {
        "type": "CACTUS",
        "col": 4,
        "row": 1,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/CACTUS/CACTUS.png"
      },
      {
        "type": "DESK",
        "col": 10,
        "row": 2,
        "width": 2,
        "height": 1,
        "image": "/assets/furniture/DESK/DESK_FRONT.png"
      },
      {
        "type": "CHAIR",
        "col": 11,
        "row": 3,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/WOODEN_CHAIR/WOODEN_CHAIR_BACK.png"
      },
      {
        "type": "SMALL_TABLE",
        "col": 12,
        "row": 2,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/SMALL_TABLE/SMALL_TABLE_FRONT.png"
      },
      {
        "type": "CACTUS",
        "col": 11,
        "row": 1,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/CACTUS/CACTUS.png"
      },
      {
        "type": "SOFA",
        "col": 3,
        "row": 7,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/SOFA/SOFA_FRONT.png"
      },
      {
        "type": "COFFEE_TABLE",
        "col": 3,
        "row": 6,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/COFFEE_TABLE/COFFEE_TABLE.png"
      },
      {
        "type": "SOFA",
        "col": 11,
        "row": 7,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/SOFA/SOFA_FRONT.png"
      },
      {
        "type": "COFFEE_TABLE",
        "col": 12,
        "row": 6,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/COFFEE_TABLE/COFFEE_TABLE.png"
      },
      {
        "type": "CLOCK",
        "col": 3,
        "row": 1,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/CLOCK/CLOCK.png"
      },
      {
        "type": "CLOCK",
        "col": 12,
        "row": 1,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/CLOCK/CLOCK.png"
      },
      {
        "type": "HANGING_PLANT",
        "col": 5,
        "row": 1,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/HANGING_PLANT/HANGING_PLANT.png"
      },
      {
        "type": "HANGING_PLANT",
        "col": 10,
        "row": 1,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/HANGING_PLANT/HANGING_PLANT.png"
      },
      {
        "type": "DESK",
        "col": 5,
        "row": 7,
        "width": 2,
        "height": 1,
        "image": "/assets/furniture/DESK/DESK_FRONT.png"
      },
      {
        "type": "CHAIR",
        "col": 9,
        "row": 7,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/WOODEN_CHAIR/WOODEN_CHAIR_BACK.png"
      },
      {
        "type": "DESK",
        "col": 9,
        "row": 8,
        "width": 2,
        "height": 1,
        "image": "/assets/furniture/DESK/DESK_FRONT.png"
      },
      {
        "type": "CHAIR",
        "col": 10,
        "row": 7,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/WOODEN_CHAIR/WOODEN_CHAIR_BACK.png"
      },
      {
        "type": "LARGE_PLANT",
        "col": 4,
        "row": 8,
        "width": 1,
        "height": 2,
        "image": "/assets/furniture/LARGE_PLANT/LARGE_PLANT.png"
      },
      {
        "type": "LARGE_PLANT",
        "col": 11,
        "row": 8,
        "width": 1,
        "height": 2,
        "image": "/assets/furniture/LARGE_PLANT/LARGE_PLANT.png"
      }
    ]
  },
  "3": {
    "exitOnTop": true,
    "exitX": 7,
    "exitY": 0,
    "spawnX": 7,
    "spawnY": 8,
    "puzzleX": 5,
    "puzzleY": 2,
    "puzzleName": "Máy chủ Hash & Salt",
    "floorUrl": "/assets/floors/wood_floor.png",
    "wallUrl": "/assets/floors/floor_4.png",
    "map": [
      [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        3,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
      ]
    ],
    "furniture": [
      {
        "type": "PC",
        "col": 1,
        "row": 1,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/PC/PC_FRONT_ON_3.png"
      },
      {
        "type": "CHAIR",
        "col": 1,
        "row": 2,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/CUSHIONED_CHAIR/CUSHIONED_CHAIR_BACK.png"
      },
      {
        "type": "BIN",
        "col": 3,
        "row": 2,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/BIN/BIN.png"
      },
      {
        "type": "PC",
        "col": 4,
        "row": 4,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/PC/PC_FRONT_ON_3.png"
      },
      {
        "type": "CHAIR",
        "col": 4,
        "row": 5,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/CUSHIONED_CHAIR/CUSHIONED_CHAIR_BACK.png"
      },
      {
        "type": "BIN",
        "col": 3,
        "row": 5,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/BIN/BIN.png"
      },
      {
        "type": "PC",
        "col": 13,
        "row": 1,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/PC/PC_FRONT_ON_3.png"
      },
      {
        "type": "CHAIR",
        "col": 14,
        "row": 2,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/CUSHIONED_CHAIR/CUSHIONED_CHAIR_BACK.png"
      },
      {
        "type": "BIN",
        "col": 12,
        "row": 2,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/BIN/BIN.png"
      },
      {
        "type": "PC",
        "col": 10,
        "row": 4,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/PC/PC_FRONT_ON_3.png"
      },
      {
        "type": "CHAIR",
        "col": 11,
        "row": 5,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/CUSHIONED_CHAIR/CUSHIONED_CHAIR_BACK.png"
      },
      {
        "type": "BIN",
        "col": 12,
        "row": 5,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/BIN/BIN.png"
      },
      {
        "type": "SOFA",
        "col": 2,
        "row": 7,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/SOFA/SOFA_FRONT.png"
      },
      {
        "type": "COFFEE_TABLE",
        "col": 4,
        "row": 7,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/COFFEE_TABLE/COFFEE_TABLE.png"
      },
      {
        "type": "SOFA",
        "col": 12,
        "row": 7,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/SOFA/SOFA_FRONT.png"
      },
      {
        "type": "COFFEE_TABLE",
        "col": 11,
        "row": 7,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/COFFEE_TABLE/COFFEE_TABLE.png"
      },
      {
        "type": "CLOCK",
        "col": 3,
        "row": 1,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/CLOCK/CLOCK.png"
      },
      {
        "type": "CLOCK",
        "col": 12,
        "row": 1,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/CLOCK/CLOCK.png"
      },
      {
        "type": "HANGING_PLANT",
        "col": 5,
        "row": 1,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/HANGING_PLANT/HANGING_PLANT.png"
      },
      {
        "type": "HANGING_PLANT",
        "col": 10,
        "row": 1,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/HANGING_PLANT/HANGING_PLANT.png"
      },
      {
        "type": "PC",
        "col": 5,
        "row": 1,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/PC/PC_FRONT_ON_2.png"
      },
      {
        "type": "CHAIR",
        "col": 5,
        "row": 2,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/CUSHIONED_CHAIR/CUSHIONED_CHAIR_BACK.png"
      },
      {
        "type": "PC",
        "col": 9,
        "row": 1,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/PC/PC_FRONT_ON_2.png"
      },
      {
        "type": "CHAIR",
        "col": 10,
        "row": 2,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/CUSHIONED_CHAIR/CUSHIONED_CHAIR_BACK.png"
      },
      {
        "type": "PLANT",
        "col": 4,
        "row": 1,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/PLANT/PLANT.png"
      },
      {
        "type": "PLANT",
        "col": 11,
        "row": 1,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/PLANT/PLANT.png"
      }
    ]
  },
  "4": {
    "exitOnTop": false,
    "exitX": 7,
    "exitY": 9,
    "spawnX": 7,
    "spawnY": 2,
    "puzzleX": 5,
    "puzzleY": 7,
    "puzzleName": "Lò luyện RSA",
    "floorUrl": "/assets/floors/wood_floor.png",
    "wallUrl": "/assets/floors/floor_4.png",
    "map": [
      [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        3,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
      ]
    ],
    "furniture": [
      {
        "type": "PC",
        "col": 2,
        "row": 2,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/PC/PC_FRONT_ON_1.png"
      },
      {
        "type": "CHAIR",
        "col": 2,
        "row": 3,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/CUSHIONED_CHAIR/CUSHIONED_CHAIR_BACK.png"
      },
      {
        "type": "SMALL_TABLE",
        "col": 1,
        "row": 2,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/SMALL_TABLE/SMALL_TABLE_FRONT.png"
      },
      {
        "type": "POT",
        "col": 1,
        "row": 2,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/POT/POT.png"
      },
      {
        "type": "PC",
        "col": 12,
        "row": 2,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/PC/PC_FRONT_ON_1.png"
      },
      {
        "type": "CHAIR",
        "col": 13,
        "row": 3,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/CUSHIONED_CHAIR/CUSHIONED_CHAIR_BACK.png"
      },
      {
        "type": "SMALL_TABLE",
        "col": 14,
        "row": 2,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/SMALL_TABLE/SMALL_TABLE_FRONT.png"
      },
      {
        "type": "POT",
        "col": 14,
        "row": 2,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/POT/POT.png"
      },
      {
        "type": "DOUBLE_BOOKSHELF",
        "col": 4,
        "row": 2,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/DOUBLE_BOOKSHELF/DOUBLE_BOOKSHELF.png"
      },
      {
        "type": "DOUBLE_BOOKSHELF",
        "col": 10,
        "row": 2,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/DOUBLE_BOOKSHELF/DOUBLE_BOOKSHELF.png"
      },
      {
        "type": "SOFA",
        "col": 3,
        "row": 7,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/SOFA/SOFA_FRONT.png"
      },
      {
        "type": "COFFEE_TABLE",
        "col": 2,
        "row": 7,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/COFFEE_TABLE/COFFEE_TABLE.png"
      },
      {
        "type": "SOFA",
        "col": 11,
        "row": 7,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/SOFA/SOFA_FRONT.png"
      },
      {
        "type": "COFFEE_TABLE",
        "col": 13,
        "row": 7,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/COFFEE_TABLE/COFFEE_TABLE.png"
      },
      {
        "type": "LARGE_PAINTING",
        "col": 7,
        "row": 1,
        "width": 2,
        "height": 1,
        "image": "/assets/furniture/LARGE_PAINTING/LARGE_PAINTING.png"
      },
      {
        "type": "CLOCK",
        "col": 3,
        "row": 1,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/CLOCK/CLOCK.png"
      },
      {
        "type": "CLOCK",
        "col": 12,
        "row": 1,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/CLOCK/CLOCK.png"
      },
      {
        "type": "HANGING_PLANT",
        "col": 5,
        "row": 1,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/HANGING_PLANT/HANGING_PLANT.png"
      },
      {
        "type": "HANGING_PLANT",
        "col": 10,
        "row": 1,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/HANGING_PLANT/HANGING_PLANT.png"
      },
      {
        "type": "WHITEBOARD",
        "col": 5,
        "row": 8,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/WHITEBOARD/WHITEBOARD.png"
      },
      {
        "type": "WHITEBOARD",
        "col": 9,
        "row": 8,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/WHITEBOARD/WHITEBOARD.png"
      },
      {
        "type": "LARGE_PLANT",
        "col": 4,
        "row": 7,
        "width": 1,
        "height": 2,
        "image": "/assets/furniture/LARGE_PLANT/LARGE_PLANT.png"
      },
      {
        "type": "LARGE_PLANT",
        "col": 11,
        "row": 7,
        "width": 1,
        "height": 2,
        "image": "/assets/furniture/LARGE_PLANT/LARGE_PLANT.png"
      }
    ]
  },
  "5": {
    "exitOnTop": true,
    "exitX": 7,
    "exitY": 0,
    "spawnX": 7,
    "spawnY": 8,
    "puzzleX": 5,
    "puzzleY": 2,
    "puzzleName": "Lõi Cơ AES Cryptex",
    "floorUrl": "/assets/floors/wood_floor.png",
    "wallUrl": "/assets/floors/floor_4.png",
    "map": [
      [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        3,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
      ]
    ],
    "furniture": [
      {
        "type": "DOUBLE_BOOKSHELF",
        "col": 1,
        "row": 1,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/DOUBLE_BOOKSHELF/DOUBLE_BOOKSHELF.png"
      },
      {
        "type": "DOUBLE_BOOKSHELF",
        "col": 13,
        "row": 1,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/DOUBLE_BOOKSHELF/DOUBLE_BOOKSHELF.png"
      },
      {
        "type": "PC",
        "col": 2,
        "row": 4,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/PC/PC_FRONT_ON_3.png"
      },
      {
        "type": "BIN",
        "col": 1,
        "row": 4,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/BIN/BIN.png"
      },
      {
        "type": "PC",
        "col": 12,
        "row": 4,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/PC/PC_FRONT_ON_3.png"
      },
      {
        "type": "BIN",
        "col": 14,
        "row": 4,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/BIN/BIN.png"
      },
      {
        "type": "SOFA",
        "col": 4,
        "row": 7,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/SOFA/SOFA_FRONT.png"
      },
      {
        "type": "COFFEE_TABLE",
        "col": 3,
        "row": 7,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/COFFEE_TABLE/COFFEE_TABLE.png"
      },
      {
        "type": "SOFA",
        "col": 10,
        "row": 7,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/SOFA/SOFA_FRONT.png"
      },
      {
        "type": "COFFEE_TABLE",
        "col": 12,
        "row": 7,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/COFFEE_TABLE/COFFEE_TABLE.png"
      },
      {
        "type": "CLOCK",
        "col": 4,
        "row": 1,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/CLOCK/CLOCK.png"
      },
      {
        "type": "CLOCK",
        "col": 11,
        "row": 1,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/CLOCK/CLOCK.png"
      },
      {
        "type": "HANGING_PLANT",
        "col": 5,
        "row": 1,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/HANGING_PLANT/HANGING_PLANT.png"
      },
      {
        "type": "HANGING_PLANT",
        "col": 10,
        "row": 1,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/HANGING_PLANT/HANGING_PLANT.png"
      },
      {
        "type": "PC",
        "col": 4,
        "row": 4,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/PC/PC_FRONT_ON_3.png"
      },
      {
        "type": "PC",
        "col": 11,
        "row": 5,
        "width": 2,
        "height": 2,
        "image": "/assets/furniture/PC/PC_FRONT_ON_3.png"
      },
      {
        "type": "PLANT",
        "col": 3,
        "row": 1,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/PLANT/PLANT.png"
      },
      {
        "type": "PLANT",
        "col": 12,
        "row": 1,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/PLANT/PLANT.png"
      },
      {
        "type": "PLANT",
        "col": 1,
        "row": 7,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/PLANT/PLANT.png"
      },
      {
        "type": "PLANT",
        "col": 14,
        "row": 7,
        "width": 1,
        "height": 1,
        "image": "/assets/furniture/PLANT/PLANT.png"
      },
      {
        "type": "CYBER_ITEM",
        "col": 5,
        "row": 2,
        "width": 1,
        "height": 1,
        "image": "/assets/cyberpunk_items/7.png"
      }
    ]
  }
};
