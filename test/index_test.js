const assert = require('chai').assert
require('dotenv').config();

const createRequest = require('../index.js').createRequest

describe('createRequest', () => {
  const jobID = '1'
  const muchId = '598397'

  context('successful calls', () => {
    const requests = [
      { name: 'id not supplied', testData: { data: { muchId, purpose: 'winner' } } },
      { name: 'purpose: winner', testData: { id: jobID, data: { muchId, purpose: 'winner' } } },
      { name: 'purpose: draw', testData: { id: jobID, data: { muchId, purpose: 'draw'  } } },
      { name: 'purpose: status', testData: { id: jobID, data: { muchId, purpose: 'status' } } }
    ]

    requests.forEach(req => {
      it(`${req.name}`, (done) => {
        createRequest(req.testData, (statusCode, data) => {
          assert.equal(statusCode, 200)
          assert.equal(data.jobRunID, jobID)
          assert.isNotEmpty(data.data)
          if(req.testData.data.purpose == 'winner'){
            assert.isAbove(Number(data.result), 0)
          }else if(req.testData.data.purpose == 'draw') {
            assert.isBoolean(data.result);
          }else {
            assert.oneOf(data.result, ['not_started', 'running', 'postponed', 'canceled', 'finished']);
          }
          done()
        })
      })
    })
  })

  context('error calls', () => {
    const requests = [
      { name: 'empty body', testData: {} },
      { name: 'empty data', testData: { data: {} } },
      { name: 'muchId not supplied', testData: { id: jobID, data: { purpose: 'winner' } } },
      { name: 'purpose not supplied', testData: { id: jobID, data: { muchId} } },
      { name: 'unknown muchId', testData: { id: jobID, data: { muchId: "5555", purpose: 'winner' } } },
      { name: 'unknown purpose', testData: { id: jobID, data: { muchId, purpose: 'not_real'  } } }
    ]

    requests.forEach(req => {
      it(`${req.name}`, (done) => {
        createRequest(req.testData, (statusCode, data) => {
          assert.equal(statusCode, 500)
          assert.equal(data.jobRunID, jobID)
          assert.equal(data.status, 'errored')
          assert.isNotEmpty(data.error)
          done()
        })
      })
    })
  })
})
