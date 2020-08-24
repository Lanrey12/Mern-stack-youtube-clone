const express = require('express');
const router = express.Router();
const { Video } = require('../models/video')
const { Subscriber } = require('../models/subscriber')
const multer = require('multer');
var ffmpeg = require('fluent-ffmpeg')



var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`)
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        if (ext !== '.jpg' || ext !== '.png' || ext!= '.mp4') {
            return cb(res.status(400).end('only jpg, png, mp4 are allowed'), false);
        }
        cb(null, true)
    }
})

var upload = multer({ storage: storage }).single("file")


//=================================
//             Product
//=================================

router.post("/uploadVideo", (req, res) => {

    upload(req, res, err => {
        if (err) {
            return res.json({ success: false, err })
        }
        return res.json({success: true, url: res.req.file.path.replace(/\\/g, "/"), fileName: res.req.file.filename, filePath: res.req.file.path.replace(/\\/g, "/")})
    })

});

router.post("/thumbnail", (req, res) => {


  let filePath = ""
  let fileDuration = ""
  let fileName = ""
  
  
  // ffmpeg.setFfprobePath("C:/ffmpeg-4.1.3-win64-static/bin/ffprobe.exe");
  // ffmpeg.setFfmpegPath("C:/ffmpeg-4.1.3-win64-static/bin/ffmpeg.exe")
  ffmpeg.ffprobe(req.body.url, function (err, metadata) {
       console.dir(metadata); // all metadata
       console.log(metadata.format.duration);
       fileDuration = metadata.format.duration
       fileName = metadata.format.filename
       console.log(metadata.format.filename);
      
  });


  ffmpeg(req.body.url)
      .on('filenames', function (filenames) {
          console.log('Will generate ' + filenames.join(', '))
          console.log(filenames)
          filePath = "uploads/thumbnails/" + filenames[0]
      })
      .on('end', function () {
          console.log('Screenshots taken');
          return res.json({ success: true, url:filePath, fileName:fileName,   fileDuration:fileDuration });
      })
      .on('error', function (err) {
          console.error(err);
          return res.json({ success: false, err });
      })
      .screenshots({
          // Will take screenshots at 20%, 40%, 60% and 80% of the video
          count: 3,
          folder: 'uploads/thumbnails',
          size: '320x240',
          //'%b': input basename (filename w/o extension)
          filename: 'thumbnail-%b.png'
      })
});

router.post('/video/uploadVideo', (req, res) => {
      
      const video = new Video(req.body)
      video.save((err, video) => {
          if(err) return res.status(400).json({success: false, err})
          return res.status(200).json({success:true, video})
      })
})

router.get('/getVideos', (req, res) => {
    
    Video.find()
          .populate('writer')
          .exec((err, video) => {
            if(err) return res.status(400).json({success: false, err}) 
            return res.status(200).json({success:true, video})
          })
})

router.post('/video/getVideo', (req, res) => {
    Video.findOne({"_id": req.body.videoId})
    .populate('writer')
    .exec((err, video) => {
        if(err) return res.status(400).send(err) 
        return res.status(200).json({success:true, video})
      })
})


router.post('/getSubscriptionVideos', (req, res) => {
    //find all users i am subscribed to in user collection
    Subscriber.find({ "userFrom": req.body.userFrom})
    .exec((err, doc)=>{
        if(err) return res.status(400).send(err) 
         
        let subscribedUser = []

        doc.map((subscriber, i) => {
            subscribedUser.push(subscriber.userTo)
        })
      
         
     // need to fetch all the video that belong to that user
        Video.find({ writer: { $in: subscribedUser }})
             .populate("writer")
             .exec((err, video) => {
                if(err) return res.status(400).send(err) 
                return res.status(200).json({success:true, video})
             })

    })
 
})
module.exports = router