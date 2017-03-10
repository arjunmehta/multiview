var MultiView = require('../main');

exports['Exported Properly'] = function(test) {
  var mv = new MultiView();

  test.expect(3);

  test.equal(typeof mv, 'object');
  test.equal(typeof mv.spawn, 'function');
  test.equal(typeof mv.stream, 'function');

  test.done();
};

exports['tearDown'] = function(done) {
  done();
};
