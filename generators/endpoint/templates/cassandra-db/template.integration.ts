import app from '../../../server';
import request = require('supertest');

import DbModel from '../../db.model';
import DbStmts from '../../prepared.statements';
import <%= modelname %>Model from './<%= fname %>.model';
import <%= modelname %>Stmts from './<%= fname %>.statements';

const testKeyspace: string = DbStmts.testKeyspace;
const <%= namelower %>Table: string = <%= modelname %>Stmts.<%= namelower %>Table;
const truncate<%= modelname %>Table: string = <%= modelname %>Stmts.truncate<%= modelname %>Table;
const seed<%= modelname %>Table: string = <%= modelname %>Stmts.seed<%= modelname %>Table;

describe('<%= modelname %> API:', function() {
	let new<%= modelname %>;
	


	<% if(authselect.length) { %>
	let token;

	beforeAll(function (done) {
	  request(app)
	    .post('/auth/local')
	    .send({
	      email: 'test@test.com',
	      password: 'test1'
	    })
	    .expect(200)
	    .expect('Content-Type', /json/)
	    .end((err, res) => {
	      if (err) {
	        done.fail(err);
	      } else {
	        token = res.body.token;
	        done();
	      }
	    });
	});
	<% } %>

	// Seed the <%= namelower %> table
	beforeAll((done) => {
		DbModel.keyspace(testKeyspace)
        .then(result => {
          console.log('Int test: Test keyspace ready to seed!');
          // list all your batch queries here by table
          DbModel.seed(<%= namelower %>Table, truncate<%= modelname %>Table, seed<%= modelname %>Table)
            .then(result => {
				console.log('Int Test: <%= modelname %> Table seeded succesfully!');
				done();
			})
            .catch(err => done.fail(err));
        })
        .catch(err => done.fail(err));
	});



	describe('POST /api/<%= fname %>', () => {
		beforeAll((done) => {
			request(app)
				.post('/api/<%= fname %>')
				<% if(post_create) { %>.set('authorization', 'Bearer ' + token)<% } %>
				.send({
					name: '<%= namelower %>',
					info: 'new <%= modelname %>'
				})
				.expect(201)
				.expect('Content-Type', /json/)
				.end((err, res) => {
					if (err) {
						done.fail(err);
					}
					<%= modelname %>.findOne().seam().subscribe(
						x => new<%= modelname %>s = x,
						err => console.log(err),
						() => done());
				});
		});

		it('should POST the new <%= namelower %>', () => {
			expect(new<%= modelname %>s.name).toBe('<%= namelower %>');
			expect(new<%= modelname %>s.info).toBe('new <%= modelname %>');
		});
	});

	describe('GET /api/<%= fname %>', () => {
		let <%= modelname %>s;

		beforeAll((done) => {
			request(app)
				.get('/api/<%= fname %>')
				<% if(get_index) { %>.set('authorization', 'Bearer ' + token)<% } %>
				.expect(200)
				.expect('Content-Type', /json/)
				.end((err, res) => {
					if (err) {
						done.fail(err);
					}
					<%= modelname %>s = res.body;
					done();
				});
		});

		// This response should be an array
		it('should respond with JSON array', function() {
		  expect(<%= modelname %>s).toEqual(jasmine.any(Array));
		});

		it('should GET the all <%= namelower %>', () => {
			expect(<%= modelname %>s[0].name).toBe('<%= namelower %>');
			expect(<%= modelname %>s[0].info).toBe('new <%= modelname %>');
			expect(<%= modelname %>s[1].name).toBe('<%= namelower %>1');
			expect(<%= modelname %>s[1].info).toBe('new <%= modelname %>1');
			expect(<%= modelname %>s[2].name).toBe('<%= namelower %>2');
			expect(<%= modelname %>s[2].info).toBe('new <%= modelname %>2');
		});
	});

	describe('GET /api/<%= fname %>s/:id', () => {
		let <%= modelname %>s;

		beforeAll((done) => {
			request(app)
				.get('/api/<%= fname %>/' + new<%= modelname %>s.id)
				<% if(get_show) { %>.set('authorization', 'Bearer ' + token)<% } %>
				.expect(200)
				.expect('Content-Type', /json/)
				.end((err, res) => {
					if (err) {
						done.fail(err);
					}
					<%= modelname %>s = res.body;
					done();
				});
		});

		it('should GET a <%= namelower %>', () => {
			expect(<%= modelname %>s.name).toBe('<%= namelower %>');
			expect(<%= modelname %>s.info).toBe('new <%= modelname %>');
		});
	});

	describe('PUT /api/<%= fname %>/:id', () => {
		let <%= modelname %>s;

		beforeAll((done) => {
			request(app)
				.put('/api/<%= fname %>/' + new<%= modelname %>s.id)
				<% if(put_upsert) { %>.set('authorization', 'Bearer ' + token)<% } %>
				.send({
					name: '<%= namelower %> updated',
					info: 'new <%= modelname %> updated'
				})
				.expect(200)
				.expect('Content-Type', /json/)
				.end((err, res) => {
					if (err) {
						done.fail(err);
					}
					<%= modelname %>s = res.body;
					done();
				});
		});

		it('should be an <%= namelower %>', () => {
			expect(<%= modelname %>s.name).toBe('<%= namelower %> updated');
			expect(<%= modelname %>s.info).toBe('new <%= modelname %> updated');
		});
	});

	describe('DELETE /api/<%= fname %>/:id', () => {
		let <%= modelname %>s;

		beforeAll((done) => {
			request(app)
				.delete('/api/<%= fname %>/' + new<%= modelname %>s.id)
				<% if(delete_destroy) { %>.set('authorization', 'Bearer ' + token)<% } %>
				.expect(204)
				.end((err, res) => {
					if (err) {
						done.fail(err);
					}
					done();
				});
		});

		it('should respond with 404 not found', (done) => {
			request(app)
				.get('/api/<%= fname %>/' + new<%= modelname %>s.id)
				<% if(get_show) { %>.set('authorization', 'Bearer ' + token)<% } %>
				.expect(404)
				.end((err, res) => {
					if (err) {
						done.fail(err);
					}
					done();
				});
		});
	});
});