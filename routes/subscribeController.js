const express = require('express');
const router = express.Router();
const { Subscriber } = require('../models/subscriber')


router.post('/subscribeNumber', (req, res) => {
      Subscriber.find({ "userTo": req.body.userTo}) 
      .exec((err, subscribe) => {
        if(err) return res.status(400).send(err) 
        return res.status(200).json({success:true, subscribeNumber: subscribe.length})
      })
})

router.post('/subscribed', (req, res) => {
    Subscriber.find({ "userTo": req.body.userTo, "userFrom": req.body.userFrom}) 
    .exec((err, subscribe) => {
      if(err) return res.status(400).send(err) 
      
      let result = false;
      if(subscribe.length !== 0){
          result = true
      }
      return res.status(200).json({success:true, subscribed: result})
    })
})

router.post('/subscribe', (req, res) => {
    const subscribe = new Subscriber(req.body)
     subscribe.save((err, doc) => {
        if(err) return res.status(400).send(err) 
        return res.status(200).json({success:true})
     })
})

router.post('/unsubscribe', (req, res) => {
    Subscriber.findOneAndDelete({ "userTo": req.body.userTo, "userFrom": req.body.userFrom})
    .exec((err, doc) => {
        if(err) return res.status(400).send(err) 
        return res.status(200).json({success:true, doc})
    })
})

router.get('/getAll', (req, res) => {
    Subscriber.find()
    .exec((err, doc) => {
        if(err) return res.status(400).send(err) 
        return res.status(200).json({success:true, doc})
    })
})


module.exports = router
