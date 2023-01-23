const SceneExample = {
  models: [
    {
      id: "cube",
      hidden: 0,
      rotate: [0, 0, 0],
      vertices: [
        //一个立方体有8个点
        [0, 0, 0],
        [0, 0, 1],
        [0, 1, 0],
        [1, 0, 0],
        [1, 0, 1],
        [1, 1, 0],
        [0, 1, 1],
        [1, 1, 1]
      ],
      lines: [
        //立方体有12条边
        [0, 1],
        [0, 2],
        [0, 3],
        [1, 4],
        [1, 6],
        [2, 5],
        [2, 6],
        [3, 5],
        [3, 4],
        [4, 7],
        [5, 7],
        [6, 7]
      ]
    },
    {
      hidden: 0,
      id: "tetrahedron",
      translate: [2, 2, 2],
      vertices: [
        //一个三棱锥体有4个点
        [0, 0, 0],
        [0, 0, 1],
        [0, 1, 0],
        [1, 0, 0]
      ],
      lines: [
        //三棱锥有6条边
        [0, 1],
        [0, 2],
        [0, 3],
        [1, 2],
        [1, 3],
        [2, 3]
      ], faces: [
        {
          vertices: [
            { __vi: 1, color: { r: 255, g: 0, b: 0 } },
            { __vi: 3, color: { r: 0, g: 255, b: 0 } },
            { __vi: 2, color: { r: 0, g: 0, b: 255 } }
          ]
        },{
          vertices: [
            { __vi: 0, color: { r: 100, g: 100, b: 100 } },
            { __vi: 3, color: { r: 100, g: 100, b: 100 } },
            { __vi: 2, color: { r: 100, g: 100, b: 100 } }
          ]
        }
      ]
    },
    {
      id: "plane",
      hidden: 0,
      translate: [0, -2, 0],
      vertices: [
        [-2, 0, 2],
        [2, 0, 2],
        [2, 0, -2],
        [-2, 0, -2]
      ],
      faces: [
        {
          vertices: [
            { __vi: 0 , color: { r: 255, g: 0, b: 0 }},
            { __vi: 1 , color: { r: 255, g: 255, b: 255 }},
            { __vi: 2 , color: { r: 0, g: 255, b: 0 }},
            { __vi: 3 , color: { r: 0, g: 0, b: 255 }}
          ]
        }
      ]
    }
  ]
};

export { SceneExample };
