function logRoute(req, res, next) {
  console.log(`[${req.method}] ${req.url}`);
  next();
}