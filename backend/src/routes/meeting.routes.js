const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const meetingController = require('../controllers/meeting.controller');

const router = express.Router();

router.route('/')
  .get(protect, meetingController.getMeetings)
  .post(protect, meetingController.createMeeting);

router.get('/:id', protect, meetingController.getMeeting);
router.post('/:id/join', protect, meetingController.joinMeeting);
router.post('/:id/leave', protect, meetingController.leaveMeeting);
router.post('/:id/approve', protect, meetingController.approveParticipant);
router.post('/:id/end', protect, meetingController.endMeeting);

module.exports = router;