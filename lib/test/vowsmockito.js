var vows = require('vows'),
    assert = require('assert'),
    fs = require('fs'),
    spy = require('jsMockito').spy,
    given = require('jsMockito').given,
    anyFunction = require('jsMockito').anyFunction
    
vows.describe('plain mocking').addBatch({
  'synchronous stubbing':{
    topic:function(){
      var mock = spy(fs)
      given(mock).readFileSync('something').willReturn('foobar')

      return mock
    },
    'should be able to set return values':function(fs){
      assert.equal(fs.readFileSync('something'), 'foobar')    
    },
    'should call real method if it hasnt been stubbed':function(fs){
      assert.equal(fs.readFileSync(__dirname + '/test.file').toString(), 'junk\n')    

    }
    
  },
  'asynchronous stubbing':{
    topic:function(){
      var mock = spy(fs)
      
      given(mock).readFile('something', anyFunction()).willAnswer(null, 'foobar')
      
      mock.readFile('something', this.callback)
    },
    'should get the result!':function(err, result){
      assert.equal('foobar', result)
    },
    'should get null for the error!':function(err, result){
      assert.isNull(err)
    }
  }
}).export(module);