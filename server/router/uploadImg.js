const express = require('express');
const router = require('express-promise-router')();
const cloudinary = require('cloudinary')

const auth = require('../middleware/auth')
const authAdmin = require('../middleware/authAdmin')
const config = require('../config/index')
const fs = require('fs')


// we will upload image on cloudinary
cloudinary.config({
    cloud_name: config.CLOUD_NAME,
    api_key: config.CLOUD_API_KEY,
    api_secret: config.CLOUD_API_SECRET
})

// Upload image only admin can use
router.post('/upload', auth, (req, res) =>{
    try {
        console.log("req.file: ", req.files)
        if(!req.files || Object.keys(req.files).length ===0 )
            return res.status(400).json({msg: "No file is uploaded"})
        
        const file = req.files.file
        if(file.size > 1024* 1024) {
            removeTmp(file.tempFilePath)
            return res.status(400).json({msg: "size too large"})

        }
        if(file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
            removeTmp(file.tempFilePath)
            return res.status(400).json({msg: "Format is incorrect"})
        }
        
        cloudinary.v2.uploader.upload(file.tempFilePath, {folder: "uploadAPI"}, async (err, result) => {
            if(err) throw err;
            removeTmp(file.tempFilePath)
            return res.status(200).json({public_id: result.public_id, secure_url: result.secure_url})
        })
    } catch (error) {
        return res.status(500).json({msg: error.message})
    }
})

// Delete image only admin can use
router.post('/destroy', auth, (req, res) =>{
    try {
        const {public_id} = req.body;
        if(!public_id)
            return res.status(400).json({msg: "No image is selected"})
        cloudinary.v2.uploader.destroy(public_id, async(err, result) => {
            if(err) throw err;
            return res.status(200).json({msg: "Deleted image"})
        })
    } catch (error) {
        if(error) 
        return res.status(500).json({msg: error.message})
    }
})


const removeTmp = (path) =>{
    fs.unlink(path, err=>{
        if(err) throw err;
    })
}

module.exports = router