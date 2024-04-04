// 请求列表
const requestList = [];

// 为了方便查看，i从1开始计数
for (let i = 1; i <= 100; i++) {
  requestList.push(
    () =>
      new Promise((resolve) => {
        setTimeout(() => {
          console.log('done', i);
          resolve(i);
        }, Math.random() * 1000);
      }),
  );
}

// 运行池
const pool = new Set();

// 等待队列
const waitQueue = [];

/**
 * @description: 限制并发数量的请求
 * @param {*} reqFn：请求方法
 * @param {*} max：最大并发数
 */
const request = (reqFn, max) => {
  return new Promise((resolve, reject) => {
    // 判断运行吃是否已满
    const isFull = pool.size >= max;

    // 包装的新请求
    const newReqFn = () => {
      reqFn()
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        })
        .finally(() => {
          // 请求完成后，将该请求从运行池中删除
          pool.delete(newReqFn);
          // 从等待队列中取出一个新请求放入等待运行池执行
          const next = waitQueue.shift();
          if (next) {
            pool.add(next);
            next();
          }
        });
    };

    if (isFull) {
      // 如果运行池已满，则将新的请求放到等待队列中
      waitQueue.push(newReqFn);
    } else {
      // 如果运行池未满，则向运行池中添加一个新请求并执行该请求
      pool.add(newReqFn);
      newReqFn();
    }
  });
};

requestList.forEach(async (item) => {
  const res = await request(item, 10);
  console.log(res);
});
