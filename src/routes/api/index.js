const filesToRoutes = require('@danilupion/server-utils/routes/filesToRoutes');

const router = filesToRoutes(__dirname);

// Return 404 for the rest of the routes
router.use('*', (req, res) => {
  res.status(404).end();
});

module.exports = router;
