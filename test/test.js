var supertest = require("supertest");
var should = require("should");

var server = supertest.agent("http://localhost:8080");

describe("SAMPLE unit test",function(){

  
	// Test 1 : should return home page
	it("should return home page",function(done){
		server
		.get("/")
		.expect("Content-type",/json/)
		.expect(200)
		.end(function(err,res){
		  res.status.should.equal(200);
		  done();
		});
	});
  
	//Test 2: shoud return 404
	it("should return 404",function(done){
		server
		.get("/random")
		.expect(404)
		.end(function(err,res){
		  res.status.should.equal(404);
		  done();
		});
	});

});