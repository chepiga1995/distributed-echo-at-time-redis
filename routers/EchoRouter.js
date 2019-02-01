const express = require('express');
const controller = require('controllers/EchoController');
const { okResponse } = require('routers/helper');

const router = new express.Router();

router.post('/api/v1/echo-at-time', okResponse(controller.echoAtTime));

module.exports = router;
