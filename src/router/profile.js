// Deals with info,bio etc
require('dotenv').config();
const express = require('express')
const router = express.Router();
const passport = require('passport'); // for protected profiles

//Load Validation
const validateProfileInput = require('../validation/profile')
//Load Experience Validation
const validateExperienceInput = require('../validation/experience')
//Load Education Validation
const validateEducationInput = require('../validation/education')
//load Profile model
const Profile = require('../models/Profile');
//load User profile
const User = require('../models/User');


/*
@route: GET api/profile
@desc: Get current user's profile
@access : private
*/
router.get('/',passport.authenticate('jwt',{session:false}),(req,res)=>{
    const errors = {};

    Profile.findOne({ user:req.user.id })
        .populate('user',['name','avatar','email'])
        .then(profile=>{
            if(!profile)
            {
                errors.noprofile = 'There is no profile of this user!';
                return res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch(err=>res.status(404).json(err));
});


/*
@route: GET api/profile/handle/:handle
@desc: Get profile by handle
@access : public
14.1.2020
*/
router.get('/handle/:handle',(req,res)=>{
    const errors = {};
    Profile.findOne({handle:req.params.handle})
    .populate('user',['name','avatar','email'])
    .then(profile=>{
        if(!profile){
            errors.noprofile = 'There is no profile for this user';
            return res.status(404).json(errors);
        }
        res.json(profile);
    })
    .catch(err=>res.status(404).json(err));
});

/*
@route: GET api/profile/all
@desc: Get all profiles
@access : public
14.1.2020
*/
router.get('/all',(req,res)=>{
    const errors = {};
    Profile.find()
    .populate('user',['name','avatar','email'])
    .then(profiles=>{
        if(!profiles){
            errors.noprofile = 'There are NO Profiles';
            return res.status(404).json(errors);
        }
        res.json(profiles);
    })
    .catch(err=>res.status(404).json({profile: "There are no profiles currently"}));
});

/*
@route: GET api/profile/user/:user_id
@desc: Get profile by ID
@access : public
14.1.2020
*/
router.get('/user/:user_id',(req,res)=>{
    const errors = {};
    Profile.findOne({user:req.params.user_id})
    .populate('user',['name','avatar','email'])
    .then(profile=>{
        if(!profile){
            errors.noprofile = 'There is no profile for this user';
            res.status(404).json(errors);
        }
        res.json(profile);
    })
    .catch(err=>res.status(404).json({profile: "There is no profile for this user"}));
});

/*
@route: POST api/profile
@desc: Create or Edit user profile
@access : private
13.1.2021 continue karna yaha se...................
*/
router.post('/',passport.authenticate('jwt',{session:false}),async (req,res)=>{
   const {errors,isValid} = validateProfileInput(req.body);

   //check validity
   if(!isValid){
       return res.status(400).json(errors);
   }
   
    const profileFields = {};
   profileFields.user = req.user.id;
   if(req.body.handle) profileFields.handle = req.body.handle;
   if(req.body.company) profileFields.company = req.body.company;
   if(req.body.website) profileFields.website = req.body.website;
   if(req.body.location) profileFields.location = req.body.location;
   if(req.body.bio) profileFields.bio = req.body.bio;
   if(req.body.status) profileFields.status = req.body.status;
   if(req.body.githubusername) profileFields.githubusername = req.body.githubusername;
   

   //social
   profileFields.social = {}
   if(req.body.youtube)profileFields.social.youtube=req.body.youtube;
   if(req.body.twitter)profileFields.social.twitter=req.body.twitter;
   if(req.body.facebook)profileFields.social.facebook=req.body.facebook;
   if(req.body.linkedin)profileFields.social.linkedin=req.body.linkedin;
   if(req.body.instagram)profileFields.social.instagram=req.body.instagram;
   if(typeof req.body.skills !== 'undefined'){
    profileFields.skills = req.body.skills.split(',');
}

   //apne se
   try {
    // Using upsert option (creates new doc if no match is found):
    let profile = await Profile.findOneAndUpdate(        
      { user: req.user.id },
      { $set: profileFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return res.json(profile);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }

  
});

router.post('/experience', passport.authenticate('jwt',{session:false}),(req,res)=>{
    const {errors,isValid} = validateExperienceInput(req.body);

   //check validity
   if(!isValid){
       return res.status(400).json(errors);
   }
    
    Profile.findOne({user:req.user.id})
    .populate('user',['name','avatar','email'])    
    .then(profile=>{
            const newExp = {
                title: req.body.title,
                company: req.body.company,
                location: req.body.location,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }
            //add to experience array
            profile.experience.unshift(newExp);
            profile.save().then(profile=>res.json(profile));
        })

})


/*
@route: POST api/profile/education
@desc: add education to profile
@access : private
*/
router.post('/education', passport.authenticate('jwt',{session:false}),(req,res)=>{
    const {errors,isValid} = validateEducationInput(req.body);

   //check validity
   if(!isValid){
       return res.status(400).json(errors);
   }
    
    Profile.findOne({user:req.user.id})
        .populate('user',['name','avatar','email'])
        .then(profile=>{
            const newEdu = {
                school: req.body.school,
                degree: req.body.degree,
                fieldofstudy: req.body.fieldofstudy,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }
            //add to education array
            profile.education.unshift(newEdu);
            profile.save().then(profile=>res.json(profile));
        })

})



// @route    DELETE api/profile/experience/:exp_id
// @desc     Delete experience from profile
// @access   Private

router.delete('/experience/:exp_id', passport.authenticate('jwt',{session:false}), async (req, res) => {
    try {
      const foundProfile = await Profile.findOne({ user: req.user.id });
  
      foundProfile.experience = foundProfile.experience.filter(
        (exp) => exp._id.toString() !== req.params.exp_id
      );
  
      await foundProfile.save();
      return res.status(200).json(foundProfile);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: 'Server error' });
    }
  });

// @route    DELETE api/profile/education/:edu_id
// @desc     Delete education from profile
// @access   Private

router.delete('/education/:edu_id', passport.authenticate('jwt',{session:false}), async (req, res) => {
    try {
      const foundProfile = await Profile.findOne({ user: req.user.id });
      foundProfile.education = foundProfile.education.filter(
        (edu) => edu._id.toString() !== req.params.edu_id
      );
      await foundProfile.save();
      return res.status(200).json(foundProfile);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: 'Server error' });
    }
});



router.delete('/', passport.authenticate('jwt',{session:false}),async (req,res)=>{  
    try{
        await Promise.all([
        Profile.findOneAndRemove({user: req.user.id}),
        User.findOneAndRemove({_id: req.user.id})
        ])
        res.json({ msg: 'User deleted' });
    }
    catch(err){
        console.error(err.message);
         res.status(500).send('Server Error');
    }

})

module.exports = router;


