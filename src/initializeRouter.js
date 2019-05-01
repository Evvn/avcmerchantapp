import browserPlugin from 'router5/plugins/browser';
import createRouter from 'router5';

const initializeRouter = (options) => {
  const {
    routes,
    // actions,
    // beforeAll,
    defaultRoute,
    // afterAll,
  } = options;

  const routerOptions = {
    defaultRoute,
  };

  const router = createRouter(routes, routerOptions)
    .usePlugin(browserPlugin({ useHash: false }));

  return router;
};

export default initializeRouter;
